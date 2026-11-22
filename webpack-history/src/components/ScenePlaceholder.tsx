import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ui, type SceneConfig } from '../scenes';
import { layout, space } from '../theme';
import { Caption } from './Caption';
import { SceneTitle } from './SceneTitle';

/** 尚未制作的幕：只显示标题与提示，保证主片的时间轴与转场可以完整预览 */
export const ScenePlaceholder: React.FC<{ scene: SceneConfig }> = ({ scene }) => (
  <AbsoluteFill>
    <SceneTitle title={scene.title} years={scene.yearsLabel} />
    <Caption delay={10} size="note" tone="dim" style={{ position: 'absolute', left: space.safe, top: layout.contentTop }}>
      {ui.pendingScene}
    </Caption>
  </AbsoluteFill>
);
