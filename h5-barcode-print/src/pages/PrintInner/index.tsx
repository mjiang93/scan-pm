// 打印内包装码页面
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Toast } from 'antd-mobile'
import { PageContainer, QRCode, Barcode, Loading } from '@/components'
import { getBarcodeDetail, updatePrintStatus } from '@/services/barcode'
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
  const id = searchParams.get('id') || ''
  const [printData, setPrintData] = useState<PrintData | null>(null)
  const [loading, setLoading] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)
  const { userInfo } = useUserStore()

  const loadPrintData = async () => {
    setLoading(true)
    try {
      // 调用详情接口获取条码信息
      const detail = await getBarcodeDetail(id)
      
      if (detail) {
        // 根据详情接口返回的数据映射到打印数据
        // 格式化日期
        const dcDate = detail.deliveryDate 
          ? new Date(parseInt(detail.deliveryDate)).toISOString().split('T')[0]
          : ''
        
        const mappedData: PrintData = {
          no: 'G1-1',
          size: '77mm*50mm',
          partNo: detail.materialCode || '',
          barcode: detail.materialCode || '',
          qty: detail.cnt || 1,
          description: detail.nameModel || '',
          dc: dcDate,
          supplierCode: detail.supplierCode || '',
          smallBarcode: detail.supplierCode || '',
          sn: `S${detail.codeSn || ''}IP${detail.materialCode || ''}2P${detail.technicalVersion || ''}`,
          qrCodeData: `PartNo:${detail.materialCode || ''};QTY:${detail.cnt || 1};DC:${dcDate};SN:${detail.codeSn || ''}`
        }
        setPrintData(mappedData)
      }
    } catch (error) {
      console.error('加载打印数据失败:', error)
      Toast.show({
        icon: 'fail',
        content: '加载打印数据失败'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      loadPrintData()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

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
      if (id) {
        await updatePrintStatus({
          id: parseInt(id),
          operator: userInfo?.userName || 'unknown',
          nbzPrintCnt: 1
        })
      }
      
      Toast.show({ icon: 'success', content: '打印任务已发送' })
      
    } catch (error) {
      console.error('打印失败:', error)
      Toast.show({ icon: 'fail', content: '打印失败，请重试' })
    }
  }

  if (loading) {
    return <Loading loading fullscreen />
  }

  if (!printData) {
    return (
      <PageContainer title="打印内包装码">
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
              {/* PartNo和条形码 */}
              <div className={styles.partNoSection}>
                <div className={styles.partNoLabel}>PartNO: {printData.partNo}</div>
                <div className={styles.barcodeWrapper}>
                  <Barcode 
                    value={printData.barcode}
                    width={2}
                    height={40}
                    fontSize={10}
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

              {/* 底部二维码 */}
              <div className={styles.qrCodeSection}>
                <QRCode 
                  value={printData.qrCodeData}
                  size={80}
                />
              </div>
            </div>

            {/* 右侧区域 */}
            <div className={styles.rightSection}>
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
                  width={1.5}
                  height={30}
                  fontSize={8}
                />
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
