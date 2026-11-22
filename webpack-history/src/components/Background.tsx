import React from 'react';
import { AbsoluteFill } from 'remotion';
import { colors } from '../theme';

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
        background: 'radial-gradient(ellipse at 50% 40%, rgba(28,120,192,0.10) 0%, rgba(11,16,32,0) 55%, rgba(5,8,16,0.55) 100%)',
      }}
    />
  </AbsoluteFill>
);
