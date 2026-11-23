import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { CodeBlock } from '../components/CodeBlock';
import { CostBeat } from '../components/CostBeat';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { ToolBadge } from '../components/ToolBadge';
import { enterProgress, enterStyle, exitProgress, rangeProgress } from '../lib/anim';
import { costCue, cue } from '../lib/cues';
import { scene06, thread } from '../scenes';
import { alpha, colors, fonts, fontSize, fontWeight, layout, lineHeight, space, toolColors, video } from '../theme';

const COPY = scene06.copy;
const W = COPY.wrappers;

// ───────────── 时间表（帧，相对内容起点） ─────────────
// 按旁白对齐：① 配置越写越长 +「webpack 配置工程师」 → ② 把配置藏进框架（框架名随旁白逐个出现）→ 代价
const at = (phrase: string, offset = 0) => cue(scene06.id, phrase, offset);
const codeOut = at('解决的办法，是把配置藏起来', -22);
const T = {
  codeIn: 10,
  scrollStart: 30,
  scrollEnd: codeOut - 30,
  meme: at('配置复杂到仿佛需要专人维护'),
  memeNote: at('配置复杂到仿佛需要专人维护', 36),
  codeOut,
  // ② 上层封装：自下而上搭起三层
  bottom: at('解决的办法，是把配置藏起来'),
  /** create-react-app、Vue CLI、Next.js 各自在旁白念到时出现 */
  frameworks: [at('create-react-app'), at('Vue CLI'), at('Next.js')],
  top: at('让大多数开发者'),
  caption: at('让大多数开发者', 60),
} as const;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// ───────────── 配置滚动 ─────────────
const CODE_SIZE = fontSize.code - 4;
const CODE_LH = Math.round(CODE_SIZE * lineHeight.code);
const VISIBLE_LINES = 12;
const CODE_WIDTH = 1040;
/** 滚过的总行数：越滚越快（幂函数） */
const SCROLL_LINES = 320;
const SCROLL_POWER = 2.6;
const CONFIG_LINES = Array.from(
  { length: SCROLL_LINES + VISIBLE_LINES + 2 },
  (_, i) => COPY.configTemplate[i % COPY.configTemplate.length],
);

// ───────────── 分层示意 ─────────────
const STACK = { width: 1500, rowH: 96, gap: 40 } as const;
const STACK_LEFT = (video.width - STACK.width) / 2;
const ROW_TOP = [layout.contentTop + 40, layout.contentTop + 40 + STACK.rowH + STACK.gap, layout.contentTop + 40 + (STACK.rowH + STACK.gap) * 2];

const Layer: React.FC<{ text: string; top: number; at: number; tone: 'accent' | 'warning'; dim?: number }> = ({
  text,
  top,
  at,
  tone,
  dim = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = tone === 'warning' ? colors.warning : colors.accent;
  return (
    <div
      style={{
        position: 'absolute',
        left: STACK_LEFT,
        top,
        width: STACK.width,
        height: STACK.rowH,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        background: alpha(color, 0.08),
        border: `2px dashed ${alpha(color, 0.6)}`,
        borderRadius: space.radius,
        fontFamily: fonts.sans,
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
        color,
        ...enterStyle(enterProgress(frame, fps, at)),
        opacity: enterProgress(frame, fps, at) * (1 - dim * 0.55),
      }}
    >
      {text}
    </div>
  );
};

export const Scene06ConfigPain: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── ① 配置越滚越快 ──
  const s = rangeProgress(frame, T.scrollStart, T.scrollEnd);
  const scrolledLines = SCROLL_LINES * Math.pow(s, SCROLL_POWER);
  const pain = interpolate(s, [0.2, 1], [0, 1], clamp);
  const codeP = enterProgress(frame, fps, T.codeIn);
  const codeOut = exitProgress(frame, T.codeOut);

  // ── ② 框架盖住 webpack 配置后，配置层退为背景 ──
  const covered = rangeProgress(frame, T.top, T.top + 20);
  const fwWidth = (STACK.width - space.lg * (W.frameworks.length - 1)) / W.frameworks.length;

  return (
    <AbsoluteFill>
      {/* 背景略微变为警示色 */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 40% 50%, ${alpha(colors.warning, 0.1 * pain)} 0%, ${alpha(colors.warning, 0.04 * pain)} 60%, ${alpha(colors.warning, 0)} 100%)`,
          opacity: codeOut,
        }}
      />

      <SceneTitle title={scene06.title} years={scene06.yearsLabel} />

      {codeOut > 0 ? (
        <>
          <div style={{ position: 'absolute', left: space.safe, top: layout.contentTop, ...enterStyle(codeP), opacity: codeP * codeOut }}>
            <CodeBlock
              filename={COPY.configFilename}
              lines={CONFIG_LINES}
              width={CODE_WIDTH}
              fontSize={CODE_SIZE}
              bodyHeight={VISIBLE_LINES * CODE_LH + space.md * 2}
              scrollTop={scrolledLines * CODE_LH}
              warning={pain * 0.6}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              left: space.safe + CODE_WIDTH + space.xl,
              top: layout.contentTop + 140,
              width: video.width - space.safe * 2 - CODE_WIDTH - space.xl,
            }}
          >
            <Caption delay={T.meme} exitAt={T.codeOut} size="body" tone="warning" weight="bold">
              {COPY.meme}
            </Caption>
            <Caption delay={T.memeNote} exitAt={T.codeOut} size="note" tone="dim" style={{ marginTop: space.md }}>
              {COPY.memeNote}
            </Caption>
          </div>
        </>
      ) : null}

      {/* ② 把配置藏进框架：开发者 → 框架 → webpack 配置 */}
      {frame >= T.bottom ? (
        <>
          <Layer text={W.layerBottom} top={ROW_TOP[2]} at={T.bottom} tone="warning" dim={covered} />
          <div style={{ position: 'absolute', left: STACK_LEFT, top: ROW_TOP[1], display: 'flex', gap: space.lg }}>
            {W.frameworks.map((f, i) => (
              <ToolBadge
                key={f.name}
                name={f.name}
                color={toolColors[f.tool]}
                delay={T.frameworks[i]}
                width={fwWidth}
              />
            ))}
          </div>
          <Layer text={W.layerTop} top={ROW_TOP[0]} at={T.top} tone="accent" />
          <Caption
            delay={T.caption}
            size="note"
            tone="dim"
            style={{ position: 'absolute', left: STACK_LEFT, top: ROW_TOP[2] + STACK.rowH + space.lg }}
          >
            {W.caption}
          </Caption>
        </>
      ) : null}

      <CostBeat at={costCue(scene06.id, '问题并没有消失', duration)} label={thread.costLabel} text={COPY.cost.text} notes={COPY.cost.notes} />
    </AbsoluteFill>
  );
};
