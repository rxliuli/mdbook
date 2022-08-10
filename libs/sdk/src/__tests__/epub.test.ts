import fsExtra from 'fs-extra'
import JSZip from 'jszip'
import path from 'path'
import { it, beforeEach } from '@jest/globals'
import { fileURLToPath } from 'url'

const { mkdirp, remove, writeFile } = fsExtra
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const tempPath = path.resolve(__dirname, '.temp')

beforeEach(async () => {
  await remove(tempPath)
  await mkdirp(tempPath)
})

it('尝试手动使用 jszip 构建一本书', async () => {
  const zip = new JSZip()

  function init() {
    zip.file(
      'META-INF/container.xml',
      `<?xml version="1.0"?>
    <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
       <rootfiles>
          <rootfile full-path="metadata.opf" media-type="application/oebps-package+xml"/>
       </rootfiles>
    </container>`,
    )
    zip.file('mimetype', 'application/epub+zip')
    zip.file(
      'metadata.opf',
      `<?xml version="1.0"  encoding="UTF-8"?>
      <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uuid_id" version="2.0">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
          <dc:title>第一卷-量子纠缠</dc:title>
          <dc:creator opf:role="aut" opf:file-as="未知">未知</dc:creator>
          <dc:identifier opf:scheme="uuid" id="uuid_id">3e0d1c68-779a-47a9-a8f1-099fa29853f5</dc:identifier>
          <dc:date>0101-01-01T00:00:00+00:00</dc:date>
          <dc:language>zh</dc:language>
          <meta name="cover" content="cover"/>
        </metadata>
        <manifest>
          <item href="start.xhtml" id="start" media-type="application/xhtml+xml"/>
          <item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml"/>
          <item href="cover.jpg" id="cover" media-type="image/jpeg"/>
        </manifest>
        <spine toc="ncx">
          <itemref idref="start"/>
        </spine>
        <guide/>
      </package>`,
    )
    zip.file(
      'toc.ncx',
      `<?xml version='1.0' encoding='utf-8'?>
     <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="zh">
       <head>
         <meta name="dtb:uid" content="3e0d1c68-779a-47a9-a8f1-099fa29853f5"/>
         <meta name="dtb:depth" content="2"/>
         <meta name="dtb:totalPageCount" content="0"/>
         <meta name="dtb:maxPageNumber" content="0"/>
       </head>
       <docTitle>
         <text>第一卷-量子纠缠</text>
       </docTitle>
       <navMap>
         <navPoint id="num_1" playOrder="1">
           <navLabel>
             <text>开始</text>
           </navLabel>
           <content src="start.xhtml"/>
         </navPoint>
       </navMap>
     </ncx>`,
    )
    zip.file(
      'start.xhtml',
      `<?xml version='1.0' encoding='utf-8'?>
     <html xmlns="http://www.w3.org/1999/xhtml" lang="zh">
       <head>
         <title>第一卷-量子纠缠</title>
       </head>
       <body>
         <h1>第一卷-量子纠缠</h1>
       </body>
     </html>`,
    )
  }

  init()
  await writeFile(path.resolve(tempPath, 'test.epub'), await zip.generateAsync({ type: 'nodebuffer' }))
})
