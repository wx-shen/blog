// 占位数据，需替换为有出处的 benchmark
//
// 第 7 幕柱状图的数据来源。数值、单位与来源说明都在这里修改；
// source 会显示在画面右下角的「数据来源」位置。

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
  caption: '构建耗时对比（占位）',
  /** 数值单位，显示在柱末尾的数字后 */
  unit: 's',
  entries: [
    { label: 'webpack', tool: 'webpack', value: 40 },
    { label: 'Rspack', tool: 'rspack', value: 8 },
    { label: 'Vite', tool: 'vite', value: 6 },
    { label: 'esbuild', tool: 'esbuild', value: 2 },
  ] satisfies BenchmarkEntry[],
  /** 画面右下角的数据来源文字 */
  source: '数据来源：待补充',
} as const;
