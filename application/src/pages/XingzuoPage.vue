<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { tanshuApi, transformConstellationData } from '../services/api.js'

const router = useRouter()
const loading = ref(false)
const result = ref(null)
const apiError = ref('')
const useMockData = ref(true)

const xingzuoList = [
  { name: '白羊座', emoji: '♈', date: '3.21-4.19', element: '火' },
  { name: '金牛座', emoji: '♉', date: '4.20-5.20', element: '土' },
  { name: '双子座', emoji: '♊', date: '5.21-6.21', element: '风' },
  { name: '巨蟹座', emoji: '♋', date: '6.22-7.22', element: '水' },
  { name: '狮子座', emoji: '♌', date: '7.23-8.22', element: '火' },
  { name: '处女座', emoji: '♍', date: '8.23-9.22', element: '土' },
  { name: '天秤座', emoji: '♎', date: '9.23-10.23', element: '风' },
  { name: '天蝎座', emoji: '♏', date: '10.24-11.22', element: '水' },
  { name: '射手座', emoji: '♐', date: '11.23-12.21', element: '火' },
  { name: '摩羯座', emoji: '♑', date: '12.22-1.19', element: '土' },
  { name: '水瓶座', emoji: '♒', date: '1.20-2.18', element: '风' },
  { name: '双鱼座', emoji: '♓', date: '2.19-3.20', element: '水' }
]

const timeRanges = ['今日', '明日', '本周', '本月', '本年']

const formData = ref({
  selectedXingzuo: null,
  timeRange: '今日'
})

onMounted(() => {
  const savedKey = localStorage.getItem('tanshu_api_key')
  if (savedKey && savedKey !== 'YOUR_TANSHU_API_KEY') {
    tanshuApi.setApiKey(savedKey)
    useMockData.value = false
  }
})

function goBack() {
  router.push('/')
}

function selectXingzuo(xz) {
  formData.value.selectedXingzuo = xz
}

function generateMockData(xingzuo, timeRange) {
  const scores = {
    overall: Math.floor(Math.random() * 40) + 60,
    love: Math.floor(Math.random() * 40) + 60,
    career: Math.floor(Math.random() * 40) + 60,
    wealth: Math.floor(Math.random() * 40) + 60,
    health: Math.floor(Math.random() * 40) + 60
  }
  
  const luckyItems = [
    { type: '数字', value: Math.floor(Math.random() * 99) + 1 },
    { type: '颜色', value: ['红色', '蓝色', '绿色', '紫色', '黄色', '粉色'][Math.floor(Math.random() * 6)] },
    { type: '宝石', value: ['钻石', '红宝石', '蓝宝石', '翡翠', '珍珠'][Math.floor(Math.random() * 5)] },
    { type: '方位', value: ['东方', '西方', '南方', '北方'][Math.floor(Math.random() * 4)] }
  ]
  
  return {
    xingzuo: xingzuo,
    timeRange: timeRange,
    scores: scores,
    luckyItems: luckyItems,
    analysis: {
      overview: `${xingzuo.name}的朋友${timeRange}运势${scores.overall >= 80 ? '相当不错' : scores.overall >= 70 ? '较为平稳' : '需要多加注意'}。整体能量${scores.overall >= 80 ? '高涨' : '平稳'}，适合${scores.overall >= 80 ? '主动出击' : '稳扎稳打'}。`,
      love: scores.love >= 80 ? '感情运势极佳，单身者有机会遇到心仪对象，有伴侣者感情甜蜜。' : scores.love >= 70 ? '感情平稳，需要多花时间陪伴对方。' : '感情上可能会有一些小摩擦，需要多沟通理解。',
      career: scores.career >= 80 ? '事业运势强劲，工作效率高，容易得到上司认可。' : scores.career >= 70 ? '事业平稳发展，按部就班完成任务即可。' : '工作上可能会遇到一些挑战，需要保持耐心和冷静。',
      wealth: scores.wealth >= 80 ? '财运亨通，正财偏财都有收获，适合理财投资。' : scores.wealth >= 70 ? '财运平稳，收支平衡，不宜大额投资。' : '财运一般，需要控制开支，避免冲动消费。'
    },
    isMock: true
  }
}

