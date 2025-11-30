import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from './index'
import { useUserStore, usePrinterStore } from '@/stores'

vi.mock('@/services/printer')

describe('首页', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const userStore = useUserStore.getState()
    userStore.setToken('test-token')
    userStore.setUserInfo({
      id: '1',
      username: 'testuser',
      name: '测试用户',
      role: 'user',
    })
    
    const printerStore = usePrinterStore.getState()
    printerStore.clearCurrentPrinter()
    printerStore.setPrinterList([])
  })

  it('应该渲染页面标题', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    
    expect(screen.getByText('条码打印系统')).toBeDefined()
  })

  it('应该显示用户信息', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/测试用户/)).toBeDefined()
  })

  it('应该显示功能入口', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    
    expect(screen.getByText('扫码')).toBeDefined()
    expect(screen.getByText('打印本体码')).toBeDefined()
    expect(screen.getByText('打印内包装码')).toBeDefined()
    expect(screen.getByText('打印收货外标签')).toBeDefined()
  })

  it('应该显示打印机选择', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    
    expect(screen.getByText('当前打印机')).toBeDefined()
  })
})
