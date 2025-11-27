// URL 参数工具

type QueryValue = string | number | boolean | null | undefined

/**
 * 解析 URL 查询字符串
 */
export function parseQuery(queryString: string): Record<string, string> {
  const result: Record<string, string> = {}
  
  if (!queryString) return result
  
  // 移除开头的 ? 或 #
  const query = queryString.replace(/^[?#]/, '')
  
  if (!query) return result
  
  query.split('&').forEach(param => {
    const [key, value] = param.split('=')
    if (key) {
      result[decodeURIComponent(key)] = value ? decodeURIComponent(value) : ''
    }
  })
  
  return result
}

/**
 * 构建 URL 查询字符串
 */
export function buildQuery(params: Record<string, QueryValue>): string {
  const parts: string[] = []
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  })
  
  return parts.join('&')
}

/**
 * 获取当前 URL 的查询参数
 */
export function getQueryParams(): Record<string, string> {
  return parseQuery(window.location.search)
}

/**
 * 获取指定查询参数
 */
export function getQueryParam(key: string): string | null {
  const params = getQueryParams()
  return params[key] ?? null
}

/**
 * 拼接 URL 和查询参数
 */
export function appendQuery(url: string, params: Record<string, QueryValue>): string {
  const queryString = buildQuery(params)
  if (!queryString) return url
  
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${queryString}`
}
