import { PathUtil } from './PathUtil'

interface AjaxClientOptions {
  baseUrl: string
}

export class AjaxClient {
  constructor(private readonly options: AjaxClientOptions) {}

  private async request(options: {
    url: string
    method: 'get' | 'post' | 'put' | 'delete'
    params?: object
    data?: object
  }) {
    let url = PathUtil.join(this.options.baseUrl, options.url)
    if (options.params) {
      const usp = new URLSearchParams()
      Object.entries(options.params).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          v.forEach((item) => usp.append(k, item))
        } else {
          usp.set(k, v)
        }
      })
      url += '?' + usp.toString()
    }

    const resp = await fetch(url, {
      mode: 'cors',
      method: options.method,
      body: options.data ? JSON.stringify(options.data) : undefined,
    })
    if (resp.status !== 200) {
      throw new Error(await resp.text())
    }
    const contentType = resp.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return await resp.json()
    } else if (contentType?.includes('application/text')) {
      return await resp.text()
    } else {
      return await resp.text()
    }
  }

  /**
   * GET 请求
   * @param url 请求地址，不包含基础 url
   * @param params url 参数
   * @returns 返回结果，类型是传入的泛型参数
   * @example
   * ```ts
   * const res = await ajaxClient.get<{ componentMetas: any[] }>('/oasis/sommeta/global/components')
   * expect(Array.isArray(res.componentMetas)).toBeTruthy()
   * ```
   */
  async get<R>(url: string, params?: any): Promise<R> {
    return this.request({
      url,
      method: 'get',
      params: params,
    })
  }
  /**
   * POST 请求
   * @param url 请求地址，不包含基础 url
   * @param data json 参数
   * @returns 返回结果，类型是传入的泛型参数
   * ```ts
   * const res = await ajaxClient.post<string>('/faas/external/xiqu-encryptor', {
   *   Action: 0,
   *   D: 'hello',
   * })
   * expect(typeof res === 'string').toBeTruthy()
   * ```
   */
  async post<R>(url: string, data?: any): Promise<R> {
    return this.request({
      url,
      method: 'post',
      data: data,
    })
  }
  async delete<R>(url: string, data?: any, params?: any): Promise<R> {
    return this.request({
      url,
      method: 'delete',
      data: data,
      params: params,
    })
  }
}
