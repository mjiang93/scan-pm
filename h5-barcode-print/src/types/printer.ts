// 打印机相关类型
export type PrinterStatus = 'online' | 'offline' | 'busy'
export type PrinterType = 'body' | 'inner' | 'label'

export interface Printer {
  id: string
  name: string
  ip: string
  port: number
  status: PrinterStatus
  type: PrinterType
}
