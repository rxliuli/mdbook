import path from 'path'
import fsExtra from 'fs-extra'
import matter from 'gray-matter'
import { Chapter, EpubBuilder, GenerateOptions, Image } from '@liuli-util/mdbook-sdk'
import { v4 } from 'uuid'
import { AsyncArray } from '@liuli-util/async'
import {
  fromMarkdown,
  Root,
  stringify,
  visit,
  Image as ImageAst,
  Heading,
  Paragraph,
  Text,
  select,
} from '@liuli-util/markdown-util'

const { pathExists, stat, readFile } = fsExtra

export interface BookConfig {
  title: string
  author: string
  rights: string
  description: string
  language: string
  cover?: string
  sections: string[]
}

export async function parse(entryPoint: string) {
  const md = await readFile(entryPoint, 'utf-8')
  return matter(md).data as BookConfig
}

export function extractTitle(root: Root) {
  let r: string = ''
  visit(root, (node) => {
    if (node.type === 'heading' && (node as Heading).depth === 1) {
      r = String((node as Heading).data).trim()
    }
  })
  if (!r) {
    throw new Error('找不到一级标题')
  }
  return r
}

export class MarkdownBookBuilder {
  getImages(root: Root) {
    const r: string[] = []
    visit(root, (node) => {
      if (node.type === 'image') {
        r.push((node as ImageAst).url)
      }
    })
    return r
  }
  getTitle(root: Root): string {
    const h1 = select('heading[depth=1]', root) as Heading
    return String((h1.children[0] as Text).value).trim()
  }

  convertAst(root: Root, imageMap: Record<string, string>): Root {
    visit(root, (item) => {
      if (item.type === 'image') {
        const img = item as ImageAst
        if (imageMap[img.url]) {
          img.url = '../images/' + imageMap[img.url]
        }
      }
      if (item.type === 'paragraph') {
        const children = (item as Paragraph).children
        children.forEach((item, i) => {
          if (item.type === 'strong') {
            const next = children[i + 1]
            const s = (item.children[0] as Text).value
            const last = s.slice(s.length - 1)
            if (next && next.type === 'text' && ['，', '。', '？', '！'].includes(last) && next.value.startsWith(' ')) {
              next.value = next.value.trim()
            }
          }
        })
      }
    })
    return root
  }

  async renderText(mdPath: string): Promise<Chapter & { images: Image[] }> {
    const text = await readFile(mdPath, 'utf-8')
    const root = fromMarkdown(text)
    const images = this.getImages(root)
      .filter((relative) => !path.isAbsolute(relative))
      .map((relative) => ({ id: v4() + path.extname(relative), relative }))
    const imageMap = images.reduce((res, item) => ({ ...res, [item.relative]: item.id }), {})
    return {
      id: v4(),
      title: this.getTitle(root),
      content: stringify(this.convertAst(root, imageMap)),
      images: await AsyncArray.map(
        images,
        async (item) =>
          ({
            id: item.id,
            buffer: await readFile(path.resolve(path.dirname(mdPath), item.relative)),
          } as Image),
      ),
    }
  }

  /** 读取首页 */
  renderHome(md: string): BookConfig & { home: string; prologue: string } {
    const root = fromMarkdown(md)
    const meta = matter(md).data as BookConfig
    return {
      ...meta,
      home: `
<h1>${meta.title}</h1>
<p>${meta.author}</p>
<p>${meta.rights}</p>
`.trim(),
      prologue: `<h1>制作说明</h1>` + stringify(root),
    }
  }
  private async validateEntryPoint(entryPoint: string) {
    if (!(await pathExists(entryPoint))) {
      throw new Error('入口文件不存在 ' + entryPoint)
    }
    if (!(await stat(entryPoint)).isFile()) {
      throw new Error('指定的 input 入口不是一个文件')
    }
    if (!entryPoint.endsWith('.md')) {
      throw new Error('入口文件不是一个 markdown 文件')
    }
  }

  async generate(entryPoint: string) {
    await this.validateEntryPoint(entryPoint)
    const rootPath = path.dirname(entryPoint)
    const md = await readFile(entryPoint, 'utf-8')
    const metadata = this.renderHome(md)
    const list = await AsyncArray.map(metadata.sections, async (section, i) => {
      const mdPath = path.resolve(rootPath, section)
      try {
        const chapter = await this.renderText(mdPath)
        return {
          ...chapter,
          id: 'ch' + i.toString().padStart(4, '0'),
        }
      } catch (e) {
        console.error('渲染章节出错', section, e)
        throw e
      }
    })
    const extraText: Chapter[] = []
    const extraImage: Image[] = []
    if (metadata.cover) {
      const coverPath = path.resolve(rootPath, metadata.cover)
      if (!(await pathExists(coverPath))) {
        throw new Error('未找到图像 ' + metadata.cover)
      }
      const coverName = 'cover' + path.extname(metadata.cover)
      extraText.push({
        id: 'cover',
        title: 'cover',
        content: `<svg
        xmlns="http://www.w3.org/2000/svg"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        version="1.1"
        viewBox="0 0 1352 2000"
        width="100%"
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <image width="1352" height="2000" xlink:href="../images/${coverName}" />
      </svg>`,
      })
      extraImage.push({
        id: coverName,
        buffer: await readFile(coverPath),
      })
    }
    const options: GenerateOptions = {
      metadata: {
        id: v4(),
        ...metadata,
      },
      text: [
        ...extraText,
        {
          id: 'home',
          title: 'home',
          content: metadata.home,
        },
        {
          id: 'prologue',
          title: 'prologue',
          content: metadata.prologue,
        },
        ...list,
      ],
      image: [...extraImage, ...list.flatMap((item) => item.images)],
      toc: list.map((item) => ({
        id: v4(),
        chapterId: item.id,
        title: item.title,
      })),
    }
    return await new EpubBuilder().gen(options).generateAsync({ type: 'nodebuffer' })
  }
}
