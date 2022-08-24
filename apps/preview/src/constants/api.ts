import { AjaxClient } from '../utils/AjaxClient'

export const ajaxClient = new AjaxClient({
  baseUrl: location.origin,
})
