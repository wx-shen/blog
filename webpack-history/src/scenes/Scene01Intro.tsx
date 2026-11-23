import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import type { SceneProps } from '../components/SceneShell';
import { Terminal, type TerminalLine } from '../components/Terminal';
import { enterProgress, enterStyle, moveProgress } from '../lib/anim';
import { cue } from '../lib/cues';
import { scene01 } from '../scenes';
import { colors, fonts, fontSize, fontWeight, layout, motion, space, video } from '../theme';

const COPY = scene01.copy;

// 本幕时间表（帧，相对内容起点），按旁白对齐（cue 取自 narrationTimings.json）：
// 念「npm run build」时打字 →「几秒钟后」进度条与日志 →「这件事看起来理所当然」终端缩小 →「今天」标题
const at = (phrase: string, offset = 0) => cue(scene01.id, phrase, offset);
const progressStart = at('几秒钟后');
const T = {
  terminalIn: 0,
  typeStart: 12,
  progressStart,
  progressEnd: progressStart + 100,
  logStart: progressStart + 108,
  logStep: 14,
  shrink: Math.max(at('这件事看起来理所当然', 30), progressStart + 200),
  title: at('今天，我们来讲讲'),
  subtitle: at('今天，我们来讲讲', 34),
} as const;

/** 终端缩小后的比例与中心位置 */
const SHRUNK = { scale: 0.56, centerY: 340 } as const;
const TITLE_TOP = 640;

export const Scene01Intro: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width: termW, height: termH } = layout.terminal;

  const appear = enterProgress(frame, fps, T.terminalIn);
  const shrink = moveProgress(frame, fps, T.shrink);
  const scale = interpolate(shrink, [0, 1], [1, SHRUNK.scale]);
  const centerY = interpolate(shrink, [0, 1], [video.height / 2, SHRUNK.centerY]);

  const lines: TerminalLine[] = COPY.logs.map((l, i) => ({ ...l, at: T.logStart + i * T.logStep }));
  const titleP = enterProgress(frame, fps, T.title);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: (video.width - termW) / 2,
          top: centerY - termH / 2,
          transformOrigin: 'center center',
          opacity: appear,
          // 入场位移与缩放合并到同一个 transform 中
          transform: `translateY(${(1 - appear) * motion.enterOffset}px) scale(${scale})`,
        }}
      >
        <Terminal
          title={COPY.terminalTitle}
          command={COPY.command}
          typeStart={T.typeStart}
          progress={{ start: T.progressStart, end: T.progressEnd, label: COPY.progressLabel }}
          lines={lines}
        />
      </div>

      <div style={{ position: 'absolute', top: TITLE_TOP, width: '100%', textAlign: 'center', ...enterStyle(titleP) }}>
        <div
          style={{
            fontFamily: fonts.sans,
            fontSize: fontSize.title,
            fontWeight: fontWeight.bold,
            color: colors.text,
            letterSpacing: 4,
          }}
        >
          <span style={{ color: colors.accent }}>{COPY.titleAccent}</span>
          {COPY.titleRest}
        </div>
      </div>
      {COPY.subtitle ? (
        <Caption
          delay={T.subtitle}
          size="note"
          tone="dim"
          style={{
            position: 'absolute',
            top: TITLE_TOP + fontSize.title * 1.5,
            width: '100%',
            textAlign: 'center',
            letterSpacing: 2,
          }}
        >
          {COPY.subtitle}
          <span style={{ margin: `0 ${space.sm}px`, color: colors.textFaint }}>·</span>
          <span style={{ fontFamily: fonts.mono }}>{COPY.subtitleYears}</span>
        </Caption>
      ) : null}
    </AbsoluteFill>
  );
};
