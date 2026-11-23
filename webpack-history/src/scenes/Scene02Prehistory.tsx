import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { CodeBlock } from '../components/CodeBlock';
import { Pill } from '../components/Pill';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { ToolBadge } from '../components/ToolBadge';
import { enterExitStyle, exitProgress, moveProgress, rangeProgress } from '../lib/anim';
import { cue } from '../lib/cues';
import { scene02 } from '../scenes';
import { fontSize, layout, space, toolColors, transition, video } from '../theme';

const COPY = scene02.copy;
const CJS = COPY.commonjs;

const LINES = COPY.scripts.map((s) => `<script src="${s}"></script>`);

const at = (phrase: string, offset = 0) => cue(scene02.id, phrase, offset);

/**
 * 每行出现的帧：间隔逐渐缩短，制造"失控"感；整体缩放到「脚本按顺序加载」之前堆满并溢出。
 * 单行入场 12 帧（motion.lineEnterFrames），同时运动的行不超过 2 行。
 */
const LINE_FRAMES = (() => {
  const raw: number[] = [];
  let f = 0;
  for (let i = 0; i < LINES.length; i++) {
    raw.push(f);
    f += Math.max(6, 16 - i * 0.8);
  }
  const first = 20;
  const last = Math.max(first + 90, at('脚本按顺序加载', -30));
  const k = (last - first) / raw[raw.length - 1];
  return raw.map((x) => Math.round(first + x * k));
})();

const LAST_LINE = LINE_FRAMES[LINE_FRAMES.length - 1];

// 本幕时间表（帧，相对内容起点），按旁白对齐：
// ① script 标签之痛（三条痛点随旁白逐条出现）→ ② Node.js 与 CommonJS → ③ 三个工具（随时间轴年份登场）→ ④ 各管一段
const T = {
  warnStart: LAST_LINE + 6,
  warnEnd: LAST_LINE + 30,
  pains: [at('脚本按顺序加载'), at('所有变量都挂在全局'), at('文件越多，请求也越多')],
  collapse: at('2009 年，Node.js', -36),
  collapseFrames: 30,
  // ② CommonJS
  nodePanel: at('2009 年，Node.js'),
  browserPanel: at('2009 年，Node.js', 30),
  nodeResult: at('一个文件就是一个模块'),
  browserResult: at('可是，浏览器并不认识'),
  cjsOut: at('社区开始各自寻找出路'),
  // ③ 工具：时间轴先滑到该工具的年份（scenes.ts 的 yearStops，同样按旁白取帧），徽章随后登场，下方轮流演示
  demoDelay: 30,
  demosOut: at('加载、打包、构建，各管一段', -14),
  // ④ 收尾：徽章留作背景，标出各自的分工，再给出结论
  categories: at('加载、打包、构建，各管一段'),
  categoryStep: 24,
  conclusion: at('还没有人把这些问题'),
} as const;

const CODE_WIDTH = 980;
const CONTENT_WIDTH = video.width - space.safe * 2;
const BADGE_WIDTH = 500;
const BADGE_GAP = (CONTENT_WIDTH - BADGE_WIDTH * 3) / 2;
const PANEL_WIDTH = (CONTENT_WIDTH - space.xl) / 2;
const DEMO_TOP = layout.contentTop + 210;

/** 徽章登场帧：等时间轴滑到该工具的首发年份 */
const badgeAt = (i: number) => {
  const stop = scene02.yearStops.find((s) => s.year === COPY.tools[i].year);
  return (stop ? stop.atFrame : scene02.yearStops[0].atFrame) + transition.timelineSlide;
};

