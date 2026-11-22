import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from 'remotion';
import { BarChart } from '../components/BarChart';
import { Caption } from '../components/Caption';
import { CodeBlock } from '../components/CodeBlock';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { getScene } from '../scenes';
import { enterExitStyle, enterProgress, enterStyle, rangeProgress, slideEasing } from '../lib/anim';
import { colors, fonts, fontSize, fontWeight, layout, space } from '../theme';

const SCENE = getScene('scene06-webpack5');

const FEATURES = [
  { name: '持久化缓存', desc: "cache: { type: 'filesystem' }" },
  { name: '模块联邦', desc: 'Module Federation · 运行时共享代码' },
  { name: '资源模块', desc: 'Asset Modules · 内置处理图片与字体' },
] as const;

const T = {
  feature: [16, 270, 530] as const,
  panelDelay: 20,
} as const;

const PANEL = { left: 860, top: 290, width: 940 };

const FeatureItem: React.FC<{ index: number; active: number; at: number; activeSince: number | null }> = ({
  index,
  active,
  at,
  activeSince,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enterProgress(frame, fps, at);
  const isActive = index === active;
  // 失去焦点时 12 帧内变暗
  const focus = isActive || activeSince === null ? 1 : 1 - rangeProgress(frame, activeSince, activeSince + 12);
  const f = FEATURES[index];
  return (
    <div
      style={{
        display: 'flex',
        gap: space.md,
        paddingLeft: space.md,
        borderLeft: `4px solid ${interpolateColors(focus, [0, 1], [colors.textFaint, colors.accent])}`,
        opacity: interpolate(focus, [0, 1], [0.45, 1]),
        ...enterStyle(p),
      }}
    >
      <div style={{ fontFamily: fonts.mono, fontSize: fontSize.note, color: colors.accent, paddingTop: 8 }}>
        0{index + 1}
      </div>
      <div>
        <div style={{ fontFamily: fonts.sans, fontSize: fontSize.body, fontWeight: fontWeight.bold, color: colors.text }}>
          {f.name}
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 22, color: colors.textDim, marginTop: 6 }}>{f.desc}</div>
      </div>
    </div>
  );
};

/** 模块联邦示意：remote 暴露的模块在运行时被 host 加载 */
const FederationDiagram: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const box = (x: number, title: string, sub: string, accent: string) => (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: 340,
        height: 220,
        border: `2px solid ${accent}`,
        borderRadius: space.radius,
        background: colors.panel,
        padding: space.md,
      }}
    >
      <div style={{ fontFamily: fonts.mono, fontSize: fontSize.note, color: accent, fontWeight: fontWeight.bold }}>{title}</div>
      <div style={{ fontFamily: fonts.sans, fontSize: 22, color: colors.textDim, marginTop: 6 }}>{sub}</div>
    </div>
  );
  const travel = rangeProgress(frame, start + 50, start + 100, slideEasing);
  const chipX = interpolate(travel, [0, 1], [600 + 40, 40]);
  return (
    <div style={{ position: 'relative', width: PANEL.width, height: 260 }}>
      {box(0, 'app-shell', 'host · 独立部署', colors.accent)}
      {box(600, 'app-cart', 'remote · 独立部署', colors.secondary)}
      <svg width={PANEL.width} height={260} style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1={340} y1={110} x2={600} y2={110} stroke={colors.textDim} strokeWidth={2} strokeDasharray="8 10" />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 600 - 300 + 30,
          top: 64,
          width: 200,
          textAlign: 'center',
          fontFamily: fonts.mono,
          fontSize: 20,
          color: colors.textDim,
        }}
      >
        运行时加载
      </div>
      <div
        style={{
          position: 'absolute',
          left: chipX,
          top: 120,
          padding: '10px 20px',
          borderRadius: space.radiusSm,
          background: colors.secondary,
          fontFamily: fonts.mono,
          fontSize: 22,
          color: colors.text,
          whiteSpace: 'nowrap',
          opacity: rangeProgress(frame, start + 30, start + 44),
        }}
      >
        {'<Cart />'}
      </div>
    </div>
  );
};

export const Scene06Webpack5: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [f0, f1, f2] = T.feature;
  const active = frame >= f2 ? 2 : frame >= f1 ? 1 : 0;

  return (
    <AbsoluteFill>
      <SceneTitle title={SCENE.title} years={SCENE.yearsLabel} />

      {/* 左：三大特性 */}
      <div
        style={{
          position: 'absolute',
          left: space.safe,
          top: layout.contentTop + 30,
          width: 660,
          display: 'flex',
          flexDirection: 'column',
          gap: 70,
        }}
      >
        {T.feature.map((at, i) => (
          <FeatureItem key={i} index={i} active={active} at={at} activeSince={T.feature[i + 1] ?? null} />
        ))}
      </div>

      {/* 右 1：持久化缓存 */}
      <div style={{ position: 'absolute', ...PANEL, top: PANEL.top + 40, ...enterExitStyle(frame, fps, f0 + T.panelDelay, f1 - 16) }}>
        <BarChart
          caption="示意：同一项目的构建耗时（相对值）"
          data={[
            { label: '首次构建', value: 100, color: colors.textDim },
            { label: '二次构建', value: 22, color: colors.accent },
          ]}
          startFrame={f0 + T.panelDelay}
          width={PANEL.width}
          labelWidth={200}
          stagger={40}
          footnote="示意数据：命中文件系统缓存后，未改动的模块无需重新编译"
        />
      </div>

      {/* 右 2：模块联邦 */}
      <div style={{ position: 'absolute', ...PANEL, top: PANEL.top + 20, ...enterExitStyle(frame, fps, f1 + T.panelDelay, f2 - 16) }}>
        <FederationDiagram start={f1 + T.panelDelay} />
        <div style={{ marginTop: space.md }}>
          <CodeBlock lines={["remotes: { cart: 'cart@/remoteEntry.js' }"]} width={PANEL.width} fontSize={24} />
        </div>
        <Caption delay={f1 + T.panelDelay + 110} size="note" style={{ marginTop: space.md }}>
          多个独立部署的应用在运行时共享模块 —— 微前端的常用方案。
        </Caption>
      </div>

      {/* 右 3：资源模块 */}
      <div style={{ position: 'absolute', ...PANEL, top: PANEL.top + 20, ...enterExitStyle(frame, fps, f2 + T.panelDelay, null) }}>
        <CodeBlock
          filename="webpack.config.js"
          lines={[
            'module: {',
            '  rules: [',
            "    { test: /\\.png$/, type: 'asset/resource' },",
            "    { test: /\\.svg$/, type: 'asset/inline' },",
            "    { test: /\\.txt$/, type: 'asset/source' },",
            '  ],',
            '},',
          ]}
          width={PANEL.width}
          fontSize={26}
        />
        <Caption delay={f2 + T.panelDelay + 40} size="note" style={{ marginTop: space.lg }}>
          内置资源处理，取代 file-loader / url-loader / raw-loader。
        </Caption>
      </div>
    </AbsoluteFill>
  );
};
