import React from 'react';
import { alpha, colors, cubeColors } from '../theme';

type Props = {
  /** 外接六边形半径 */
  r: number;
  /** 0 → 1：吸入文件时的瞬时发光 */
  glow?: number;
};

const pt = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return [Math.cos(a) * r, Math.sin(a) * r] as const;
};

const poly = (ps: readonly (readonly [number, number])[]) => ps.map((p) => p.join(',')).join(' ');

/**
 * 普通等轴立方体：三个面明暗不同，不做内外双层结构，避免模仿任何官方标志。
 * 以 (0,0) 为中心绘制，外层 div 负责定位。
 */
export const Cube: React.FC<Props> = ({ r, glow = 0 }) => {
  const top = pt(-90, r);
  const ur = pt(-30, r);
  const lr = pt(30, r);
  const bot = pt(90, r);
  const ll = pt(150, r);
  const ul = pt(210, r);
  const c = [0, 0] as const;
  const size = r * 2 + 40;
  const stroke = { stroke: cubeColors.edge, strokeWidth: 3, strokeLinejoin: 'round' as const };
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
      style={{
        overflow: 'visible',
        filter: `drop-shadow(0 0 ${20 + glow * 40}px ${alpha(colors.accent, 0.25 + glow * 0.45)})`,
      }}
    >
      <polygon points={poly([top, ur, c, ul])} fill={cubeColors.top} {...stroke} />
      <polygon points={poly([c, bot, ll, ul])} fill={cubeColors.left} {...stroke} />
      <polygon points={poly([c, ur, lr, bot])} fill={cubeColors.right} {...stroke} />
    </svg>
  );
};
