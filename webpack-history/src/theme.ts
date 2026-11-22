import { loadFont as loadNotoSansSC } from '@remotion/google-fonts/NotoSansSC';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';

/**
 * 全片唯一的视觉参数来源。组件与分镜只从这里取颜色、字体、尺寸、缓动与时序。
 */

// 思源黑体按 unicode-range 拆成上百个分片，只加载 400 / 700 两个字重以减少请求
const sans = loadNotoSansSC('normal', {
  weights: ['400', '700'],
  subsets: ['chinese-simplified', 'latin'],
  ignoreTooManyRequestsWarning: true,
});

const mono = loadJetBrainsMono('normal', {
  weights: ['400', '500', '700'],
  subsets: ['latin'],
});

export const video = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

export const colors = {
  bg: '#0B1020',
  grid: 'rgba(141, 214, 249, 0.045)',
  accent: '#8DD6F9', // webpack 蓝
  secondary: '#1C78C0', // 辅助蓝
  warning: '#F2994A', // 痛点 / 警示
  text: '#E8EEF7',
  textDim: '#8A96AD',
  textFaint: '#4A5571',
  panel: 'rgba(18, 26, 48, 0.88)',
  panelBorder: 'rgba(141, 214, 249, 0.18)',
  success: '#7FD8A6',
  codeKeyword: '#8DD6F9',
  codeString: '#C3E88D',
  codeComment: '#5C6A88',
  codeTag: '#82AAFF',
} as const;

export const fonts = {
  sans: `${sans.fontFamily}, "PingFang SC", "Microsoft YaHei", sans-serif`,
  // 等宽字体回退到思源黑体，保证代码/终端中的中文正常显示
  mono: `${mono.fontFamily}, ${sans.fontFamily}, "SFMono-Regular", Menlo, monospace`,
} as const;

export const fontSize = {
  title: 72,
  body: 40,
  note: 28,
  year: 104,
  code: 30,
  small: 22,
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  bold: 700,
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

/** 画面分区（单位 px） */
export const layout = {
  headerTop: space.safe - 20, // 年份与标题所在行
  contentTop: 270, // 正文区顶部
  contentBottom: 850, // 正文区底部（Timeline 之上）
  timelineTop: 880, // Timeline 区顶部
  timelineHeight: 80, // 到 960 = 1080 - safe
  yearSpacing: 150, // Timeline 上相邻年份的间距
} as const;

/** 缓动 / spring 参数 */
export const motion = {
  /** 入场 spring：damping 200 → 无回弹 */
  enterSpring: { damping: 200, stiffness: 100, mass: 1 },
  /** 入场位移（自下而上） */
  enterOffset: 30,
  /** 入场 spring 被拉伸到的帧数（用于错峰编排，保证同屏运动元素 ≤ 3） */
  enterFrames: 26,
  /** 较慢的位移 spring（终端缩放、时间轴升起等） */
  moveSpring: { damping: 200, stiffness: 60, mass: 1 },
  /** 打字机：每个字符帧数 */
  typeFramesPerChar: 2,
  /** 光标闪烁周期 */
  cursorBlinkFrames: 30,
  /** 时间轴滑动 / 年份滚动用的贝塞尔缓动 */
  slideBezier: [0.45, 0, 0.2, 1] as const,
  /** 位移类 spring 拉伸帧数 */
  moveFrames: 40,
} as const;

/** 幕间转场时序（帧） */
export const transition = {
  /** 当前内容淡出 */
  fadeOut: 12,
  /** 时间轴滑动到下一年份 */
  timelineSlide: 24,
  /** 新内容开始淡入的时刻（相对幕起点），等时间轴滑完 */
  contentDelay: 24,
  /** 开场结尾 Timeline 从底部升起所用帧数 */
  timelineRise: 36,
} as const;

/** Timeline 的年份范围 */
export const timelineRange = { from: 2009, to: 2026 } as const;

/** 有音频时，在音频时长之外追加的留白（秒） */
export const audioTailSeconds = 0.4;
