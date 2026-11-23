import React from 'react';
import { colors, fonts, fontSize, fontWeight, layout, motion, space } from '../theme';

type Props = {
  /** 连续年份值（如 2018.6），像里程表一样逐年滚动 */
  year: number;
  visibility?: number;
};

const LINE = 1.1;
const DIGITS = 4;

/**
 * 里程表式数位：个位随年份连续滚动；高位只在低位从 9 进到 0 的那一年内进位，
 * 因此 2018 → 2020 会依次经过 2019，不会出现各位独立滚动造成的错乱数字。
 */
const digitValue = (year: number, k: number): number => {
  const p = 10 ** k;
  if (k === 0) {
    return ((year % 10) + 10) % 10;
  }
  const base = Math.floor(year / p) % 10;
  const rem = ((year % p) + p) % p;
  const carry = Math.max(0, rem - (p - 1));
  return base + carry;
};

/** 单个数位：竖排 0–9 再接一个 0，便于 9 → 0 的进位滚动 */
const Digit: React.FC<{ value: number }> = ({ value }) => {
  const h = fontSize.year * LINE;
  return (
    <div style={{ height: h, overflow: 'hidden', position: 'relative', width: '0.6em' }}>
      <div style={{ transform: `translateY(${-value * h}px)` }}>
        {Array.from({ length: 11 }, (_, d) => (
          <div key={d} style={{ height: h, lineHeight: `${h}px`, textAlign: 'center' }}>
            {d % 10}
          </div>
        ))}
      </div>
    </div>
  );
};

export const YearCounter: React.FC<Props> = ({ year, visibility = 1 }) => {
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
        transform: `translateY(${(1 - visibility) * motion.enterOffset}px)`,
        // 上下边缘渐隐，滚动更柔和
        maskImage: 'linear-gradient(180deg, transparent 0, #000 18%, #000 82%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 18%, #000 82%, transparent 100%)',
      }}
    >
      {Array.from({ length: DIGITS }, (_, i) => (
        <Digit key={i} value={digitValue(year, DIGITS - 1 - i)} />
      ))}
    </div>
  );
};
