import { loadFont as loadNotoSansSC } from '@remotion/google-fonts/NotoSansSC';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';

/**
 * 全片唯一的视觉参数来源：颜色、字体、字号、间距、布局、缓动与转场时序。
 * 组件与分镜只从这里取值；文案见 scenes.ts。
 */

// 思源黑体按 unicode-range 拆成上百个分片，只加载 400 / 700 两个字重以减少请求
const sans = loadNotoSansSC('normal', {
  weights: ['400', '700'],
  subsets: ['chinese-simplified', 'latin'],
  ignoreTooManyRequestsWarning: true,
});

const mono = loadJetBrainsMono('normal', {
  weights: ['400', '700'],
  subsets: ['latin'],
});

export const video = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

/** '#RRGGBB' + 透明度 → rgba() */
export const alpha = (hex: string, a: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

const base = {
  bg: '#0B1020',
  accent: '#8DD6F9', // webpack 蓝
  secondary: '#1C78C0', // 辅助蓝
  warning: '#F2994A', // 痛点 / 警示
  text: '#E8EEF7',
  textDim: '#8A96AD',
  textFaint: '#4A5571',
  success: '#7FD8A6',
} as const;

export const colors = {
  ...base,
  grid: alpha(base.accent, 0.045),
  glow: alpha(base.secondary, 0.1),
  vignette: 'rgba(5, 8, 16, 0.55)',
  panel: 'rgba(18, 26, 48, 0.88)',
  panelBorder: alpha(base.accent, 0.18),
  terminalBg: 'rgba(8, 12, 26, 0.96)',
  shadow: 'rgba(0, 0, 0, 0.45)',
  codeKeyword: base.accent,
  codeString: '#C3E88D',
  codeComment: '#5C6A88',
  codeTag: '#82AAFF',
} as const;

/**
 * 工具固定配色（ToolBadge 的圆角色块）。不使用任何官方 Logo，也不追求还原品牌色，
 * 只保证同屏出现的工具彼此可区分，且避开警示色。
 */
export const toolColors = {
  requirejs: '#7C8CF8',
  browserify: '#5FC6A8',
  grunt: '#D9B44A',
  webpack: base.accent,
  esbuild: '#B5E36B',
  vite: '#B48CF5',
  turbopack: '#F07F8F',
  rspack: '#4FD1C5',
  rollup: '#E4A0F7',
  parcel: '#D4B483',
  cra: '#E879A6',
  vuecli: '#6FCF97',
  nextjs: '#C9CED6',
} as const;

export type ToolId = keyof typeof toolColors;

/** 分类配色：依次取用（第 8 幕的跨端分类等），均为已有色值 */
export const categoryColors = [base.accent, '#B48CF5', base.success, '#E8D36A', '#F0A6A0'] as const;

/** 文件类型配色（文件图标、依赖图节点的色点） */
export const fileColors = {
  js: '#E8D36A',
  css: '#82AAFF',
  image: '#7FD8A6',
  font: '#C792EA',
  html: '#F0A6A0',
  ts: '#6FA8E8',
} as const;

export type FileKind = keyof typeof fileColors;

/** 中央立方体：普通等轴立方体，三个面明暗不同 */
export const cubeColors = {
  top: alpha(base.accent, 0.42),
  left: alpha(base.secondary, 0.75),
  right: alpha(base.secondary, 0.45),
  edge: base.accent,
} as const;

export const fonts = {
  sans: `${sans.fontFamily}, "PingFang SC", "Microsoft YaHei", sans-serif`,
  // 等宽字体回退到思源黑体，保证代码 / 终端中的中文正常显示
  mono: `${mono.fontFamily}, ${sans.fontFamily}, "SFMono-Regular", Menlo, monospace`,
} as const;

export const fontSize = {
  title: 72,
  body: 40,
  note: 28,
  year: 104,
  code: 28,
  terminal: 30,
  terminalLog: 24,
  small: 22,
} as const;

export const fontWeight = {
  regular: 400,
  bold: 700,
} as const;

export const lineHeight = {
  text: 1.5,
  code: 1.6,
  terminal: 1.7,
} as const;

export const space = {
  safe: 120, // 四周安全边距
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
  xl: 64,
  xxl: 96,
  radius: 14,
  radiusSm: 8,
} as const;

/** 画面分区（px） */
export const layout = {
  /** 年份与标题所在行的顶部（= 安全边距） */
  headerTop: space.safe,
  /** SceneTitle 的左边缘（在 YearCounter 右侧） */
  titleLeft: 440,
  /** 正文区 */
  contentTop: 290,
  contentBottom: 850,
  /** 正文区右栏起点（左右两栏布局时） */
  columnRight: 1180,
  /** Timeline：顶部 880，底边 = 1080 - 120 */
  timelineTop: 880,
  timelineHeight: 80,
  /** Timeline 上相邻年份的间距 */
  yearSpacing: 150,
  /** 终端窗口 */
  terminal: { width: 1180, height: 600, headerHeight: 52 },
  /** 文件图标 */
  fileIcon: { width: 84, height: 104 },
  /** 依赖图节点 */
  graphNode: { width: 230, height: 64 },
} as const;

/** 缓动 / spring 参数 */
export const motion = {
  /** 入场 spring：damping 200 → 无回弹 */
  enterSpring: { damping: 200, stiffness: 100, mass: 1 },
  /** 入场位移（自下而上） */
  enterOffset: 30,
  /** 入场 spring 拉伸到的帧数（用于错峰编排，保证同屏运动元素 ≤ 3） */
  enterFrames: 26,
  /** 代码逐行追加时单行入场帧数（行间隔短，入场也要短，避免同时运动的行过多） */
  lineEnterFrames: 12,
  /** 较慢的位移 spring（终端缩放、时间轴升起等） */
  moveSpring: { damping: 200, stiffness: 60, mass: 1 },
  moveFrames: 40,
  /** 打字机：每个字符帧数 */
  typeFramesPerChar: 2,
  /** 光标闪烁周期 */
  cursorBlinkFrames: 30,
  /** 时间轴滑动 / 年份滚动用的贝塞尔缓动 */
  slideBezier: [0.45, 0, 0.2, 1] as const,
} as const;

/** 幕间转场时序（帧） */
export const transition = {
  /** 当前内容淡出 */
  fadeOut: 12,
  /** 时间轴滑动到下一年份 */
  timelineSlide: 24,
  /** 新内容开始入场的时刻（相对幕起点），等时间轴滑完 */
  contentDelay: 24,
  /** 开场结尾 Timeline 从底部升起所用帧数 */
  timelineRise: 36,
  /** 「代价」节拍在幕结束前多少帧出现（含结尾淡出） */
  costLead: 150,
} as const;

/** Timeline 的年份范围 */
export const timelineRange = { from: 2009, to: 2026 } as const;

/** 有音频时，在音频时长之外追加的留白（秒） */
export const audioTailSeconds = 0.4;
