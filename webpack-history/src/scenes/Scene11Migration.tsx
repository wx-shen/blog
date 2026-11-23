import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import type { SceneProps } from '../components/SceneShell';
import { SceneTitle } from '../components/SceneTitle';
import { enterProgress, enterStyle } from '../lib/anim';
import { scene11 } from '../scenes';
import { colors, fonts, fontSize, fontWeight, layout, space, toolColors, transition, video } from '../theme';

const COPY = scene11.copy;

// ───────────── 时间表（帧，相对内容起点） ─────────────
// 与旁白对齐：主流框架依次换了引擎（时间轴随之走到 2025、2026）→ 跨端方案
const stopAt = (year: number) => {
  const stop = scene11.yearStops.find((s) => s.year === year);
  return stop ? stop.atFrame + transition.timelineSlide : 0;
};
const T = {
  frameworksLabel: 20,
  /** 主流框架四行：Angular → create-react-app（2025）→ Next.js → Nest.js（2026） */
  frameworks: [40, stopAt(2025), stopAt(2025) + 100, stopAt(2026)],
  crossLabel: 600,
  cross: [640, 700, 760, 820],
} as const;

// ───────────── 布局 ─────────────
const COL_GAP = space.xl;
const COL_WIDTH = (video.width - space.safe * 2 - COL_GAP) / 2;
const ROW = { top0: layout.contentTop + 70, height: 100, gap: 12 } as const;

type Row = { name: string; date: string; change: string; tool: string };

const MigrationRow: React.FC<{ row: Row; at: number; top: number; left: number }> = ({ row, at, top, left }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dot = row.tool in toolColors ? toolColors[row.tool as keyof typeof toolColors] : colors.textFaint;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: COL_WIDTH,
        height: ROW.height,
        padding: `${space.sm}px ${space.md}px`,
        boxSizing: 'border-box',
        background: colors.panel,
        border: `2px solid ${colors.panelBorder}`,
        borderRadius: space.radius,
        ...enterStyle(enterProgress(frame, fps, at)),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: fonts.sans, fontSize: fontSize.note, fontWeight: fontWeight.bold, color: colors.text }}>
          {row.name}
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: fontSize.small, color: colors.textDim }}>{row.date}</div>
      </div>
      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: space.sm }}>
        <div style={{ width: 14, height: 14, borderRadius: 4, background: dot, flexShrink: 0 }} />
        <div style={{ fontFamily: fonts.sans, fontSize: fontSize.small + 2, color: colors.accent }}>{row.change}</div>
      </div>
    </div>
  );
};

export const Scene11Migration: React.FC<SceneProps> = () => (
  <AbsoluteFill>
    <SceneTitle title={scene11.title} years={scene11.yearsLabel} />

    <Caption delay={T.frameworksLabel} size="body" tone="accent" weight="bold" style={{ position: 'absolute', left: space.safe, top: layout.contentTop }}>
      {COPY.frameworksLabel}
    </Caption>
    {COPY.frameworks.map((r, i) => (
      <MigrationRow key={r.name} row={r} at={T.frameworks[i]} left={space.safe} top={ROW.top0 + i * (ROW.height + ROW.gap)} />
    ))}

    <Caption
      delay={T.crossLabel}
      size="body"
      tone="accent"
      weight="bold"
      style={{ position: 'absolute', left: space.safe + COL_WIDTH + COL_GAP, top: layout.contentTop }}
    >
      {COPY.crossLabel}
    </Caption>
    {COPY.cross.map((r, i) => (
      <MigrationRow
        key={r.name}
        row={r}
        at={T.cross[i]}
        left={space.safe + COL_WIDTH + COL_GAP}
        top={ROW.top0 + i * (ROW.height + ROW.gap)}
      />
    ))}
  </AbsoluteFill>
);
