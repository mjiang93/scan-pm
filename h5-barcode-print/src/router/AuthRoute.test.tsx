import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { render } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthRoute from './AuthRoute'
import { useUserStore } from '@/stores'

// **Feature: h5-barcode-print-system, Property 12: 路由守卫登录状态检查**
// **Validates: Requirements 14.2**

describe('路由守卫', () => {
  beforeEach(() => {
    const store = useUserStore.getState()
    store.logout()
  })

  describe('Property 12: 路由守卫登录状态检查', () => {
    it('对于任意 Token，已登录状态应允许访问受保护页面', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 10, maxLength: 100 }), (token) => {
          const store = useUserStore.getState()
          store.setToken(token)

          const { container } = render(
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AuthRoute />}>
                  <Route index element={<div>受保护的内容</div>} />
                </Route>
                <Route path="/login" element={<div>登录页</div>} />
              </Routes>
            </BrowserRouter>
          )

          const hasProtectedContent = container.textContent?.includes('受保护的内容')
          const hasLoginPage = container.textContent?.includes('登录页')

          // 已登录应该看到受保护内容，不应该看到登录页
          return hasProtectedContent === true && hasLoginPage === false
        }),
        { numRuns: 50 }
      )
    })

    it('未登录状态应重定向到登录页', () => {
      const store = useUserStore.getState()
      store.logout()

      const { container } = render(
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AuthRoute />}>
              <Route index element={<div>受保护的内容</div>} />
            </Route>
            <Route path="/login" element={<div>登录页</div>} />
          </Routes>
        </BrowserRouter>
      )

      // 未登录应该重定向到登录页
      expect(container.textContent).toContain('登录页')
      expect(container.textContent).not.toContain('受保护的内容')
    })
  })
})
