import type { ToolId } from './theme';

/**
 * 全片文案与每一幕的配置都集中在这里，方便统一核对史实与修改措辞。
 * 组件中不写任何文案。
 *
 * - durationSeconds：没有音频时使用的默认时长
 * - audio：相对 public/ 的路径；文件存在时，该幕时长 = 音频时长 + 0.4 秒，并在幕起点播放
 * - focusYear：Timeline / YearCounter 在这一幕停留的年份
 * - narration：旁白文本占位
 * - copy：该幕画面上出现的全部文字
 *
 * 标记「待核对」的条目是制作时补充的措辞，请重点核对。
 */
export type SceneConfig = {
  id: string;
  title: string;
  years: readonly [number, number];
  /** 标题旁显示的年份文字 */
  yearsLabel: string;
  focusYear: number;
  durationSeconds: number;
  narration: string;
  audio: string;
  /** 'always'：始终显示 Timeline 与 YearCounter；'rise-at-end'：本幕结尾才升起（开场） */
  chrome: 'always' | 'rise-at-end';
  copy: Record<string, unknown>;
};

export type ToolCopy = {
  tool: ToolId;
  name: string;
  description: string;
};

const NARRATION_TODO = '（旁白待补）';

// ─────────────────────────────────────────────────────────────
// 1. 开场
// ─────────────────────────────────────────────────────────────
export const scene01 = {
  id: 'scene01-intro',
  title: 'webpack 发展史',
  years: [2009, 2026],
  yearsLabel: '2009 – 2026',
  focusYear: 2009,
  durationSeconds: 15,
  chrome: 'rise-at-end',
  audio: 'audio/scene01-intro.mp3',
  narration: NARRATION_TODO,
  copy: {
    terminalTitle: 'zsh — ~/my-app',
    command: 'npm run build',
    progressLabel: 'building',
    // 示意性的构建输出，不对应任何真实项目
    logs: [
      { text: '> my-app@1.0.0 build', tone: 'dim' },
      { text: 'asset main.3f9a1c.js 142 KiB [emitted] [minimized] (name: main)', tone: 'normal' },
      { text: 'asset vendors.8b21e0.js 318 KiB [emitted] [minimized] (id hint: vendors)', tone: 'normal' },
      { text: 'orphan modules 3.1 KiB [orphan] 12 modules', tone: 'normal' },
      { text: './src/index.js + 386 modules 1.2 MiB [built] [code generated]', tone: 'dim' },
      { text: 'webpack compiled successfully in 2318 ms', tone: 'success' },
    ],
    /** 主标题分两段：前段用强调色 */
    titleAccent: 'webpack',
    titleRest: ' 发展史',
    /** 副标题（待核对：制作时补充的措辞，可删为空字符串） */
    subtitle: '从 script 标签到模块打包器',
    subtitleYears: '2009 – 2026',
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 2. 史前时代
// ─────────────────────────────────────────────────────────────
export const scene02 = {
  id: 'scene02-prehistory',
  title: '史前时代',
  years: [2009, 2012],
  yearsLabel: '2009 – 2012',
  focusYear: 2009,
  durationSeconds: 30,
  chrome: 'always',
  audio: 'audio/scene02-prehistory.mp3',
  narration: NARRATION_TODO,
  copy: {
    codeFilename: 'index.html',
    /** 逐行追加的 <script src> 文件名（示意） */
    scripts: [
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
      'app/views/cart.js',
      'app/router.js',
      'app/plugins/modal.js',
      'app/main.js',
      'app/analytics.js',
    ],
    /** 溢出变色后出现的痛点（待核对：分镜外补充，不需要可清空数组） */
    pains: ['加载顺序全靠手动维护', '变量全部挂在全局作用域', '文件越多，请求越多'],
    /** 三个 ToolBadge 及各自下方的一行说明（待核对） */
    tools: [
      { tool: 'requirejs', name: 'RequireJS', description: '用 AMD 规范在浏览器中异步加载模块' },
      { tool: 'browserify', name: 'Browserify', description: '让浏览器也能使用 Node 风格的 require()' },
      { tool: 'grunt', name: 'Grunt', description: '用任务脚本自动完成合并、压缩等步骤' },
    ],
    /** 收尾一句（待核对：分镜外补充，可删为空字符串） */
    conclusion: '加载、打包、构建任务各管一段，还没有一个统一的答案。',
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 3. 诞生（待制作：copy 仅含分镜已给出的文字）
// ─────────────────────────────────────────────────────────────
export const scene03 = {
  id: 'scene03-birth',
  title: '诞生',
  years: [2012, 2012],
  yearsLabel: '2012',
  focusYear: 2012,
  durationSeconds: 25,
  chrome: 'always',
  audio: 'audio/scene03-birth.mp3',
  narration: NARRATION_TODO,
  copy: {
    /** 左侧四类文件：图标上的短标签 + 旁边的文件名（文件名为示意） */
    files: [
      { kind: 'js', label: 'JS', name: 'index.js' },
      { kind: 'css', label: 'CSS', name: 'style.css' },
      { kind: 'image', label: 'PNG', name: 'logo.png' },
      { kind: 'font', label: 'WOFF', name: 'icon.woff' },
    ],
    inputDir: 'src/',
    outputDir: 'dist/',
    output: 'bundle.js',
    outputLabel: 'JS',
    keywords: ['一切皆模块', '代码分割'],
    authorLabel: '作者',
    author: 'Tobias Koppers',
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 4. 崛起（待制作）
// ─────────────────────────────────────────────────────────────
export const scene04 = {
  id: 'scene04-rise',
  title: '崛起',
  years: [2014, 2016],
  yearsLabel: '2014 – 2016',
  focusYear: 2014,
  durationSeconds: 30,
  chrome: 'always',
  audio: 'audio/scene04-rise.mp3',
  narration: NARRATION_TODO,
  copy: {
    /** 依赖图（文件名为示意）。layer 0 为入口，连线从父节点指向子节点 */
    graph: {
      nodes: [
        { id: 'entry', label: 'index.js', kind: 'js', layer: 0 },
        { id: 'app', label: 'App.jsx', kind: 'js', layer: 1 },
        { id: 'router', label: 'router.js', kind: 'js', layer: 1 },
        { id: 'style', label: 'main.css', kind: 'css', layer: 1 },
        { id: 'header', label: 'Header.jsx', kind: 'js', layer: 2 },
        { id: 'list', label: 'List.jsx', kind: 'js', layer: 2 },
        { id: 'api', label: 'api.js', kind: 'js', layer: 2 },
        { id: 'logo', label: 'logo.png', kind: 'image', layer: 2 },
        { id: 'font', label: 'icon.woff', kind: 'font', layer: 2 },
        { id: 'item', label: 'Item.jsx', kind: 'js', layer: 3 },
        { id: 'utils', label: 'utils.js', kind: 'js', layer: 3 },
      ],
      edges: [
        ['entry', 'app'],
        ['entry', 'router'],
        ['entry', 'style'],
        ['app', 'header'],
        ['app', 'list'],
        ['router', 'api'],
        ['style', 'logo'],
        ['style', 'font'],
        ['list', 'item'],
        ['api', 'utils'],
      ],
      entryTag: 'entry',
    },
    /** 依赖图生长完成后的说明（待核对） */
    graphCaption: '从入口出发，沿 import / require 找出所有依赖，构成依赖图',
    hmrLabel: '热更新',
    /** 热更新演示：左侧代码改动一行，右侧模拟页面只有对应区块更新（代码与页面均为示意） */
    hmr: {
      codeFilename: 'Header.jsx',
      code: [
        'export function Header() {',
        '  return (',
        '    <header>',
        '      <h1>My App</h1>',
        '    </header>',
        '  );',
        '}',
      ],
      editLine: 3,
      editedLine: '      <h1>Hello, webpack</h1>',
      pageUrl: 'localhost:8080',
      pageTitleBefore: 'My App',
      pageTitleAfter: 'Hello, webpack',
    },
    /** 热更新说明（待核对） */
    hmrCaption: '只替换改动的模块，页面不刷新，其余部分保持原样',
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 5. 快速迭代（待制作）
// ─────────────────────────────────────────────────────────────
export const scene05 = {
  id: 'scene05-iteration',
  title: '快速迭代',
  years: [2017, 2018],
  yearsLabel: '2017 – 2018',
  focusYear: 2017,
  durationSeconds: 30,
  chrome: 'always',
  audio: 'audio/scene05-iteration.mp3',
  narration: NARRATION_TODO,
  copy: {
    versions: ['v2', 'v3', 'v4'],
    modeLine: "mode: 'production'",
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 6. 配置之痛（待制作）
// ─────────────────────────────────────────────────────────────
export const scene06 = {
  id: 'scene06-config-pain',
  title: '配置之痛',
  years: [2018, 2020],
  yearsLabel: '2018 – 2020',
  focusYear: 2018,
  durationSeconds: 25,
  chrome: 'always',
  audio: 'audio/scene06-config-pain.mp3',
  narration: NARRATION_TODO,
  copy: {
    configFilename: 'webpack.config.js',
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 7. 挑战者（待制作；柱状图数据见 src/data/benchmark.ts）
// ─────────────────────────────────────────────────────────────
export const scene07 = {
  id: 'scene07-challengers',
  title: '挑战者',
  years: [2020, 2024],
  yearsLabel: '2020 – 2024',
  focusYear: 2020,
  durationSeconds: 30,
  chrome: 'always',
  audio: 'audio/scene07-challengers.mp3',
  narration: NARRATION_TODO,
  copy: {
    toolNames: ['esbuild', 'Vite', 'Turbopack', 'Rspack'],
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 8. 今天（待制作）
// ─────────────────────────────────────────────────────────────
export const scene08 = {
  id: 'scene08-today',
  title: '今天',
  years: [2026, 2026],
  yearsLabel: '2026',
  focusYear: 2026,
  durationSeconds: 25,
  chrome: 'always',
  audio: 'audio/scene08-today.mp3',
  narration: NARRATION_TODO,
  copy: {
    plugins: ['CSS', 'HTML', 'TypeScript'],
    statement: '仍在迭代，通往 v6',
  },
} as const satisfies SceneConfig;

export const scenes = [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08] as const;

export type SceneId = (typeof scenes)[number]['id'];

/** 界面上的通用文字 */
export const ui = {
  /** 尚未制作的幕在预览中显示的提示 */
  pendingScene: '本幕制作中',
} as const;
