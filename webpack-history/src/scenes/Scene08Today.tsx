import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { Cube } from '../components/Cube';
import { FileIcon } from '../components/FileIcon';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { enterProgress, enterStyle, exitProgress, rangeProgress, slideEasing } from '../lib/anim';
import { bezierPoint, type Point } from '../lib/geometry';
import { scene08 } from '../scenes';
import { colors, fileColors, fonts, fontSize, fontWeight, layout, motion, space, video } from '../theme';

const COPY = scene08.copy;

// ───────────── 时间表（帧，相对内容起点） ─────────────
const T = {
  cubeIn: 20,
  iconsIn: 50,
  iconStep: 16,
  fly: 130,
  flyStep: 30,
  flyDur: 44,
  statement: 270,
  statementNote: 300,
  /** 内容与时间轴一起退场（与 scenes.ts 的 chromeExitAt 一致） */
  end: scene08.chromeExitAt,
  endTitle: scene08.chromeExitAt + 36,
  endSubtitle: scene08.chromeExitAt + 66,
} as const;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const ICON = layout.fileIcon;
const CUBE = { x: video.width / 2, y: 500, r: 120 } as const;
const STATEMENT_TOP = CUBE.y + CUBE.r + space.xxl;
/** 三个插件图标分布在立方体周围（中心坐标） */
const ICON_POS: readonly Point[] = [
  [CUBE.x - 520, CUBE.y - 40],
  [CUBE.x + 480, CUBE.y - 120],
  [CUBE.x + 480, CUBE.y + 140],
];

const flyStart = (i: number) => T.fly + i * T.flyStep;

export const Scene08Today: React.FC<SceneProps> = () => {
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
  const mainOut = exitProgress(frame, T.end);
  const titleP = enterProgress(frame, fps, T.endTitle);

  return (
    <AbsoluteFill>
      {/* ① 立方体吸入插件 → “仍在迭代” */}
      {mainOut > 0 ? (
        <AbsoluteFill style={{ opacity: mainOut }}>
          <SceneTitle title={scene08.title} years={scene08.yearsLabel} />

          {COPY.plugins.map((p, i) => {
            const t = rangeProgress(frame, flyStart(i), flyStart(i) + T.flyDur, slideEasing);
            if (t >= 1) return null;
            const appear = enterProgress(frame, fps, T.iconsIn + i * T.iconStep);
            const p0 = ICON_POS[i];
            const p3: Point = [CUBE.x, CUBE.y];
            // 先沿原方向略微外弹，再弧线收进立方体
            const [x, y] = bezierPoint(t, p0, [p0[0], p0[1] + (p0[1] < CUBE.y ? -120 : 120)], [CUBE.x, CUBE.y - 200], p3);
            const scale = interpolate(t, [0, 0.7, 1], [1, 0.8, 0.2]);
            const fade = interpolate(t, [0.75, 1], [1, 0], clamp);
            return (
              <div
                key={p.name}
                style={{
                  position: 'absolute',
                  left: x - ICON.width / 2,
                  top: y - ICON.height / 2,
                  opacity: appear * fade,
                  transform: `translateY(${(1 - appear) * motion.enterOffset}px) scale(${scale})`,
                }}
              >
                <FileIcon label={p.label} color={fileColors[p.kind]} />
                <div
                  style={{
                    position: 'absolute',
                    top: ICON.height + space.sm,
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

          <Caption
            delay={T.statement}
            size="body"
            tone="accent"
            weight="bold"
            style={{ position: 'absolute', top: STATEMENT_TOP, width: '100%', textAlign: 'center', letterSpacing: 2 }}
          >
            {COPY.statement}
          </Caption>
          {COPY.statementNote ? (
            <Caption
              delay={T.statementNote}
              size="note"
              tone="dim"
              style={{
                position: 'absolute',
                top: STATEMENT_TOP + fontSize.body * 1.5 + space.sm,
                width: '100%',
                textAlign: 'center',
              }}
            >
              {COPY.statementNote}
            </Caption>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* ② 片尾标题 */}
      {frame >= T.endTitle ? (
        <>
          <div
            style={{
              position: 'absolute',
              top: video.height / 2 - fontSize.title,
              width: '100%',
              textAlign: 'center',
              fontFamily: fonts.sans,
              fontSize: fontSize.title,
              fontWeight: fontWeight.bold,
              color: colors.text,
              letterSpacing: 4,
              ...enterStyle(titleP),
            }}
          >
            <span style={{ color: colors.accent }}>{COPY.endTitleAccent}</span>
            {COPY.endTitleRest}
          </div>
          {COPY.endSubtitle ? (
            <Caption
              delay={T.endSubtitle}
              size="note"
              tone="dim"
              style={{ position: 'absolute', top: video.height / 2 + space.lg, width: '100%', textAlign: 'center' }}
            >
              {COPY.endSubtitle}
            </Caption>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
