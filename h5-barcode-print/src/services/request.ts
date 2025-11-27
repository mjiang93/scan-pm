// Axios 请求封装
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { Toast } from 'antd-mobile'
import { getStorage, removeStorage } from '@/utils/storage'
import type { ApiResponse } from '@/types/api'

// 扩展请求配置
interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean
  skipErrorHandler?: boolean
}

// 创建 Axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { skipAuth?: boolean }) => {
    // 添加 Token
    if (!config.skipAuth) {
      const token = getStorage<string>('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response
    
    // 业务成功
    if (data.code === 0 || data.code === 200) {
      return data.data as unknown as AxiosResponse
    }
    
    // 业务错误
    const config = response.config as RequestConfig
    if (!config.skipErrorHandler) {
      Toast.show({
        icon: 'fail',
        content: data.message || '请求失败',
      })
    }
    
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  (error) => {
    const config = error.config as RequestConfig
    
    // 401 未授权
    if (error.response?.status === 401) {
      removeStorage('token')
      removeStorage('userInfo')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    
    // 显示错误提示
    if (!config?.skipErrorHandler) {
      let message = '网络错误，请稍后重试'
      
      if (error.response) {
        switch (error.response.status) {
          case 403:
            message = '无权限访问'
            break
          case 404:
            message = '资源不存在'
            break
          case 500:
            message = '服务器错误'
            break
          default:
            message = error.response.data?.message || message
        }
      } else if (error.code === 'ECONNABORTED') {
        message = '请求超时，请检查网络'
      }
      
      Toast.show({
        icon: 'fail',
        content: message,
      })
    }
    
    return Promise.reject(error)
  }
)

// 封装请求方法
export const request = {
  get<T>(url: string, config?: RequestConfig): Promise<T> {
    return instance.get(url, config) as Promise<T>
  },
  
  post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return instance.post(url, data, config) as Promise<T>
  },
  
  put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return instance.put(url, data, config) as Promise<T>
  },
  
  delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return instance.delete(url, config) as Promise<T>
  },
}

// 导出实例供测试使用
export { instance as axiosInstance }

export default request
