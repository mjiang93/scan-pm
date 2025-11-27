// 用户相关类型
export interface UserInfo {
  id: string
  username: string
  name: string
  avatar?: string
  role: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  userInfo: UserInfo
}
