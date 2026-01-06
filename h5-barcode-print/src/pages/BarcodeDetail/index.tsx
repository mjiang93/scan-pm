// 条码详情页面
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, Toast, Picker, DatePicker, Dialog, Input } from 'antd-mobile'
import type { PickerValue } from 'antd-mobile/es/components/picker'
import { PageContainer, Loading, Empty } from '@/components'
import { getBarcodeDetail, editAccessory, editDelivery, editDrawingVersion, bindFactoryCode, scanBtcode, scanProjectCode, scanNbzcode } from '@/services/barcode'
import { useUserStore } from '@/stores'
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

interface InnerPackageInfo {
  id: string
  partNo: string
  supplierCode: string
  codeSN: string
  dcDate: string
  qty: string
  remark: string
}

interface OuterPackageInfo {
  id: string
  materialCode: string
  nameModel: string
  supplierCode: string
  unit: string
  cnt: number
  codeSN: string
  deliveryDate: string
  deliveryNo: string
  poNo: string
  saveClean: string
}

const BarcodeDetail = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id') || ''
  const btcode = searchParams.get('btcode') || ''
  const projectCode = searchParams.get('projectCode') || ''
  const nbzcode = searchParams.get('nbzcode') || ''
  const type = searchParams.get('type') || ''
  const factoryCodeFromScan = searchParams.get('factoryCode') || ''
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<BarcodeDetail | null>(null)
  const [innerPackageInfo, setInnerPackageInfo] = useState<InnerPackageInfo | null>(null)
  const [outerPackageInfo, setOuterPackageInfo] = useState<OuterPackageInfo | null>(null)
  const [error, setError] = useState<string>('')
  const [attachmentPickerVisible, setAttachmentPickerVisible] = useState(false)
  const [deliveryDatePickerVisible, setDeliveryDatePickerVisible] = useState(false)
  const [drawingVersionDialogVisible, setDrawingVersionDialogVisible] = useState(false)
  const [drawingVersionInput, setDrawingVersionInput] = useState('')
  const { userInfo } = useUserStore()

  useEffect(() => {
    // 如果是扫内包生成外装（type=label），调用scannbzcode接口
    if (type === 'label' && nbzcode) {
      const loadOuterPackageInfo = async () => {
        setLoading(true)
        setError('')
        try {
          const data = await scanNbzcode(nbzcode)
          setOuterPackageInfo(data)
        } catch (error: unknown) {
          console.error('加载外包装码信息失败:', error)
          const err = error as { response?: { data?: { msg?: string } }; message?: string }
          const errorMsg = err?.response?.data?.msg || err?.message || '该二维码或条码非法，无法识别'
          setError(errorMsg)
          Toast.show({
            icon: 'fail',
            content: errorMsg
          })
        } finally {
          setLoading(false)
        }
      }
      loadOuterPackageInfo()
      return
    }

    // 如果是扫码生成SN码（type=body），调用scanpcode接口
    if (type === 'body' && projectCode && userInfo) {
      const loadProjectCodeInfo = async () => {
        setLoading(true)
        setError('')
        try {
          const data = await scanProjectCode({
            projectCode,
            operator: userInfo.userName || 'unknown'
          })
          
          // 映射API返回的数据到组件需要的格式
          const mappedDetail: BarcodeDetail = {
            projectCode: data.projectCode || '',
            productCode: data.materialCode || '',
            productionDate: data.productionDateStart ? new Date(parseInt(data.productionDateStart)).toLocaleDateString('zh-CN') : '',
            productionDateEnd: data.productionDateEnd ? new Date(parseInt(data.productionDateEnd)).toLocaleDateString('zh-CN') : '',
            productionLine: data.lineName || '',
            techVersion: data.technicalVersion || '',
            nameType: data.nameModel || '',
            quantity: data.cnt || 0,
            unit: data.unit || '',
            supplierCode: data.supplierCode || '',
            factoryCode: data.factoryCode || '',
            snCode: data.codeSn || '',
            code09: data.code09 || '',
            materialCode: data.materialCode || '',
            drawingVersion: data.drawingVersion || '',
            attachments: data.accessoryCnt || 0,
            deliveryDate: data.deliveryDate ? new Date(parseInt(data.deliveryDate)).toLocaleDateString('zh-CN') : ''
          }
          setDetail(mappedDetail)
          
          Toast.show({
            icon: 'success',
            content: 'SN码生成成功'
          })
        } catch (error: unknown) {
          console.error('生成SN码失败:', error)
          const err = error as { response?: { data?: { msg?: string } }; message?: string }
          const errorMsg = err?.response?.data?.msg || err?.message || '生成SN码失败'
          setError(errorMsg)
          Toast.show({
            icon: 'fail',
            content: errorMsg
          })
        } finally {
          setLoading(false)
        }
      }
      loadProjectCodeInfo()
      return
    }

    // 如果是扫SN打印内包装（type=inner），调用scanbtcode接口
    if (type === 'inner' && btcode) {
      const loadInnerPackageInfo = async () => {
        setLoading(true)
        setError('')
        try {
          const data = await scanBtcode(btcode)
          setInnerPackageInfo(data)
        } catch (error: unknown) {
          console.error('加载内包装码信息失败:', error)
          const err = error as { response?: { data?: { msg?: string } }; message?: string }
          const errorMsg = err?.response?.data?.msg || err?.message || '该二维码或条码非法，无法识别'
          setError(errorMsg)
          Toast.show({
            icon: 'fail',
            content: errorMsg
          })
        } finally {
          setLoading(false)
        }
      }
      loadInnerPackageInfo()
      return
    }

    // 原有的根据id加载详情逻辑
    if (!id) return

    const loadDetail = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getBarcodeDetail(id)
        // 映射API返回的数据到组件需要的格式
        const mappedDetail: BarcodeDetail = {
          projectCode: data.projectCode || '',
          productCode: data.materialCode || '',
          productionDate: data.productionDateStart ? new Date(parseInt(data.productionDateStart)).toLocaleDateString('zh-CN') : '',
          productionDateEnd: data.productionDateEnd ? new Date(parseInt(data.productionDateEnd)).toLocaleDateString('zh-CN') : '',
          productionLine: data.lineName || '',
          techVersion: data.technicalVersion || '',
          nameType: data.nameModel || '',
          quantity: data.cnt || 0,
          unit: data.unit || '',
          supplierCode: data.supplierCode || '',
          factoryCode: data.factoryCode || '',
          snCode: data.codeSn || '',
          code09: data.code09 || '',
          materialCode: data.materialCode || '',
          drawingVersion: data.drawingVersion || '',
          attachments: data.accessoryCnt || 0,
          deliveryDate: data.deliveryDate ? new Date(parseInt(data.deliveryDate)).toLocaleDateString('zh-CN') : ''
        }
        setDetail(mappedDetail)
      } catch (error: unknown) {
        console.error('加载条码详情失败:', error)
        const err = error as { response?: { data?: { msg?: string } }; message?: string }
        const errorMsg = err?.response?.data?.msg || err?.message || '加载详情失败'
        setError(errorMsg)
        Toast.show({
          icon: 'fail',
          content: errorMsg
        })
      } finally {
        setLoading(false)
      }
    }

    loadDetail()
  }, [id, type, btcode, projectCode, nbzcode, userInfo])

  // 处理从扫码页面返回的出厂码绑定
  useEffect(() => {
    if (!factoryCodeFromScan || !id || !userInfo) return

    let isMounted = true
    
    const handleBindFactoryCode = async () => {
      try {
        await bindFactoryCode({
          id,
          factoryCode: factoryCodeFromScan,
          operator: userInfo.userName || 'unknown'
        })
        
        if (!isMounted) return
        
        Toast.show({
          icon: 'success',
          content: '绑定MOM出厂码成功'
        })
        
        // 重新加载详情以显示最新的出厂码
        const data = await getBarcodeDetail(id)
        
        if (!isMounted) return
        
        const mappedDetail: BarcodeDetail = {
          projectCode: data.projectCode || '',
          productCode: data.materialCode || '',
          productionDate: data.productionDateStart ? new Date(parseInt(data.productionDateStart)).toLocaleDateString('zh-CN') : '',
          productionDateEnd: data.productionDateEnd ? new Date(parseInt(data.productionDateEnd)).toLocaleDateString('zh-CN') : '',
          productionLine: data.lineName || '',
          techVersion: data.technicalVersion || '',
          nameType: data.nameModel || '',
          quantity: data.cnt || 0,
          unit: data.unit || '',
          supplierCode: data.supplierCode || '',
          factoryCode: data.factoryCode || '',
          snCode: data.codeSn || '',
          code09: data.code09 || '',
          materialCode: data.materialCode || '',
          drawingVersion: data.drawingVersion || '',
          attachments: data.accessoryCnt || 0,
          deliveryDate: data.deliveryDate ? new Date(parseInt(data.deliveryDate)).toLocaleDateString('zh-CN') : ''
        }
        setDetail(mappedDetail)
        
        // 清除URL中的factoryCode参数
        window.history.replaceState({}, '', `/barcode-detail?id=${id}`)
      } catch (error) {
        if (!isMounted) return
        
        console.error('绑定MOM出厂码失败:', error)
        Toast.show({
          icon: 'fail',
          content: '绑定MOM出厂码失败'
        })
      }
    }

    handleBindFactoryCode()
    
    return () => {
      isMounted = false
    }
  }, [factoryCodeFromScan, id, userInfo])

  const handlePrint = () => {
    Toast.show({ content: '开始打印...' })
    // 这里可以调用打印接口
  }

  const handleBack = () => {
    navigate('/home')
  }

  const handleNavBack = () => {
    // 导航栏返回按钮：返回上一页，如果没有历史记录则返回首页
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/home')
    }
  }

  const handleAddAttachment = () => {
    setAttachmentPickerVisible(true)
  }

  const handleAttachmentConfirm = async (value: PickerValue[]) => {
    if (!value || value.length === 0 || value[0] === null) {
      return
    }

    const accessoryCnt = typeof value[0] === 'string' ? parseInt(value[0]) : value[0]
    
    try {
      await editAccessory({
        accessoryCnt,
        ids: [parseInt(id)],
        operator: userInfo?.userName || 'unknown'
      })
      
      Toast.show({
        icon: 'success',
        content: '附件数量修改成功'
      })
      
      // 重新加载详情
      const data = await getBarcodeDetail(id)
      const mappedDetail: BarcodeDetail = {
        projectCode: data.projectCode || '',
        productCode: data.materialCode || '',
        productionDate: data.productionDateStart ? new Date(parseInt(data.productionDateStart)).toLocaleDateString('zh-CN') : '',
        productionDateEnd: data.productionDateEnd ? new Date(parseInt(data.productionDateEnd)).toLocaleDateString('zh-CN') : '',
        productionLine: data.lineName || '',
        techVersion: data.technicalVersion || '',
        nameType: data.nameModel || '',
        quantity: data.cnt || 0,
        unit: data.unit || '',
        supplierCode: data.supplierCode || '',
        factoryCode: data.factoryCode || '',
        snCode: data.codeSn || '',
        code09: data.code09 || '',
        materialCode: data.materialCode || '',
        drawingVersion: data.drawingVersion || '',
        attachments: data.accessoryCnt || 0,
        deliveryDate: data.deliveryDate ? new Date(parseInt(data.deliveryDate)).toLocaleDateString('zh-CN') : ''
      }
      setDetail(mappedDetail)
    } catch (error) {
      console.error('修改附件数量失败:', error)
      Toast.show({
        icon: 'fail',
        content: '修改附件数量失败'
      })
    }
  }

  const handleAddPaperVersion = () => {
    setDrawingVersionInput(detail?.drawingVersion || '')
    setDrawingVersionDialogVisible(true)
  }

  const handleDrawingVersionConfirm = async () => {
    if (!drawingVersionInput.trim()) {
      Toast.show({
        icon: 'fail',
        content: '请输入图纸版本'
      })
      return
    }

    try {
      await editDrawingVersion({
        id,
        drawingVersion: drawingVersionInput,
        operator: userInfo?.userName || 'unknown'
      })
      
      Toast.show({
        icon: 'success',
        content: '图纸版本修改成功'
      })
      
      setDrawingVersionDialogVisible(false)
      
      // 重新加载详情
      const data = await getBarcodeDetail(id)
      const mappedDetail: BarcodeDetail = {
        projectCode: data.projectCode || '',
        productCode: data.materialCode || '',
        productionDate: data.productionDateStart ? new Date(parseInt(data.productionDateStart)).toLocaleDateString('zh-CN') : '',
        productionDateEnd: data.productionDateEnd ? new Date(parseInt(data.productionDateEnd)).toLocaleDateString('zh-CN') : '',
        productionLine: data.lineName || '',
        techVersion: data.technicalVersion || '',
        nameType: data.nameModel || '',
        quantity: data.cnt || 0,
        unit: data.unit || '',
        supplierCode: data.supplierCode || '',
        factoryCode: data.factoryCode || '',
        snCode: data.codeSn || '',
        code09: data.code09 || '',
        materialCode: data.materialCode || '',
        drawingVersion: data.drawingVersion || '',
        attachments: data.accessoryCnt || 0,
        deliveryDate: data.deliveryDate ? new Date(parseInt(data.deliveryDate)).toLocaleDateString('zh-CN') : ''
      }
      setDetail(mappedDetail)
    } catch (error) {
      console.error('修改图纸版本失败:', error)
      Toast.show({
        icon: 'fail',
        content: '修改图纸版本失败'
      })
    }
  }

  const handleEditDeliveryDate = () => {
    setDeliveryDatePickerVisible(true)
  }

  const handleDeliveryDateConfirm = async (value: Date) => {
    try {
      // 转换为ISO格式字符串
      const deliveryDate = value.toISOString()
      
      await editDelivery({
        deliveryDate,
        ids: [parseInt(id)],
        operator: userInfo?.userName || 'unknown'
      })
      
      Toast.show({
        icon: 'success',
        content: '送货日期修改成功'
      })
      
      // 重新加载详情
      const data = await getBarcodeDetail(id)
      const mappedDetail: BarcodeDetail = {
        projectCode: data.projectCode || '',
        productCode: data.materialCode || '',
        productionDate: data.productionDateStart ? new Date(parseInt(data.productionDateStart)).toLocaleDateString('zh-CN') : '',
        productionDateEnd: data.productionDateEnd ? new Date(parseInt(data.productionDateEnd)).toLocaleDateString('zh-CN') : '',
        productionLine: data.lineName || '',
        techVersion: data.technicalVersion || '',
        nameType: data.nameModel || '',
        quantity: data.cnt || 0,
        unit: data.unit || '',
        supplierCode: data.supplierCode || '',
        factoryCode: data.factoryCode || '',
        snCode: data.codeSn || '',
        code09: data.code09 || '',
        materialCode: data.materialCode || '',
        drawingVersion: data.drawingVersion || '',
        attachments: data.accessoryCnt || 0,
        deliveryDate: data.deliveryDate ? new Date(parseInt(data.deliveryDate)).toLocaleDateString('zh-CN') : ''
      }
      setDetail(mappedDetail)
    } catch (error) {
      console.error('修改送货日期失败:', error)
      Toast.show({
        icon: 'fail',
        content: '修改送货日期失败'
      })
    }
  }

  const handleEdit = () => {
    navigate(`/barcode-edit?id=${id}`)
  }

  const handlePrintBody = () => {
    // 验证必填字段：图纸版本、附件、出厂码
    if (!detail?.drawingVersion || !detail?.drawingVersion.trim()) {
      Toast.show({
        icon: 'fail',
        content: '请先添加图纸版本'
      })
      return
    }
    
    if (!detail?.attachments || detail.attachments === 0) {
      Toast.show({
        icon: 'fail',
        content: '请先添加附件数量'
      })
      return
    }
    
    if (!detail?.factoryCode || !detail?.factoryCode.trim()) {
      Toast.show({
        icon: 'fail',
        content: '请先绑定出厂码'
      })
      return
    }
    
    // 跳转到打印本体码页面，传递当前条码ID
    navigate(`/print-body?id=${encodeURIComponent(id)}&from=detail`)
  }

  const handlePrintInner = () => {
    // 跳转到打印内包装码页面，传递当前条码ID
    navigate(`/print-inner?id=${encodeURIComponent(id)}&from=detail`)
  }

  const handlePrintLabel = () => {
    // 跳转到收货外标签码页面，传递当前条码ID
    navigate(`/print-label?id=${encodeURIComponent(id)}&from=detail`)
  }

  const handleBindMomCode = () => {
    // 跳转到扫码页面，传递当前条码ID和类型
    navigate(`/scan?type=mom&id=${encodeURIComponent(id)}`)
  }

  // 创建右侧按钮元素
  const renderRightButton = () => (
    <span 
      onClick={(e) => {
        e.stopPropagation()
        handleBindMomCode()
      }}
      style={{ 
        color: '#1677ff', 
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      绑定MOM出厂码
      <span style={{ fontSize: '16px', color: '#666' }}>⛶</span>
    </span>
  )

  if (loading) {
    return <Loading loading fullscreen />
  }

  // 如果有错误，显示错误页面
  if (error) {
    const pageTitle = type === 'inner' ? '内包装码打印信息' : type === 'body' ? '生成SN码' : type === 'label' ? '外包装码打印信息' : '条码详情'
    return (
      <PageContainer title={pageTitle} onBack={handleNavBack}>
        <div className={styles.detail}>
          <Empty description={error}>
            <Button 
              color="primary" 
              onClick={handleBack}
            >
              返回首页
            </Button>
          </Empty>
        </div>
      </PageContainer>
    )
  }

  // 如果是外包装码信息展示
  if (type === 'label' && outerPackageInfo) {
    return (
      <PageContainer title="外包装码打印信息" onBack={handleNavBack}>
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

          {/* 外包装码信息卡片 */}
          <Card className={styles.mainCard}>
            <div className={styles.mainHeader}>
              <div className={styles.projectInfo}>
                <span className={styles.projectLabel}>外包装码打印信息</span>
              </div>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.label}>物料编码：</span>
                <span className={styles.value}>{outerPackageInfo.materialCode}</span>
              </div>
              
              <div className={styles.infoRow}>
                <span className={styles.label}>名称型号：</span>
                <span className={styles.value}>{outerPackageInfo.nameModel}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>供货商代码：</span>
                <span className={styles.value}>{outerPackageInfo.supplierCode}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>单位：</span>
                <span className={styles.value}>{outerPackageInfo.unit}</span>
                <span className={styles.label}>数量：</span>
                <span className={styles.value}>{outerPackageInfo.cnt}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>SN码：</span>
                <span className={styles.value}>{outerPackageInfo.codeSN}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>送货日期：</span>
                <span className={styles.value}>{outerPackageInfo.deliveryDate}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>送货单号：</span>
                <span className={styles.value}>{outerPackageInfo.deliveryNo}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>PO行号：</span>
                <span className={styles.value}>{outerPackageInfo.poNo}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>存储清洁：</span>
                <span className={styles.value}>{outerPackageInfo.saveClean}</span>
              </div>
            </div>
          </Card>

          {/* 打印按钮 */}
          <div className={styles.actionSection}>
            <div className={styles.printSection}>
              <Button 
                block
                color="primary"
                onClick={() => {
                  // 跳转到打印外标签页面
                  navigate(`/print-label?id=${encodeURIComponent(outerPackageInfo.id)}&from=scan`)
                }}
                className={styles.printLabelBtn}
              >
                打印收货外标签码
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    )
  }

  // 如果是内包装码信息展示
  if (type === 'inner' && innerPackageInfo) {
    return (
      <PageContainer title="内包装码打印信息" onBack={handleNavBack}>
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

          {/* 内包装码信息卡片 */}
          <Card className={styles.mainCard}>
            <div className={styles.mainHeader}>
              <div className={styles.projectInfo}>
                <span className={styles.projectLabel}>内包装码打印信息</span>
              </div>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.label}>客户物料编号：</span>
                <span className={styles.value}>{innerPackageInfo.partNo}</span>
              </div>
              
              <div className={styles.infoRow}>
                <span className={styles.label}>供货商代码：</span>
                <span className={styles.value}>{innerPackageInfo.supplierCode}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>SN码：</span>
                <span className={styles.value}>{innerPackageInfo.codeSN}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>生产日期：</span>
                <span className={styles.value}>{innerPackageInfo.dcDate}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>数量：</span>
                <span className={styles.value}>{innerPackageInfo.qty}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>描述：</span>
                <span className={styles.value}>{innerPackageInfo.remark}</span>
              </div>
            </div>
          </Card>

          {/* 打印按钮 */}
          <div className={styles.actionSection}>
            <div className={styles.printSection}>
              <Button 
                block
                color="primary"
                onClick={() => {
                  // 跳转到打印内包装页面
                  navigate(`/print-inner?id=${encodeURIComponent(innerPackageInfo.id)}&from=scan`)
                }}
                className={styles.printInnerBtn}
              >
                打印内包装码
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (!detail) {
    return (
      <PageContainer title="条码详情" onBack={handleNavBack}>
        <div className={styles.detail}>
          <Empty description="未找到条码信息">
            <Button color="primary" onClick={handleBack}>
              返回首页
            </Button>
          </Empty>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title={`条码详情`} 
      right={renderRightButton()}
      onBack={handleNavBack}
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
            {/* <Button 
              fill="outline" 
              color="primary"
              onClick={handleEditDeliveryDate}
              className={styles.actionBtn}
            >
              修改送货日期
            </Button> */}
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

          {!id && (
            <div className={styles.printSection}>
              {type === 'body' && (
                <Button 
                  block
                  fill="outline" 
                  color="primary"
                  onClick={handlePrintBody}
                  className={styles.printBodyBtn}
                >
                  打印本体码
                </Button>
              )}
              {type === 'inner' && (
                <Button 
                  block
                  fill="outline" 
                  color="primary"
                  onClick={handlePrintInner}
                  className={styles.printInnerBtn}
                >
                  打印内包装码
                </Button>
              )}
              {type === 'label' && (
                <Button 
                  block
                  fill="outline" 
                  color="primary"
                  onClick={handlePrintLabel}
                  className={styles.printLabelBtn}
                >
                  收货外标签码
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 附件数量选择器 */}
      <Picker
        columns={[
          Array.from({ length: 20 }, (_, i) => ({
            label: `${i}`,
            value: `${i}`
          }))
        ]}
        visible={attachmentPickerVisible}
        onClose={() => setAttachmentPickerVisible(false)}
        onConfirm={handleAttachmentConfirm}
        confirmText="确定"
        cancelText="取消"
      />

      {/* 送货日期选择器 */}
      <DatePicker
        visible={deliveryDatePickerVisible}
        onClose={() => setDeliveryDatePickerVisible(false)}
        onConfirm={handleDeliveryDateConfirm}
        confirmText="确定"
        cancelText="取消"
        title="修改送货日期"
      />

      {/* 图纸版本输入对话框 */}
      <Dialog
        visible={drawingVersionDialogVisible}
        title="修改图纸版本"
        content={
          <div style={{ padding: '12px 0' }}>
            <div style={{ marginBottom: '8px', color: '#666' }}>图纸版本</div>
            <Input
              placeholder="请输入图纸版本"
              value={drawingVersionInput}
              onChange={setDrawingVersionInput}
              style={{ 
                '--font-size': '16px',
                '--text-align': 'left'
              }}
            />
          </div>
        }
        closeOnAction
        onClose={() => setDrawingVersionDialogVisible(false)}
        actions={[
          {
            key: 'cancel',
            text: '取消',
            onClick: () => setDrawingVersionDialogVisible(false)
          },
          {
            key: 'confirm',
            text: '确定',
            bold: true,
            onClick: handleDrawingVersionConfirm
          }
        ]}
      />
    </PageContainer>
  )
}

export default BarcodeDetail