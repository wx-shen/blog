import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import type { SceneProps } from '../components/SceneShell';
import { enterProgress, enterStyle, exitProgress } from '../lib/anim';
import { cue } from '../lib/cues';
import { scene03, scene04, scene05, scene06, scene07, scene09, scene10, scene13 } from '../scenes';
import { colors, fonts, fontSize, fontWeight, layout, space, video } from '../theme';

const COPY = scene13.copy;

/** 回顾全片的「代价」主线：直接取各幕的 copy.cost，避免文案重复 */
const RECAP = [scene03, scene04, scene05, scene06, scene07, scene09, scene10].map((s) => ({
  title: s.title,
  text: s.copy.cost.text,
}));

// ───────────── 时间表（帧，相对内容起点） ─────────────
// 按旁白对齐：「打包工具会更替，问题与思想会留下」→「每一个方案，都带着它的代价」回顾各幕代价（旁白停顿 3 秒）
// →「这就是 webpack 的故事」时间轴退场（scenes.ts 的 chromeExitAt）、片尾标题
const at = (phrase: string, offset = 0) => cue(scene13.id, phrase, offset);
const recapLabel = at('每一个方案，都带着它的代价');
const ending = at('这就是 webpack 的故事');
const T = {
  line1: 0,
  line2: at('问题与思想会留下'),
  linesOut: recapLabel - 14,
  recapLabel,
  recap: recapLabel + 12,
  recapStep: 12,
  recapOut: ending - 14,
  endTitle: ending,
  endSubtitle: ending + 30,
} as const;

export const Scene13Outro: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const recapOut = exitProgress(frame, T.recapOut);
  const linesOut = exitProgress(frame, T.linesOut);
  const titleP = enterProgress(frame, fps, T.endTitle);

  return (
    <AbsoluteFill>
      {/* ① 一路走来的代价 */}
      {frame >= T.recapLabel && recapOut > 0 ? (
        <AbsoluteFill style={{ opacity: recapOut }}>
          <Caption delay={T.recapLabel} size="note" tone="dim" style={{ position: 'absolute', left: space.safe, top: layout.contentTop - 20 }}>
            {COPY.recapLabel}
          </Caption>
          {RECAP.map((r, i) => (
            <div
              key={r.title}
              style={{
                position: 'absolute',
                left: space.safe,
                top: layout.contentTop + 30 + i * 74,
                display: 'flex',
                gap: space.lg,
                alignItems: 'baseline',
                ...enterStyle(enterProgress(frame, fps, T.recap + i * T.recapStep)),
              }}
            >
              <div style={{ width: 200, fontFamily: fonts.sans, fontSize: fontSize.small + 2, color: colors.textDim }}>{r.title}</div>
              <div style={{ fontFamily: fonts.sans, fontSize: fontSize.note, color: colors.warning }}>{r.text}</div>
            </div>
          ))}
        </AbsoluteFill>
      ) : null}

      {/* ② 收尾两句 */}
      {frame >= T.line1 && linesOut > 0 ? (
        <div style={{ position: 'absolute', top: video.height / 2 - fontSize.title * 1.4, width: '100%', textAlign: 'center', opacity: linesOut }}>
          <Caption delay={T.line1} size="title" tone="normal" weight="bold">
            {COPY.lines[0]}
          </Caption>
          <Caption delay={T.line2} size="title" tone="accent" weight="bold" style={{ marginTop: space.md }}>
            {COPY.lines[1]}
          </Caption>
        </div>
      ) : null}

      {/* ③ 片尾标题 */}
      {frame >= T.endTitle ? (
        <>
          <div
            style={{
              position: 'absolute',
              top: video.height / 2 - fontSize.title,
              width: '100%',
              textAlign: 'center',
              fontFamily: fonts.sans,
              fontSize: fontSize.title,
              fontWeight: fontWeight.bold,
              color: colors.text,
              letterSpacing: 4,
              ...enterStyle(titleP),
            }}
          >
            <span style={{ color: colors.accent }}>{COPY.endTitleAccent}</span>
            {COPY.endTitleRest}
          </div>
          {COPY.endSubtitle ? (
            <Caption
              delay={T.endSubtitle}
              size="note"
              tone="dim"
              style={{ position: 'absolute', top: video.height / 2 + space.lg, width: '100%', textAlign: 'center' }}
            >
              {COPY.endSubtitle}
            </Caption>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
