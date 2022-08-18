import fsExtra from 'fs-extra'
import path from 'path'
import type { PackageJson } from 'type-fest'
import { build, Platform } from 'esbuild'
import plugins from '@liuli-util/esbuild-plugins'
import json5 from 'json5'

export async function detectPlatform(base: string): Promise<Platform> {
  const tsconfigPath = path.resolve(base, 'tsconfig.json')
  if (await fsExtra.pathExists(tsconfigPath)) {
    const tsconfigJson = json5.parse(await fsExtra.readFile(tsconfigPath, 'utf-8'))
    if ((tsconfigJson?.compilerOptions?.lib as string[])?.some((lib) => lib.toLowerCase() === 'dom')) {
      return 'browser'
    }
  }
  const pkgPath = path.resolve(base, 'package.json')
  if (await fsExtra.pathExists(pkgPath)) {
    const pkgJson = (await fsExtra.readJson(pkgPath)) as PackageJson
    if (Object.keys(pkgJson.devDependencies ?? {}).includes('@types/node')) {
      return 'node'
    }
  }
  return 'neutral'
}

export async function bundleESM(cwd: string, json: PackageJson) {
  const platform = await detectPlatform(cwd)
  console.log(`bundle module: esm, platform: ${platform}`)
  if (json.module) {
    console.log('bundle esm')
    await build({
      entryPoints: ['src/index.ts'],
      outfile: json.module,
      bundle: true,
      sourcemap: true,
      platform,
      format: 'esm',
      banner: {
        // js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
      },
      absWorkingDir: cwd,
      plugins: [plugins.autoExternal()],
    })
  }
  if (json.main) {
    console.log('bundle cjs')
    if (!json.main.endsWith('.cjs')) {
      throw new Error('cjs bundle not ends with .cjs in esm module')
    }
    await build({
      entryPoints: ['src/index.ts'],
      outfile: json.main,
      bundle: true,
      sourcemap: true,
      platform,
      format: 'cjs',
      define: {
        'import.meta.url': 'import_meta_url',
      },
      banner: {
        js: `var import_meta_url = require('url').pathToFileURL(__filename)`,
      },
      absWorkingDir: cwd,
      plugins: [plugins.autoExternal()],
    })
  }
  if (json.bin) {
    console.log('bundle bin')
    await build({
      entryPoints: ['src/bin.ts'],
      outfile: 'dist/bin.js',
      bundle: true,
      sourcemap: true,
      platform: 'node',
      format: 'esm',
      banner: {
        // js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
      },
      absWorkingDir: cwd,
      plugins: [plugins.autoExternal()],
    })
  }
}

export async function bundleCjs(cwd: string, json: PackageJson) {
  const platform = await detectPlatform(cwd)
  console.log(`bundle module: cjs, platform: ${platform}`)
  if (json.module) {
    console.log('bundle esm')
    if (!json.module.endsWith('.mjs')) {
      throw new Error('esm bundle not ends with .mjs in cjs module')
    }
    await build({
      entryPoints: ['src/index.ts'],
      outfile: json.module,
      bundle: true,
      sourcemap: true,
      platform,
      format: 'esm',
      absWorkingDir: cwd,
      plugins: [plugins.autoExternal()],
    })
  }
  if (json.main) {
    console.log('bundle cjs')
    await build({
      entryPoints: ['src/index.ts'],
      outfile: json.main,
      bundle: true,
      sourcemap: true,
      platform,
      format: 'cjs',
      absWorkingDir: cwd,
      plugins: [plugins.autoExternal()],
    })
  }
  if (json.bin) {
    console.log('bundle bin')
    await build({
      entryPoints: ['src/bin.ts'],
      outfile: 'dist/bin.js',
      bundle: true,
      sourcemap: true,
      platform: 'node',
      format: 'cjs',
      absWorkingDir: cwd,
      plugins: [plugins.autoExternal()],
    })
  }
}

export async function bundle(cwd: string) {
  const jsonPath = path.resolve(cwd, 'package.json')
  if (!(await fsExtra.pathExists(jsonPath))) {
    throw new Error('找不到 package.json')
  }
  const json = (await fsExtra.readJson(jsonPath)) as PackageJson
  const type = json.type ?? 'commonjs'
  if (type === 'module') {
    await bundleESM(cwd, json)
  } else {
    await bundleCjs(cwd, json)
  }
}
