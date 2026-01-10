// 打印本体码页面
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Toast, ErrorBlock } from 'antd-mobile'
import { PageContainer, QRCode, Barcode, Loading } from '@/components'
import { getBarcodeDetail, updatePrintStatus, getBtPrintInfo } from '@/services/barcode'
import { useUserStore } from '@/stores'
import styles from './index.module.less'

interface PrintData {
  no: string
  size: string
  pn: string
  rev: string
  model: string
  sn: string
  qrCodeData: string
  barcodes: string[] // 改为数组，用于循环显示多个条形码
}

const PrintBody = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id') || ''
  const [printData, setPrintData] = useState<PrintData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const printRef = useRef<HTMLDivElement>(null)
  const { userInfo } = useUserStore()

  const loadPrintData = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      // 先调用详情接口获取条码信息
      await getBarcodeDetail(id)
      
      // 再调用本体码打印预览接口（生成条码）
      const btPrintData = await getBtPrintInfo({
        id,
        operator: userInfo?.userName || ''
      })
      
      if (btPrintData) {
        // 根据btprint接口返回的数据映射到打印数据
        const mappedData: PrintData = {
          no: 'G1-1', // 固定值或从配置获取
          size: '42mm*10mm', // 固定值或从配置获取
          pn: btPrintData.pnCode || '', // PN使用pnCode
          rev: btPrintData.revCode || '', // Rev使用revCode
          model: btPrintData.modelCode || '', // Model使用modelCode
          sn: btPrintData.codeSN || '', // SN使用codeSN
          qrCodeData: `PN:${btPrintData.pnCode || ''};Rev:${btPrintData.revCode || ''};Model:${btPrintData.modelCode || ''};SN:${btPrintData.codeSN || ''}`,
          barcodes: btPrintData.fjList || [] // 条形码列表
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
    // 如果有传入的id，从API获取打印数据
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
          btPrintCnt: 1,
          nbzPrintCnt: 0,
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
      <PageContainer title="打印本体码">
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
            {/* 左侧：二维码和信息区域 */}
            <div className={styles.qrSection}>
              <div className={styles.qrCode}>
                <QRCode 
                  value={printData.qrCodeData}
                  size={80}
                />
              </div>
              <div className={styles.qrInfo}>
                <div className={styles.qrInfoRow}>
                  <div className={styles.qrLabel1}>
                    <div className={styles.qrLabel}>PN:</div>
                    <div className={styles.qrValue}>{printData.pn}</div>
                  </div>
                  <div className={styles.qrLabel1}>
                    <div className={styles.qrLabel}>Rev:</div>
                    <div className={styles.qrValue}>{printData.rev}</div>
                  </div>
                </div>
                <div className={styles.qrInfoRow}>
                  <div className={styles.qrLabel}>Model:</div>
                  <div className={styles.qrValue}>{printData.model}</div>
                </div>
                <div className={styles.qrInfoRow}>
                  <div className={styles.qrLabel}>SN:</div>
                  <div className={styles.qrValue}>{printData.sn}</div>
                </div>
              </div>
            </div>

            {/* 右侧：条形码区域 - 垂直排列 */}
            {printData.barcodes.map((barcodeValue, index) => (
              <div key={index} className={styles.barcodeSection}>
                <Barcode 
                  value={barcodeValue}
                  width={1}
                  height={30}
                  fontSize={8}
                />
              </div>
            ))}
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
