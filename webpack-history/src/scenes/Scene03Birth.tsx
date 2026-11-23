import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { Cube } from '../components/Cube';
import { FileIcon } from '../components/FileIcon';
import { MilestoneCard } from '../components/MilestoneCard';
import { Pill } from '../components/Pill';
import { CostBeat } from '../components/CostBeat';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { enterProgress, moveProgress, rangeProgress, slideEasing } from '../lib/anim';
import { bezierPoint, type Point } from '../lib/geometry';
import { scene03, thread } from '../scenes';
import { colors, fileColors, fonts, fontSize, fontWeight, layout, motion, space, transition, video } from '../theme';

const COPY = scene03.copy;

const ICON = layout.fileIcon;
/** 左侧图标列的中心 x、首个图标中心 y、行距 */
const COLUMN = { x: 330, y0: 380, step: 120 } as const;
const CUBE = { x: video.width / 2, y: 520, r: 130 } as const;
const OUTPUT = { x: 1590, y: CUBE.y - 70, scale: 1.4 } as const;
/** 按需加载拆出的代码块：位于 bundle.js 下方，略小 */
const CHUNK = { x: 1590, y: CUBE.y + 150, scale: 1 } as const;
const KEYWORDS_TOP = 690;
const AUTHOR_TOP = 800;
const LABEL_TOP = layout.contentTop;

// 本幕时间表（帧）。① 起源段相对内容起点；② 汇入立方体的段落整体延后 FLOW_START 帧，
// 其内部时间（T）相对该段落起点。
const ORIGIN = {
  issue: 30,
  issueZh: 70,
  commit: 210,
  commitNote: 240,
  out: 400,
} as const;
const FLOW_START = 420;

const T = {
  iconsIn: 6,
  iconStep: 16,
  cubeIn: 84,
  fly: 140,
  flyStep: 24,
  flyDur: 46,
  output: 290,
  chunk: 370,
  keywords: 450,
  keywordStep: 40,
  author: 570,
} as const;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const flyStart = (i: number) => T.fly + i * T.flyStep;
const LAST_ARRIVAL = flyStart(COPY.files.length - 1) + T.flyDur;

export const Scene03Birth: React.FC<SceneProps> = ({ duration }) => {
  const O = COPY.origin;
  return (
    <AbsoluteFill>
      <SceneTitle title={scene03.title} years={scene03.yearsLabel} />

      {/* ① 起源：一个关于代码分割的提议 → 首个提交 */}
      <MilestoneCard
        date={O.issueDate}
        title={O.issueTitle}
        delay={ORIGIN.issue}
        exitAt={ORIGIN.out}
        top={layout.contentTop + 30}
        lines={[
          { text: O.issueQuote, delay: ORIGIN.issue + 14, quote: true },
          { text: O.issueQuoteZh, delay: ORIGIN.issueZh },
        ]}
      />
      <MilestoneCard
        date={O.commitDate}
        title={O.commitTitle}
        delay={ORIGIN.commit}
        exitAt={ORIGIN.out}
        top={layout.contentTop + 300}
        lines={[{ text: O.commitNote, delay: ORIGIN.commitNote }]}
      />

      {/* ② 一切皆模块：文件汇入立方体 → bundle.js 与按需加载的代码块 */}
      <Sequence from={FLOW_START} name="birth flow">
        <BirthFlow />
      </Sequence>

      <CostBeat
        at={duration - transition.costLead}
        label={thread.costLabel}
        text={scene03.copy.cost.text}
        notes={scene03.copy.cost.notes}
      />
    </AbsoluteFill>
  );
};

const BirthFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cubeP = enterProgress(frame, fps, T.cubeIn);

  // 每个文件抵达立方体时，立方体亮一下
  const glow = Math.min(
    1,
    COPY.files.reduce((sum, _, i) => {
      const arrive = flyStart(i) + T.flyDur;
      return sum + interpolate(frame, [arrive - 6, arrive, arrive + 18], [0, 1, 0], clamp);
    }, 0),
  );

  const out = moveProgress(frame, fps, T.output);
  const outX = interpolate(out, [0, 1], [CUBE.x, OUTPUT.x]);
  const lineEnd = interpolate(out, [0, 1], [CUBE.x + CUBE.r, OUTPUT.x - ICON.width * 0.8]);
  const chunkP = moveProgress(frame, fps, T.chunk);
  const outW = ICON.width * OUTPUT.scale;
  const outH = ICON.height * OUTPUT.scale;

  return (
    <AbsoluteFill>
      <Caption
        delay={T.iconsIn}
        exitAt={LAST_ARRIVAL - 10}
        size="note"
        style={{ position: 'absolute', left: COLUMN.x - ICON.width / 2, top: LABEL_TOP, fontFamily: fonts.mono }}
      >
        {COPY.inputDir}
      </Caption>

      {/* 四类文件：沿曲线汇入立方体 */}
      {COPY.files.map((f, i) => {
        const t = rangeProgress(frame, flyStart(i), flyStart(i) + T.flyDur, slideEasing);
        if (t >= 1) {
          return null;
        }
        const appear = enterProgress(frame, fps, T.iconsIn + i * T.iconStep);
        const p0: Point = [COLUMN.x, COLUMN.y0 + i * COLUMN.step];
        const [x, y] = bezierPoint(t, p0, [p0[0] + 320, p0[1]], [CUBE.x - 300, CUBE.y], [CUBE.x, CUBE.y]);
        const scale = interpolate(t, [0, 0.7, 1], [1, 0.85, 0.25]);
        const fade = interpolate(t, [0.75, 1], [1, 0], clamp);
        return (
          <div
            key={f.name}
            style={{
              position: 'absolute',
              left: x - ICON.width / 2,
              top: y - ICON.height / 2,
              opacity: appear * fade,
              transform: `translateY(${(1 - appear) * motion.enterOffset}px) scale(${scale})`,
            }}
          >
            <FileIcon label={f.label} color={fileColors[f.kind]} />
            <div
              style={{
                position: 'absolute',
                right: ICON.width + space.md,
                top: ICON.height / 2 - fontSize.small * 0.75,
                fontFamily: fonts.mono,
                fontSize: fontSize.small,
                color: colors.textDim,
                whiteSpace: 'nowrap',
                opacity: interpolate(t, [0, 0.3], [1, 0], clamp),
              }}
            >
              {f.name}
            </div>
          </div>
        );
      })}

      {/* 输出连线：bundle.js 与按需加载的代码块 */}
      {frame >= T.output ? (
        <svg width={video.width} height={video.height} style={{ position: 'absolute', left: 0, top: 0 }}>
          <line
            x1={CUBE.x + CUBE.r * 0.87}
            y1={CUBE.y - 40}
            x2={lineEnd}
            y2={OUTPUT.y}
            stroke={colors.accent}
            strokeWidth={3}
            strokeDasharray="10 10"
            opacity={0.7}
          />
          {frame >= T.chunk ? (
            <line
              x1={CUBE.x + CUBE.r * 0.87}
              y1={CUBE.y + 40}
              x2={interpolate(chunkP, [0, 1], [CUBE.x + CUBE.r, CHUNK.x - ICON.width * 0.6])}
              y2={interpolate(chunkP, [0, 1], [CUBE.y + 40, CHUNK.y])}
              stroke={colors.secondary}
              strokeWidth={3}
              strokeDasharray="10 10"
              opacity={0.8}
            />
          ) : null}
        </svg>
      ) : null}

      {/* 中央立方体 */}
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

      {/* bundle.js */}
      {frame >= T.output ? (
        <div
          style={{
            position: 'absolute',
            left: outX - outW / 2,
            top: OUTPUT.y - outH / 2,
            width: outW,
            opacity: out,
          }}
        >
          <FileIcon label={COPY.outputLabel} color={colors.accent} width={outW} height={outH} />
          <div
            style={{
              position: 'absolute',
              top: outH + space.sm,
              left: -space.xxl,
              right: -space.xxl,
              textAlign: 'center',
              fontFamily: fonts.mono,
              fontSize: fontSize.note,
              fontWeight: fontWeight.bold,
              color: colors.accent,
            }}
          >
            {COPY.output}
          </div>
        </div>
      ) : null}
      {/* 按需加载的代码块 */}
      {frame >= T.chunk ? (
        <div
          style={{
            position: 'absolute',
            left: interpolate(chunkP, [0, 1], [CUBE.x, CHUNK.x]) - ICON.width / 2,
            top: CHUNK.y - ICON.height / 2,
            width: ICON.width,
            opacity: chunkP,
          }}
        >
          <FileIcon label={COPY.outputLabel} color={colors.secondary} />
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
            }}
          >
            {COPY.chunk}
          </div>
        </div>
      ) : null}
      <Caption
        delay={T.output + 20}
        size="note"
        style={{ position: 'absolute', left: OUTPUT.x - outW / 2, top: LABEL_TOP, fontFamily: fonts.mono }}
      >
        {COPY.outputDir}
      </Caption>

      {/* 关键词 */}
      <div
        style={{
          position: 'absolute',
          top: KEYWORDS_TOP,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: space.lg,
        }}
      >
        {COPY.keywords.map((k, i) => (
          <Pill key={k} text={k} delay={T.keywords + i * T.keywordStep} />
        ))}
      </div>

      {/* 作者（小字） */}
      <Caption
        delay={T.author}
        size="note"
        tone="dim"
        style={{ position: 'absolute', top: AUTHOR_TOP, width: '100%', textAlign: 'center' }}
      >
        {COPY.authorLabel}
        <span style={{ marginLeft: space.sm, color: colors.text }}>{COPY.author}</span>
      </Caption>
    </AbsoluteFill>
  );
};
