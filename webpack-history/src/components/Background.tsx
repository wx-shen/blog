import React from 'react';
import { AbsoluteFill } from 'remotion';
import { alpha, colors } from '../theme';

/** 深蓝黑背景 + 极淡网格纹理（静态） */
export const Background: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.bg }}>
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${colors.grid} 1px, transparent 1px), linear-gradient(90deg, ${colors.grid} 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        backgroundPosition: '-1px -1px',
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${colors.glow} 0%, ${alpha(colors.bg, 0)} 55%, ${colors.vignette} 100%)`,
      }}
    />
  </AbsoluteFill>
);
