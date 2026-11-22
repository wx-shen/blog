import type { CSSProperties } from 'react';
import { Easing, interpolate, spring } from 'remotion';
import { motion, transition } from '../theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const slideEasing = Easing.bezier(...motion.slideBezier);

/** 统一入场进度：spring（damping 200，无回弹），0 → 1 */
export const enterProgress = (
  frame: number,
  fps: number,
  delay = 0,
  durationInFrames: number = motion.enterFrames,
): number =>
  spring({
    frame: frame - delay,
    fps,
    config: motion.enterSpring,
    durationInFrames,
  });

/** 较慢的位移进度（缩放、升起等） */
export const moveProgress = (
  frame: number,
  fps: number,
  delay = 0,
  durationInFrames: number = motion.moveFrames,
): number =>
  spring({
    frame: frame - delay,
    fps,
    config: motion.moveSpring,
    durationInFrames,
  });

/** 自下而上位移 + 淡入 */
export const enterStyle = (progress: number, offset: number = motion.enterOffset): CSSProperties => ({
  opacity: progress,
  transform: `translateY(${(1 - progress) * offset}px)`,
});

/** 幕内元素淡出：start 起 duration 帧内 1 → 0 */
export const exitProgress = (frame: number, start: number, duration: number = transition.fadeOut): number =>
  interpolate(frame, [start, start + duration], [1, 0], clamp);

/** 线性区间进度，0 → 1，可选缓动 */
export const rangeProgress = (
  frame: number,
  start: number,
  end: number,
  easing: (t: number) => number = (t) => t,
): number => interpolate(frame, [start, end], [0, 1], { ...clamp, easing });

/** 入场 × 退场 的组合透明度/位移 */
export const enterExitStyle = (
  frame: number,
  fps: number,
  enterAt: number,
  exitAt: number | null,
): CSSProperties => {
  const p = enterProgress(frame, fps, enterAt);
  const out = exitAt === null ? 1 : exitProgress(frame, exitAt);
  return {
    opacity: p * out,
    transform: `translateY(${(1 - p) * motion.enterOffset}px)`,
  };
};
