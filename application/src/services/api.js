function getStoredApiKey() {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('tanshu_api_key')
    if (stored && stored.trim() && stored !== 'YOUR_TANSHU_API_KEY') {
      return stored.trim()
    }
  }
  return 'YOUR_TANSHU_API_KEY'
}

const API_CONFIG = {
  tanshu: {
    baseUrl: 'https://api.tanshuapi.com/api',
    key: getStoredApiKey(),
    timeout: 10000
  }
}

const xingzuoMap = {
  白羊座: 1,
  金牛座: 2,
  双子座: 3,
  巨蟹座: 4,
  狮子座: 5,
  处女座: 6,
  天秤座: 7,
  天蝎座: 8,
  射手座: 9,
  摩羯座: 10,
  水瓶座: 11,
  双鱼座: 12
}

const timeTypeMap = {
  今日: 'today',
  明日: 'tomorrow',
  本周: 'week',
  本月: 'month',
  本年: 'year'
}

const errorMessages = {
  network: '网络连接失败，请检查您的网络设置',
  timeout: '请求超时，请稍后重试',
  invalidKey: 'API Key 无效，请检查您的配置',
  quotaExceeded: 'API 调用次数已用完，请升级套餐',
  serverError: '服务器暂时不可用，请稍后重试',
  unknown: '请求失败，请稍后重试'
}

function showError(message) {
  console.error('[API Error]', message)
  if (typeof alert === 'function') {
    alert(message)
  }
}

function createTimeoutPromise(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('timeout'))
    }, ms)
  })
}

async function request(url, params = {}) {
  const queryString = new URLSearchParams(params).toString()
  const fullUrl = queryString ? `${url}?${queryString}` : url

  console.log('[API] 请求 URL:', fullUrl)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.tanshu.timeout)

    const response = await Promise.race([
      fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      }),
      createTimeoutPromise(API_CONFIG.tanshu.timeout)
    ])

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('invalidKey')
      } else if (response.status === 429) {
        throw new Error('quotaExceeded')
      } else if (response.status >= 500) {
        throw new Error('serverError')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('[API] 响应数据:', data)

    if (data && data.code !== undefined && data.code !== 1) {
      throw new Error(data.msg || 'API 返回错误')
    }

    return data
  } catch (error) {
    console.error('[API] 请求异常:', error)

    let userMessage = errorMessages.unknown

    if (error.message === 'timeout' || error.name === 'AbortError') {
      userMessage = errorMessages.timeout
    } else if (error.message === 'invalidKey') {
      userMessage = errorMessages.invalidKey
    } else if (error.message === 'quotaExceeded') {
      userMessage = errorMessages.quotaExceeded
    } else if (error.message === 'serverError') {
      userMessage = errorMessages.serverError
    } else if (error.message && error.message.includes('NetworkError')) {
      userMessage = errorMessages.network
    } else if (error.message) {
      userMessage = error.message
    }

    showError(userMessage)
    throw new Error(userMessage)
  }
}

