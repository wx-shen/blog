import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { CodeBlock } from '../components/CodeBlock';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { enterExitStyle, enterProgress, enterStyle, exitProgress, rangeProgress, slideEasing } from '../lib/anim';
import { curvePath, verticalCurve, type Point } from '../lib/geometry';
import { scene05 } from '../scenes';
import { alpha, colors, fonts, fontSize, fontWeight, layout, lineHeight, space, video } from '../theme';

const COPY = scene05.copy;
const TREE = COPY.treeShaking;

// ───────────── 时间表（帧，相对内容起点） ─────────────
const v4At = scene05.yearStops[0].atFrame; // 与时间轴滑到 2018 同步
const T = {
  /** 每个版本翻上来的帧 */
  versions: [20, 350, v4At],
  flip: 20,
  featureDelay: 30,
  featureStep: 16,
  // v2：Tree Shaking
  treeIn: 110,
  usedHighlight: 170,
  gray: 200,
  fall: 226,
  fallStep: 14,
  fallDur: 36,
  treeCaption: 290,
  treeOut: 336,
  // v4：长配置折叠成一行
  configIn: v4At + 50,
  fold: v4At + 130,
  foldDur: 40,
  modeLine: v4At + 180,
} as const;

// ───────────── 布局 ─────────────
const CARD = { left: space.safe, top: layout.contentTop + 10, width: 360, height: 220 } as const;
const FEATURES_TOP = CARD.top + CARD.height + space.lg;
const FEATURES_WIDTH = 620;
/** 右侧演示区 */
const DEMO = { left: 760, right: video.width - space.safe } as const;
const DEMO_CENTER_X = (DEMO.left + DEMO.right) / 2;

const NODE_H = 56;
const ROWS = [layout.contentTop + 30, layout.contentTop + 180, layout.contentTop + 330] as const;
const LEAF_W = 170;
const MODULE_W = 210;
const LEAF_GAP = 200;
const MODULE_X = [DEMO_CENTER_X - 250, DEMO_CENTER_X + 250];

type TreeNode = { key: string; label: string; x: number; y: number; w: number; used: boolean; mono: boolean };

/** 依赖树的节点与连线（坐标为节点中心 x / 顶部 y） */
const TREE_LAYOUT = (() => {
  const nodes: TreeNode[] = [
    { key: 'root', label: TREE.root, x: DEMO_CENTER_X, y: ROWS[0], w: MODULE_W, used: true, mono: true },
  ];
  const edges: { from: TreeNode; to: TreeNode }[] = [];
  const unused: TreeNode[] = [];
  TREE.modules.forEach((m, mi) => {
    const mod: TreeNode = { key: m.label, label: m.label, x: MODULE_X[mi], y: ROWS[1], w: MODULE_W, used: true, mono: true };
    nodes.push(mod);
    edges.push({ from: nodes[0], to: mod });
    m.exports.forEach((e, ei) => {
      const leaf: TreeNode = {
        key: `${m.label}:${e.label}`,
        label: e.label,
        x: mod.x + (ei - (m.exports.length - 1) / 2) * LEAF_GAP,
        y: ROWS[2],
        w: LEAF_W,
        used: e.used,
        mono: true,
      };
      nodes.push(leaf);
      edges.push({ from: mod, to: leaf });
      if (!e.used) unused.push(leaf);
    });
  });
  return { nodes, edges, unused };
})();

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 未使用节点的脱落进度（0 → 1），使用中的节点恒为 0 */
const fallProgress = (frame: number, node: TreeNode): number => {
  const k = TREE_LAYOUT.unused.indexOf(node);
  if (k < 0) return 0;
  const start = T.fall + k * T.fallStep;
  return interpolate(frame, [start, start + T.fallDur], [0, 1], clamp);
};

/** 版本翻牌：旧版本绕 X 轴翻下，新版本翻上 */
const VersionCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = enterProgress(frame, fps, T.versions[0]);

  let index = 0;
  for (let i = 1; i < T.versions.length; i++) {
    if (frame >= T.versions[i]) index = i;
  }
  // 当前翻牌进度：前半段旧牌翻到 90°，后半段新牌从 -90° 翻回 0°
  const flipStart = T.versions[index];
  const t = index === 0 ? 1 : rangeProgress(frame, flipStart, flipStart + T.flip, slideEasing);
  const showing = t < 0.5 ? index - 1 : index;
  const angle = t < 0.5 ? t * 180 : (t - 1) * 180;
  const v = COPY.versions[showing];

  return (
    <div
      style={{
        position: 'absolute',
        left: CARD.left,
        top: CARD.top,
        width: CARD.width,
        height: CARD.height,
        perspective: 900,
        ...enterStyle(appear),
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `rotateX(${angle}deg)`,
          background: colors.panel,
          border: `2px solid ${colors.accent}`,
          borderRadius: space.radius,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space.xs,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: fontSize.year,
            fontWeight: fontWeight.bold,
            color: colors.accent,
            lineHeight: 1,
          }}
        >
          {v.version}
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: fontSize.note, color: colors.textDim }}>{v.year}</div>
      </div>
    </div>
  );
};

