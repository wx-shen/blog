// 批量导出预览截图：node scripts/stills.mjs <compositionId> <outDir> <frame> [frame...]
// 可用 REMOTION_BROWSER 指定浏览器可执行文件
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const [compId = 'WebpackHistory', outDir = 'out/stills', ...frames] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const chromeMode = browserExecutable ? 'chrome-for-testing' : 'headless-shell';

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id: compId, browserExecutable, chromeMode, timeoutInMilliseconds: 120000 });
for (const f of frames.map(Number)) {
  const output = path.join(outDir, `${compId}-${String(f).padStart(5, '0')}.png`);
  await renderStill({ serveUrl, composition, frame: f, output, browserExecutable, chromeMode, timeoutInMilliseconds: 120000 });
  console.log('wrote', output);
}
