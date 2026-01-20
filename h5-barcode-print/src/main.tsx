import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
// import { initGlobalErrorHandler } from '@/utils/errorHandler'

// 加载 Mock 工具（仅在开发环境）
if (import.meta.env.DEV) {
  import('@/utils/mock')
}

// 暂时禁用全局错误处理器，避免循环
// initGlobalErrorHandler()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
