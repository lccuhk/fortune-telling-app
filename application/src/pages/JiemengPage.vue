<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { tanshuApi } from '../services/api.js'
import storageService from '../services/storage.js'

const router = useRouter()
const loading = ref(false)
const result = ref(null)
const history = ref([])
const showHistory = ref(false)
const useMockData = ref(true)

const dreamCategories = [
  { name: '动物', icon: '🦁', examples: '蛇、狗、猫、鸟', keywords: ['蛇', '狗', '猫', '鸟', '鱼', '老虎', '龙', '凤凰'] },
  { name: '人物', icon: '👤', examples: '亲人、朋友、陌生人', keywords: ['父母', '朋友', '陌生人', '老师', '同学', '恋人', '孩子', '老人'] },
  { name: '自然', icon: '🌲', examples: '山、水、火、风', keywords: ['山', '水', '火', '风', '雨', '雪', '雷', '彩虹'] },
  { name: '物品', icon: '🎁', examples: '房子、车、钱', keywords: ['房子', '车', '钱', '手机', '衣服', '食物', '书', '花'] },
  { name: '行为', icon: '🏃', examples: '跑、飞、游泳', keywords: ['跑', '飞', '游泳', '打架', '唱歌', '跳舞', '吃饭', '睡觉'] },
  { name: '情感', icon: '❤️', examples: '笑、哭、害怕', keywords: ['笑', '哭', '害怕', '生气', '开心', '悲伤', '紧张', '放松'] }
]

const popularDreams = ['梦见蛇', '梦见掉牙', '梦见飞翔', '梦见考试', '梦见死人', '梦见怀孕', '梦见水', '梦见火']

const formData = ref({
  keyword: '',
  description: ''
})

onMounted(() => {
  loadHistory()
  checkApiConfig()
})

function checkApiConfig() {
  useMockData.value = !storageService.apiKey.isConfigured()
}

function loadHistory() {
  history.value = storageService.history.getByType('jiemeng').slice(0, 10)
}

function goBack() {
  router.push('/')
}

function selectPopularDream(dream) {
  formData.value.keyword = dream.replace('梦见', '')
}

function selectCategoryKeyword(keyword) {
  formData.value.keyword = keyword
}

function getMockInterpretation(keyword) {
  const luckLevels = ['大吉', '吉', '中', '凶', '大凶']
  const luckColors = ['#16a34a', '#22c55e', '#eab308', '#dc2626', '#991b1b']
  const luckIndex = Math.floor(Math.random() * 5)
  
  const interpretations = [
    `梦见${keyword}通常预示着近期会有好运降临，事业和财运都会有不错的进展。`,
    `此梦暗示您内心深处对${keyword}有所期待，建议把握机会，勇敢追求。`,
    `梦见${keyword}提醒您要注意身边的人际关系，多与家人朋友沟通交流。`,
    `这个梦境反映了您近期的心理状态，建议适当放松心情，调整作息。`,
    `梦见${keyword}是一个警示，提醒您在做重要决定时要三思而后行。`
  ]
  
  const advices = [
    '保持积极乐观的心态，好运自然会来。',
    '多关注身边的人和事，机会就在不经意间。',
    '适当调整生活节奏，劳逸结合更重要。',
    '遇到困难不要气馁，坚持就是胜利。',
    '多听取长辈和朋友的建议，会有意想不到的收获。'
  ]
  
  return {
    keyword: keyword,
    luck: {
      level: luckLevels[luckIndex],
      color: luckColors[luckIndex]
    },
    interpretation: interpretations[Math.floor(Math.random() * interpretations.length)],
    advice: advices[Math.floor(Math.random() * advices.length)],
    related: popularDreams.filter(d => d !== `梦见${keyword}`).slice(0, 3),
    isMock: true
  }
}

async function handleSearchDream() {
  if (!formData.value.keyword.trim()) {
    alert('请输入梦境关键词！')
    return
  }

  loading.value = true
  try {
    let interpretation
    
    if (useMockData.value) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      interpretation = getMockInterpretation(formData.value.keyword)
    } else {
      try {
        const apiResult = await tanshuApi.getDreamInterpretation(formData.value.keyword)
        if (apiResult && apiResult.code === 1 && apiResult.data) {
          interpretation = {
            keyword: formData.value.keyword,
            title: apiResult.data.title,
            content: apiResult.data.content,
            interpretation: apiResult.data.content || `关于梦见${formData.value.keyword}的解析`,
            advice: '保持平常心，梦境只是潜意识的反映。',
            luck: {
              level: '中',
              color: '#eab308'
            },
            related: popularDreams.slice(0, 3),
            isMock: false
          }
        } else {
          throw new Error('API 返回数据格式不正确')
        }
      } catch (apiError) {
        console.warn('[Jiemeng] API 请求失败，使用模拟数据:', apiError)
        await new Promise(resolve => setTimeout(resolve, 1000))
        interpretation = getMockInterpretation(formData.value.keyword)
      }
    }
    
    result.value = {
      ...interpretation,
      description: formData.value.description
    }
    
    saveToHistory()
  } catch (err) {
    console.error('[Jiemeng] 解梦失败:', err)
    alert('解梦失败，请重试')
  } finally {
    loading.value = false
  }
}

