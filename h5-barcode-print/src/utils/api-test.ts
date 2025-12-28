// API 测试工具 - 用于验证配置是否正确
import { login } from '@/services/auth'

/**
 * 测试登录接口
 */
export const testLoginAPI = async () => {
  try {
    console.log('🚀 Testing login API...')
    
    const result = await login({
      userId: 'capo',
      password: '123456'
    })
    
    console.log('✅ Login API test successful:', result)
    return result
  } catch (error) {
    console.error('❌ Login API test failed:', error)
    throw error
  }
}

// 在开发环境下可以在控制台调用 window.testLoginAPI() 来测试
if (import.meta.env.DEV) {
  (window as any).testLoginAPI = testLoginAPI
}