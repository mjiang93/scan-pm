// 打印本体码页面
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Toast, ErrorBlock } from 'antd-mobile'
import { PageContainer, QRCode, Barcode, Loading } from '@/components'
import { getBarcodeDetail, updatePrintStatus, getBtPrintInfo } from '@/services/barcode'
import { batchPrint } from '@/services/printer'
import type { BatchPrintRequest } from '@/types/printer'
import { useUserStore } from '@/stores'
import { usePrinterSelector } from '@/hooks'
import { domToBase64 } from '@/utils/domToImage'
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
  const { selectPrinter, popup } = usePrinterSelector()

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
          size: '48mm*6mm', // 固定值或从配置获取
          pn: btPrintData.pnCode || '', // PN使用pnCode
          rev: btPrintData.revCode || '', // Rev使用revCode
          model: btPrintData.modelCode || '', // Model使用modelCode
          sn: btPrintData.codeSN || '', // SN使用codeSN
          qrCodeData: btPrintData.codeSNFull,
          barcodes: btPrintData.fjList || [] // 条形码列表
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
    // 如果有传入的id，从API获取打印数据
    if (id) {
      loadPrintData()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // 创建用于打印的QRCode区域DOM（382px x 48px）
  const createPrintQRSection = (): HTMLElement => {
    // 克隆现有的QRCode区域
    const originalSection = document.querySelector(`.${styles.qrSection}`) as HTMLElement
    if (!originalSection) {
      throw new Error('找不到QRCode区域')
    }
    
    const container = originalSection.cloneNode(true) as HTMLElement
    
    // 直接使用打印机分辨率: 48mm x 6mm @ 203 DPI = 382px x 48px
    const width = 382
    const height = 48
    
    container.style.cssText = `
      width: ${width}px;
      height: ${height}px;
      background: white;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 4px;
      box-sizing: border-box;
      gap: 4px;
      position: absolute;
      left: -9999px;
      top: 0;
      border: none;
      border-radius: 0;
      margin: 0;
    `
    
    // 调整QRCode大小 - 5mm @ 203 DPI ≈ 40px
    const qrCode = container.querySelector(`.${styles.qrCode}`) as HTMLElement
    if (qrCode) {
      qrCode.style.cssText = `
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0;
      `
      
      // 复制canvas内容
      const originalCanvas = originalSection.querySelector(`.${styles.qrCode} canvas`) as HTMLCanvasElement
      const clonedCanvas = container.querySelector(`.${styles.qrCode} canvas`) as HTMLCanvasElement
      if (originalCanvas && clonedCanvas) {
        // 复制canvas的像素数据
        const ctx = clonedCanvas.getContext('2d')
        if (ctx) {
          clonedCanvas.width = originalCanvas.width
          clonedCanvas.height = originalCanvas.height
          ctx.drawImage(originalCanvas, 0, 0)
        }
        
        // 调整显示大小
        clonedCanvas.style.width = '40px'
        clonedCanvas.style.height = '40px'
        clonedCanvas.style.display = 'block'
      }
    }
    
    // 调整信息区域
    const qrInfo = container.querySelector(`.${styles.qrInfo}`) as HTMLElement
    if (qrInfo) {
      qrInfo.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 2px;
        width: 100%;
        min-width: 0;
      `
      
      // 调整所有信息行 - 使用更大的字体以适配382px宽度
      const rows = qrInfo.querySelectorAll(`.${styles.qrInfoRow}`)
      rows.forEach((row) => {
        const rowElement = row as HTMLElement
        rowElement.style.cssText = `
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          margin: 0;
          font-size: 9px;
          line-height: 1.2;
          font-family: Arial, sans-serif;
        `
        
        // 调整标签
        const labels = rowElement.querySelectorAll(`.${styles.qrLabel}`)
        labels.forEach((label) => {
          const labelElement = label as HTMLElement
          labelElement.style.cssText = `
            font-weight: bold;
            color: #000;
            display: inline-block;
            flex-shrink: 0;
            margin-right: 2px;
            font-size: 9px;
          `
        })
        
        // 调整值
        const values = rowElement.querySelectorAll(`.${styles.qrValue}`)
        values.forEach((value) => {
          const valueElement = value as HTMLElement
          valueElement.style.cssText = `
            color: #000;
            display: inline-block;
            white-space: nowrap;
            margin-right: 6px;
            font-size: 9px;
          `
        })
        
        // 调整label1容器
        const label1s = rowElement.querySelectorAll(`.${styles.qrLabel1}`)
        label1s.forEach((label1) => {
          const label1Element = label1 as HTMLElement
          label1Element.style.cssText = 'display: inline-flex; align-items: center; margin-right: 4px;'
        })
      })
    }
    
    return container
  }
  
  // 创建用于打印的条形码区域DOM（382px x 48px）
  const createPrintBarcodeSection = (index: number): HTMLElement => {
    // 克隆现有的条形码区域
    const barcodeSections = document.querySelectorAll(`.${styles.barcodeSection}`)
    const originalSection = barcodeSections[index] as HTMLElement
    if (!originalSection) {
      throw new Error(`找不到第${index}个条形码区域`)
    }
    
    const container = originalSection.cloneNode(true) as HTMLElement
    
    // 直接使用打印机分辨率: 48mm x 6mm @ 203 DPI = 382px x 48px
    const width = 382
    const height = 48
    
    container.style.cssText = `
      width: ${width}px;
      height: ${height}px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      box-sizing: border-box;
      position: absolute;
      left: -9999px;
      top: 0;
      border: none;
      border-radius: 0;
      text-align: center;
      margin: 0;
    `
    
    // 复制canvas内容
    const originalCanvas = originalSection.querySelector('canvas') as HTMLCanvasElement
    const clonedCanvas = container.querySelector('canvas') as HTMLCanvasElement
    if (originalCanvas && clonedCanvas) {
      // 复制canvas的像素数据
      const ctx = clonedCanvas.getContext('2d')
      if (ctx) {
        clonedCanvas.width = originalCanvas.width
        clonedCanvas.height = originalCanvas.height
        ctx.drawImage(originalCanvas, 0, 0)
      }
      
      // 调整显示大小 - 46mm x 5mm @ 203 DPI ≈ 366px x 40px
      clonedCanvas.style.maxWidth = '366px'
      clonedCanvas.style.maxHeight = '40px'
      clonedCanvas.style.width = 'auto'
      clonedCanvas.style.height = 'auto'
      clonedCanvas.style.display = 'block'
      clonedCanvas.style.margin = '0 auto'
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
      
      // 准备批量打印请求数组
      const printRequests: BatchPrintRequest[] = []
      
      // 1. 处理QRCode区域（包含二维码和信息）
      const qrPrintElement = createPrintQRSection()
      document.body.appendChild(qrPrintElement)
      
      try {
        const qrBase64 = await domToBase64(qrPrintElement, 48, 6)
        printRequests.push({
          barcodeId: parseInt(id) || 0,
          copies: 1,
          ip: selectedPrinter.ip,
          operator: userInfo?.userName || 'unknown',
          port: selectedPrinter.port,
          printData: qrBase64,
          printType: 'BODY',
          printerId: selectedPrinter.printerId,
          priority: selectedPrinter.priority || 5
        })
      } finally {
        document.body.removeChild(qrPrintElement)
      }
      
      // 2. 处理每个条形码
      for (let i = 0; i < printData.barcodes.length; i++) {
        const barcodePrintElement = createPrintBarcodeSection(i)
        document.body.appendChild(barcodePrintElement)
        
        try {
          const barcodeBase64 = await domToBase64(barcodePrintElement, 48, 6)
          printRequests.push({
            barcodeId: parseInt(id) || 0,
            copies: 1,
            ip: selectedPrinter.ip,
            operator: userInfo?.userName || 'unknown',
            port: selectedPrinter.port,
            printData: barcodeBase64,
            printType: 'BODY',
            printerId: selectedPrinter.printerId,
            priority: selectedPrinter.priority || 5
          })
        } finally {
          document.body.removeChild(barcodePrintElement)
        }
      }

      Toast.show({
        icon: 'loading',
        content: `正在使用 ${selectedPrinter.printerName} 打印...`,
        duration: 0
      })

      // 调用批量打印接口
      await batchPrint(printRequests)
      
      Toast.show({
        icon: 'success',
        content: '打印任务已发送'
      })
      
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
      
      {/* 打印机选择弹窗 */}
      {popup}
    </PageContainer>
  )
}

export default PrintBody
