// 条形码组件
import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

interface BarcodeProps {
  value: string
  width?: number
  height?: number
  fontSize?: number
  className?: string
  displayValue?: boolean
}

const BarcodeComponent = ({ 
  value, 
  width = 1.5, 
  height = 50, 
  fontSize = 10,
  className,
  displayValue = true
}: BarcodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        // 使用2倍DPI进行高清渲染，匹配打印分辨率
        const scaleFactor = 2
        
        JsBarcode(canvasRef.current, value, {
          format: "CODE128",
          width: width * scaleFactor,
          height: height * scaleFactor,
          displayValue: displayValue,
          fontSize: fontSize * scaleFactor,
          textAlign: "center",
          textPosition: "bottom",
          textMargin: 2 * scaleFactor,
          fontOptions: "",
          font: "monospace",
          background: "#ffffff",
          lineColor: "#000000",
          margin: 5 * scaleFactor,
          flat: true
        })
        
        // 通过CSS缩放回原始显示尺寸，保持高清晰度
        const canvas = canvasRef.current
        const displayWidth = canvas.width / scaleFactor
        const displayHeight = canvas.height / scaleFactor
        canvas.style.width = `${displayWidth}px`
        canvas.style.height = `${displayHeight}px`
      } catch (err) {
        console.error('生成条形码失败:', err)
      }
    }
  }, [value, width, height, fontSize, displayValue])

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
      style={{ 
        display: 'block', 
        margin: '0 auto',
        maxWidth: '100%',
        imageRendering: 'crisp-edges'
      }}
    />
  )
}

export default BarcodeComponent