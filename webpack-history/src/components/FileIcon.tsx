import React from 'react';
import { colors, fonts, fontSize, fontWeight, layout } from '../theme';

type Props = {
  label: string;
  color: string;
  width?: number;
  height?: number;
};

/** 折角文件图标，中间是类型短标签 */
export const FileIcon: React.FC<Props> = ({
  label,
  color,
  width: w = layout.fileIcon.width,
  height: h = layout.fileIcon.height,
}) => {
  const fold = w * 0.28;
  const scale = w / layout.fileIcon.width;
  const labelSize = (label.length > 3 ? fontSize.small - 4 : fontSize.small) * scale;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible', display: 'block' }}>
      <path
        d={`M2 2 H${w - fold} L${w - 2} ${fold} V${h - 2} H2 Z`}
        fill={colors.panel}
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d={`M${w - fold} 2 V${fold} H${w - 2}`} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />
      <text
        x={w / 2}
        y={h * 0.68}
        textAnchor="middle"
        fontFamily={fonts.mono}
        fontWeight={fontWeight.bold}
        fontSize={labelSize}
        fill={color}
      >
        {label}
      </text>
    </svg>
  );
};
