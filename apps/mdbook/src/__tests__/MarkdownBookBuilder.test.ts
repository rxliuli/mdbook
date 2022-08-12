import fsExtra from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { MarkdownBookBuilder } from '../MarkdownBookBuilder.js'
import { beforeAll, beforeEach, describe, expect, it } from '@jest/globals'

const { mkdirp, remove, writeFile, copy, pathExists } = fsExtra

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const tempPath = path.resolve(__dirname, '.temp')
beforeAll(async () => {
  await remove(tempPath)
  await mkdirp(tempPath)
})

describe('basic', () => {
  const dirPath = path.resolve(tempPath, 'basic')
  beforeEach(async () => {
    await remove(dirPath)
    await mkdirp(dirPath)
    await writeFile(
      path.resolve(dirPath, 'readme.md'),
      `
---
title: 第一卷 量子纠缠
author: Hieronym
rights: CC BY-NC-SA
description: 丘比承诺说人类总有一天也能到达那遥远的星空。但它们很明智地没有说出来，人类将会在那里遇到什么。
language: zh-CN
cover: './assets/cover.png'
sections:
  - 001-第一章-许愿.md
  - 002-第二章-幻影.md
---

“上帝是不玩骰子的”

—— 阿尔伯特・爱因斯坦最常被引用的一句名言
    `.trim(),
    )
    await writeFile(path.resolve(dirPath, '001-第一章-许愿.md'), `# 第一章 许愿`)
    await writeFile(path.resolve(dirPath, '002-第二章-幻影.md'), `# 第二章 幻影`)
    await copy(path.resolve(__dirname, './assets/cover.png'), path.resolve(dirPath, './assets/cover.png'))
  })
  it('basic', async () => {
    const builder = new MarkdownBookBuilder()
    const res = await builder.generate(path.resolve(dirPath, './readme.md'))
    const distPath = path.resolve(dirPath, 'test.epub')
    await writeFile(distPath, res)
    expect(await pathExists(distPath)).toBeTruthy()
  })
})

describe('no cover', () => {
  const dirPath = path.resolve(tempPath, 'no cover')
  beforeEach(async () => {
    await remove(dirPath)
    await mkdirp(dirPath)
    await writeFile(
      path.resolve(dirPath, 'readme.md'),
      `
---
title: 第一卷 量子纠缠
author: Hieronym
rights: CC BY-NC-SA
description: 丘比承诺说人类总有一天也能到达那遥远的星空。但它们很明智地没有说出来，人类将会在那里遇到什么。
language: zh-CN
sections:
  - 001-第一章-许愿.md
  - 002-第二章-幻影.md
---

“上帝是不玩骰子的”

—— 阿尔伯特・爱因斯坦最常被引用的一句名言
    `.trim(),
    )
    await writeFile(path.resolve(dirPath, '001-第一章-许愿.md'), `# 第一章 许愿`)
    await writeFile(path.resolve(dirPath, '002-第二章-幻影.md'), `# 第二章 幻影`)
  })
  it('basic', async () => {
    const builder = new MarkdownBookBuilder()
    const res = await builder.generate(path.resolve(dirPath, './readme.md'))
    const distPath = path.resolve(dirPath, 'test.epub')
    await writeFile(distPath, res)
    expect(await pathExists(distPath)).toBeTruthy()
  })
})
