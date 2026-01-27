/**
 * 路径工具函数
 * 处理开发/生产环境的路径差异
 */

/**
 * 获取资源的完整路径
 * 自动添加 base path 前缀
 *
 * @param path - 相对路径 (如 '/cases/case_1.png')
 * @returns 完整路径 (开发: '/cases/case_1.png', 生产: '/logo-silhouette/cases/case_1.png')
 *
 * @example
 * // 开发环境: VITE_BASE_PATH = '/'
 * getAssetPath('/cases/case_1.png') // => '/cases/case_1.png'
 *
 * // 生产环境: VITE_BASE_PATH = '/logo-silhouette/'
 * getAssetPath('/cases/case_1.png') // => '/logo-silhouette/cases/case_1.png'
 */
export function getAssetPath(path: string): string {
  // 获取 base path (由 Vite 在构建时注入)
  const base = import.meta.env.BASE_URL || '/'

  // 如果路径已经包含 base,直接返回
  if (path.startsWith(base)) {
    return path
  }

  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  // 如果 base 是根路径,直接返回原路径
  if (base === '/') {
    return normalizedPath
  }

  // 移除 base 末尾的 /,避免双斜杠
  const baseWithoutTrailingSlash = base.endsWith('/') ? base.slice(0, -1) : base

  return `${baseWithoutTrailingSlash}${normalizedPath}`
}

/**
 * 获取当前的 base path
 * @returns base path (如 '/' 或 '/logo-silhouette/')
 */
export function getBasePath(): string {
  return import.meta.env.BASE_URL || '/'
}
