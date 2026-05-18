#!/usr/bin/env node

const mockDreamData = {
  '龙': {
    title: '梦见龙',
    content: '梦见龙是非常吉祥的梦境，预示着您近期将会有好运降临。龙在中国传统文化中象征着权力、尊贵和吉祥。如果您是商人，梦见龙预示着生意兴隆，财源广进；如果您是职场人士，梦见龙预示着升职加薪的机会即将到来；如果您是学生，梦见龙预示着学业有成，考试顺利。龙的出现也代表着您内心深处的力量和自信正在觉醒，建议您抓住机会，勇敢追求自己的目标。',
    type: '动物',
    luck: '大吉',
    luckColor: '#16a34a'
  },
  '凤凰': {
    title: '梦见凤凰',
    content: '梦见凤凰是极其吉祥的征兆，凤凰代表着涅槃重生和永恒的美丽。这个梦境预示着您即将迎来人生的重大转折，过去的困难和挫折将会过去，新的希望和机遇正在向您招手。凤凰也象征着爱情和婚姻的美满，如果您是单身，近期可能会遇到心仪的对象；如果您已有伴侣，感情会更加甜蜜。建议您保持积极乐观的心态，迎接美好的未来。',
    type: '动物',
    luck: '大吉',
    luckColor: '#16a34a'
  },
  '蛇': {
    title: '梦见蛇',
    content: '梦见蛇通常有多重含义，需要根据具体情境来判断。一般来说，蛇象征着智慧、直觉和潜在的能量。如果梦中的蛇是友善的，预示着您的直觉敏锐，能够洞察事物的本质；如果梦中的蛇是攻击性的，可能提醒您要注意身边的小人或潜在的危险。蛇也与财运有关，梦见蛇有时预示着意外之财。建议您近期多关注自己的直觉感受，谨慎行事。',
    type: '动物',
    luck: '中',
    luckColor: '#eab308'
  },
  '狗': {
    title: '梦见狗',
    content: '梦见狗通常是好兆头，狗象征着忠诚、友谊和保护。如果梦中的狗是友好的，预示着您会得到朋友的帮助和支持；如果梦见狗在吠叫，可能提醒您要注意身边的人际关系；如果梦见被狗咬，可能意味着您会与朋友发生争执或被朋友背叛。狗也代表着您内心的忠诚和责任感，建议您珍惜身边的朋友，同时也要注意保护自己。',
    type: '动物',
    luck: '吉',
    luckColor: '#22c55e'
  },
  '猫': {
    title: '梦见猫',
    content: '梦见猫有着复杂的象征意义。猫通常代表着独立、神秘和直觉。如果梦中的猫是温顺可爱的，预示着您的直觉能力很强，能够感知到他人无法察觉的事物；如果梦中的猫是攻击性的，可能意味着您会遇到一些小麻烦或被人误解。猫也与女性能量和灵性有关，建议您近期多关注自己的内心感受，相信自己的直觉判断。',
    type: '动物',
    luck: '中',
    luckColor: '#eab308'
  },
  '鸟': {
    title: '梦见鸟',
    content: '梦见鸟通常是吉祥的象征，鸟代表着自由、希望和消息。如果梦见鸟儿在天空中自由飞翔，预示着您近期会有好消息传来，或者会获得精神上的自由和解放；如果梦见鸟儿在歌唱，预示着快乐和幸福即将到来；如果梦见受伤的鸟，可能提醒您要关注自己或家人的健康。鸟也象征着灵魂的升华，建议您保持乐观的心态，迎接美好的消息。',
    type: '动物',
    luck: '吉',
    luckColor: '#22c55e'
  },
  '鱼': {
    title: '梦见鱼',
    content: '梦见鱼是非常吉利的梦境，鱼在中国传统文化中象征着财富和好运。如果梦见鱼在水中游动，预示着财运亨通，事业顺利；如果梦见抓鱼，预示着您会抓住机会，获得成功；如果梦见吃鱼，预示着您会享受生活的美好。鱼也与情感有关，梦见鱼有时预示着感情生活的美满。建议您近期可以关注一些投资机会，可能会有不错的收获。',
    type: '动物',
    luck: '大吉',
    luckColor: '#16a34a'
  },
  '老虎': {
    title: '梦见老虎',
    content: '梦见老虎象征着力量、勇气和挑战。老虎出现在梦中，预示着您即将面临重要的挑战或机遇。如果梦中您能够勇敢面对老虎，预示着您有足够的能力克服困难，取得成功；如果梦中您感到害怕，可能提醒您需要增强自信，勇敢面对生活中的挑战。老虎也代表着权威和地位，梦见老虎有时预示着职场上的晋升机会。建议您保持自信，勇敢迎接挑战。',
    type: '动物',
    luck: '吉',
    luckColor: '#22c55e'
  }
}

