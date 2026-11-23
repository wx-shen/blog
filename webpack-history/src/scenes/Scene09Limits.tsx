import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { CostBeat } from '../components/CostBeat';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { enterProgress, enterStyle, rangeProgress } from '../lib/anim';
import { costCue, cue } from '../lib/cues';
import { scene09, thread } from '../scenes';
import { alpha, colors, fonts, fontSize, fontWeight, layout, space, video } from '../theme';

const COPY = scene09.copy;

// ───────────── 时间表（帧，相对内容起点） ─────────────
// 按旁白对齐：问题 → 三个前提（第一、第二、第三）→ 补救 → 却动不了前提 → 代价（只能另起炉灶）
const at = (phrase: string, offset = 0) => cue(scene09.id, phrase, offset);
const remedies = at('持久化缓存、按需编译');
const T = {
  question: 10,
  premises: [at('第一，开发时要先全量打包'), at('第二，构建主要跑在'), at('第三，插件直接操作')],
  remediesLabel: remedies,
  /** 持久化缓存、按需编译随旁白出现；thread-loader 在第二个前提里已经念到，紧随其后补上 */
  remedies: [at('持久化缓存、按需编译'), at('按需编译'), at('按需编译', 30)],
  locked: at('却动不了这三个前提'),
  lockedStep: 20,
} as const;

// ───────────── 布局 ─────────────
const CARD = { left: space.safe, width: 1000, height: 130, top0: layout.contentTop + 80, step: 160 } as const;
const REMEDY = { left: 1240, width: video.width - space.safe - 1240, height: 58 } as const;
const cardTop = (row: number) => CARD.top0 + row * CARD.step;

/** 同一个前提下的第几个补救，用于在卡片高度内上下排开 */
const remedyOffset = (index: number) => {
  const row = COPY.remedies[index].row;
  const siblings = COPY.remedies.filter((r) => r.row === row);
  const k = siblings.indexOf(COPY.remedies[index]);
  const total = siblings.length * REMEDY.height + (siblings.length - 1) * space.sm;
  return (CARD.height - total) / 2 + k * (REMEDY.height + space.sm);
};

export const Scene09Limits: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <SceneTitle title={scene09.title} years={scene09.yearsLabel} />

      <Caption
        delay={T.question}
        size="body"
        tone="accent"
        weight="bold"
        style={{ position: 'absolute', left: space.safe, top: layout.contentTop }}
      >
        {COPY.question}
      </Caption>

      {/* 三个前提 */}
      {COPY.premises.map((p, i) => {
        const appear = enterProgress(frame, fps, T.premises[i]);
        const locked = rangeProgress(frame, T.locked + i * T.lockedStep, T.locked + i * T.lockedStep + 16);
        return (
          <div
            key={p.title}
            style={{
              position: 'absolute',
              left: CARD.left,
              top: cardTop(i),
              width: CARD.width,
              height: CARD.height,
              display: 'flex',
              alignItems: 'center',
              gap: space.lg,
              padding: `0 ${space.lg}px`,
              boxSizing: 'border-box',
              background: colors.panel,
              border: `2px solid ${locked > 0 ? alpha(colors.warning, 0.25 + 0.45 * locked) : colors.panelBorder}`,
              borderRadius: space.radius,
              ...enterStyle(appear),
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                flexShrink: 0,
                borderRadius: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: alpha(colors.accent, 0.12),
                fontFamily: fonts.mono,
                fontSize: fontSize.note,
                fontWeight: fontWeight.bold,
                color: colors.accent,
              }}
            >
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: fonts.sans, fontSize: fontSize.body, fontWeight: fontWeight.bold, color: colors.text }}>
                {p.title}
              </div>
              <div style={{ marginTop: 4, fontFamily: fonts.sans, fontSize: fontSize.small + 2, color: colors.textDim }}>
                {p.detail}
              </div>
            </div>
            {/* 前提不变 */}
            <div
              style={{
                flexShrink: 0,
                padding: `${space.xs / 2}px ${space.sm}px`,
                borderRadius: space.radiusSm,
                background: alpha(colors.warning, 0.15),
                fontFamily: fonts.sans,
                fontSize: fontSize.small,
                fontWeight: fontWeight.bold,
                color: colors.warning,
                opacity: locked,
              }}
            >
              {COPY.lockedLabel}
            </div>
          </div>
        );
      })}

      {/* 补救 */}
      <Caption
        delay={T.remediesLabel}
        size="note"
        tone="dim"
        style={{ position: 'absolute', left: REMEDY.left, top: layout.contentTop + 20 }}
      >
        {COPY.remediesLabel}
      </Caption>
      <svg width={video.width} height={video.height} style={{ position: 'absolute', left: 0, top: 0 }}>
        {COPY.remedies.map((r, i) => {
          const p = rangeProgress(frame, T.remedies[i], T.remedies[i] + 16);
          if (p <= 0) return null;
          const y = cardTop(r.row) + remedyOffset(i) + REMEDY.height / 2;
          const x1 = REMEDY.left;
          const x2 = CARD.left + CARD.width;
          return (
            <line key={r.name} x1={x1} y1={y} x2={x1 + (x2 - x1) * p} y2={y} stroke={alpha(colors.accent, 0.5)} strokeWidth={2} strokeDasharray="6 8" />
          );
        })}
      </svg>
      {COPY.remedies.map((r, i) => (
        <div
          key={r.name}
          style={{
            position: 'absolute',
            left: REMEDY.left,
            top: cardTop(r.row) + remedyOffset(i),
            width: REMEDY.width,
            height: REMEDY.height,
            display: 'flex',
            alignItems: 'center',
            gap: space.md,
            padding: `0 ${space.md}px`,
            boxSizing: 'border-box',
            background: alpha(colors.accent, 0.08),
            border: `2px solid ${alpha(colors.accent, 0.45)}`,
            borderRadius: space.radiusSm,
            ...enterStyle(enterProgress(frame, fps, T.remedies[i])),
          }}
        >
          <span style={{ fontFamily: fonts.mono, fontSize: fontSize.small, fontWeight: fontWeight.bold, color: colors.accent, whiteSpace: 'nowrap' }}>
            {r.name}
          </span>
          <span style={{ fontFamily: fonts.sans, fontSize: fontSize.small - 2, color: colors.textDim }}>{r.note}</span>
        </div>
      ))}

      <CostBeat at={costCue(scene09.id, '要突破，只能另起炉灶', duration)} label={thread.costLabel} text={COPY.cost.text} notes={COPY.cost.notes} />
    </AbsoluteFill>
  );
};
