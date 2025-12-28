// 条码详情页面
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, Toast } from 'antd-mobile'
import { PageContainer, Loading } from '@/components'
import styles from './index.module.less'

interface BarcodeDetail {
  projectCode: string
  productCode: string
  productionDate: string
  productionDateEnd: string
  productionLine: string
  techVersion: string
  nameType: string
  quantity: number
  unit: string
  supplierCode: string
  factoryCode: string
  snCode: string
  code09: string
  materialCode: string
  drawingVersion: string
  attachments: number
  deliveryDate: string
}

const BarcodeDetail = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code') || ''
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<BarcodeDetail | null>(null)

  useEffect(() => {
    if (!code) return

    const loadDetail = async () => {
      setLoading(true)
      try {
        // const data = await getBarcodeDetail(code)
        // setDetail(data)
        // 使用模拟数据
        const mockDetail: BarcodeDetail = {
          projectCode: '099302937',
          productCode: '099302930001',
          productionDate: '2025-07-01',
          productionDateEnd: '2025-07-30',
          productionLine: 'H3',
          techVersion: 'V1.0',
          nameType: '系统电源-3相交流380V-无',
          quantity: 100,
          unit: 'SEC',
          supplierCode: 'BDI32421342',
          factoryCode: '167274671',
          snCode: 'S000001244001IP9302A01RG52PA01',
          code09: '099302A01RG5/A01/1124A01001',
          materialCode: '099302930001',
          drawingVersion: 'A001',
          attachments: 10,
          deliveryDate: '2025-09-01'
        }
        setDetail(mockDetail)
      } catch (error) {
        console.error('加载条码详情失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDetail()
  }, [code])

  const handlePrint = () => {
    Toast.show({ content: '开始打印...' })
    // 这里可以调用打印接口
  }

  const handleBack = () => {
    navigate('/home')
  }

  const handleAddAttachment = () => {
    Toast.show({ content: '添加附件功能开发中...' })
  }

  const handleAddPaperVersion = () => {
    Toast.show({ content: '添加图纸版本功能开发中...' })
  }

  const handleEdit = () => {
    Toast.show({ content: '编辑功能开发中...' })
  }

  const handlePrintBody = () => {
    // 跳转到打印本体码页面，传递当前条码信息
    navigate(`/print-body?code=${encodeURIComponent(code)}&from=detail`)
  }

  if (loading) {
    return <Loading loading fullscreen />
  }

  if (!detail) {
    return (
      <PageContainer title="条码详情">
        <div className={styles.error}>
          <p>未找到条码信息</p>
          <Button color="primary" onClick={handleBack}>
            返回首页
          </Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="条码详情" 
      right={
        <div className={styles.headerExtra}>
          <span className={styles.momCode}>绑定MOM出厂码</span>
          <div className={styles.expandIcon}>⛶</div>
        </div>
      }
    >
      <div className={styles.detail}>
        {/* 返回首页按钮 */}
        <div className={styles.backSection}>
          <Button 
            block 
            fill="outline" 
            color="warning"
            onClick={handleBack}
            className={styles.backBtn}
          >
            返回首页
          </Button>
        </div>

        {/* 主要信息卡片 */}
        <Card className={styles.mainCard}>
          <div className={styles.mainHeader}>
            <div className={styles.projectInfo}>
              <span className={styles.projectLabel}>项目编码：</span>
              <span className={styles.projectCode}>{detail.projectCode}</span>
            </div>
            <Button 
              color="primary" 
              size="small"
              onClick={handlePrint}
              className={styles.printBtn}
            >
              未打印
            </Button>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <span className={styles.label}>产品编码：</span>
              <span className={styles.value}>{detail.productCode}</span>
            </div>
            
            <div className={styles.infoRow}>
              <span className={styles.label}>生产日期：</span>
              <span className={styles.value}>
                {detail.productionDate} 至 {detail.productionDateEnd}
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>生产线：</span>
              <span className={styles.value}>{detail.productionLine}</span>
              <span className={styles.label}>技术版本：</span>
              <span className={styles.value}>{detail.techVersion}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>名称型号：</span>
              <span className={styles.value}>{detail.nameType}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>数量：</span>
              <span className={styles.value}>{detail.quantity}</span>
              <span className={styles.label}>单位：</span>
              <span className={styles.value}>{detail.unit}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>供货商代码：</span>
              <span className={styles.value}>{detail.supplierCode}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>出厂码：</span>
              <span className={styles.value}>{detail.factoryCode}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>SN码：</span>
              <span className={styles.value}>{detail.snCode}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>09码：</span>
              <span className={styles.value}>{detail.code09}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>物料编码：</span>
              <span className={styles.value}>{detail.materialCode}</span>
              <span className={styles.label}>图纸版本：</span>
              <span className={styles.value}>{detail.drawingVersion}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>附件：</span>
              <span className={styles.value}>{detail.attachments} 个</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>送货日期：</span>
              <span className={styles.value}>{detail.deliveryDate}</span>
            </div>
          </div>
        </Card>

        {/* 操作按钮区域 */}
        <div className={styles.actionSection}>
          <div className={styles.actionRow}>
            <Button 
              fill="outline" 
              color="primary"
              onClick={handleAddAttachment}
              className={styles.actionBtn}
            >
              添加附件
            </Button>
            <Button 
              fill="outline" 
              color="primary"
              onClick={handleAddPaperVersion}
              className={styles.actionBtn}
            >
              添加图纸版本
            </Button>
            <Button 
              fill="outline" 
              color="primary"
              onClick={handleEdit}
              className={styles.actionBtn}
            >
              编辑
            </Button>
          </div>

          <div className={styles.printSection}>
            <Button 
              block
              fill="outline" 
              color="primary"
              onClick={handlePrintBody}
              className={styles.printBodyBtn}
            >
              打印本体码
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default BarcodeDetail