/** 当前版本的关键特性：随翻牌替换 */
const Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {COPY.versions.map((v, vi) => {
        const start = T.versions[vi];
        const end = vi + 1 < T.versions.length ? T.versions[vi + 1] - 12 : null;
        if (frame < start || (end !== null && frame > end + 12)) return null;
        return (
          <div
            key={v.version}
            style={{
              position: 'absolute',
              left: CARD.left,
              top: FEATURES_TOP,
              width: FEATURES_WIDTH,
              display: 'flex',
              flexDirection: 'column',
              gap: space.md,
            }}
          >
            {v.features.map((f, fi) => (
              <div
                key={f}
                style={{
                  display: 'flex',
                  gap: space.sm,
                  fontFamily: fonts.sans,
                  fontSize: fontSize.note,
                  lineHeight: lineHeight.text,
                  color: colors.text,
                  ...enterExitStyle(frame, fps, start + T.featureDelay + fi * T.featureStep, end),
                }}
              >
                <span style={{ color: colors.accent }}>—</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
};

/** v2：Tree Shaking —— 未被使用的导出变灰并脱落 */
const TreeShaking: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = enterProgress(frame, fps, T.treeIn);
  const used = rangeProgress(frame, T.usedHighlight, T.usedHighlight + 14);
  const gray = rangeProgress(frame, T.gray, T.gray + 16);
  const out = exitProgress(frame, T.treeOut);
  if (frame < T.treeIn || out <= 0) return null;

  const anchorBottom = (n: TreeNode): Point => [n.x, n.y + NODE_H];
  const anchorTop = (n: TreeNode): Point => [n.x, n.y];

  return (
    <AbsoluteFill style={{ ...enterStyle(appear), opacity: appear * out }}>
      <svg width={video.width} height={video.height} style={{ position: 'absolute', left: 0, top: 0 }}>
        {TREE_LAYOUT.edges.map(({ from, to }) => {
          const fall = fallProgress(frame, to);
          const stroke = to.used
            ? interpolateColors(used, [0, 1], [alpha(colors.accent, 0.35), colors.accent])
            : interpolateColors(gray, [0, 1], [alpha(colors.accent, 0.35), alpha(colors.textFaint, 0.6)]);
          return (
            <path
              key={`${from.key}-${to.key}`}
              d={curvePath(verticalCurve(anchorBottom(from), anchorTop(to)))}
              fill="none"
              stroke={stroke}
              strokeWidth={2}
              opacity={1 - Math.min(1, fall * 4)}
            />
          );
        })}
      </svg>
      {TREE_LAYOUT.nodes.map((n) => {
        const fall = fallProgress(frame, n);
        const k = TREE_LAYOUT.unused.indexOf(n);
        const border = n.used
          ? interpolateColors(used, [0, 1], [colors.panelBorder, colors.accent])
          : interpolateColors(gray, [0, 1], [colors.panelBorder, colors.textFaint]);
        const text = n.used ? colors.text : interpolateColors(gray, [0, 1], [colors.text, colors.textFaint]);
        return (
          <div
            key={n.key}
            style={{
              position: 'absolute',
              left: n.x - n.w / 2,
              top: n.y,
              width: n.w,
              height: NODE_H,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: colors.panel,
              border: `2px solid ${border}`,
              borderRadius: space.radius,
              fontFamily: fonts.mono,
              fontSize: fontSize.small + 2,
              color: text,
              // 脱落：加速下坠 + 轻微旋转 + 淡出
              transform: `translateY(${fall * fall * 260}px) rotate(${(k % 2 === 0 ? 1 : -1) * 14 * fall}deg)`,
              opacity: 1 - fall,
            }}
          >
            {n.label}
          </div>
        );
      })}
      <Caption
        delay={T.treeCaption}
        size="note"
        tone="dim"
        style={{ position: 'absolute', left: DEMO.left, top: ROWS[2] + NODE_H + space.xl }}
      >
        {TREE.caption}
      </Caption>
    </AbsoluteFill>
  );
};

/** v4：长配置折叠成一行 mode: 'production' */
const ConfigFold: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < T.configIn) return null;

  const codeSize = fontSize.code - 4;
  const lh = Math.round(codeSize * lineHeight.code);
  const pad = space.md * 2;
  const fullBody = COPY.configBefore.length * lh + pad;
  const foldedBody = lh + pad;
  const fold = rangeProgress(frame, T.fold, T.fold + T.foldDur, slideEasing);
  const width = DEMO.right - DEMO.left;
  const appear = enterProgress(frame, fps, T.configIn);
  const modeP = enterProgress(frame, fps, T.modeLine);

  return (
    <div style={{ position: 'absolute', left: DEMO.left, top: CARD.top, ...enterStyle(appear) }}>
      {frame < T.modeLine ? (
        <CodeBlock
          filename={COPY.configFilename}
          lines={COPY.configBefore}
          width={width}
          fontSize={codeSize}
          bodyHeight={interpolate(fold, [0, 1], [fullBody, foldedBody])}
          style={{ opacity: interpolate(fold, [0.6, 1], [1, 0], clamp) }}
        />
      ) : (
        <div style={enterStyle(modeP)}>
          <CodeBlock
            filename={COPY.configFilename}
            lines={[COPY.modeLine]}
            width={width}
            fontSize={codeSize}
            highlightLines={[0]}
            highlightProgress={rangeProgress(frame, T.modeLine + 10, T.modeLine + 24)}
          />
        </div>
      )}
    </div>
  );
};

export const Scene05Iteration: React.FC<SceneProps> = () => (
  <AbsoluteFill>
    <SceneTitle title={scene05.title} years={scene05.yearsLabel} />
    <VersionCard />
    <Features />
    <TreeShaking />
    <ConfigFold />
  </AbsoluteFill>
);
