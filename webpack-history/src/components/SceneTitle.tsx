import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { enterProgress, enterStyle } from '../lib/anim';
import { colors, fonts, fontSize, fontWeight, layout, space } from '../theme';

type Props = {
  title: string;
  /** 例如 "2009 – 2012" */
  years?: string;
  delay?: number;
};

/** 每一幕的标题，位于左上角年份右侧 */
export const SceneTitle: React.FC<Props> = ({ title, years, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enterProgress(frame, fps, delay);
  return (
    <div
      style={{
        position: 'absolute',
        left: layout.titleLeft,
        top: layout.headerTop,
        height: fontSize.year * 1.1,
        display: 'flex',
        alignItems: 'center',
        gap: space.md,
        ...enterStyle(p),
      }}
    >
      <div style={{ width: 3, height: fontSize.title * 0.9, background: colors.secondary }} />
      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: fontSize.title,
          fontWeight: fontWeight.bold,
          color: colors.text,
        }}
      >
        {title}
      </div>
      {years ? (
        <div style={{ fontFamily: fonts.mono, fontSize: fontSize.note, color: colors.textDim, marginTop: space.sm }}>
          {years}
        </div>
      ) : null}
    </div>
  );
};
