// API 响应类型
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

export interface PageParams {
  page: number
  pageSize: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
