import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { getStorage, setStorage, removeStorage, clearStorage } from './storage'

// **Feature: h5-barcode-print-system, Property 1: Storage 工具存取一致性（Round-Trip）**
// **Validates: Requirements 12.1**

describe('Storage 工具', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Property 1: Storage 工具存取一致性（Round-Trip）', () => {
    it('对于任意字符串值，存储后读取应返回相同的值', () => {
      fc.assert(
        fc.property(fc.string(), fc.string(), (key, value) => {
          setStorage(key, value)
          const result = getStorage<string>(key)
          return result === value
        }),
        { numRuns: 100 }
      )
    })

    it('对于任意数字值，存储后读取应返回相同的值', () => {
      fc.assert(
        fc.property(fc.string(), fc.integer(), (key, value) => {
          setStorage(key, value)
          const result = getStorage<number>(key)
          return result === value
        }),
        { numRuns: 100 }
      )
    })

    it('对于任意布尔值，存储后读取应返回相同的值', () => {
      fc.assert(
        fc.property(fc.string(), fc.boolean(), (key, value) => {
          setStorage(key, value)
          const result = getStorage<boolean>(key)
          return result === value
        }),
        { numRuns: 100 }
      )
    })

    it('对于任意对象，存储后读取应返回等价的对象', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.record({
            id: fc.string(),
            name: fc.string(),
            count: fc.integer(),
          }),
          (key, value) => {
            setStorage(key, value)
            const result = getStorage<typeof value>(key)
            return JSON.stringify(result) === JSON.stringify(value)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('对于任意数组，存储后读取应返回等价的数组', () => {
      fc.assert(
        fc.property(fc.string(), fc.array(fc.integer()), (key, value) => {
          setStorage(key, value)
          const result = getStorage<number[]>(key)
          return JSON.stringify(result) === JSON.stringify(value)
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('remove 和 clear 操作', () => {
    it('remove 后应返回 null', () => {
      fc.assert(
        fc.property(fc.string(), fc.string(), (key, value) => {
          setStorage(key, value)
          removeStorage(key)
          return getStorage(key) === null
        }),
        { numRuns: 100 }
      )
    })

    it('clear 后所有值应返回 null', () => {
      const keys = ['key1', 'key2', 'key3']
      keys.forEach((key, i) => setStorage(key, `value${i}`))
      clearStorage()
      return keys.every(key => getStorage(key) === null)
    })
  })

  describe('边界情况', () => {
    it('获取不存在的 key 应返回 null', () => {
      expect(getStorage('nonexistent')).toBeNull()
    })
  })
})
