import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Loading from './index'

describe('Loading 组件', () => {
  it('loading 为 false 时应该渲染子元素', () => {
    render(
      <Loading loading={false}>
        <div>内容</div>
      </Loading>
    )
    expect(screen.getByText('内容')).toBeDefined()
  })

  it('loading 为 true 时应该显示加载状态', () => {
    const { container } = render(
      <Loading loading={true}>
        <div>内容</div>
      </Loading>
    )
    // SpinLoading 组件会被渲染
    expect(container.querySelector('.adm-spin-loading')).toBeDefined()
  })

  it('fullscreen 模式应该使用 Mask', () => {
    const { container } = render(
      <Loading loading={true} fullscreen>
        <div>内容</div>
      </Loading>
    )
    expect(container.querySelector('.adm-mask')).toBeDefined()
  })
})
