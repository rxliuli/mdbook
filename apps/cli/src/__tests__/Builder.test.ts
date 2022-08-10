import { mkdirp, remove } from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { Builder } from '../Builder.js'
import { beforeEach, it } from '@jest/globals'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const testPath = path.resolve(__dirname, '.temp')
beforeEach(async () => {
  await remove(testPath)
  await mkdirp(testPath)
})

it('basic', async () => {
  const builder = new Builder()
  await builder.generate(path.resolve(__dirname, './book'))
})
