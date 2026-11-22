import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { CodeBlock } from '../components/CodeBlock';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { getScene } from '../scenes';
import { Terminal } from '../components/Terminal';
import { ToolBadge } from '../components/ToolBadge';
import { enterExitStyle, enterProgress, enterStyle, rangeProgress } from '../lib/anim';
import { space } from '../theme';

const SCENE = getScene('scene05-evolution');

const VERSIONS = [
  { name: 'webpack 2', tag: '2017.01', description: '原生 ES Modules，带来 Tree Shaking' },
  { name: 'webpack 3', tag: '2017.06', description: 'Scope Hoisting：作用域提升，产物更小' },
  { name: 'webpack 4', tag: '2018.02', description: 'mode 与合理默认值，零配置即可构建' },
] as const;

const TREE = [
  '// math.js',
  'export const add = (a, b) => a + b;',
  'export const sub = (a, b) => a - b;',
  '',
  '// main.js',
  "import { add } from './math';",
];

const T = {
  cards: 16,
  cardStep: 70,
  treeIn: 250,
  treeDim: 320,
  treeNote: 350,
  phaseBOut: 440,
  meme: 470,
  term: 520,
} as const;

const CARD_TOP = 280;
const LOWER_TOP = 530;

export const Scene05Evolution: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 下半部分讲到哪个版本，就突出哪张卡片
  const focus = frame >= T.phaseBOut ? 2 : frame >= T.treeIn ? 0 : -1;
  const dimFor = (i: number) => {
    if (focus === -1) return 0;
    const start = focus === 0 ? T.treeIn : T.phaseBOut;
    const d = rangeProgress(frame, start, start + 14);
    if (i === focus) {
      // 从变暗状态恢复
      return focus === 2 ? 1 - d : 0;
    }
    return focus === 0 ? d : i === 0 ? d : 1;
  };

  const termP = enterProgress(frame, fps, T.term);

  return (
    <AbsoluteFill>
      <SceneTitle title={SCENE.title} years={SCENE.yearsLabel} />

      <div style={{ position: 'absolute', left: space.safe, top: CARD_TOP, display: 'flex', gap: 40 }}>
        {VERSIONS.map((v, i) => (
          <ToolBadge
            key={v.name}
            name={v.name}
            tag={v.tag}
            description={v.description}
            delay={T.cards + i * T.cardStep}
            width={520}
            dim={dimFor(i)}
          />
        ))}
      </div>

      {/* 阶段 A：Tree Shaking 演示 */}
      <div
        style={{
          position: 'absolute',
          left: space.safe,
          top: LOWER_TOP,
          ...enterExitStyle(frame, fps, T.treeIn, T.phaseBOut),
        }}
      >
        <CodeBlock lines={TREE} width={900} fontSize={26} dimLines={[2]} dimProgress={rangeProgress(frame, T.treeDim, T.treeDim + 24)} />
      </div>
      <Caption
        delay={T.treeNote}
        exitAt={T.phaseBOut}
        size="note"
        tone="dim"
        style={{ position: 'absolute', left: 1100, top: LOWER_TOP + 90, width: 700 }}
      >
        <span style={{ color: '#E8EEF7' }}>sub</span> 从未被引用 ——
        <br />
        静态分析 import / export 后，在打包时被剔除。
      </Caption>

      {/* 阶段 B：配置之痛 → 零配置 */}
      <div style={{ position: 'absolute', left: space.safe, top: LOWER_TOP + 30, width: 820 }}>
        <Caption delay={T.meme} size="body" tone="warning" weight="medium">
          「webpack 配置工程师」
        </Caption>
        <Caption delay={T.meme + 16} size="note" tone="dim" style={{ marginTop: space.md }}>
          那几年，这是社区里流传的玩笑。
          <br />
          webpack 4 的回应：约定优于配置。
        </Caption>
      </div>
      <div style={{ position: 'absolute', left: 1000, top: LOWER_TOP, ...enterStyle(termP) }}>
        <Terminal
          command="npx webpack --mode production"
          typeStart={T.term + 16}
          title="webpack 4"
          width={800}
          height={290}
          lines={[
            { text: '默认入口 ./src/index.js → ./dist/main.js', at: T.term + 90, tone: 'dim' },
            { text: '无需 webpack.config.js，直接构建', at: T.term + 104, tone: 'success' },
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};
