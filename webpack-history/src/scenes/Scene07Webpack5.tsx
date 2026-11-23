import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { CodeBlock } from '../components/CodeBlock';
import { CostBeat } from '../components/CostBeat';
import { Pill } from '../components/Pill';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { Terminal, type TerminalLine } from '../components/Terminal';
import { enterExitStyle, enterProgress, enterStyle, rangeProgress } from '../lib/anim';
import { scene07, thread } from '../scenes';
import { alpha, colors, fonts, fontSize, fontWeight, layout, space, transition, video } from '../theme';

const COPY = scene07.copy;
const FED = COPY.federation;

// ───────────── 时间表（帧，相对内容起点） ─────────────
// 与旁白对齐：发布 → 持久化缓存 → 模块联邦 → 资源模块 → 稳定 ID → 移除 Node polyfill → 代价
/** 每个特性的起止帧：左侧列表点亮、右侧面板切换 */
const PANELS = [60, 300, 560, 760, 960] as const;
const T = {
  release: 0,
  panelDelay: 16,
  // ① 持久化缓存（相对 PANELS[0]）
  firstLabel: 10,
  firstBar: [20, 110] as const,
  secondLabel: 130,
  secondBar: [142, 146] as const,
  answer: 40,
  // ② 模块联邦（相对 PANELS[1]）
  apps: 20,
  appStep: 12,
  edges: [66, 86] as const,
  flow: 96,
  flowPeriod: 70,
  flowTravel: 44,
  flowOffset: 23,
  // ⑤ polyfill（相对 PANELS[4]）
  polyCaption: 220,
} as const;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// ───────────── 布局 ─────────────
const LIST = { left: space.safe, top: layout.contentTop + 90, width: 560 } as const;
const PANEL = { left: 760, top: layout.contentTop + 20, width: video.width - space.safe - 760 } as const;
const panelEnd = (i: number) => (i + 1 < PANELS.length ? PANELS[i + 1] - 12 : null);

/** 当前讲到第几个特性 */
const activeAt = (frame: number) => PANELS.reduce((acc, at, i) => (frame >= at ? i : acc), -1);

