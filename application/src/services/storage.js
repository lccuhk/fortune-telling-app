const STORAGE_KEYS = {
  HISTORY: 'fortune_history',
  SETTINGS: 'fortune_settings',
  USER_PREFS: 'fortune_user_prefs',
  API_KEY: 'tanshu_api_key',
  DARK_MODE: 'darkMode'
}

const MAX_HISTORY_ITEMS = 50

function getStorage() {
  if (typeof localStorage === 'undefined') {
    return null
  }
  return localStorage
}

function get(key, defaultValue = null) {
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

function set(key, value) {
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

function remove(key) {
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

function clearAll() {
  const storage = getStorage()
  if (!storage) return false

  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      storage.removeItem(key)
    })
    return true
  } catch (error) {
    console.error('[Storage] 清空失败:', error)
    return false
  }
}

const historyService = {
  getAll() {
    return get(STORAGE_KEYS.HISTORY, [])
  },

  add(item) {
    const history = this.getAll()
    const newItem = {
      ...item,
      id: Date.now(),
      timestamp: new Date().toISOString()
    }

    history.unshift(newItem)

    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS)
    }

    set(STORAGE_KEYS.HISTORY, history)
    return newItem
  },

  getByType(type) {
    return this.getAll().filter(item => item.type === type)
  },

  getById(id) {
    return this.getAll().find(item => item.id === id)
  },

  remove(id) {
    const history = this.getAll().filter(item => item.id !== id)
    set(STORAGE_KEYS.HISTORY, history)
  },

  clear() {
    remove(STORAGE_KEYS.HISTORY)
  },

  getCount() {
    return this.getAll().length
  }
}

const settingsService = {
  get() {
    return get(STORAGE_KEYS.SETTINGS, {
      darkMode: false,
      notifications: true,
      sound: false,
      autoSave: true
    })
  },

  update(updates) {
    const current = this.get()
    const updated = { ...current, ...updates }
    set(STORAGE_KEYS.SETTINGS, updated)
    return updated
  },

  reset() {
    remove(STORAGE_KEYS.SETTINGS)
    return this.get()
  }
}

const userPrefsService = {
  get() {
    return get(STORAGE_KEYS.USER_PREFS, {
      defaultXingzuo: '',
      defaultGender: '男',
      defaultQuestionType: '综合',
      favoriteFeatures: []
    })
  },

  update(updates) {
    const current = this.get()
    const updated = { ...current, ...updates }
    set(STORAGE_KEYS.USER_PREFS, updated)
    return updated
  },

  addFavoriteFeature(feature) {
    const prefs = this.get()
    if (!prefs.favoriteFeatures.includes(feature)) {
      prefs.favoriteFeatures.push(feature)
      this.update(prefs)
    }
    return prefs.favoriteFeatures
  },

  removeFavoriteFeature(feature) {
    const prefs = this.get()
    prefs.favoriteFeatures = prefs.favoriteFeatures.filter(f => f !== feature)
    this.update(prefs)
    return prefs.favoriteFeatures
  }
}

const apiKeyService = {
  get() {
    const storage = getStorage()
    if (!storage) return ''
    return storage.getItem(STORAGE_KEYS.API_KEY) || ''
  },

  set(key) {
    const storage = getStorage()
    if (!storage) return false
    if (key && key.trim()) {
      storage.setItem(STORAGE_KEYS.API_KEY, key.trim())
      return true
    }
    return false
  },

  clear() {
    remove(STORAGE_KEYS.API_KEY)
  },

  isConfigured() {
    const key = this.get()
    return key && key !== 'YOUR_TANSHU_API_KEY' && key.trim() !== ''
  }
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

function getTypeLabel(type) {
  const labels = {
    bazi: '八字算命',
    xingzuo: '星座运势',
    jiemeng: '周公解梦',
    tarot: '塔罗牌',
    shengxiao: '生肖运势',
    xingming: '姓名学',
    ziwei: '紫微斗数',
    hepan: '多人合盘',
    huangli: '黄历',
    fortune: '传统算命'
  }
  return labels[type] || type
}

function getTypeIcon(type) {
  const icons = {
    bazi: '🎯',
    xingzuo: '♈',
    jiemeng: '💭',
    tarot: '🃏',
    shengxiao: '🐲',
    xingming: '📝',
    ziwei: '⭐',
    hepan: '💑',
    huangli: '📅',
    fortune: '🔮'
  }
  return icons[type] || '✨'
}

export const storageService = {
  get,
  set,
  remove,
  clearAll,
  history: historyService,
  settings: settingsService,
  userPrefs: userPrefsService,
  apiKey: apiKeyService,
  formatTimestamp,
  getTypeLabel,
  getTypeIcon,
  STORAGE_KEYS
}

export default storageService
