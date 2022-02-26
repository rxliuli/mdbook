import path from 'path'
import { readFile } from 'fs-extra'
import matter from 'gray-matter'

export interface BookConfig {
  /**
   * 标题
   */
  title: string
  /**
   * 章节路径
   */
  sections: string[]
}

export async function parse(cwd: string) {
  const md = await readFile(path.resolve(cwd, 'readme.md'), 'utf-8')
  return matter(md).data as BookConfig
}

export function genCmd({
  cwd,
  output,
  config,
  dev,
}: {
  cwd: string
  output: string
  config: BookConfig
  dev: boolean
}) {
  const separator = dev ? ' \\\n' : ' '
  return `pandoc -o ${JSON.stringify(
    path
      .join(path.relative(cwd, output), config.title + '.epub')
      .replace(/\\/g, '/'),
  )} ${['readme.md', ...config.sections]
    .map((s) => JSON.stringify(s))
    .join(separator)}`
}
