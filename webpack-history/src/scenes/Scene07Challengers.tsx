import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { BarChart } from '../components/BarChart';
import { Caption } from '../components/Caption';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { getScene } from '../scenes';
import { ToolBadge } from '../components/ToolBadge';
import { enterExitStyle, exitProgress } from '../lib/anim';
import { colors, layout, space } from '../theme';

const SCENE = getScene('scene07-challengers');

const TOOLS = [
  { name: 'Rollup', tag: '2015', description: '面向库的 ES 模块打包' },
  { name: 'Parcel', tag: '2017', description: '零配置，开箱即用' },
  { name: 'esbuild', tag: '2020', description: 'Go 编写，速度提升一个数量级' },
  { name: 'Vite', tag: '2020', description: '开发时基于原生 ESM 按需编译' },
  { name: 'Turbopack', tag: '2022', description: 'Rust 编写，Vercel 出品' },
  { name: 'Rspack', tag: '2023', description: 'Rust 编写，兼容 webpack 生态' },
] as const;

const T = {
  badges: 16,
  badgeStep: 32,
  gridOut: 360,
  chart: 390,
  answer: 640,
} as const;

export const Scene07Challengers: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gridOut = exitProgress(frame, T.gridOut);

  return (
    <AbsoluteFill>
      <SceneTitle title={SCENE.title} years={SCENE.yearsLabel} />

      {gridOut > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: space.safe,
            top: layout.contentTop + 20,
            width: 1680,
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: 40,
            rowGap: 56,
            opacity: gridOut,
          }}
        >
          {TOOLS.map((t, i) => (
            <ToolBadge
              key={t.name}
              name={t.name}
              tag={t.tag}
              description={t.description}
              delay={T.badges + i * T.badgeStep}
              width={533}
              accent={t.name === 'Rspack' ? colors.accent : colors.secondary}
            />
          ))}
        </div>
      ) : null}

      <div style={{ position: 'absolute', left: space.safe, top: layout.contentTop + 20, ...enterExitStyle(frame, fps, T.chart, null) }}>
        <BarChart
          caption="示意：大型项目开发服务器冷启动耗时（相对值）"
          data={[
            { label: 'webpack', value: 100, color: colors.warning },
            { label: 'Rspack', value: 18, color: colors.accent },
            { label: 'Vite', value: 10, color: colors.accent },
          ]}
          startFrame={T.chart}
          stagger={30}
          width={1680}
          labelWidth={260}
          footnote="示意数据，仅表达量级差异；实际结果取决于项目规模与配置。"
        />
      </div>

      <Caption
        delay={T.answer}
        size="body"
        tone="normal"
        style={{ position: 'absolute', left: space.safe, top: 760, width: 1680 }}
      >
        答案各不相同，但回答的都是 webpack 当年提出的问题。
      </Caption>
    </AbsoluteFill>
  );
};
