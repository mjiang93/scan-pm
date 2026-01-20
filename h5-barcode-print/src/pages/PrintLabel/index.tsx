// 收货外标签码打印页面
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Toast, ErrorBlock } from 'antd-mobile'
import { PageContainer, QRCode, Loading } from '@/components'
import { scanNbzcode, updatePrintStatus } from '@/services/barcode'
import { batchPrint } from '@/services/printer'
import type { BatchPrintRequest } from '@/types/printer'
import { useUserStore } from '@/stores'
import { usePrinterSelector } from '@/hooks'
import { domToBase64 } from '@/utils/domToImage'
import styles from './index.module.less'

interface PrintData {
  no: string
  size: string
  title: string
  materialCode: string
  nameModel: string
  qty: number
  unit: string
  supplierCode: string
  deliveryDate: string
  poNumber: string
  batchNumber: string
  storageLocation: string
  sn: string
  qrCodeData: string
  code09: string
}

const PrintLabel = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nbzcode = searchParams.get('nbzcode') || '' // 从URL获取内包装码
  const [printData, setPrintData] = useState<PrintData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [recordId, setRecordId] = useState<string>('') // 保存记录ID用于更新打印状态
  const printRef = useRef<HTMLDivElement>(null)
  const { userInfo } = useUserStore()
  const { selectPrinter, popup } = usePrinterSelector()

  const loadPrintData = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      // 调用扫内包装码接口获取外包装码打印信息
      const detail = await scanNbzcode(nbzcode)
      
      if (detail) {
        // 保存记录ID
        setRecordId(detail.id)
        
        // 格式化日期
        const deliveryDate = detail.deliveryDate 
          ? new Date(parseInt(detail.deliveryDate)).toISOString().split('T')[0]
          : ''
        
        const mappedData: PrintData = {
          no: 'G1-1',
          size: '100mm*70mm',
          title: '供应商送货标签',
          materialCode: detail.materialCode || '',
          nameModel: detail.nameModel || '',
          qty: detail.cnt || 0,
          unit: detail.unit || '',
          supplierCode: detail.supplierCode || '',
          deliveryDate: deliveryDate,
          poNumber: detail.poNo || '', // PO行号
          batchNumber: detail.codeSN || '', // SN码作为批号
          storageLocation: detail.saveClean || '', // 存储/清洁
          sn: detail.codeSN || '', // 直接使用返回的SN码
          code09: detail.code09 || '', // 直接使用返回的SN码
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
    if (nbzcode) {
      loadPrintData()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nbzcode])

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
      display: block;
      padding: 24px;
      box-sizing: border-box;
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
    
    // 调整表格样式
    const table = container.querySelector(`.${styles.labelTable}`) as HTMLElement
    if (table) {
      table.style.cssText = `
        width: 100%;
        height: 100%;
        border:3px solid;
        border-collapse: collapse;
        font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
        table-layout: fixed;
        margin: 0;
      `
      
      // 调整所有单元格基础样式
      const cells = table.querySelectorAll('td, th')
      cells.forEach((cell) => {
        const cellElement = cell as HTMLElement
        cellElement.style.padding = '8px'
        cellElement.style.color = '#000'
        cellElement.style.verticalAlign = 'middle'
        cellElement.style.lineHeight = '1.2'
      })
      
      // 调整标题行
      const title = table.querySelector(`.${styles.tableTitle}`) as HTMLElement
      if (title) {
        title.style.cssText = `
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          padding: 12px;
          background: white;
          color: #000;
          height: 60px;
          box-sizing: border-box;
        `
      }
      
      // 调整标签单元格（左侧灰色背景的标签）
      const labelCells = table.querySelectorAll(`.${styles.labelCell}`)
      labelCells.forEach((cell) => {
        const cellElement = cell as HTMLElement
        cellElement.style.cssText = `
          font-weight: bold;
          background: #d0d0d0;
          text-align: center;
          padding: 8px;
          font-size: 16px;
          color: #000;
          width: 140px;
          height: 60px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          box-sizing: border-box;
        `
      })
      
      // 调整值单元格
      const valueCells = table.querySelectorAll(`.${styles.valueCell}`)
      valueCells.forEach((cell) => {
        const cellElement = cell as HTMLElement
        cellElement.style.cssText = `
          text-align: center;
          padding: 8px;
          font-size: 16px;
          color: #000;
          height: 60px;
          box-sizing: border-box;
        `
      })
      
      // 调整二维码区域（跨两行）
      const qrSection = table.querySelector(`.${styles.qrSection}`) as HTMLElement
      if (qrSection) {
        qrSection.style.cssText = `
          text-align: center;
          vertical-align: middle;
          padding: 8px;
          width: 160px;
          box-sizing: border-box;
        `
        
        const qrContainer = qrSection.querySelector(`.${styles.qrCodeContainer}`) as HTMLElement
        if (qrContainer) {
          qrContainer.style.cssText = 'display: flex; justify-content: center; align-items: center; height: 100%;'
        }
        
        const qrCode = qrSection.querySelector(`.${styles.qrCode}`) as HTMLElement
        if (qrCode) {
          qrCode.style.cssText = `
            display: inline-block;
            border: none;
            padding: 0;
            background: white;
            box-sizing: border-box;
          `
          
          const canvas = qrCode.querySelector('canvas') as HTMLCanvasElement
          if (canvas) {
            canvas.style.width = '100px'
            canvas.style.height = '100px'
            canvas.style.display = 'block'
          }
        }
      }
      
      // 调整批号包装器
      const batchWrapper = table.querySelector(`.${styles.batchWrapper}`) as HTMLElement
      if (batchWrapper) {
        batchWrapper.style.cssText = `
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 4px;
          font-size: 16px;
        `
      }
      
      // 调整多行文本单元格
      const multiLineCells = table.querySelectorAll(`.${styles.multiLine}`)
      multiLineCells.forEach((cell) => {
        const cellElement = cell as HTMLElement
        cellElement.style.lineHeight = '1.3'
        cellElement.style.wordBreak = 'break-all'
      })
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
          printType: 'OUTER',
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
            wbzPrintCnt: 1,
            nbzPrintCnt: 0,
            btPrintCnt: 0
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
      <PageContainer title="收货外标签码">
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
    <PageContainer title="收货外标签码">
      <div className={styles.printLabel}>
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
            {/* 表格内容 */}
            <table className={styles.labelTable}>
              <thead>
                <tr>
                  <th colSpan={4} className={styles.tableTitle}>{printData.title}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.labelCell}>物料编码</td>
                  <td className={styles.valueCell} colSpan={2}>{printData.materialCode}</td>
                  <td className={styles.qrSection} rowSpan={2}>
                    <div className={styles.qrCodeContainer}>
                      <div className={styles.qrCode}>
                        <QRCode 
                          value={printData.qrCodeData}
                          size={120}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>名称型号</td>
                  <td className={`${styles.valueCell} ${styles.multiLine}`} colSpan={2}>{printData.nameModel}</td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>数量</td>
                  <td className={styles.valueCell}>{printData.qty}</td>
                  <td className={styles.labelCell}>单位</td>
                  <td className={styles.valueCell}>
                    {printData.unit}
                    {/* PCS */}
                    </td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>供货商代码</td>
                  <td className={styles.valueCell}>{printData.supplierCode}</td>
                  <td className={styles.labelCell}>送货日期</td>
                  <td className={styles.valueCell}>{printData.deliveryDate}</td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>PO/行号</td>
                  <td className={styles.valueCell}>{printData.poNumber}</td>
                  <td className={styles.labelCell}>送货单号</td>
                  <td className={styles.valueCell}></td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>批号</td>
                  <td className={styles.valueCell} colSpan={3}>
                    <div className={styles.batchWrapper}>
                      {printData.code09}
                      {/* <Barcode 
                        value={printData.batchNumber}
                        width={1.5}
                        height={30}
                        fontSize={8}
                      /> */}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>存储/清洁</td>
                  <td className={styles.valueCell} colSpan={3}>{printData.storageLocation}</td>
                </tr>
              </tbody>
            </table>
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

export default PrintLabel