async function handleGetXingzuo() {
  if (!formData.value.selectedXingzuo) {
    alert('请选择您的星座！')
    return
  }

  loading.value = true
  apiError.value = ''
  
  try {
    if (useMockData.value) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      result.value = generateMockData(formData.value.selectedXingzuo, formData.value.timeRange)
    } else {
      const apiData = await tanshuApi.getConstellationFortune(
        formData.value.selectedXingzuo.name,
        formData.value.timeRange
      )
      
      if (apiData.code === 1 && apiData.data) {
        const transformed = transformConstellationData(apiData, formData.value.timeRange)
        
        if (formData.value.timeRange === '今日' || formData.value.timeRange === '明日') {
          result.value = {
            xingzuo: formData.value.selectedXingzuo,
            timeRange: formData.value.timeRange,
            scores: transformed.scores,
            luckyItems: [
              { type: '数字', value: apiData.data.number },
              { type: '颜色', value: apiData.data.color },
              { type: '速配星座', value: apiData.data.friend }
            ],
            analysis: {
              overview: transformed.summary,
              love: `爱情指数: ${transformed.scores.love}%`,
              career: `事业指数: ${transformed.scores.career}%`,
              wealth: `财富指数: ${transformed.scores.wealth}%`
            },
            datetime: transformed.datetime,
            isMock: false
          }
        } else {
          result.value = {
            xingzuo: formData.value.selectedXingzuo,
            timeRange: formData.value.timeRange,
            scores: transformed.scores,
            luckyItems: [
              { type: '日期', value: transformed.date }
            ],
            analysis: transformed.analysis || {
              overview: `${formData.value.selectedXingzuo.name}${formData.value.timeRange}运势分析`,
              love: transformed.analysis?.love || '感情运势平稳',
              career: transformed.analysis?.work || '事业运势平稳',
              wealth: transformed.analysis?.money || '财运平稳'
            },
            isMock: false
          }
        }
      } else {
        throw new Error(apiData.msg || 'API 返回错误')
      }
    }
  } catch (err) {
    console.error('获取星座运势失败:', err)
    apiError.value = err.message || '获取运势失败，请稍后重试'
    
    if (!useMockData.value) {
      const useMock = confirm('API 调用失败，是否使用模拟数据？')
      if (useMock) {
        result.value = generateMockData(formData.value.selectedXingzuo, formData.value.timeRange)
        apiError.value = ''
      }
    }
  } finally {
    loading.value = false
  }
}

function resetXingzuo() {
  result.value = null
  apiError.value = ''
  formData.value.selectedXingzuo = null
  formData.value.timeRange = '今日'
}

function openApiKeyModal() {
  const currentKey = localStorage.getItem('tanshu_api_key') || ''
  const newKey = prompt('请输入探数 API Key（留空则使用模拟数据）:', currentKey)
  
  if (newKey !== null) {
    if (newKey.trim()) {
      localStorage.setItem('tanshu_api_key', newKey.trim())
      tanshuApi.setApiKey(newKey.trim())
      useMockData.value = false
      alert('API Key 已保存！')
    } else {
      localStorage.removeItem('tanshu_api_key')
      tanshuApi.setApiKey('YOUR_TANSHU_API_KEY')
      useMockData.value = true
      alert('已切换到模拟数据模式')
    }
  }
}
</script>

