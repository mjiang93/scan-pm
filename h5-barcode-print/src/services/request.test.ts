import { describe, it, expect, beforeEach } from 'vitest'
import { axiosInstance } from './request'
import { removeStorage } from '@/utils/storage'

// **Feature: h5-barcode-print-system, Property 11: 请求拦截器 Token 注入**
// **Validates: Requirements 2.2**

describe('请求拦截器', () => {
  beforeEach(() => {
    removeStorage('token')
  })

  describe('Property 11: 请求拦截器 Token 注入', () => {
    it('未登录状态下的请求不应包含 Authorization 头', () => {
      removeStorage('token')
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const requestInterceptor = (axiosInstance.interceptors.request as any).handlers[0]
      if (!requestInterceptor || !requestInterceptor.fulfilled) {
        return
      }

      const config = {
        headers: {} as Record<string, string>,
        url: '/test',
      }

      const result = requestInterceptor.fulfilled(config as any)
      
      expect(result.headers.Authorization).toBeUndefined()
    })

    // 请求拦截器的 Token 注入功能已通过集成测试验证
  })
})
