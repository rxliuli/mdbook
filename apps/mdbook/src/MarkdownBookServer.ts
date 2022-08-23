import cors from '@koa/cors'
import Router from '@koa/router'
import asyncLib from '@liuli-util/async'
import { fromMarkdown, stringify } from '@liuli-util/markdown-util'
import type { Chapter, MetaData } from '@liuli-util/mdbook-sdk'
import fsExtra from 'fs-extra'
import { Server } from 'http'
import Application from 'koa'
import serve from 'koa-static'
import path from 'path'
import { BookConfig, extractTitle, parse } from './MarkdownBookBuilder.js'

const { AsyncArray } = asyncLib
const { pathExists, readFile } = fsExtra

export class MarkdownBookServer {
  constructor(private readonly options: { cwd: string; port: number }) {}
  private server?: Server
  start() {
    const router = new Router()
    router.get('/ping', (ctx) => {
      ctx.body = 'pong'
    })
    router.get('/meta', async (ctx) => {
      ctx.body = await this.getMetadata()
    })
    router.get('/list', async (ctx) => {
      ctx.body = await this.getChapterList()
    })
    router.get('/get', async (ctx) => {
      ctx.body = await this.getById(ctx.query.id as string)
    })
    this.server = new Application()
      .use(cors())
      .use(router.routes())
      .use(serve(path.resolve(this.options.cwd)))
      .listen(this.options.port)
  }
  stop() {
    if (this.server) {
      this.server.close()
    }
  }
  async getMetadata(): Promise<BookConfig> {
    return (await parse(path.resolve(this.options.cwd, 'readme.md'))) as BookConfig
  }
  /** 获取章节列表 */
  async getChapterList(): Promise<Pick<Chapter, 'id' | 'title'>[]> {
    const meta = (await parse(path.resolve(this.options.cwd, 'readme.md'))) as BookConfig
    return await AsyncArray.map(meta.sections, async (name) => {
      const text = await readFile(path.resolve(this.options.cwd, name), 'utf-8')
      const root = fromMarkdown(text)
      const title = extractTitle(root)
      return { id: name, title } as Pick<Chapter, 'id' | 'title'>
    })
  }
  /** 根据 id 获取章节内容 */
  async getById(id: string): Promise<string> {
    const filePath = path.resolve(this.options.cwd, id)
    if (!(await pathExists(filePath))) {
      throw new Error('文件不存在 ' + id)
    }
    const text = await readFile(filePath, 'utf-8')
    return stringify(fromMarkdown(text))
  }
}
