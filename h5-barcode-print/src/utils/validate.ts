// 验证工具函数

/**
 * 验证手机号（中国大陆）
 * 1开头，11位数字
 */
export function isPhone(value: string): boolean {
  if (typeof value !== 'string') return false
  return /^1[3-9]\d{9}$/.test(value)
}

/**
 * 验证条码格式
 * 支持 EAN-13, EAN-8, Code128 等常见格式
 * 基本规则：6-50位字母数字组合
 */
export function isBarcode(value: string): boolean {
  if (typeof value !== 'string') return false
  return /^[A-Za-z0-9]{6,50}$/.test(value)
}

/**
 * 检测空值（包括空字符串、纯空白字符）
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') {
    return value.trim().length === 0
  }
  if (Array.isArray(value)) {
    return value.length === 0
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }
  return false
}

/**
 * 验证数值是否在范围内
 */
export function isInRange(value: number, min: number, max: number): boolean {
  if (typeof value !== 'number' || isNaN(value)) return false
  return value >= min && value <= max
}

/**
 * 验证邮箱格式
 */
export function isEmail(value: string): boolean {
  if (typeof value !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * 验证是否为正整数
 */
export function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0
}

/**
 * 验证打印数量（1-999）
 */
export function isPrintQuantityValid(value: number): boolean {
  return isInRange(value, 1, 999) && Number.isInteger(value)
}
