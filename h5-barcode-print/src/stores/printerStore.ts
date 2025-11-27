// 打印机状态管理
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Printer } from '@/types/printer'

interface PrinterState {
  currentPrinter: Printer | null
  printerList: Printer[]
}

interface PrinterActions {
  setCurrentPrinter: (printer: Printer) => void
  setPrinterList: (list: Printer[]) => void
  clearCurrentPrinter: () => void
}

type PrinterStore = PrinterState & PrinterActions

export const usePrinterStore = create<PrinterStore>()(
  persist(
    (set) => ({
      currentPrinter: null,
      printerList: [],

      setCurrentPrinter: (printer: Printer) => {
        set({ currentPrinter: printer })
      },

      setPrinterList: (list: Printer[]) => {
        set({ printerList: list })
      },

      clearCurrentPrinter: () => {
        set({ currentPrinter: null })
      },
    }),
    {
      name: 'h5_barcode_printer',
      partialize: (state) => ({
        currentPrinter: state.currentPrinter,
      }),
    }
  )
)

export default usePrinterStore
