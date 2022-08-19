/**
 * 路径工具
 */
export class PathUtil {
  /**
   * 拼接多个路径
   *
   * @param paths 路径数组
   * @return {String} 拼接完成的路径
   */
  public static join(...paths: string[]): string {
    return paths.reduce(PathUtil._join)
  }

  /**
   * 路径分隔符
   */
  private static Separator = '/'

  /**
   * 拼接两个路径
   *
   * @param start 开始路径
   * @param end   结束路径
   * @return {String} 拼接完成的两个路径
   */
  private static _join(start: string, end: string): string {
    if (start.endsWith(PathUtil.Separator)) {
      start = start.slice(0, start.length - 1)
    }
    if (end.startsWith(PathUtil.Separator)) {
      end = end.slice(1, end.length)
    }
    return start + PathUtil.Separator + end
  }
}
