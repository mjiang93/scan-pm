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
  // 使用元素自身的尺寸，不进行额外转换
  // 元素应该已经按照打印机DPI设置好尺寸（如382px x 48px）
  
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 1, // 使用1倍scale，保持元素原始尺寸
    useCORS: true,
    logging: false,
    // 不设置width和height，让html2canvas使用元素自身尺寸
  })

  return canvas.toDataURL('image/png')
}

/**
 * 将Canvas元素转换为base64图片
 * @param canvas Canvas元素
 * @returns base64图片数据
 */
export function canvasToBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}
