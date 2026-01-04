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

/**
 * 获取条码详情
 */
export function getBarcodeDetail(id: string): Promise<any> {
  return request.get(`/pc/detail`, { params: { id } })
}

/**
 * 分页查询条码列表
 */
export function getBarcodeListPage(params: {
  deliveryDateStart?: string
  deliveryDateEnd?: string
  page: number
  size: number
}): Promise<{
  result: any[]
  total: number
  empty: boolean
}> {
  return request.post('/pc/page', params)
}

/**
 * 更新条码信息
 */
export function updateBarcode(data: any): Promise<any> {
  return request.post('/pc/edit', data)
}

/**
 * 编辑附件数量
 */
export function editAccessory(params: {
  accessoryCnt: number
  ids: number[]
  operator: string
}): Promise<any> {
  return request.post('/pc/editaccessory', params)
}

/**
 * 修改送货日期
 */
export function editDelivery(params: {
  deliveryDate: string
  ids: number[]
  operator: string
}): Promise<any> {
  return request.post('/pc/editdelivery', params)
}

/**
 * 修改图纸版本
 */
export function editDrawingVersion(params: {
  id: string
  drawingVersion: string
  operator: string
}): Promise<any> {
  return request.get('/pda/editdv', { params })
}

/**
 * 更新打印状态
 */
export function updatePrintStatus(params: {
  id: number
  operator: string
  btPrintCnt?: number
  nbzPrintCnt?: number
  wbzPrintCnt?: number
}): Promise<any> {
  return request.post('/pc/editprint', params)
}

/**
 * 扫描MOM系统出厂编码，绑定生成的条码信息
 */
export function bindFactoryCode(params: {
  id: string
  factoryCode: string
  operator: string
}): Promise<any> {
  return request.get('/pda/scanfcode', { params })
}

/**
 * 扫本体码得到内包装码打印信息
 */
export function scanBtcode(btcode: string): Promise<{
  id: string
  partNo: string
  supplierCode: string
  codeSN: string
  dcDate: string
  qty: string
  remark: string
}> {
  return request.get('/pda/scanbtcode', { params: { btcode } })
}

/**
 * 扫描项目编码，生成条码信息
 */
export function scanProjectCode(params: {
  projectCode: string
  operator: string
}): Promise<{
  id: string
  projectCode: string
  materialCode: string
  nameModel: string
  drawingVersion: string
  technicalVersion: string
  supplierCode: string
  unit: string
  cnt: number
  lineName: string
  productionDateStart: string
  productionDateEnd: string
  deliveryDate: string
  code09: string
  codeSn: string
  factoryCode: string
  accessoryCnt: number
  printStatus: number
  btPrintCnt: number
  nbzPrintCnt: number
  wbzPrintCnt: number
}> {
  return request.get('/pda/scanpcode', { params })
}

/**
 * 扫内包装码得到外包装码打印信息
 */
export function scanNbzcode(nbzcode: string): Promise<{
  id: string
  materialCode: string
  nameModel: string
  supplierCode: string
  unit: string
  cnt: number
  codeSN: string
  deliveryDate: string
  deliveryNo: string
  poNo: string
  saveClean: string
}> {
  return request.get('/pda/scannbzcode', { params: { nbzcode } })
}
