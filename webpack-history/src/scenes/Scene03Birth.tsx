import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { getScene } from '../scenes';
import { enterProgress, enterStyle, moveProgress, rangeProgress, slideEasing } from '../lib/anim';
import { colors, fonts, fontSize, fontWeight, space } from '../theme';

const SCENE = getScene('scene03-birth');

const CUBE = { x: 960, y: 520, r: 130 };

const FILES = [
  { label: 'JS', name: 'index.js', color: '#F7DF6E' },
  { label: 'CSS', name: 'style.css', color: '#8DD6F9' },
  { label: 'PNG', name: 'logo.png', color: '#7FD8A6' },
  { label: 'WOFF', name: 'font.woff', color: '#C792EA' },
] as const;

const ICON = { w: 84, h: 104, x: 330, y0: 370, step: 120 };
const OUT = { x: 1590, y: CUBE.y };

const T = {
  iconsIn: 6,
  iconStep: 16,
  cubeIn: 84,
  fly: 140,
  flyStep: 24,
  flyDur: 46,
  output: 300,
  kw1: 380,
  kw2: 420,
  author: 500,
} as const;

const FileIcon: React.FC<{ label: string; color: string; w?: number; h?: number }> = ({
  label,
  color,
  w = ICON.w,
  h = ICON.h,
}) => {
  const fold = w * 0.28;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <path
        d={`M2 2 H${w - fold} L${w - 2} ${fold} V${h - 2} H2 Z`}
        fill="rgba(18,26,48,0.95)"
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d={`M${w - fold} 2 V${fold} H${w - 2}`} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />
      <text
        x={w / 2}
        y={h * 0.68}
        textAnchor="middle"
        fontFamily={fonts.mono}
        fontWeight={700}
        fontSize={label.length > 3 ? 18 : 22}
        fill={color}
      >
        {label}
      </text>
    </svg>
  );
};

/** 等轴立方体（外壳 + 内核），致敬 webpack 的标志造型 */
const Cube: React.FC<{ r: number; glow: number }> = ({ r, glow }) => {
  const pt = (deg: number, rr: number) => {
    const a = (deg * Math.PI) / 180;
    return [Math.cos(a) * rr, Math.sin(a) * rr] as const;
  };
  const faces = (rr: number) => {
    const top = pt(-90, rr);
    const ur = pt(-30, rr);
    const lr = pt(30, rr);
    const bot = pt(90, rr);
    const ll = pt(150, rr);
    const ul = pt(210, rr);
    const c = [0, 0] as const;
    const poly = (ps: readonly (readonly [number, number])[]) => ps.map((p) => p.join(',')).join(' ');
    return {
      top: poly([top, ur, c, ul]),
      right: poly([c, ur, lr, bot]),
      left: poly([c, bot, ll, ul]),
    };
  };
  const outer = faces(r);
  const inner = faces(r * 0.5);
  const size = r * 2 + 40;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
      style={{ overflow: 'visible', filter: `drop-shadow(0 0 ${20 + glow * 40}px rgba(141,214,249,${0.25 + glow * 0.45}))` }}
    >
      <polygon points={outer.top} fill="rgba(141,214,249,0.16)" stroke={colors.accent} strokeWidth={3} strokeLinejoin="round" />
      <polygon points={outer.right} fill="rgba(141,214,249,0.08)" stroke={colors.accent} strokeWidth={3} strokeLinejoin="round" />
      <polygon points={outer.left} fill="rgba(141,214,249,0.11)" stroke={colors.accent} strokeWidth={3} strokeLinejoin="round" />
      <polygon points={inner.top} fill="#2A8BD6" stroke={colors.bg} strokeWidth={2} />
      <polygon points={inner.right} fill={colors.secondary} stroke={colors.bg} strokeWidth={2} />
      <polygon points={inner.left} fill="#165F99" stroke={colors.bg} strokeWidth={2} />
    </svg>
  );
};

/** 三次贝塞尔曲线上的点 */
const bezier = (
  t: number,
  p0: readonly [number, number],
  p1: readonly [number, number],
  p2: readonly [number, number],
  p3: readonly [number, number],
) => {
  const u = 1 - t;
  const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
  const y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
  return [x, y] as const;
};

const Keyword: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        padding: `${space.sm}px ${space.lg}px`,
        border: `2px solid ${colors.accent}`,
        borderRadius: 999,
        fontFamily: fonts.sans,
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
        color: colors.accent,
        background: 'rgba(141,214,249,0.06)',
        ...enterStyle(enterProgress(frame, fps, delay)),
      }}
    >
      {text}
    </div>
  );
};

