import fsExtra from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { Builder } from '../Builder.js'
import { beforeEach, it } from '@jest/globals'

const { mkdirp, remove, writeFile } = fsExtra

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const tempPath = path.resolve(__dirname, '.temp')
beforeEach(async () => {
  await remove(tempPath)
  await mkdirp(tempPath)
})

it('basic', async () => {
  const builder = new Builder()
  const res = await builder.generate(path.resolve(__dirname, './book/readme.md'))
  await writeFile(path.resolve(tempPath, 'test.epub'), res)
})
