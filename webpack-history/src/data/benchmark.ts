// 第 10 幕柱状图的数据来源。数值、单位与来源说明都在这里修改；
// source 会显示在画面右下角的「数据来源」位置。
//
// 数据：rstackjs/build-tools-performance（Rspack / Rsbuild 官方文档引用的开源基准，由 Rspack 团队维护）
//   https://github.com/rstackjs/build-tools-performance
//   用例 ui-components，指标 Build (no cache)：生产构建、无缓存、开启压缩、关闭 source map。
//   GitHub Actions run 44268018576（2026-11-18，benchmark commit f43edc1a），macos-15 runner，
//   README 注明 runner 硬件不固定，结果可能有波动。
//   原始数值（ms）：webpack 5.112.2 27328 · Rspack CLI 2.3.2 7765 · Vite 8.3.8 7215 · esbuild 0.28.2 8853
//   注意：该基准中 webpack 已调优（swc-loader + SWC 压缩），不是默认的 Babel / Terser 配置。
//   本仓库 benchmark/ 下另有一套本机实测脚本（three.js ×10），可用于复核，结果不在画面中使用。

import type { ToolId } from '../theme';

export type BenchmarkEntry = {
  /** 柱子左侧的标签 */
  label: string;
  /** 柱子颜色取 theme.toolColors 中对应工具的固定颜色 */
  tool: ToolId;
  /** 数值（同一单位） */
  value: number;
};

export const benchmark = {
  /** 图表标题 */
  caption: '生产构建耗时（无缓存）· ui-components 用例',
  /** 数值单位，显示在柱末尾的数字后 */
  unit: 's',
  entries: [
    { label: 'webpack', tool: 'webpack', value: 27.3 },
    { label: 'esbuild', tool: 'esbuild', value: 8.9 },
    { label: 'Rspack', tool: 'rspack', value: 7.8 },
    { label: 'Vite 8', tool: 'vite', value: 7.2 },
  ] satisfies BenchmarkEntry[],
  /** 画面右下角的数据来源文字 */
  source: '数据来源：rstackjs/build-tools-performance · 2026-11-18 · webpack 已用 SWC 调优',
} as const;
