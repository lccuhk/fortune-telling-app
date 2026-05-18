#!/usr/bin/env node

const readline = require('readline')

const API_BASE_URL = 'https://api.tanshuapi.com/api'
const TIMEOUT = 15000

const testKeywords = [
  { keyword: '龙', category: '动物', description: '龙在中国传统文化中是吉祥的象征' },
  { keyword: '凤凰', category: '动物', description: '凤凰代表着吉祥和重生' }
]

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWithTimeout(url, options = {}, timeout = TIMEOUT) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

async function testDreamInterpretation(apiKey, keyword, category, description) {
  console.log('\n' + '='.repeat(60))
  console.log(`🔍 测试关键词: "${keyword}"`)
  console.log(`📂 分类: ${category}`)
  console.log(`📝 描述: ${description}`)
  console.log('='.repeat(60))
  
  const startTime = Date.now()
  const url = `${API_BASE_URL}/dream/v1/index?key=${encodeURIComponent(apiKey)}&keyword=${encodeURIComponent(keyword)}`
  
  console.log(`\n📤 请求 URL: ${url.replace(apiKey, '***API_KEY***')}`)
  console.log('⏳ 正在请求...')
  
  try {
    const response = await fetchWithTimeout(url)
    const responseTime = Date.now() - startTime
    
    console.log(`\n📥 响应状态: ${response.status} ${response.statusText}`)
    console.log(`⏱️  响应时间: ${responseTime}ms`)
    
    const data = await response.json()
    
    console.log('\n📦 完整响应数据:')
    console.log(JSON.stringify(data, null, 2))
    
    if (data.code === 1) {
      console.log('\n✅ 请求成功！')
      console.log('\n📖 解析结果:')
      
      if (data.data) {
        if (data.data.title) {
          console.log(`   标题: ${data.data.title}`)
        }
        if (data.data.content) {
          console.log(`   内容: ${data.data.content.substring(0, 200)}${data.data.content.length > 200 ? '...' : ''}`)
        }
        if (data.data.type) {
          console.log(`   类型: ${data.data.type}`)
        }
      }
      
      return { success: true, data: data.data, responseTime }
    } else {
      console.log('\n❌ 请求失败！')
      console.log(`   错误码: ${data.code}`)
      console.log(`   错误信息: ${data.msg || '未知错误'}`)
      
      return { success: false, error: data.msg, responseTime }
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    console.log('\n❌ 请求异常！')
    console.log(`   错误类型: ${error.name}`)
    console.log(`   错误信息: ${error.message}`)
    console.log(`   响应时间: ${responseTime}ms`)
    
    if (error.name === 'AbortError') {
      console.log('   ⏰ 请求超时（超过 15 秒）')
    } else if (error.message && error.message.includes('fetch')) {
      console.log('   🌐 网络连接问题')
    }
    
    return { success: false, error: error.message, responseTime }
  }
}

async function testDreamCategories(apiKey) {
  console.log('\n' + '='.repeat(60))
  console.log('📚 测试梦境分类列表 API')
  console.log('='.repeat(60))
  
  const url = `${API_BASE_URL}/dream/v1/type?key=${encodeURIComponent(apiKey)}`
  
  console.log(`\n📤 请求 URL: ${url.replace(apiKey, '***API_KEY***')}`)
  console.log('⏳ 正在请求...')
  
  try {
    const response = await fetchWithTimeout(url)
    const data = await response.json()
    
    console.log('\n📦 响应数据:')
    console.log(JSON.stringify(data, null, 2))
    
    if (data.code === 1) {
      console.log('\n✅ 分类列表获取成功！')
      if (data.data && Array.isArray(data.data)) {
        console.log(`   共 ${data.data.length} 个分类:`)
        data.data.forEach((cat, index) => {
          console.log(`   ${index + 1}. ${cat.name || cat}`)
        })
      }
      return { success: true, data: data.data }
    } else {
      console.log('\n❌ 获取分类列表失败')
      return { success: false, error: data.msg }
    }
  } catch (error) {
    console.log('\n❌ 获取分类列表异常:', error.message)
    return { success: false, error: error.message }
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
    const keyword = testKeywords[index]?.keyword || `测试 ${index + 1}`
    const time = result.responseTime ? `${result.responseTime}ms` : 'N/A'
    console.log(`\n   ${status} ${keyword} - ${time}`)
    if (!result.success && result.error) {
      console.log(`      错误: ${result.error}`)
    }
  })
  
  console.log('\n' + '='.repeat(60))
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer.trim())
    })
  })
}

async function main() {
  console.log('\n' + '╔' + '═'.repeat(58) + '╗')
  console.log('║' + ' '.repeat(15) + '🔮 周公解梦 API 测试脚本' + ' '.repeat(18) + '║')
  console.log('║' + ' '.repeat(12) + '测试关键词: 龙、凤凰（动物分类）' + ' '.repeat(13) + '║')
  console.log('╚' + '═'.repeat(58) + '╝')
  
  let apiKey = process.env.TANSHU_API_KEY || ''
  
  if (!apiKey) {
    apiKey = await askQuestion('\n🔑 请输入您的探数 API Key: ')
  }
  
  if (!apiKey || apiKey === 'YOUR_TANSHU_API_KEY') {
    console.log('\n❌ 错误: 请提供有效的 API Key')
    console.log('   您可以在 https://www.tanshuapi.com 注册获取')
    rl.close()
    process.exit(1)
  }
  
  console.log(`\n✅ API Key 已配置（长度: ${apiKey.length} 字符）`)
  
  const runCategories = await askQuestion('\n📚 是否测试梦境分类列表 API？(y/n): ')
  
  const results = []
  
  if (runCategories.toLowerCase() === 'y' || runCategories.toLowerCase() === 'yes') {
    const catResult = await testDreamCategories(apiKey)
    console.log('\n⏳ 等待 2 秒后继续测试解梦接口...')
    await sleep(2000)
  }
  
  for (const test of testKeywords) {
    const result = await testDreamInterpretation(
      apiKey,
      test.keyword,
      test.category,
      test.description
    )
    results.push(result)
    
    if (test !== testKeywords[testKeywords.length - 1]) {
      console.log('\n⏳ 等待 1 秒后进行下一个测试...')
      await sleep(1000)
    }
  }
  
  printSummary(results)
  
  rl.close()
  
  const allSuccess = results.every(r => r.success)
  process.exit(allSuccess ? 0 : 1)
}

main().catch(error => {
  console.error('\n❌ 测试脚本执行失败:', error)
  rl.close()
  process.exit(1)
})
