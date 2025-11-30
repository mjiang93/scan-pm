import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NavBar from './index'

describe('NavBar 组件', () => {
  it('应该渲染标题', () => {
    render(
      <BrowserRouter>
        <NavBar title="测试标题" />
      </BrowserRouter>
    )
    expect(screen.getByText('测试标题')).toBeDefined()
  })

  it('应该渲染右侧内容', () => {
    render(
      <BrowserRouter>
        <NavBar title="测试" right={<span>右侧</span>} />
      </BrowserRouter>
    )
    expect(screen.getByText('右侧')).toBeDefined()
  })
})
