import React from 'react';
import { Composition, type CalculateMetadataFunction } from 'remotion';
import { resolveSceneTiming } from './lib/metadata';
import { scenes } from './scenes';
import { video } from './theme';
import { SingleScene, WebpackHistory, type SingleSceneProps, type WebpackHistoryProps } from './Video';

const defaultTimings = scenes.map((s) => ({
  durationInFrames: Math.round(s.durationSeconds * video.fps),
  hasAudio: false,
}));

const calcMain: CalculateMetadataFunction<WebpackHistoryProps> = async ({ props }) => {
  const timings = await Promise.all(scenes.map(resolveSceneTiming));
  return {
    durationInFrames: timings.reduce((sum, t) => sum + t.durationInFrames, 0),
    props: { ...props, timings },
  };
};

const calcScene: CalculateMetadataFunction<SingleSceneProps> = async ({ props }) => {
  const scene = scenes.find((s) => s.id === props.sceneId);
  if (!scene) {
    throw new Error(`Unknown scene ${props.sceneId}`);
  }
  const timing = await resolveSceneTiming(scene);
  return {
    durationInFrames: timing.durationInFrames,
    props: { ...props, timing },
  };
};

// Composition id 只能包含字母、数字和 "-"
const compId = (index: number, id: string) =>
  `S${String(index + 1).padStart(2, '0')}-${id.replace(/^scene\d+-/, '')}`;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="WebpackHistory"
      component={WebpackHistory}
      width={video.width}
      height={video.height}
      fps={video.fps}
      durationInFrames={defaultTimings.reduce((s, t) => s + t.durationInFrames, 0)}
      defaultProps={{ timings: defaultTimings }}
      calculateMetadata={calcMain}
    />
    {scenes.map((scene, i) => (
      <Composition
        key={scene.id}
        id={compId(i, scene.id)}
        component={SingleScene}
        width={video.width}
        height={video.height}
        fps={video.fps}
        durationInFrames={defaultTimings[i].durationInFrames}
        defaultProps={{ sceneId: scene.id, timing: defaultTimings[i] }}
        calculateMetadata={calcScene}
      />
    ))}
  </>
);
