// 用户相关类型
export interface UserInfo {
  userId: string
  userName: string
  status: number
}

export interface LoginParams {
  userId: string
  password: string
}

export interface LoginResult {
  token: string
  userId: string
  userName: string
  status: number
}
