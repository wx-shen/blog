import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { CodeBlock } from '../components/CodeBlock';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { getScene } from '../scenes';
import { ToolBadge } from '../components/ToolBadge';
import { exitProgress, moveProgress, rangeProgress } from '../lib/anim';
import { colors, fontSize, layout, space } from '../theme';

const SCENE = getScene('scene02-prehistory');

const SCRIPTS = [
  'jquery.js',
  'jquery.cookie.js',
  'underscore.js',
  'backbone.js',
  'handlebars.js',
  'moment.js',
  'lib/polyfills.js',
  'app/config.js',
  'app/utils.js',
  'app/models/user.js',
  'app/models/cart.js',
  'app/views/header.js',
  'app/views/sidebar.js',
  'app/views/cart.js',
  'app/views/checkout.js',
  'app/router.js',
  'app/plugins/slider.js',
  'app/plugins/modal.js',
  'app/main.js',
  'app/analytics.js',
];

const LINES = SCRIPTS.map((s) => `<script src="${s}"></script>`);

// 越往后追加得越快，制造"失控"感
const LINE_FRAMES = (() => {
  const frames: number[] = [];
  let f = 24;
  for (let i = 0; i < LINES.length; i++) {
    frames.push(Math.round(f));
    f += Math.max(5, 16 - i * 0.7);
  }
  return frames;
})();

const LAST_LINE = LINE_FRAMES[LINE_FRAMES.length - 1];

const T = {
  warnStart: LAST_LINE + 6,
  warnEnd: LAST_LINE + 30,
  pain: LAST_LINE + 44,
  painStep: 30,
  collapse: LAST_LINE + 190,
  badges: LAST_LINE + 230,
  badgeStep: 70,
  conclusion: LAST_LINE + 470,
} as const;

const PAINS = ['加载顺序全靠手动维护', '变量全部挂在 window 上', '文件越多，请求越多'];

const TOOLS = [
  { name: 'RequireJS', tag: 'AMD', description: '浏览器端的异步模块加载，依赖关系写进代码' },
  { name: 'Browserify', tag: 'CommonJS', description: '把 Node 的 require() 带进浏览器' },
  { name: 'Grunt', tag: 'Task', description: '用任务脚本自动合并、压缩、复制文件' },
];

export const Scene02Prehistory: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const warning = rangeProgress(frame, T.warnStart, T.warnEnd);
  const collapse = moveProgress(frame, fps, T.collapse, 30);
  const painsOut = exitProgress(frame, T.collapse);

  return (
    <AbsoluteFill>
      <SceneTitle title={SCENE.title} years={SCENE.yearsLabel} />

      {/* script 标签不断堆叠，溢出屏幕 */}
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
            filename="index.html"
            lines={LINES}
            lineStartFrames={LINE_FRAMES}
            warning={warning}
            width={980}
            fontSize={28}
          />
        </div>
      ) : null}

      {/* 痛点 */}
      <div
        style={{
          position: 'absolute',
          left: 1200,
          top: layout.contentTop + 90,
          width: 600,
          display: 'flex',
          flexDirection: 'column',
          gap: space.lg,
          opacity: painsOut,
        }}
      >
        {PAINS.map((p, i) => (
          <Caption key={p} delay={T.pain + i * T.painStep} size="body" tone="warning">
            <span style={{ marginRight: 16 }}>×</span>
            {p}
          </Caption>
        ))}
      </div>

      {/* 社区的三种自救方案 */}
      <div
        style={{
          position: 'absolute',
          left: space.safe,
          top: layout.contentTop + 110,
          display: 'flex',
          gap: 70,
        }}
      >
        {frame >= T.badges
          ? TOOLS.map((t, i) => (
              <ToolBadge
                key={t.name}
                name={t.name}
                tag={t.tag}
                description={t.description}
                delay={T.badges + i * T.badgeStep}
                width={500}
                accent={colors.secondary}
              />
            ))
          : null}
      </div>

      <Caption
        delay={T.conclusion}
        size="note"
        tone="dim"
        style={{
          position: 'absolute',
          left: space.safe,
          top: 690,
          fontSize: fontSize.note,
        }}
      >
        加载、打包、构建任务各管一段 —— 还没有一个统一的答案。
      </Caption>
    </AbsoluteFill>
  );
};
