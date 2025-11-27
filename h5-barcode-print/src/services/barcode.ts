// 条码接口服务
import { request } from './request'
import type { BarcodeInfo, PrintTask, LabelInfo } from '@/types/barcode'

/**
 * 搜索条码
 */
export function searchBarcode(code: string): Promise<BarcodeInfo[]> {
  return request.get<BarcodeInfo[]>('/barcode/search', { params: { code } })
}

/**
 * 打印条码
 */
export function printBarcode(params: {
  barcodeId: string
  printerId: string
  quantity: number
}): Promise<PrintTask> {
  return request.post<PrintTask>('/barcode/print', params)
}

/**
 * 打印标签
 */
export function printLabel(params: {
  labelInfo: LabelInfo
  printerId: string
}): Promise<PrintTask> {
  return request.post<PrintTask>('/barcode/print-label', params)
}

/**
 * 获取打印历史
 */
export function getPrintHistory(params?: {
  page?: number
  pageSize?: number
}): Promise<{ list: PrintTask[]; total: number }> {
  return request.get('/barcode/history', { params })
}
