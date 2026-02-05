// DOM转图片工具函数
import html2canvas from 'html2canvas'

/**
 * 将DOM元素转换为base64图片
 * @param element DOM元素（已经设置好尺寸）
 * @param width 目标宽度（mm）- 仅用于文档说明
 * @param height 目标高度（mm）- 仅用于文档说明
 * @returns base64图片数据
 */
export async function domToBase64(
  element: HTMLElement,
  width: number = 48,
  height: number = 6
): Promise<string> {
  // 元素已经按照10倍分辨率设置好尺寸（如3840px x 480px）
  // html2canvas会按照元素的CSS尺寸渲染，scale=1保持原始像素
  
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 1, // 保持元素原始像素尺寸（已经是10倍分辨率）
    useCORS: true,
    logging: false,
    // 不设置width和height，让html2canvas使用元素自身尺寸
  })

  // 缩小到标准尺寸（384px x 48px @ 203 DPI）
  const targetWidth = Math.round(width * 8) // 48mm * 8 = 384px
  const targetHeight = Math.round(height * 8) // 6mm * 8 = 48px
  
  const resizeCanvas = document.createElement('canvas')
  resizeCanvas.width = targetWidth
  resizeCanvas.height = targetHeight
  
  const ctx = resizeCanvas.getContext('2d')
  if (ctx) {
    // 使用高质量缩放算法 - 关键：禁用平滑以保持锐利边缘
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight)
  }

  return resizeCanvas.toDataURL('image/png')
}

/**
 * 将Canvas元素转换为base64图片
 * @param canvas Canvas元素
 * @returns base64图片数据
 */
export function canvasToBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}
