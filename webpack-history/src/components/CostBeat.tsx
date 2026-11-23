import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { enterProgress, enterStyle } from '../lib/anim';
import { alpha, colors, fonts, fontSize, fontWeight, layout, lineHeight, space, video } from '../theme';

type Props = {
  /** 出现的帧（相对当前 Sequence） */
  at: number;
  label: string;
  text: string;
  notes?: readonly string[];
};

const WIDTH = 1240;

/**
 * 「代价」节拍：先把本幕内容压暗，再浮出一张警示色卡片。
 * 同时运动的只有压暗层与卡片两个元素；Timeline / 年份在场景之上，不受影响。
 */
export const CostBeat: React.FC<Props> = ({ at, label, text, notes = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) {
    return null;
  }
  const scrim = interpolate(frame, [at, at + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const card = enterProgress(frame, fps, at + 8);
  const noteP = enterProgress(frame, fps, at + 24);
  const centerY = (layout.contentTop + layout.contentBottom) / 2;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: alpha(colors.bg, 0.78 * scrim) }} />
      <div
        style={{
          position: 'absolute',
          left: (video.width - WIDTH) / 2,
          top: centerY - 110,
          width: WIDTH,
          padding: `${space.lg}px ${space.xl}px`,
          boxSizing: 'border-box',
          background: colors.panel,
          border: `2px solid ${alpha(colors.warning, 0.45)}`,
          borderLeft: `6px solid ${colors.warning}`,
          borderRadius: space.radius,
          ...enterStyle(card),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: space.md }}>
          <div
            style={{
              flexShrink: 0,
              padding: `${space.xs / 2}px ${space.sm}px`,
              borderRadius: space.radiusSm,
              background: alpha(colors.warning, 0.15),
              fontFamily: fonts.sans,
              fontSize: fontSize.note,
              fontWeight: fontWeight.bold,
              color: colors.warning,
            }}
          >
            {label}
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
        {notes.length > 0 ? (
          <div style={{ marginTop: space.md, display: 'flex', flexDirection: 'column', gap: space.xs, ...enterStyle(noteP) }}>
            {notes.map((n) => (
              <div
                key={n}
                style={{
                  display: 'flex',
                  gap: space.sm,
                  fontFamily: fonts.sans,
                  fontSize: fontSize.note,
                  lineHeight: lineHeight.text,
                  color: colors.textDim,
                }}
              >
                <span style={{ color: colors.warning }}>—</span>
                <span>{n}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
