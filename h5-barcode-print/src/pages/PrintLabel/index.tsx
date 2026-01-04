// 收货外标签码打印页面
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
}

const PrintLabel = () => {
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
        // 格式化日期
        const deliveryDate = detail.deliveryDate 
          ? new Date(parseInt(detail.deliveryDate)).toISOString().split('T')[0]
          : ''
        
        const mappedData: PrintData = {
          no: 'G1-1',
          size: '77mm*50mm',
          title: '供应商送货标签',
          materialCode: detail.materialCode || '',
          nameModel: detail.nameModel || '',
          qty: detail.cnt || 0,
          unit: detail.unit || 'PCS',
          supplierCode: detail.supplierCode || '',
          deliveryDate: deliveryDate,
          poNumber: detail.code09 || '', // 使用09码作为PO号
          batchNumber: detail.codeSn || '', // 使用SN码作为批号
          storageLocation: 'S50', // 固定值或从配置获取
          sn: `S${detail.codeSn || ''}IP${detail.materialCode || ''}2P${detail.technicalVersion || ''}`,
          qrCodeData: `Material:${detail.materialCode || ''};QTY:${detail.cnt || 0};Supplier:${detail.supplierCode || ''};Date:${deliveryDate}`
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
          wbzPrintCnt: 1
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
      <PageContainer title="收货外标签码">
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
            {/* 标题 */}
            <div className={styles.titleSection}>
              <h2>{printData.title}</h2>
              <div className={styles.qrCodeWrapper}>
                <QRCode 
                  value={printData.qrCodeData}
                  size={60}
                />
                <div className={styles.qrLabel}>二维码</div>
              </div>
            </div>

            {/* 表格内容 */}
            <table className={styles.labelTable}>
              <tbody>
                <tr>
                  <td className={styles.labelCell}>物料编码</td>
                  <td className={styles.valueCell} colSpan={3}>{printData.materialCode}</td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>名称型号</td>
                  <td className={styles.valueCell} colSpan={3}>{printData.nameModel}</td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>数量</td>
                  <td className={styles.valueCell}>{printData.qty}</td>
                  <td className={styles.labelCell}>单位</td>
                  <td className={styles.valueCell}>{printData.unit}</td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>供货商代码</td>
                  <td className={styles.valueCell}>{printData.supplierCode}</td>
                  <td className={styles.labelCell}>送货日期</td>
                  <td className={styles.valueCell}>{printData.deliveryDate}</td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>PO/行号</td>
                  <td className={styles.valueCell} colSpan={3}>{printData.poNumber}</td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>批号</td>
                  <td className={styles.valueCell} colSpan={3}>
                    <div className={styles.batchWrapper}>
                      <Barcode 
                        value={printData.batchNumber}
                        width={1.5}
                        height={30}
                        fontSize={8}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>存储/清洁</td>
                  <td className={styles.valueCell}>{printData.storageLocation}</td>
                  <td className={styles.labelCell} colSpan={2}></td>
                </tr>
              </tbody>
            </table>

            {/* 底部SN */}
            <div className={styles.snSection}>
              <span className={styles.snLabel}>SN:</span>
              <span className={styles.snValue}>{printData.sn}</span>
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

export default PrintLabel
