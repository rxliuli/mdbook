import { ISideBarItem } from '../components/SideBar'
import { ajaxClient } from '../constants/api'

class BookApi {
  async getChapterList(): Promise<ISideBarItem[]> {
    return await ajaxClient.get('/list')
  }
  async getById(id: string): Promise<string> {
    return await ajaxClient.get('/get', { id })
  }
}

export const bookApi = new BookApi()
