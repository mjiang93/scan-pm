/**
 * 全屏工具函数
 * 用于PDA和移动端浏览器的全屏控制
 */

/**
 * 请求全屏
 * @returns Promise<boolean> 是否成功进入全屏
 */
export const requestFullscreen = async (): Promise<boolean> => {
  try {
    const element = document.documentElement

    if (element.requestFullscreen) {
      await element.requestFullscreen()
      return true
    } else if ((element as any).webkitRequestFullscreen) {
      // Safari
      await (element as any).webkitRequestFullscreen()
      return true
    } else if ((element as any).mozRequestFullScreen) {
      // Firefox
      await (element as any).mozRequestFullScreen()
      return true
    } else if ((element as any).msRequestFullscreen) {
      // IE/Edge
      await (element as any).msRequestFullscreen()
      return true
    }
    
    console.warn('浏览器不支持全屏API')
    return false
  } catch (error) {
    console.error('进入全屏失败:', error)
    return false
  }
}

/**
 * 退出全屏
 */
export const exitFullscreen = async (): Promise<boolean> => {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen()
      return true
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen()
      return true
    } else if ((document as any).mozCancelFullScreen) {
      await (document as any).mozCancelFullScreen()
      return true
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen()
      return true
    }
    return false
  } catch (error) {
    console.error('退出全屏失败:', error)
    return false
  }
}

/**
 * 切换全屏状态
 */
export const toggleFullscreen = async (): Promise<boolean> => {
  if (isFullscreen()) {
    return await exitFullscreen()
  } else {
    return await requestFullscreen()
  }
}

/**
 * 检查是否处于全屏状态
 */
export const isFullscreen = (): boolean => {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  )
}

/**
 * 检查浏览器是否支持全屏API
 */
export const isFullscreenSupported = (): boolean => {
  const element = document.documentElement
  return !!(
    element.requestFullscreen ||
    (element as any).webkitRequestFullscreen ||
    (element as any).mozRequestFullScreen ||
    (element as any).msRequestFullscreen
  )
}

/**
 * 监听全屏状态变化
 */
export const onFullscreenChange = (callback: (isFullscreen: boolean) => void): (() => void) => {
  const handler = () => callback(isFullscreen())
  
  document.addEventListener('fullscreenchange', handler)
  document.addEventListener('webkitfullscreenchange', handler)
  document.addEventListener('mozfullscreenchange', handler)
  document.addEventListener('MSFullscreenChange', handler)
  
  // 返回清理函数
  return () => {
    document.removeEventListener('fullscreenchange', handler)
    document.removeEventListener('webkitfullscreenchange', handler)
    document.removeEventListener('mozfullscreenchange', handler)
    document.removeEventListener('MSFullscreenChange', handler)
  }
}
