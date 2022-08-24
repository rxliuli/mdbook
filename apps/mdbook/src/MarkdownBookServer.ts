import cors from '@koa/cors'
import Router from '@koa/router'
import asyncLib from '@liuli-util/async'
import { fromMarkdown, stringify } from '@liuli-util/markdown-util'
import type { Chapter } from '@liuli-util/mdbook-sdk'
import fsExtra from 'fs-extra'
import { Server } from 'http'
import Application from 'koa'
import koaHttpProxy from 'koa-better-http-proxy'
import serve from 'koa-static'
import path from 'path'
import { BookConfig, extractTitle, parse } from './MarkdownBookBuilder.js'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
    }
  }
}

const { AsyncArray } = asyncLib
const { pathExists, readFile } = fsExtra
import { createRequire } from 'module'

export class MarkdownBookServer {
  constructor(private readonly options: { entryPoint: string; port: number }) {}
  private server?: Server
  start() {
    const router = new Router()
    router.get('/api/ping', (ctx) => {
      ctx.body = 'pong'
    })
    router.get('/api/meta', async (ctx) => {
      ctx.body = await this.getMetadata()
    })
    router.get('/api/list', async (ctx) => {
      ctx.body = await this.getChapterList()
    })
    router.get('/api/get', async (ctx) => {
      ctx.body = await this.getById(ctx.query.id as string)
    })

    const require = createRequire(import.meta.url)
    const app = new Application()
    app.use(cors()).use(router.routes())
    // console.log('env', process.env.NODE_ENV ?? 'production')
    if (process.env.NODE_ENV === 'development') {
      app.use(koaHttpProxy('localhost:5173', {}))
    } else {
      app.use(serve(path.dirname(require.resolve('@liuli-util/mdbook-preview'))))
    }
    // 默认返回这个页面
    app.use(async (ctx) => {
      // console.log('ctx.req.method', ctx.req.method, ctx.req.url)
      if (ctx.req.method === 'GET' && ctx.req.url?.endsWith('.md')) {
        ctx.body = await readFile(require.resolve('@liuli-util/mdbook-preview'), 'utf-8')
      }
    })
    this.server = app.listen(this.options.port)
    console.log(`start http://localhost:${this.options.port}`)
  }
  stop() {
    if (this.server) {
      this.server.close()
    }
  }
  async getMetadata(): Promise<BookConfig> {
    return (await parse(this.options.entryPoint)) as BookConfig
  }
  /** 获取章节列表 */
  async getChapterList(): Promise<Pick<Chapter, 'id' | 'title'>[]> {
    const meta = (await parse(this.options.entryPoint)) as BookConfig
    const dir = path.dirname(this.options.entryPoint)
    return await AsyncArray.map(meta.sections, async (name) => {
      const text = await readFile(path.resolve(dir, name), 'utf-8')
      const root = fromMarkdown(text)
      const title = extractTitle(root)
      return { id: name, title } as Pick<Chapter, 'id' | 'title'>
    })
  }
  /** 根据 id 获取章节内容 */
  async getById(id: string): Promise<string> {
    const filePath = path.resolve(path.dirname(this.options.entryPoint), id)
    if (!(await pathExists(filePath))) {
      throw new Error('文件不存在 ' + id)
    }
    const text = await readFile(filePath, 'utf-8')
    return stringify(fromMarkdown(text))
  }
}
