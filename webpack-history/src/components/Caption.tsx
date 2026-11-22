import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { enterExitStyle } from '../lib/anim';
import { colors, fonts, fontSize, fontWeight, lineHeight } from '../theme';

type Props = {
  children: React.ReactNode;
  delay?: number;
  /** 幕内淡出的帧；null 表示随整幕淡出 */
  exitAt?: number | null;
  size?: 'title' | 'body' | 'note';
  tone?: 'normal' | 'dim' | 'accent' | 'warning';
  weight?: keyof typeof fontWeight;
  style?: React.CSSProperties;
};

const toneColor = {
  normal: colors.text,
  dim: colors.textDim,
  accent: colors.accent,
  warning: colors.warning,
} as const;

/** 一段带统一入场的文字（标题 72 / 正文 40 / 注释 28） */
export const Caption: React.FC<Props> = ({
  children,
  delay = 0,
  exitAt = null,
  size = 'note',
  tone = 'dim',
  weight = 'regular',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        fontFamily: fonts.sans,
        fontSize: fontSize[size],
        fontWeight: fontWeight[weight],
        color: toneColor[tone],
        lineHeight: lineHeight.text,
        ...style,
        ...enterExitStyle(frame, fps, delay, exitAt),
      }}
    >
      {children}
    </div>
  );
};
