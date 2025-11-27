// PageContainer 页面容器组件
import type { ReactNode } from 'react'
import NavBar, { type NavBarProps } from '../NavBar'
import styles from './index.module.less'

export interface PageContainerProps extends NavBarProps {
  children: ReactNode
  className?: string
}

const PageContainer = ({
  title,
  showBack,
  onBack,
  right,
  children,
  className = '',
}: PageContainerProps) => {
  return (
    <div className={`${styles.page} ${className}`}>
      <NavBar
        title={title}
        showBack={showBack}
        onBack={onBack}
        right={right}
      />
      <div className={styles.content}>{children}</div>
    </div>
  )
}

export default PageContainer