const mockCategories = [
  { id: 1, name: '动物', icon: '🦁', count: 128 },
  { id: 2, name: '人物', icon: '👤', count: 96 },
  { id: 3, name: '自然', icon: '🌲', count: 85 },
  { id: 4, name: '物品', icon: '🎁', count: 112 },
  { id: 5, name: '行为', icon: '🏃', count: 78 },
  { id: 6, name: '情感', icon: '❤️', count: 64 }
]

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function mockDreamInterpretation(keyword) {
  const data = mockDreamData[keyword]
  
  if (data) {
    return {
      code: 1,
      msg: 'success',
      data: {
        ...data,
        timestamp: new Date().toISOString()
      }
    }
  }
  
  const luckLevels = ['大吉', '吉', '中', '凶', '大凶']
  const luckColors = ['#16a34a', '#22c55e', '#eab308', '#dc2626', '#991b1b']
  const luckIndex = getRandomInt(0, 4)
  
  const interpretations = [
    `梦见${keyword}通常预示着近期会有好运降临，事业和财运都会有不错的进展。建议您保持积极的心态，抓住机会。`,
    `此梦暗示您内心深处对${keyword}有所期待或关注。这是一个提醒您关注内心感受的梦境。`,
    `梦见${keyword}提醒您要注意身边的人际关系，多与家人朋友沟通交流，会有意想不到的收获。`,
    `这个梦境反映了您近期的心理状态，建议适当放松心情，调整作息，保持身心健康。`,
    `梦见${keyword}是一个警示，提醒您在做重要决定时要三思而后行，听取他人的建议。`
  ]
  
  return {
    code: 1,
    msg: 'success',
    data: {
      title: `梦见${keyword}`,
      content: interpretations[getRandomInt(0, interpretations.length - 1)],
      type: '其他',
      luck: luckLevels[luckIndex],
      luckColor: luckColors[luckIndex],
      timestamp: new Date().toISOString(),
      isMock: true
    }
  }
}

function mockDreamCategories() {
  return {
    code: 1,
    msg: 'success',
    data: mockCategories
  }
}

async function testDreamInterpretation(keyword, category, description) {
  console.log('\n' + '='.repeat(60))
  console.log(`🔍 测试关键词: "${keyword}"`)
  console.log(`📂 分类: ${category}`)
  console.log(`📝 描述: ${description}`)
  console.log('='.repeat(60))
  
  const startTime = Date.now()
  
  console.log('\n📤 [模拟] 请求 URL: https://api.tanshuapi.com/api/dream/v1/index?key=***MOCK_KEY***&keyword=' + encodeURIComponent(keyword))
  console.log('⏳ [模拟] 正在请求...')
  
  await sleep(getRandomInt(300, 800))
  
  const responseTime = Date.now() - startTime
  const response = mockDreamInterpretation(keyword)
  
  console.log(`\n📥 [模拟] 响应状态: 200 OK`)
  console.log(`⏱️  [模拟] 响应时间: ${responseTime}ms`)
  
  console.log('\n📦 完整响应数据:')
  console.log(JSON.stringify(response, null, 2))
  
  if (response.code === 1) {
    console.log('\n✅ 请求成功！')
    console.log('\n📖 解析结果:')
    
    if (response.data) {
      if (response.data.title) {
        console.log(`   标题: ${response.data.title}`)
      }
      if (response.data.content) {
        console.log(`   内容: ${response.data.content.substring(0, 150)}${response.data.content.length > 150 ? '...' : ''}`)
      }
      if (response.data.type) {
        console.log(`   类型: ${response.data.type}`)
      }
      if (response.data.luck) {
        console.log(`   吉凶: ${response.data.luck}`)
      }
    }
    
    return { success: true, data: response.data, responseTime, keyword }
  } else {
    console.log('\n❌ 请求失败！')
    console.log(`   错误码: ${response.code}`)
    console.log(`   错误信息: ${response.msg || '未知错误'}`)
    
    return { success: false, error: response.msg, responseTime, keyword }
  }
}

