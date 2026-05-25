export function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateTime(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function getLogTimestamp() {
  const now = new Date()
  const isoString = now.toISOString()
  return isoString.replace('T', ' ').replace('Z', '')
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export function throttle(fn, delay = 300) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item))
  }

  const cloned = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }

  return cloned
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function getStorage() {
  if (typeof localStorage === 'undefined') {
    return null
  }
  return localStorage
}

export function storageGet(key, defaultValue = null) {
  const storage = getStorage()
  if (!storage) return defaultValue

  try {
    const value = storage.getItem(key)
    if (value === null) return defaultValue
    return JSON.parse(value)
  } catch (error) {
    console.error('[Storage] 读取失败:', key, error)
    return defaultValue
  }
}

export function storageSet(key, value) {
  const storage = getStorage()
  if (!storage) return false

  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error('[Storage] 写入失败:', key, error)
    return false
  }
}

export function storageRemove(key) {
  const storage = getStorage()
  if (!storage) return false

  try {
    storage.removeItem(key)
    return true
  } catch (error) {
    console.error('[Storage] 删除失败:', key, error)
    return false
  }
}

export const logger = {
  log: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
  info: (...args) => console.info(...args),
  debug: (...args) => console.debug(...args)
}
