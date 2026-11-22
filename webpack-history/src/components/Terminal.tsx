import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { alpha, colors, fonts, fontSize, layout, lineHeight, motion, space } from '../theme';

export type TerminalTone = 'normal' | 'dim' | 'success' | 'accent' | 'warning';

export type TerminalLine = {
  text: string;
  /** 出现的帧（相对当前 Sequence） */
  at: number;
  tone?: TerminalTone;
};

type Props = {
  /** 窗口标题栏文字 */
  title: string;
  command: string;
  /** 开始打字的帧 */
  typeStart?: number;
  /** 进度条：起止帧与标签；省略则不显示 */
  progress?: { start: number; end: number; label: string };
  lines?: readonly TerminalLine[];
  width?: number;
  height?: number;
  style?: React.CSSProperties;
};

const toneColor: Record<TerminalTone, string> = {
  normal: colors.text,
  dim: colors.textDim,
  success: colors.success,
  accent: colors.accent,
  warning: colors.warning,
};

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 终端窗口：打字机 → 进度条 → 日志逐行出现 */
export const Terminal: React.FC<Props> = ({
  title,
  command,
  typeStart = 0,
  progress,
  lines = [],
  width = layout.terminal.width,
  height = layout.terminal.height,
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

  const dot = space.sm - 2;

  return (
    <div
      style={{
        width,
        height,
        background: colors.terminalBg,
        border: `2px solid ${colors.panelBorder}`,
        borderRadius: space.radius,
        overflow: 'hidden',
        boxShadow: `0 30px 80px ${colors.shadow}`,
        ...style,
      }}
    >
      <div
        style={{
          height: layout.terminal.headerHeight,
          display: 'flex',
          alignItems: 'center',
          gap: space.xs + 2,
          padding: `0 ${space.md}px`,
          borderBottom: `1px solid ${colors.panelBorder}`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: dot, height: dot, borderRadius: dot / 2, background: colors.textFaint }} />
        ))}
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: fonts.mono,
            fontSize: fontSize.small - 2,
            color: colors.textDim,
            marginRight: space.xl,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          padding: space.lg,
          fontFamily: fonts.mono,
          fontSize: fontSize.terminal,
          lineHeight: lineHeight.terminal,
        }}
      >
        <div style={{ color: colors.text, whiteSpace: 'pre' }}>
          <span style={{ color: colors.accent }}>$ </span>
          {shown}
          <span
            style={{
              display: 'inline-block',
              width: fontSize.terminal * 0.55,
              height: fontSize.terminal * 1.15,
              marginLeft: 2,
              verticalAlign: 'middle',
              background: colors.accent,
              opacity: cursorVisible ? 0.9 : 0,
            }}
          />
        </div>
        {progress && frame >= progress.start ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: space.md, marginTop: space.xs }}>
            <div style={{ color: colors.textDim, fontSize: fontSize.terminalLog, width: 150 }}>{progress.label}</div>
            <div
              style={{
                flex: 1,
                height: 14,
                borderRadius: 7,
                background: alpha(colors.accent, 0.12),
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
            <div
              style={{
                color: pct >= 100 ? colors.success : colors.text,
                fontSize: fontSize.terminalLog,
                width: 80,
                textAlign: 'right',
              }}
            >
              {Math.floor(pct)}%
            </div>
          </div>
        ) : null}
        <div style={{ marginTop: space.sm - 4 }}>
          {lines.map((l, i) =>
            frame >= l.at ? (
              <div
                key={i}
                style={{
                  color: toneColor[l.tone ?? 'normal'],
                  fontSize: fontSize.terminalLog,
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
