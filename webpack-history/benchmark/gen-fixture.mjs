// 生成测试用例：把 three.js 的源码复制 10 份，入口同时引用全部 10 份。
// 做法参照 esbuild 官方 benchmark（three.js ×10）。生成结果在 fixture/，不入库。
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const COPIES = 10;
// three 的 package.json 不在 exports 里，直接按 node_modules 路径取源码
const threeSrc = path.resolve('node_modules/three/src');
const out = path.resolve('fixture');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const lines = [];
for (let i = 1; i <= COPIES; i++) {
  cpSync(threeSrc, path.join(out, `copy${i}`), { recursive: true });
  lines.push(`import * as copy${i} from './copy${i}/Three.js';`);
}
// 把命名空间对象挂到全局，保证各工具都无法 tree shake 掉任何一份
lines.push(`globalThis.copies = [${Array.from({ length: COPIES }, (_, i) => `copy${i + 1}`).join(', ')}];`);
writeFileSync(path.join(out, 'entry.js'), lines.join('\n') + '\n');
console.log(`fixture ready: ${COPIES} copies of three.js src → ${out}`);
