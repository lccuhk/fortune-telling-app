import { computed } from 'vue'
import { useFortune } from './useFortune.js'
import { getRandomItem, getRandomNumber, delay } from '../utils/helpers.js'

export function useShengxiao() {
  const { loading, result, reset, executeFortune } = useFortune()

  const shengxiaoList = [
    { name: '鼠', emoji: '🐭', years: '2020, 2008, 1996, 1984, 1972, 1960' },
    { name: '牛', emoji: '🐮', years: '2021, 2009, 1997, 1985, 1973, 1961' },
    { name: '虎', emoji: '🐯', years: '2022, 2010, 1998, 1986, 1974, 1962' },
    { name: '兔', emoji: '🐰', years: '2023, 2011, 1999, 1987, 1975, 1963' },
    { name: '龙', emoji: '🐲', years: '2024, 2012, 2000, 1988, 1976, 1964' },
    { name: '蛇', emoji: '🐍', years: '2025, 2013, 2001, 1989, 1977, 1965' },
    { name: '马', emoji: '🐴', years: '2026, 2014, 2002, 1990, 1978, 1966' },
    { name: '羊', emoji: '🐑', years: '2027, 2015, 2003, 1991, 1979, 1967' },
    { name: '猴', emoji: '🐵', years: '2028, 2016, 2004, 1992, 1980, 1968' },
    { name: '鸡', emoji: '🐔', years: '2029, 2017, 2005, 1993, 1981, 1969' },
    { name: '狗', emoji: '🐶', years: '2030, 2018, 2006, 1994, 1982, 1970' },
    { name: '猪', emoji: '🐷', years: '2031, 2019, 2007, 1995, 1983, 1971' }
  ]

  const questionTypes = ['年度运势', '财运', '感情', '事业', '健康', '贵人运']

  const hasResult = computed(() => result.value !== null)

  function generateShengxiaoFortune(shengxiao, questionType) {
    const scores = {
      overall: getRandomNumber(60, 99),
      career: getRandomNumber(60, 99),
      wealth: getRandomNumber(60, 99),
      love: getRandomNumber(60, 99),
      health: getRandomNumber(60, 99)
    }

    const yiList = ['结婚', '搬家', '开业', '签约', '出行', '求职', '投资', '学习']
    const jiList = ['争吵', '借贷', '冒险', '冲动消费', '熬夜', '拖延']

    return {
      shengxiao,
      questionType,
      scores,
      yi: yiList.slice(0, 4),
      ji: jiList.slice(0, 3),
      luckyNumber: getRandomNumber(1, 99),
      luckyColor: getRandomItem(['红色', '金色', '绿色', '蓝色', '紫色']),
      luckyDirection: getRandomItem(['东南', '西北', '正南', '正北', '西南']),
      analysis: `${shengxiao.name}年生肖的朋友，今年整体运势${scores.overall >= 80 ? '相当不错' : scores.overall >= 70 ? '较为平稳' : '需要多加注意'}。事业上${scores.career >= 80 ? '有贵人相助，升职加薪的机会较多' : '需要脚踏实地，稳扎稳打'}。财运方面${scores.wealth >= 80 ? '正财偏财都有收获' : '宜守不宜攻，理性投资'}。感情${scores.love >= 80 ? '甜蜜美满，单身者有望脱单' : '需要多沟通理解'}。健康方面${scores.health >= 80 ? '状态良好' : '要注意劳逸结合'}。`
    }
  }

  async function getShengxiaoFortune(shengxiao, questionType) {
    return executeFortune(async () => {
      await delay(1500)
      return generateShengxiaoFortune(shengxiao, questionType)
    })
  }

  return {
    loading,
    result,
    shengxiaoList,
    questionTypes,
    hasResult,
    getShengxiaoFortune,
    reset
  }
}

