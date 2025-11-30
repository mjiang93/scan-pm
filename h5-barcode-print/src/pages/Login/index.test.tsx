import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from './index'
import { useUserStore } from '@/stores'

vi.mock('@/services/auth')

describe('登录页', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const store = useUserStore.getState()
    store.logout()
  })

  it('应该渲染登录表单', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
    
    expect(screen.getByText('条码打印系统')).toBeDefined()
    expect(screen.getByPlaceholderText('请输入用户名')).toBeDefined()
    expect(screen.getByPlaceholderText('请输入密码')).toBeDefined()
    expect(screen.getByText('登录')).toBeDefined()
  })

  // 表单验证测试已通过工具函数的属性测试覆盖
})
