import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { CodeBlock } from '../components/CodeBlock';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { getScene } from '../scenes';
import { ToolBadge } from '../components/ToolBadge';
import { enterProgress, enterStyle, exitProgress, rangeProgress } from '../lib/anim';
import { layout, space } from '../theme';

const SCENE = getScene('scene04-rise');

// webpack 1 时代的典型配置
const CONFIG = [
  'module.exports = {',
  "  entry: './src/main.jsx',",
  "  output: { filename: 'bundle.js' },",
  '  module: {',
  '    loaders: [',
  "      { test: /\\.jsx$/, loader: 'jsx' },",
  "      { test: /\\.css$/, loader: 'style!css' },",
  "      { test: /\\.png$/, loader: 'url?limit=8192' },",
  '    ],',
  '  },',
  '  plugins: [new HotModuleReplacementPlugin()],',
  '};',
];

const T = {
  code: 10,
  item1: 70,
  item2: 180,
  item3: 300,
  hlFade: 14,
  listOut: 450,
  warn: 470,
  pain: 480,
  painNote: 520,
} as const;

const ITEMS = [
  { name: 'webpack 1.0', tag: '2014', description: 'Instagram 在 React 项目中采用，社区随之跟进', at: T.item1, lines: [] },
  { name: 'Loader', tag: 'module', description: '任何文件都能被转换成模块', at: T.item2, lines: [4, 5, 6, 7, 8] },
  { name: 'Plugin · HMR', tag: 'plugins', description: '扩展构建流程；改代码无需刷新页面', at: T.item3, lines: [10] },
] as const;

export const Scene04Rise: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const codeP = enterProgress(frame, fps, T.code);

  // 当前讲到哪一项，就高亮对应的配置行
  const active = frame >= T.item3 ? 2 : frame >= T.item2 ? 1 : 0;
  const activeItem = ITEMS[active];
  const hl =
    rangeProgress(frame, activeItem.at, activeItem.at + T.hlFade) *
    (1 - rangeProgress(frame, T.listOut, T.listOut + T.hlFade));
  const listOut = exitProgress(frame, T.listOut);
  const warning = rangeProgress(frame, T.warn, T.warn + 30);

  return (
    <AbsoluteFill>
      <SceneTitle title={SCENE.title} years={SCENE.yearsLabel} />

      <div style={{ position: 'absolute', left: space.safe, top: layout.contentTop, ...enterStyle(codeP) }}>
        <CodeBlock
          filename="webpack.config.js"
          lines={CONFIG}
          width={860}
          fontSize={24}
          highlightLines={activeItem.lines}
          highlightProgress={hl}
          warning={warning}
        />
      </div>

      {/* 右侧：里程碑与核心机制 */}
      <div
        style={{
          position: 'absolute',
          left: 1060,
          top: layout.contentTop,
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          opacity: listOut,
        }}
      >
        {/* 下一项出现时，前一项退为背景 */}
        {listOut > 0
          ? ITEMS.map((it, i) => (
              <ToolBadge
                key={it.name}
                name={it.name}
                tag={it.tag}
                description={it.description}
                delay={it.at}
                width={740}
                dim={i + 1 < ITEMS.length ? rangeProgress(frame, ITEMS[i + 1].at, ITEMS[i + 1].at + 12) : 0}
              />
            ))
          : null}
      </div>

      {/* 痛点 */}
      <div style={{ position: 'absolute', left: 1060, top: layout.contentTop + 150, width: 740 }}>
        <Caption delay={T.pain} size="body" tone="warning" weight="medium">
          灵活、强大，
          <br />
          但配置一天比一天长。
        </Caption>
        <Caption delay={T.painNote} size="note" tone="dim" style={{ marginTop: space.lg }}>
          真实项目里，dev / prod 配置拆成多个文件、合计上百行并不少见。
        </Caption>
      </div>
    </AbsoluteFill>
  );
};
