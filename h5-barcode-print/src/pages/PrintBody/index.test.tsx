import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PrintBody from './index'
import { usePrinterStore } from '@/stores'

describe('打印本体码页面', () => {
  beforeEach(() => {
    const store = usePrinterStore.getState()
    store.clearCurrentPrinter()
  })

  it('应该渲染页面标题', () => {
    render(
      <BrowserRouter>
        <PrintBody />
      </BrowserRouter>
    )
    
    expect(screen.getByText('打印本体码')).toBeDefined()
  })

  it('应该显示打印机信息', () => {
    const store = usePrinterStore.getState()
    store.setCurrentPrinter({
      id: '1',
      name: '测试打印机',
      ip: '192.168.1.100',
      port: 9100,
      status: 'online',
      type: 'body',
    })

    render(
      <BrowserRouter>
        <PrintBody />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/测试打印机/)).toBeDefined()
  })

  it('应该显示本体码输入框', () => {
    render(
      <BrowserRouter>
        <PrintBody />
      </BrowserRouter>
    )
    
    expect(screen.getByPlaceholderText('请输入或扫描本体码')).toBeDefined()
  })

  it('应该显示打印按钮', () => {
    render(
      <BrowserRouter>
        <PrintBody />
      </BrowserRouter>
    )
    
    expect(screen.getByText('打印')).toBeDefined()
  })
})
