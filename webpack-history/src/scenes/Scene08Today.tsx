import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Caption } from '../components/Caption';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { getScene } from '../scenes';
import { ToolBadge } from '../components/ToolBadge';
import { exitProgress } from '../lib/anim';
import { layout, space } from '../theme';

const SCENE = getScene('scene08-today');

const LEGACY = [
  { name: '模块图', tag: 'Module Graph' },
  { name: 'Loader / Plugin', tag: '生态' },
  { name: '代码分割', tag: 'import()' },
  { name: '热更新', tag: 'HMR' },
  { name: 'Tree Shaking', tag: 'ESM' },
  { name: '模块联邦', tag: 'MF' },
] as const;

const T = {
  heading: 10,
  chips: 50,
  chipStep: 26,
  inherit: 260,
  out: 440,
  final1: 470,
  final2: 510,
  thanks: 580,
} as const;

export const Scene08Today: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, T.out);

  return (
    <AbsoluteFill>
      <SceneTitle title={SCENE.title} years={SCENE.yearsLabel} />

      {out > 0 ? (
        <div style={{ position: 'absolute', left: space.safe, top: layout.contentTop + 10, width: 1680, opacity: out }}>
          <Caption delay={T.heading} size="body" tone="accent" weight="medium">
            webpack 留下的遗产
          </Caption>
          <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 40, rowGap: 32, marginTop: space.lg }}>
            {LEGACY.map((l, i) => (
              <ToolBadge key={l.name} name={l.name} tag={l.tag} delay={T.chips + i * T.chipStep} width={533} />
            ))}
          </div>
          <Caption delay={T.inherit} size="note" tone="dim" style={{ marginTop: 56 }}>
            这些概念已成为前端构建的公共语言；Rspack 等新工具更是直接兼容 webpack 的 loader 与插件 API。
          </Caption>
        </div>
      ) : null}

      <div style={{ position: 'absolute', top: 380, width: '100%', textAlign: 'center' }}>
        <Caption delay={T.final1} size="title" tone="normal" weight="bold">
          打包工具会更替
        </Caption>
        <Caption delay={T.final2} size="title" tone="accent" weight="bold" style={{ marginTop: space.md }}>
          问题与思想会留下
        </Caption>
        <Caption delay={T.thanks} size="note" tone="dim" style={{ marginTop: space.xl }}>
          致敬 Tobias Koppers 与每一位 webpack 贡献者
        </Caption>
      </div>
    </AbsoluteFill>
  );
};
