import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { enterProgress, enterStyle } from '../lib/anim';
import { colors, fonts, fontSize, fontWeight, space } from '../theme';

type Props = {
  name: string;
  /** 右侧标签，如年份 "2017.01" 或类别 "模块加载器" */
  tag?: string;
  /** 徽章下方的一行说明 */
  description?: string;
  /** 说明比徽章晚出现的帧数 */
  descriptionDelay?: number;
  delay?: number;
  accent?: string;
  /** 0 → 1：变暗（不再是焦点） */
  dim?: number;
  width?: number;
  style?: React.CSSProperties;
};

/** 工具 / 版本徽章：名称 + 标签，下方一行说明 */
export const ToolBadge: React.FC<Props> = ({
  name,
  tag,
  description,
  descriptionDelay = 14,
  delay = 0,
  accent = colors.accent,
  dim = 0,
  width = 460,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enterProgress(frame, fps, delay);
  const pd = enterProgress(frame, fps, delay + descriptionDelay);

  return (
    <div style={{ width, opacity: 1 - dim * 0.6, ...style }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${space.md}px ${space.lg}px`,
          background: colors.panel,
          border: `2px solid ${colors.panelBorder}`,
          borderLeft: `6px solid ${accent}`,
          borderRadius: space.radius,
          ...enterStyle(p),
        }}
      >
        <div
          style={{
            fontFamily: fonts.sans,
            fontSize: fontSize.body,
            fontWeight: fontWeight.bold,
            color: colors.text,
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </div>
        {tag ? (
          <div style={{ fontFamily: fonts.mono, fontSize: fontSize.note, color: accent, marginLeft: space.md }}>
            {tag}
          </div>
        ) : null}
      </div>
      {description ? (
        <div
          style={{
            marginTop: space.sm,
            padding: `0 ${space.xs}px`,
            fontFamily: fonts.sans,
            fontSize: fontSize.note,
            lineHeight: 1.5,
            color: colors.textDim,
            ...enterStyle(pd),
          }}
        >
          {description}
        </div>
      ) : null}
    </div>
  );
};
