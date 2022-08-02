import { mkdirp, readFile, remove, writeFile } from 'fs-extra'
import JSZip from 'jszip'
import parse from 'node-html-parser'
import path from 'path'
import { v4 } from 'uuid'
import { Builder, Chapter } from '../Builder'

const tempPath = path.resolve(__dirname, '.temp')

beforeEach(async () => {
  await remove(tempPath)
  await mkdirp(tempPath)
})

describe('gen', () => {
  const dirPath = path.resolve(tempPath, 'test')
  const builder = new Builder()
  beforeEach(async () => {
    await remove(tempPath)
    await mkdirp(tempPath)
  })
  it('basic', async () => {
    await builder.gen({
      rootPath: dirPath,
      metadata: {
        id: v4(),
        title: '第一卷-量子纠缠',
        cover: {
          name: 'cover.png',
          buffer: await readFile(path.resolve(__dirname, 'assets/cover.png')),
        },
        author: 'Hieronym',
      },
      text: [
        {
          id: v4(),
          title: '制作信息',
          content: `
      <p>Hieronym</p>
      <p>CC BY-NC-SA</p>
    `,
        },
        {
          id: v4(),
          title: 'cover',
          content: `
      <p>Hieronym</p>
      <p>CC BY-NC-SA</p>
    `,
        },
      ],
      image: [],
      toc: [],
    })
  })
})

it.skip('renderChapter', async () => {
  const builder = new Builder()
  const chapter: Chapter = {
    id: v4(),
    title: 'chapter 1',
    content: '<p>content</p>',
  }
  const res = await builder.renderChapter(chapter)
  const dom = parse(res)
  expect(dom.querySelector('title')!.textContent).toBe(chapter.title)
  expect(dom.querySelector('body')!.innerHTML).toBe(chapter.content)
})
