// NavBar 导航栏组件
import { NavBar as AntNavBar } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import styles from './index.module.less'

export interface NavBarProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  right?: ReactNode
}

const NavBar = ({ title, showBack = true, onBack, right }: NavBarProps) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <AntNavBar
      className={styles.navbar}
      back={showBack ? undefined : null}
      onBack={handleBack}
      right={right}
    >
      {title}
    </AntNavBar>
  )
}

export default NavBar
