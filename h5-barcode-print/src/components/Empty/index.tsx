// Empty 空状态组件
import { Empty as AntEmpty } from 'antd-mobile'
import type { ReactNode } from 'react'
import styles from './index.module.less'

export interface EmptyProps {
  image?: string
  description?: string
  children?: ReactNode
}

const Empty = ({ image, description = '暂无数据', children }: EmptyProps) => {
  return (
    <div className={styles.empty}>
      <AntEmpty
        image={image}
        description={description}
      />
      {children && <div className={styles.action}>{children}</div>}
    </div>
  )
}

export default Empty
