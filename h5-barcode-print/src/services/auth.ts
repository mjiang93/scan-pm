// 认证接口服务
import { request } from './request'
import type { LoginParams, LoginResult, UserInfo } from '@/types/user'

/**
 * 用户登录
 */
export function login(params: LoginParams): Promise<LoginResult> {
  return request.post<LoginResult>('/auth/login', params)
}

/**
 * 用户登出
 */
export function logout(): Promise<void> {
  return request.post<void>('/auth/logout')
}

/**
 * 获取用户信息
 */
export function getUserInfo(): Promise<UserInfo> {
  return request.get<UserInfo>('/auth/userinfo')
}
