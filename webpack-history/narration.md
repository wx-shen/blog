# 《webpack 发展史》旁白稿（10 分钟版）

- 总时长 600 秒，13 幕；全稿约 2050 字，纯朗读约 8 分 30 秒，其余留给停顿、转场与画面停留。语速按每秒约 4 个字（中文纪录片旁白的常见语速）估算，每幕给转场和画面停顿留 3–8 秒余量。
- 只使用已核对过的事实；出处见每幕的「事实出处」，以及 `src/scenes.ts` 中对应文案旁的注释。
- 【】内是给配音和剪辑的停顿提示，不朗读。
- 定稿后会写入 `src/scenes.ts` 每幕的 `narration` 字段，可直接交给 TTS 生成 `public/audio/<id>.mp3`。

---

## 1 开场 · 22s

每天，我们都会敲下这一行：npm run build。【停顿】几秒钟后，成百上千个模块，被打包成几个文件。这件事看起来理所当然，但它的背后，是前端工程化十几年的演进。【停顿】今天，我们来讲讲 webpack 的故事。

---

## 2 史前时代 · 2009–2012 · 60s

在没有打包工具的年代，一个页面就是一串 script 标签。脚本按顺序加载，依赖关系全靠人工维护；所有变量都挂在全局，一不小心就互相覆盖；文件越多，请求也越多。【停顿】

2009 年，Node.js 问世，服务端 JavaScript 用上了 CommonJS 规范：一个文件就是一个模块，用 require 引入。可是，浏览器并不认识 require。【停顿】

社区开始各自寻找出路。RequireJS 推行 AMD 规范，让浏览器异步加载模块；Browserify 换了个思路，把 Node 风格的模块打包成一个文件，直接在浏览器里运行；Grunt 则把合并、压缩这些重复劳动，交给了任务脚本。【停顿】

加载、打包、构建，各管一段。还没有人把这些问题放在一起解决。

> 事实出处：Node.js 2009 年发布；RequireJS（AMD）、Browserify、Grunt 的定位见 requirejs.org、browserify.org、gruntjs.com。

---

## 3 诞生 · 2012 · 52s

2012 年 2 月，Tobias Koppers 在另一个打包工具的仓库里提了一个想法：能不能像 Google 的 GWT 那样，做代码分割，按需加载。【停顿】没过多久，他决定自己动手。2012 年 3 月，webpack 的第一个提交诞生了。【停顿】

webpack 的核心想法很简单：一切皆模块。JavaScript 是模块，CSS、图片、字体也是模块。它从入口文件出发，顺着依赖关系走遍整个项目，把所有模块打包输出；遇到需要按需加载的部分，再拆成独立的代码块。【停顿】

不过，这里也埋下了第一个代价：每个模块都要包进一个函数，产物里多出一层模块运行时。

> 事实出处：modules-webmake issue #7（2012-02-23，提到 GWT 的 Code Splitting）；webpack 仓库首个提交 2012-03-10。

---

## 4 崛起 · 2014–2016 · 55s

2014 年 2 月，webpack 1.0 正式发布。同年，Pete Hunt 发布了 webpack-howto，介绍 Instagram 是怎样使用 webpack 的。【停顿】

让 webpack 脱颖而出的，是三样东西。loader 能把任何文件转换成模块，比如串起 style-loader 和 css-loader，样式就能直接 import 进 JavaScript。plugin 能介入构建的每一个环节，扩展出各种能力。热模块替换让你改完代码，页面不用刷新，只更新改动的那一块。【停顿】

单页应用迅速流行，webpack 成了它们的标配。【停顿】

但代价也随之而来：开发服务器必须先建好完整的依赖图，才能启动。项目越大，等得越久。

> 事实出处：webpack v1.0.0 发布于 2014-02-19，源码已含 HotModuleReplacementPlugin；petehunt/webpack-howto（2014-07）。

---

## 5 快速迭代 · 2017–2018 · 60s

2017 年 1 月，webpack 2 发布，原生支持 ES 模块的 import 和 export。ES 模块的依赖关系在编译时就能确定，webpack 可以标记出没被用到的导出，再交给压缩工具删掉。这就是 Tree Shaking。【停顿】

