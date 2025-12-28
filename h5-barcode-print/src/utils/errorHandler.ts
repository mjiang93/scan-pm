// 全局错误处理工具
import { Toast } from 'antd-mobile'

export interface ErrorInfo {
  code?: number
  message: string
  stack?: string
  url?: string
}

/**
 * 全局错误处理器
 */
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler
  private isHandling = false // 防止递归调用
  
  private constructor() {
    this.setupGlobalErrorHandlers()
  }
  
  public static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler()
    }
    return GlobalErrorHandler.instance
  }
  
  /**
   * 设置全局错误监听
   */
  private setupGlobalErrorHandlers(): void {
    // 监听未捕获的 Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isHandling) return
      
      console.error('Unhandled promise rejection:', event.reason)
      this.handleError({
        message: event.reason?.message || '未知错误',
        stack: event.reason?.stack,
      })
      event.preventDefault()
    })
    
    // 监听 JavaScript 运行时错误
    window.addEventListener('error', (event) => {
      if (this.isHandling) return
      
      console.error('Global error:', event.error)
      this.handleError({
        message: event.message || '脚本执行错误',
        stack: event.error?.stack,
        url: event.filename,
      })
    })
  }
  
  /**
   * 处理错误
   */
  public handleError(error: ErrorInfo): void {
    // 防止递归调用
    if (this.isHandling) return
    this.isHandling = true
    
    try {
      // 过滤掉一些不需要显示的错误
      if (this.shouldIgnoreError(error)) {
        return
      }
      
      // 显示错误提示
      Toast.show({
        icon: 'fail',
        content: this.formatErrorMessage(error.message),
        duration: 3000,
      })
      
      // 可以在这里添加错误上报逻辑
      this.reportError(error)
    } catch (e) {
      // 如果错误处理本身出错，只在控制台记录
      console.error('Error in error handler:', e)
    } finally {
      // 延迟重置标志，避免短时间内重复处理
      setTimeout(() => {
        this.isHandling = false
      }, 1000)
    }
  }
  
  /**
   * 判断是否应该忽略错误
   */
  private shouldIgnoreError(error: ErrorInfo): boolean {
    const ignoredMessages = [
      'Script error',
      'Network request failed',
      'Loading chunk',
      'ResizeObserver loop limit exceeded',
      'unmountComponentAtNode', // React 18 兼容性问题
      'Non-Error promise rejection captured',
      'ChunkLoadError',
    ]
    
    return ignoredMessages.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    )
  }
  
  /**
   * 格式化错误消息
   */
  private formatErrorMessage(message: string): string {
    // 简化错误消息，让用户更容易理解
    if (message.includes('fetch')) {
      return '网络请求失败，请检查网络连接'
    }
    
    if (message.includes('timeout')) {
      return '请求超时，请稍后重试'
    }
    
    if (message.includes('401')) {
      return '登录已过期，请重新登录'
    }
    
    if (message.includes('403')) {
      return '无权限访问'
    }
    
    if (message.includes('404')) {
      return '请求的资源不存在'
    }
    
    if (message.includes('500')) {
      return '服务器内部错误'
    }
    
    return message.length > 50 ? '系统错误，请稍后重试' : message
  }
  
  /**
   * 上报错误（可选）
   */
  private reportError(error: ErrorInfo): void {
    // 在开发环境下打印详细错误信息
    if (import.meta.env.DEV) {
      console.group('🚨 Error Report')
      console.error('Message:', error.message)
      console.error('Code:', error.code)
      console.error('Stack:', error.stack)
      console.error('URL:', error.url)
      console.groupEnd()
    }
    
    // 生产环境可以在这里添加错误上报服务
    // 例如：发送到监控平台、日志服务等
  }
}

// 初始化全局错误处理器
export const initGlobalErrorHandler = (): void => {
  GlobalErrorHandler.getInstance()
}

// 手动处理错误的便捷方法
export const handleError = (error: Error | string): void => {
  const errorInfo: ErrorInfo = typeof error === 'string' 
    ? { message: error }
    : { message: error.message, stack: error.stack }
    
  GlobalErrorHandler.getInstance().handleError(errorInfo)
}