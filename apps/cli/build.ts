import { build } from 'esbuild'
import { remove } from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import plugins from '@liuli-util/esbuild-plugins'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const watch = process.argv[2] === '-w'
await remove(path.resolve(__dirname, './dist'))
await Promise.all([
  build({
    entryPoints: ['src/bin.ts'],
    outfile: 'dist/bin.mjs',
    bundle: true,
    sourcemap: true,
    platform: 'node',
    format: 'esm',
    banner: {
      js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
    },
    external: ['@liuli-util/mdbook-sdk'],
    watch,
  }),
  build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    bundle: true,
    sourcemap: true,
    platform: 'node',
    format: 'esm',
    banner: {
      js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
    },
    plugins: [plugins.autoExternal()],
    watch,
  }),
])
