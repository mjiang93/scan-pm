// 扫码组件
import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import styles from './index.module.less'

export interface ScannerProps {
  onScan: (code: string) => void
  onError?: (error: string) => void
}

const Scanner = ({ onScan, onError }: ScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isScanningRef = useRef(false)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    // 防止重复初始化
    if (isInitializedRef.current) return

    const startScanner = async () => {
      try {
        isInitializedRef.current = true
        const scanner = new Html5Qrcode('scanner-container')
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScan(decodedText)
          },
          () => {
            // 扫描中，忽略错误
          }
        )
        isScanningRef.current = true
      } catch (error) {
        isInitializedRef.current = false
        const message = error instanceof Error ? error.message : '摄像头启动失败'
        onError?.(message)
      }
    }

    startScanner()

    return () => {
      const cleanup = async () => {
        if (scannerRef.current && isScanningRef.current) {
          try {
            await scannerRef.current.stop()
            scannerRef.current.clear()
            isScanningRef.current = false
            isInitializedRef.current = false
          } catch {
            // 忽略清理错误
          }
        }
      }
      cleanup()
    }
  }, [onScan, onError])

  return (
    <div className={styles.scanner}>
      <div id="scanner-container" className={styles.container} />
      <div className={styles.overlay}>
        <div className={styles.scanBox}>
          <div className={styles.corner} />
          <div className={styles.scanLine} />
        </div>
        <p className={styles.tip}>请扫描二维码或条形码</p>
      </div>
    </div>
  )
}

export default Scanner
