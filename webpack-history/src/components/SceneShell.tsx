import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { exitProgress } from '../lib/anim';
import type { SceneConfig } from '../scenes';
import { transition } from '../theme';

export type SceneProps = {
  /** 内容区可用的帧数（= 幕时长 - 入场等待） */
  duration: number;
};

type Props = {
  scene: SceneConfig;
  durationInFrames: number;
  hasAudio: boolean;
  /** 等时间轴滑完再让内容入场 */
  contentDelay: number;
  Content: React.FC<SceneProps>;
};

/**
 * 每一幕的外壳：
 * - 前 contentDelay 帧留给 Timeline 滑动，内容随后入场
 * - 最后 fadeOut(12) 帧整体淡出
 * - 有音频时从幕起点播放旁白
 */
export const SceneShell: React.FC<Props> = ({ scene, durationInFrames, hasAudio, contentDelay, Content }) => {
  const frame = useCurrentFrame();
  const opacity = exitProgress(frame, durationInFrames - transition.fadeOut);
  return (
    <AbsoluteFill>
      {hasAudio ? <Audio src={staticFile(scene.audio)} /> : null}
      <AbsoluteFill style={{ opacity }}>
        <Sequence from={contentDelay} name={`${scene.id} content`}>
          <Content duration={durationInFrames - contentDelay} />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
