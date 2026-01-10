// 打印内包装码页面
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Toast, ErrorBlock } from 'antd-mobile'
import { PageContainer, QRCode, Barcode, Loading } from '@/components'
import { scanBtcode, updatePrintStatus } from '@/services/barcode'
import { useUserStore } from '@/stores'
import styles from './index.module.less'

interface PrintData {
  no: string
  size: string
  partNo: string
  barcode: string
  qty: number
  description: string
  dc: string
  supplierCode: string
  smallBarcode: string
  sn: string
  qrCodeData: string
}

const PrintInner = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const btcode = searchParams.get('btcode') || ''
  const [printData, setPrintData] = useState<PrintData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [recordId, setRecordId] = useState<string>('')
  const printRef = useRef<HTMLDivElement>(null)
  const { userInfo } = useUserStore()

  const loadPrintData = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      // 调用扫本体码接口获取内包装码打印信息
      const detail = await scanBtcode(btcode)
      
      if (detail) {
        // 保存记录ID用于更新打印状态
        setRecordId(detail.id)
        
        // 格式化日期
        const dcDate = detail.dcDate 
          ? new Date(parseInt(detail.dcDate)).toISOString().split('T')[0]
          : ''
        
        const mappedData: PrintData = {
          no: 'G1-1',
          size: '77mm*50mm',
          partNo: detail.partNo || '',
          barcode: detail.partNo || '',
          qty: detail.qty ? parseInt(detail.qty) : 1,
          description: detail.remark || '',
          dc: dcDate,
          supplierCode: detail.supplierCode || '',
          smallBarcode: detail.supplierCode || '',
          sn: detail.codeSN || '',
          qrCodeData: detail.codeSN
        }
        setPrintData(mappedData)
      }
    } catch (error: any) {
      console.error('加载打印数据失败:', error)
      const errMsg = error?.message || error?.msg || '加载打印数据失败'
      setErrorMessage(errMsg)
      Toast.show({
        icon: 'fail',
        content: errMsg
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (btcode) {
      loadPrintData()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [btcode])

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
      
      // 更新打印状态
      if (recordId) {
        await updatePrintStatus({
          id: parseInt(recordId),
          operator: userInfo?.userName || 'unknown',
          nbzPrintCnt: 1,
          btPrintCnt: 0,
          wbzPrintCnt: 0
        })
      }
      
      // Toast.show({ icon: 'success', content: '打印任务已发送' })
      
    } catch (error) {
      console.error('打印失败:', error)
      // Toast.show({ icon: 'fail', content: '打印失败，请重试' })
    }
  }

  if (loading) {
    return <Loading loading fullscreen />
  }

  if (!printData) {
    return (
      <PageContainer title="打印内包装码">
        <div className={styles.errorContainer}>
          <ErrorBlock
            status="default"
            title="加载失败"
            description={errorMessage || '没有可打印的数据'}
          />
          <Button 
            color="primary" 
            onClick={() => navigate('/home')}
            className={styles.backButton}
          >
            返回首页
          </Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="内包装码">
      <div className={styles.printInner}>
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
          <div className={styles.preview}>
            {/* 左侧区域 */}
            <div className={styles.leftSection}>
              <div className={styles.leftSection1}>

                {/* PartNo和条形码 */}
                <div className={styles.partNoSection}>
                  <div className={styles.partNoLabel}>PartNO: {printData.partNo}</div>
                  <div className={styles.barcodeWrapper}>
                    <Barcode 
                      value={printData.barcode}
                      width={1}
                      height={30}
                      fontSize={9}
                      displayValue={false}
                    />
                  </div>
                </div>

                {/* 数量和描述 */}
                <div className={styles.infoSection}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>QTY:</span>
                    <span className={styles.infoValue}>{printData.qty}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>描述:</span>
                    <span className={styles.infoValue}>{printData.description}</span>
                  </div>
                  <div className={`${styles.infoItem} ${styles.fullWidth}`}>
                    <span className={styles.infoLabel}>SN:</span>
                    <span className={styles.infoValue}>{printData.sn}</span>
                  </div>
                </div>
              </div>

              {/* 底部二维码 */}
              <div className={styles.qrCodeSection}>
                <QRCode 
                  value={printData.qrCodeData}
                  size={60}
                />
              </div>
            </div>

            {/* 右侧区域 */}
            <div className={styles.rightSection}>
              <div className={styles.rightSection1}>
                <div className={styles.rightItem}>
                  <div className={styles.rightLabel}>D/C:</div>
                  <div className={styles.rightValue}>{printData.dc}</div>
                </div>
                <div className={styles.rightItem}>
                  <div className={styles.rightLabel}>供应商代码:</div>
                  <div className={styles.rightValue}>{printData.supplierCode}</div>
                </div>
                <div className={styles.smallBarcodeWrapper}>
                  <Barcode 
                    value={printData.smallBarcode}
                    width={1}
                    height={25}
                    fontSize={7}
                    displayValue={false}
                  />
                </div>
              </div>
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

export default PrintInner
