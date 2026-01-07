// 条码详情页面
import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, Toast, Picker, DatePicker, Dialog, Input, Form } from 'antd-mobile'
import type { PickerValue } from 'antd-mobile/es/components/picker'
import { PageContainer, Loading, Empty } from '@/components'
import { getBarcodeDetail, editAccessory, editDelivery, editDrawingVersion, bindFactoryCode, scanBtcode, scanNbzcode, createCode } from '@/services/barcode'
import { useUserStore } from '@/stores'
import styles from './index.module.less'

interface BarcodeDetail {
  id?: string
  productCode: string
  productName: string
  projectCode: string
  orderCode: string
  supplierCode: string
  model: string
  materialCode: string
  pohh: string
  productionDate: string
  productionDateEnd: string
  nameModel: string
  quantity: number
  unit: string
  factoryCode: string
  snCode: string
  code09: string
  deliveryDate: string
  drawingVersion: string
  attachments: number
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
  const [form] = Form.useForm()
  const { userInfo } = useUserStore()
  const isRequestingRef = useRef(false)

  useEffect(() => {
    // 防止重复请求
    if (isRequestingRef.current) return
    isRequestingRef.current = true
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
          isRequestingRef.current = false
        }
      }
      loadOuterPackageInfo()
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
          isRequestingRef.current = false
        }
      }
      loadInnerPackageInfo()
      return
    }

    // 原有的根据id加载详情逻辑
    if (!id) {
      isRequestingRef.current = false
      return
    }

    const loadDetail = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getBarcodeDetail(id)
        // 映射API返回的数据到组件需要的格式
        const mappedDetail: BarcodeDetail = {
          id: data.id,
          productCode: data.productCode || '',
          productName: data.productName || '',
          projectCode: data.projectCode || '',
          orderCode: data.orderCode || '',
          supplierCode: data.supplierCode || '',
          model: data.model || '',
          materialCode: data.materialCode || '',
          pohh: data.pohh || '',
          productionDate: data.productionDateStart ? new Date(parseInt(data.productionDateStart)).toLocaleDateString('zh-CN') : '',
          productionDateEnd: data.productionDateEnd ? new Date(parseInt(data.productionDateEnd)).toLocaleDateString('zh-CN') : '',
          nameModel: data.nameModel || '',
          quantity: data.cnt ? parseFloat(data.cnt) : 0,
          unit: data.unit || '',
          factoryCode: data.factoryCode || '',
          snCode: data.codeSn || '',
          code09: data.code09 || '',
          deliveryDate: data.deliveryDate ? new Date(parseInt(data.deliveryDate)).toLocaleDateString('zh-CN') : '',
          drawingVersion: data.drawingVersion || '',
          attachments: data.accessoryCnt || 0
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
        isRequestingRef.current = false
      }
    }

    loadDetail()
  }, [id, type, btcode, nbzcode, userInfo])

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
          id: data.id,
          productCode: data.productCode || '',
          productName: data.productName || '',
          projectCode: data.projectCode || '',
          orderCode: data.orderCode || '',
          supplierCode: data.supplierCode || '',
          model: data.model || '',
          materialCode: data.materialCode || '',
          pohh: data.pohh || '',
          productionDate: data.productionDateStart ? new Date(parseInt(data.productionDateStart)).toLocaleDateString('zh-CN') : '',
          productionDateEnd: data.productionDateEnd ? new Date(parseInt(data.productionDateEnd)).toLocaleDateString('zh-CN') : '',
          nameModel: data.nameModel || '',
          quantity: data.cnt ? parseFloat(data.cnt) : 0,
          unit: data.unit || '',
          factoryCode: data.factoryCode || '',
          snCode: data.codeSn || '',
          code09: data.code09 || '',
          deliveryDate: data.deliveryDate ? new Date(parseInt(data.deliveryDate)).toLocaleDateString('zh-CN') : '',
          drawingVersion: data.drawingVersion || '',
          attachments: data.accessoryCnt || 0
        }
        setDetail(mappedDetail)
        
        // 清除URL中的factoryCode参数，但保留type参数
        const newUrl = type ? `/barcode-detail?id=${id}&type=${type}` : `/barcode-detail?id=${id}`
        window.history.replaceState({}, '', newUrl)
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
    
    // 使用 detail.id 或 URL 参数中的 id
    const barcodeId = detail?.id || id
    
    if (!barcodeId) {
      Toast.show({
        icon: 'fail',
        content: '条码ID不存在，无法修改附件'
      })
      return
    }
    
    try {
      await editAccessory({
        accessoryCnt,
        ids: [parseInt(barcodeId)],
        operator: userInfo?.userName || 'unknown'
      })
      
      Toast.show({
        icon: 'success',
        content: '附件数量修改成功'
      })
      
      // 重新加载详情
      const data = await getBarcodeDetail(barcodeId)
      const mappedDetail: BarcodeDetail = {
        id: data.id,
        productCode: data.productCode || '',
        productName: data.productName || '',
        projectCode: data.projectCode || '',
        orderCode: data.orderCode || '',
        supplierCode: data.supplierCode || '',
        model: data.model || '',
        materialCode: data.materialCode || '',
        pohh: data.pohh || '',
        productionDate: data.productionDateStart ? new Date(parseInt(data.productionDateStart)).toLocaleDateString('zh-CN') : '',
        productionDateEnd: data.productionDateEnd ? new Date(parseInt(data.productionDateEnd)).toLocaleDateString('zh-CN') : '',
        nameModel: data.nameModel || '',
        quantity: data.cnt ? parseFloat(data.cnt) : 0,
        unit: data.unit || '',
        factoryCode: data.factoryCode || '',
        snCode: data.codeSn || '',
        code09: data.code09 || '',
        deliveryDate: data.deliveryDate ? new Date(parseInt(data.deliveryDate)).toLocaleDateString('zh-CN') : '',
        drawingVersion: data.drawingVersion || '',
        attachments: data.accessoryCnt || 0
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
    const currentVersion = detail?.drawingVersion || ''
    form.setFieldsValue({ drawingVersion: currentVersion })
    setDrawingVersionDialogVisible(true)
  }

  const handleDrawingVersionConfirm = async () => {
    try {
      // 先进行表单验证
      await form.validateFields()
      
      const values = form.getFieldsValue()
      const version = values.drawingVersion?.trim()

      // 使用 detail.id 或 URL 参数中的 id
      const barcodeId = detail?.id || id
      
      if (!barcodeId) {
        Toast.show({
          icon: 'fail',
          content: '条码ID不存在，无法修改图纸版本'
        })
        return
      }

      await editDrawingVersion({
        id: barcodeId,
        drawingVersion: version,
        operator: userInfo?.userName || 'unknown'
      })
      
      Toast.show({
        icon: 'success',
        content: '图纸版本修改成功'
      })
      
      setDrawingVersionDialogVisible(false)
      form.resetFields()
      
      // 重新加载详情
      const data = await getBarcodeDetail(barcodeId)
      const mappedDetail: BarcodeDetail = {
        id: data.id,
        productCode: data.productCode || '',
        productName: data.productName || '',
        projectCode: data.projectCode || '',
        orderCode: data.orderCode || '',
        supplierCode: data.supplierCode || '',
        model: data.model || '',
        materialCode: data.materialCode || '',
        pohh: data.pohh || '',
        productionDate: data.productionDateStart ? new Date(parseInt(data.productionDateStart)).toLocaleDateString('zh-CN') : '',
        productionDateEnd: data.productionDateEnd ? new Date(parseInt(data.productionDateEnd)).toLocaleDateString('zh-CN') : '',
        nameModel: data.nameModel || '',
        quantity: data.cnt ? parseFloat(data.cnt) : 0,
        unit: data.unit || '',
        factoryCode: data.factoryCode || '',
        snCode: data.codeSn || '',
        code09: data.code09 || '',
        deliveryDate: data.deliveryDate ? new Date(parseInt(data.deliveryDate)).toLocaleDateString('zh-CN') : '',
        drawingVersion: data.drawingVersion || '',
        attachments: data.accessoryCnt || 0
      }
      setDetail(mappedDetail)
    } catch (error: unknown) {
      // 如果是表单验证错误，不显示toast，让表单自己显示错误信息
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }
      console.error('修改图纸版本失败:', error)
      Toast.show({
        icon: 'fail',
        content: '修改图纸版本失败'
      })
    }
  }

  const handleDrawingVersionCancel = () => {
    setDrawingVersionDialogVisible(false)
    form.resetFields()
  }

  const handleDeliveryDateConfirm = async (value: Date) => {
    // 使用 detail.id 或 URL 参数中的 id
    const barcodeId = detail?.id || id
    
    if (!barcodeId) {
      Toast.show({
        icon: 'fail',
        content: '条码ID不存在，无法修改送货日期'
      })
      return
    }
    
    try {
      // 转换为ISO格式字符串
      const deliveryDate = value.toISOString()
      
      await editDelivery({
        deliveryDate,
        ids: [parseInt(barcodeId)],
        operator: userInfo?.userName || 'unknown'
      })
      
      Toast.show({
        icon: 'success',
        content: '送货日期修改成功'
      })
      
      // 重新加载详情
      const data = await getBarcodeDetail(barcodeId)
      const mappedDetail: BarcodeDetail = {
        id: data.id,
        productCode: data.productCode || '',
        productName: data.productName || '',
        projectCode: data.projectCode || '',
        orderCode: data.orderCode || '',
        supplierCode: data.supplierCode || '',
        model: data.model || '',
        materialCode: data.materialCode || '',
        pohh: data.pohh || '',
        productionDate: data.productionDateStart ? new Date(parseInt(data.productionDateStart)).toLocaleDateString('zh-CN') : '',
        productionDateEnd: data.productionDateEnd ? new Date(parseInt(data.productionDateEnd)).toLocaleDateString('zh-CN') : '',
        nameModel: data.nameModel || '',
        quantity: data.cnt ? parseFloat(data.cnt) : 0,
        unit: data.unit || '',
        factoryCode: data.factoryCode || '',
        snCode: data.codeSn || '',
        code09: data.code09 || '',
        deliveryDate: data.deliveryDate ? new Date(parseInt(data.deliveryDate)).toLocaleDateString('zh-CN') : '',
        drawingVersion: data.drawingVersion || '',
        attachments: data.accessoryCnt || 0
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
    const barcodeId = detail?.id || id
    navigate(`/barcode-edit?id=${barcodeId}`)
  }

  const handlePrintBody = async () => {
    const barcodeId = detail?.id || id
    
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
    
    try {
      // 显示加载提示
      Toast.show({
        icon: 'loading',
        content: '正在生成码...',
        duration: 0
      })
      
      // 1. 先调用生成码接口
      await createCode({
        id: barcodeId,
        operator: userInfo?.userName || 'unknown'
      })
      
      // 2. 调用详情接口获取最新数据（确保数据已更新）
      await getBarcodeDetail(barcodeId)
      
      Toast.clear()
      
      // 3. 跳转到打印本体码页面，传递当前条码ID
      navigate(`/print-body?id=${encodeURIComponent(barcodeId)}&from=detail`)
    } catch (error) {
      Toast.clear()
      console.error('生成码失败:', error)
      const err = error as { response?: { data?: { msg?: string } }; message?: string }
      const errorMsg = err?.response?.data?.msg || err?.message || '生成码失败'
      Toast.show({
        icon: 'fail',
        content: errorMsg
      })
    }
  }

  const handlePrintInner = () => {
    const barcodeId = detail?.id || id
    // 跳转到打印内包装码页面，传递当前条码ID
    navigate(`/print-inner?id=${encodeURIComponent(barcodeId)}&from=detail`)
  }

  const handlePrintLabel = () => {
    const barcodeId = detail?.id || id
    // 跳转到收货外标签码页面，传递当前条码ID
    navigate(`/print-label?id=${encodeURIComponent(barcodeId)}&from=detail`)
  }

  const handleBindMomCode = () => {
    const barcodeId = detail?.id || id
    // 跳转到扫码页面，传递当前条码ID、类型和原始type参数
    navigate(`/scan?type=mom&id=${encodeURIComponent(barcodeId)}&returnType=${encodeURIComponent(type || '')}`)
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
            {/* 产品编码 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>产品编码：</span>
              <span className={styles.value}>{detail.productCode}</span>
            </div>

            {/* 产品名称 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>产品名称：</span>
              <span className={styles.value}>{detail.productName}</span>
            </div>

            {/* 项目编码 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>项目编码：</span>
              <span className={styles.value}>{detail.projectCode}</span>
            </div>

            {/* 单据编码 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>单据编码：</span>
              <span className={styles.value}>{detail.orderCode}</span>
            </div>

            {/* 供应商代码 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>供应商代码：</span>
              <span className={styles.value}>{detail.supplierCode}</span>
            </div>

            {/* 柜号 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>柜号：</span>
              <span className={styles.value}>{detail.model}</span>
            </div>

            {/* 客户物料编码 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>客户物料编码：</span>
              <span className={styles.value}>{detail.materialCode}</span>
            </div>

            {/* po行号 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>po行号：</span>
              <span className={styles.value}>{detail.pohh}</span>
            </div>

            {/* 生产日期 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>生产日期：</span>
              <span className={styles.value}>
                {detail.productionDate}{detail.productionDateEnd ? ` 至 ${detail.productionDateEnd}` : ''}
              </span>
            </div>

            {/* 名称型号 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>名称型号：</span>
              <span className={styles.value}>{detail.nameModel}</span>
            </div>

            {/* 数量和单位 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>数量：</span>
              <span className={styles.value}>{detail.quantity}</span>
              <span className={styles.label}>单位：</span>
              <span className={styles.value}>{detail.unit}</span>
            </div>

            {/* 出厂码 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>出厂码：</span>
              <span className={styles.value}>{detail.factoryCode}</span>
            </div>

            {/* SN码 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>SN码：</span>
              <span className={styles.value}>{detail.snCode}</span>
            </div>

            {/* 09码 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>09码：</span>
              <span className={styles.value}>{detail.code09}</span>
            </div>

            {/* 送货日期 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>送货日期：</span>
              <span className={styles.value}>{detail.deliveryDate}</span>
            </div>

            {/* 图纸版本 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>图纸版本：</span>
              <span className={styles.value}>{detail.drawingVersion}</span>
            </div>

            {/* 附件 */}
            <div className={styles.infoRow}>
              <span className={styles.label}>附件：</span>
              <span className={styles.value}>{detail.attachments} 个</span>
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

          {/* 打印按钮区域 - 根据条件显示 */}
          {((!id && type === 'body') || (id && type === 'body')) && (
            <div className={styles.printSection}>
              <Button 
                block
                fill="outline" 
                color="primary"
                onClick={handlePrintBody}
                className={styles.printBodyBtn}
              >
                生成并打印本体码
              </Button>
            </div>
          )}

          {!id && type === 'inner' && (
            <div className={styles.printSection}>
              <Button 
                block
                fill="outline" 
                color="primary"
                onClick={handlePrintInner}
                className={styles.printInnerBtn}
              >
                打印内包装码
              </Button>
            </div>
          )}

          {!id && type === 'label' && (
            <div className={styles.printSection}>
              <Button 
                block
                fill="outline" 
                color="primary"
                onClick={handlePrintLabel}
                className={styles.printLabelBtn}
              >
                收货外标签码
              </Button>
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
            <Form
              form={form}
              layout="vertical"
              footer={null}
            >
              <Form.Item
                name="drawingVersion"
                label="图纸版本"
                rules={[
                  { 
                    validator: (_, value) => {
                      if (!value || value.trim().length === 0) {
                        return Promise.reject(new Error('请输入图纸版本'))
                      }
                      if (value.trim().length !== 3) {
                        return Promise.reject(new Error('图纸版本必须是3位字符'))
                      }
                      return Promise.resolve()
                    }
                  }
                ]}
              >
                <Input
                  placeholder="请输入3位图纸版本"
                  maxLength={3}
                  style={{ 
                    '--font-size': '16px',
                    '--text-align': 'left'
                  }}
                />
              </Form.Item>
            </Form>
          </div>
        }
        closeOnAction={false}
        onClose={handleDrawingVersionCancel}
        actions={[
          [
            {
              key: 'cancel',
              text: '取消',
              onClick: handleDrawingVersionCancel
            },
            {
              key: 'confirm',
              text: '确定',
              bold: true,
              onClick: handleDrawingVersionConfirm
            }
          ]
        ]}
      />
    </PageContainer>
  )
}

export default BarcodeDetail