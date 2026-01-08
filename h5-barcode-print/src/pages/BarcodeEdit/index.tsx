// 条码编辑页面
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Form, Input, DatePicker, Toast } from 'antd-mobile'
import { PageContainer, Loading } from '@/components'
import { getBarcodeDetail, updateBarcode } from '@/services/barcode'
import { useUserStore } from '@/stores'
import styles from './index.module.less'

// 格式化时间戳为 YYYY-MM-DD
const formatTimestampToDate = (timestamp: string | number | null | undefined): string => {
  if (!timestamp) return ''
  try {
    const d = new Date(parseInt(String(timestamp)))
    if (isNaN(d.getTime())) return ''
    
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('日期格式化错误:', error)
    return ''
  }
}

// 解析 YYYY-MM-DD 格式为 Date 对象
const parseDateString = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null
  try {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  } catch (error) {
    console.error('日期解析错误:', error)
    return null
  }
}

const BarcodeEdit = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id') || ''
  const { userInfo } = useUserStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [originalData, setOriginalData] = useState<Record<string, unknown> | null>(null)
  const [form] = Form.useForm()
  
  // 日期选择器的可见状态
  const [productionStartVisible, setProductionStartVisible] = useState(false)
  const [productionEndVisible, setProductionEndVisible] = useState(false)
  const [deliveryDateVisible, setDeliveryDateVisible] = useState(false)

  useEffect(() => {
    if (!id) {
      Toast.show({
        icon: 'fail',
        content: '缺少ID参数'
      })
      navigate(-1)
      return
    }

    const loadDetail = async () => {
      setLoading(true)
      try {
        const data = await getBarcodeDetail(id)
        
        // 保存原始数据用于提交
        setOriginalData(data)
        
        // 设置表单初始值 - 日期直接转换为 YYYY-MM-DD 格式字符串
        form.setFieldsValue({
          productCode: data.productCode || '',
          productName: data.productName || '',
          projectCode: data.projectCode || '',
          orderCode: data.orderCode || '',
          supplierCode: data.supplierCode || '',
          model: data.model || '',
          materialCode: data.materialCode || '',
          pohh: data.pohh || '',
          productionDateStart: formatTimestampToDate(data.productionDateStart),
          productionDateEnd: formatTimestampToDate(data.productionDateEnd),
          nameModel: data.nameModel || '',
          cnt: data.cnt || '',
          unit: data.unit || '',
          factoryCode: data.factoryCode || '',
          codeSn: data.codeSn || '',
          code09: data.code09 || '',
          deliveryDate: formatTimestampToDate(data.deliveryDate),
          drawingVersion: data.drawingVersion || '',
          accessoryCnt: data.accessoryCnt || ''
        })
      } catch (error) {
        console.error('加载条码详情失败:', error)
        Toast.show({
          icon: 'fail',
          content: '加载详情失败'
        })
      } finally {
        setLoading(false)
      }
    }

    loadDetail()
  }, [id, form, navigate])

  const handleSave = async () => {
    if (saving) return
    
    try {
      setSaving(true)
      const values = await form.validateFields()
      
      // 将日期字符串转换为时间戳字符串
      const productionStartTimestamp = values.productionDateStart 
        ? String(parseDateString(values.productionDateStart)?.getTime() || '')
        : ''
      const productionEndTimestamp = values.productionDateEnd 
        ? String(parseDateString(values.productionDateEnd)?.getTime() || '')
        : ''
      const deliveryDateTimestamp = values.deliveryDate 
        ? String(parseDateString(values.deliveryDate)?.getTime() || '')
        : ''
      
      // 只传递接口需要的字段
      const updateData = {
        id: parseInt(id),
        productCode: values.productCode,
        productName: values.productName || '',
        projectCode: values.projectCode,
        orderCode: values.orderCode,
        supplierCode: values.supplierCode,
        model: values.model || '',
        materialCode: values.materialCode,
        pohh: values.pohh || '',
        productionDateStart: productionStartTimestamp,
        productionDateEnd: productionEndTimestamp,
        nameModel: values.nameModel,
        cnt: parseFloat(values.cnt) || 0,
        unit: values.unit,
        factoryCode: values.factoryCode || '',
        codeSn: values.codeSn || '',
        code09: values.code09 || '',
        deliveryDate: deliveryDateTimestamp,
        drawingVersion: values.drawingVersion || '',
        accessoryCnt: parseInt(values.accessoryCnt) || 0,
        printStatus: (originalData?.printStatus as number) || 0,
        btPrintCnt: (originalData?.btPrintCnt as number) || 0,
        nbzPrintCnt: (originalData?.nbzPrintCnt as number) || 0,
        wbzPrintCnt: (originalData?.wbzPrintCnt as number) || 0,
        operator: userInfo?.userName || 'unknown'
      }
      
      console.log('保存数据:', updateData)
      
      await updateBarcode(updateData)
      
      Toast.show({
        icon: 'success',
        content: '保存成功'
      })
      
      // 返回详情页
      setTimeout(() => {
        navigate(-1)
      }, 500)
    } catch (error) {
      console.error('保存失败:', error)
      Toast.show({
        icon: 'fail',
        content: '保存失败，请检查输入'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading loading fullscreen />
  }

  return (
    <PageContainer title="条码详情-编辑" showBack>
      <div className={styles.container}>
        <Form
          form={form}
          layout="horizontal"
          mode="card"
          className={styles.form}
          footer={
            <Button
              block
              type="submit"
              color="primary"
              size="large"
              onClick={handleSave}
              loading={saving}
              disabled={saving}
            >
              保存
            </Button>
          }
        >
          <Form.Header>基本信息</Form.Header>
          
          {/* 产品编码 - 必填，禁用 */}
          <Form.Item
            name="productCode"
            label="产品编码"
            rules={[{ required: true, message: '请输入产品编码' }]}
          >
            <Input placeholder="请输入产品编码" readOnly disabled />
          </Form.Item>

          {/* 产品名称 - 非必填 */}
          <Form.Item
            name="productName"
            label="产品名称"
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>

          {/* 项目编码 - 必填 */}
          <Form.Item
            name="projectCode"
            label="项目编码"
            rules={[{ required: true, message: '请输入项目编码' }]}
          >
            <Input placeholder="请输入项目编码" />
          </Form.Item>

          {/* 单据编码 - 必填 */}
          <Form.Item
            name="orderCode"
            label="单据编码"
            rules={[{ required: true, message: '请输入单据编码' }]}
          >
            <Input placeholder="请输入单据编码" />
          </Form.Item>

          {/* 供应商代码 - 必填 */}
          <Form.Item
            name="supplierCode"
            label="供应商代码"
            rules={[{ required: true, message: '请输入供应商代码' }]}
          >
            <Input placeholder="请输入供应商代码" />
          </Form.Item>

          {/* 柜号 - 非必填 */}
          <Form.Item
            name="model"
            label="柜号"
          >
            <Input placeholder="本体model" />
          </Form.Item>

          {/* 客户物料编码 - 必填 */}
          <Form.Item
            name="materialCode"
            label="客户物料编码"
            rules={[
              { required: true, message: '请输入客户物料编码' },
              { min: 8, message: '客户物料编码至少8位' },
              { max: 17, message: '客户物料编码最多17位' }
            ]}
          >
            <Input placeholder="PartNumber" maxLength={17} />
          </Form.Item>

          {/* po行号 - 非必填 */}
          <Form.Item
            name="pohh"
            label="po行号"
          >
            <Input placeholder="请输入po行号" />
          </Form.Item>

          {/* 生产开始日期 - 必填 */}
          <Form.Item
            name="productionDateStart"
            label="生产开始日期"
            rules={[{ required: true, message: '请选择生产开始日期' }]}
            onClick={() => setProductionStartVisible(true)}
          >
            <Input
              placeholder="请选择生产开始日期"
              readOnly
            />
          </Form.Item>

          {/* 生产结束日期 - 非必填 */}
          <Form.Item
            name="productionDateEnd"
            label="生产结束日期"
            onClick={() => setProductionEndVisible(true)}
          >
            <Input
              placeholder="请选择生产结束日期"
              readOnly
            />
          </Form.Item>

          {/* 名称型号 - 必填 */}
          <Form.Item
            name="nameModel"
            label="名称型号"
            rules={[{ required: true, message: '请输入名称型号' }]}
          >
            <Input placeholder="请输入名称型号" />
          </Form.Item>

          {/* 数量 - 必填 */}
          <Form.Item
            name="cnt"
            label="数量"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <Input placeholder="请输入数量" type="number" />
          </Form.Item>

          {/* 单位 - 必填 */}
          <Form.Item
            name="unit"
            label="单位"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Input placeholder="请输入单位" />
          </Form.Item>

          {/* 出厂码 - 非必填 */}
          <Form.Item
            name="factoryCode"
            label="出厂码"
          >
            <Input placeholder="请输入出厂码" />
          </Form.Item>

          {/* SN码 - 非必填 */}
          <Form.Item
            name="codeSn"
            label="SN码"
          >
            <Input placeholder="请输入SN码" />
          </Form.Item>

          {/* 09码 - 非必填 */}
          <Form.Item
            name="code09"
            label="09码"
          >
            <Input placeholder="请输入09码" />
          </Form.Item>

          {/* 送货日期 - 非必填 */}
          <Form.Item
            name="deliveryDate"
            label="送货日期"
            onClick={() => setDeliveryDateVisible(true)}
          >
            <Input
              placeholder="请选择送货日期"
              readOnly
            />
          </Form.Item>

          {/* 图纸版本 - 非必填，限制3位字符 */}
          <Form.Item
            name="drawingVersion"
            label="图纸版本"
            rules={[{ len: 3, message: '图纸版本必须是3位字符' }]}
          >
            <Input placeholder="请输入3位字符" maxLength={3} />
          </Form.Item>

          {/* 附件数量 - 非必填 */}
          <Form.Item
            name="accessoryCnt"
            label="附件"
          >
            <Input placeholder="请输入附件数量（个）" type="number" />
          </Form.Item>
        </Form>
      </div>

      {/* 生产开始日期选择器 */}
      <DatePicker
        visible={productionStartVisible}
        onClose={() => setProductionStartVisible(false)}
        precision="day"
        value={parseDateString(form.getFieldValue('productionDateStart'))}
        onConfirm={(value) => {
          form.setFieldValue('productionDateStart', formatTimestampToDate(value.getTime()))
          setProductionStartVisible(false)
        }}
        title="选择生产开始日期"
        min={new Date(new Date().getFullYear() - 100, 0, 1)}
        max={new Date(new Date().getFullYear() + 100, 11, 31)}
        renderLabel={(type, data) => {
          if (type === 'year') return data + '年'
          if (type === 'month') return data + '月'
          if (type === 'day') return data + '日'
          return data
        }}
      />

      {/* 生产结束日期选择器 */}
      <DatePicker
        visible={productionEndVisible}
        onClose={() => setProductionEndVisible(false)}
        precision="day"
        value={parseDateString(form.getFieldValue('productionDateEnd'))}
        onConfirm={(value) => {
          form.setFieldValue('productionDateEnd', formatTimestampToDate(value.getTime()))
          setProductionEndVisible(false)
        }}
        title="选择生产结束日期"
        min={new Date(new Date().getFullYear() - 100, 0, 1)}
        max={new Date(new Date().getFullYear() + 100, 11, 31)}
        renderLabel={(type, data) => {
          if (type === 'year') return data + '年'
          if (type === 'month') return data + '月'
          if (type === 'day') return data + '日'
          return data
        }}
      />

      {/* 送货日期选择器 */}
      <DatePicker
        visible={deliveryDateVisible}
        onClose={() => setDeliveryDateVisible(false)}
        precision="day"
        value={parseDateString(form.getFieldValue('deliveryDate'))}
        onConfirm={(value) => {
          form.setFieldValue('deliveryDate', formatTimestampToDate(value.getTime()))
          setDeliveryDateVisible(false)
        }}
        title="选择送货日期"
        min={new Date(new Date().getFullYear() - 100, 0, 1)}
        max={new Date(new Date().getFullYear() + 100, 11, 31)}
        renderLabel={(type, data) => {
          if (type === 'year') return data + '年'
          if (type === 'month') return data + '月'
          if (type === 'day') return data + '日'
          return data
        }}
      />
    </PageContainer>
  )
}

export default BarcodeEdit
