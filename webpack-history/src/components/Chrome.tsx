import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { moveProgress } from '../lib/anim';
import { getChromeRiseFrame, getYearState, type Segment } from '../lib/timing';
import { colors, layout, transition } from '../theme';
import { Timeline } from './Timeline';
import { YearCounter } from './YearCounter';

/** 贯穿全片的 Timeline（底部）+ YearCounter（左上角） */
export const Chrome: React.FC<{ segments: Segment[] }> = ({ segments }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const year = getYearState(frame, segments);
  const riseAt = getChromeRiseFrame(segments);
  const visibility = riseAt === null ? 1 : moveProgress(frame, fps, riseAt, transition.timelineRise);

  if (visibility <= 0) {
    return null;
  }
  return (
    <>
      {/* 底部渐隐底衬：让溢出到底部的内容沉到 Timeline 之下 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: layout.timelineTop - 60,
          bottom: 0,
          background: `linear-gradient(180deg, rgba(11,16,32,0) 0%, ${colors.bg} 45%)`,
          opacity: visibility,
        }}
      />
      <YearCounter from={year.from} to={year.to} progress={year.progress} visibility={visibility} />
      <Timeline year={year.value} visibility={visibility} />
    </>
  );
};