export function useXingming() {
  const { loading, result, reset, executeFortune } = useFortune()

  const genders = ['男', '女']
  const hasResult = computed(() => result.value !== null)

  function getLuckLevel(num) {
    if (num >= 15) return { level: '大吉', color: '#16a34a' }
    if (num >= 10) return { level: '吉', color: '#22c55e' }
    if (num >= 6) return { level: '中', color: '#eab308' }
    return { level: '凶', color: '#dc2626' }
  }

  function generateXingmingAnalysis(surname, name, gender) {
    const tiange = getRandomNumber(1, 20)
    const renge = getRandomNumber(1, 20)
    const dige = getRandomNumber(1, 20)
    const waige = getRandomNumber(1, 20)
    const zongge = tiange + renge + dige

    return {
      fullName: surname + name,
      gender,
      wuge: {
        tiange: { num: tiange, ...getLuckLevel(tiange) },
        renge: { num: renge, ...getLuckLevel(renge) },
        dige: { num: dige, ...getLuckLevel(dige) },
        waige: { num: waige, ...getLuckLevel(waige) },
        zongge: { num: zongge, ...getLuckLevel(zongge) }
      },
      analysis: {
        personality: `您的名字五格中，人格数为${renge}，代表${renge >= 10 ? '性格稳重，做事有条理，能够得到他人的信任和支持' : '性格较为急躁，需要多加磨练，学会控制情绪'}。`,
        career: `地格数为${dige}，对事业发展${dige >= 10 ? '非常有利，适合从事管理或专业技术工作' : '有一定挑战，需要脚踏实地，循序渐进'}。`,
        relationship: `外格数为${waige}，人际关系${waige >= 10 ? '良好，容易结交贵人，得到他人帮助' : '需要多加维护，注意与人沟通的方式方法'}。`,
        overall: `总格数为${zongge}，整体运势${zongge >= 25 ? '极佳，一生顺遂，事业有成' : zongge >= 15 ? '较好，只要努力就能有所成就' : '平平，需要付出更多努力'}。`
      }
    }
  }

  async function getXingmingAnalysis(surname, name, gender) {
    return executeFortune(async () => {
      await delay(1500)
      return generateXingmingAnalysis(surname, name, gender)
    })
  }

  return {
    loading,
    result,
    genders,
    hasResult,
    getXingmingAnalysis,
    reset
  }
}

