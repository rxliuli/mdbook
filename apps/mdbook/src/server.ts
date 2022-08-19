import path from 'path'
import { MarkdownBookServer } from './MarkdownBookServer.js'

const port = 9090
const server = new MarkdownBookServer({
  cwd: path.resolve('C:/Users/rxliuli/Code/book/to-the-stars/books/01'),
  port,
})

server.start()
console.log(`start http://localhost:${port}`)
