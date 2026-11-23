// Vite 8（Rolldown）：库模式打一个入口，默认压缩，不开 source map
import { defineConfig } from 'vite';

export default defineConfig({
  logLevel: 'warn',
  build: {
    outDir: 'dist/vite',
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
    lib: { entry: 'fixture/entry.js', formats: ['es'], fileName: () => 'bundle.js' },
  },
});
