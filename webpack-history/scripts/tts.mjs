// 用 Google Cloud Text-to-Speech 为每一幕生成旁白音频：public/audio/<scene id>.mp3
//
// 用法：node scripts/tts.mjs [幕号...]        例：node scripts/tts.mjs 1 2   （省略则生成全部 13 幕）
//
// - 旁白来源：narration.md（每幕「## N 标题 · 时长」下的正文；「>」开头的事实出处不朗读）。
// - 【停顿】处与段落之间插入静音（【停顿 2 秒】可指定时长）；英文缩写（SPELL）用 SSML 逐字母念，其余文字原样合成。
// - 每句（以 。！？； 结尾）单独合成后拼接，因此能得到每句话在音频中的精确起止时间，
//   写入 src/data/narrationTimings.json，供各幕时间表对齐（见 src/lib/cues.ts）。
//   （Chirp3-HD 音色不返回 SSML <mark> 的时间点，所以用分句合成代替。）
// - 认证：设置了环境变量 GOOGLE_TTS_API_KEY 时以 X-Goog-Api-Key 发送；
//   在 Claude Code 云端会话中由网络代理自动附加密钥，无需设置。
// - 依赖本机的 ffmpeg 拼接音频。
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const VOICE = { languageCode: 'cmn-CN', name: 'cmn-CN-Chirp3-HD-Kore' };
const SAMPLE_RATE = 24000;
/** 【停顿】处的静音（秒） */
const PAUSE = 0.6;
/** 段落之间的静音（秒） */
const PARAGRAPH = 0.9;
/**
 * 发音替换表：只影响送去合成的文本，narration.md 与画面文字不变。
 * 例：['npm', 'N P M']。目前原文的效果最好，表为空。
 */
const PRONUNCIATIONS = [];
/** 逐字母念的英文缩写（按完整单词匹配，区分大小写） */
const SPELL = ['npm', 'ES', 'CSS', 'CLI', 'AMD', 'GWT', 'ID', 'UMD', 'HTML'];

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const sceneIds = [...readFileSync(path.join(root, 'src/scenes.ts'), 'utf8').matchAll(/id: '(scene\d{2}-[a-z0-9-]+)'/g)].map((m) => m[1]);

/** 解析 narration.md → [{ n, id, segments: [{ text } | { silence }] }] */
const parseNarration = () => {
  const md = readFileSync(path.join(root, 'narration.md'), 'utf8');
  return md
    .split(/\n## /)
    .slice(1)
    .map((block) => {
      const [head, ...rest] = block.split('\n');
      const n = Number(head.split(' ')[0]);
      const body = rest
        .join('\n')
        .split('\n')
        .filter((l) => !l.startsWith('>') && l.trim() !== '---')
        .join('\n');
      const paragraphs = body
        .split(/\n\s*\n/)
        .map((p) => p.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
      const segments = [];
      paragraphs.forEach((p, pi) => {
        if (pi > 0) segments.push({ silence: PARAGRAPH });
        // 【停顿】补 PAUSE 秒；【停顿 2 秒】补指定秒数（画面需要多留时间时使用）
        const pauses = [...p.matchAll(/【([^】]*)】/g)].map((m) => {
          const n = m[1].match(/([\d.]+)\s*秒/);
          return n ? Number(n[1]) : PAUSE;
        });
        p.split(/【[^】]*】/).forEach((piece, si) => {
          if (si > 0) segments.push({ silence: pauses[si - 1] });
          // 按句切分：以 。！？； 结尾（保留标点）
          for (const sentence of piece.match(/[^。！？；]+[。！？；]?/g) ?? []) {
            const text = sentence.trim();
            if (text) segments.push({ text });
          }
        });
      });
      // 去掉结尾的静音
      while (segments.length && 'silence' in segments[segments.length - 1]) segments.pop();
      return { n, id: sceneIds[n - 1], segments };
    });
};

const applyPronunciations = (text) => PRONUNCIATIONS.reduce((t, [from, to]) => t.split(from).join(to), text);

const escapeXml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const SPELL_RE = new RegExp(`(?<![A-Za-z])(${SPELL.join('|')})(?![A-Za-z])`, 'g');
const toSsml = (text) =>
  `<speak>${escapeXml(applyPronunciations(text)).replace(SPELL_RE, '<say-as interpret-as="characters">$1</say-as>')}</speak>`;

const synthesize = async (text) => {
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.GOOGLE_TTS_API_KEY) headers['X-Goog-Api-Key'] = process.env.GOOGLE_TTS_API_KEY;
  const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      input: { ssml: toSsml(text) },
      voice: VOICE,
      audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: SAMPLE_RATE },
    }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const { audioContent } = await res.json();
  return Buffer.from(audioContent, 'base64');
};

const ffmpeg = (args) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args]);
const probeSeconds = (file) =>
  Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());

const buildScene = async (scene, outDir) => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), `tts-${scene.id}-`));
  const parts = [];
  const sentences = [];
  let t = 0;
  for (const [i, seg] of scene.segments.entries()) {
    const file = path.join(tmp, `${String(i).padStart(3, '0')}.wav`);
    if ('silence' in seg) {
      ffmpeg(['-f', 'lavfi', '-i', `anullsrc=r=${SAMPLE_RATE}:cl=mono`, '-t', String(seg.silence), file]);
    } else {
      writeFileSync(file, await synthesize(seg.text));
    }
    const d = probeSeconds(file);
    if (!('silence' in seg)) sentences.push({ text: seg.text, start: +t.toFixed(3), end: +(t + d).toFixed(3) });
    t += d;
    parts.push(file);
  }
  const list = path.join(tmp, 'list.txt');
  writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
  const out = path.join(outDir, `${scene.id}.mp3`);
  ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-ar', String(SAMPLE_RATE), '-ac', '1', '-b:a', '128k', out]);
  rmSync(tmp, { recursive: true, force: true });
  const seconds = probeSeconds(out);
  return { id: scene.id, seconds, sentences };
};

const wanted = process.argv.slice(2).map(Number);
const scenes = parseNarration().filter((s) => wanted.length === 0 || wanted.includes(s.n));
const outDir = path.join(root, 'public/audio');
mkdirSync(outDir, { recursive: true });
const timingsFile = path.join(root, 'src/data/narrationTimings.json');
let timings = {};
try {
  timings = JSON.parse(readFileSync(timingsFile, 'utf8'));
} catch {
  timings = {};
}
for (const scene of scenes) {
  const r = await buildScene(scene, outDir);
  timings[r.id] = { duration: +r.seconds.toFixed(3), sentences: r.sentences };
  console.log(`${String(scene.n).padStart(2)} ${r.id.padEnd(22)} ${r.seconds.toFixed(2)}s  ${r.sentences.length} 句`);
}
// 按幕的顺序写出，便于阅读与 diff
const ordered = Object.fromEntries(sceneIds.filter((id) => id in timings).map((id) => [id, timings[id]]));
writeFileSync(timingsFile, JSON.stringify(ordered, null, 2) + '\n');
