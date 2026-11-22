import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Background } from './components/Background';
import { Chrome } from './components/Chrome';
import { SceneShell } from './components/SceneShell';
import type { SceneTiming } from './lib/metadata';
import { buildSegments } from './lib/timing';
import { sceneComponents } from './sceneComponents';
import { scenes, type SceneId } from './scenes';
import { transition } from './theme';

const contentDelayFor = (index: number) => (index === 0 ? 0 : transition.contentDelay);

export type WebpackHistoryProps = {
  timings: SceneTiming[];
};

/** 主片：8 幕顺序拼接，Timeline 与 YearCounter 贯穿全片 */
export const WebpackHistory: React.FC<WebpackHistoryProps> = ({ timings }) => {
  const segments = buildSegments(
    scenes,
    timings.map((t) => t.durationInFrames),
  );
  return (
    <AbsoluteFill>
      <Background />
      {scenes.map((scene, i) => (
        <Sequence
          key={scene.id}
          from={segments[i].start}
          durationInFrames={segments[i].duration}
          name={scene.title}
        >
          <SceneShell
            scene={scene}
            durationInFrames={segments[i].duration}
            hasAudio={timings[i].hasAudio}
            contentDelay={contentDelayFor(i)}
            Content={sceneComponents[scene.id]}
          />
        </Sequence>
      ))}
      <Chrome segments={segments} />
    </AbsoluteFill>
  );
};

export type SingleSceneProps = {
  sceneId: SceneId;
  timing: SceneTiming;
};

/** 单幕预览：同样带 Timeline，从上一幕的年份滑入 */
export const SingleScene: React.FC<SingleSceneProps> = ({ sceneId, timing }) => {
  const index = scenes.findIndex((s) => s.id === sceneId);
  const scene = scenes[index];
  const prevYear = index > 0 ? scenes[index - 1].focusYear : scene.focusYear;
  const segments = buildSegments([scene], [timing.durationInFrames], prevYear);
  return (
    <AbsoluteFill>
      <Background />
      <SceneShell
        scene={scene}
        durationInFrames={timing.durationInFrames}
        hasAudio={timing.hasAudio}
        contentDelay={contentDelayFor(index)}
        Content={sceneComponents[scene.id]}
      />
      <Chrome segments={segments} />
    </AbsoluteFill>
  );
};
