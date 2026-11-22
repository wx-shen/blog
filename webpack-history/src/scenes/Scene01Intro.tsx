import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import type { SceneProps } from '../components/SceneShell';
import { Terminal, type TerminalLine } from '../components/Terminal';
import { enterProgress, enterStyle, moveProgress } from '../lib/anim';
import { colors, fonts, fontSize, fontWeight, motion, video } from '../theme';

const COMMAND = 'npm run build';

// 本幕时间表（帧）
const T = {
  terminalIn: 0,
  typeStart: 18,
  progressStart: 62,
  progressEnd: 150,
  logStart: 156,
  logStep: 12,
  shrink: 262,
  title: 296,
  subtitle: 326,
} as const;

const LOGS: readonly Omit<TerminalLine, 'at'>[] = [
  { text: '> my-app@1.0.0 build', tone: 'dim' },
  { text: 'asset main.3f9a1c.js 142 KiB [emitted] [minimized] (name: main)' },
  { text: 'asset vendors.8b21e0.js 318 KiB [emitted] [minimized] (id hint: vendors)' },
  { text: 'orphan modules 3.1 KiB [orphan] 12 modules' },
  { text: './src/index.js + 386 modules 1.2 MiB [built] [code generated]', tone: 'dim' },
  { text: 'webpack compiled successfully in 2318 ms', tone: 'success' },
];

const TERM_W = 1180;
const TERM_H = 600;

export const Scene01Intro: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = enterProgress(frame, fps, T.terminalIn);
  const shrink = moveProgress(frame, fps, T.shrink);
  const scale = interpolate(shrink, [0, 1], [1, 0.56]);
  // 终端中心从画面中央上移到 y≈330
  const centerY = interpolate(shrink, [0, 1], [video.height / 2, 330]);

  const lines: TerminalLine[] = LOGS.map((l, i) => ({ ...l, at: T.logStart + i * T.logStep }));

  const titleP = enterProgress(frame, fps, T.title);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: (video.width - TERM_W) / 2,
          top: centerY - TERM_H / 2,
          transformOrigin: 'center center',
          opacity: appear,
          // 入场位移与缩放合并到同一个 transform 中
          transform: `translateY(${(1 - appear) * motion.enterOffset}px) scale(${scale})`,
        }}
      >
        <Terminal
          command={COMMAND}
          typeStart={T.typeStart}
          progress={{ start: T.progressStart, end: T.progressEnd, label: 'building' }}
          lines={lines}
          width={TERM_W}
          height={TERM_H}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 640,
          width: '100%',
          textAlign: 'center',
          ...enterStyle(titleP),
        }}
      >
        <div
          style={{
            fontFamily: fonts.sans,
            fontSize: fontSize.title,
            fontWeight: fontWeight.bold,
            color: colors.text,
            letterSpacing: 4,
          }}
        >
          <span style={{ color: colors.accent }}>webpack</span> 发展史
        </div>
      </div>
      <Caption
        delay={T.subtitle}
        size="note"
        tone="dim"
        style={{ position: 'absolute', top: 750, width: '100%', textAlign: 'center', letterSpacing: 2 }}
      >
        从 script 标签到模块打包器 · <span style={{ fontFamily: fonts.mono }}>2009 – 2026</span>
      </Caption>
    </AbsoluteFill>
  );
};