// ───────────── 左侧特性列表 ─────────────
const FeatureList: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const active = activeAt(frame);
  return (
    <div style={{ position: 'absolute', left: LIST.left, top: LIST.top, width: LIST.width, display: 'flex', flexDirection: 'column', gap: space.md }}>
      {COPY.features.map((f, i) => {
        const p = enterProgress(frame, fps, PANELS[i]);
        // 下一项点亮时，这一项退为背景
        const next = i + 1 < PANELS.length ? PANELS[i + 1] : null;
        const focus = i === active || next === null ? 1 : 1 - rangeProgress(frame, next, next + 12);
        const isBreaking = i === COPY.features.length - 1;
        const accent = isBreaking ? colors.warning : colors.accent;
        return (
          <div
            key={f.name}
            style={{
              paddingLeft: space.md,
              borderLeft: `4px solid ${interpolateColors(focus, [0, 1], [colors.textFaint, accent])}`,
              ...enterStyle(p),
              opacity: p * interpolate(focus, [0, 1], [0.45, 1]),
            }}
          >
            <div style={{ fontFamily: fonts.sans, fontSize: fontSize.note, fontWeight: fontWeight.bold, color: colors.text }}>
              {f.name}
            </div>
            <div style={{ fontFamily: fonts.mono, fontSize: fontSize.small - 2, color: isBreaking ? colors.warning : colors.textDim, marginTop: 4 }}>
              {f.desc}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ───────────── ① 持久化缓存：第二次构建瞬间完成 ─────────────
const BuildBar: React.FC<{ label: string; labelAt: number; bar: readonly [number, number]; top: number }> = ({ label, labelAt, bar, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pct = interpolate(frame, [bar[0], bar[1]], [0, 100], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const track = PANEL.width - 160;
  return (
    <div style={{ position: 'absolute', left: 0, top, width: PANEL.width, ...enterStyle(enterProgress(frame, fps, labelAt)) }}>
      <div style={{ fontFamily: fonts.sans, fontSize: fontSize.note, color: colors.textDim, marginBottom: space.sm }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: space.md }}>
        <div style={{ width: track, height: 18, borderRadius: 9, background: alpha(colors.accent, 0.12), overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${colors.secondary}, ${colors.accent})` }} />
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: fontSize.note, fontWeight: fontWeight.bold, color: pct >= 100 ? colors.success : colors.text }}>
          {Math.floor(pct)}%
        </div>
      </div>
    </div>
  );
};

const CachePanel: React.FC<{ start: number }> = ({ start }) => (
  <>
    <div style={{ position: 'absolute', left: 0, top: 0 }}>
      <Pill text={`${thread.answerLabel} · ${COPY.cache.answer}`} delay={start + T.answer} size="note" />
    </div>
    <BuildBar label={COPY.cache.firstLabel} labelAt={start + T.firstLabel} bar={[start + T.firstBar[0], start + T.firstBar[1]]} top={130} />
    <BuildBar label={COPY.cache.secondLabel} labelAt={start + T.secondLabel} bar={[start + T.secondBar[0], start + T.secondBar[1]]} top={270} />
  </>
);

// ───────────── ② 模块联邦：三个应用互相连线，共享模块流动 ─────────────
const APP = { w: 230, h: 76 } as const;
const FED_CX = PANEL.width / 2;
const APP_POS = [
  { x: FED_CX, y: 90 },
  { x: FED_CX - 300, y: 380 },
  { x: FED_CX + 300, y: 380 },
] as const;
const EDGES = [
  [0, 1],
  [1, 2],
  [2, 0],
] as const;
/** 共享模块只在两个方块之间的连线段上流动，不压住方块 */
const FLOW_RANGE = [0.25, 0.75] as const;

const FederationPanel: React.FC<{ start: number; until: number }> = ({ start, until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const edgeP = rangeProgress(frame, start + T.edges[0], start + T.edges[1]);
  return (
    <>
      <svg width={PANEL.width} height={500} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {EDGES.map(([a, b]) => {
          const A = APP_POS[a];
          const B = APP_POS[b];
          return edgeP > 0 ? (
            <line
              key={`${a}-${b}`}
              x1={A.x}
              y1={A.y}
              x2={A.x + (B.x - A.x) * edgeP}
              y2={A.y + (B.y - A.y) * edgeP}
              stroke={alpha(colors.accent, 0.45)}
              strokeWidth={2}
              strokeDasharray="8 10"
            />
          ) : null;
        })}
      </svg>
      {EDGES.map(([a, b], k) => {
        const local = frame - (start + T.flow) - k * T.flowOffset;
        if (local < 0) return null;
        const cycleStart = frame - (local % T.flowPeriod);
        if (cycleStart + T.flowTravel > until) return null;
        const raw = (local % T.flowPeriod) / T.flowTravel;
        if (raw > 1) return null;
        const t = interpolate(raw, [0, 1], [FLOW_RANGE[0], FLOW_RANGE[1]]);
        const A = APP_POS[a];
        const B = APP_POS[b];
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
              opacity: interpolate(raw, [0, 0.15, 0.85, 1], [0, 1, 1, 0], clamp),
            }}
          >
            {FED.shared[k]}
          </div>
        );
      })}
      {FED.apps.map((name, i) => {
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
              ...enterStyle(enterProgress(frame, fps, start + T.apps + i * T.appStep)),
            }}
          >
            {name}
          </div>
        );
      })}
    </>
  );
};

// ───────────── ④ 稳定的模块 ID：没动过的 vendors 文件名是否变化 ─────────────
const IdsPanel: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const D = COPY.ids;
  const box = (text: string, color: string) => (
    <div
      style={{
        padding: `${space.sm}px ${space.md}px`,
        borderRadius: space.radiusSm,
        border: `2px solid ${alpha(color, 0.6)}`,
        background: alpha(color, 0.08),
        fontFamily: fonts.mono,
        fontSize: fontSize.small + 2,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
  return (
    <>
      {D.rows.map((r, i) => {
        const p = enterProgress(frame, fps, start + 10 + i * 40);
        const changedColor = r.changed ? colors.warning : colors.success;
        return (
          <div
            key={r.label}
            style={{ position: 'absolute', left: 0, top: 40 + i * 150, display: 'flex', alignItems: 'center', gap: space.lg, ...enterStyle(p) }}
          >
            <div style={{ width: 170, fontFamily: fonts.sans, fontSize: fontSize.note, fontWeight: fontWeight.bold, color: colors.text }}>
              {r.label}
            </div>
            {box(r.before, colors.textDim)}
            <div style={{ fontFamily: fonts.mono, fontSize: fontSize.note, color: colors.textDim }}>→</div>
            {box(r.after, changedColor)}
          </div>
        );
      })}
      <Caption delay={start + 100} size="note" tone="dim" style={{ position: 'absolute', left: 0, top: 360, width: PANEL.width }}>
        {D.caption}
      </Caption>
    </>
  );
};

export const Scene07Webpack5: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const costAt = duration - transition.costLead;

  const panel = (i: number, content: React.ReactNode) => {
    const start = PANELS[i] + T.panelDelay;
    const end = panelEnd(i);
    if (frame < start || (end !== null && frame > end + 12)) return null;
    return (
      <div style={{ position: 'absolute', left: PANEL.left, top: PANEL.top, width: PANEL.width, ...enterExitStyle(frame, fps, start, end) }}>
        {content}
      </div>
    );
  };

  const polyLines: TerminalLine[] = COPY.polyfill.lines.map((l, i) => ({
    text: l.text,
    tone: l.tone,
    at: PANELS[4] + T.panelDelay + 70 + i * 10,
  }));

  return (
    <AbsoluteFill>
      <SceneTitle title={scene07.title} years={scene07.yearsLabel} />

      <Caption
        delay={T.release}
        size="body"
        tone="accent"
        weight="bold"
        style={{ position: 'absolute', left: space.safe, top: layout.contentTop }}
      >
        <span style={{ fontFamily: fonts.mono }}>{COPY.releaseDate}</span>
        <span style={{ marginLeft: space.md }}>{COPY.releaseTitle}</span>
      </Caption>

      <FeatureList />

      {panel(0, <CachePanel start={PANELS[0] + T.panelDelay} />)}
      {panel(1, <FederationPanel start={PANELS[1] + T.panelDelay} until={PANELS[2] - 12} />)}
      {panel(2, <CodeBlock filename={COPY.assets.filename} lines={COPY.assets.lines} width={PANEL.width} fontSize={fontSize.code - 4} />)}
      {panel(3, <IdsPanel start={PANELS[3] + T.panelDelay} />)}
      {panel(
        4,
        <>
          <Terminal
            title="zsh — ~/my-app"
            command={COPY.polyfill.command}
            typeStart={PANELS[4] + T.panelDelay + 10}
            lines={polyLines}
            width={PANEL.width}
            height={430}
          />
          <Caption
            delay={PANELS[4] + T.polyCaption}
            size="note"
            tone="dim"
            style={{ marginTop: space.md }}
          >
            {COPY.polyfill.caption}
          </Caption>
        </>,
      )}

      <CostBeat at={costAt} label={thread.costLabel} text={COPY.cost.text} notes={COPY.cost.notes} />
    </AbsoluteFill>
  );
};
