// 首页
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { List, Picker, Toast } from 'antd-mobile'
import { ScanCodeOutline, SetOutline } from 'antd-mobile-icons'
import { PageContainer } from '@/components'
import { usePrinterStore, useUserStore } from '@/stores'
import { getPrinterList } from '@/services/printer'
import type { Printer } from '@/types/printer'
import styles from './index.module.less'

const Home = () => {
  const navigate = useNavigate()
  const { userInfo, logout } = useUserStore()
  const { currentPrinter, setCurrentPrinter, setPrinterList, printerList } = usePrinterStore()
  const [pickerVisible, setPickerVisible] = useState(false)

  useEffect(() => {
    const loadPrinters = async () => {
      try {
        const list = await getPrinterList()
        setPrinterList(list)
      } catch {
        // 使用模拟数据
        const mockPrinters: Printer[] = [
          { id: '1', name: '打印机1', ip: '192.168.1.100', port: 9100, status: 'online', type: 'body' },
          { id: '2', name: '打印机2', ip: '192.168.1.101', port: 9100, status: 'online', type: 'inner' },
          { id: '3', name: '打印机3', ip: '192.168.1.102', port: 9100, status: 'offline', type: 'label' },
        ]
        setPrinterList(mockPrinters)
      }
    }
    loadPrinters()
  }, [setPrinterList])

  const handleSelectPrinter = (value: (string | number | null)[]) => {
    const printerId = value[0] as string
    const printer = printerList.find(p => p.id === printerId)
    if (printer) {
      setCurrentPrinter(printer)
      Toast.show({ content: `已选择 ${printer.name}` })
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const menuItems = [
    { title: '扫码', icon: <ScanCodeOutline />, path: '/scan' },
    { title: '打印本体码', icon: <SetOutline />, path: '/print-body' },
    { title: '打印内包装码', icon: <SetOutline />, path: '/print-inner' },
    { title: '打印收货外标签', icon: <SetOutline />, path: '/print-label' },
  ]

  const printerColumns = [
    (printerList || []).map(p => ({
      label: `${p.name} (${p.status === 'online' ? '在线' : '离线'})`,
      value: p.id,
    })),
  ]

  return (
    <PageContainer title="条码打印系统" showBack={false} right={<span onClick={handleLogout}>退出</span>}>
      <div className={styles.home}>
        <div className={styles.userInfo}>
          <span>👤 {userInfo?.name || '用户'}</span>
        </div>

        <List header="打印机">
          <List.Item
            onClick={() => setPickerVisible(true)}
            extra={currentPrinter?.name || '请选择打印机'}
            arrow
          >
            当前打印机
          </List.Item>
        </List>

        <List header="功能入口" className={styles.menu}>
          {menuItems.map(item => (
            <List.Item
              key={item.path}
              prefix={item.icon}
              onClick={() => navigate(item.path)}
              arrow
            >
              {item.title}
            </List.Item>
          ))}
        </List>

        <Picker
          columns={printerColumns}
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          onConfirm={handleSelectPrinter}
          value={currentPrinter ? [currentPrinter.id] : []}
        />
      </div>
    </PageContainer>
  )
}

export default Home