半年后，webpack 3 带来了实验性的 Scope Hoisting：把多个 ES 模块合并进同一个作用域，正好回应了“每个模块都要包一层函数”的代价。【停顿】

2018 年 2 月，webpack 4 发布。新增的 mode 选项按环境内置了默认配置，没有配置文件也能直接构建；SplitChunksPlugin 取代了难以配置的 CommonsChunkPlugin；package.json 里的 sideEffects 字段，让 Tree Shaking 能删得更多。【停顿】

可是，默认配置只覆盖了简单项目。真实项目里，配置照样越写越长。

> 事实出处：v2.2.0（2017-01-17）、v3.0.0（2017-06-19，Scope Hoisting 为实验特性）、v4.0.0（2018-02-25，mode、零配置、移除 CommonsChunkPlugin、支持 sideEffects）的 release notes。

---

## 6 配置之痛 · 2016–2019 · 42s

那几年，一份真实项目的 webpack 配置，往往要处理多个入口、各种 loader、压缩、分包、环境变量，开发和生产还要分开维护。配置复杂到仿佛需要专人维护，“webpack 配置工程师”，成了前端圈半是吐槽、半是自嘲的说法。【停顿】

解决的办法，是把配置藏起来。2016 年的 create-react-app，还有 Vue CLI、Next.js，都在 webpack 之上做了一层封装，让大多数开发者不必再直接面对配置。【停顿】

问题并没有消失，只是交给了框架的作者。

> 事实出处：create-react-app 2016 年发布（React 官方博客 *Sunsetting Create React App*）。“webpack 配置工程师”的用法见 CSDN、掘金上的多篇文章（如《做一个“Webpack 配置工程师”》）；“半是吐槽、半是自嘲”为解读。

---

## 7 webpack 5 · 2020 · 55s

2020 年 10 月 10 日，webpack 5 发布。【停顿】

持久化缓存可以把构建结果写到磁盘，第二次构建时，没有改动的模块不必重新编译。模块联邦让多个独立部署的应用在运行时共享代码，成了微前端的重要方案。资源模块取代了 file-loader、url-loader 和 raw-loader。生产模式默认使用稳定的模块 ID，长期缓存更加可靠。【停顿】

它也做了一次大胆的取舍：不再自动为 Node.js 的核心模块注入浏览器 polyfill。产物更干净了，但这是一次破坏性的升级，不少项目需要手动补上。【停顿】

然而，缓存只能加速重复的构建，改变不了底层的设计。

> 事实出处：webpack 5 发布博客（2020-10-10）：持久化缓存（需手动开启）、Module Federation、deterministic IDs、Asset Modules、移除自动 Node.js polyfill。

---

## 8 走出浏览器 · 2016–2021 · 60s

webpack 的影响，远不止浏览器。【停顿】

它的 target 选项能为 Node.js、Electron、Web Worker 等不同环境生成产物；loader 和 plugin 又能把代码改造成几乎任何格式。于是，一大批跨端方案，都把 webpack 当成了编译底座。【停顿】

小程序领域，Taro 从 2.0 开始基于 webpack 编译，uni-app 的 Vue 2 版本建立在 Vue CLI 之上，微信官方的 kbone 用 webpack 插件把网页代码转成小程序，快应用的工具链至今仍在用 webpack。原生渲染方向，Weex、Hippy 和 NativeScript 都用 webpack 打包。桌面端有 Electron Forge 的 webpack 插件；服务端，Next.js 用它打包服务端渲染的代码；微前端框架 qiankun，则要求子应用用 webpack 打包成 UMD 格式。【停顿】

webpack，成了前端工程的通用编译器。

> 事实出处：webpack `target` 文档；Taro 2.0 发布博客；uni-app CLI 文档；Tencent/kbone；hap-toolkit 依赖记录；weex-loader；Hippy demo 构建配置；NativeScript CLI；Electron Forge 插件文档；Next.js webpack 配置文档；qiankun 快速上手。

---

## 9 为什么修不好 · 2020 · 43s