function saveToHistory() {
  if (!result.value) return
  
  const historyItem = {
    type: 'jiemeng',
    title: `梦见${result.value.keyword}`,
    keyword: result.value.keyword,
    luck: result.value.luck,
    isMock: result.value.isMock
  }
  
  storageService.history.add(historyItem)
  loadHistory()
}

function viewHistoryItem(item) {
  formData.value.keyword = item.keyword
  showHistory.value = false
  handleSearchDream()
}

function clearHistory() {
  if (confirm('确定要清空历史记录吗？')) {
    storageService.history.clear()
    loadHistory()
  }
}

function resetSearch() {
  result.value = null
  formData.value = {
    keyword: '',
    description: ''
  }
}

function toggleHistory() {
  showHistory.value = !showHistory.value
  if (showHistory.value) {
    loadHistory()
  }
}
</script>

<template>
  <div class="jiemeng-page">
    <header class="page-header">
      <button class="back-btn" @click="goBack">← 返回首页</button>
      <h1 class="page-title">💭 周公解梦</h1>
      <p class="page-subtitle">解读梦境背后的含义</p>
      <button class="history-btn" @click="toggleHistory">
        📜 历史 ({{ history.length }})
      </button>
    </header>

    <Transition name="slide">
      <div v-if="showHistory" class="history-panel">
        <div class="history-header">
          <h3>📜 解梦历史</h3>
          <button class="close-btn" @click="toggleHistory">✕</button>
        </div>
        <div v-if="history.length === 0" class="empty-history">
          <p>暂无历史记录</p>
        </div>
        <div v-else class="history-list">
          <div 
            v-for="item in history" 
            :key="item.id" 
            class="history-item"
            @click="viewHistoryItem(item)"
          >
            <span class="history-icon">💭</span>
            <div class="history-content">
              <span class="history-title">{{ item.title }}</span>
              <span class="history-time">{{ storageService.formatTimestamp(item.timestamp) }}</span>
            </div>
            <span 
              class="history-luck"
              :style="{ background: item.luck?.color || '#eab308' }"
            >
              {{ item.luck?.level || '中' }}
            </span>
          </div>
        </div>
        <div v-if="history.length > 0" class="history-actions">
          <button class="clear-history-btn" @click="clearHistory">清空历史</button>
        </div>
      </div>
    </Transition>

    <div v-if="!result" class="form-section">
      <div class="form-card">
        <div v-if="useMockData" class="mock-notice">
          <span class="mock-icon">🔧</span>
          <span>当前使用模拟数据，配置 API Key 后可获取真实解梦结果</span>
        </div>

        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            v-model="formData.keyword" 
            type="text" 
            placeholder="输入梦境关键词，如：蛇、飞翔、考试..."
            class="search-input"
            @keyup.enter="handleSearchDream"
          />
        </div>

        <div class="form-group">
          <label>💭 详细描述（可选）</label>
          <textarea 
            v-model="formData.description" 
            placeholder="描述您的梦境细节，有助于更准确的解读..."
            class="desc-input"
            rows="3"
          ></textarea>
        </div>

        <div class="popular-section">
          <label>🔥 热门梦境</label>
          <div class="popular-tags">
            <button 
              v-for="dream in popularDreams" 
              :key="dream"
              class="popular-tag"
              @click="selectPopularDream(dream)"
            >
              {{ dream }}
            </button>
          </div>
        </div>

        <div class="categories-section">
          <label>📂 梦境分类</label>
          <div class="categories-grid">
            <div v-for="cat in dreamCategories" :key="cat.name" class="category-card">
              <span class="cat-icon">{{ cat.icon }}</span>
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-examples">{{ cat.examples }}</span>
              <div class="cat-keywords">
                <button 
                  v-for="kw in cat.keywords.slice(0, 4)" 
                  :key="kw"
                  class="cat-keyword"
                  @click="selectCategoryKeyword(kw)"
                >
                  {{ kw }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button class="submit-btn" @click="handleSearchDream" :disabled="loading">
          {{ loading ? '✨ 正在解梦...' : '💭 开始解梦' }}
        </button>
      </div>
    </div>

    <div v-else class="result-section">
      <div class="result-card">
        <div class="result-header">
          <h2>💭 梦见{{ result.keyword }}</h2>
          <div class="result-badges">
            <div class="luck-badge" :style="{ background: result.luck.color }">
              {{ result.luck.level }}
            </div>
            <div v-if="result.isMock" class="mock-badge">模拟数据</div>
          </div>
        </div>

        <div class="interpretation-section">
          <h3>📖 梦境解析</h3>
          <p class="interpretation-text">{{ result.interpretation }}</p>
          <div v-if="result.content" class="detail-content">
            <p>{{ result.content }}</p>
          </div>
        </div>

        <div class="advice-section">
          <h3>💡 建议指引</h3>
          <p class="advice-text">{{ result.advice }}</p>
        </div>

        <div v-if="result.description" class="desc-result">
          <h3>📝 您的描述</h3>
          <p>{{ result.description }}</p>
        </div>

        <div class="related-section">
          <h3>🔗 相关梦境</h3>
          <div class="related-tags">
            <button 
              v-for="dream in result.related" 
              :key="dream"
              class="related-tag"
              @click="selectPopularDream(dream); resetSearch(); handleSearchDream()"
            >
              {{ dream }}
            </button>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn-secondary" @click="resetSearch">🔄 重新解梦</button>
          <button class="btn-primary" @click="goBack">🏠 返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.jiemeng-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 20px;
  position: relative;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
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

.history-btn {
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
}

.history-btn:hover {
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

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.history-panel {
  max-width: 600px;
  margin: 0 auto 20px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.history-header h3 {
  margin: 0;
  color: #4facfe;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #4b5563;
}

.empty-history {
  text-align: center;
  padding: 30px;
  color: #9ca3af;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-item:hover {
  background: #f0f9ff;
}

.history-icon {
  font-size: 1.5rem;
}

.history-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-title {
  font-weight: 600;
  color: #374151;
}

.history-time {
  font-size: 0.8rem;
  color: #9ca3af;
}

.history-luck {
  padding: 4px 12px;
  border-radius: 12px;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

.history-actions {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.clear-history-btn {
  padding: 8px 20px;
  background: none;
  border: 1px solid #ef4444;
  border-radius: 8px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-history-btn:hover {
  background: #fef2f2;
}

.form-section {
  max-width: 600px;
  margin: 0 auto;
}

.form-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.mock-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fef3c7;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: #92400e;
}

.mock-icon {
  font-size: 1.2rem;
}

.search-box {
  position: relative;
  margin-bottom: 25px;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
}

.search-input {
  width: 100%;
  padding: 16px 16px 16px 45px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  background: #ffffff;
  color: #1f2937;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #4facfe;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  color: #374151;
  font-weight: 600;
  font-size: 1rem;
}

.desc-input {
  width: 100%;
  padding: 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  background: #ffffff;
  color: #1f2937;
  resize: vertical;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.desc-input:focus {
  border-color: #4facfe;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.popular-section {
  margin-bottom: 25px;
}

.popular-section label {
  display: block;
  margin-bottom: 10px;
  color: #374151;
  font-weight: 600;
  font-size: 1rem;
}

.popular-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.popular-tag {
  padding: 8px 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 20px;
  color: #0284c7;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.popular-tag:hover {
  background: #4facfe;
  color: white;
  border-color: #4facfe;
}

.categories-section {
  margin-bottom: 25px;
}

.categories-section label {
  display: block;
  margin-bottom: 10px;
  color: #374151;
  font-weight: 600;
  font-size: 1rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.category-card {
  text-align: center;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s ease;
}

.category-card:hover {
  background: #e0f2fe;
}

.cat-icon {
  font-size: 1.5rem;
}

.cat-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.cat-examples {
  font-size: 0.75rem;
  color: #6b7280;
}

.cat-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-top: 5px;
}

.cat-keyword {
  padding: 4px 10px;
  background: white;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  color: #0284c7;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.75rem;
}

.cat-keyword:hover {
  background: #4facfe;
  color: white;
  border-color: #4facfe;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4);
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  flex-wrap: wrap;
  gap: 10px;
}

.result-header h2 {
  color: #4facfe;
  font-size: 1.5rem;
  margin: 0;
}

.result-badges {
  display: flex;
  gap: 10px;
  align-items: center;
}

.luck-badge {
  padding: 8px 20px;
  border-radius: 20px;
  color: white;
  font-weight: 600;
}

.mock-badge {
  padding: 6px 12px;
  background: #fef3c7;
  border-radius: 12px;
  color: #92400e;
  font-size: 0.8rem;
  font-weight: 500;
}

.interpretation-section,
.advice-section {
  margin-bottom: 25px;
  padding: 20px;
  background: #f0f9ff;
  border-radius: 12px;
}

.interpretation-section h3,
.advice-section h3 {
  color: #4facfe;
  margin-bottom: 10px;
  margin-top: 0;
}

.interpretation-text,
.advice-text {
  color: #4b5563;
  line-height: 1.6;
}

.detail-content {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #bae6fd;
}

.detail-content p {
  color: #6b7280;
  line-height: 1.8;
}

.desc-result {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.desc-result h3 {
  color: #6b7280;
  margin-bottom: 10px;
  font-size: 0.9rem;
  margin-top: 0;
}

.desc-result p {
  color: #4b5563;
  font-style: italic;
}

.related-section {
  margin-bottom: 30px;
}

.related-section h3 {
  color: #374151;
  margin-bottom: 10px;
  margin-top: 0;
}

.related-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.related-tag {
  padding: 8px 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 20px;
  color: #0284c7;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.related-tag:hover {
  background: #4facfe;
  color: white;
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
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4);
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
  border-color: #4facfe;
  color: #4facfe;
}

@media (max-width: 768px) {
  .jiemeng-page {
    padding: 15px;
  }

  .page-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .back-btn,
  .history-btn {
    position: static;
    margin-bottom: 0;
    width: 100%;
    order: 2;
  }

  .page-title {
    font-size: 1.5rem;
    order: 1;
  }

  .page-subtitle {
    order: 1;
    margin-bottom: 10px;
  }

  .form-card,
  .result-card {
    padding: 20px;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .category-card {
    padding: 12px;
  }

  .cat-icon {
    font-size: 1.3rem;
  }

  .cat-name {
    font-size: 0.85rem;
  }

  .cat-examples {
    font-size: 0.7rem;
  }

  .cat-keywords {
    gap: 4px;
  }

  .cat-keyword {
    padding: 3px 8px;
    font-size: 0.7rem;
  }

  .result-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .result-badges {
    justify-content: center;
  }

  .result-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .popular-tags {
    gap: 8px;
  }

  .popular-tag {
    padding: 6px 12px;
    font-size: 0.85rem;
  }

  .search-input {
    padding: 14px 14px 14px 42px;
    font-size: 0.95rem;
  }

  .desc-input {
    padding: 12px;
    font-size: 0.95rem;
  }

  .history-panel {
    padding: 15px;
  }

  .history-item {
    padding: 10px;
    gap: 10px;
  }

  .history-icon {
    font-size: 1.3rem;
  }

  .history-title {
    font-size: 0.9rem;
  }

  .history-time {
    font-size: 0.75rem;
  }

  .history-luck {
    padding: 3px 10px;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .jiemeng-page {
    padding: 12px;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }

  .form-card,
  .result-card {
    padding: 15px;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .category-card {
    padding: 15px;
  }

  .cat-icon {
    font-size: 1.5rem;
  }

  .cat-name {
    font-size: 0.95rem;
  }

  .cat-examples {
    font-size: 0.75rem;
  }

  .cat-keywords {
    gap: 6px;
  }

  .cat-keyword {
    padding: 4px 10px;
    font-size: 0.75rem;
  }

  .popular-tags {
    gap: 6px;
  }

  .popular-tag {
    padding: 5px 10px;
    font-size: 0.8rem;
  }

  .mock-notice {
    padding: 10px 12px;
    font-size: 0.85rem;
  }

  .submit-btn {
    padding: 14px;
    font-size: 1rem;
  }

  .interpretation-section,
  .advice-section {
    padding: 15px;
  }

  .interpretation-section h3,
  .advice-section h3 {
    font-size: 1rem;
  }

  .interpretation-text,
  .advice-text {
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .related-tags {
    gap: 8px;
  }

  .related-tag {
    padding: 6px 12px;
    font-size: 0.85rem;
  }

  .result-header h2 {
    font-size: 1.2rem;
  }

  .luck-badge {
    padding: 6px 15px;
    font-size: 0.9rem;
  }

  .history-panel {
    padding: 12px;
  }

  .history-header h3 {
    font-size: 1rem;
  }

  .history-item {
    padding: 8px;
    gap: 8px;
  }

  .history-icon {
    font-size: 1.2rem;
  }

  .history-title {
    font-size: 0.85rem;
  }

  .history-time {
    font-size: 0.7rem;
  }

  .history-luck {
    padding: 2px 8px;
    font-size: 0.7rem;
  }

  .clear-history-btn {
    padding: 6px 15px;
    font-size: 0.85rem;
  }
}
</style>
