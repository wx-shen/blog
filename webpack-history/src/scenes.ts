import type { ToolId } from './theme';

/**
 * 全片文案与每一幕的配置都集中在这里，方便统一核对史实与修改措辞。
 * 组件中不写任何文案。
 *
 * - durationSeconds：没有音频时使用的默认时长
 * - audio：相对 public/ 的路径；文件存在时，该幕时长 = 音频时长 + 0.4 秒，并在幕起点播放
 * - focusYear：Timeline / YearCounter 在这一幕停留的年份
 * - narration：旁白文本（与 narration.md 一致）
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

/**
 * 「代价」主线：webpack 每解决一个问题，也带来新的代价；后续版本或新工具回应它。
 * 第 3–7 幕结尾各有一个「代价」节拍（文字为解读性表述，事实部分已核对）。
 */
export type CostCopy = {
  text: string;
  notes: readonly string[];
};

export const thread = {
  costLabel: '代价',
  answerLabel: '回应',
} as const;

export type ToolCopy = {
  tool: ToolId;
  name: string;
  description: string;
};


// ─────────────────────────────────────────────────────────────
// 1. 开场
// ─────────────────────────────────────────────────────────────
export const scene01 = {
  id: 'scene01-intro',
  title: 'webpack 发展史',
  years: [2009, 2026],
  yearsLabel: '2009 – 2026',
  focusYear: 2009,
  durationSeconds: 22,
  chrome: 'rise-at-end',
  audio: 'audio/scene01-intro.mp3',
  narration: "每天，我们都会敲下这一行：npm run build。几秒钟后，成百上千个模块，被打包成几个文件。这件事看起来理所当然，但它的背后，是前端工程化十几年的演进。今天，我们来讲讲 webpack 的故事。",
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
  durationSeconds: 60,
  chrome: 'always',
  audio: 'audio/scene02-prehistory.mp3',
  /**
   * 时间轴随工具登场推进（已核对 2026-11，按首个发布版本）：
   * RequireJS 0.8.0 标签 2010-02-18（仓库首个提交 2009-09-27）；Browserify npm 0.0.1 2011-02-03；
   * Grunt npm 0.1.0 2012-01-12。某个工具的 year 与 stop 的 year 相同时，徽章在滑动结束后登场。
   */
  yearStops: [
    { atFrame: 766, year: 2010 },
    { atFrame: 1006, year: 2011 },
    { atFrame: 1246, year: 2012 },
  ],
  narration: "在没有打包工具的年代，一个页面就是一串 script 标签。脚本按顺序加载，依赖关系全靠人工维护；所有变量都挂在全局，一不小心就互相覆盖；文件越多，请求也越多。\n\n2009 年，Node.js 问世，服务端 JavaScript 用上了 CommonJS 规范：一个文件就是一个模块，用 require 引入。可是，浏览器并不认识 require。\n\n社区开始各自寻找出路。RequireJS 推行 AMD 规范，让浏览器异步加载模块；Browserify 换了个思路，把 Node 风格的模块打包成一个文件，直接在浏览器里运行；Grunt 则把合并、压缩这些重复劳动，交给了任务脚本。\n\n加载、打包、构建，各管一段。还没有人把这些问题放在一起解决。",
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
    /**
     * 三个 ToolBadge 及各自下方的一行说明（已核对 2026-11）
     * https://requirejs.org/docs/whyamd.html · https://browserify.org/ · https://gruntjs.com/
     */
    tools: [
      {
        tool: 'requirejs',
        name: 'RequireJS',
        year: 2010,
        /** 收尾时标在徽章下的分工 */
        category: '加载',
        description: '用 AMD 规范在浏览器中异步加载模块',
        // 演示：AMD 的 define 写法（示意代码）
        demo: {
          filename: 'main.js',
          lines: ["define(['jquery', 'app/cart'], function ($, cart) {", "  cart.render($('#cart'));", '});'],
        },
      },
      {
        tool: 'browserify',
        name: 'Browserify',
        year: 2011,
        /** 收尾时标在徽章下的分工 */
        category: '打包',
        description: '让浏览器也能使用 Node 风格的 require()',
        // 演示：README 中的标准用法 browserify main.js -o bundle.js
        demo: {
          filename: 'terminal',
          lines: ['$ browserify main.js -o bundle.js', '// main.js 和它 require 的所有模块 → 一个 bundle.js'],
        },
      },
      {
        tool: 'grunt',
        name: 'Grunt',
        year: 2012,
        /** 收尾时标在徽章下的分工 */
        category: '构建',
        description: '用任务脚本自动完成合并、压缩等步骤',
        // 演示：concat + uglify 两个任务（示意配置）
        demo: {
          filename: 'Gruntfile.js',
          lines: [
            'grunt.initConfig({',
            "  concat: { dist: { src: ['src/**/*.js'], dest: 'dist/app.js' } },",
            "  uglify: { dist: { files: { 'dist/app.min.js': ['dist/app.js'] } } },",
            '});',
            "grunt.registerTask('default', ['concat', 'uglify']);",
          ],
        },
      },
    ],
    /**
     * Node.js 与 CommonJS：同一行 require，在 Node 里正常运行，在浏览器里报错。
     * 已核对：Node.js 2009 年发布；浏览器原生没有 require，调用会抛出 ReferenceError。
     */
    commonjs: {
      code: ["const cart = require('./cart');", 'cart.render();'],
      nodeLabel: 'server.js · Node.js（2009）',
      nodeResult: '✓ 正常运行',
      browserLabel: 'app.js · 浏览器',
      browserResult: 'Uncaught ReferenceError: require is not defined',
    },
    /** 收尾一句（待核对：分镜外补充，可删为空字符串） */
    conclusion: '加载、打包、构建，各管一段 —— 还没有人把这些问题放在一起解决。',
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
  durationSeconds: 52,
  chrome: 'always',
  audio: 'audio/scene03-birth.mp3',
  narration: "2012 年 2 月，Tobias Koppers 在另一个打包工具的仓库里提了一个想法：能不能像 Google 的 GWT 那样，做代码分割，按需加载。没过多久，他决定自己动手。2012 年 3 月，webpack 的第一个提交诞生了。\n\nwebpack 的核心想法很简单：一切皆模块。JavaScript 是模块，CSS、图片、字体也是模块。它从入口文件出发，顺着依赖关系走遍整个项目，把所有模块打包输出；遇到需要按需加载的部分，再拆成独立的代码块。\n\n不过，这里也埋下了第一个代价：每个模块都要包进一个函数，产物里多出一层模块运行时。",
  copy: {
    /** 幕末「代价」：由第 5 幕 v3 的 Scope Hoisting 回应 */
    cost: {
      text: '每个模块都被包进一个函数，多出一层模块运行时',
      notes: [],
    },
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
    /** 按需加载时拆出的独立代码块（文件名为示意） */
    chunk: '1.chunk.js',
    /**
     * 起源（已核对）：2012-02-23 在 modules-webmake 的 issue #7 提出 GWT 式代码分割；
     * 2012-03-10 webpack 仓库首个提交，项目最初名为 modules-webpack。
     * https://github.com/medikoo/modules-webmake/issues/7
     */
    origin: {
      issueTitle: 'modules-webmake · issue #7',
      issueDate: '2012-02-23',
      issueQuote: 'GWT has a cool feature named Code Splitting which loads parts of the code on demand',
      issueQuoteZh: '“GWT 有个很酷的功能叫代码分割，能按需加载部分代码。”',
      commitTitle: 'webpack · 首个提交',
      commitDate: '2012-03-10',
      commitNote: '项目最初叫 modules-webpack',
    },
    keywords: ['一切皆模块', '代码分割'],
    // 已核对：Tobias Koppers（sokra），仓库首个提交 2012-03-10；动机是实现 GWT 式的代码分割。
    // https://github.com/medikoo/modules-webmake/issues/7
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
  durationSeconds: 55,
  chrome: 'always',
  audio: 'audio/scene04-rise.mp3',
  narration: "2014 年 2 月，webpack 1.0 正式发布。同年，Pete Hunt 发布了 webpack-howto，介绍 Instagram 是怎样使用 webpack 的。\n\n让 webpack 脱颖而出的，是三样东西。loader 能把任何文件转换成模块，比如串起 style-loader 和 css-loader，样式就能直接 import 进 JavaScript。plugin 能介入构建的每一个环节，扩展出各种能力。热模块替换让你改完代码，页面不用刷新，只更新改动的那一块。\n\n单页应用迅速流行，webpack 成了它们的标配。\n\n但代价也随之而来：开发服务器必须先建好完整的依赖图，才能启动。项目越大，等得越久。",
  copy: {
    /** 幕末「代价」：第 6 幕的持久化缓存只能缓解，第 7 幕的 Vite 换掉了这一层 */
    cost: {
      text: '依赖图要先完整建好，开发服务器才能启动',
      notes: ['项目越大，启动越慢'],
    },
    /**
     * 里程碑（已核对）：webpack 1.0.0 发布于 2014-02-19；Pete Hunt 的 webpack-howto（2014-07）
     * 开篇写明 "This includes most things we use at Instagram"。
     * https://github.com/webpack/webpack/releases/tag/v1.0.0 · https://github.com/petehunt/webpack-howto
     */
    milestones: {
      releaseDate: '2014-02-19',
      releaseTitle: 'webpack 1.0 正式发布',
      howtoDate: '2014',
      howtoTitle: 'Pete Hunt · webpack-howto',
      howtoQuote: 'This includes most things we use at Instagram',
      howtoQuoteZh: '“这里包含了我们在 Instagram 用到的大部分做法。”',
    },
    /** loader 链演示：css-loader 先把 CSS 转成模块，style-loader 再把它注入页面（文件名为示意） */
    /**
     * loader 链演示，使用 webpack 1 时代的写法（module.loaders + 用 ! 串联）。
     * 已核对：webpack-howto 中的原文 { test: /\.css$/, loader: 'style-loader!css-loader' }，注释 "use ! to chain loaders"。
     * https://github.com/petehunt/webpack-howto
     */
    loader: {
      label: 'loader',
      codeFilename: 'app.js',
      code: ["require('./main.css');"],
      configFilename: 'webpack.config.js',
      config: [
        'module: {',
        '  loaders: [',
        "    { test: /\\.css$/, loader: 'style-loader!css-loader' },",
        '  ],',
        '},',
      ],
      chain: ['main.css', 'css-loader', 'style-loader', '<style> 注入页面'],
      caption: '用 ! 串成一条链，从右往左执行：css-loader 先把 CSS 转成模块，style-loader 再把它注入页面',
    },
    /**
     * plugin 演示：构建流程中的几个钩子（compiler.hooks.compile / make、compilation.hooks.optimize、
     * compiler.hooks.emit 均为 webpack 公开的钩子名）；插件名为示意。
     */
    plugin: {
      label: 'plugin',
      stages: [
        { hook: 'compile', name: '开始编译' },
        { hook: 'make', name: '构建依赖图' },
        { hook: 'optimize', name: '优化' },
        { hook: 'emit', name: '输出文件' },
      ],
      plugins: [
        { name: 'MyPlugin', stage: 1 },
        { name: 'AnotherPlugin', stage: 3 },
      ],
      caption: 'plugin 通过钩子介入构建的各个环节，扩展出各种能力',
    },
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
  durationSeconds: 60,
  chrome: 'always',
  audio: 'audio/scene05-iteration.mp3',
  narration: "2017 年 1 月，webpack 2 发布，原生支持 ES 模块的 import 和 export。ES 模块的依赖关系在编译时就能确定，webpack 可以标记出没被用到的导出，再交给压缩工具删掉。这就是 Tree Shaking。\n\n半年后，webpack 3 带来了实验性的 Scope Hoisting：把多个 ES 模块合并进同一个作用域，正好回应了“每个模块都要包一层函数”的代价。\n\n2018 年 2 月，webpack 4 发布。新增的 mode 选项按环境内置了默认配置，没有配置文件也能直接构建；SplitChunksPlugin 取代了难以配置的 CommonsChunkPlugin；package.json 里的 sideEffects 字段，让 Tree Shaking 能删得更多。\n\n可是，默认配置只覆盖了简单项目。真实项目里，配置照样越写越长。",
  // v4 翻牌时（Scene05Iteration 的 T.versions[2]）时间轴滑到 2018
  yearStops: [{ atFrame: 900, year: 2018 }],
  copy: {
    /** 幕末「代价」：引出第 6 幕「配置之痛」 */
    cost: {
      text: '默认配置只覆盖简单项目，真实项目的配置照样膨胀',
      notes: [],
    },
    /** v3 阶段右侧的「回应」卡片：回应第 3 幕的代价 */
    v3Answer: {
      title: '第 3 幕的代价',
      text: '把多个 ES 模块合并进同一个作用域，省掉一层层函数包装',
    },
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
    /**
     * v4 的另外两项（已核对：v4.0.0 release notes —— CommonsChunkPlugin 移除，改用 optimization.splitChunks；
     * 支持 package.json 的 sideEffects: false）。代码为示意写法。
     */
    splitChunks: {
      beforeLabel: 'webpack 3',
      before: ["new webpack.optimize.CommonsChunkPlugin({ name: 'vendor' })"],
      afterLabel: 'webpack 4',
      after: ['optimization: {', "  splitChunks: { chunks: 'all' },", '}'],
      caption: 'SplitChunksPlugin 取代 CommonsChunkPlugin，公共代码按默认规则自动拆分',
    },
    sideEffects: {
      filename: 'package.json',
      lines: ['{', '  "name": "my-lib",', '  "sideEffects": false', '}'],
      caption: '声明代码没有副作用，没被用到的模块可以整个跳过',
    },
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 6. 配置之痛
// ─────────────────────────────────────────────────────────────
export const scene06 = {
  id: 'scene06-config-pain',
  title: '配置之痛',
  years: [2016, 2019],
  yearsLabel: '2016 – 2019',
  focusYear: 2018,
  durationSeconds: 42,
  chrome: 'always',
  audio: 'audio/scene06-config-pain.mp3',
  narration: "那几年，一份真实项目的 webpack 配置，往往要处理多个入口、各种 loader、压缩、分包、环境变量，开发和生产还要分开维护。配置复杂到仿佛需要专人维护，“webpack 配置工程师”，成了前端圈半是吐槽、半是自嘲的说法。\n\n解决的办法，是把配置藏起来。2016 年的 create-react-app，还有 Vue CLI、Next.js，都在 webpack 之上做了一层封装，让大多数开发者不必再直接面对配置。\n\n问题并没有消失，只是交给了框架的作者。",
  copy: {
    /** 幕末「代价」：交给框架作者 */
    cost: {
      text: '配置没有消失，只是交给了框架的作者',
      notes: [],
    },
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
    /**
     * 社区说法（见 CSDN、掘金《做一个“Webpack 配置工程师”》等文章）；「半是吐槽、半是自嘲」为解读。
     */
    meme: '「webpack 配置工程师」',
    memeNote: '配置复杂到仿佛需要专人维护 —— 半是吐槽，半是自嘲',
    /**
     * 上层封装：把 webpack 配置藏进框架（已核对：create-react-app 2016 年发布）。
     * https://react.dev/blog/2025/02/14/sunsetting-create-react-app
     */
    wrappers: {
      layerBottom: 'webpack 配置',
      frameworks: [
        { tool: 'cra', name: 'create-react-app' },
        { tool: 'vuecli', name: 'Vue CLI' },
        { tool: 'nextjs', name: 'Next.js' },
      ],
      layerTop: '开发者',
      caption: '配置被封装进框架，大多数开发者不必再直接面对它',
    },
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 7. webpack 5
// ─────────────────────────────────────────────────────────────
export const scene07 = {
  id: 'scene07-webpack5',
  title: 'webpack 5',
  years: [2020, 2020],
  yearsLabel: '2020.10',
  focusYear: 2020,
  durationSeconds: 55,
  chrome: 'always',
  audio: 'audio/scene07-webpack5.mp3',
  narration: "2020 年 10 月 10 日，webpack 5 发布。\n\n持久化缓存可以把构建结果写到磁盘，第二次构建时，没有改动的模块不必重新编译。模块联邦让多个独立部署的应用在运行时共享代码，成了微前端的重要方案。资源模块取代了 file-loader、url-loader 和 raw-loader。生产模式默认使用稳定的模块 ID，长期缓存更加可靠。\n\n它也做了一次大胆的取舍：不再自动为 Node.js 的核心模块注入浏览器 polyfill。产物更干净了，但这是一次破坏性的升级，不少项目需要手动补上。\n\n然而，缓存只能加速重复的构建，改变不了底层的设计。",
  copy: {
    /**
     * 幕末「代价」：交给第 9 幕「为什么修不好」。
     * 已核对：webpack 官方 Roadmap 2026 称正在设计核心内置的多线程 API，目前并行只到 loader 层（thread-loader）。
     * https://webpack.js.org/blog/2026-02-04-roadmap-2026/
     */
    cost: {
      text: '缓存只能加速重复构建，改不了底层设计',
      notes: ['开发时要先全量打包', '构建主要跑在 JavaScript 单线程上'],
    },
    /** 已核对：webpack 5 发布博客 2020-10-10 */
    releaseDate: '2020-10-10',
    releaseTitle: 'webpack 5 发布',
    /** 左侧特性列表：name + 一行说明；右侧依次演示（见 Scene07Webpack5） */
    features: [
      { name: '持久化缓存', desc: "cache: { type: 'filesystem' }" },
      { name: '模块联邦', desc: 'Module Federation · 运行时共享代码' },
      { name: '资源模块', desc: 'Asset Modules · 取代三个 loader' },
      { name: '稳定的模块 ID', desc: 'deterministic moduleIds / chunkIds' },
      { name: '移除 Node polyfill', desc: '破坏性变更' },
    ],
    cache: {
      /** 标题旁的「回应」标记：缓解第 4 幕的代价 */
      answer: '缓解第 4 幕的代价',
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
    /** 资源模块（已核对：asset/resource、asset/inline、asset/source 分别取代 file-loader、url-loader、raw-loader） */
    assets: {
      filename: 'webpack.config.js',
      lines: [
        'module: {',
        '  rules: [',
        "    { test: /\\.png$/, type: 'asset/resource' }, // file-loader",
        "    { test: /\\.svg$/, type: 'asset/inline' },   // url-loader",
        "    { test: /\\.txt$/, type: 'asset/source' },   // raw-loader",
        '  ],',
        '},',
      ],
    },
    /** 稳定 ID 示意：只改业务代码时，没动过的 vendors 文件名在 webpack 5 中保持不变（文件名与哈希为示意） */
    ids: {
      caption: '示意：只改了业务代码，没动过的 vendors 文件名是否变化',
      rows: [
        { label: 'webpack 4', before: 'vendors.3f9a1c.js', after: 'vendors.8b21e0.js', changed: true },
        { label: 'webpack 5', before: 'vendors.3f9a1c.js', after: 'vendors.3f9a1c.js', changed: false },
      ],
    },
    /**
     * 移除自动 polyfill：报错原文取自 webpack 源码 lib/errors/ModuleNotFoundError.js（路径为示意）。
     */
    polyfill: {
      command: 'npx webpack',
      lines: [
        { text: 'ERROR in ./src/hash.js', tone: 'warning' },
        { text: "Module not found: Error: Can't resolve 'crypto' in '/app/src'", tone: 'warning' },
        // 原文较长，按终端宽度断行，措辞不变
        { text: 'BREAKING CHANGE: webpack < 5 used to include polyfills', tone: 'normal' },
        { text: 'for node.js core modules by default.', tone: 'normal' },
        { text: 'This is no longer the case. Verify if you need this module', tone: 'normal' },
        { text: 'and configure a polyfill for it.', tone: 'normal' },
      ],
      caption: '产物更干净了，但升级时，不少项目要手动补上 polyfill',
    },
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 8. 走出浏览器
// ─────────────────────────────────────────────────────────────
export const scene08 = {
  id: 'scene08-beyond',
  title: '走出浏览器',
  years: [2016, 2021],
  yearsLabel: '2016 – 2021',
  focusYear: 2020,
  durationSeconds: 60,
  chrome: 'always',
  audio: 'audio/scene08-beyond.mp3',
  narration: "webpack 的影响，远不止浏览器。\n\n它的 target 选项能为 Node.js、Electron、Web Worker 等不同环境生成产物；loader 和 plugin 又能把代码改造成几乎任何格式。于是，一大批跨端方案，都把 webpack 当成了编译底座。\n\n小程序领域，Taro 从 2.0 开始基于 webpack 编译，uni-app 的 Vue 2 版本建立在 Vue CLI 之上，微信官方的 kbone 用 webpack 插件把网页代码转成小程序，快应用的工具链至今仍在用 webpack。原生渲染方向，Weex、Hippy 和 NativeScript 都用 webpack 打包。桌面端有 Electron Forge 的 webpack 插件；服务端，Next.js 用它打包服务端渲染的代码；微前端框架 qiankun，则要求子应用用 webpack 打包成 UMD 格式。\n\nwebpack，成了前端工程的通用编译器。",
  copy: {
    /**
     * webpack 官方支持的部分 target（已核对：configuration/target 文档）。
     * https://github.com/webpack/webpack.js.org/blob/main/src/content/configuration/target.mdx
     */
    targetsLabel: 'target',
    targets: ['web', 'webworker', 'node', 'electron-main', 'electron-renderer'],
    targetsCaption: '同一套模块图，为不同运行环境生成产物',
    /**
     * 跨端方案（已核对 2026-11，出处见 narration.md 第 8 幕）：Taro 2.0 起基于 webpack；uni-app Vue 2 版基于 vue-cli；
     * kbone 用 mp-webpack-plugin；快应用 hap-toolkit 至今锁定 webpack 5；weex-loader 是 webpack loader；
     * Hippy demo 构建基于 webpack；NativeScript CLI 默认 bundler 为 webpack；Electron Forge 有 webpack 插件；
     * Next.js webpack 模式下构建服务端产物；qiankun 要求子应用打包成 UMD。
     */
    categories: [
      { name: '小程序', items: ['Taro', 'uni-app（Vue 2）', 'kbone', '快应用'] },
      { name: '原生渲染', items: ['Weex', 'Hippy', 'NativeScript'] },
      { name: '桌面', items: ['Electron Forge'] },
      { name: '服务端', items: ['Next.js 服务端渲染'] },
      { name: '微前端', items: ['qiankun（UMD 子应用）'] },
    ],
    /** 解读 */
    statement: 'webpack，成了前端工程的通用编译器',
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 9. 为什么修不好
// ─────────────────────────────────────────────────────────────
export const scene09 = {
  id: 'scene09-limits',
  title: '为什么修不好',
  years: [2020, 2020],
  yearsLabel: '2020',
  focusYear: 2020,
  durationSeconds: 43,
  chrome: 'always',
  audio: 'audio/scene09-limits.mp3',
  narration: "那么，webpack 为什么没能一直快下去？问题出在底层设计的三个前提。\n\n第一，开发时要先全量打包，依赖图建完才能启动。第二，构建主要跑在 JavaScript 的单线程上，thread-loader 也只能把 loader 分到多个进程里。第三，插件直接操作 compiler、compilation 这些内部对象，生态越繁荣，内核越难大改。\n\n持久化缓存、按需编译，这些补救都有效，却动不了这三个前提。要突破，只能另起炉灶。",
  copy: {
    question: '为什么没能一直快下去？',
    /** 三个前提（第三条中「生态越繁荣，内核越难大改」为解读） */
    premises: [
      { title: '开发时先全量打包', detail: '依赖图建完，开发服务器才能启动' },
      { title: '构建主要跑在 JavaScript 单线程上', detail: '并行只到 loader 一层' },
      { title: '插件直接操作内部对象', detail: '生态越繁荣，内核越难大改' },
    ],
    /**
     * 补救及其局限（已核对：持久化缓存需手动开启、只加速重复构建；experiments.lazyCompilation 5.17.0 起提供，实验特性；
     * thread-loader 把 loader 放进 worker 池）。row 指向第几个前提。
     */
    remediesLabel: '补救',
    lockedLabel: '前提不变',
    remedies: [
      { name: '持久化缓存', note: '只加速重复构建', row: 0 },
      { name: 'lazyCompilation', note: '按需编译，实验特性（5.17 起）', row: 0 },
      { name: 'thread-loader', note: '只并行 loader', row: 1 },
    ],
    cost: {
      text: '补救有效，却动不了这三个前提',
      notes: ['要突破，只能另起炉灶'],
    },
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 10. 挑战者（柱状图数据见 src/data/benchmark.ts）
// ─────────────────────────────────────────────────────────────
export const scene10 = {
  id: 'scene10-challengers',
  title: '挑战者',
  years: [2020, 2024],
  yearsLabel: '2020 – 2024',
  focusYear: 2020,
  durationSeconds: 60,
  chrome: 'always',
  audio: 'audio/scene10-challengers.mp3',
  narration: "其实，另起炉灶的人早就有了。2015 年的 Rollup 以打包库见长，从一开始就把模块合并进同一个作用域；2017 年的 Parcel，主打零配置。\n\n2020 年，新一代工具集中出现。用 Go 编写的 esbuild 能多核并行，换掉了“用 JavaScript 实现”这一层；Vite 在开发时直接利用浏览器原生的 ES 模块按需编译，换掉了“先打包再启动”这一层。2022 年，Vercel 公布了用 Rust 编写、基于增量计算的 Turbopack。2023 年，字节跳动开源 Rspack：用 Rust 重写内核，同时兼容绝大多数 webpack 的配置和插件，保留接口，换掉实现。\n\n不过，新工具也有自己的取舍。Vite 早期开发用 esbuild、生产用 Rollup，直到 2026 年的 Vite 8，才统一为 Rolldown。没有银弹。",
  /**
   * 时间轴随工具登场逐年推进，避免第 8 幕从 2020 一次跳到 2026：
   * Turbopack 登场前滑到 2022，Rspack 登场前滑到 2023，本幕收尾时滑到 2024。
   * 某个工具的 year 与某个 stop 的 year 相同时，该工具会在这次滑动结束后才登场（见 Scene10Challengers）。
   */
  yearStops: [
    { atFrame: 560, year: 2022 },
    { atFrame: 680, year: 2023 },
    { atFrame: 1280, year: 2024 },
  ],
  copy: {
    /**
     * 幕末「代价」：没有银弹。
     * 已核对：Vite 8（2026-03）用 Rolldown 统一取代开发时的 esbuild 与生产构建的 Rollup；
     * Rspack 官方兼容表列出了不兼容的插件。
     * https://github.com/vitejs/vite/blob/main/docs/blog/announcing-vite8.md
     */
    cost: {
      text: '没有银弹：新工具也带着新的取舍',
      notes: [
        'Vite 早期开发用 esbuild、生产用 Rollup，直到 Vite 8（2026）才统一为 Rolldown',
        'Rspack 兼容的是绝大多数而非全部 webpack 插件',
      ],
    },
    /**
     * 柱状图之后依次登场的四个工具、各自的一行定位说明，
     * 以及驱动时间轴推进的首次公开年份（不显示在画面上）。已核对 2026-11：
     * - esbuild：Evan Wallace 用 Go 编写，2020-01 首次发布；解析与代码生成可完全并行。
     *   https://github.com/evanw/esbuild
     * - Vite：首个版本 0.1.0 发布于 2020-04-21；开发时基于浏览器原生 ESM 按需转换。
     *   （Vite 8 起依赖预构建与生产构建统一改用 Rolldown，本幕不涉及。）
     *   https://registry.npmjs.org/vite
     * - Turbopack：Vercel 用 Rust 编写，2022-10 随 Next.js 13 公布，基于增量计算框架 turbo-tasks。
     *   https://github.com/vercel/next.js/tree/canary/turbopack
     * - Rspack：字节跳动 Web Infra 团队用 Rust 编写，2023-03-06 开源（0.1）；官方表述为
     *   “兼容绝大多数 webpack 配置和 API”，并非全部插件可用。
     *   https://github.com/web-infra-dev/rspack/blob/main/website/docs/en/blog/announcing-0-1.mdx
     */
    /**
     * 前史（已核对：Rollup 2015 年早期 README 已输出 ES 模块并做作用域合并；parcel-bundler 1.0.0 发布于 2017-12-05，
     * 官方描述 "zero configuration web application bundler"）。
     */
    prelude: [
      { tool: 'rollup', name: 'Rollup', year: 2015, description: '2015 · 以打包库见长，从一开始就把模块合并进同一个作用域' },
      { tool: 'parcel', name: 'Parcel', year: 2017, description: '2017 · 主打零配置' },
    ],
    tools: [
      // 说明按「各自换掉了 webpack 的哪一层」来写（解读性表述，事实部分见上方出处）
      { tool: 'esbuild', name: 'esbuild', year: 2020, description: '换掉「用 JavaScript 实现」：Go 编写，多核并行' },
      { tool: 'vite', name: 'Vite', year: 2020, description: '换掉「开发时先打包」：按需编译原生 ES 模块' },
      { tool: 'turbopack', name: 'Turbopack', year: 2022, description: '换掉「用 JavaScript 实现」：Rust 编写，增量计算' },
      { tool: 'rspack', name: 'Rspack', year: 2023, description: '保留接口、换掉实现：Rust 内核，兼容绝大多数 webpack 配置与插件' },
    ],
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 11. 迁移潮
// ─────────────────────────────────────────────────────────────
export const scene11 = {
  id: 'scene11-migration',
  title: '迁移潮',
  years: [2023, 2026],
  yearsLabel: '2023 – 2026',
  focusYear: 2024,
  durationSeconds: 40,
  chrome: 'always',
  audio: 'audio/scene11-migration.mp3',
  // 时间轴随迁移墙推进：create-react-app 一行前滑到 2025，Nest.js 一行前滑到 2026（见 Scene11Migration）
  yearStops: [
    { atFrame: 150, year: 2025 },
    { atFrame: 390, year: 2026 },
  ],
  narration: "接下来几年，主流框架陆续换了引擎。2023 年，Angular 17 默认改用基于 esbuild 的构建；2025 年 2 月，React 团队宣布不再推荐用 create-react-app 创建新项目；同年 10 月，Next.js 16 把默认打包器换成了 Turbopack；2026 年，Nest.js 12 的 monorepo 默认改用 Rspack。\n\n跨端领域，Taro 4 和 uni-app 的 Vue 3 版本支持了 Vite，Re.Pack 和字节跳动的 Lynx，则选择了 Rspack。",
  copy: {
    /**
     * 迁移墙（已核对 2026-11）：Angular 17（2023-11）application builder 基于 esbuild，开发服务器用 Vite；
     * React 博客 2025-02-14 宣布不再推荐用 CRA 创建新应用；Next.js 16.0.0（2025-10-22）dev / build 默认 Turbopack；
     * Nest.js 12（2026-08）monorepo 默认改用 Rspack；Taro 4.0（2024-07）可选 Vite；uni-app Vue 3 版基于 Vite；
     * Re.Pack 5（2025-02）支持 Rspack；Lynx（2025-03 开源）构建工具 Rspeedy 基于 Rspack。
     */
    frameworksLabel: '主流框架',
    frameworks: [
      { name: 'Angular 17', date: '2023-11', change: '默认构建改用 esbuild', tool: 'esbuild' },
      { name: 'create-react-app', date: '2025-02', change: '不再推荐用于新项目', tool: '' },
      { name: 'Next.js 16', date: '2025-10', change: '默认打包器改用 Turbopack', tool: 'turbopack' },
      { name: 'Nest.js 12', date: '2026-08', change: 'monorepo 默认改用 Rspack', tool: 'rspack' },
    ],
    crossLabel: '跨端',
    cross: [
      { name: 'Taro 4', date: '2024-07', change: '新增 Vite 编译内核', tool: 'vite' },
      { name: 'uni-app（Vue 3）', date: '', change: '基于 Vite', tool: 'vite' },
      { name: 'Re.Pack 5', date: '2025-02', change: '支持 Rspack', tool: 'rspack' },
      { name: 'Lynx', date: '2025-03', change: '构建工具基于 Rspack', tool: 'rspack' },
    ],
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 12. 今天
// ─────────────────────────────────────────────────────────────
export const scene12 = {
  id: 'scene12-today',
  title: '今天',
  years: [2026, 2026],
  yearsLabel: '2026',
  focusYear: 2026,
  durationSeconds: 36,
  chrome: 'always',
  audio: 'audio/scene12-today.mp3',
  narration: "但 webpack 并没有停下。2026 年，它依然保持着每月一个小版本的节奏。原生 CSS 和 HTML 支持已经内置，TypeScript 支持也已加入；新增了 Bun 和 Deno 运行目标；核心的多线程能力，也在设计之中。模块联邦 2.0 已经独立维护，可以跨多种打包工具使用。\n\n官方路线图上，下一站是 webpack 6。",
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
    /**
     * 2026 年的现状（已核对）：npm 上 5.113.0 发布于 2026-11-19，2026 年基本每月一个 minor；
     * 5.108.0（2026-06）新增 bun、deno target；Roadmap 2026 称核心多线程 API 设计中；
     * Module Federation 2.0 于 2026-02 宣布稳定，独立维护，支持 webpack、Rspack、Rollup、Rolldown、Vite 等。
     */
    facts: [
      { label: '5.113', text: '2026-11-19 · 仍保持每月一个小版本' },
      { label: 'target', text: '新增 bun、deno 运行目标（5.108）' },
      { label: '多线程', text: '核心多线程 API 设计中（Roadmap 2026）' },
      { label: 'MF 2.0', text: '模块联邦独立维护，跨多种打包工具使用' },
    ],
  },
} as const satisfies SceneConfig;

// ─────────────────────────────────────────────────────────────
// 13. 尾声
// ─────────────────────────────────────────────────────────────
export const scene13 = {
  id: 'scene13-outro',
  title: '尾声',
  years: [2026, 2026],
  yearsLabel: '2026',
  focusYear: 2026,
  durationSeconds: 15,
  chrome: 'always',
  audio: 'audio/scene13-outro.mp3',
  // 片尾标题出现前（Scene13Outro 的 T.end），时间轴与左上角年份退场
  chromeExitAt: 250,
  narration: "打包工具会更替，问题与思想会留下。每一个方案，都带着它的代价。这就是 webpack 的故事。",
  copy: {
    recapLabel: '一路走来的代价',
    lines: ['打包工具会更替', '问题与思想会留下'],
    /** 片尾标题（与开场主标题一致；前段用强调色） */
    endTitleAccent: 'webpack',
    endTitleRest: ' 发展史',
    /** 片尾副标题（待定，空字符串则不显示） */
    endSubtitle: '',
  },
} as const satisfies SceneConfig;

export const scenes = [
  scene01,
  scene02,
  scene03,
  scene04,
  scene05,
  scene06,
  scene07,
  scene08,
  scene09,
  scene10,
  scene11,
  scene12,
  scene13,
] as const;

export type SceneId = (typeof scenes)[number]['id'];
