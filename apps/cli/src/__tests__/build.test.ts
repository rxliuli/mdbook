import { BookConfig, genCmd, parse } from '../build'
import * as path from 'path'
import { mkdirp, readJson, remove } from 'fs-extra'

describe('测试 buildCmd', () => {
  const testPath = path.resolve(__dirname, '.temp')
  beforeEach(async () => {
    await remove(testPath)
    await mkdirp(testPath)
  })
  it('测试 parse', async () => {
    const json = await parse(path.resolve(__dirname, 'asset'))
    // console.log(json)
    expect(json.title).toBeTruthy()
    expect(json.sections.length).not.toBe(0)
  })
  it('基本示例', async () => {
    const json = await parse(path.resolve(__dirname, 'asset'))
    const cmd = genCmd({
      cwd: testPath,
      output: path.resolve(testPath, 'dist'),
      config: json,
      dev: true,
    })
    console.log(cmd)
  })
})
