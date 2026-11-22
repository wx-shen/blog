import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { enterProgress, enterStyle } from '../lib/anim';
import { alpha, colors, fonts, fontSize, fontWeight, lineHeight, space } from '../theme';

type Props = {
  name: string;
  /** 工具的固定颜色（theme.toolColors） */
  color: string;
  /** 徽章下方的一行说明 */
  description?: string;
  /** 说明比徽章晚出现的帧数 */
  descriptionDelay?: number;
  delay?: number;
  /** 0 → 1：变暗（不再是焦点） */
  dim?: number;
  width?: number;
  style?: React.CSSProperties;
};

const BLOCK = 44;

/**
 * 工具徽章：圆角色块 + 工具名文字，下方可带一行说明。
 * 不使用任何 Logo 图片，工具之间只靠固定颜色区分。
 */
export const ToolBadge: React.FC<Props> = ({
  name,
  color,
  description,
  descriptionDelay = 14,
  delay = 0,
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
          gap: space.md,
          padding: `${space.md}px ${space.lg}px ${space.md}px ${space.md}px`,
          background: alpha(color, 0.1),
          border: `2px solid ${alpha(color, 0.45)}`,
          borderRadius: space.radius,
          ...enterStyle(p),
        }}
      >
        <div
          style={{
            width: BLOCK,
            height: BLOCK,
            flexShrink: 0,
            borderRadius: space.radiusSm + 2,
            background: color,
          }}
        />
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
      </div>
      {description ? (
        <div
          style={{
            marginTop: space.sm,
            padding: `0 ${space.xs}px`,
            fontFamily: fonts.sans,
            fontSize: fontSize.note,
            lineHeight: lineHeight.text,
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