export const tanshuApi = {
  async getConstellationList() {
    try {
      const url = `${API_CONFIG.tanshu.baseUrl}/constellation/v1/list`
      const params = {
        key: API_CONFIG.tanshu.key
      }
      return await request(url, params)
    } catch (error) {
      throw error
    }
  },

  async getConstellationFortune(xingzuoName, timeRange = '今日') {
    try {
      console.log('[API] 调用星座运势:', { xingzuoName, timeRange })

      if (!xingzuoName) {
        throw new Error('请选择您的星座')
      }

      const cid = xingzuoMap[xingzuoName]
      if (!cid) {
        throw new Error(`未知的星座: ${xingzuoName}`)
      }

      const validTimeRanges = ['今日', '明日', '本周', '本月', '本年']
      const normalizedTimeRange = validTimeRanges.includes(timeRange) ? timeRange : '今日'
      const type = timeTypeMap[normalizedTimeRange] || 'today'

      console.log('[API] 转换后的参数:', { cid, type, normalizedTimeRange })

      const url = `${API_CONFIG.tanshu.baseUrl}/constellation/v1/index`
      const params = {
        key: API_CONFIG.tanshu.key,
        cid: cid,
        type: type
      }

      return await request(url, params)
    } catch (error) {
      throw error
    }
  },

  async getDreamInterpretation(keyword) {
    try {
      if (!keyword || !keyword.trim()) {
        throw new Error('请输入梦境关键词')
      }

      const url = `${API_CONFIG.tanshu.baseUrl}/dream/v1/index`
      const params = {
        key: API_CONFIG.tanshu.key,
        keyword: keyword.trim()
      }
      return await request(url, params)
    } catch (error) {
      throw error
    }
  },

  async getDreamCategories() {
    try {
      const url = `${API_CONFIG.tanshu.baseUrl}/dream/v1/type`
      const params = {
        key: API_CONFIG.tanshu.key
      }
      return await request(url, params)
    } catch (error) {
      throw error
    }
  },

  async getHuangli(date = null) {
    try {
      const url = `${API_CONFIG.tanshu.baseUrl}/huangli/v1/index`
      const params = {
        key: API_CONFIG.tanshu.key
      }
      if (date) {
        params.date = date
      }
      return await request(url, params)
    } catch (error) {
      throw error
    }
  },

  async getJiXiong(type, value) {
    try {
      if (!type || !value) {
        throw new Error('请输入完整的测试信息')
      }

      const url = `${API_CONFIG.tanshu.baseUrl}/jixiong/v1/index`
      const params = {
        key: API_CONFIG.tanshu.key,
        type: type,
        value: value
      }
      return await request(url, params)
    } catch (error) {
      throw error
    }
  },

  setApiKey(key) {
    if (key && key.trim()) {
      API_CONFIG.tanshu.key = key.trim()
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('tanshu_api_key', key.trim())
      }
      console.log('[API] API Key 已更新')
    }
  },

  getApiKey() {
    return API_CONFIG.tanshu.key
  },

  isConfigured() {
    return (
      API_CONFIG.tanshu.key &&
      API_CONFIG.tanshu.key !== 'YOUR_TANSHU_API_KEY' &&
      API_CONFIG.tanshu.key.trim() !== ''
    )
  }
}

export function transformConstellationData(apiData, timeRange) {
  if (!apiData || apiData.code !== 1 || !apiData.data) {
    console.warn('[API] 数据转换失败: 无效的 API 响应')
    return null
  }

  const data = apiData.data

  if (timeRange === '今日' || timeRange === '明日') {
    return {
      name: data.name,
      friend: data.friend,
      color: data.color,
      date: data.date,
      datetime: data.datetime,
      scores: {
        overall: parseInt(data.all) || 0,
        love: parseInt(data.love) || 0,
        career: parseInt(data.work) || 0,
        wealth: parseInt(data.money) || 0,
        health: parseInt(data.health) || 0
      },
      luckyItems: [
        { type: '数字', value: data.number },
        { type: '颜色', value: data.color }
      ],
      summary: data.summary
    }
  } else if (timeRange === '本周') {
    return {
      name: data.name,
      date: data.date,
      weekth: data.weekth,
      scores: {
        overall: 75,
        love: 70,
        career: 75,
        wealth: 70,
        health: 75
      },
      analysis: {
        health: data.health,
        love: data.love,
        money: data.money,
        work: data.work
      }
    }
  } else if (timeRange === '本月') {
    return {
      name: data.name,
      date: data.date,
      month: data.month,
      scores: {
        overall: 75,
        love: 70,
        career: 75,
        wealth: 70,
        health: 75
      },
      analysis: {
        all: data.all,
        health: data.health,
        love: data.love,
        money: data.money,
        work: data.work
      }
    }
  } else if (timeRange === '本年') {
    return {
      name: data.name,
      date: data.date,
      year: data.year,
      luckyStone: data.luckey_stone,
      mimaInfo: data.mima_info,
      mimaText: data.mima_text,
      scores: {
        overall: 75,
        love: 70,
        career: 75,
        wealth: 70,
        health: 75
      },
      analysis: {
        career: data.career,
        love: data.love,
        health: data.health,
        finance: data.finance
      }
    }
  }

  return data
}

export default {
  tanshuApi,
  transformConstellationData
}
