import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { enterProgress, enterStyle } from '../lib/anim';
import { alpha, colors, fonts, fontSize, fontWeight, space } from '../theme';

type Props = {
  text: string;
  delay?: number;
  color?: string;
  size?: 'body' | 'note';
};

/** 关键词胶囊 */
export const Pill: React.FC<Props> = ({ text, delay = 0, color = colors.accent, size = 'body' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        padding: `${space.sm}px ${space.lg}px`,
        border: `2px solid ${color}`,
        borderRadius: 999,
        fontFamily: fonts.sans,
        fontSize: fontSize[size],
        fontWeight: fontWeight.bold,
        color,
        background: alpha(color, 0.06),
        whiteSpace: 'nowrap',
        ...enterStyle(enterProgress(frame, fps, delay)),
      }}
    >
      {text}
    </div>
  );
};