async function testDreamCategories() {
  console.log('\n' + '='.repeat(60))
  console.log('📚 测试梦境分类列表 API')
  console.log('='.repeat(60))
  
  console.log('\n📤 [模拟] 请求 URL: https://api.tanshuapi.com/api/dream/v1/type?key=***MOCK_KEY***')
  console.log('⏳ [模拟] 正在请求...')
  
  await sleep(getRandomInt(200, 500))
  
  const response = mockDreamCategories()
  
  console.log('\n📦 响应数据:')
  console.log(JSON.stringify(response, null, 2))
  
  if (response.code === 1) {
    console.log('\n✅ 分类列表获取成功！')
    if (response.data && Array.isArray(response.data)) {
      console.log(`   共 ${response.data.length} 个分类:`)
      response.data.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.icon} ${cat.name} (${cat.count}条)`)
      })
    }
    return { success: true, data: response.data }
  } else {
    console.log('\n❌ 获取分类列表失败')
    return { success: false, error: response.msg }
  }
}

function printSummary(results) {
  console.log('\n' + '='.repeat(60))
  console.log('📊 测试结果汇总')
  console.log('='.repeat(60))
  
  const successCount = results.filter(r => r.success).length
  const totalCount = results.length
  
  console.log(`\n   总测试数: ${totalCount}`)
  console.log(`   成功: ${successCount}`)
  console.log(`   失败: ${totalCount - successCount}`)
  console.log(`   成功率: ${((successCount / totalCount) * 100).toFixed(1)}%`)
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌'
    const keyword = result.keyword || `测试 ${index + 1}`
    const time = result.responseTime ? `${result.responseTime}ms` : 'N/A'
    console.log(`\n   ${status} ${keyword} - ${time}`)
    if (!result.success && result.error) {
      console.log(`      错误: ${result.error}`)
    }
  })
  
  console.log('\n' + '='.repeat(60))
}

const testKeywords = [
  { keyword: '龙', category: '动物', description: '龙在中国传统文化中是吉祥的象征' },
  { keyword: '凤凰', category: '动物', description: '凤凰代表着吉祥和重生' },
  { keyword: '蛇', category: '动物', description: '蛇象征着智慧和直觉' },
  { keyword: '狗', category: '动物', description: '狗代表着忠诚和友谊' },
  { keyword: '鱼', category: '动物', description: '鱼象征着财富和好运' }
]

async function main() {
  console.log('\n' + '╔' + '═'.repeat(58) + '╗')
  console.log('║' + ' '.repeat(12) + '🔮 周公解梦 API 模拟测试' + ' '.repeat(18) + '║')
  console.log('║' + ' '.repeat(10) + '（完全基于模拟数据，无需真实 API Key）' + ' '.repeat(10) + '║')
  console.log('╚' + '═'.repeat(58) + '╝')
  
  console.log('\n📋 测试关键词（动物分类）:')
  testKeywords.forEach((test, index) => {
    console.log(`   ${index + 1}. "${test.keyword}" - ${test.description}`)
  })
  
  console.log('\n⏳ 开始测试...')
  
  const results = []
  
  console.log('\n' + '─'.repeat(60))
  console.log('📚 测试 1: 梦境分类列表')
  console.log('─'.repeat(60))
  await testDreamCategories()
  
  console.log('\n⏳ 等待 1 秒后继续...')
  await sleep(1000)
  
  for (let i = 0; i < testKeywords.length; i++) {
    const test = testKeywords[i]
    console.log('\n' + '─'.repeat(60))
    console.log(`📚 测试 ${i + 2}: 关键词 "${test.keyword}"`)
    console.log('─'.repeat(60))
    
    const result = await testDreamInterpretation(
      test.keyword,
      test.category,
      test.description
    )
    results.push(result)
    
    if (i < testKeywords.length - 1) {
      console.log('\n⏳ 等待 0.5 秒后进行下一个测试...')
      await sleep(500)
    }
  }
  
  printSummary(results)
  
  console.log('\n' + '═'.repeat(60))
  console.log('💡 提示:')
  console.log('   1. 此脚本使用模拟数据，用于测试页面逻辑')
  console.log('   2. 真实 API 需要配置有效的 API Key')
  console.log('   3. 周公解梦页面已支持自动降级到模拟数据')
  console.log('   4. 您可以在应用中直接测试周公解梦功能')
  console.log('═'.repeat(60))
}

main().catch(error => {
  console.error('\n❌ 测试脚本执行失败:', error)
  process.exit(1)
})
