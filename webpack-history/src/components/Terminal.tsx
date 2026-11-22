import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { colors, fonts, motion, space } from '../theme';

export type TerminalLine = {
  text: string;
  /** 出现的帧（相对当前 Sequence） */
  at: number;
  tone?: 'normal' | 'dim' | 'success' | 'accent' | 'warning';
};

type Props = {
  command: string;
  /** 开始打字的帧 */
  typeStart?: number;
  /** 进度条：起止帧；省略则不显示 */
  progress?: { start: number; end: number; label?: string };
  lines?: readonly TerminalLine[];
  width?: number;
  height?: number;
  title?: string;
  style?: React.CSSProperties;
};

const toneColor = (tone: TerminalLine['tone']): string => {
  switch (tone) {
    case 'dim':
      return colors.textDim;
    case 'success':
      return colors.success;
    case 'accent':
      return colors.accent;
    case 'warning':
      return colors.warning;
    default:
      return colors.text;
  }
};

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const Terminal: React.FC<Props> = ({
  command,
  typeStart = 0,
  progress,
  lines = [],
  width = 1100,
  height = 560,
  title = 'zsh — ~/my-app',
  style,
}) => {
  const frame = useCurrentFrame();
  const typed = Math.max(0, Math.floor((frame - typeStart) / motion.typeFramesPerChar));
  const shown = command.slice(0, typed);
  const typingDone = typed >= command.length;
  const doneFrame = typeStart + command.length * motion.typeFramesPerChar;
  // 打字时光标常亮，空闲时闪烁；命令开始执行后光标消失
  const executing = progress ? frame >= progress.start : frame > doneFrame + 10;
  const blinkOn = Math.floor(frame / (motion.cursorBlinkFrames / 2)) % 2 === 0;
  const cursorVisible = !executing && (!typingDone || blinkOn);

  const pct = progress
    ? interpolate(frame, [progress.start, progress.end], [0, 100], {
        ...clamp,
        easing: (t) => 1 - Math.pow(1 - t, 2),
      })
    : 0;

  return (
    <div
      style={{
        width,
        height,
        background: 'rgba(8, 12, 26, 0.96)',
        border: `2px solid ${colors.panelBorder}`,
        borderRadius: space.radius,
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
        ...style,
      }}
    >
      <div
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: `0 ${space.md}px`,
          borderBottom: `1px solid ${colors.panelBorder}`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: colors.textFaint }} />
        ))}
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: fonts.mono,
            fontSize: 20,
            color: colors.textDim,
            marginRight: 60,
          }}
        >
          {title}
        </div>
      </div>
      <div style={{ padding: `${space.lg}px ${space.lg}px`, fontFamily: fonts.mono, fontSize: 30, lineHeight: 1.7 }}>
        <div style={{ color: colors.text, whiteSpace: 'pre' }}>
          <span style={{ color: colors.accent }}>$ </span>
          {shown}
          <span
            style={{
              display: 'inline-block',
              width: 16,
              height: 34,
              marginLeft: 2,
              verticalAlign: 'middle',
              background: colors.accent,
              opacity: cursorVisible ? 0.9 : 0,
            }}
          />
        </div>
        {progress && frame >= progress.start ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 8 }}>
            <div style={{ color: colors.textDim, fontSize: 24, width: 150 }}>{progress.label ?? 'building'}</div>
            <div
              style={{
                flex: 1,
                height: 14,
                borderRadius: 7,
                background: 'rgba(141,214,249,0.12)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${colors.secondary}, ${colors.accent})`,
                }}
              />
            </div>
            <div style={{ color: pct >= 100 ? colors.success : colors.text, fontSize: 24, width: 80, textAlign: 'right' }}>
              {Math.floor(pct)}%
            </div>
          </div>
        ) : null}
        <div style={{ marginTop: 12 }}>
          {lines.map((l, i) =>
            frame >= l.at ? (
              <div
                key={i}
                style={{
                  color: toneColor(l.tone),
                  fontSize: 24,
                  whiteSpace: 'pre',
                  opacity: interpolate(frame, [l.at, l.at + 6], [0, 1], clamp),
                }}
              >
                {l.text}
              </div>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
};
