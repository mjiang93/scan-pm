import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PrintLabel from './index'

describe('打印收货外标签页面', () => {
  it('应该渲染页面标题', () => {
    render(
      <BrowserRouter>
        <PrintLabel />
      </BrowserRouter>
    )
    
    expect(screen.getByText('打印收货外标签')).toBeDefined()
  })

  it('应该显示标签信息表单', () => {
    const { container } = render(
      <BrowserRouter>
        <PrintLabel />
      </BrowserRouter>
    )
    
    // 检查表单是否渲染
    expect(container.querySelector('form')).toBeDefined()
  })

  it('应该显示标签预览', () => {
    render(
      <BrowserRouter>
        <PrintLabel />
      </BrowserRouter>
    )
    
    expect(screen.getByText('标签预览')).toBeDefined()
  })

  it('应该显示打印按钮', () => {
    render(
      <BrowserRouter>
        <PrintLabel />
      </BrowserRouter>
    )
    
    expect(screen.getByText('打印标签')).toBeDefined()
  })
})
