import timings from '../data/narrationTimings.json';
import { transition, video } from '../theme';
import { contentDelayFor } from './timing';

/**
 * 旁白对齐：根据 scripts/tts.mjs 生成的 narrationTimings.json，
 * 返回「旁白念到某句话」时，在该幕内容区（Sequence）里的帧号。
 *
 * - phrase 是该句中的一小段原文（与 narration.md 完全一致），找不到会直接报错，避免改稿后静默错位。
 * - 音频在幕起点开始播放，而内容区要等 contentDelay（时间轴滑动）之后才开始，所以要减去这段延迟。
 */
type Sentence = { text: string; start: number; end: number };
type SceneTimings = { duration: number; sentences: Sentence[] };

const all = timings as Record<string, SceneTimings>;
const order = Object.keys(all);

const find = (sceneId: string, phrase: string): Sentence => {
  const scene = all[sceneId];
  if (!scene) {
    throw new Error(`[cues] 没有 ${sceneId} 的旁白时间，请先运行 npm run tts`);
  }
  const s = scene.sentences.find((x) => x.text.includes(phrase));
  if (!s) {
    throw new Error(`[cues] ${sceneId} 的旁白里找不到「${phrase}」`);
  }
  return s;
};

const toContentFrame = (sceneId: string, seconds: number) =>
  Math.max(0, Math.round(seconds * video.fps) - contentDelayFor(order.indexOf(sceneId)));

/**
 * 旁白念到 phrase 时（内容区帧号），可加偏移帧。
 * phrase 在句首时就是该句的开始时间；在句中时按它在句中的字符位置按比例估算。
 */
export const cue = (sceneId: string, phrase: string, offset = 0): number => {
  const s = find(sceneId, phrase);
  const frac = s.text.indexOf(phrase) / s.text.length;
  return toContentFrame(sceneId, s.start + (s.end - s.start) * frac) + offset;
};

/** 含有 phrase 的那一句念完时（内容区帧号） */
export const cueEnd = (sceneId: string, phrase: string, offset = 0): number =>
  toContentFrame(sceneId, find(sceneId, phrase).end) + offset;

/** 「代价」节拍：在念到代价那句话时出现，最晚不晚于幕结束前 costLead 帧 */
export const costCue = (sceneId: string, phrase: string, duration: number): number =>
  Math.min(cue(sceneId, phrase), duration - transition.costLead);
