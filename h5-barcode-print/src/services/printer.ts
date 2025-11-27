// 打印机接口服务
import { request } from './request'
import type { Printer } from '@/types/printer'

/**
 * 获取打印机列表
 */
export function getPrinterList(): Promise<Printer[]> {
  return request.get<Printer[]>('/printer/list')
}

/**
 * 获取打印机状态
 */
export function getPrinterStatus(printerId: string): Promise<Printer> {
  return request.get<Printer>(`/printer/${printerId}/status`)
}
