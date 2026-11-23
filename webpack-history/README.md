# webpack 发展史 · Remotion 科普视频

一条约 10 分钟（默认 600 秒）的科普视频，面向前端开发者。1920×1080，30fps。

**进度：** 10 分钟版改造中。第 1–7 幕已按新旁白完成；第 10、12 幕暂时沿用 220 秒版的实现；第 8、9、11、13 幕为占位。旁白稿见 `narration.md`。

## 预览与渲染

```bash
cd webpack-history
npm install
npm run dev            # 启动 Remotion Studio，浏览器打开 http://localhost:3000
```

Studio 左侧列出所有 Composition：

| id | 内容 | 默认时长 |
| --- | --- | --- |
| `WebpackHistory` | 主片，13 幕顺序拼接 | 600s |
| `S01-intro` | 开场 | 22s |
| `S02-prehistory` | 史前时代 2009–2012 | 60s |
| `S03-birth` | 诞生 2012 | 52s |
| `S04-rise` | 崛起 2014–2016 | 55s |
| `S05-iteration` | 快速迭代 2017–2018 | 60s |
| `S06-config-pain` | 配置之痛 2016–2019 | 42s |
| `S07-webpack5` | webpack 5（2020.10） | 55s |
| `S08-beyond` | 走出浏览器 2016–2021 | 60s |
| `S09-limits` | 为什么修不好 2020 | 43s |
| `S10-challengers` | 挑战者 2020–2024 | 60s |
| `S11-migration` | 迁移潮 2023–2026 | 40s |
| `S12-today` | 今天 2026 | 36s |
| `S13-outro` | 尾声 | 15s |

单幕 Composition 同样带 Timeline 与 YearCounter，并从上一幕的年份滑入，和主片中的效果一致。

```bash
npm run build                                   # 渲染主片 → out/webpack-history.mp4
npm run render:scene S02-prehistory out/s02.mp4 # 单独渲染某一幕
npm run stills WebpackHistory out/stills 120 900 # 导出指定帧截图
npm run typecheck
```

## 「代价」主线

第 3–7 幕结尾各有一个「代价」节拍（`CostBeat`：压暗画面 + 警示色卡片），说明这一阶段的方案带来了什么新问题；后面的版本或工具用强调色的「回应」标记接住它：

| 幕 | 代价 | 回应 |
| --- | --- | --- |
| 3 诞生 | 每个模块都包进函数，多一层运行时 | 第 5 幕 v3 Scope Hoisting（回应卡片） |
| 4 崛起 | 依赖图要先完整建好，开发服务器才能启动 | 第 6 幕持久化缓存（缓解）、第 7 幕 Vite |
| 5 快速迭代 | 默认配置只覆盖简单项目 | 第 6 幕「配置之痛」 |
| 6 配置之痛 | 缓存改不了「先全量打包」「JS 单线程」 | 第 7 幕各工具「换掉了哪一层」 |
| 7 挑战者 | 没有银弹：新工具也有取舍 | 第 8 幕「仍在迭代」 |

文案在 `scenes.ts` 各幕的 `copy.cost`；节拍在幕结束前 `transition.costLead`（150 帧）出现。

## 改文案、改数据

- **所有文案**（标题、年份、说明、终端输出、代码里的文件名……）都在 `src/scenes.ts`，组件里不写文字。标记「待核对」的是分镜以外由制作时补充的措辞。
- **第 7 幕柱状图**的数据在 `src/data/benchmark.ts`（当前为占位数据），`source` 字段显示在画面右下角。
- **幕内年份**：`scenes.ts` 里的 `yearStops` 让时间轴在一幕中途滑到新年份（第 5 幕 v4 → 2018，第 6 幕 v5 → 2020，第 7 幕随工具登场 → 2022 → 2023 → 2024）；`atFrame` 与对应场景文件时间表中的帧一致。
- **视觉参数**（颜色、工具配色、字体、字号、间距、布局、缓动、转场帧数）都在 `src/theme.ts`。

## 旁白音频（暂未接入素材）

把音频放到 `public/audio/<id>.mp3`（例如 `public/audio/scene02-prehistory.mp3`），该幕时长自动变为 **音频时长 + 0.4 秒**，并在幕起点播放；文件不存在时不渲染 `<Audio>`，时长取 `scenes.ts` 的 `durationSeconds`。

> Studio 中新增音频后需要刷新页面才会识别。幕内动画按「相对幕起点的帧」编排：音频比默认时长**短**时，请检查对应场景文件顶部的 `T` 时间表，确保最后一个动作落在幕结束之前。

## 项目结构

```
src/
  theme.ts            唯一的视觉参数来源
  scenes.ts           每一幕的配置与全部文案
  data/benchmark.ts   第 7 幕柱状图数据（占位）
  Root.tsx            注册主 Composition 与 8 个单幕 Composition，calculateMetadata
  Video.tsx           主片与单幕的组装
  sceneComponents.ts  幕 id → 组件
  lib/
    anim.ts           统一入场（spring，damping 200）、淡出、区间进度
    timing.ts         幕的起止帧、Timeline 年份滑动、开场结尾的升起时刻
    metadata.ts       音频检测与时长计算
  components/
    Timeline.tsx      底部 2009–2026 时间轴，当前年份居中高亮
    YearCounter.tsx   左上角年份，里程表式滚动（逐年进位）
    SceneTitle.tsx    幕标题
    CodeBlock.tsx     代码块（逐行出现、高亮行、划掉行、整体转警示色）
    Terminal.tsx      终端（打字机、进度条、日志）
    BarChart.tsx      横向柱状图
    ToolBadge.tsx     圆角色块 + 工具名，下方一行说明
    Caption.tsx       标题 72 / 正文 40 / 注释 28 的统一文字入场
    Background.tsx    #0B1020 + 极淡网格
    Chrome.tsx        Timeline + YearCounter 叠加层
    SceneShell.tsx    每幕外壳：等时间轴滑动 → 内容入场 → 结尾淡出 12 帧；<Audio> 接入点
    Cube.tsx / FileIcon.tsx / Pill.tsx  立方体、文件图标、关键词胶囊（第 3、8 幕共用）
    CostBeat.tsx / AnswerCard.tsx  「代价」节拍与「回应」卡片
    MilestoneCard.tsx 里程碑卡片（日期 + 标题 + 原文引用 / 译文）
    ScenePlaceholder.tsx  未制作幕的占位
  scenes/Scene01Intro.tsx … Scene13Outro.tsx
```

## 动画约定

- 所有动画由 `useCurrentFrame()` + `interpolate()` / `spring()` 驱动，没有 CSS transition 与 setTimeout。
- 入场：spring（damping 200，无回弹），自下而上 30px + 淡入。
- 转场：内容淡出 12 帧 → 下一幕开头 24 帧时间轴滑动、年份滚动 → 新内容入场。
- 开场幕不显示 Timeline，在结尾从底部升起；最后一幕在片尾标题前随内容沉下退场（`scenes.ts` 的 `chromeExitAt`）。
- 各幕错峰编排，同一时刻运动元素不超过 3 个。

## 在受限网络中渲染

字体通过 `@remotion/google-fonts` 从 Google Fonts 加载。若无法下载 Remotion 自带的 Chrome Headless Shell，可指定本机 Chrome：

```bash
npx remotion render src/index.ts WebpackHistory out/webpack-history.mp4 \
  --browser-executable=/path/to/chrome --chrome-mode=chrome-for-testing
# 截图脚本使用环境变量：REMOTION_BROWSER=/path/to/chrome npm run stills ...
```
