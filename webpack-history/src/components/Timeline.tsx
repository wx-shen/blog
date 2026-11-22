import React from 'react';
import { interpolate, interpolateColors } from 'remotion';
import { colors, fonts, layout, space, timelineRange, video } from '../theme';

type Props = {
  /** 连续年份值（如 2013.4），当前年份始终居中 */
  year: number;
  /** 0 → 1：从底部升起 */
  visibility?: number;
};

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const Timeline: React.FC<Props> = ({ year, visibility = 1 }) => {
  const years: number[] = [];
  for (let y = timelineRange.from; y <= timelineRange.to; y++) {
    years.push(y);
  }
  const centerX = video.width / 2;
  const offsetX = centerX - (year - timelineRange.from) * layout.yearSpacing;
  const baselineY = 26;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: layout.timelineTop,
        width: video.width,
        height: layout.timelineHeight,
        opacity: visibility,
        transform: `translateY(${(1 - visibility) * 140}px)`,
        // 两侧在安全边距内渐隐
        maskImage: `linear-gradient(90deg, transparent 0, #000 ${space.safe * 2}px, #000 ${video.width - space.safe * 2}px, transparent ${video.width}px)`,
        WebkitMaskImage: `linear-gradient(90deg, transparent 0, #000 ${space.safe * 2}px, #000 ${video.width - space.safe * 2}px, transparent ${video.width}px)`,
      }}
    >
      {/* 基线 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: baselineY,
          height: 2,
          background: colors.panelBorder,
        }}
      />
      {/* 中央指示 */}
      <div
        style={{
          position: 'absolute',
          left: centerX - 7,
          top: baselineY - 6,
          width: 14,
          height: 14,
          borderRadius: 7,
          background: colors.accent,
          boxShadow: `0 0 18px ${colors.accent}`,
        }}
      />
      <div style={{ position: 'absolute', left: 0, top: 0, transform: `translateX(${offsetX}px)` }}>
        {years.map((y) => {
          const d = Math.abs(y - year);
          const hl = interpolate(d, [0, 0.8], [1, 0], clamp);
          const color = interpolateColors(hl, [0, 1], [colors.textFaint, colors.accent]);
          const x = (y - timelineRange.from) * layout.yearSpacing;
          return (
            <React.Fragment key={y}>
              {/* 季度小刻度 */}
              {y < timelineRange.to
                ? [1, 2, 3].map((q) => (
                    <div
                      key={q}
                      style={{
                        position: 'absolute',
                        left: x + (q * layout.yearSpacing) / 4 - 1,
                        top: baselineY - 4,
                        width: 2,
                        height: 10,
                        background: colors.textFaint,
                        opacity: 0.5,
                      }}
                    />
                  ))
                : null}
              <div
                style={{
                  position: 'absolute',
                  left: x - 1,
                  top: baselineY - 10 - hl * 4,
                  width: 2,
                  height: 22 + hl * 8,
                  background: color,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: x - 60,
                  width: 120,
                  top: baselineY + 18,
                  textAlign: 'center',
                  fontFamily: fonts.mono,
                  fontSize: 22,
                  fontWeight: hl > 0.5 ? 700 : 400,
                  color,
                  transform: `scale(${1 + hl * 0.3})`,
                  transformOrigin: 'center top',
                }}
              >
                {y}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
