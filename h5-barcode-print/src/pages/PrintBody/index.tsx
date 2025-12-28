// 打印本体码页面
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Toast } from 'antd-mobile'
import { PageContainer, QRCode, Barcode } from '@/components'
import styles from './index.module.less'

interface PrintData {
  no: string
  size: string
  pn: string
  rev: string
  model: string
  sn: string
  barcode1: string
  barcode2: string
}

const PrintBody = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code') || ''
  const [printData, setPrintData] = useState<PrintData | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 如果有传入的code，生成打印数据
    if (code) {
      const mockPrintData: PrintData = {
        no: 'G1-1',
        size: '42mm*10mm',
        pn: '9302A01RG5',
        rev: 'A01',
        model: '0000124A001',
        sn: '0000124A001',
        barcode1: 'S0000124A001IP9302A01RG52PA01-001',
        barcode2: 'S0000124A001IP9302A01RG52PA01-002'
      }
      // 使用setTimeout避免同步setState警告
      setTimeout(() => {
        setPrintData(mockPrintData)
      }, 0)
    }
  }, [code])

  const handlePrint = async () => {
    if (!printData) {
      Toast.show({ content: '没有可打印的数据' })
      return
    }

    try {
      // 等待Canvas渲染完成
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // 调用浏览器打印功能
      window.print()
      
      Toast.show({ icon: 'success', content: '打印任务已发送' })
      
    } catch (error) {
      console.error('打印失败:', error)
      Toast.show({ icon: 'fail', content: '打印失败，请重试' })
    }
  }

  if (!printData) {
    return (
      <PageContainer title="打印本体码">
        <div className={styles.error}>
          <p>没有可打印的数据</p>
          <Button color="primary" onClick={() => navigate('/home')}>
            返回首页
          </Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="本体码">
      <div className={styles.printBody}>
        {/* 打印信息 - 不打印 */}
        <div className={styles.printInfo}>
          <div className={styles.infoRow}>
            <span className={styles.label}>NO:</span>
            <span className={styles.value}>{printData.no}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>尺寸:</span>
            <span className={styles.value}>{printData.size}</span>
          </div>
        </div>

        {/* 打印内容区域 */}
        <div ref={printRef} className={styles.printContent}>
          {/* 打印预览区域 */}
          <div className={styles.preview}>
            {/* 二维码和信息区域 */}
            <div className={styles.qrSection}>
              <div className={styles.qrCode}>
                <QRCode 
                  value={`PN:${printData.pn};Rev:${printData.rev};Model:${printData.model};SN:${printData.sn}`}
                  size={100}
                />
              </div>
              <div className={styles.qrInfo}>
                <div className={styles.qrInfoRow}>
                  <span className={styles.qrLabel}>PN:</span>
                  <span className={styles.qrValue}>{printData.pn}</span>
                  <span className={styles.qrLabel}>Rev:</span>
                  <span className={styles.qrValue}>{printData.rev}</span>
                </div>
                <div className={styles.qrInfoRow}>
                  <span className={styles.qrLabel}>Model:</span>
                  <span className={styles.qrValue}>{printData.model}</span>
                </div>
                <div className={styles.qrInfoRow}>
                  <span className={styles.qrLabel}>SN:</span>
                  <span className={styles.qrValue}>{printData.sn}</span>
                </div>
              </div>
            </div>

            {/* 条形码区域 */}
            <div className={styles.barcodeSection}>
              <Barcode 
                value={printData.barcode1}
                width={1.5}
                height={50}
                fontSize={10}
              />
            </div>

            <div className={styles.barcodeSection}>
              <Barcode 
                value={printData.barcode2}
                width={1.5}
                height={50}
                fontSize={10}
              />
            </div>
          </div>
        </div>

        {/* 打印按钮 - 不打印 */}
        <div className={styles.printAction}>
          <Button
            block
            color="primary"
            size="large"
            onClick={handlePrint}
            className={styles.printBtn}
          >
            打印
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

export default PrintBody
