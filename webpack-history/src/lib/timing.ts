import { interpolate } from 'remotion';
import type { SceneConfig } from '../scenes';
import { transition } from '../theme';
import { slideEasing } from './anim';

/** 时间轴的一次滑动：从 from 年滑到 to 年，起点为段内帧 */
type YearMove = { at: number; from: number; to: number };

export type Segment = {
  start: number;
  duration: number;
  chrome: SceneConfig['chrome'];
  /** 段内的年份滑动：第一项是进入本幕时的滑动，其余来自 scenes.ts 的 yearStops */
  moves: YearMove[];
  /** Timeline / YearCounter 在段内退场的帧（段内帧），null 表示不退场 */
  chromeExitAt: number | null;
};

/** 内容区相对幕起点的延迟：开场幕没有时间轴滑动，内容立即开始 */
export const contentDelayFor = (index: number): number => (index === 0 ? 0 : transition.contentDelay);

/** 一幕结束时时间轴停在的年份 */
export const finalYear = (scene: SceneConfig): number => {
  const stops = scene.yearStops ?? [];
  return stops.length > 0 ? stops[stops.length - 1].year : scene.focusYear;
};

/**
 * @param firstIndex  sceneList[0] 在全片中的序号（单幕预览时用于确定内容延迟）
 * @param initialPrevYear  进入第一幕前时间轴停在的年份
 */
export const buildSegments = (
  sceneList: readonly SceneConfig[],
  durations: readonly number[],
  firstIndex = 0,
  initialPrevYear?: number,
): Segment[] => {
  let start = 0;
  let prevYear = initialPrevYear ?? sceneList[0].focusYear;
  return sceneList.map((scene, i) => {
    const delay = contentDelayFor(firstIndex + i);
    const moves: YearMove[] = [{ at: 0, from: prevYear, to: scene.focusYear }];
    for (const stop of scene.yearStops ?? []) {
      moves.push({ at: delay + stop.atFrame, from: moves[moves.length - 1].to, to: stop.year });
    }
    const segment: Segment = {
      start,
      duration: durations[i],
      chrome: scene.chrome,
      moves,
      chromeExitAt: scene.chromeExitAt === undefined ? null : delay + scene.chromeExitAt,
    };
    start += durations[i];
    prevYear = finalYear(scene);
    return segment;
  });
};

export type YearState = {
  from: number;
  to: number;
  /** 0 → 1 的滑动进度（已缓动） */
  progress: number;
  /** 连续年份值，供 Timeline 使用 */
  value: number;
};

const findSegment = (frame: number, segments: Segment[]): Segment => {
  for (const s of segments) {
    if (frame < s.start + s.duration) {
      return s;
    }
  }
  return segments[segments.length - 1];
};

/** 每次滑动在 timelineSlide 帧内完成：时间轴平移、年份逐位滚动 */
export const getYearState = (frame: number, segments: Segment[]): YearState => {
  const seg = findSegment(frame, segments);
  const rel = frame - seg.start;
  let move = seg.moves[0];
  for (const m of seg.moves) {
    if (m.at <= rel) {
      move = m;
    }
  }
  const progress =
    move.from === move.to
      ? 1
      : interpolate(rel - move.at, [0, transition.timelineSlide], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: slideEasing,
        });
  return {
    from: move.from,
    to: move.to,
    progress,
    value: move.from + (move.to - move.from) * progress,
  };
};

/**
 * Timeline / YearCounter 升起的时刻（全局帧）。
 * 'rise-at-end' 的幕：在淡出前 timelineRise 帧开始升起。
 * 返回 null 表示从一开始就显示。
 */
export const getChromeRiseFrame = (segments: Segment[]): number | null => {
  const first = segments[0];
  if (first.chrome !== 'rise-at-end') {
    return null;
  }
  return first.start + first.duration - transition.timelineRise - transition.fadeOut;
};

/** 当前帧所在段若设置了退场，返回退场开始的全局帧 */
export const getChromeExitFrame = (frame: number, segments: Segment[]): number | null => {
  const seg = findSegment(frame, segments);
  return seg.chromeExitAt === null ? null : seg.start + seg.chromeExitAt;
};