export const Scene02Prehistory: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const warning = rangeProgress(frame, T.warnStart, T.warnEnd);
  const collapse = moveProgress(frame, fps, T.collapse, T.collapseFrames);
  const painsOut = exitProgress(frame, T.collapse);
  // 当前讲到第几个工具
  const active = COPY.tools.reduce((acc, _, i) => (frame >= badgeAt(i) ? i : acc), -1);

  return (
    <AbsoluteFill>
      <SceneTitle title={scene02.title} years={scene02.yearsLabel} />

      {/* ① script 标签不断堆叠，溢出屏幕后变为警示色，然后收拢 */}
      {collapse < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: space.safe,
            top: layout.contentTop,
            transform: `scaleY(${1 - collapse})`,
            transformOrigin: 'top center',
            opacity: 1 - collapse,
          }}
        >
          <CodeBlock
            filename={COPY.codeFilename}
            lines={LINES}
            lineStartFrames={LINE_FRAMES}
            warning={warning}
            width={CODE_WIDTH}
            fontSize={fontSize.code}
          />
        </div>
      ) : null}

      {painsOut > 0 && COPY.pains.length > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: layout.columnRight,
            top: layout.contentTop + space.xxl,
            width: video.width - layout.columnRight - space.safe,
            display: 'flex',
            flexDirection: 'column',
            gap: space.lg,
            opacity: painsOut,
          }}
        >
          {COPY.pains.map((p, i) => (
            <Caption key={p} delay={T.pains[i]} size="body" tone="warning">
              <span style={{ marginRight: space.sm }}>×</span>
              {p}
            </Caption>
          ))}
        </div>
      ) : null}

      {/* ② Node.js 与 CommonJS：同一行 require，两种结局 */}
      {frame >= T.nodePanel && frame < T.cjsOut + 14 ? (
        <>
          <div style={{ position: 'absolute', left: space.safe, top: layout.contentTop + 60, ...enterExitStyle(frame, fps, T.nodePanel, T.cjsOut) }}>
            <CodeBlock filename={CJS.nodeLabel} lines={CJS.code} width={PANEL_WIDTH} />
            <Caption delay={T.nodeResult} exitAt={T.cjsOut} size="note" tone="success" style={{ marginTop: space.md }}>
              {CJS.nodeResult}
            </Caption>
          </div>
          <div
            style={{
              position: 'absolute',
              left: space.safe + PANEL_WIDTH + space.xl,
              top: layout.contentTop + 60,
              ...enterExitStyle(frame, fps, T.browserPanel, T.cjsOut),
            }}
          >
            <CodeBlock
              filename={CJS.browserLabel}
              lines={CJS.code}
              width={PANEL_WIDTH}
              warning={rangeProgress(frame, T.browserResult, T.browserResult + 16)}
            />
            <Caption delay={T.browserResult} exitAt={T.cjsOut} size="note" tone="warning" style={{ marginTop: space.md }}>
              {CJS.browserResult}
            </Caption>
          </div>
        </>
      ) : null}

      {/* ③ 社区的三种出路：徽章一字排开，下方轮流演示 */}
      {frame >= badgeAt(0) ? (
        <AbsoluteFill>
          <div style={{ position: 'absolute', left: space.safe, top: layout.contentTop, display: 'flex', gap: BADGE_GAP }}>
            {COPY.tools.map((t, i) => (
              <ToolBadge
                key={t.name}
                name={t.name}
                color={toolColors[t.tool]}
                description={t.description}
                delay={badgeAt(i)}
                width={BADGE_WIDTH}
                dim={i < active && frame < T.categories ? rangeProgress(frame, badgeAt(active), badgeAt(active) + 12) : 0}
              />
            ))}
          </div>
          {/* ④ 收尾：在每个徽章下标出它负责的一段 */}
          <div style={{ position: 'absolute', left: space.safe, top: layout.contentTop + 215, display: 'flex', gap: BADGE_GAP }}>
            {COPY.tools.map((t, i) => (
              <div key={t.name} style={{ width: BADGE_WIDTH, display: 'flex' }}>
                {frame >= T.categories ? <Pill text={t.category} delay={T.categories + i * T.categoryStep} size="note" color={toolColors[t.tool]} /> : null}
              </div>
            ))}
          </div>
          {COPY.tools.map((t, i) => {
            const start = badgeAt(i) + T.demoDelay;
            const end = i + 1 < COPY.tools.length ? badgeAt(i + 1) - 12 : T.demosOut;
            if (frame < start || (end !== null && frame > end + 12)) return null;
            return (
              <div
                key={t.name}
                style={{ position: 'absolute', left: space.safe, top: DEMO_TOP, ...enterExitStyle(frame, fps, start, end) }}
              >
                <CodeBlock filename={t.demo.filename} lines={t.demo.lines} width={CONTENT_WIDTH} fontSize={fontSize.code - 2} />
              </div>
            );
          })}
        </AbsoluteFill>
      ) : null}

      {/* ④ 各管一段 */}
      {COPY.conclusion ? (
        <Caption
          delay={T.conclusion}
          size="body"
          tone="normal"
          weight="bold"
          style={{ position: 'absolute', left: space.safe, top: layout.contentTop + 340, width: CONTENT_WIDTH }}
        >
          {COPY.conclusion}
        </Caption>
      ) : null}
    </AbsoluteFill>
  );
};