export function useBazi() {
  const { loading, result, reset, executeFortune } = useFortune()

  const tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

  const tianganWuxing = {
    甲: '木',
    乙: '木',
    丙: '火',
    丁: '火',
    戊: '土',
    己: '土',
    庚: '金',
    辛: '金',
    壬: '水',
    癸: '水'
  }

  const dizhiWuxing = {
    子: '水',
    丑: '土',
    寅: '木',
    卯: '木',
    辰: '土',
    巳: '火',
    午: '火',
    未: '土',
    申: '金',
    酉: '金',
    戌: '土',
    亥: '水'
  }

  const dizhiShengxiao = {
    子: '鼠',
    丑: '牛',
    寅: '虎',
    卯: '兔',
    辰: '龙',
    巳: '蛇',
    午: '马',
    未: '羊',
    申: '猴',
    酉: '鸡',
    戌: '狗',
    亥: '猪'
  }

  const wuxingColors = {
    金: '#f59e0b',
    木: '#22c55e',
    水: '#3b82f6',
    火: '#ef4444',
    土: '#a16207'
  }

  const wuxingEmojis = {
    金: '⚔️',
    木: '🌲',
    水: '💧',
    火: '🔥',
    土: '🏔️'
  }

  const shishen = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印']
  const questionTypes = ['综合', '事业', '财运', '感情', '健康', '性格']
  const genders = ['男', '女']

  const hasResult = computed(() => result.value !== null)

  function generateBazi() {
    return {
      year: { tg: getRandomItem(tiangan), dz: getRandomItem(dizhi) },
      month: { tg: getRandomItem(tiangan), dz: getRandomItem(dizhi) },
      day: { tg: getRandomItem(tiangan), dz: getRandomItem(dizhi) },
      hour: { tg: getRandomItem(tiangan), dz: getRandomItem(dizhi) }
    }
  }

  function calculateWuxingCount(bazi) {
    const counts = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 }
    const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour]

    pillars.forEach(pillar => {
      counts[tianganWuxing[pillar.tg]]++
      counts[dizhiWuxing[pillar.dz]]++
    })

    return counts
  }

  function getMainWuxing(counts) {
    let max = 0
    let main = '土'

    Object.entries(counts).forEach(([wuxing, count]) => {
      if (count > max) {
        max = count
        main = wuxing
      }
    })

    return main
  }

  function getWuxingBalance(counts) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    const avg = total / 5

    const balance = {}
    Object.entries(counts).forEach(([wuxing, count]) => {
      const diff = count - avg
      if (diff > 1) {
        balance[wuxing] = '过旺'
      } else if (diff < -1) {
        balance[wuxing] = '偏弱'
      } else {
        balance[wuxing] = '平衡'
      }
    })

    return balance
  }

  function generateAnalysis(bazi, wuxingCounts, mainWuxing, balance, questionType) {
    const dayTG = bazi.day.tg
    const dayDZ = bazi.day.dz
    const dayWuxing = tianganWuxing[dayTG]

    const templates = {
      综合: [
        `您的日主为${dayTG}${dayDZ}，五行属${dayWuxing}。${dayTG}日出生的人，性格${dayTG === '甲' ? '正直刚强，有领导才能' : dayTG === '乙' ? '温柔善良，善于协调' : dayTG === '丙' ? '热情开朗，积极向上' : dayTG === '丁' ? '细腻敏感，富有艺术气息' : dayTG === '戊' ? '稳重踏实，值得信赖' : dayTG === '己' ? '包容大度，有耐心' : dayTG === '庚' ? '果断坚决，讲义气' : dayTG === '辛' ? '精致细腻，追求完美' : dayTG === '壬' ? '聪明灵活，善于变通' : '智慧深沉，有谋略'}。`,
        `从五行来看，您的${mainWuxing}${wuxingEmojis[mainWuxing]}最为旺盛，这意味着您在${mainWuxing === '金' ? '决断力和执行力' : mainWuxing === '木' ? '创造力和成长力' : mainWuxing === '水' ? '智慧和适应力' : mainWuxing === '火' ? '热情和表现力' : '稳定性和包容力'}方面具有天赋。`,
        `整体命格${Object.values(balance).every(b => b === '平衡') ? '五行平衡，命格清奇' : '五行有偏，需要注意调和'}。建议在日常生活中多关注${Object.entries(balance).find(([_, b]) => b === '偏弱')?.[0] || '各方面'}的补充。`
      ],
      事业: [
        `您的事业运势${mainWuxing === '金' || mainWuxing === '火' ? '较为强劲' : '平稳发展'}。${dayTG}日出生的人在事业上${dayTG === '甲' || dayTG === '庚' ? '适合担任领导职务' : dayTG === '丙' || dayTG === '丁' ? '适合从事创意或服务行业' : '适合稳定发展的职业'}。`,
        `从八字来看，您在${bazi.year.tg === '庚' || bazi.year.tg === '辛' ? '金融、法律' : bazi.year.tg === '甲' || bazi.year.tg === '乙' ? '教育、文化' : bazi.year.tg === '丙' || bazi.year.tg === '丁' ? '媒体、艺术' : bazi.year.tg === '壬' || bazi.year.tg === '癸' ? '科研、技术' : '房地产、建筑'}等领域会有较好的发展。`,
        `建议：在工作中多发挥${dayWuxing}的特质，${dayWuxing === '金' ? '果断决策' : dayWuxing === '木' ? '创新思维' : dayWuxing === '水' ? '灵活应变' : dayWuxing === '火' ? '热情投入' : '稳重踏实'}，会有意想不到的收获。`
      ],
      财运: [
        `您的财运${mainWuxing === '金' || mainWuxing === '土' ? '较为旺盛' : '需要努力积累'}。${dayTG}日出生的人在理财方面${dayTG === '戊' || dayTG === '己' ? '善于储蓄' : dayTG === '壬' || dayTG === '癸' ? '善于投资' : '需要理性规划'}。`,
        `从五行来看，${wuxingCounts['金'] >= 2 ? '金气充足，财运较好' : wuxingCounts['土'] >= 2 ? '土气旺盛，适合稳健投资' : '需要注意理财规划'}。建议${wuxingCounts['水'] >= 2 ? '适当进行风险投资' : wuxingCounts['火'] >= 2 ? '积极开拓新的收入来源' : '稳健理财为主'}。`,
        `财运提示：近期${wuxingCounts['金'] >= 2 ? '有意外之财的可能' : wuxingCounts['土'] >= 2 ? '适合进行长期投资' : '需要控制开支，避免冲动消费'}。`
      ],
      感情: [
        `您的感情运势${mainWuxing === '水' || mainWuxing === '木' ? '较为顺利' : '需要用心经营'}。${dayTG}日出生的人在感情中${dayTG === '甲' || dayTG === '乙' ? '温柔体贴，善于表达' : dayTG === '丙' || dayTG === '丁' ? '热情浪漫，富有魅力' : '稳重可靠，值得信赖'}。`,
        `从八字来看，${wuxingCounts['水'] >= 2 ? '桃花运旺盛，容易吸引异性' : wuxingCounts['木'] >= 2 ? '感情细腻，懂得体贴对方' : '需要主动出击，把握机会'}。`,
        `感情建议：${dayWuxing === '金' ? '在感情中要学会柔软，不要过于强硬' : dayWuxing === '木' ? '保持真诚，感情会自然发展' : dayWuxing === '水' ? '善于沟通，化解矛盾' : dayWuxing === '火' ? '控制情绪，避免冲动' : '多表达爱意，让对方感受到你的温暖'}。`
      ],
      健康: [
        `您的健康运势${mainWuxing === '土' || mainWuxing === '水' ? '较为平稳' : '需要注意调养'}。${dayTG}日出生的人在健康方面${dayTG === '戊' || dayTG === '己' ? '体质较好，抵抗力强' : dayTG === '壬' || dayTG === '癸' ? '精力充沛，但要注意休息' : '需要注意作息规律'}。`,
        `从五行来看，需要特别关注${Object.entries(balance).find(([_, b]) => b === '偏弱')?.[0] || '各方面'}方面的健康。${wuxingCounts['火'] >= 3 ? '注意心脏和血液循环' : wuxingCounts['水'] >= 3 ? '注意肾脏和泌尿系统' : wuxingCounts['木'] >= 3 ? '注意肝脏和胆囊' : wuxingCounts['金'] >= 3 ? '注意肺部和呼吸道' : '保持均衡饮食和适量运动'}。`,
        `健康建议：${dayWuxing === '金' ? '多做有氧运动，增强肺功能' : dayWuxing === '木' ? '保持心情舒畅，保护肝脏' : dayWuxing === '水' ? '注意保暖，保护肾脏' : dayWuxing === '火' ? '避免熬夜，保护心脏' : '规律作息，保护脾胃'}。`
      ],
      性格: [
        `您的性格特点：${dayTG}日出生的人，${dayTG === '甲' ? '正直、勇敢、有领导才能，但有时过于固执' : dayTG === '乙' ? '温柔、善良、善于协调，但有时过于优柔寡断' : dayTG === '丙' ? '热情、开朗、积极向上，但有时过于冲动' : dayTG === '丁' ? '细腻、敏感、富有艺术气息，但有时过于情绪化' : dayTG === '戊' ? '稳重、踏实、值得信赖，但有时过于保守' : dayTG === '己' ? '包容、大度、有耐心，但有时过于被动' : dayTG === '庚' ? '果断、坚决、讲义气，但有时过于强硬' : dayTG === '辛' ? '精致、细腻、追求完美，但有时过于挑剔' : dayTG === '壬' ? '聪明、灵活、善于变通，但有时过于圆滑' : '智慧、深沉、有谋略，但有时过于多疑'}。`,
        `从五行来看，${mainWuxing === '金' ? '您具有决断力和执行力，适合从事需要决策的工作' : mainWuxing === '木' ? '您具有创造力和成长力，适合从事创意或教育工作' : mainWuxing === '水' ? '您具有智慧和适应力，适合从事科研或技术工作' : mainWuxing === '火' ? '您具有热情和表现力，适合从事艺术或服务工作' : '您具有稳定性和包容力，适合从事管理或金融工作'}。`,
        `性格建议：${Object.values(balance).every(b => b === '平衡') ? '您的性格较为平衡，继续保持即可' : `建议在日常生活中多培养${Object.entries(balance).find(([_, b]) => b === '偏弱')?.[0] || '各方面'}方面的特质，使性格更加完善`}。`
      ]
    }

    return templates[questionType] || templates['综合']
  }

  async function getBaziAnalysis(name, birthDate, birthTime, gender, questionType) {
    return executeFortune(async () => {
      await delay(1500)

      const bazi = generateBazi()
      const wuxingCounts = calculateWuxingCount(bazi)
      const mainWuxing = getMainWuxing(wuxingCounts)
      const balance = getWuxingBalance(wuxingCounts)
      const analysis = generateAnalysis(bazi, wuxingCounts, mainWuxing, balance, questionType)

      return {
        name,
        birthDate,
        birthTime,
        gender,
        questionType,
        bazi: {
          year: {
            ...bazi.year,
            full: bazi.year.tg + bazi.year.dz,
            shengxiao: dizhiShengxiao[bazi.year.dz]
          },
          month: {
            ...bazi.month,
            full: bazi.month.tg + bazi.month.dz,
            shengxiao: dizhiShengxiao[bazi.month.dz]
          },
          day: {
            ...bazi.day,
            full: bazi.day.tg + bazi.day.dz,
            shengxiao: dizhiShengxiao[bazi.day.dz]
          },
          hour: {
            ...bazi.hour,
            full: bazi.hour.tg + bazi.hour.dz,
            shengxiao: dizhiShengxiao[bazi.hour.dz]
          }
        },
        wuxingCounts,
        mainWuxing,
        balance,
        analysis,
        wuxingColors,
        wuxingEmojis
      }
    })
  }

  return {
    loading,
    result,
    tiangan,
    dizhi,
    tianganWuxing,
    dizhiWuxing,
    dizhiShengxiao,
    wuxingColors,
    wuxingEmojis,
    shishen,
    questionTypes,
    genders,
    hasResult,
    getBaziAnalysis,
    reset
  }
}
