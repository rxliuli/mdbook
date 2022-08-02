import { AsyncArray } from '@liuli-util/async'
import { copy, mkdirp, readFile, writeFile } from 'fs-extra'
import JSZip from 'jszip'
import path from 'path'
import { RootPath } from './RootPath'
import parse from 'node-html-parser'

export interface MetaData {
  id: string
  title: string
  author: string
  cover: {
    name: string
    buffer: Buffer
  }
}

export interface Chapter {
  id: string
  title: string
  content: string
}

export interface Toc {
  id: string
  title: string
  chapterId: string
}

export interface Image {
  id: string
  buffer: Buffer
}

export class Builder {
  private readonly EpubPath = path.resolve(RootPath, 'public/epub')

  constructor() {}

  async renderChapter(chapter: Chapter) {
    const template = await readFile(path.resolve(this.EpubPath, 'ch000.xhtml'), 'utf-8')
    const dom = parse(template)
    dom.querySelector('title')!.textContent = chapter.title
    dom.querySelector('body')!.innerHTML = chapter.content
    return dom.innerHTML
  }

  async gen({
    metadata,
    text,
    toc,
    image,
    rootPath,
  }: {
    metadata: MetaData
    text: Chapter[]
    toc: Toc[]
    image: Image[]
    rootPath: string
  }): Promise<Buffer> {
    const list = ['META-INF/container.xml', 'mimetype']
    await AsyncArray.forEach(list, async (name) => {
      const outPath = path.resolve(rootPath, name)
      await mkdirp(path.dirname(outPath))
      await copy(path.resolve(this.EpubPath, name), outPath)
    })
    await writeFile(
      path.resolve(rootPath, 'toc.ncx'),
      `<?xml version='1.0' encoding='utf-8'?>
    <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="zho">
      <docTitle>
        <text>toc</text>
      </docTitle>
      <navMap>
      </navMap>
    </ncx>
    `,
    )

    const zip = new JSZip()
    return await zip.generateAsync({ type: 'nodebuffer' })
  }
}
