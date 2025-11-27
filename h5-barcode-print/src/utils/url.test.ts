import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { parseQuery, buildQuery } from './url'

// **Feature: h5-barcode-print-system, Property 5: URL 参数解析/构建一致性（Round-Trip）**
// **Validates: Requirements 12.4**

describe('URL 参数工具', () => {
  describe('Property 5: URL 参数解析/构建一致性（Round-Trip）', () => {
    it('构建后解析应返回等价的参数对象', () => {
      // 生成简单的键值对（避免特殊字符导致的编码问题）
      const simpleStringArb = fc.string({ minLength: 1, maxLength: 20, unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')) })
      const paramsArb = fc.dictionary(simpleStringArb, simpleStringArb, { minKeys: 1, maxKeys: 5 })

      fc.assert(
        fc.property(paramsArb, (params) => {
          const queryString = buildQuery(params)
          const parsed = parseQuery(queryString)
          
          // 验证所有原始键值对都存在于解析结果中
          return Object.entries(params).every(([key, value]) => {
            return parsed[key] === value
          })
        }),
        { numRuns: 100 }
      )
    })

    it('解析后构建应返回等价的查询字符串', () => {
      const simpleStringArb = fc.string({ minLength: 1, maxLength: 20, unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')) })
      const paramsArb = fc.dictionary(simpleStringArb, simpleStringArb, { minKeys: 1, maxKeys: 5 })

      fc.assert(
        fc.property(paramsArb, (params) => {
          const queryString1 = buildQuery(params)
          const parsed = parseQuery(queryString1)
          const queryString2 = buildQuery(parsed)
          
          // 再次解析应该得到相同结果
          const parsed2 = parseQuery(queryString2)
          return JSON.stringify(parsed) === JSON.stringify(parsed2)
        }),
        { numRuns: 100 }
      )
    })

    it('带有数字值的参数应正确处理', () => {
      fc.assert(
        fc.property(
          fc.record({
            page: fc.integer({ min: 1, max: 100 }),
            size: fc.integer({ min: 10, max: 50 }),
          }),
          (params) => {
            const queryString = buildQuery(params)
            const parsed = parseQuery(queryString)
            
            return parsed['page'] === String(params.page) &&
                   parsed['size'] === String(params.size)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('边界情况', () => {
    it('空字符串应返回空对象', () => {
      expect(parseQuery('')).toEqual({})
    })

    it('带 ? 前缀的查询字符串应正确解析', () => {
      expect(parseQuery('?foo=bar')).toEqual({ foo: 'bar' })
    })

    it('空值参数应被过滤', () => {
      const result = buildQuery({ a: 'value', b: null, c: undefined, d: '' })
      expect(result).toBe('a=value')
    })

    it('特殊字符应正确编码和解码', () => {
      const params = { name: '张三', city: '北京' }
      const queryString = buildQuery(params)
      const parsed = parseQuery(queryString)
      expect(parsed).toEqual({ name: '张三', city: '北京' })
    })
  })
})