export const Scene03Birth: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cubeP = enterProgress(frame, fps, T.cubeIn);

  // 每个文件抵达立方体时，立方体亮一下
  let glow = 0;
  FILES.forEach((_, i) => {
    const arrive = T.fly + i * T.flyStep + T.flyDur;
    glow += interpolate(frame, [arrive - 6, arrive, arrive + 18], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  });

  const out = moveProgress(frame, fps, T.output);
  const outX = interpolate(out, [0, 1], [CUBE.x, OUT.x]);
  const lineEnd = interpolate(out, [0, 1], [CUBE.x + CUBE.r, OUT.x - 70]);

  return (
    <AbsoluteFill>
      <SceneTitle title={SCENE.title} years={SCENE.yearsLabel} />

      {/* 区域标签 */}
      <Caption
        delay={T.iconsIn}
        exitAt={T.fly + FILES.length * T.flyStep + T.flyDur - 10}
        size="note"
        style={{ position: 'absolute', left: ICON.x - 40, top: 270, fontFamily: fonts.mono }}
      >
        src/
      </Caption>

      {/* 四类文件：沿曲线汇入立方体 */}
      {FILES.map((f, i) => {
        const appear = enterProgress(frame, fps, T.iconsIn + i * T.iconStep);
        const start = T.fly + i * T.flyStep;
        const t = rangeProgress(frame, start, start + T.flyDur, slideEasing);
        const p0 = [ICON.x, ICON.y0 + i * ICON.step] as const;
        const p3 = [CUBE.x, CUBE.y] as const;
        const [x, y] = bezier(t, p0, [p0[0] + 320, p0[1]], [CUBE.x - 300, CUBE.y], p3);
        const scale = interpolate(t, [0, 0.7, 1], [1, 0.85, 0.25]);
        const fade = interpolate(t, [0.75, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        if (t >= 1) return null;
        return (
          <div
            key={f.label}
            style={{
              position: 'absolute',
              left: x - ICON.w / 2,
              top: y - ICON.h / 2,
              opacity: appear * fade,
              transform: `translateY(${(1 - appear) * 30}px) scale(${scale})`,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <FileIcon label={f.label} color={f.color} />
            <div
              style={{
                position: 'absolute',
                left: -170,
                width: 150,
                textAlign: 'right',
                fontFamily: fonts.mono,
                fontSize: 22,
                color: colors.textDim,
                opacity: 1 - t * 3,
              }}
            >
              {f.name}
            </div>
          </div>
        );
      })}

      {/* 输出连线 */}
      {frame >= T.output ? (
        <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
          <line
            x1={CUBE.x + CUBE.r}
            y1={CUBE.y}
            x2={lineEnd}
            y2={CUBE.y}
            stroke={colors.accent}
            strokeWidth={3}
            strokeDasharray="10 10"
            opacity={0.7}
          />
        </svg>
      ) : null}

      {/* 中央立方体 */}
      <div
        style={{
          position: 'absolute',
          left: CUBE.x - CUBE.r - 20,
          top: CUBE.y - CUBE.r - 20,
          ...enterStyle(cubeP),
        }}
      >
        <Cube r={CUBE.r} glow={Math.min(1, glow)} />
      </div>

      {/* bundle.js */}
      {frame >= T.output ? (
        <div
          style={{
            position: 'absolute',
            left: outX - 60,
            top: OUT.y - 75,
            opacity: out,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <FileIcon label="JS" color={colors.accent} w={120} h={150} />
          <div style={{ fontFamily: fonts.mono, fontSize: fontSize.note, color: colors.accent, whiteSpace: 'nowrap' }}>
            bundle.js
          </div>
        </div>
      ) : null}
      <Caption
        delay={T.output + 20}
        size="note"
        style={{ position: 'absolute', left: OUT.x - 40, top: 270, fontFamily: fonts.mono }}
      >
        dist/
      </Caption>

      {/* 关键词 */}
      <div
        style={{
          position: 'absolute',
          top: 690,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: space.lg,
        }}
      >
        <Keyword text="一切皆模块" delay={T.kw1} />
        <Keyword text="代码分割" delay={T.kw2} />
      </div>

      {/* 作者 */}
      <Caption
        delay={T.author}
        size="note"
        tone="dim"
        style={{ position: 'absolute', top: 800, width: '100%', textAlign: 'center' }}
      >
        作者 <span style={{ color: colors.text, fontWeight: fontWeight.medium }}>Tobias Koppers</span>
        <span style={{ margin: '0 20px', color: colors.textFaint }}>·</span>
        起点：想在 JavaScript 里实现 GWT 那样的代码分割
      </Caption>
    </AbsoluteFill>
  );
};
