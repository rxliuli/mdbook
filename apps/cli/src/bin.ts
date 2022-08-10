import { Command } from 'commander'
import { mkdirp, writeFile } from 'fs-extra'
import * as path from 'path'
import { Builder, parse } from './Builder.js'

new Command()
  .addCommand(
    new Command('build')
      .description('从 markdown 构建一本 epub 书籍')
      .option('-o,--outDir <outDir>', '输出目录', 'dist')
      .action(async (options: { outDir: string }) => {
        await mkdirp(path.resolve(options.outDir))
        const res = await new Builder().generate(path.resolve())
        const json = await parse(path.resolve())
        await writeFile(path.resolve(options.outDir, json.title + '.epub'), res)
      }),
  )
  .parse()
