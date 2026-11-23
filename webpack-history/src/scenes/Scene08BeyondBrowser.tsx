import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { Cube } from '../components/Cube';
import { Pill } from '../components/Pill';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { enterExitStyle, enterProgress, enterStyle, exitProgress, rangeProgress } from '../lib/anim';
import { cue } from '../lib/cues';
import { scene08 } from '../scenes';
import { alpha, categoryColors, colors, fonts, fontSize, fontWeight, layout, space, video } from '../theme';

const COPY = scene08.copy;

// ───────────── 时间表（帧，相对内容起点） ─────────────
// 按旁白对齐：① target 选项 → ② 一大批跨端方案（每一类、每个方案在旁白念到时点亮）→ ③ 通用编译器
const at = (phrase: string, offset = 0) => cue(scene08.id, phrase, offset);
const cube = at('它的 target 选项');
const T = {
  cube,
  label: cube + 30,
  targets: cube + 60,
  targetStep: 30,
  targetsCaption: at('loader 和 plugin 又能'),
  targetsOut: at('小程序领域', -22),
  /** 每一类开始点亮的帧 */
  categories: COPY.categories.map((c) => at(c.cue)),
  /** 每个方案出现的帧：不早于所在类别之后 16 帧 */
  items: COPY.categories.map((c) => c.items.map((it) => Math.max(at(c.cue, 16), at(it.cue)))),
  statement: at('webpack，成了前端工程的通用编译器'),
} as const;

// ───────────── ① target 布局 ─────────────
const CUBE = { x: 560, y: 560, r: 100 } as const;
const TARGET = { left: 1160, width: 520, height: 64, top0: layout.contentTop + 20, step: 92 } as const;

const TargetsPart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = exitProgress(frame, T.targetsOut);
  const cubeP = enterProgress(frame, fps, T.cube);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <svg width={video.width} height={video.height} style={{ position: 'absolute', left: 0, top: 0 }}>
        {COPY.targets.map((t, i) => {
          const at = T.targets + i * T.targetStep;
          const p = rangeProgress(frame, at, at + 16);
          if (p <= 0) return null;
          const y = TARGET.top0 + i * TARGET.step + TARGET.height / 2;
          const x1 = CUBE.x + CUBE.r;
          return (
            <line
              key={t}
              x1={x1}
              y1={CUBE.y}
              x2={x1 + (TARGET.left - x1) * p}
              y2={CUBE.y + (y - CUBE.y) * p}
              stroke={alpha(colors.accent, 0.5)}
              strokeWidth={2}
              strokeDasharray="8 10"
            />
          );
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: CUBE.x - CUBE.r - 20,
          top: CUBE.y - CUBE.r - 20,
          ...enterStyle(cubeP),
        }}
      >
        <Cube r={CUBE.r} />
      </div>
      <div style={{ position: 'absolute', left: CUBE.x - 70, top: CUBE.y - CUBE.r - 110, display: 'flex' }}>
        <Pill text={COPY.targetsLabel} delay={T.label} size="note" />
      </div>
      {COPY.targets.map((t, i) => (
        <div
          key={t}
          style={{
            position: 'absolute',
            left: TARGET.left,
            top: TARGET.top0 + i * TARGET.step,
            width: TARGET.width,
            height: TARGET.height,
            display: 'flex',
            alignItems: 'center',
            padding: `0 ${space.md}px`,
            boxSizing: 'border-box',
            background: colors.panel,
            border: `2px solid ${colors.panelBorder}`,
            borderRadius: space.radius,
            fontFamily: fonts.mono,
            fontSize: fontSize.note,
            color: colors.text,
            ...enterStyle(enterProgress(frame, fps, T.targets + i * T.targetStep + 8)),
          }}
        >
          <span style={{ color: colors.textDim, marginRight: space.sm }}>target:</span>'{t}'
        </div>
      ))}
      <Caption
        delay={T.targetsCaption}
        size="note"
        tone="dim"
        style={{ position: 'absolute', left: space.safe, top: CUBE.y + CUBE.r + space.xl }}
      >
        {COPY.targetsCaption}
      </Caption>
    </AbsoluteFill>
  );
};

// ───────────── ② 跨端方案 ─────────────
const ROW = { top0: layout.contentTop + 10, step: 94, labelWidth: 220 } as const;

const CategoriesPart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {COPY.categories.map((c, i) => {
        const at = T.categories[i];
        const color = categoryColors[i % categoryColors.length];
        return (
          <div
            key={c.name}
            style={{
              position: 'absolute',
              left: space.safe,
              top: ROW.top0 + i * ROW.step,
              display: 'flex',
              alignItems: 'center',
              gap: space.md,
            }}
          >
            <div
              style={{
                width: ROW.labelWidth,
                paddingLeft: space.md,
                borderLeft: `4px solid ${color}`,
                fontFamily: fonts.sans,
                fontSize: fontSize.body,
                fontWeight: fontWeight.bold,
                color: colors.text,
                ...enterExitStyle(frame, fps, at, null),
              }}
            >
              {c.name}
            </div>
            {c.items.map((it, j) => (
              <Pill key={it.label} text={it.label} delay={T.items[i][j]} size="note" color={color} />
            ))}
          </div>
        );
      })}
    </>
  );
};

export const Scene08BeyondBrowser: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <SceneTitle title={scene08.title} years={scene08.yearsLabel} />
      {frame < T.targetsOut + 14 ? <TargetsPart /> : null}
      {frame >= T.categories[0] ? <CategoriesPart /> : null}
      <Caption
        delay={T.statement}
        size="body"
        tone="accent"
        weight="bold"
        style={{ position: 'absolute', left: space.safe, top: ROW.top0 + COPY.categories.length * ROW.step + space.sm }}
      >
        {COPY.statement}
      </Caption>
    </AbsoluteFill>
  );
};
