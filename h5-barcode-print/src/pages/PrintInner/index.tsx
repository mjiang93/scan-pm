// 打印内包装码页面
import { useState } from 'react'
import { Form, Input, Stepper, Button, Toast, ProgressBar } from 'antd-mobile'
import { PageContainer } from '@/components'
import { usePrinterStore } from '@/stores'
import { printBarcode } from '@/services/barcode'
import { isBarcode, isEmpty, isPrintQuantityValid } from '@/utils/validate'
import styles from './index.module.less'

const PrintInner = () => {
  const { currentPrinter } = usePrinterStore()
  const [loading, setLoading] = useState(false)
  const [barcode, setBarcode] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [progress, setProgress] = useState(0)

  const handlePrint = async () => {
    if (isEmpty(barcode)) {
      Toast.show({ content: '请输入内包装码' })
      return
    }
    if (!isBarcode(barcode)) {
      Toast.show({ content: '条码格式无效' })
      return
    }
    if (!isPrintQuantityValid(quantity)) {
      Toast.show({ content: '打印数量需在1-999之间' })
      return
    }
    if (!currentPrinter) {
      Toast.show({ content: '请先选择打印机' })
      return
    }

    setLoading(true)
    setProgress(0)

    // 模拟打印进度
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90))
    }, 200)

    try {
      await printBarcode({
        barcodeId: barcode,
        printerId: currentPrinter.id,
        quantity,
      })
      clearInterval(progressInterval)
      setProgress(100)
      Toast.show({ icon: 'success', content: '打印任务提交成功' })
      setBarcode('')
      setQuantity(1)
    } catch {
      clearInterval(progressInterval)
      Toast.show({ icon: 'fail', content: '打印失败，请重试' })
    } finally {
      setLoading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  return (
    <PageContainer title="打印内包装码">
      <div className={styles.print}>
        <div className={styles.printerInfo}>
          当前打印机: {currentPrinter?.name || '未选择'}
        </div>

        <Form layout="vertical">
          <Form.Item label="内包装码">
            <Input
              placeholder="请输入或扫描内包装码"
              value={barcode}
              onChange={setBarcode}
              clearable
            />
          </Form.Item>
          <Form.Item label="打印数量">
            <Stepper
              min={1}
              max={999}
              value={quantity}
              onChange={setQuantity}
            />
          </Form.Item>
        </Form>

        {progress > 0 && (
          <div className={styles.progress}>
            <ProgressBar percent={progress} />
            <span>{progress}%</span>
          </div>
        )}

        <Button
          block
          color="primary"
          size="large"
          loading={loading}
          onClick={handlePrint}
        >
          打印 ({quantity}张)
        </Button>
      </div>
    </PageContainer>
  )
}

export default PrintInner
