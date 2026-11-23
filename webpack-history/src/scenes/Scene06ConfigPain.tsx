import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { CodeBlock } from '../components/CodeBlock';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { enterProgress, enterStyle, exitProgress, rangeProgress } from '../lib/anim';
import { scene06 } from '../scenes';
import { alpha, colors, fonts, fontSize, fontWeight, layout, lineHeight, space, video } from '../theme';

const COPY = scene06.copy;
const FED = COPY.federation;

// ───────────── 时间表（帧，相对内容起点） ─────────────
const v5At = scene06.yearStops[0].atFrame; // 与时间轴滑到 2020 同步
const T = {
  codeIn: 10,
  scrollStart: 30,
  scrollEnd: 260,
  painCaption: 150,
  codeOut: 282,
  // v5
  heading: v5At + 26,
  cacheTitle: v5At + 40,
  firstLabel: v5At + 56,
  firstBar: [v5At + 66, v5At + 146],
  secondLabel: v5At + 160,
  secondBar: [v5At + 172, v5At + 176],
  fedTitle: v5At + 196,
  apps: v5At + 210,
  appStep: 12,
  edges: [v5At + 256, v5At + 276],
  flow: v5At + 286,
  flowPeriod: 70,
  flowTravel: 44,
  flowOffset: 23,
} as const;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// ───────────── 配置滚动 ─────────────
const CODE_SIZE = fontSize.code - 4;
const CODE_LH = Math.round(CODE_SIZE * lineHeight.code);
const VISIBLE_LINES = 12;
const CODE_WIDTH = 1040;
/** 滚过的总行数：越滚越快（幂函数） */
const SCROLL_LINES = 320;
const SCROLL_POWER = 2.6;
const CONFIG_LINES = Array.from(
  { length: SCROLL_LINES + VISIBLE_LINES + 2 },
  (_, i) => COPY.configTemplate[i % COPY.configTemplate.length],
);

// ───────────── v5 布局 ─────────────
const COL_TOP = layout.contentTop + 80;
const CACHE = { left: space.safe, width: 740, track: 560 } as const;
const FED_AREA = { left: 1000, right: video.width - space.safe } as const;
const APP = { w: 230, h: 76 } as const;
const fedCenterX = (FED_AREA.left + FED_AREA.right) / 2;
const APP_POS = [
  { x: fedCenterX, y: COL_TOP + 120 },
  { x: fedCenterX - 260, y: COL_TOP + 380 },
  { x: fedCenterX + 260, y: COL_TOP + 380 },
] as const;
/** 共享模块在连线上流动的区间（0 为起点方块中心，1 为终点方块中心） */
const FLOW_RANGE = [0.25, 0.75] as const;
/** 三条连线：共享模块沿这些边流动 */
const EDGES = [
  [0, 1],
  [1, 2],
  [2, 0],
] as const;

