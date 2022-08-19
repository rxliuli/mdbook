import { it } from '@jest/globals'
import path from 'path'
import { MarkdownBookServer } from '../MarkdownBookServer.js'

const port = 9090
const server = new MarkdownBookServer({
  cwd: path.resolve('C:/Users/rxliuli/Code/book/to-the-stars/books/01'),
  port,
})

it('getChapterList', async () => {
  const list = await server.getChapterList()
  console.log('list', list)
})
