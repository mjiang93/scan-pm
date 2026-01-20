// 打印内包装码页面
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Toast, ErrorBlock } from 'antd-mobile'
import { PageContainer, QRCode, Barcode, Loading } from '@/components'
import { scanBtcode, updatePrintStatus } from '@/services/barcode'
import { batchPrint } from '@/services/printer'
import type { BatchPrintRequest } from '@/types/printer'
import { useUserStore } from '@/stores'
import { usePrinterSelector } from '@/hooks'
import { domToBase64 } from '@/utils/domToImage'
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
  const { selectPrinter, popup } = usePrinterSelector()

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
          size: '100mm*70mm',
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
    } catch (error: unknown) {
      console.error('加载打印数据失败:', error)
      const errMsg = (error as { message?: string; msg?: string })?.message || (error as { message?: string; msg?: string })?.msg || '加载打印数据失败'
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

  // 创建用于打印的DOM（100mm x 70mm @ 203 DPI = 797px x 551px）
  const createPrintElement = (): HTMLElement => {
    const originalPreview = document.querySelector(`.${styles.preview}`) as HTMLElement
    if (!originalPreview) {
      throw new Error('找不到打印预览区域')
    }
    
    const container = originalPreview.cloneNode(true) as HTMLElement
    
    // 100mm x 70mm @ 203 DPI = 797px x 551px
    const width = 797
    const height = 551
    
    container.style.cssText = `
      width: ${width}px;
      height: ${height}px;
      background: white;
      display: flex;
      padding: 12px;
      box-sizing: border-box;
      gap: 8px;
      position: absolute;
      left: -9999px;
      top: 0;
      border: none;
      border-radius: 0;
      margin: 0;
    `
    
    // 复制所有canvas内容
    const originalCanvases = originalPreview.querySelectorAll('canvas')
    const clonedCanvases = container.querySelectorAll('canvas')
    
    originalCanvases.forEach((originalCanvas, index) => {
      const clonedCanvas = clonedCanvases[index] as HTMLCanvasElement
      if (clonedCanvas) {
        const ctx = clonedCanvas.getContext('2d')
        if (ctx) {
          clonedCanvas.width = originalCanvas.width
          clonedCanvas.height = originalCanvas.height
          ctx.drawImage(originalCanvas, 0, 0)
        }
      }
    })
    
    // 调整左侧区域
    const leftSection = container.querySelector(`.${styles.leftSection}`) as HTMLElement
    if (leftSection) {
      leftSection.style.cssText = `
        display: flex;
        flex-direction: column;
        flex: 1;
        justify-content: space-between;
      `
    }
    
    // 调整PartNo区域
    const partNoSection = container.querySelector(`.${styles.partNoSection}`) as HTMLElement
    if (partNoSection) {
      partNoSection.style.cssText = `
        margin-bottom: 8px;
        font-size: 18px;
        font-weight: bold;
      `
      
      const partNoLabel = partNoSection.querySelector(`.${styles.partNoLabel}`) as HTMLElement
      if (partNoLabel) {
        partNoLabel.style.cssText = 'color: #000; font-size: 18px;'
      }
      
      const barcodeWrapper = partNoSection.querySelector(`.${styles.barcodeWrapper}`) as HTMLElement
      if (barcodeWrapper) {
        barcodeWrapper.style.cssText = 'margin-top: 4px; display: flex;'
      }
    }
    
    // 调整信息区域
    const infoSection = container.querySelector(`.${styles.infoSection}`) as HTMLElement
    if (infoSection) {
      infoSection.style.cssText = 'display: flex; flex-direction: column;'
      
      const infoItems = infoSection.querySelectorAll(`.${styles.infoItem}`)
      infoItems.forEach((item) => {
        const itemElement = item as HTMLElement
        itemElement.style.cssText = `
          margin-bottom: 8px;
          font-size: 16px;
          display: inline-block;
          max-width: 100%;
        `
        
        const label = itemElement.querySelector(`.${styles.infoLabel}`) as HTMLElement
        if (label) {
          label.style.cssText = 'font-weight: bold; color: #000; display: inline; font-size: 16px;'
        }
        
        const value = itemElement.querySelector(`.${styles.infoValue}`) as HTMLElement
        if (value) {
          value.style.cssText = 'color: #000; display: inline; word-wrap: break-word; font-size: 16px;'
        }
      })
    }
    
    // 调整二维码区域
    const qrCodeSection = container.querySelector(`.${styles.qrCodeSection}`) as HTMLElement
    if (qrCodeSection) {
      qrCodeSection.style.cssText = `
        margin-top: auto;
        display: flex;
        justify-content: flex-start;
        padding-top: 8px;
      `
      
      const qrCanvas = qrCodeSection.querySelector('canvas') as HTMLCanvasElement
      if (qrCanvas) {
        qrCanvas.style.width = '140px'
        qrCanvas.style.height = '140px'
      }
    }
    
    // 调整右侧区域
    const rightSection = container.querySelector(`.${styles.rightSection}`) as HTMLElement
    if (rightSection) {
      rightSection.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
      `
      
      const rightItems = rightSection.querySelectorAll(`.${styles.rightItem}`)
      rightItems.forEach((item) => {
        const itemElement = item as HTMLElement
        itemElement.style.cssText = `
          font-size: 16px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
        `
        
        const label = itemElement.querySelector(`.${styles.rightLabel}`) as HTMLElement
        if (label) {
          label.style.cssText = 'font-weight: bold; color: #000; display: inline-block; font-size: 16px;'
        }
        
        const value = itemElement.querySelector(`.${styles.rightValue}`) as HTMLElement
        if (value) {
          value.style.cssText = 'color: #000; display: inline-block; font-size: 16px;'
        }
      })
      
      const smallBarcodeWrapper = rightSection.querySelector(`.${styles.smallBarcodeWrapper}`) as HTMLElement
      if (smallBarcodeWrapper) {
        smallBarcodeWrapper.style.cssText = 'display: flex; justify-content: flex-end;'
      }
    }
    
    return container
  }

  const handlePrint = async () => {
    if (!printData) {
      Toast.show({ content: '没有可打印的数据' })
      return
    }

    try {
      // 选择打印机
      const selectedPrinter = await selectPrinter()
      
      if (!selectedPrinter) {
        return // 用户取消选择
      }

      Toast.show({
        icon: 'loading',
        content: `正在准备打印数据...`,
        duration: 0
      })

      // 等待Canvas渲染完成
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 创建打印元素
      const printElement = createPrintElement()
      document.body.appendChild(printElement)
      
      try {
        // 转换为base64图片（100mm x 70mm）
        const base64Image = await domToBase64(printElement, 100, 70)
        
        // 准备打印请求
        const printRequest: BatchPrintRequest = {
          barcodeId: parseInt(recordId) || 0,
          copies: 1,
          ip: selectedPrinter.ip,
          operator: userInfo?.userName || 'unknown',
          port: selectedPrinter.port,
          printData: base64Image,
          printType: 'INNER',
          printerId: selectedPrinter.printerId,
          priority: selectedPrinter.priority || 5
        }

        Toast.show({
          icon: 'loading',
          content: `正在使用 ${selectedPrinter.printerName} 打印...`,
          duration: 0
        })

        // 调用批量打印接口
        await batchPrint([printRequest])
        
        Toast.show({
          icon: 'success',
          content: '打印任务已发送'
        })
        
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
      } finally {
        document.body.removeChild(printElement)
      }
      
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
                      width={2}
                      height={60}
                      fontSize={14}
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
                  size={100}
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
                    width={2}
                    height={60}
                    fontSize={12}
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
      
      {/* 打印机选择弹窗 */}
      {popup}
    </PageContainer>
  )
}

export default PrintInner
