import { Command } from 'commander'
import { mkdirp } from 'fs-extra'
import * as path from 'path'
import { genCmd, parse } from './build'
import { execPromise } from './util/execPromise'

new Command()
  .addCommand(
    new Command('build')
      .description('从 markdown 构建一本 epub 书籍')
      .option('-o,--outDir <outDir>', '输出目录', 'dist')
      .action(async (options: { outDir: string }) => {
        await mkdirp(path.resolve(options.outDir))
        const json = await parse(path.resolve())
        const cmd = genCmd({
          cwd: path.resolve(),
          output: options.outDir,
          config: json,
          dev: false,
        })
        await execPromise(cmd)
      }),
  )
  .parse()
