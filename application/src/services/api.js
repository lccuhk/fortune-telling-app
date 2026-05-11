const API_CONFIG = {
  tanshu: {
    baseUrl: 'https://api.tanshuapi.com/api',
    key: 'YOUR_TANSHU_API_KEY'
  }
}

const xingzuoMap = {
  '白羊座': 1,
  '金牛座': 2,
  '双子座': 3,
  '巨蟹座': 4,
  '狮子座': 5,
  '处女座': 6,
  '天秤座': 7,
  '天蝎座': 8,
  '射手座': 9,
  '摩羯座': 10,
  '水瓶座': 11,
  '双鱼座': 12
}

const timeTypeMap = {
  '今日': 'today',
  '明日': 'tomorrow',
  '本周': 'week',
  '本月': 'month',
  '本年': 'year'
}

async function request(url, params = {}) {
  const queryString = new URLSearchParams(params).toString()
  const fullUrl = queryString ? `${url}?${queryString}` : url
  
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('API 请求失败:', error)
    throw error
  }
}

export const tanshuApi = {
  async getConstellationList() {
    const url = `${API_CONFIG.tanshu.baseUrl}/constellation/v1/list`
    const params = {
      key: API_CONFIG.tanshu.key
    }
    return request(url, params)
  },

  async getConstellationFortune(xingzuoName, timeRange = '今日') {
    const cid = xingzuoMap[xingzuoName]
    if (!cid) {
      throw new Error(`未知的星座: ${xingzuoName}`)
    }
    
    const type = timeTypeMap[timeRange] || 'today'
    
    const url = `${API_CONFIG.tanshu.baseUrl}/constellation/v1/index`
    const params = {
      key: API_CONFIG.tanshu.key,
      cid: cid,
      type: type
    }
    
    return request(url, params)
  },

  async getDreamInterpretation(keyword) {
    const url = `${API_CONFIG.tanshu.baseUrl}/dream/v1/index`
    const params = {
      key: API_CONFIG.tanshu.key,
      keyword: keyword
    }
    return request(url, params)
  },

  async getDreamCategories() {
    const url = `${API_CONFIG.tanshu.baseUrl}/dream/v1/type`
    const params = {
      key: API_CONFIG.tanshu.key
    }
    return request(url, params)
  },

  async getHuangli(date = null) {
    const url = `${API_CONFIG.tanshu.baseUrl}/huangli/v1/index`
    const params = {
      key: API_CONFIG.tanshu.key
    }
    if (date) {
      params.date = date
    }
    return request(url, params)
  },

  async getJiXiong(type, value) {
    const url = `${API_CONFIG.tanshu.baseUrl}/jixiong/v1/index`
    const params = {
      key: API_CONFIG.tanshu.key,
      type: type,
      value: value
    }
    return request(url, params)
  },

  setApiKey(key) {
    API_CONFIG.tanshu.key = key
  },

  getApiKey() {
    return API_CONFIG.tanshu.key
  }
}

export function transformConstellationData(apiData, timeRange) {
  if (!apiData || apiData.code !== 1 || !apiData.data) {
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
