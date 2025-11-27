// Storage 工具类 - 封装 localStorage 操作

const PREFIX = 'h5_barcode_'

/**
 * 获取存储的值
 */
export function getStorage<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(PREFIX + key)
    if (value === null) return null
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

/**
 * 设置存储的值
 */
export function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    console.error('Storage setItem error')
  }
}

/**
 * 移除存储的值
 */
export function removeStorage(key: string): void {
  localStorage.removeItem(PREFIX + key)
}

/**
 * 清空所有存储
 */
export function clearStorage(): void {
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith(PREFIX)) {
      localStorage.removeItem(key)
    }
  })
}

// Storage 工具类对象
export const storage = {
  get: getStorage,
  set: setStorage,
  remove: removeStorage,
  clear: clearStorage,
}

export default storage
