import { useEffect, useState } from 'react'
import { requestFullscreen, exitFullscreen, isFullscreen, onFullscreenChange } from '@/utils/fullscreen'

interface UseFullscreenOptions {
  /** 是否在首次用户交互时自动请求全屏 */
  autoRequestOnInteraction?: boolean
  /** 是否在组件挂载时立即尝试全屏（需要用户手势） */
  requestOnMount?: boolean
}

/**
 * 全屏控制 Hook
 */
export const useFullscreen = (options: UseFullscreenOptions = {}) => {
  const { autoRequestOnInteraction = false, requestOnMount = false } = options
  const [isFullscreenActive, setIsFullscreenActive] = useState(isFullscreen())
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    // 监听全屏状态变化
    const cleanup = onFullscreenChange(setIsFullscreenActive)
    return cleanup
  }, [])

  useEffect(() => {
    if (!autoRequestOnInteraction || hasInteracted) return

    const handleInteraction = async () => {
      setHasInteracted(true)
      await requestFullscreen()
    }

    // 监听首次用户交互
    const events = ['click', 'touchstart', 'keydown']
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction)
      })
    }
  }, [autoRequestOnInteraction, hasInteracted])

  useEffect(() => {
    if (requestOnMount) {
      // 延迟一下，等待页面完全加载
      const timer = setTimeout(() => {
        requestFullscreen()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [requestOnMount])

  const toggleFullscreen = async () => {
    if (isFullscreenActive) {
      await exitFullscreen()
    } else {
      await requestFullscreen()
    }
  }

  return {
    isFullscreen: isFullscreenActive,
    requestFullscreen,
    exitFullscreen,
    toggleFullscreen,
  }
}
