import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { usePrinterStore } from './printerStore'
import type { Printer } from '@/types/printer'

// **Feature: h5-barcode-print-system, Property 7: 打印机状态管理一致性**
// **Validates: Requirements 4.3, 13.3**

describe('printerStore', () => {
  beforeEach(() => {
    const store = usePrinterStore.getState()
    store.clearCurrentPrinter()
    store.setPrinterList([])
  })

  describe('Property 7: 打印机状态管理一致性', () => {
    it('对于任意打印机，设置后读取应返回相同的值', () => {
      const printerArb = fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }),
        name: fc.string({ minLength: 1, maxLength: 50 }),
        ip: fc.string({ minLength: 7, maxLength: 15 }),
        port: fc.integer({ min: 1000, max: 65535 }),
        status: fc.constantFrom('online', 'offline', 'busy'),
        type: fc.constantFrom('body', 'inner', 'label'),
      })

      fc.assert(
        fc.property(printerArb, (printer) => {
          const store = usePrinterStore.getState()
          store.setCurrentPrinter(printer as Printer)
          
          const currentPrinter = usePrinterStore.getState().currentPrinter
          return JSON.stringify(currentPrinter) === JSON.stringify(printer)
        }),
        { numRuns: 100 }
      )
    })

    it('对于任意打印机列表，设置后读取应返回相同的列表', () => {
      const printerArb = fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }),
        name: fc.string({ minLength: 1, maxLength: 50 }),
        ip: fc.string({ minLength: 7, maxLength: 15 }),
        port: fc.integer({ min: 1000, max: 65535 }),
        status: fc.constantFrom('online', 'offline', 'busy'),
        type: fc.constantFrom('body', 'inner', 'label'),
      })

      const printerListArb = fc.array(printerArb, { minLength: 0, maxLength: 10 })

      fc.assert(
        fc.property(printerListArb, (printerList) => {
          const store = usePrinterStore.getState()
          store.setPrinterList(printerList as Printer[])
          
          const currentList = usePrinterStore.getState().printerList
          return JSON.stringify(currentList) === JSON.stringify(printerList)
        }),
        { numRuns: 100 }
      )
    })

    it('clearCurrentPrinter 后 currentPrinter 应为 null', () => {
      const store = usePrinterStore.getState()
      store.setCurrentPrinter({
        id: '1',
        name: 'Test Printer',
        ip: '192.168.1.100',
        port: 9100,
        status: 'online',
        type: 'body',
      })
      
      store.clearCurrentPrinter()
      
      expect(usePrinterStore.getState().currentPrinter).toBeNull()
    })
  })
})
