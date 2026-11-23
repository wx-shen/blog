import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { Cube } from '../components/Cube';
import { FileIcon } from '../components/FileIcon';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { enterProgress, enterStyle, rangeProgress, slideEasing } from '../lib/anim';
import { bezierPoint, type Point } from '../lib/geometry';
import { scene12 } from '../scenes';
import { alpha, colors, fileColors, fonts, fontSize, layout, motion, space, video } from '../theme';

const COPY = scene12.copy;

// ───────────── 时间表（帧，相对内容起点） ─────────────
// 与旁白对齐：每月发版 → CSS / HTML / TypeScript 被吸入立方体 → Bun、Deno、多线程、模块联邦 2.0 → 通往 v6
const T = {
  facts: [30, 420, 500, 580],
  cubeIn: 100,
  iconsIn: 120,
  iconStep: 16,
  fly: 200,
  flyStep: 30,
  flyDur: 44,
  statement: 700,
  statementNote: 740,
} as const;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// ───────────── 布局 ─────────────
const ICON = layout.fileIcon;
const CUBE = { x: 600, y: 480, r: 110 } as const;
const ICON_X = 220;
const ICON_POS: readonly Point[] = COPY.plugins.map((_, i) => [ICON_X, CUBE.y - 140 + i * 140] as Point);
const FACTS = { left: 1000, width: video.width - space.safe - 1000, top0: layout.contentTop + 20, step: 100 } as const;
const STATEMENT_TOP = layout.contentTop + 440;

const flyStart = (i: number) => T.fly + i * T.flyStep;

export const Scene12Today: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cubeP = enterProgress(frame, fps, T.cubeIn);
  const glow = Math.min(
    1,
    COPY.plugins.reduce((sum, _, i) => {
      const arrive = flyStart(i) + T.flyDur;
      return sum + interpolate(frame, [arrive - 6, arrive, arrive + 18], [0, 1, 0], clamp);
    }, 0),
  );

  return (
    <AbsoluteFill>
      <SceneTitle title={scene12.title} years={scene12.yearsLabel} />

      {/* 左：CSS、HTML、TypeScript 被吸入立方体 */}
      {COPY.plugins.map((p, i) => {
        const t = rangeProgress(frame, flyStart(i), flyStart(i) + T.flyDur, slideEasing);
        if (t >= 1) return null;
        const appear = enterProgress(frame, fps, T.iconsIn + i * T.iconStep);
        const p0 = ICON_POS[i];
        const [x, y] = bezierPoint(t, p0, [p0[0] + 200, p0[1]], [CUBE.x - 160, CUBE.y], [CUBE.x, CUBE.y]);
        return (
          <div
            key={p.name}
            style={{
              position: 'absolute',
              left: x - ICON.width / 2,
              top: y - ICON.height / 2,
              opacity: appear * interpolate(t, [0.75, 1], [1, 0], clamp),
              transform: `translateY(${(1 - appear) * motion.enterOffset}px) scale(${interpolate(t, [0, 0.7, 1], [1, 0.8, 0.2])})`,
            }}
          >
            <FileIcon label={p.label} color={fileColors[p.kind]} />
            <div
              style={{
                position: 'absolute',
                top: ICON.height + space.xs,
                left: -space.xxl,
                right: -space.xxl,
                textAlign: 'center',
                fontFamily: fonts.mono,
                fontSize: fontSize.small,
                color: colors.textDim,
                opacity: interpolate(t, [0, 0.3], [1, 0], clamp),
              }}
            >
              {p.name}
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: CUBE.x - CUBE.r - 20,
          top: CUBE.y - CUBE.r - 20,
          opacity: cubeP,
          transform: `translateY(${(1 - cubeP) * motion.enterOffset}px)`,
        }}
      >
        <Cube r={CUBE.r} glow={glow} />
      </div>

      {/* 右：2026 年的现状 */}
      {COPY.facts.map((f, i) => (
        <div
          key={f.label}
          style={{
            position: 'absolute',
            left: FACTS.left,
            top: FACTS.top0 + i * FACTS.step,
            width: FACTS.width,
            display: 'flex',
            alignItems: 'center',
            gap: space.md,
            ...enterStyle(enterProgress(frame, fps, T.facts[i])),
          }}
        >
          <div
            style={{
              minWidth: 140,
              padding: `${space.xs}px ${space.sm}px`,
              boxSizing: 'border-box',
              textAlign: 'center',
              borderRadius: space.radiusSm,
              background: alpha(colors.accent, 0.12),
              fontFamily: fonts.mono,
              fontSize: fontSize.small,
              color: colors.accent,
            }}
          >
            {f.label}
          </div>
          <div style={{ fontFamily: fonts.sans, fontSize: fontSize.note, color: colors.text }}>{f.text}</div>
        </div>
      ))}

      {/* 底部：通往 v6 */}
      <Caption delay={T.statement} size="body" tone="accent" weight="bold" style={{ position: 'absolute', left: space.safe, top: STATEMENT_TOP }}>
        {COPY.statement}
      </Caption>
      <Caption
        delay={T.statementNote}
        size="note"
        tone="dim"
        style={{ position: 'absolute', left: space.safe, top: STATEMENT_TOP + fontSize.body * 1.5 + space.xs }}
      >
        {COPY.statementNote}
      </Caption>
    </AbsoluteFill>
  );
};
