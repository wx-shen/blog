import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { enterExitStyle } from '../lib/anim';
import { alpha, colors, fonts, fontSize, fontWeight, lineHeight, space } from '../theme';

type Props = {
  /** 标签文字，如「回应」 */
  label: string;
  /** 回应的是哪一个代价，如「第 3 幕的代价」 */
  title: string;
  text: string;
  delay: number;
  exitAt: number | null;
  width: number;
  style?: React.CSSProperties;
};

/** 「回应」卡片：后面的版本回应前面某一幕的代价，与 CostBeat 配对（强调色 vs 警示色） */
export const AnswerCard: React.FC<Props> = ({ label, title, text, delay, exitAt, width, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        width,
        padding: `${space.lg}px ${space.xl}px`,
        boxSizing: 'border-box',
        background: colors.panel,
        border: `2px solid ${alpha(colors.accent, 0.35)}`,
        borderLeft: `6px solid ${colors.accent}`,
        borderRadius: space.radius,
        ...style,
        ...enterExitStyle(frame, fps, delay, exitAt),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: space.md, marginBottom: space.md }}>
        <div
          style={{
            padding: `${space.xs / 2}px ${space.sm}px`,
            borderRadius: space.radiusSm,
            background: alpha(colors.accent, 0.15),
            fontFamily: fonts.sans,
            fontSize: fontSize.note,
            fontWeight: fontWeight.bold,
            color: colors.accent,
          }}
        >
          {label}
        </div>
        <div style={{ fontFamily: fonts.sans, fontSize: fontSize.note, color: colors.textDim }}>{title}</div>
      </div>
      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: fontSize.body,
          fontWeight: fontWeight.bold,
          lineHeight: lineHeight.text,
          color: colors.text,
        }}
      >
        {text}
      </div>
    </div>
  );
};
