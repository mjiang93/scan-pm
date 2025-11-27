// Loading 加载组件
import { SpinLoading, Mask } from 'antd-mobile'
import type { ReactNode } from 'react'
import styles from './index.module.less'

export interface LoadingProps {
  loading: boolean
  fullscreen?: boolean
  children?: ReactNode
}

const Loading = ({ loading, fullscreen = false, children }: LoadingProps) => {
  if (fullscreen) {
    return (
      <>
        {children}
        <Mask visible={loading} opacity={0.5}>
          <div className={styles.fullscreen}>
            <SpinLoading color="primary" />
          </div>
        </Mask>
      </>
    )
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <SpinLoading color="primary" />
      </div>
    )
  }

  return <>{children}</>
}

export default Loading