那么，webpack 为什么没能一直快下去？问题出在底层设计的三个前提。【停顿】

第一，开发时要先全量打包，依赖图建完才能启动。第二，构建主要跑在 JavaScript 的单线程上，thread-loader 也只能把 loader 分到多个进程里。第三，插件直接操作 compiler、compilation 这些内部对象，生态越繁荣，内核越难大改。【停顿】

持久化缓存、按需编译，这些补救都有效，却动不了这三个前提。要突破，只能另起炉灶。

> 事实出处：thread-loader 文档（worker pool 只并行 loader）；webpack 插件文档（tapable 钩子暴露 compiler / compilation）；experiments.lazyCompilation（5.17.0 起）；Roadmap 2026（核心多线程 API 仍在设计中）。“生态越繁荣，内核越难大改”为解读。

---

## 10 挑战者 · 2020–2024 · 60s

其实，另起炉灶的人早就有了。2015 年的 Rollup 以打包库见长，从一开始就把模块合并进同一个作用域；2017 年的 Parcel，主打零配置。【停顿】

2020 年，新一代工具集中出现。用 Go 编写的 esbuild 能多核并行，换掉了“用 JavaScript 实现”这一层；Vite 在开发时直接利用浏览器原生的 ES 模块按需编译，换掉了“先打包再启动”这一层。2022 年，Vercel 公布了用 Rust 编写、基于增量计算的 Turbopack。2023 年，字节跳动开源 Rspack：用 Rust 重写内核，同时兼容绝大多数 webpack 的配置和插件，保留接口，换掉实现。【停顿】

不过，新工具也有自己的取舍。Vite 早期开发用 esbuild、生产用 Rollup，直到 2026 年的 Vite 8，才统一为 Rolldown。没有银弹。

> 事实出处：Rollup 早期 README（2015）；parcel-bundler 1.0.0（2017-12-05）；esbuild 首次发布（2020-01）；vite 0.1.0（2020-04-21）；Turbopack 随 Next.js 13 公布（2022-10）；Rspack 0.1 公告（2023-03-06）；Vite 8 发布博客（2026-03-12）。

---

## 11 迁移潮 · 2023–2026 · 40s

接下来几年，主流框架陆续换了引擎。2023 年，Angular 17 默认改用基于 esbuild 的构建；2025 年 2 月，React 团队宣布不再推荐用 create-react-app 创建新项目；同年 10 月，Next.js 16 把默认打包器换成了 Turbopack；2026 年，Nest.js 12 的 monorepo 默认改用 Rspack。【停顿】

跨端领域，Taro 4 和 uni-app 的 Vue 3 版本支持了 Vite，Re.Pack 和字节跳动的 Lynx，则选择了 Rspack。

> 事实出处：Angular build-system-migration 文档（v17）；React 博客 *Sunsetting Create React App*（2025-02-14）；Next.js 16 升级指南（16.0.0，2025-10-22）；Nest.js CLI 文档（v12）；Taro 编译配置（4.0.0 支持 vite）；uni-app Vue 3 版（@dcloudio/vite-plugin-uni）；Re.Pack README（5.0 起支持 Rspack）；Rspeedy README（基于 Rspack）。

---

## 12 今天 · 2026 · 36s

但 webpack 并没有停下。2026 年，它依然保持着每月一个小版本的节奏。原生 CSS 和 HTML 支持已经内置，TypeScript 支持也已加入；新增了 Bun 和 Deno 运行目标；核心的多线程能力，也在设计之中。模块联邦 2.0 已经独立维护，可以跨多种打包工具使用。【停顿】

官方路线图上，下一站是 webpack 6。

> 事实出处：npm 发布记录（5.105–5.113，2026）；webpack 博客 *CSS and HTML Are Built In*（2026-11-16）；5.108 发布博客（bun、deno、universal target）；experiments.typescript（5.107.0）；Roadmap 2026；Module Federation 2.0 Stable（2026-02）。

---

## 13 尾声 · 15s

打包工具会更替，问题与思想会留下。【停顿】每一个方案，都带着它的代价。【停顿】这就是 webpack 的故事。
