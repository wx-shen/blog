import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { CodeBlock } from '../components/CodeBlock';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { ToolBadge } from '../components/ToolBadge';
import { exitProgress, moveProgress, rangeProgress } from '../lib/anim';
import { scene02 } from '../scenes';
import { fontSize, layout, space, toolColors, video } from '../theme';

const COPY = scene02.copy;

const LINES = COPY.scripts.map((s) => `<script src="${s}"></script>`);

/**
 * 每行出现的帧：间隔从 16 帧逐渐缩短到 6 帧，制造"失控"感。
 * 单行入场 12 帧（motion.lineEnterFrames），同时运动的行不超过 2 行。
 */
const LINE_FRAMES = (() => {
  const frames: number[] = [];
  let f = 24;
  for (let i = 0; i < LINES.length; i++) {
    frames.push(Math.round(f));
    f += Math.max(6, 16 - i * 0.8);
  }
  return frames;
})();

const LAST_LINE = LINE_FRAMES[LINE_FRAMES.length - 1];

// 本幕时间表（帧，相对内容起点）
const T = {
  warnStart: LAST_LINE + 6,
  warnEnd: LAST_LINE + 30,
  pain: LAST_LINE + 44,
  painStep: 30,
  collapse: LAST_LINE + 190,
  collapseFrames: 30,
  badges: LAST_LINE + 236,
  badgeStep: 70,
  conclusion: LAST_LINE + 470,
} as const;

const CODE_WIDTH = 980;
const BADGE_WIDTH = 500;
const BADGE_GAP = (video.width - space.safe * 2 - BADGE_WIDTH * 3) / 2;

export const Scene02Prehistory: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const warning = rangeProgress(frame, T.warnStart, T.warnEnd);
  const collapse = moveProgress(frame, fps, T.collapse, T.collapseFrames);
  const painsOut = exitProgress(frame, T.collapse);

  return (
    <AbsoluteFill>
      <SceneTitle title={scene02.title} years={scene02.yearsLabel} />

      {/* script 标签不断堆叠，溢出屏幕后变为警示色，然后收拢 */}
      {collapse < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: space.safe,
            top: layout.contentTop,
            transform: `scaleY(${1 - collapse})`,
            transformOrigin: 'top center',
            opacity: 1 - collapse,
          }}
        >
          <CodeBlock
            filename={COPY.codeFilename}
            lines={LINES}
            lineStartFrames={LINE_FRAMES}
            warning={warning}
            width={CODE_WIDTH}
            fontSize={fontSize.code}
          />
        </div>
      ) : null}

      {/* 痛点 */}
      {painsOut > 0 && COPY.pains.length > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: layout.columnRight,
            top: layout.contentTop + space.xxl,
            width: video.width - layout.columnRight - space.safe,
            display: 'flex',
            flexDirection: 'column',
            gap: space.lg,
            opacity: painsOut,
          }}
        >
          {COPY.pains.map((p, i) => (
            <Caption key={p} delay={T.pain + i * T.painStep} size="body" tone="warning">
              <span style={{ marginRight: space.sm }}>×</span>
              {p}
            </Caption>
          ))}
        </div>
      ) : null}

      {/* 社区的三种方案 */}
      {frame >= T.badges ? (
        <div
          style={{
            position: 'absolute',
            left: space.safe,
            top: layout.contentTop + space.xxl,
            display: 'flex',
            gap: BADGE_GAP,
          }}
        >
          {COPY.tools.map((t, i) => (
            <ToolBadge
              key={t.name}
              name={t.name}
              color={toolColors[t.tool]}
              description={t.description}
              delay={T.badges + i * T.badgeStep}
              width={BADGE_WIDTH}
            />
          ))}
        </div>
      ) : null}

      {COPY.conclusion ? (
        <Caption
          delay={T.conclusion}
          size="note"
          tone="dim"
          style={{ position: 'absolute', left: space.safe, top: layout.contentTop + 400 }}
        >
          {COPY.conclusion}
        </Caption>
      ) : null}
    </AbsoluteFill>
  );
};
