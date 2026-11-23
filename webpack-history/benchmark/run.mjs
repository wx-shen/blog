// 依次运行各工具的生产构建，每个工具先预热 1 次，再计时 RUNS 次，取中位数。
// 用法：node run.mjs [RUNS]   结果写入 results.json
import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';

const RUNS = Number(process.argv[2] ?? 5);
const bin = (name) => `node_modules/.bin/${name}`;
const tools = [
  { label: 'webpack', cmd: [bin('webpack'), '--config', 'webpack.config.cjs'], out: 'dist/webpack/bundle.js' },
  { label: 'Rspack', cmd: [bin('rspack'), 'build', '--config', 'rspack.config.cjs'], out: 'dist/rspack/bundle.js' },
  { label: 'Vite', cmd: [bin('vite'), 'build', '--config', 'vite.config.mjs'], out: 'dist/vite/bundle.js' },
  {
    label: 'esbuild',
    cmd: [bin('esbuild'), 'fixture/entry.js', '--bundle', '--minify', '--outfile=dist/esbuild/bundle.js', '--log-level=warning'],
    out: 'dist/esbuild/bundle.js',
  },
];

const version = (pkg) => JSON.parse(readFileSync(`node_modules/${pkg}/package.json`, 'utf8')).version;
const once = (t) => {
  rmSync(t.out.split('/').slice(0, 2).join('/'), { recursive: true, force: true });
  const start = process.hrtime.bigint();
  const r = spawnSync(t.cmd[0], t.cmd.slice(1), { encoding: 'utf8' });
  const ms = Number(process.hrtime.bigint() - start) / 1e6;
  if (r.status !== 0) throw new Error(`${t.label} failed:\n${r.stdout}\n${r.stderr}`);
  return ms;
};
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const results = [];
for (const t of tools) {
  once(t); // 预热
  const times = Array.from({ length: RUNS }, () => once(t));
  const r = {
    label: t.label,
    medianSeconds: +(median(times) / 1000).toFixed(2),
    runsSeconds: times.map((x) => +(x / 1000).toFixed(2)),
    outputKiB: +(statSync(t.out).size / 1024).toFixed(0),
  };
  results.push(r);
  console.log(`${r.label.padEnd(8)} median ${r.medianSeconds}s  runs ${r.runsSeconds.join(' / ')}  output ${r.outputKiB} KiB`);
}

writeFileSync(
  'results.json',
  JSON.stringify(
    {
      date: new Date().toISOString(),
      fixture: 'three.js src ×10（three ' + version('three') + '），生产构建 + 压缩，无 source map',
      machine: { cpus: os.cpus().length, cpuModel: os.cpus()[0].model, memGiB: Math.round(os.totalmem() / 2 ** 30), node: process.version, platform: `${os.platform()} ${os.arch()}` },
      versions: { webpack: version('webpack'), '@rspack/core': version('@rspack/core'), vite: version('vite'), esbuild: version('esbuild') },
      runs: RUNS,
      results,
    },
    null,
    2,
  ) + '\n',
);
