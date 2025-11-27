// 日期格式化工具

/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param format 格式字符串，支持 YYYY MM DD HH mm ss
 */
export function formatDate(
  date: Date | number | string,
  format: string = 'YYYY-MM-DD'
): string {
  const d = date instanceof Date ? date : new Date(date)
  
  if (isNaN(d.getTime())) {
    return ''
  }

  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const seconds = d.getSeconds()

  const padZero = (num: number): string => num.toString().padStart(2, '0')

  return format
    .replace('YYYY', year.toString())
    .replace('MM', padZero(month))
    .replace('DD', padZero(day))
    .replace('HH', padZero(hours))
    .replace('mm', padZero(minutes))
    .replace('ss', padZero(seconds))
}

/**
 * 格式化时间 HH:mm:ss
 */
export function formatTime(date: Date | number | string): string {
  return formatDate(date, 'HH:mm:ss')
}

/**
 * 格式化日期时间 YYYY-MM-DD HH:mm:ss
 */
export function formatDateTime(date: Date | number | string): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}

/**
 * 获取相对时间描述
 */
export function getRelativeTime(date: Date | number | string): string {
  const d = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return formatDate(d)
  }
}
