import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { CodeBlock } from '../components/CodeBlock';
import { CostBeat } from '../components/CostBeat';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { enterProgress, enterStyle, exitProgress, rangeProgress } from '../lib/anim';
import { curvePath, horizontalCurve } from '../lib/geometry';
import { scene04, thread } from '../scenes';
import { alpha, colors, fileColors, fonts, fontSize, fontWeight, layout, motion, space, transition, video } from '../theme';

const COPY = scene04.copy;
const GRAPH = COPY.graph;
const HMR = COPY.hmr;

// ───────────── 时间表（帧，相对内容起点） ─────────────
const T = {
  /** 每一层开始生长的帧（第 0 层只有入口节点） */
  layers: [20, 70, 160, 260],
  /** 每层：先画连线，再逐个出现节点 */
  edgeDraw: 18,
  nodeDelay: 14,
  nodeStep: 12,
  graphCaption: 330,
  graphOut: 420,
  // 热更新演示
  hmrLabel: 444,
  code: 470,
  browser: 500,
  highlight: 560,
  editStart: 580,
  framesPerChar: 2,
  flash: 640,
  hmrCaption: 710,
} as const;

// ───────────── 依赖图布局 ─────────────
const NODE = layout.graphNode;
const LAYER_COUNT = T.layers.length;
const GRAPH_CENTER_Y = 525;
const ROW_GAP = 100;
const layerX = (layer: number) =>
  space.safe + (layer * (video.width - space.safe * 2 - NODE.width)) / (LAYER_COUNT - 1);

type NodeLayout = { id: string; x: number; y: number; order: number; layer: number };

const NODE_LAYOUT: Record<string, NodeLayout> = (() => {
  const result: Record<string, NodeLayout> = {};
  for (let layer = 0; layer < LAYER_COUNT; layer++) {
    const inLayer = GRAPH.nodes.filter((n) => n.layer === layer);
    inLayer.forEach((n, order) => {
      result[n.id] = {
        id: n.id,
        layer,
        order,
        x: layerX(layer),
        y: GRAPH_CENTER_Y + (order - (inLayer.length - 1) / 2) * ROW_GAP - NODE.height / 2,
      };
    });
  }
  return result;
})();

const nodeStart = (n: NodeLayout) =>
  n.layer === 0 ? T.layers[0] : T.layers[n.layer] + T.nodeDelay + n.order * T.nodeStep;

// ───────────── 热更新布局 ─────────────
const HMR_TOP = layout.contentTop + 80;
const CODE_WIDTH = 800;
const BROWSER = { left: 1000, width: video.width - space.safe - 1000, height: 420 } as const;

/** 模拟编辑：先删掉旧内容中不同的部分，再逐字敲入新内容 */
const editString = (before: string, after: string, steps: number): string => {
  let p = 0;
  while (p < before.length && p < after.length && before[p] === after[p]) p++;
  let s = 0;
  while (s < before.length - p && s < after.length - p && before[before.length - 1 - s] === after[after.length - 1 - s]) s++;
  const oldMid = before.slice(p, before.length - s);
  const newMid = after.slice(p, after.length - s);
  const head = before.slice(0, p);
  const tail = before.slice(before.length - s);
  if (steps <= oldMid.length) {
    return head + oldMid.slice(0, oldMid.length - steps) + tail;
  }
  return head + newMid.slice(0, Math.min(newMid.length, steps - oldMid.length)) + tail;
};

const GraphNode: React.FC<{ id: string; label: string; kind: keyof typeof fileColors }> = ({ id, label, kind }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = NODE_LAYOUT[id];
  const p = enterProgress(frame, fps, nodeStart(n));
  const isEntry = n.layer === 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: n.x,
        top: n.y,
        width: NODE.width,
        height: NODE.height,
        display: 'flex',
        alignItems: 'center',
        gap: space.sm,
        padding: `0 ${space.md}px`,
        boxSizing: 'border-box',
        background: isEntry ? alpha(colors.accent, 0.12) : colors.panel,
        border: `2px solid ${isEntry ? colors.accent : colors.panelBorder}`,
        borderRadius: space.radius,
        ...enterStyle(p),
      }}
    >
      <div style={{ width: 14, height: 14, borderRadius: 7, background: fileColors[kind], flexShrink: 0 }} />
      <div style={{ fontFamily: fonts.mono, fontSize: fontSize.small + 2, color: colors.text, whiteSpace: 'nowrap' }}>
        {label}
      </div>
      {isEntry ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: -fontSize.small * 1.6,
            fontFamily: fonts.mono,
            fontSize: fontSize.small,
            color: colors.accent,
          }}
        >
          {GRAPH.entryTag}
        </div>
      ) : null}
    </div>
  );
};

