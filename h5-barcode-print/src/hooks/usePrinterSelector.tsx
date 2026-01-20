import { useState } from 'react'
import { Popup, Toast } from 'antd-mobile'
import { getAvailablePrinters } from '@/services/printer'
import type { Printer } from '@/types/printer'
import styles from './usePrinterSelector.module.less'

interface UsePrinterSelectorReturn {
  selectPrinter: () => Promise<Printer | null>
  popup: React.ReactNode
}

export const usePrinterSelector = (): UsePrinterSelectorReturn => {
  const [printers, setPrinters] = useState<Printer[]>([])
  const [visible, setVisible] = useState(false)
  const [resolveRef, setResolveRef] = useState<((value: Printer | null) => void) | null>(null)

  const selectPrinter = async (): Promise<Printer | null> => {
    try {
      // 获取可用打印机列表
      const printerList = await getAvailablePrinters()
      
      if (!printerList || printerList.length === 0) {
        Toast.show({
          icon: 'fail',
          content: '暂无可用打印机'
        })
        return null
      }

      setPrinters(printerList)

      // 显示打印机选择弹窗
      return new Promise((resolve) => {
        setResolveRef(() => resolve)
        setVisible(true)
      })
    } catch (error) {
      console.error('获取打印机列表失败:', error)
      Toast.show({
        icon: 'fail',
        content: '获取打印机列表失败'
      })
      return null
    }
  }

  const handleSelect = (printer: Printer) => {
    setVisible(false)
    if (resolveRef) {
      resolveRef(printer)
    }
  }

  const handleClose = () => {
    setVisible(false)
    if (resolveRef) {
      resolveRef(null)
    }
  }

  return { 
    selectPrinter,
    popup: (
      <Popup
        visible={visible}
        onMaskClick={handleClose}
        onClose={handleClose}
        position='bottom'
        bodyStyle={{ 
          borderTopLeftRadius: '8px', 
          borderTopRightRadius: '8px',
          maxHeight: '70vh'
        }}
      >
        <div className={styles.popupContainer}>
          <div className={styles.popupHeader}>
            <span className={styles.popupTitle}>选择打印机</span>
          </div>
          <div className={styles.printerList}>
            {printers.map((printer) => (
              <div
                key={printer.printerId}
                className={styles.printerItem}
                onClick={() => handleSelect(printer)}
              >
                <div className={styles.printerHeader}>
                  <span className={styles.infoItem}>型号:{printer.model}</span>
                  <span className={`${styles.status} ${styles[printer.status.toLowerCase()]}`}>
                    {printer.status === 'ONLINE' ? '在线' : '离线'}
                  </span>
                </div>
                <div className={styles.printerInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>IP:</span>
                    <span className={styles.value}>{printer.ip}:{printer.port}</span>
                  </div>
                  {/* <div className={styles.infoItem}>
                    <span className={styles.label}>型号:</span>
                    <span className={styles.value}>{printer.model}</span>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Popup>
    )
  }
}
