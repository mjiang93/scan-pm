// 打印收货外标签页面
import { useState } from 'react'
import { Form, Input, Button, Toast, DatePicker } from 'antd-mobile'
import { PageContainer } from '@/components'
import { usePrinterStore } from '@/stores'
import { printLabel } from '@/services/barcode'
import { isEmpty } from '@/utils/validate'
import { formatDate } from '@/utils/format'
import type { LabelInfo } from '@/types/barcode'
import styles from './index.module.less'

const PrintLabel = () => {
  const { currentPrinter } = usePrinterStore()
  const [loading, setLoading] = useState(false)
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [formData, setFormData] = useState<Partial<LabelInfo>>({
    productCode: '',
    productName: '',
    batchNo: '',
    quantity: 1,
    unit: '件',
    productionDate: formatDate(new Date()),
  })

  const updateField = (field: keyof LabelInfo, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    const requiredFields: (keyof LabelInfo)[] = ['productCode', 'productName', 'batchNo', 'productionDate']
    for (const field of requiredFields) {
      if (isEmpty(formData[field])) {
        const labels: Record<string, string> = {
          productCode: '产品编码',
          productName: '产品名称',
          batchNo: '批次号',
          productionDate: '生产日期',
        }
        Toast.show({ content: `请填写${labels[field]}` })
        return false
      }
    }
    return true
  }

  const handlePrint = async () => {
    if (!validateForm()) return
    if (!currentPrinter) {
      Toast.show({ content: '请先选择打印机' })
      return
    }

    setLoading(true)
    try {
      await printLabel({
        labelInfo: formData as LabelInfo,
        printerId: currentPrinter.id,
      })
      Toast.show({ icon: 'success', content: '打印成功' })
    } catch {
      Toast.show({ icon: 'fail', content: '打印失败，请重试' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer title="打印收货外标签">
      <div className={styles.print}>
        <div className={styles.printerInfo}>
          当前打印机: {currentPrinter?.name || '未选择'}
        </div>

        <Form layout="vertical">
          <Form.Item label="产品编码" required>
            <Input
              placeholder="请输入产品编码"
              value={formData.productCode}
              onChange={v => updateField('productCode', v)}
              clearable
            />
          </Form.Item>
          <Form.Item label="产品名称" required>
            <Input
              placeholder="请输入产品名称"
              value={formData.productName}
              onChange={v => updateField('productName', v)}
              clearable
            />
          </Form.Item>
          <Form.Item label="批次号" required>
            <Input
              placeholder="请输入批次号"
              value={formData.batchNo}
              onChange={v => updateField('batchNo', v)}
              clearable
            />
          </Form.Item>
          <Form.Item label="数量">
            <Input
              type="number"
              placeholder="请输入数量"
              value={String(formData.quantity || '')}
              onChange={v => updateField('quantity', Number(v) || 0)}
            />
          </Form.Item>
          <Form.Item label="单位">
            <Input
              placeholder="请输入单位"
              value={formData.unit}
              onChange={v => updateField('unit', v)}
            />
          </Form.Item>
          <Form.Item
            label="生产日期"
            required
            onClick={() => setDatePickerVisible(true)}
          >
            <Input
              placeholder="请选择生产日期"
              value={formData.productionDate}
              readOnly
            />
          </Form.Item>
          <Form.Item label="供应商">
            <Input
              placeholder="请输入供应商（选填）"
              value={formData.supplier}
              onChange={v => updateField('supplier', v)}
              clearable
            />
          </Form.Item>
        </Form>

        <div className={styles.preview}>
          <h4>标签预览</h4>
          <div className={styles.labelPreview}>
            <p><strong>{formData.productName || '产品名称'}</strong></p>
            <p>编码: {formData.productCode || '-'}</p>
            <p>批次: {formData.batchNo || '-'}</p>
            <p>数量: {formData.quantity} {formData.unit}</p>
            <p>日期: {formData.productionDate || '-'}</p>
          </div>
        </div>

        <Button
          block
          color="primary"
          size="large"
          loading={loading}
          onClick={handlePrint}
        >
          打印标签
        </Button>

        <DatePicker
          visible={datePickerVisible}
          onClose={() => setDatePickerVisible(false)}
          onConfirm={date => {
            updateField('productionDate', formatDate(date))
            setDatePickerVisible(false)
          }}
        />
      </div>
    </PageContainer>
  )
}

export default PrintLabel
