import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { isPhone, isBarcode, isEmpty, isInRange, isPrintQuantityValid } from './validate'

// **Feature: h5-barcode-print-system, Property 3: 验证工具正确性 - 手机号验证**
// **Feature: h5-barcode-print-system, Property 4: 验证工具正确性 - 条码格式验证**
// **Feature: h5-barcode-print-system, Property 8: 表单验证 - 空值检测**
// **Feature: h5-barcode-print-system, Property 9: 打印数量范围验证**
// **Validates: Requirements 12.3, 7.2, 3.2, 8.2**

describe('验证工具函数', () => {
  describe('Property 3: 手机号验证', () => {
    it('符合格式的手机号应返回 true', () => {
      // 生成有效手机号：1开头 + 3-9 + 9位数字
      const digitArb = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9')
      const validPhoneArb = fc.tuple(
        fc.constantFrom('3', '4', '5', '6', '7', '8', '9'),
        fc.array(digitArb, { minLength: 9, maxLength: 9 })
      ).map(([second, rest]) => `1${second}${rest.join('')}`)

      fc.assert(
        fc.property(validPhoneArb, (phone) => {
          return isPhone(phone) === true
        }),
        { numRuns: 100 }
      )
    })

    it('不符合格式的字符串应返回 false', () => {
      // 生成无效手机号
      const invalidPhoneArb = fc.oneof(
        fc.string({ minLength: 0, maxLength: 10 }), // 长度不对
        fc.string({ minLength: 12, maxLength: 20 }), // 长度不对
        fc.array(fc.constantFrom('a', 'b', 'c'), { minLength: 11, maxLength: 11 }).map(arr => arr.join('')) // 非数字
      )

      fc.assert(
        fc.property(invalidPhoneArb, (phone) => {
          return isPhone(phone) === false
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 4: 条码格式验证', () => {
    it('符合格式的条码应返回 true', () => {
      const alphanumericChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('')
      const validBarcodeArb = fc.array(
        fc.constantFrom(...alphanumericChars),
        { minLength: 6, maxLength: 50 }
      ).map(arr => arr.join(''))

      fc.assert(
        fc.property(validBarcodeArb, (barcode) => {
          return isBarcode(barcode) === true
        }),
        { numRuns: 100 }
      )
    })

    it('长度不符合的条码应返回 false', () => {
      const alphanumericChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('')
      const shortBarcodeArb = fc.array(fc.constantFrom(...alphanumericChars), { minLength: 1, maxLength: 5 }).map(arr => arr.join(''))
      const longBarcodeArb = fc.array(fc.constantFrom(...alphanumericChars), { minLength: 51, maxLength: 60 }).map(arr => arr.join(''))

      fc.assert(
        fc.property(shortBarcodeArb, (barcode) => {
          return isBarcode(barcode) === false
        }),
        { numRuns: 100 }
      )

      fc.assert(
        fc.property(longBarcodeArb, (barcode) => {
          return isBarcode(barcode) === false
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 8: 表单验证 - 空值检测', () => {
    it('纯空白字符串应判定为空', () => {
      const whitespaceArb = fc.array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 0, maxLength: 20 }).map(arr => arr.join(''))

      fc.assert(
        fc.property(whitespaceArb, (str) => {
          return isEmpty(str) === true
        }),
        { numRuns: 100 }
      )
    })

    it('非空字符串应判定为非空', () => {
      const nonEmptyArb = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)

      fc.assert(
        fc.property(nonEmptyArb, (str) => {
          return isEmpty(str) === false
        }),
        { numRuns: 100 }
      )
    })

    it('null 和 undefined 应判定为空', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
    })

    it('空数组应判定为空', () => {
      expect(isEmpty([])).toBe(true)
    })

    it('空对象应判定为空', () => {
      expect(isEmpty({})).toBe(true)
    })
  })

  describe('Property 9: 打印数量范围验证', () => {
    it('1-999 范围内的整数应返回 true', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 999 }), (num) => {
          return isPrintQuantityValid(num) === true
        }),
        { numRuns: 100 }
      )
    })

    it('范围外的数值应返回 false', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ min: -1000, max: 0 }),
            fc.integer({ min: 1000, max: 10000 })
          ),
          (num) => {
            return isPrintQuantityValid(num) === false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('非整数应返回 false', () => {
      fc.assert(
        fc.property(fc.double({ min: 1.1, max: 998.9 }), (num) => {
          if (Number.isInteger(num)) return true // 跳过整数
          return isPrintQuantityValid(num) === false
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('isInRange 通用范围验证', () => {
    it('范围内的值应返回 true', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: 1000 }),
          fc.integer({ min: -1000, max: 1000 }),
          (min, max) => {
            if (min > max) [min, max] = [max, min]
            const value = Math.floor((min + max) / 2)
            return isInRange(value, min, max) === true
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
