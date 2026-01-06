// 扫码页面
import { useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Input, Button, Toast } from 'antd-mobile'
import { PageContainer } from '@/components'
import Scanner from '@/components/Scanner'
import { scanProjectCode } from '@/services/barcode'
import { useUserStore } from '@/stores'
import { isEmpty } from '@/utils/validate'
import styles from './index.module.less'

const Scan = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') || 'body' // 默认为本体码
  const id = searchParams.get('id') || '' // 条码ID，用于MOM出厂码绑定
  const returnType = searchParams.get('returnType') || '' // 返回时需要带的type参数
  const { userInfo } = useUserStore()
  const [manualCode, setManualCode] = useState('')
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleScan = useCallback((code: string) => {
    Toast.show({ 
      content: '扫描成功',
      duration: 1500
    })
    
    // 如果是MOM出厂码绑定，直接返回详情页面，使用 replace 清除扫码页面历史
    if (type === 'mom' && id) {
      const typeParam = returnType ? `&type=${encodeURIComponent(returnType)}` : ''
      navigate(`/barcode-detail?id=${encodeURIComponent(id)}&factoryCode=${encodeURIComponent(code)}${typeParam}`, { replace: true })
    } else if (type === 'inner') {
      // 扫SN打印内包装，直接跳转到打印内包装码页面
      navigate(`/print-inner?btcode=${encodeURIComponent(code)}`, { replace: true })
    } else if (type === 'body') {
      // 扫码生成SN码，调用接口获取ID后跳转
      handleScanProjectCode(code)
    } else if (type === 'label') {
      // 扫内包生成外装，直接跳转到打印外包装标签页面
      navigate(`/print-label?nbzcode=${encodeURIComponent(code)}`, { replace: true })
    } else {
      navigate(`/scan-result?code=${encodeURIComponent(code)}&type=${type}`, { replace: true })
    }
  }, [type, id, returnType, navigate])

  const handleError = useCallback((error: string) => {
    if (error.includes('Permission') || error.includes('NotAllowed')) {
      setPermissionDenied(true)
    }
    Toast.show({ content: error })
  }, [])

  // 处理扫码生成SN码的逻辑
  const handleScanProjectCode = async (projectCode: string) => {
    if (!userInfo) {
      Toast.show({
        icon: 'fail',
        content: '用户信息不存在'
      })
      return
    }

    setLoading(true)
    try {
      const data = await scanProjectCode({
        projectCode,
        operator: userInfo.userName || 'unknown'
      })
      
      Toast.show({
        icon: 'success',
        content: 'SN码生成成功'
      })
      
      // 如果返回了ID，跳转到详情页面
      if (data.id) {
        navigate(`/barcode-detail?id=${encodeURIComponent(data.id)}&type=body`, { replace: true })
      } else {
        Toast.show({
          icon: 'fail',
          content: '生成SN码失败：未返回ID'
        })
      }
    } catch (error: unknown) {
      console.error('生成SN码失败:', error)
      const err = error as { response?: { data?: { msg?: string } }; message?: string }
      const errorMsg = err?.response?.data?.msg || err?.message || '生成SN码失败'
      Toast.show({
        icon: 'fail',
        content: errorMsg
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = () => {
    if (isEmpty(manualCode)) {
      Toast.show({ content: '请输入条码' })
      return
    }
    
    // 如果是MOM出厂码绑定，直接返回详情页面，使用 replace 清除扫码页面历史
    if (type === 'mom' && id) {
      const typeParam = returnType ? `&type=${encodeURIComponent(returnType)}` : ''
      navigate(`/barcode-detail?id=${encodeURIComponent(id)}&factoryCode=${encodeURIComponent(manualCode)}${typeParam}`, { replace: true })
    } else if (type === 'inner') {
      // 扫SN打印内包装，直接跳转到打印内包装码页面
      navigate(`/print-inner?btcode=${encodeURIComponent(manualCode)}`, { replace: true })
    } else if (type === 'body') {
      // 扫码生成SN码，调用接口获取ID后跳转
      handleScanProjectCode(manualCode)
    } else if (type === 'label') {
      // 扫内包生成外装，直接跳转到打印外包装标签页面
      navigate(`/print-label?nbzcode=${encodeURIComponent(manualCode)}`, { replace: true })
    } else {
      navigate(`/scan-result?code=${encodeURIComponent(manualCode)}&type=${type}`, { replace: true })
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

  const getButtonText = () => {
    return type === 'mom' ? '绑定' : '搜索'
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
                disabled={loading}
              />
              <Button 
                color="primary" 
                onClick={handleManualSubmit}
                disabled={isEmpty(manualCode) || loading}
                loading={loading}
              >
                {getButtonText()}
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
                  disabled={loading}
                />
                <Button 
                  color="primary" 
                  onClick={handleManualSubmit}
                  disabled={isEmpty(manualCode) || loading}
                  loading={loading}
                >
                  {getButtonText()}
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
