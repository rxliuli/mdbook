import path from 'path'
import fsExtra from 'fs-extra'
import matter from 'gray-matter'
import { Chapter, EpubBuilder, GenerateOptions, Image } from '@liuli-util/mdbook-sdk'
import { v4 } from 'uuid'
import async from '@liuli-util/async'
import MarkdownIt from 'markdown-it'

const { AsyncArray } = async
const { mkdirp, readFile } = fsExtra

export interface BookConfig {
  title: string
  author: string
  rights: string
  description: string
  language: string
  cover: string
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
    path.join(path.relative(cwd, output), config.title + '.epub').replace(/\\/g, '/'),
  )} ${['readme.md', ...config.sections].map((s) => JSON.stringify(s)).join(separator)}`
}

export class Builder {
  async renderText(mdPath: string): Promise<Chapter & { images: Image[] }> {
    const text = await readFile(mdPath, 'utf-8')
    const md = new MarkdownIt()

    return {
      id: v4(),
      title: '',
      content: md.render(text),
      images: [],
    }
  }
  async generate(rootPath: string) {
    const md = await readFile(path.resolve(rootPath, 'readme.md'), 'utf-8')
    const metadata = matter(md).data as BookConfig
    console.log(metadata)
    const tempPath = path.resolve(rootPath, '.temp')
    await mkdirp(tempPath)
    const list = await AsyncArray.map(metadata.sections, async (section) => {
      const mdPath = path.resolve(rootPath, section)
      return await this.renderText(mdPath)
    })
    metadata.sections.map((item) => {})
    const options: GenerateOptions = {
      metadata: {
        id: v4(),
        ...metadata,
      },
      text: list,
      image: [
        {
          id: 'cover',
          buffer: await readFile(path.resolve(rootPath, metadata.cover)),
        },
        ...list.flatMap((item) => item.images),
      ],
      toc: list.map((item) => ({
        id: v4(),
        chapterId: item.id,
        title: item.title,
      })),
      rootPath: tempPath,
    }
  }
}
