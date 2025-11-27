import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PageContainer from './index'

describe('PageContainer 组件', () => {
  it('应该渲染标题和内容', () => {
    render(
      <BrowserRouter>
        <PageContainer title="页面标题">
          <div>页面内容</div>
        </PageContainer>
      </BrowserRouter>
    )
    expect(screen.getByText('页面标题')).toBeDefined()
    expect(screen.getByText('页面内容')).toBeDefined()
  })

  it('应该渲染右侧内容', () => {
    render(
      <BrowserRouter>
        <PageContainer title="测试" right={<span>右侧</span>}>
          <div>内容</div>
        </PageContainer>
      </BrowserRouter>
    )
    expect(screen.getByText('右侧')).toBeDefined()
  })
})
