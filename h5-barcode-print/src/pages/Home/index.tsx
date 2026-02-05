// 首页
import { useNavigate } from 'react-router-dom'
import { Button, Card, Space } from 'antd-mobile'
import { 
  ScanCodeOutline, 
  SetOutline, 
  FileOutline, 
  AppstoreOutline 
} from 'antd-mobile-icons'
import { useUserStore } from '@/stores'
import { useFullscreen } from '@/hooks'
import { FullscreenIcon } from '@/components'
import styles from './index.module.less'

const Home = () => {
  const navigate = useNavigate()
  const { userInfo, logout } = useUserStore()
  const { isFullscreen, toggleFullscreen } = useFullscreen()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const menuItems = [
    { 
      title: '扫码生成SN码', 
      subtitle: '(扫产品编码)',
      icon: <ScanCodeOutline />, 
      path: '/scan?type=body',
      color: '#1677ff'
    },
    { 
      title: '条码列表', 
      icon: <FileOutline />, 
      path: '/barcode-list',
      color: '#1677ff'
    },
    { 
      title: '扫SN打印内包装', 
      icon: <SetOutline />, 
      path: '/scan?type=inner',
      color: '#1677ff'
    },
    { 
      title: '扫内包生成外装', 
      icon: <AppstoreOutline />, 
      path: '/scan?type=label',
      color: '#1677ff'
    },
  ]

  return (
    <div className={styles.home}>
      {/* 顶部区域 */}
      <div className={styles.header}>
        {/* 全屏切换按钮 */}
        <div className={styles.fullscreenBtn} onClick={toggleFullscreen}>
          <FullscreenIcon isFullscreen={isFullscreen} size={22} />
        </div>
        
        <div className={styles.logo}>
          <div className={styles.logoIcon}>📦</div>
        </div>
        <div className={styles.title}>条码打印系统</div>
        <div className={styles.welcome}>
          欢迎您，{userInfo?.userName || '张三'}
        </div>
      </div>

      {/* 功能卡片区域 */}
      <div className={styles.content}>
        <Space direction="vertical" block>
          {menuItems.map((item, index) => (
            <Card 
              key={index}
              className={styles.menuCard}
              onClick={() => navigate(item.path)}
            >
              <div className={styles.cardContent}>
                <div className={styles.cardIcon} style={{ color: item.color }}>
                  {item.icon}
                </div>
                <div className={styles.cardText}>
                  <div className={styles.cardTitle}>{item.title}</div>
                  {item.subtitle && (
                    <div className={styles.cardSubtitle}>{item.subtitle}</div>
                  )}
                </div>
                <div className={styles.cardArrow}>›</div>
              </div>
            </Card>
          ))}
        </Space>
      </div>

      {/* 退出登录按钮 */}
      <div className={styles.footer}>
        <Button 
          block 
          size="large" 
          color="warning"
          fill="outline"
          onClick={handleLogout}
          className={styles.logoutBtn}
        >
          退出登录
        </Button>
      </div>
    </div>
  )
}

export default Home
