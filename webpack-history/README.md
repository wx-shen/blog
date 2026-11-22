# webpack 发展史 · Remotion 科普视频

一条约 3.5 分钟（默认 210 秒）的科普视频，面向前端开发者。1920×1080，30fps。

## 快速开始

```bash
npm install
npm run dev            # 打开 Remotion Studio 预览
npm run build          # 渲染主片 → out/webpack-history.mp4
npm run render:scene S03-birth out/s03.mp4   # 单独渲染某一幕
npm run stills WebpackHistory out/stills 120 900 2400   # 导出若干帧截图
npm run typecheck
```

## Composition

| id | 内容 | 默认时长 |
| --- | --- | --- |
| `WebpackHistory` | 主片，8 幕顺序拼接 | 210s |
| `S01-intro` | 开场：`npm run build` → 标题 | 15s |
| `S02-prehistory` | 史前时代 2009–2012 | 30s |
| `S03-birth` | 诞生 2012 | 25s |
| `S04-rise` | 崛起 2013–2016 | 28s |
| `S05-evolution` | 进化 2017–2018（webpack 2/3/4） | 28s |
| `S06-webpack5` | webpack 5（2020.10） | 28s |
| `S07-challengers` | 新挑战者 2015–2023 | 30s |
| `S08-today` | 今天 2024–2026 | 26s |

单幕 Composition 同样带 Timeline 与 YearCounter，并从上一幕的年份滑入，和主片中的效果一致。

## 旁白音频

每一幕的配置都在 `src/scenes.ts` 中（`narration` 是旁白文稿草稿，可直接交给 TTS）。

把音频放到 `public/audio/<id>.mp3`，例如 `public/audio/scene03-birth.mp3`，该幕时长会自动变为 **音频时长 + 0.4 秒**（`calculateMetadata`），并从幕起点播放。没有音频时使用 `durationSeconds`。

> Studio 中新增音频文件后需要刷新页面，`getStaticFiles()` 才会识别到。

幕内动画按「相对幕起点的帧」编排，时长变长时只会延长结尾停留；时长**变短**时，请检查对应场景文件顶部的 `T` 时间表，确保最后一个动作落在幕结束之前。

## 项目结构

```
src/
  theme.ts            颜色、字体、字号、间距、缓动、转场时序 —— 唯一的视觉参数来源
  scenes.ts           每一幕的 id / 标题 / 年份 / 默认时长 / 旁白 / 音频路径
  Root.tsx            注册主 Composition 与 8 个单幕 Composition，calculateMetadata
  Video.tsx           主片与单幕的组装
  sceneComponents.ts  幕 id → 组件
  lib/
    anim.ts           统一入场（spring，damping 200）、淡出、区间进度
    timing.ts         幕的起止帧、Timeline 年份滑动、开场结尾的升起时刻
    metadata.ts       音频检测与时长计算
  components/
    Timeline.tsx      底部 2009–2026 时间轴，当前年份居中高亮
    YearCounter.tsx   左上角年份，切换时逐位滚动
    SceneTitle.tsx    幕标题
    CodeBlock.tsx     代码块（逐行出现、高亮行、划掉行、整体转警示色）
    Terminal.tsx      终端（打字机、进度条、日志）
    BarChart.tsx      横向柱状图
    ToolBadge.tsx     工具 / 版本徽章 + 一行说明
    Caption.tsx       标题 72 / 正文 40 / 注释 28 的统一文字入场
    Background.tsx    #0B1020 + 极淡网格
    Chrome.tsx        Timeline + YearCounter 叠加层
    SceneShell.tsx    每幕外壳：等待时间轴滑动 → 内容入场 → 结尾淡出 12 帧 → 音频
  scenes/Scene01Intro.tsx … Scene08Today.tsx
```

## 动画约定

- 所有动画由 `useCurrentFrame()` + `interpolate()` / `spring()` 驱动，没有 CSS transition 与 setTimeout。
- 入场：spring（damping 200，无回弹），自下而上 30px + 淡入（`lib/anim.ts` 的 `enterProgress` / `enterStyle`）。
- 转场：内容淡出 12 帧 → 下一幕开头 24 帧时间轴滑动、年份滚动 → 新内容入场（`theme.ts` 的 `transition`）。
- 开场幕不显示 Timeline，在结尾从底部升起。
- 每幕按错峰编排，同一时刻运动元素不超过 3 个。

## 内容说明

- 柱状图（webpack 5 缓存、冷启动对比）均为**示意数据**，画面上已标注。
- 年份依据公开发布时间：webpack 1.0（2014）、webpack 2（2017.01）、webpack 3（2017.06）、webpack 4（2018.02）、webpack 5（2020.10）、Rollup（2015）、Parcel（2017）、esbuild / Vite（2020）、Turbopack（2022）、Rspack（2023）。

## 在受限网络中渲染

字体通过 `@remotion/google-fonts` 从 Google Fonts 加载。若无法下载 Remotion 自带的 Chrome Headless Shell，可指定本机 Chrome：

```bash
npx remotion render src/index.ts WebpackHistory out/webpack-history.mp4 \
  --browser-executable=/path/to/chrome --chrome-mode=chrome-for-testing
# 导出截图脚本使用环境变量：REMOTION_BROWSER=/path/to/chrome npm run stills ...
```
