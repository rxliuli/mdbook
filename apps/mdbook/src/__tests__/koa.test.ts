import { afterEach, beforeEach, expect, it } from 'vitest'
import cors from '@koa/cors'
import Router from '@koa/router'
import { Server } from 'http'
import Application from 'koa'
import kill from 'kill-port'

const app = new Application()
const router = new Router()
app.use(cors()).use(router.routes())
router.get('/ping', (ctx) => {
  ctx.body = 'pong'
})
let server: Server
const port = 9090
beforeEach(async () => {
  await kill(port, 'tcp')
  server = app.listen(port)
})

afterEach(async () => {
  server.close()
  await kill(port, 'tcp')
})

const url = `http://localhost:${port}`

it.skip('basic', async () => {
  const r = await fetch(url + '/ping').then((r) => r.text())
  expect(r).toBe('pong')
})

// it('add router', async () => {
//   router.get('/', (ctx) => {
//     ctx.body = 'hello world'
//   })
//   const resp = await fetch(url)
//   console.log(resp.ok)
// })
