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
    const res = await builder.gen({
      rootPath: dirPath,
      metadata: {
        id: v4(),
        title: '第一卷-量子纠缠',
        cover: 'cover.png',
        author: 'Hieronym',
        language: 'zh-CN',
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
          <image width="1352" height="2000" xlink:href="../images/cover.png" />
        </svg>`,
        },
        {
          id: 'ch0001',
          title: '引言',
          content: `<p><i>“上帝不掷骰子。”</i></p>
          <p><strong>—— 阿尔伯特・爱因斯坦</strong></p>`,
        },
        {
          id: 'ch0002',
          title: '第一章 许愿',
          content: `<p>虽然出于伦理方面的考虑，我们必须针对许愿的后果和责任进行一些基本的指导，但此类指导必须要限制在符合人类社会整体利益的程度。教师不得透露 Incubator 系统在教学大纲以外的任何信息。这一限制将持续到学生超出契约年龄为止，通常认为是 20 岁。虽然对学生的关心是可贵的，但保持沉默是您作为一名公民不可推卸的责任。违反这一规定的教师将立即撤职并依法提起公诉……</p>`,
        },
      ],
      image: [
        {
          id: 'cover.png',
          buffer: await readFile(path.resolve(__dirname, 'assets/cover.png')),
        },
      ],
      toc: [
        {
          id: v4(),
          title: '第一章 许愿',
          chapterId: 'ch0002',
        },
      ],
    })
    await writeFile(path.resolve(tempPath, 'test.epub'), res)
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
