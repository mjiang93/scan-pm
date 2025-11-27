// 条码相关类型
export type BarcodeType = 'body' | 'inner' | 'label'
export type PrintTaskStatus = 'pending' | 'printing' | 'success' | 'failed'

export interface BarcodeInfo {
  id: string
  code: string
  type: BarcodeType
  productName: string
  productCode: string
  createTime: string
}

export interface PrintTask {
  id: string
  barcodeId: string
  printerId: string
  quantity: number
  status: PrintTaskStatus
  createTime: string
}

export interface LabelInfo {
  productCode: string
  productName: string
  batchNo: string
  quantity: number
  unit: string
  productionDate: string
  expiryDate?: string
  supplier?: string
}
