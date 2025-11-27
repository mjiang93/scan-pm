import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Empty from './index'

describe('Empty 组件', () => {
  it('应该渲染默认描述', () => {
    render(<Empty />)
    expect(screen.getByText('暂无数据')).toBeDefined()
  })

  it('应该渲染自定义描述', () => {
    render(<Empty description="自定义描述" />)
    expect(screen.getByText('自定义描述')).toBeDefined()
  })

  it('应该渲染子元素', () => {
    render(
      <Empty>
        <button>操作按钮</button>
      </Empty>
    )
    expect(screen.getByText('操作按钮')).toBeDefined()
  })
})
