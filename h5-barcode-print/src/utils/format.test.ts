import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { formatDate, formatTime, formatDateTime } from './format'

// **Feature: h5-barcode-print-system, Property 2: 日期格式化正确性**
// **Validates: Requirements 12.2**

describe('日期格式化工具', () => {
  describe('Property 2: 日期格式化正确性', () => {
    it('格式化后的字符串应包含正确的年份', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }),
          (date) => {
            const result = formatDate(date, 'YYYY-MM-DD')
            const year = date.getFullYear().toString()
            return result.includes(year)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('格式化后的字符串应包含正确的月份（补零）', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }).filter(d => !isNaN(d.getTime())),
          (date) => {
            const result = formatDate(date, 'YYYY-MM-DD')
            const month = (date.getMonth() + 1).toString().padStart(2, '0')
            return result.includes(month)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('格式化后的字符串应包含正确的日期（补零）', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }),
          (date) => {
            const result = formatDate(date, 'YYYY-MM-DD')
            const day = date.getDate().toString().padStart(2, '0')
            return result.includes(day)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('formatDateTime 应包含时分秒', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }).filter(d => !isNaN(d.getTime())),
          (date) => {
            const result = formatDateTime(date)
            const hours = date.getHours().toString().padStart(2, '0')
            const minutes = date.getMinutes().toString().padStart(2, '0')
            const seconds = date.getSeconds().toString().padStart(2, '0')
            return result.includes(hours) && result.includes(minutes) && result.includes(seconds)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('formatTime 应返回 HH:mm:ss 格式', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }).filter(d => !isNaN(d.getTime())),
          (date) => {
            const result = formatTime(date)
            return /^\d{2}:\d{2}:\d{2}$/.test(result)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('边界情况', () => {
    it('无效日期应返回空字符串', () => {
      expect(formatDate('invalid')).toBe('')
      expect(formatDate(NaN)).toBe('')
    })

    it('时间戳应正确格式化', () => {
      const timestamp = new Date('2024-06-15T10:30:00').getTime()
      expect(formatDate(timestamp, 'YYYY-MM-DD')).toBe('2024-06-15')
    })
  })
})
