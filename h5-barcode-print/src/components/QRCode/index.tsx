// 二维码组件
import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeProps {
  value: string
  size?: number
  className?: string
}

const QRCodeComponent = ({ value, size = 120, className }: QRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(err => {
        console.error('生成二维码失败:', err)
      })
    }
  }, [value, size])

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
      style={{ display: 'block' }}
    />
  )
}

export default QRCodeComponent