/** 模拟页面：只有页头区块会随代码改动而更新 */
const BrowserMock: React.FC<{ title: string; flash: number }> = ({ title, flash }) => {
  const block = (style: React.CSSProperties) => (
    <div style={{ background: alpha(colors.textFaint, 0.35), borderRadius: space.radiusSm, ...style }} />
  );
  const barH = layout.terminal.headerHeight;
  return (
    <div
      style={{
        width: BROWSER.width,
        height: BROWSER.height,
        background: colors.terminalBg,
        border: `2px solid ${colors.panelBorder}`,
        borderRadius: space.radius,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: barH,
          display: 'flex',
          alignItems: 'center',
          gap: space.sm,
          padding: `0 ${space.md}px`,
          borderBottom: `1px solid ${colors.panelBorder}`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: colors.textFaint }} />
        ))}
        <div
          style={{
            marginLeft: space.sm,
            flex: 1,
            padding: `4px ${space.sm}px`,
            borderRadius: space.radiusSm,
            background: alpha(colors.textFaint, 0.25),
            fontFamily: fonts.mono,
            fontSize: fontSize.small - 2,
            color: colors.textDim,
          }}
        >
          {HMR.pageUrl}
        </div>
      </div>
      <div style={{ padding: space.md, display: 'flex', flexDirection: 'column', gap: space.md }}>
        {/* 页头：唯一会更新的区块 */}
        <div
          style={{
            height: 76,
            display: 'flex',
            alignItems: 'center',
            padding: `0 ${space.md}px`,
            borderRadius: space.radiusSm,
            background: interpolateColors(flash, [0, 1], [alpha(colors.secondary, 0.25), alpha(colors.accent, 0.35)]),
            boxShadow: `0 0 0 ${3 * flash}px ${colors.accent}, 0 0 ${36 * flash}px ${alpha(colors.accent, 0.6 * flash)}`,
            fontFamily: fonts.sans,
            fontSize: fontSize.note + 4,
            fontWeight: fontWeight.bold,
            color: colors.text,
          }}
        >
          {title}
        </div>
        <div style={{ display: 'flex', gap: space.md, height: BROWSER.height - barH - 76 - space.md * 3 }}>
          <div style={{ width: 170, display: 'flex', flexDirection: 'column', gap: space.sm }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>{block({ height: 22, width: `${90 - i * 12}%` })}</div>
            ))}
          </div>
          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: space.md,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>{block({ height: '100%' })}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Scene04Rise: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── 依赖图 ──
  const graphOut = exitProgress(frame, T.graphOut);

  // ── 热更新 ──
  const codeP = enterProgress(frame, fps, T.code);
  const browserP = enterProgress(frame, fps, T.browser);
  const before = HMR.code[HMR.editLine];
  const steps = Math.max(0, Math.floor((frame - T.editStart) / T.framesPerChar));
  const editing = frame >= T.editStart ? editString(before, HMR.editedLine, steps) : before;
  const codeLines = HMR.code.map((l, i) => (i === HMR.editLine ? editing : l));
  const highlight = rangeProgress(frame, T.highlight, T.highlight + 14);
  const flash = interpolate(frame, [T.flash, T.flash + 12, T.flash + 60], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pageTitle = frame >= T.flash + 8 ? HMR.pageTitleAfter : HMR.pageTitleBefore;

  return (
    <AbsoluteFill>
      <SceneTitle title={scene04.title} years={scene04.yearsLabel} />

      {/* ① 依赖图：从入口逐层生长 */}
      {graphOut > 0 ? (
        <AbsoluteFill style={{ opacity: graphOut }}>
          <svg width={video.width} height={video.height} style={{ position: 'absolute', left: 0, top: 0 }}>
            {GRAPH.edges.map(([from, to]) => {
              const a = NODE_LAYOUT[from];
              const b = NODE_LAYOUT[to];
              const start = T.layers[b.layer];
              const p = rangeProgress(frame, start, start + T.edgeDraw);
              if (p <= 0) return null;
              const d = curvePath(
                horizontalCurve([a.x + NODE.width, a.y + NODE.height / 2], [b.x, b.y + NODE.height / 2]),
              );
              return (
                <path
                  key={`${from}-${to}`}
                  d={d}
                  fill="none"
                  stroke={alpha(colors.accent, 0.55)}
                  strokeWidth={2}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - p}
                />
              );
            })}
          </svg>
          {GRAPH.nodes.map((n) => (
            <GraphNode key={n.id} id={n.id} label={n.label} kind={n.kind} />
          ))}
          <Caption
            delay={T.graphCaption}
            size="note"
            tone="dim"
            style={{ position: 'absolute', left: space.safe, top: 790 }}
          >
            {COPY.graphCaption}
          </Caption>
        </AbsoluteFill>
      ) : null}

      {/* ② 热更新演示 */}
      {frame >= T.hmrLabel ? (
        <>
          <Caption
            delay={T.hmrLabel}
            size="body"
            tone="accent"
            weight="bold"
            style={{ position: 'absolute', left: space.safe, top: layout.contentTop }}
          >
            {COPY.hmrLabel}
          </Caption>
          <div style={{ position: 'absolute', left: space.safe, top: HMR_TOP, ...enterStyle(codeP) }}>
            <CodeBlock
              filename={HMR.codeFilename}
              lines={codeLines}
              width={CODE_WIDTH}
              highlightLines={[HMR.editLine]}
              highlightProgress={highlight}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              left: BROWSER.left,
              top: HMR_TOP,
              opacity: browserP,
              transform: `translateY(${(1 - browserP) * motion.enterOffset}px)`,
            }}
          >
            <BrowserMock title={pageTitle} flash={flash} />
          </div>
          <Caption
            delay={T.hmrCaption}
            size="note"
            tone="dim"
            style={{ position: 'absolute', left: space.safe, top: HMR_TOP + BROWSER.height + space.sm }}
          >
            {COPY.hmrCaption}
          </Caption>
        </>
      ) : null}
      <CostBeat
        at={duration - transition.costLead}
        label={thread.costLabel}
        text={scene04.copy.cost.text}
        notes={scene04.copy.cost.notes}
      />
    </AbsoluteFill>
  );
};
