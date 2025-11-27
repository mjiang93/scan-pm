// 打印本体码页面
import { useState } from 'react'
import { Form, Input, Button, Toast } from 'antd-mobile'
import { PageContainer } from '@/components'
import { usePrinterStore } from '@/stores'
import { printBarcode } from '@/services/barcode'
import { isBarcode, isEmpty } from '@/utils/validate'
import styles from './index.module.less'

const PrintBody = () => {
  const { currentPrinter } = usePrinterStore()
  const [loading, setLoading] = useState(false)
  const [barcode, setBarcode] = useState('')

  const handlePrint = async () => {
    if (isEmpty(barcode)) {
      Toast.show({ content: '请输入本体码' })
      return
    }
    if (!isBarcode(barcode)) {
      Toast.show({ content: '条码格式无效' })
      return
    }
    if (!currentPrinter) {
      Toast.show({ content: '请先选择打印机' })
      return
    }

    setLoading(true)
    try {
      await printBarcode({
        barcodeId: barcode,
        printerId: currentPrinter.id,
        quantity: 1,
      })
      Toast.show({ icon: 'success', content: '打印成功' })
      setBarcode('')
    } catch {
      Toast.show({ icon: 'fail', content: '打印失败，请重试' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer title="打印本体码">
      <div className={styles.print}>
        <div className={styles.printerInfo}>
          当前打印机: {currentPrinter?.name || '未选择'}
        </div>

        <Form layout="vertical">
          <Form.Item label="本体码">
            <Input
              placeholder="请输入或扫描本体码"
              value={barcode}
              onChange={setBarcode}
              clearable
            />
          </Form.Item>
        </Form>

        <Button
          block
          color="primary"
          size="large"
          loading={loading}
          onClick={handlePrint}
        >
          打印
        </Button>
      </div>
    </PageContainer>
  )
}

export default PrintBody
