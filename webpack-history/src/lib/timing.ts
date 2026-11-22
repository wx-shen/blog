import { interpolate } from 'remotion';
import type { SceneConfig } from '../scenes';
import { transition } from '../theme';
import { slideEasing } from './anim';

export type Segment = {
  start: number;
  duration: number;
  focusYear: number;
  chrome: SceneConfig['chrome'];
  /** 进入这一幕前 Timeline 停在的年份（第一幕等于自身） */
  prevYear: number;
};

export const buildSegments = (
  sceneList: readonly SceneConfig[],
  durations: readonly number[],
  initialPrevYear?: number,
): Segment[] => {
  let start = 0;
  return sceneList.map((scene, i) => {
    const segment: Segment = {
      start,
      duration: durations[i],
      focusYear: scene.focusYear,
      chrome: scene.chrome,
      prevYear: i === 0 ? (initialPrevYear ?? scene.focusYear) : sceneList[i - 1].focusYear,
    };
    start += durations[i];
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

/** 幕切换时：前 timelineSlide 帧内，年份从上一幕滑到这一幕 */
export const getYearState = (frame: number, segments: Segment[]): YearState => {
  const seg = findSegment(frame, segments);
  const progress =
    seg.prevYear === seg.focusYear
      ? 1
      : interpolate(frame - seg.start, [0, transition.timelineSlide], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: slideEasing,
        });
  return {
    from: seg.prevYear,
    to: seg.focusYear,
    progress,
    value: seg.prevYear + (seg.focusYear - seg.prevYear) * progress,
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
