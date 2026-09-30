import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';

const outdir = path.resolve('dist-electron');
if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir, { recursive: true });
}

async function buildElectron() {
  await esbuild.build({
    entryPoints: [
      { in: 'electron/main.ts', out: 'main' },
      { in: 'electron/preload.ts', out: 'preload' },
    ],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outdir: 'dist-electron',
    outExtension: { '.js': '.cjs' },
    external: ['electron'],
    sourcemap: true,
  });

  console.log('✓ Electron main and preload built successfully in dist-electron/');
}

buildElectron().catch((err) => {
  console.error('Failed to build electron:', err);
  process.exit(1);
});
