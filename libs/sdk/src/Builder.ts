import { AsyncArray } from '@liuli-util/async'
import { copy, mkdirp, readFile, writeFile } from 'fs-extra'
import path from 'path'
import { RootPath } from './RootPath'
import parse from 'node-html-parser'
import { lookup } from 'mime-types'
import JSZip from 'jszip'
import FastGlob from 'fast-glob'

export interface MetaData {
  id: string
  title: string
  author: string
  language: string
  cover: string
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

  renderMetadata(meta: MetaData) {
    return `<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:identifier opf:scheme="uuid" id="uuid_id">${meta.id}</dc:identifier>
    <dc:title>${meta.title}</dc:title>
    <dc:creator>${meta.author}</dc:creator>
    <dc:language>${meta.language}</dc:language>
    <meta name="cover" content="${meta.cover}"/>
  </metadata>`
  }

  private renderToc(item: Toc) {
    return `<navPoint playOrder="1">
    <navLabel>
      <text>${item.title}</text>
    </navLabel>
    <content src="text/${item.chapterId}.xhtml"/>
  </navPoint>`
  }

  renderTocXML(title: string, toc: Toc[]) {
    return `<?xml version='1.0' encoding='utf-8'?>
    <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="zho">
      <docTitle>
        <text>${title}</text>
      </docTitle>
      <navMap>
        ${toc.map(this.renderToc)}
      </navMap>
    </ncx>
    `
  }

  renderManifest({ text, image }: { text: Chapter[]; image: Image[] }) {
    return `<manifest>
    <item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml"/>
    ${text
      .map((item) => `<item id="${item.id}" href="text/${item.id}.xhtml" media-type="application/xhtml+xml"/>`)
      .join('\n')}
    ${image
      .map((item) => `<item href="images/${item.id}" id="${item.id}" media-type="${lookup(item.id)}"/>`)
      .join('\n')}
  </manifest>`
  }

  renderNcxSpine(text: Chapter[]) {
    return `<spine toc="ncx">
    ${text.map((item) => `<itemref idref="${item.id}"/>`).join('\n')}
  </spine>`
  }

  renderContentOpf(options: { metadata: string; manifest: string; ncxSpine: string }) {
    return `<?xml version='1.0' encoding='utf-8'?>
    <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uuid_id" version="2.0">
      ${options.metadata}
      ${options.manifest}
      ${options.ncxSpine}
      <guide/>
    </package>
    `
  }

  renderText(text: Chapter) {
    return `<?xml version="1.0" encoding="utf-8"?>
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>${text.title}</title>
      </head>
      <body>
        <main>
          ${text.content}
        </main>
      </body>
    </html>`
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
    await writeFile(path.resolve(rootPath, 'toc.ncx'), this.renderTocXML(metadata.title, toc))
    await writeFile(
      path.resolve(rootPath, 'content.opf'),
      this.renderContentOpf({
        metadata: this.renderMetadata(metadata),
        manifest: this.renderManifest({ text, image }),
        ncxSpine: this.renderNcxSpine(text),
      }),
    )

    // 写入图像
    await mkdirp(path.resolve(rootPath, 'images'))
    await AsyncArray.forEach(image, (item) => writeFile(path.resolve(rootPath, 'images', item.id), item.buffer))

    // 写入文本
    await mkdirp(path.resolve(rootPath, 'text'))
    await AsyncArray.forEach(text, (item) =>
      writeFile(path.resolve(rootPath, 'text', item.id + '.xhtml'), this.renderText(item)),
    )

    return this.bundleZip(rootPath)
  }

  async bundleZip(rootPath: string) {
    const zip = new JSZip()
    const list = await FastGlob('**', { cwd: rootPath, onlyFiles: true })
    list.forEach((item) => zip.file(item, readFile(path.resolve(rootPath, item))))
    return await zip.generateAsync({ type: 'nodebuffer' })
  }
}
