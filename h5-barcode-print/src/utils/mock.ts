/**
 * Mock 数据工具函数
 * 用于在开发环境中快速切换 Mock 模式
 */

/**
 * 启用打印机 Mock 数据
 */
export function enableMockPrinters(): void {
  localStorage.setItem('useMockPrinters', 'true')
  console.log('✅ 已启用打印机 Mock 数据，请刷新页面')
}

/**
 * 禁用打印机 Mock 数据
 */
export function disableMockPrinters(): void {
  localStorage.removeItem('useMockPrinters')
  console.log('❌ 已禁用打印机 Mock 数据，请刷新页面')
}

/**
 * 检查是否启用了打印机 Mock 数据
 */
export function isMockPrintersEnabled(): boolean {
  return localStorage.getItem('useMockPrinters') === 'true'
}

// 在开发环境中将这些函数挂载到 window 对象，方便在控制台调用
if (import.meta.env.DEV) {
  (window as any).mockUtils = {
    enableMockPrinters,
    disableMockPrinters,
    isMockPrintersEnabled,
  }
  console.log('💡 Mock 工具已加载，可在控制台使用：')
  console.log('  - window.mockUtils.enableMockPrinters()  // 启用 Mock')
  console.log('  - window.mockUtils.disableMockPrinters() // 禁用 Mock')
  console.log('  - window.mockUtils.isMockPrintersEnabled() // 检查状态')
}
