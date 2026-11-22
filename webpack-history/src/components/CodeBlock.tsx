import React from 'react';
import { interpolateColors, useCurrentFrame, useVideoConfig } from 'remotion';
import { enterProgress, enterStyle } from '../lib/anim';
import { alpha, colors, fonts, fontSize as fs, lineHeight as lh, motion, space } from '../theme';

type Props = {
  lines: readonly string[];
  filename?: string;
  /** 每行出现的帧（相对当前 Sequence）；省略则全部直接显示 */
  lineStartFrames?: readonly number[];
  /** 0 → 1：整体转为警示色 */
  warning?: number;
  /** 需要高亮的行号（0 起） */
  highlightLines?: readonly number[];
  highlightProgress?: number;
  /** 需要变暗划掉的行号（如 Tree Shaking 剔除的代码） */
  dimLines?: readonly number[];
  dimProgress?: number;
  width?: number;
  fontSize?: number;
  style?: React.CSSProperties;
};

type Token = { text: string; color: string };

const TOKEN_RE =
  /(\/\/.*$|'[^']*'|"[^"]*"|`[^`]*`|<\/?[a-zA-Z]+|\/?>|\b(?:const|let|var|module|exports|import|export|from|function|return|new|require|default)\b|\/\\[^/]+\/)/g;

const tokenize = (line: string): Token[] => {
  const tokens: Token[] = [];
  let last = 0;
  for (const m of line.matchAll(TOKEN_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) {
      tokens.push({ text: line.slice(last, idx), color: colors.text });
    }
    const t = m[0];
    let color: string = colors.codeKeyword;
    if (t.startsWith('//')) color = colors.codeComment;
    else if (/^['"`]/.test(t)) color = colors.codeString;
    else if (t.startsWith('<') || t.endsWith('>')) color = colors.codeTag;
    else if (t.startsWith('/')) color = colors.codeString;
    tokens.push({ text: t, color });
    last = idx + t.length;
  }
  if (last < line.length) {
    tokens.push({ text: line.slice(last), color: colors.text });
  }
  return tokens;
};

export const CodeBlock: React.FC<Props> = ({
  lines,
  filename,
  lineStartFrames,
  warning = 0,
  highlightLines = [],
  highlightProgress = 0,
  dimLines = [],
  dimProgress = 0,
  width = 900,
  fontSize = fs.code,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lineHeight = Math.round(fontSize * lh.code);
  const borderColor = interpolateColors(warning, [0, 1], [colors.panelBorder, colors.warning]);

  return (
    <div
      style={{
        width,
        background: colors.panel,
        border: `2px solid ${borderColor}`,
        borderRadius: space.radius,
        boxShadow: warning > 0 ? `0 0 ${40 * warning}px ${alpha(colors.warning, 0.25 * warning)}` : 'none',
        overflow: 'hidden',
        ...style,
      }}
    >
      {filename ? (
        <div
          style={{
            padding: `12px ${space.md}px`,
            borderBottom: `1px solid ${borderColor}`,
            fontFamily: fonts.mono,
            fontSize: fs.small,
            color: interpolateColors(warning, [0, 1], [colors.textDim, colors.warning]),
          }}
        >
          {filename}
        </div>
      ) : null}
      <div style={{ padding: `${space.md}px ${space.md}px`, fontFamily: fonts.mono, fontSize }}>
        {lines.map((line, i) => {
          const start = lineStartFrames?.[i];
          if (start !== undefined && frame < start) {
            return null;
          }
          const p = start === undefined ? 1 : enterProgress(frame, fps, start, motion.lineEnterFrames);
          const hl = highlightLines.includes(i) ? highlightProgress : 0;
          const dim = dimLines.includes(i) ? dimProgress : 0;
          return (
            <div
              key={i}
              style={{
                height: lineHeight,
                lineHeight: `${lineHeight}px`,
                whiteSpace: 'pre',
                position: 'relative',
                ...enterStyle(p),
                opacity: p * (1 - dim * 0.7),
              }}
            >
              {hl > 0 ? (
                <div
                  style={{
                    position: 'absolute',
                    left: -space.md,
                    right: -space.md,
                    top: 0,
                    bottom: 0,
                    background: alpha(colors.accent, 0.12 * hl),
                    borderLeft: `4px solid ${alpha(colors.accent, hl)}`,
                  }}
                />
              ) : null}
              <span style={{ position: 'relative' }}>
                {tokenize(line).map((t, j) => (
                  <span key={j} style={{ color: interpolateColors(warning, [0, 1], [t.color, colors.warning]) }}>
                    {t.text}
                  </span>
                ))}
              </span>
              {dim > 0 ? (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: lineHeight / 2,
                    height: 2,
                    width: `${dim * 100}%`,
                    background: colors.textDim,
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
