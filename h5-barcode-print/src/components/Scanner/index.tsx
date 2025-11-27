// 扫码组件
import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import styles from './index.module.less'

export interface ScannerProps {
  onScan: (code: string) => void
  onError?: (error: string) => void
}

const Scanner = ({ onScan, onError }: ScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    startScanner()
    return () => {
      stopScanner()
    }
  }, [])

  const startScanner = async () => {
    try {
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
          stopScanner()
        },
        () => {
          // 扫描中，忽略错误
        }
      )
      setIsScanning(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : '摄像头启动失败'
      onError?.(message)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop()
        setIsScanning(false)
      } catch {
        // 忽略停止错误
      }
    }
  }

  return (
    <div className={styles.scanner}>
      <div id="scanner-container" className={styles.container} />
      <div className={styles.overlay}>
        <div className={styles.scanBox}>
          <div className={styles.corner} />
        </div>
        <p className={styles.tip}>将条码放入框内，即可自动扫描</p>
      </div>
    </div>
  )
}

export default Scanner