const BuildBar: React.FC<{ label: string; labelAt: number; bar: readonly [number, number]; top: number }> = ({
  label,
  labelAt,
  bar,
  top,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enterProgress(frame, fps, labelAt);
  const pct = interpolate(frame, [bar[0], bar[1]], [0, 100], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const done = pct >= 100;
  return (
    <div style={{ position: 'absolute', left: CACHE.left, top, width: CACHE.width, ...enterStyle(p) }}>
      <div style={{ fontFamily: fonts.sans, fontSize: fontSize.note, color: colors.textDim, marginBottom: space.sm }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: space.md }}>
        <div
          style={{
            width: CACHE.track,
            height: 18,
            borderRadius: 9,
            background: alpha(colors.accent, 0.12),
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${colors.secondary}, ${colors.accent})`,
            }}
          />
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: fontSize.note,
            fontWeight: fontWeight.bold,
            color: done ? colors.success : colors.text,
          }}
        >
          {Math.floor(pct)}%
        </div>
      </div>
    </div>
  );
};

const Federation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const edgeP = rangeProgress(frame, T.edges[0], T.edges[1]);
  return (
    <>
      <svg width={video.width} height={video.height} style={{ position: 'absolute', left: 0, top: 0 }}>
        {EDGES.map(([a, b]) => {
          const A = APP_POS[a];
          const B = APP_POS[b];
          return (
            <line
              key={`${a}-${b}`}
              x1={A.x}
              y1={A.y}
              x2={A.x + (B.x - A.x) * edgeP}
              y2={A.y + (B.y - A.y) * edgeP}
              stroke={alpha(colors.accent, 0.45)}
              strokeWidth={2}
              strokeDasharray="8 10"
              opacity={edgeP > 0 ? 1 : 0}
            />
          );
        })}
      </svg>

      {/* 共享模块沿连线流动（循环） */}
      {EDGES.map(([a, b], k) => {
        const local = frame - T.flow - k * T.flowOffset;
        if (local < 0) return null;
        const raw = (local % T.flowPeriod) / T.flowTravel;
        if (raw > 1) return null;
        // 只在两个应用方块之间的连线段上流动，不压住方块
        const t = interpolate(raw, [0, 1], [FLOW_RANGE[0], FLOW_RANGE[1]]);
        const A = APP_POS[a];
        const B = APP_POS[b];
        const opacity = interpolate(raw, [0, 0.15, 0.85, 1], [0, 1, 1, 0], clamp);
        return (
          <div
            key={`chip-${k}`}
            style={{
              position: 'absolute',
              left: A.x + (B.x - A.x) * t,
              top: A.y + (B.y - A.y) * t,
              transform: 'translate(-50%, -50%)',
              padding: `${space.xs}px ${space.sm}px`,
              borderRadius: space.radiusSm,
              background: colors.secondary,
              fontFamily: fonts.mono,
              fontSize: fontSize.small,
              color: colors.text,
              whiteSpace: 'nowrap',
              opacity,
            }}
          >
            {FED.shared[k]}
          </div>
        );
      })}

      {FED.apps.map((name, i) => {
        const p = enterProgress(frame, fps, T.apps + i * T.appStep);
        const pos = APP_POS[i];
        return (
          <div
            key={name}
            style={{
              position: 'absolute',
              left: pos.x - APP.w / 2,
              top: pos.y - APP.h / 2,
              width: APP.w,
              height: APP.h,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: colors.panel,
              border: `2px solid ${colors.accent}`,
              borderRadius: space.radius,
              fontFamily: fonts.mono,
              fontSize: fontSize.small + 2,
              fontWeight: fontWeight.bold,
              color: colors.accent,
              ...enterStyle(p),
            }}
          >
            {name}
          </div>
        );
      })}
    </>
  );
};

export const Scene06ConfigPain: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── 配置越滚越快 ──
  const s = rangeProgress(frame, T.scrollStart, T.scrollEnd);
  const scrolledLines = SCROLL_LINES * Math.pow(s, SCROLL_POWER);
  const pain = interpolate(s, [0.2, 1], [0, 1], clamp);
  const codeP = enterProgress(frame, fps, T.codeIn);
  const codeOut = exitProgress(frame, T.codeOut);

  return (
    <AbsoluteFill>
      {/* 背景略微变为警示色 */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 40% 50%, ${alpha(colors.warning, 0.1 * pain)} 0%, ${alpha(colors.warning, 0.04 * pain)} 60%, ${alpha(colors.warning, 0)} 100%)`,
          opacity: codeOut,
        }}
      />

      <SceneTitle title={scene06.title} years={scene06.yearsLabel} />

      {codeOut > 0 ? (
        <>
          <div style={{ position: 'absolute', left: space.safe, top: layout.contentTop, ...enterStyle(codeP), opacity: codeP * codeOut }}>
            <CodeBlock
              filename={COPY.configFilename}
              lines={CONFIG_LINES}
              width={CODE_WIDTH}
              fontSize={CODE_SIZE}
              bodyHeight={VISIBLE_LINES * CODE_LH + space.md * 2}
              scrollTop={scrolledLines * CODE_LH}
              warning={pain * 0.6}
            />
          </div>
          {COPY.painCaption ? (
            <Caption
              delay={T.painCaption}
              exitAt={T.codeOut}
              size="body"
              tone="warning"
              weight="bold"
              style={{
                position: 'absolute',
                left: space.safe + CODE_WIDTH + space.xl,
                top: layout.contentTop + 160,
                width: video.width - space.safe * 2 - CODE_WIDTH - space.xl,
              }}
            >
              {COPY.painCaption}
            </Caption>
          ) : null}
        </>
      ) : null}

      {/* ── webpack 5 ── */}
      {frame >= T.heading ? (
        <>
          <Caption
            delay={T.heading}
            size="body"
            tone="accent"
            weight="bold"
            style={{ position: 'absolute', left: space.safe, top: layout.contentTop }}
          >
            {COPY.v5Heading}
          </Caption>

          {/* 持久化缓存：第二次构建瞬间完成 */}
          <Caption
            delay={T.cacheTitle}
            size="body"
            tone="normal"
            weight="bold"
            style={{ position: 'absolute', left: CACHE.left, top: COL_TOP }}
          >
            {COPY.cache.title}
          </Caption>
          <BuildBar label={COPY.cache.firstLabel} labelAt={T.firstLabel} bar={T.firstBar} top={COL_TOP + 110} />
          <BuildBar label={COPY.cache.secondLabel} labelAt={T.secondLabel} bar={T.secondBar} top={COL_TOP + 250} />

          {/* 模块联邦：三个应用互相连线，共享模块流动 */}
          <Caption
            delay={T.fedTitle}
            size="body"
            tone="normal"
            weight="bold"
            style={{ position: 'absolute', left: FED_AREA.left, top: COL_TOP }}
          >
            {FED.title}
          </Caption>
          <Federation />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
