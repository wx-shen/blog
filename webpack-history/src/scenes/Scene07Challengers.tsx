import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { BarChart } from '../components/BarChart';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { ToolBadge } from '../components/ToolBadge';
import { enterExitStyle, exitProgress } from '../lib/anim';
import { benchmark } from '../data/benchmark';
import { scene07 } from '../scenes';
import { colors, fonts, fontSize, layout, space, toolColors, video } from '../theme';

const COPY = scene07.copy;

// ───────────── 时间表（帧，相对内容起点） ─────────────
const T = {
  chart: 20,
  barStagger: 30,
  source: 40,
  chartOut: 400,
  badges: 430,
  badgeStep: 60,
} as const;

const CONTENT_WIDTH = video.width - space.safe * 2;
const BADGE_GAP = space.lg;
const BADGE_WIDTH = (CONTENT_WIDTH - BADGE_GAP) / 2;
/** 数据来源文字：画面右下角（正文区底边，Timeline 之上） */
const SOURCE_TOP = layout.contentBottom - fontSize.small * 1.5;

export const Scene07Challengers: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chartOut = exitProgress(frame, T.chartOut);

  return (
    <AbsoluteFill>
      <SceneTitle title={scene07.title} years={scene07.yearsLabel} />

      {/* ① 构建耗时柱状图：数据来自 src/data/benchmark.ts */}
      {chartOut > 0 ? (
        <AbsoluteFill style={{ opacity: chartOut }}>
          <div style={{ position: 'absolute', left: space.safe, top: layout.contentTop + 20 }}>
            <BarChart
              caption={benchmark.caption}
              data={benchmark.entries.map((e) => ({
                label: e.label,
                value: e.value,
                valueLabel: `${e.value}${benchmark.unit}`,
                color: toolColors[e.tool],
              }))}
              startFrame={T.chart}
              stagger={T.barStagger}
              width={CONTENT_WIDTH}
              labelWidth={260}
            />
          </div>
          {/* 数据来源文字位 */}
          <div
            style={{
              position: 'absolute',
              right: space.safe,
              top: SOURCE_TOP,
              fontFamily: fonts.sans,
              fontSize: fontSize.small,
              color: colors.textDim,
              textAlign: 'right',
              ...enterExitStyle(frame, fps, T.source, null),
            }}
          >
            {benchmark.source}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ② 四个工具依次登场 */}
      {frame >= T.badges ? (
        <div
          style={{
            position: 'absolute',
            left: space.safe,
            top: layout.contentTop + 20,
            width: CONTENT_WIDTH,
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: BADGE_GAP,
            rowGap: space.xl,
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
    </AbsoluteFill>
  );
};
