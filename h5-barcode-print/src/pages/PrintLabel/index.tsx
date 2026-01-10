// 收货外标签码打印页面
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Toast, ErrorBlock } from 'antd-mobile'
import { PageContainer, QRCode, Barcode, Loading } from '@/components'
import { scanNbzcode, updatePrintStatus } from '@/services/barcode'
import { useUserStore } from '@/stores'
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
    if (nbzcode) {
      loadPrintData()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nbzcode])

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
          wbzPrintCnt: 1,
          nbzPrintCnt: 0,
          btPrintCnt: 0,
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
                    {/* {printData.unit} */}
                    PCS</td>
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
    </PageContainer>
  )
}

export default PrintLabel
