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
  /**
   * 幕内年份关键帧：atFrame 为相对内容起点的帧（与对应场景文件的时间表一致），
   * 到达时时间轴滑到 year，左上角年份随之滚动。
   */
  yearStops?: readonly { atFrame: number; year: number }[];
  /** Timeline 与 YearCounter 在本幕内退场的帧（相对内容起点），用于片尾 */
  chromeExitAt?: number;
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
// 3. 诞生
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
// 4. 崛起
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
// 5. 快速迭代
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
  // v4 翻牌时（Scene05Iteration 的 T.v4）时间轴滑到 2018
  yearStops: [{ atFrame: 470, year: 2018 }],
  copy: {
    /**
     * 翻牌的版本号、年份与 1–2 个关键特性（已核对 2026-11）
     * - v2：2.2.0 发布于 2017-01-17。未使用的导出被标记为 unused，再由压缩工具（UglifyJS）删除。
     *   https://github.com/webpack/webpack/releases/tag/v2.2.0
     * - v3：3.0.0 发布于 2017-06-19，Scope Hoisting 为实验特性，需手动添加 ModuleConcatenationPlugin，只对 ES 模块生效。
     *   https://github.com/webpack/webpack/releases/tag/v3.0.0
     * - v4：4.0.0 发布于 2018-02-25，mode 选项；无需配置文件，默认 ./src/index.js → ./dist/main.js。
     *   https://github.com/webpack/webpack/releases/tag/v4.0.0
     */
    versions: [
      {
        version: 'v2',
        year: '2017',
        features: ['原生支持 ES Modules（import / export）', 'Tree Shaking：标记未使用的导出，交给压缩工具删除'],
      },
      {
        version: 'v3',
        year: '2017',
        features: ['Scope Hoisting（实验特性，需手动启用）：把 ES 模块合并进同一个作用域'],
      },
      { version: 'v4', year: '2018', features: ['新增 mode 选项，按环境内置默认配置', '没有配置文件也能直接构建'] },
    ],
    /** v2 的 Tree Shaking 演示：依赖树上未被使用的导出变灰并脱落（文件名为示意） */
    treeShaking: {
      root: 'main.js',
      modules: [
        {
          label: 'math.js',
          exports: [
            { label: 'add', used: true },
            { label: 'sub', used: false },
            { label: 'mul', used: false },
          ],
        },
        {
          label: 'format.js',
          exports: [
            { label: 'date', used: true },
            { label: 'currency', used: false },
          ],
        },
      ],
      /** 待核对 */
      caption: '未被使用的导出，不会进入最终产物',
    },
    /**
     * v4 演示：一份长配置折叠成一行。
     * 已核对：以下四项在 webpack 4.0.0 的 production 模式下默认启用（DefinePlugin 设 NODE_ENV、
     * UglifyJsPlugin、ModuleConcatenationPlugin、NoEmitOnErrorsPlugin），但不是全部默认项；
     * 4.26.0（2018-11）起默认压缩器从 UglifyJS 换成 Terser。
     * https://github.com/webpack/webpack/releases/tag/v4.0.0
     * https://github.com/webpack/webpack/releases/tag/v4.26.0
     */
    configFilename: 'webpack.config.js',
    configBefore: [
      'module.exports = {',
      "  entry: './src/index.js',",
      '  plugins: [',
      '    new webpack.DefinePlugin({',
      "      'process.env.NODE_ENV': JSON.stringify('production'),",
      '    }),',
      '    new UglifyJsPlugin(),',
      '    new webpack.optimize.ModuleConcatenationPlugin(),',
      '    new webpack.NoEmitOnErrorsPlugin(),',
      '  ],',
      '};',
    ],
    modeLine: "mode: 'production'",
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 6. 配置之痛
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
  // 配置滚动结束、切到 v5 时（Scene06ConfigPain 的 T.v5）时间轴滑到 2020
  yearStops: [{ atFrame: 300, year: 2020 }],
  copy: {
    configFilename: 'webpack.config.js',
    /** 持续滚动的配置内容（示意），循环拼接成很长的文件 */
    configTemplate: [
      'module.exports = (env, argv) => ({',
      "  entry: { main: './src/index.js', admin: './src/admin.js' },",
      '  output: {',
      "    path: path.resolve(__dirname, 'dist'),",
      "    filename: '[name].[contenthash:8].js',",
      "    publicPath: '/static/',",
      '  },',
      '  resolve: {',
      "    extensions: ['.ts', '.tsx', '.js', '.json'],",
      "    alias: { '@': path.resolve(__dirname, 'src') },",
      '  },',
      '  module: {',
      '    rules: [',
      "      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },",
      '      {',
      '        test: /\.s?css$/,',
      "        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],",
      '      },',
      "      { test: /\.(png|jpe?g|gif)$/, use: [{ loader: 'url-loader', options: { limit: 8192 } }] },",
      "      { test: /\.svg$/, use: ['@svgr/webpack', 'file-loader'] },",
      '    ],',
      '  },',
      '  optimization: {',
      '    splitChunks: {',
      '      cacheGroups: {',
      "        vendor: { test: /node_modules/, name: 'vendors', chunks: 'all' },",
      '      },',
      '    },',
      '  },',
      '  plugins: [',
      "    new HtmlWebpackPlugin({ template: './public/index.html' }),",
      "    new MiniCssExtractPlugin({ filename: '[name].[contenthash:8].css' }),",
      '    new webpack.DefinePlugin({ __DEV__: argv.mode !== "production" }),',
      '  ],',
      '});',
      '',
    ],
    /** 滚动时右侧的一句（待核对：分镜外补充，可删为空字符串） */
    painCaption: '配置越写越长，越来越难维护',
    v5Heading: 'webpack 5',
    cache: {
      title: '持久化缓存',
      firstLabel: '第一次构建',
      secondLabel: '第二次构建（命中缓存）',
    },
    federation: {
      title: '模块联邦',
      /** 三个独立应用（名称为示意） */
      apps: ['app-shell', 'app-cart', 'app-search'],
      /** 在应用之间流动的共享模块（名称为示意） */
      shared: ['react', '<Cart />', '<Search />'],
    },
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 7. 挑战者（柱状图数据见 src/data/benchmark.ts）
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
  /**
   * 时间轴随工具登场逐年推进，避免第 8 幕从 2020 一次跳到 2026：
   * Turbopack 登场前滑到 2022，Rspack 登场前滑到 2023，本幕收尾时滑到 2024。
   * 某个工具的 year 与某个 stop 的 year 相同时，该工具会在这次滑动结束后才登场（见 Scene07Challengers）。
   */
  yearStops: [
    { atFrame: 526, year: 2022 },
    { atFrame: 586, year: 2023 },
    { atFrame: 760, year: 2024 },
  ],
  copy: {
    /**
     * 柱状图之后依次登场的四个工具、各自的一行定位说明（待核对），
     * 以及驱动时间轴推进的首次公开年份（待核对，不显示在画面上）
     */
    tools: [
      { tool: 'esbuild', name: 'esbuild', year: 2020, description: '用 Go 编写，极快的打包与转译' },
      { tool: 'vite', name: 'Vite', year: 2020, description: '开发时基于浏览器原生 ES 模块按需编译' },
      { tool: 'turbopack', name: 'Turbopack', year: 2022, description: '用 Rust 编写的增量打包工具' },
      { tool: 'rspack', name: 'Rspack', year: 2023, description: '用 Rust 编写，兼容 webpack 的配置与插件生态' },
    ],
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 8. 今天
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
  // 片尾标题出现前（Scene08Today 的 T.end），时间轴与左上角年份随内容一起退场
  chromeExitAt: 480,
  copy: {
    /** 依次被吸入立方体的三个插件图标：图标上的短标签 + 图标下的名称 */
    plugins: [
      { kind: 'css', label: 'CSS', name: 'CSS' },
      { kind: 'html', label: 'HTML', name: 'HTML' },
      { kind: 'ts', label: 'TS', name: 'TypeScript' },
    ],
    statement: '仍在迭代，通往 v6',
    /**
     * 已核对：这三项列在官方「Roadmap 2026」的「Preparing for Webpack 6」中，但已在 webpack 5.x 落地
     * （experiments.css 5.66.0 加入、5.109.0 起默认开启；experiments.typescript 5.107.0 加入）。
     * v6 截至 2026-11 未发布，届时它们将不再是实验特性。画面不能暗示这些是“v6 才有”的功能。
     * https://webpack.js.org/blog/2026-02-04-roadmap-2026/
     * https://webpack.js.org/blog/2026-11-16-css-and-html-are-built-in/
     */
    statementNote: '原生 CSS、HTML、TypeScript 支持已在 webpack 5 中落地，到 v6 将不再是实验特性',
    /** 片尾标题（与开场主标题一致；前段用强调色） */
    endTitleAccent: 'webpack',
    endTitleRest: ' 发展史',
    /** 片尾副标题（待定，空字符串则不显示） */
    endSubtitle: '',
  },
} as const satisfies SceneConfig;

export const scenes = [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08] as const;

export type SceneId = (typeof scenes)[number]['id'];
