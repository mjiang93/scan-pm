// 条码编辑页面
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Form, Input, DatePicker, Toast } from 'antd-mobile'
import { PageContainer, Loading } from '@/components'
import { getBarcodeDetail, updateBarcode } from '@/services/barcode'
import { useUserStore } from '@/stores'
import styles from './index.module.less'

const BarcodeEdit = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id') || ''
  const { userInfo } = useUserStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [originalData, setOriginalData] = useState<any>(null)
  const [form] = Form.useForm()

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
        
        // 设置表单初始值 - 直接使用接口返回的字段名
        form.setFieldsValue({
          projectCode: data.projectCode || '',
          productCode: data.productCode || '',
          productionDateStart: data.productionDateStart ? new Date(parseInt(data.productionDateStart)) : null,
          productionDateEnd: data.productionDateEnd ? new Date(parseInt(data.productionDateEnd)) : null,
          lineName: data.lineName || '',
          technicalVersion: data.technicalVersion || '',
          model: data.model || '', // 使用 model 字段
          cnt: data.cnt || '',
          unit: data.unit || '',
          supplierCode: data.supplierCode || '',
          factoryCode: data.factoryCode || '',
          codeSn: data.codeSn || '',
          code09: data.code09 || '',
          materialCode: data.materialCode || '',
          drawingVersion: data.drawingVersion || '',
          accessoryCnt: data.accessoryCnt || '',
          deliveryDate: data.deliveryDate ? new Date(parseInt(data.deliveryDate)) : null
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
      
      // 只传递接口需要的字段
      const updateData = {
        id: parseInt(id),
        projectCode: values.projectCode,
        supplierCode: values.supplierCode,
        productionDateStart: values.productionDateStart ? values.productionDateStart.toISOString().split('T')[0] : '',
        productionDateEnd: values.productionDateEnd ? values.productionDateEnd.toISOString().split('T')[0] : '',
        lineName: values.lineName,
        technicalVersion: values.technicalVersion,
        nameModel: values.model, // 接口字段是 nameModel
        cnt: parseFloat(values.cnt) || 0,
        unit: values.unit,
        materialCode: values.materialCode,
        factoryCode: values.factoryCode,
        codeSn: values.codeSn,
        code09: values.code09,
        drawingVersion: values.drawingVersion,
        accessoryCnt: parseInt(values.accessoryCnt) || 0,
        deliveryDate: values.deliveryDate ? values.deliveryDate.toISOString().split('T')[0] : '',
        printStatus: originalData.printStatus || 0,
        btPrintCnt: originalData.btPrintCnt || 0,
        nbzPrintCnt: originalData.nbzPrintCnt || 0,
        wbzPrintCnt: originalData.wbzPrintCnt || 0,
        operator: userInfo?.userName || 'unknown'
      }
      
      console.log('保存数据:', updateData)
      console.log('当前用户:', userInfo)
      
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
          className={styles.form}
        >
          <Form.Item
            name="projectCode"
            label="项目编码"
            rules={[{ required: true, message: '请输入项目编码' }]}
          >
            <Input placeholder="请输入项目编码" />
          </Form.Item>

          <Form.Item
            name="productCode"
            label="产品编码"
            rules={[{ required: true, message: '请输入产品编码' }]}
          >
            <Input placeholder="请输入产品编码" />
          </Form.Item>

          <Form.Item label="生产日期" className={styles.dateRangeItem}>
            <div className={styles.dateRange}>
              <Form.Item name="productionDateStart" noStyle>
                <DatePicker precision="day">
                  {value => value ? value.toLocaleDateString('zh-CN') : '选择日期'}
                </DatePicker>
              </Form.Item>
              <span className={styles.dateSeparator}>至</span>
              <Form.Item name="productionDateEnd" noStyle>
                <DatePicker precision="day">
                  {value => value ? value.toLocaleDateString('zh-CN') : '选择日期'}
                </DatePicker>
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item label="生产线" className={styles.inlineGroup}>
            <div className={styles.inlineFields}>
              <Form.Item name="lineName" noStyle>
                <Input placeholder="生产线" className={styles.halfInput} />
              </Form.Item>
              <Form.Item name="technicalVersion" label="技术版本" noStyle>
                <Input placeholder="技术版本" className={styles.halfInput} />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item
            name="model"
            label="名称型号"
          >
            <Input placeholder="请输入名称型号" />
          </Form.Item>

          <Form.Item label="数量" className={styles.inlineGroup}>
            <div className={styles.inlineFields}>
              <Form.Item name="cnt" noStyle>
                <Input placeholder="数量" type="number" className={styles.halfInput} />
              </Form.Item>
              <Form.Item name="unit" label="单位" noStyle>
                <Input placeholder="单位" className={styles.halfInput} />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item
            name="supplierCode"
            label="供货商代码"
          >
            <Input placeholder="请输入供货商代码" />
          </Form.Item>

          <Form.Item
            name="factoryCode"
            label="出厂码"
          >
            <Input placeholder="请输入出厂码" />
          </Form.Item>

          <Form.Item
            name="codeSn"
            label="SN码"
          >
            <Input placeholder="请输入SN码" />
          </Form.Item>

          <Form.Item
            name="code09"
            label="09码"
          >
            <Input placeholder="请输入09码" />
          </Form.Item>

          <Form.Item
            name="materialCode"
            label="物料编码"
          >
            <Input placeholder="请输入物料编码" />
          </Form.Item>

          <Form.Item label="图纸版本" className={styles.inlineGroup}>
            <div className={styles.inlineFields}>
              <Form.Item name="drawingVersion" noStyle>
                <Input placeholder="图纸版本" className={styles.halfInput} />
              </Form.Item>
              <Form.Item name="accessoryCnt" label="附件" noStyle>
                <Input placeholder="附件数量" type="number" className={styles.halfInput} />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item
            name="deliveryDate"
            label="送货日期"
          >
            <DatePicker precision="day">
              {value => value ? value.toLocaleDateString('zh-CN') : '选择送货日期'}
            </DatePicker>
          </Form.Item>
        </Form>

        <div className={styles.footer}>
          <Button
            block
            color="primary"
            size="large"
            onClick={handleSave}
            loading={saving}
            disabled={saving}
          >
            保存
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

export default BarcodeEdit
