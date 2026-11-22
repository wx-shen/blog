import React from 'react';
import { colors, fonts, fontSize, fontWeight, layout, space } from '../theme';

type Props = {
  from: number;
  to: number;
  /** 0 → 1：数字从 from 滚动到 to */
  progress: number;
  visibility?: number;
};

const LINE = 1.1;

/** 单个数位：竖排 0–9，按进度滚动 */
const Digit: React.FC<{ from: number; to: number; progress: number }> = ({ from, to, progress }) => {
  const h = fontSize.year * LINE;
  const value = from + (to - from) * progress;
  return (
    <div style={{ height: h, overflow: 'hidden', position: 'relative', width: '0.6em' }}>
      <div style={{ transform: `translateY(${-value * h}px)` }}>
        {Array.from({ length: 10 }, (_, d) => (
          <div key={d} style={{ height: h, lineHeight: `${h}px`, textAlign: 'center' }}>
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};

export const YearCounter: React.FC<Props> = ({ from, to, progress, visibility = 1 }) => {
  const a = String(from).padStart(4, '0').split('').map(Number);
  const b = String(to).padStart(4, '0').split('').map(Number);
  return (
    <div
      style={{
        position: 'absolute',
        left: space.safe,
        top: layout.headerTop,
        display: 'flex',
        fontFamily: fonts.mono,
        fontSize: fontSize.year,
        fontWeight: fontWeight.bold,
        color: colors.accent,
        letterSpacing: -2,
        opacity: visibility,
        transform: `translateY(${(1 - visibility) * 30}px)`,
        // 上下边缘渐隐，滚动更柔和
        maskImage: 'linear-gradient(180deg, transparent 0, #000 18%, #000 82%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 18%, #000 82%, transparent 100%)',
      }}
    >
      {a.map((d, i) => (
        <Digit key={i} from={d} to={b[i]} progress={progress} />
      ))}
    </div>
  );
};
