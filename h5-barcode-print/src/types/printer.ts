// 打印机相关类型
export type PrinterStatus = 'ONLINE' | 'OFFLINE' | 'BUSY'
export type ConnectionType = 'NETWORK' | 'USB' | 'BLUETOOTH'

export interface Printer {
  printerId: string
  printerName: string
  ip: string
  port: number
  status: PrinterStatus
  connectionType: ConnectionType
  department: string
  location: string
  model: string
  paperWidth: number
  paperHeight: number
  isEnabled: boolean
  supportCut: boolean
  priority: number
  lastHeartbeat: string
  remark?: string
}

export interface PrinterListResponse {
  code: number
  data: {
    empty: boolean
    result: Printer[]
    total: number
  }
  errorMsg: string
  msg: string
  success: boolean
}

// 批量打印请求参数（旧接口）
export interface BatchPrintRequest {
  barcodeId: number
  copies: number
  ip: string
  operator: string
  port: number
  printData: string // base64图片数据
  printType: string // 打印类型：BODY(本体码)、INNER(内标)、LABEL(外标)
  printerId: string
  priority: number
}

// 批量打印响应
export interface BatchPrintResponse {
  code: number
  data: boolean
  msg: string
  success: boolean
}

// 新批量打印接口 - 图片项
export interface BatchPrintImageItem {
  copies: number
  data: string
  imageBase64: string
  imageFormat: string
  imageName: string
  sortOrder: number
}

// 新批量打印接口 - 请求参数
export interface BatchPrintImageRequest {
  images: BatchPrintImageItem[]
  ip: string
  operator: string
  port: number
  printStrategy: string
  printerId: string
  remark: string
  saveTempFile: boolean
}
