// 条形码组件
import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

interface BarcodeProps {
  value: string
  width?: number
  height?: number
  fontSize?: number
  className?: string
}

const BarcodeComponent = ({ 
  value, 
  width = 1.5, 
  height = 50, 
  fontSize = 10,
  className 
}: BarcodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: "CODE128",
          width: width,
          height: height,
          displayValue: true,
          fontSize: fontSize,
          textAlign: "center",
          textPosition: "bottom",
          textMargin: 2,
          fontOptions: "",
          font: "monospace",
          background: "#ffffff",
          lineColor: "#000000",
          margin: 5
        })
      } catch (err) {
        console.error('生成条形码失败:', err)
      }
    }
  }, [value, width, height, fontSize])

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
      style={{ 
        display: 'block', 
        margin: '0 auto',
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  )
}

export default BarcodeComponent