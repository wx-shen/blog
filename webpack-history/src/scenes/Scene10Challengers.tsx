import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { BarChart } from '../components/BarChart';
import { CostBeat } from '../components/CostBeat';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { ToolBadge } from '../components/ToolBadge';
import { enterExitStyle, exitProgress } from '../lib/anim';
import { benchmark } from '../data/benchmark';
import { scene10, thread } from '../scenes';
import { colors, fonts, fontSize, layout, space, toolColors, transition, video } from '../theme';

const COPY = scene10.copy;

// ───────────── 时间表（帧，相对内容起点） ─────────────
// 与旁白对齐：① 前史 Rollup / Parcel → ② 2020 年 esbuild、Vite → Turbopack（2022）→ Rspack（2023）
// → ③ 柱状图（时间轴走到 2024）→ 代价：没有银弹
const T = {
  prelude: 20,
  preludeStep: 60,
  preludeOut: 330,
  badges: 380,
  badgeStep: 60,
  badgesOut: 840,
  chart: 870,
  barStagger: 30,
  source: 900,
} as const;

/**
 * 工具登场的帧：默认按 badgeStep 依次出现；若该工具的年份对应 scenes.ts 里的一个 yearStop，
 * 则等时间轴滑到该年份之后再登场（先滑动、再入场，同屏运动元素不超过 3 个）。
 */
const badgeDelay = (i: number): number => {
  const stop = scene10.yearStops.find((s) => s.year === COPY.tools[i].year);
  return stop ? stop.atFrame + transition.timelineSlide : T.badges + i * T.badgeStep;
};

const CONTENT_WIDTH = video.width - space.safe * 2;
const BADGE_GAP = space.lg;
const BADGE_WIDTH = (CONTENT_WIDTH - BADGE_GAP) / 2;
/** 数据来源文字：画面右下角（正文区底边，Timeline 之上） */
const SOURCE_TOP = layout.contentBottom - fontSize.small * 1.5;

const BadgeGrid: React.FC<{
  items: readonly { tool: keyof typeof toolColors; name: string; description: string }[];
  delayOf: (i: number) => number;
  out: number;
}> = ({ items, delayOf, out }) => (
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
      opacity: out,
    }}
  >
    {items.map((t, i) => (
      <ToolBadge key={t.name} name={t.name} color={toolColors[t.tool]} description={t.description} delay={delayOf(i)} width={BADGE_WIDTH} />
    ))}
  </div>
);

export const Scene10Challengers: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const preludeOut = exitProgress(frame, T.preludeOut);
  const badgesOut = exitProgress(frame, T.badgesOut);

  return (
    <AbsoluteFill>
      <SceneTitle title={scene10.title} years={scene10.yearsLabel} />

      {/* ① 前史：另起炉灶的人早就有了 */}
      {preludeOut > 0 ? <BadgeGrid items={COPY.prelude} delayOf={(i) => T.prelude + i * T.preludeStep} out={preludeOut} /> : null}

      {/* ② 新一代工具：各自换掉了 webpack 的哪一层 */}
      {frame >= T.badges && badgesOut > 0 ? <BadgeGrid items={COPY.tools} delayOf={badgeDelay} out={badgesOut} /> : null}

      {/* ③ 构建耗时柱状图：数据来自 src/data/benchmark.ts */}
      {frame >= T.chart ? (
        <>
          <div style={{ position: 'absolute', left: space.safe, top: layout.contentTop + 20, ...enterExitStyle(frame, fps, T.chart, null) }}>
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
        </>
      ) : null}

      <CostBeat at={duration - transition.costLead} label={thread.costLabel} text={COPY.cost.text} notes={COPY.cost.notes} />
    </AbsoluteFill>
  );
};