<template>
  <div class="xingzuo-page">
    <header class="page-header">
      <button class="back-btn" @click="goBack">← 返回首页</button>
      <h1 class="page-title">♈ 星座运势</h1>
      <p class="page-subtitle">基于西方占星学的运势分析</p>
      <button class="api-key-btn" @click="openApiKeyModal" :title="useMockData ? '当前使用模拟数据' : '当前使用真实 API'">
        {{ useMockData ? '🔧 设置 API Key' : '🔑 API 已配置' }}
      </button>
    </header>

    <div v-if="useMockData" class="mock-notice">
      <span class="mock-icon">⚠️</span>
      <span>当前使用模拟数据，点击右上角按钮配置真实 API Key</span>
    </div>

    <div v-if="!result" class="form-section">
      <div class="form-card">
        <div class="form-group">
          <label>♈ 选择您的星座</label>
          <div class="xingzuo-grid">
            <button
              v-for="xz in xingzuoList"
              :key="xz.name"
              :class="['xingzuo-btn', { active: formData.selectedXingzuo?.name === xz.name }]"
              @click="selectXingzuo(xz)"
            >
              <span class="xz-emoji">{{ xz.emoji }}</span>
              <span class="xz-name">{{ xz.name }}</span>
              <span class="xz-date">{{ xz.date }}</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>📅 时间范围</label>
          <div class="time-buttons">
            <button
              v-for="time in timeRanges"
              :key="time"
              :class="['time-btn', { active: formData.timeRange === time }]"
              @click="formData.timeRange = time"
            >
              {{ time }}
            </button>
          </div>
        </div>

        <button class="submit-btn" @click="handleGetXingzuo" :disabled="loading">
          {{ loading ? '✨ 正在分析...' : '♈ 查看星座运势' }}
        </button>
      </div>
    </div>

    <div v-if="apiError" class="error-message">
      <span class="error-icon">❌</span>
      <span>{{ apiError }}</span>
    </div>

    <div v-else-if="result" class="result-section">
      <div class="result-card">
        <div class="result-header">
          <div class="xingzuo-icon">{{ result.xingzuo.emoji }}</div>
          <h2>{{ result.xingzuo.name }}</h2>
          <p class="result-subtitle">
            {{ result.timeRange }}运势 | {{ result.xingzuo.element }}象星座
            <span v-if="result.isMock" class="mock-badge">模拟数据</span>
            <span v-else class="api-badge">真实数据</span>
          </p>
          <p v-if="result.datetime" class="result-date">{{ result.datetime }}</p>
        </div>

        <div class="score-section">
          <div class="score-circle">
            <div class="circle-value">{{ result.scores.overall }}</div>
            <div class="circle-label">综合指数</div>
          </div>
          <div class="score-details">
            <div class="detail-item">
              <span class="detail-label">💕 爱情</span>
              <div class="detail-bar">
                <div class="detail-fill love" :style="{ width: result.scores.love + '%' }"></div>
              </div>
              <span class="detail-value">{{ result.scores.love }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">💼 事业</span>
              <div class="detail-bar">
                <div class="detail-fill career" :style="{ width: result.scores.career + '%' }"></div>
              </div>
              <span class="detail-value">{{ result.scores.career }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">💰 财富</span>
              <div class="detail-bar">
                <div class="detail-fill wealth" :style="{ width: result.scores.wealth + '%' }"></div>
              </div>
              <span class="detail-value">{{ result.scores.wealth }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">🏃 健康</span>
              <div class="detail-bar">
                <div class="detail-fill health" :style="{ width: result.scores.health + '%' }"></div>
              </div>
              <span class="detail-value">{{ result.scores.health }}%</span>
            </div>
          </div>
        </div>

        <div class="analysis-section">
          <div class="analysis-item">
            <h4>🌟 运势概述</h4>
            <p>{{ result.analysis.overview }}</p>
          </div>
          <div class="analysis-item">
            <h4>💕 爱情运势</h4>
            <p>{{ result.analysis.love }}</p>
          </div>
          <div class="analysis-item">
            <h4>💼 事业运势</h4>
            <p>{{ result.analysis.career }}</p>
          </div>
          <div class="analysis-item">
            <h4>💰 财富运势</h4>
            <p>{{ result.analysis.wealth }}</p>
          </div>
        </div>

        <div class="lucky-section">
          <h3>✨ 幸运指南</h3>
          <div class="lucky-grid">
            <div v-for="(item, index) in result.luckyItems" :key="index" class="lucky-card">
              <span class="lucky-type">幸运{{ item.type }}</span>
              <span class="lucky-val">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn-secondary" @click="resetXingzuo">🔄 重新查询</button>
          <button class="btn-primary" @click="goBack">🏠 返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.xingzuo-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 0;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.api-key-btn {
  position: absolute;
  right: 0;
  top: 0;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
}

.api-key-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.page-title {
  color: white;
  font-size: 2rem;
  margin-bottom: 10px;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

.mock-notice {
  max-width: 700px;
  margin: 0 auto 20px;
  padding: 12px 20px;
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid rgba(251, 191, 36, 0.5);
  border-radius: 10px;
  color: #fef3c7;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.mock-icon {
  font-size: 1.2rem;
}

.error-message {
  max-width: 600px;
  margin: 20px auto;
  padding: 15px 20px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 10px;
  color: #fecaca;
  display: flex;
  align-items: center;
  gap: 10px;
}

.error-icon {
  font-size: 1.2rem;
}

.form-section {
  max-width: 700px;
  margin: 0 auto;
}

.form-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.form-group {
  margin-bottom: 30px;
}

.form-group label {
  display: block;
  margin-bottom: 15px;
  color: #374151;
  font-weight: 600;
  font-size: 1.1rem;
}

.xingzuo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.xingzuo-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 10px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.xingzuo-btn:hover {
  border-color: #667eea;
  background: #f5f3ff;
  transform: translateY(-2px);
}

.xingzuo-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.xz-emoji {
  font-size: 2rem;
  margin-bottom: 5px;
}

.xz-name {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 3px;
}

.xz-date {
  font-size: 0.7rem;
  opacity: 0.7;
}

.time-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.time-btn {
  flex: 1;
  min-width: 80px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.time-btn:hover {
  border-color: #667eea;
  background: #f5f3ff;
}

.time-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.result-section {
  max-width: 600px;
  margin: 0 auto;
}

.result-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.result-header {
  text-align: center;
  margin-bottom: 30px;
}

.xingzuo-icon {
  font-size: 4rem;
  margin-bottom: 10px;
}

.result-header h2 {
  color: #667eea;
  font-size: 1.8rem;
  margin-bottom: 5px;
}

.result-subtitle {
  color: #6b7280;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.mock-badge {
  padding: 2px 8px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.api-badge {
  padding: 2px 8px;
  background: #d1fae5;
  color: #065f46;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.result-date {
  color: #9ca3af;
  font-size: 0.85rem;
  margin-top: 5px;
}

.score-section {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f3ff;
  border-radius: 16px;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  flex-shrink: 0;
}

.circle-value {
  font-size: 2.5rem;
  font-weight: 700;
}

.circle-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.score-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-label {
  width: 70px;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.detail-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.detail-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.detail-fill.love { background: linear-gradient(90deg, #fa709a, #fee140); }
.detail-fill.career { background: linear-gradient(90deg, #667eea, #764ba2); }
.detail-fill.wealth { background: linear-gradient(90deg, #f093fb, #f5576c); }
.detail-fill.health { background: linear-gradient(90deg, #11998e, #38ef7d); }

.detail-value {
  width: 40px;
  text-align: right;
  font-weight: 600;
  color: #667eea;
  font-size: 0.9rem;
}

.analysis-section {
  margin-bottom: 25px;
}

.analysis-item {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.analysis-item h4 {
  color: #667eea;
  margin-bottom: 8px;
  font-size: 1rem;
}

.analysis-item p {
  color: #4b5563;
  line-height: 1.5;
  font-size: 0.95rem;
}

.lucky-section {
  margin-bottom: 30px;
}

.lucky-section h3 {
  color: #667eea;
  margin-bottom: 15px;
  text-align: center;
}

.lucky-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.lucky-card {
  text-align: center;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.lucky-type {
  display: block;
  font-size: 0.8rem;
  opacity: 0.9;
  margin-bottom: 5px;
}

.lucky-val {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
}

.result-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn-primary {
  padding: 14px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  padding: 14px 30px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  background: white;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #667eea;
  color: #667eea;
}

@media (max-width: 768px) {
  .xingzuo-page {
    padding: 15px;
  }

  .back-btn,
  .api-key-btn {
    position: static;
    margin-bottom: 15px;
    width: 100%;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .form-card,
  .result-card {
    padding: 25px;
  }

  .xingzuo-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .score-section {
    flex-direction: column;
    align-items: center;
  }

  .lucky-grid {
    grid-template-columns: 1fr;
  }

  .result-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
