import { DOMParser, XMLSerializer } from '@xmldom/xmldom'
import querySelector from 'query-selector'
import { it, expect } from '@jest/globals'

const code = `<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
  <dc:identifier opf:scheme="uuid" id="uuid_id">3e0d1c68-779a-47a9-a8f1-099fa29853f5</dc:identifier>
  <dc:title>第一卷-量子纠缠</dc:title>
  <dc:creator opf:file-as="未知" opf:role="aut">未知</dc:creator>
  <dc:language>zho</dc:language>
</metadata>`

it('basic', () => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(code, 'text/xml')
  expect(new XMLSerializer().serializeToString(doc)).toBe(code)
})

it('query', () => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(code, 'text/xml')
  const documentPrototype = Object.getPrototypeOf(doc)
  documentPrototype.querySelectorAll = function querySelectorAll(selector: string) {
    return querySelector(selector, this)
  }
  console.log(doc.createElement)
  console.log(doc.querySelectorAll)
})
