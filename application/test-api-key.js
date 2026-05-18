#!/usr/bin/env node

const readline = require('readline')

const API_BASE_URL = 'https://api.tanshuapi.com/api'

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

async function testApiKey(apiKey) {
  console.log('\n🔍 正在测试 API Key 有效性...')
  console.log(`\n📤 测试接口: 星座列表`)
  
  const testUrls = [
    { name: '星座列表', url: `${API_BASE_URL}/constellation/v1/list?key=${encodeURIComponent(apiKey)}` },
    { name: '周公解梦分类', url: `${API_BASE_URL}/dream/v1/type?key=${encodeURIComponent(apiKey)}` }
  ]
  
  for (const test of testUrls) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📋 测试: ${test.name}`)
    console.log(`🔗 URL: ${test.url.replace(apiKey, '***API_KEY***')}`)
    
    try {
      const response = await fetch(test.url)
      const data = await response.json()
      
      console.log(`📥 响应状态: ${response.status}`)
      console.log(`📦 响应数据:`, JSON.stringify(data, null, 2))
      
      if (data.code === 1) {
        console.log(`✅ ${test.name} - 请求成功！`)
      } else {
        console.log(`❌ ${test.name} - 请求失败`)
        console.log(`   错误码: ${data.code}`)
        console.log(`   错误信息: ${data.msg || '未知错误'}`)
        
        if (data.msg && data.msg.includes('key')) {
          console.log(`\n💡 提示: API Key 可能无效或已过期`)
        }
      }
    } catch (error) {
      console.log(`❌ 网络错误: ${error.message}`)
    }
  }
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

async function main() {
  console.log('\n╔════════════════════════════════════════╗`)
  console.log(`║     🔑 API Key 有效性测试工具         ║`)
  console.log(`╚════════════════════════════════════════╝`)
  
  let apiKey = process.env.TANSHU_API_KEY || ''
  
  if (!apiKey) {
    apiKey = await askQuestion('\n🔑 请输入您的探数 API Key: ')
  }
  
  if (apiKey) {
    console.log(`\n✅ API Key 长度: ${apiKey.length} 字符`)
    console.log(`✅ API Key 前4位: ${apiKey.substring(0, 4)}...`)
    await testApiKey(apiKey)
  } else {
    console.log('\n❌ 未输入 API Key')
  }
  
  rl.close()
}

main().catch(error => {
  console.error('\n❌ 测试失败:', error)
  rl.close()
})
