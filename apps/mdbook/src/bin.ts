import { Command } from 'commander'
import fsExtra, { pathExists } from 'fs-extra'
import * as path from 'path'
import { MarkdownBookBuilder, parse } from './MarkdownBookBuilder.js'
import { MarkdownBookServer } from './MarkdownBookServer.js'
import json from '../package.json'

const { mkdirp, writeFile } = fsExtra

new Command()
  .addCommand(
    new Command('build')
      .description('从 markdown 构建一本 epub 书籍')
      .option('-i,--input <input>', '入口文件')
      .option('-o,--outDir <outDir>', '输出目录', 'dist')
      .action(async (options: { outDir: string; input: string }) => {
        await mkdirp(path.resolve(options.outDir))
        const mdPath = path.resolve(options.input)
        const res = await new MarkdownBookBuilder().generate(mdPath)
        const json = await parse(mdPath)
        await writeFile(path.resolve(options.outDir, json.title + '.epub'), res)
      }),
  )
  .option('-i,--input <input>', '入口文件，默认为当前路径下的 readme.md', path.resolve('./readme.md'))
  .action(async (options: { input: string }) => {
    if (!(await pathExists(path.resolve(options.input)))) {
      throw new Error('找不到入口文件 ' + options.input)
    }
    new MarkdownBookServer({ entryPoint: options.input, port: 9090 }).start()
  })
  .version(json.version)
  .parse()
