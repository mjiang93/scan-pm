// 扫码页面
import { useState, useRef, useEffect } from 'react'
// import { useCallback } from 'react' // 暂时注释扫码功能时不需要
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Input, Button, Toast } from 'antd-mobile'
import type { InputRef } from 'antd-mobile/es/components/input'
import { PageContainer } from '@/components'
// import Scanner from '@/components/Scanner' // 暂时注释扫码功能
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
  // const [permissionDenied, setPermissionDenied] = useState(false) // 暂时注释扫码功能
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<InputRef>(null)

  // 页面加载时自动聚焦输入框
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // 点击页面任何位置都自动对焦到输入框
  useEffect(() => {
    const handlePageClick = () => {
      // 确保输入框存在且未被禁用时才对焦
      if (inputRef.current && !loading) {
        inputRef.current.focus()
      }
    }

    // 监听整个文档的点击事件
    document.addEventListener('click', handlePageClick)
    
    // 组件卸载时移除监听器
    return () => {
      document.removeEventListener('click', handlePageClick)
    }
  }, [loading])

  // 暂时注释扫码功能 - 开始
  // const handleScan = useCallback((code: string) => {
  //   Toast.show({ 
  //     content: '扫描成功',
  //     duration: 1500
  //   })
  //   
  //   // 如果是MOM出厂码绑定，直接返回详情页面，使用 replace 清除扫码页面历史
  //   if (type === 'mom' && id) {
  //     const typeParam = returnType ? `&type=${encodeURIComponent(returnType)}` : ''
  //     navigate(`/barcode-detail?id=${encodeURIComponent(id)}&factoryCode=${encodeURIComponent(code)}${typeParam}`, { replace: true })
  //   } else if (type === 'inner') {
  //     // 扫SN打印内包装，直接跳转到打印内包装码页面
  //     navigate(`/print-inner?btcode=${encodeURIComponent(code)}`, { replace: true })
  //   } else if (type === 'body') {
  //     // 扫码生成SN码，调用接口获取ID后跳转
  //     handleScanProjectCode(code)
  //   } else if (type === 'label') {
  //     // 扫内包生成外装，直接跳转到打印外包装标签页面
  //     navigate(`/print-label?nbzcode=${encodeURIComponent(code)}`, { replace: true })
  //   } else {
  //     navigate(`/scan-result?code=${encodeURIComponent(code)}&type=${type}`, { replace: true })
  //   }
  // }, [type, id, returnType, navigate])

  // const handleError = useCallback((error: string) => {
  //   if (error.includes('Permission') || error.includes('NotAllowed')) {
  //     setPermissionDenied(true)
  //   }
  //   Toast.show({ content: error })
  // }, [])
  // 暂时注释扫码功能 - 结束

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
    
    // 如果是MOM出厂码，校验必须是15位
    if (type === 'mom' && manualCode.length !== 15) {
      Toast.show({ content: 'MOM出厂码必须是15位' })
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
    return type === 'mom' ? '绑定' : '确认'
  }

  return (
    <PageContainer title={getTitle()}>
      <div className={styles.scan}>
        {/* 暂时注释扫码功能，后期再启用 */}
        {/* {permissionDenied ? (
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
        )} */}
        
        {/* 扫码枪输入模式 */}
        <div className={styles.scannerMode}>
          <div className={styles.scanIcon}>
            <svg viewBox="0 0 1024 1024" width="120" height="120">
              <path d="M896 192H128c-35.3 0-64 28.7-64 64v512c0 35.3 28.7 64 64 64h768c35.3 0 64-28.7 64-64V256c0-35.3-28.7-64-64-64zM128 768V256h768v512H128z" fill="currentColor"/>
              <path d="M192 320h64v384h-64zM320 320h32v384h-32zM416 320h64v384h-64zM544 320h32v384h-32zM640 320h32v384h-32zM736 320h64v384h-64z" fill="currentColor"/>
            </svg>
          </div>
          
          <div className={styles.scanTip}>
            <div className={styles.tipTitle}>请使用扫码枪扫描条码</div>
            <div className={styles.tipDesc}>扫码枪会自动将条码输入到下方输入框</div>
          </div>

          <div className={styles.inputWrapper}>
            <div className={styles.inputLabel}>条码输入</div>
            <div className={styles.inputArea}>
              <Input
                ref={inputRef}
                placeholder="等待扫码枪输入..."
                value={manualCode}
                onChange={setManualCode}
                clearable
                disabled={loading}
                className={styles.scanInput}
                onEnterPress={handleManualSubmit}
                maxLength={type === 'mom' ? 15 : undefined}
              />
              <Button 
                color="primary" 
                onClick={handleManualSubmit}
                disabled={isEmpty(manualCode) || loading}
                loading={loading}
                size="large"
                className={styles.submitBtn}
              >
                {/* {getButtonText()} */}
                确认
              </Button>
            </div>
          </div>

          {manualCode && (
            <div className={styles.codePreview}>
              <div className={styles.previewLabel}>当前条码：</div>
              <div className={styles.previewCode}>{manualCode}</div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

export default Scan
