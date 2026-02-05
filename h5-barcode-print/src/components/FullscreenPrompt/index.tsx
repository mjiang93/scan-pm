import { useState, useEffect } from 'react'
import { Button, Dialog } from 'antd-mobile'
import { requestFullscreen, isFullscreenSupported } from '@/utils/fullscreen'
import styles from './index.module.less'

interface FullscreenPromptProps {
  /** 是否自动显示提示 */
  autoShow?: boolean
  /** 延迟显示时间（毫秒） */
  delay?: number
}

/**
 * 全屏提示组件
 * 引导用户进入全屏模式
 */
export const FullscreenPrompt: React.FC<FullscreenPromptProps> = ({ 
  autoShow = true,
  delay = 500 
}) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!autoShow || !isFullscreenSupported()) return

    const timer = setTimeout(() => {
      // 检查是否已经全屏
      const isAlreadyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      )
      
      if (!isAlreadyFullscreen) {
        setVisible(true)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [autoShow, delay])

  const handleEnterFullscreen = async () => {
    const success = await requestFullscreen()
    if (success) {
      setVisible(false)
    }
  }

  const handleCancel = () => {
    setVisible(false)
    // 存储用户选择，避免重复提示
    localStorage.setItem('fullscreen-prompt-dismissed', 'true')
  }

  // 如果用户之前选择了不再提示
  useEffect(() => {
    const dismissed = localStorage.getItem('fullscreen-prompt-dismissed')
    if (dismissed === 'true') {
      setVisible(false)
    }
  }, [])

  if (!isFullscreenSupported()) {
    return null
  }

  return (
    <Dialog
      visible={visible}
      content={
        <div className={styles.content}>
          <div className={styles.icon}>📱</div>
          <div className={styles.title}>获得更好的体验</div>
          <div className={styles.desc}>
            建议使用全屏模式，获得更大的操作空间
          </div>
        </div>
      }
      actions={[
        {
          key: 'cancel',
          text: '暂不使用',
          onClick: handleCancel,
        },
        {
          key: 'confirm',
          text: '进入全屏',
          primary: true,
          onClick: handleEnterFullscreen,
        },
      ]}
    />
  )
}
