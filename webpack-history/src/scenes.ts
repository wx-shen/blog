/**
 * 每一幕的配置。
 * - durationSeconds：没有音频时使用的默认时长
 * - audio：相对 public/ 的路径；文件存在时，该幕时长 = 音频时长 + 0.4 秒
 * - focusYear：Timeline / YearCounter 在这一幕停留的年份
 * - narration：旁白文本占位，可直接交给 TTS 生成 public/audio/<id>.mp3
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
  /** 是否显示 Timeline 与 YearCounter（开场幕在结尾才升起） */
  chrome: 'always' | 'rise-at-end';
};

export const scenes = [
  {
    id: 'scene01-intro',
    title: 'webpack 发展史',
    years: [2009, 2026],
    yearsLabel: '2009 – 2026',
    focusYear: 2009,
    durationSeconds: 15,
    chrome: 'rise-at-end',
    audio: 'audio/scene01-intro.mp3',
    narration:
      '每天，我们都会敲下这一行 npm run build。几秒钟后，成百上千个模块被打包成几个文件。这件事看似理所当然，但它背后，是前端工程化十几年的演进。今天，我们来聊聊 webpack 的故事。',
  },
  {
    id: 'scene02-prehistory',
    title: '史前时代',
    years: [2009, 2012],
    yearsLabel: '2009 – 2012',
    focusYear: 2009,
    durationSeconds: 30,
    chrome: 'always',
    audio: 'audio/scene02-prehistory.mp3',
    narration:
      '在没有打包工具的年代，页面靠一个个 script 标签拼起来。依赖顺序全靠手动维护，变量都挂在全局，文件越多，请求越多，一不小心就是一片报错。社区开始自救：RequireJS 用 AMD 规范实现了浏览器端的异步模块加载；Browserify 把 Node 的 require 带进了浏览器；Grunt 则把合并、压缩这些重复劳动交给了任务脚本。但它们各管一段，还没有人把这些问题统一起来。',
  },
  {
    id: 'scene03-birth',
    title: '诞生',
    years: [2012, 2012],
    yearsLabel: '2012',
    focusYear: 2012,
    durationSeconds: 25,
    chrome: 'always',
    audio: 'audio/scene03-birth.mp3',
    narration:
      '2012 年，德国开发者 Tobias Koppers 想在 JavaScript 里实现类似 GWT 的代码分割，于是写下了 webpack。它的核心想法很简单：JS、CSS、图片、字体，一切资源都是模块。webpack 从入口出发，构建出完整的依赖图，再把它们打包输出，并且可以按需拆分成多个代码块。',
  },
  {
    id: 'scene04-rise',
    title: '崛起',
    years: [2013, 2016],
    yearsLabel: '2013 – 2016',
    focusYear: 2014,
    durationSeconds: 28,
    chrome: 'always',
    audio: 'audio/scene04-rise.mp3',
    narration:
      '2014 年，webpack 1.0 发布。Instagram 团队在 React 项目中采用了它，React 社区随之跟进。loader 让任何文件都能被转换成模块，plugin 让构建流程可以被任意扩展，热模块替换让开发者改完代码无需刷新页面。webpack 迅速成为单页应用的标配，但配置文件也一天比一天长。',
  },
  {
    id: 'scene05-evolution',
    title: '进化',
    years: [2017, 2018],
    yearsLabel: '2017 – 2018',
    focusYear: 2017,
    durationSeconds: 28,
    chrome: 'always',
    audio: 'audio/scene05-evolution.mp3',
    narration:
      '2017 年初，webpack 2 原生支持 ES 模块，带来了 Tree Shaking；同年夏天，webpack 3 加入作用域提升，让产物更小、运行更快。那几年，"webpack 配置工程师" 一度成了社区里的玩笑。2018 年，webpack 4 引入 mode 和合理的默认值，零配置也能直接构建。',
  },
  {
    id: 'scene06-webpack5',
    title: 'webpack 5',
    years: [2020, 2020],
    yearsLabel: '2020.10',
    focusYear: 2020,
    durationSeconds: 28,
    chrome: 'always',
    audio: 'audio/scene06-webpack5.mp3',
    narration:
      '2020 年 10 月，webpack 5 发布。持久化缓存让二次构建大幅提速；模块联邦让多个独立部署的应用在运行时共享代码，成为微前端的重要方案；内置的资源模块则取代了 file-loader 和 url-loader。',
  },
  {
    id: 'scene07-challengers',
    title: '新挑战者',
    years: [2015, 2023],
    yearsLabel: '2015 – 2023',
    focusYear: 2022,
    durationSeconds: 30,
    chrome: 'always',
    audio: 'audio/scene07-challengers.mp3',
    narration:
      '与此同时，新的挑战者不断出现。Rollup 专注库的打包，Parcel 主打零配置，用 Go 编写的 esbuild 把速度提升了一个数量级，Vite 在开发阶段直接利用浏览器的原生 ES 模块。随后，Rust 编写的 Turbopack 与 Rspack 相继登场，其中 Rspack 选择兼容 webpack 的生态。它们的答案各不相同，但回答的，都是 webpack 当年提出的问题。',
  },
  {
    id: 'scene08-today',
    title: '今天',
    years: [2024, 2026],
    yearsLabel: '2024 – 2026',
    focusYear: 2026,
    durationSeconds: 26,
    chrome: 'always',
    audio: 'audio/scene08-today.mp3',
    narration:
      '今天，webpack 依然运行在无数项目里。模块图、loader 与插件、代码分割、热更新、模块联邦，这些思想已经成为前端构建的公共语言，被新一代工具继承下来。打包工具会更替，但问题与思想会留下。',
  },
] as const satisfies readonly SceneConfig[];

export type SceneId = (typeof scenes)[number]['id'];

export const getScene = (id: SceneId): SceneConfig => {
  const scene = scenes.find((s) => s.id === id);
  if (!scene) {
    throw new Error(`Unknown scene: ${id}`);
  }
  return scene;
};
