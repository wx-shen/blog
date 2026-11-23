import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { getStaticFiles, staticFile } from 'remotion';
import type { SceneConfig } from '../scenes';
import { audioTailSeconds, video } from '../theme';

export type SceneTiming = {
  durationInFrames: number;
  hasAudio: boolean;
};

const audioExists = (path: string): boolean => {
  try {
    return getStaticFiles().some((f) => f.name === path);
  } catch {
    return false;
  }
};

/**
 * 若 public/<scene.audio> 存在：音频时长 + 留白（默认 0.4 秒，可按幕覆盖）；否则用 scenes.ts 里的默认时长。
 */
export const resolveSceneTiming = async (scene: SceneConfig): Promise<SceneTiming> => {
  const fallback: SceneTiming = {
    durationInFrames: Math.round(scene.durationSeconds * video.fps),
    hasAudio: false,
  };
  if (!audioExists(scene.audio)) {
    return fallback;
  }
  try {
    const seconds = await getAudioDurationInSeconds(staticFile(scene.audio));
    return {
      durationInFrames: Math.ceil((seconds + (scene.audioTailSeconds ?? audioTailSeconds)) * video.fps),
      hasAudio: true,
    };
  } catch (err) {
    console.warn(`[webpack-history] 读取音频失败，使用默认时长：${scene.audio}`, err);
    return fallback;
  }
};
