import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useUserStore } from './userStore'
import type { UserInfo } from '@/types/user'

// **Feature: h5-barcode-print-system, Property 6: 用户状态管理一致性**
// **Validates: Requirements 13.2**

describe('userStore', () => {
  beforeEach(() => {
    const store = useUserStore.getState()
    store.logout()
  })

  describe('Property 6: 用户状态管理一致性', () => {
    it('对于任意 Token，设置后读取应返回相同的值', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 10, maxLength: 100 }), (token) => {
          const store = useUserStore.getState()
          store.setToken(token)
          
          const currentToken = useUserStore.getState().token
          return currentToken === token
        }),
        { numRuns: 100 }
      )
    })

    it('对于任意用户信息，设置后读取应返回相同的值', () => {
      const userInfoArb = fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }),
        username: fc.string({ minLength: 3, maxLength: 20 }),
        name: fc.string({ minLength: 1, maxLength: 50 }),
        role: fc.constantFrom('admin', 'user', 'operator'),
      })

      fc.assert(
        fc.property(userInfoArb, (userInfo) => {
          const store = useUserStore.getState()
          store.setUserInfo(userInfo as UserInfo)
          
          const currentUserInfo = useUserStore.getState().userInfo
          return JSON.stringify(currentUserInfo) === JSON.stringify(userInfo)
        }),
        { numRuns: 100 }
      )
    })

    it('设置 Token 后 isLoggedIn 应为 true', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 10, maxLength: 100 }), (token) => {
          const store = useUserStore.getState()
          store.setToken(token)
          
          return useUserStore.getState().isLoggedIn === true
        }),
        { numRuns: 100 }
      )
    })

    it('logout 后所有状态应重置', () => {
      const store = useUserStore.getState()
      store.setToken('test-token')
      store.setUserInfo({ id: '1', username: 'test', name: 'Test User', role: 'user' })
      
      store.logout()
      
      const state = useUserStore.getState()
      expect(state.token).toBeNull()
      expect(state.userInfo).toBeNull()
      expect(state.isLoggedIn).toBe(false)
    })
  })
})
