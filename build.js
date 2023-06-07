import { build } from 'esbuild';

Promise.all([
  build({
    entryPoints: ['src/admin/index.ts'],
    bundle: true,
    platform: 'browser',
    outfile: 'public/admin.js',
    minify: true,
    jsxFactory: 'React',
    jsxFragment: 'Fragment',
  }),
  build({
    entryPoints: ['src/client/index.ts'],
    bundle: true,
    platform: 'browser',
    outfile: 'public/client.js',
    minify: true,
    jsxFactory: 'React',
    jsxFragment: 'Fragment',
  }),
]);
