import { ISideBarItem } from '../components/SideBar'
import { ajaxClient } from '../constants/api'

interface BookConfig {
  title: string
  author: string
  rights: string
  description: string
  language: string
  cover?: string
  sections: string[]
}

class BookApi {
  async getChapterList(): Promise<ISideBarItem[]> {
    return await ajaxClient.get('/list')
  }
  async getById(id: string): Promise<string> {
    return await ajaxClient.get('/get', { id })
  }
  async getMetadata(): Promise<BookConfig> {
    return await ajaxClient.get('/meta')
  }
}

export const bookApi = new BookApi()
