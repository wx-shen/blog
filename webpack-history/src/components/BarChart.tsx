import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { enterProgress, enterStyle, moveProgress } from '../lib/anim';
import { colors, fonts, fontSize, fontWeight, space } from '../theme';

export type Bar = {
  label: string;
  value: number;
  /** 柱末尾显示的文字，默认显示数值 */
  valueLabel?: string;
  color?: string;
};

type Props = {
  data: readonly Bar[];
  /** 最大刻度，默认取数据最大值 */
  max?: number;
  /** 开始的帧（相对当前 Sequence） */
  startFrame?: number;
  /** 相邻柱子的错峰帧数 */
  stagger?: number;
  width?: number;
  barHeight?: number;
  labelWidth?: number;
  caption?: string;
  footnote?: string;
  style?: React.CSSProperties;
};

/** 横向柱状图：标签在左，柱子依次生长 */
export const BarChart: React.FC<Props> = ({
  data,
  max,
  startFrame = 0,
  stagger = 18,
  width = 1100,
  barHeight = 56,
  labelWidth = 240,
  caption,
  footnote,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const top = max ?? Math.max(...data.map((d) => d.value));
  const trackWidth = width - labelWidth - 200;
  const head = enterProgress(frame, fps, startFrame);

  return (
    <div style={{ width, ...style }}>
      {caption ? (
        <div
          style={{
            fontFamily: fonts.sans,
            fontSize: fontSize.note,
            color: colors.textDim,
            marginBottom: space.lg,
            ...enterStyle(head),
          }}
        >
          {caption}
        </div>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
        {data.map((d, i) => {
          const at = startFrame + 10 + i * stagger;
          const appear = enterProgress(frame, fps, at);
          const grow = moveProgress(frame, fps, at + 4);
          const color = d.color ?? colors.accent;
          return (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', height: barHeight, opacity: appear }}>
              <div
                style={{
                  width: labelWidth,
                  fontFamily: fonts.mono,
                  fontSize: fontSize.note,
                  color: colors.text,
                }}
              >
                {d.label}
              </div>
              <div style={{ width: trackWidth, height: barHeight * 0.62, position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: Math.max(4, (d.value / top) * trackWidth * grow),
                    background: color,
                    borderRadius: 6,
                  }}
                />
              </div>
              <div
                style={{
                  marginLeft: space.md,
                  fontFamily: fonts.mono,
                  fontSize: fontSize.note,
                  fontWeight: fontWeight.bold,
                  color,
                  opacity: grow,
                }}
              >
                {d.valueLabel ?? d.value}
              </div>
            </div>
          );
        })}
      </div>
      {footnote ? (
        <div
          style={{
            marginTop: space.lg,
            fontFamily: fonts.sans,
            fontSize: fontSize.small,
            color: colors.textFaint,
            opacity: enterProgress(frame, fps, startFrame + 10 + data.length * stagger),
          }}
        >
          {footnote}
        </div>
      ) : null}
    </div>
  );
};
