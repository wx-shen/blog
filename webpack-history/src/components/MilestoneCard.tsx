import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { enterExitStyle } from '../lib/anim';
import { colors, fonts, fontSize, fontWeight, space, video } from '../theme';
import { Caption } from './Caption';

export type MilestoneLine = {
  text: string;
  /** 出现的帧 */
  delay: number;
  /** 原文引用用等宽字体、弱化颜色 */
  quote?: boolean;
};

type Props = {
  date: string;
  title: string;
  lines?: readonly MilestoneLine[];
  delay: number;
  exitAt: number | null;
  top: number;
};

const DATE_WIDTH = 220;

/** 里程碑卡片：左侧日期，右侧标题与若干行说明（原文引用 + 译文等） */
export const MilestoneCard: React.FC<Props> = ({ date, title, lines = [], delay, exitAt, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: 'absolute',
        left: space.safe,
        top,
        width: video.width - space.safe * 2,
        display: 'flex',
        gap: space.xl,
        ...enterExitStyle(frame, fps, delay, exitAt),
      }}
    >
      <div
        style={{
          width: DATE_WIDTH,
          flexShrink: 0,
          paddingTop: space.xs - 2,
          fontFamily: fonts.mono,
          fontSize: fontSize.note,
          color: colors.accent,
        }}
      >
        {date}
      </div>
      <div style={{ flex: 1, borderLeft: `3px solid ${colors.secondary}`, paddingLeft: space.lg }}>
        <div style={{ fontFamily: fonts.sans, fontSize: fontSize.body, fontWeight: fontWeight.bold, color: colors.text }}>
          {title}
        </div>
        {lines.map((l) => (
          <Caption
            key={l.text}
            delay={l.delay}
            exitAt={exitAt}
            size="note"
            tone={l.quote ? 'dim' : 'normal'}
            style={{ marginTop: space.sm, fontFamily: l.quote ? fonts.mono : fonts.sans }}
          >
            {l.text}
          </Caption>
        ))}
      </div>
    </div>
  );
};
