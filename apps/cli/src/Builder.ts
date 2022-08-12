import path from 'path'
import fsExtra, { remove } from 'fs-extra'
import matter from 'gray-matter'
import { Chapter, EpubBuilder, GenerateOptions, Image } from '@liuli-util/mdbook-sdk'
import { v4 } from 'uuid'
import async from '@liuli-util/async'
import {
  fromMarkdown,
  Root,
  stringify,
  visit,
  Image as ImageAst,
  Heading,
  toMarkdown,
  Paragraph,
  Text,
} from 'markdown-util'

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

export async function parse(entryPoint: string) {
  const md = await readFile(entryPoint, 'utf-8')
  return matter(md).data as BookConfig
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
    let r: string = ''
    visit(root, (node) => {
      if (node.type === 'heading' && (node as Heading).depth === 1) {
        r = (node as Heading).children.map(toMarkdown).join('').trim()
      }
    })
    if (!r) {
      throw new Error('找不到一级标题')
    }
    return r
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
  renderHome(md: string): BookConfig & { content: string } {
    const root = fromMarkdown(md)
    const meta = matter(md).data as BookConfig
    return {
      ...meta,
      content: `<h1>${meta.title}</h1>` + stringify(root),
    }
  }
  async generate(entryPoint: string) {
    const rootPath = path.dirname(entryPoint)
    const md = await readFile(entryPoint, 'utf-8')
    const metadata = this.renderHome(md)
    const tempPath = path.resolve(rootPath, '.temp')
    await remove(tempPath)
    await mkdirp(tempPath)
    const list = await AsyncArray.map(metadata.sections, async (section, i) => {
      const mdPath = path.resolve(rootPath, section)
      try {
        const chapter = await this.renderText(mdPath)
        return {
          ...chapter,
          id: 'ch' + i.toString().padStart(4, '0'),
        }
      } catch (e) {
        console.error('渲染章节出错', e)
        throw e
      }
    })
    const coverName = 'cover' + path.extname(metadata.cover)
    const options: GenerateOptions = {
      metadata: {
        id: v4(),
        ...metadata,
      },
      text: [
        {
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
        },
        {
          id: 'about',
          title: 'about',
          content: metadata.content,
        },
        ...list,
      ],
      image: [
        {
          id: coverName,
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

    const epubBuilder = new EpubBuilder()
    return await epubBuilder.gen(options)
  }
}
