import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PrintInner from './index'

describe('打印内包装码页面', () => {
  it('应该渲染页面标题', () => {
    render(
      <BrowserRouter>
        <PrintInner />
      </BrowserRouter>
    )
    
    expect(screen.getByText('打印内包装码')).toBeDefined()
  })

  it('应该显示内包装码输入框', () => {
    render(
      <BrowserRouter>
        <PrintInner />
      </BrowserRouter>
    )
    
    expect(screen.getByPlaceholderText('请输入或扫描内包装码')).toBeDefined()
  })

  it('应该显示打印数量选择器', () => {
    render(
      <BrowserRouter>
        <PrintInner />
      </BrowserRouter>
    )
    
    expect(screen.getByText('打印数量')).toBeDefined()
  })
})
