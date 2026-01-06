// 扫码页面
import { useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Input, Button, Toast } from 'antd-mobile'
import { PageContainer } from '@/components'
import Scanner from '@/components/Scanner'
import { isEmpty } from '@/utils/validate'
import styles from './index.module.less'

const Scan = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') || 'body' // 默认为本体码
  const id = searchParams.get('id') || '' // 条码ID，用于MOM出厂码绑定
  const [manualCode, setManualCode] = useState('')
  const [permissionDenied, setPermissionDenied] = useState(false)

  const handleScan = useCallback((code: string) => {
    Toast.show({ 
      content: '扫描成功',
      duration: 1500
    })
    
    // 如果是MOM出厂码绑定，直接返回详情页面
    if (type === 'mom' && id) {
      navigate(`/barcode-detail?id=${encodeURIComponent(id)}&factoryCode=${encodeURIComponent(code)}`)
    } else if (type === 'inner') {
      // 扫SN打印内包装，直接跳转到打印内包装码页面
      navigate(`/print-inner?btcode=${encodeURIComponent(code)}`)
    } else if (type === 'body') {
      // 扫码生成SN码，直接跳转到详情页面
      navigate(`/barcode-detail?projectCode=${encodeURIComponent(code)}&type=body`)
    } else if (type === 'label') {
      // 扫内包生成外装，直接跳转到打印外包装标签页面
      navigate(`/print-label?nbzcode=${encodeURIComponent(code)}`)
    } else {
      navigate(`/scan-result?code=${encodeURIComponent(code)}&type=${type}`)
    }
  }, [type, id, navigate])

  const handleError = useCallback((error: string) => {
    if (error.includes('Permission') || error.includes('NotAllowed')) {
      setPermissionDenied(true)
    }
    Toast.show({ content: error })
  }, [])

  const handleManualSubmit = () => {
    if (isEmpty(manualCode)) {
      Toast.show({ content: '请输入条码' })
      return
    }
    
    // 如果是MOM出厂码绑定，直接返回详情页面
    if (type === 'mom' && id) {
      navigate(`/barcode-detail?id=${encodeURIComponent(id)}&factoryCode=${encodeURIComponent(manualCode)}`)
    } else if (type === 'inner') {
      // 扫SN打印内包装，直接跳转到打印内包装码页面
      navigate(`/print-inner?btcode=${encodeURIComponent(manualCode)}`)
    } else if (type === 'body') {
      // 扫码生成SN码，直接跳转到详情页面
      navigate(`/barcode-detail?projectCode=${encodeURIComponent(manualCode)}&type=body`)
    } else if (type === 'label') {
      // 扫内包生成外装，直接跳转到打印外包装标签页面
      navigate(`/print-label?nbzcode=${encodeURIComponent(manualCode)}`)
    } else {
      navigate(`/scan-result?code=${encodeURIComponent(manualCode)}&type=${type}`)
    }
  }

  const getTitle = () => {
    const typeMap = {
      body: '扫码生成SN码',
      inner: '扫SN打印内包装',
      label: '扫内包生成外装',
      mom: '扫描MOM出厂码'
    }
    return typeMap[type as keyof typeof typeMap] || '扫码'
  }

  return (
    <PageContainer title={getTitle()}>
      <div className={styles.scan}>
        {permissionDenied ? (
          <div className={styles.manual}>
            <div className={styles.permissionTip}>
              <p>📷 摄像头权限被拒绝</p>
              <p>请在浏览器设置中允许访问摄像头，或手动输入条码</p>
            </div>
            <div className={styles.inputArea}>
              <Input
                placeholder="请输入条码"
                value={manualCode}
                onChange={setManualCode}
                clearable
              />
              <Button 
                color="primary" 
                onClick={handleManualSubmit}
                disabled={isEmpty(manualCode)}
              >
                搜索
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.scannerWrapper}>
              <Scanner onScan={handleScan} onError={handleError} />
            </div>
            <div className={styles.actions}>
              <div className={styles.inputArea}>
                <Input
                  placeholder="或手动输入条码"
                  value={manualCode}
                  onChange={setManualCode}
                  clearable
                />
                <Button 
                  color="primary" 
                  onClick={handleManualSubmit}
                  disabled={isEmpty(manualCode)}
                >
                  搜索
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  )
}

export default Scan
