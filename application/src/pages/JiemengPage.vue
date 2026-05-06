<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const result = ref(null)

const dreamCategories = [
  { name: '动物', icon: '🦁', examples: '蛇、狗、猫、鸟' },
  { name: '人物', icon: '👤', examples: '亲人、朋友、陌生人' },
  { name: '自然', icon: '🌲', examples: '山、水、火、风' },
  { name: '物品', icon: '🎁', examples: '房子、车、钱' },
  { name: '行为', icon: '🏃', examples: '跑、飞、游泳' },
  { name: '情感', icon: '❤️', examples: '笑、哭、害怕' }
]

const popularDreams = ['梦见蛇', '梦见掉牙', '梦见飞翔', '梦见考试', '梦见死人', '梦见怀孕']

const formData = ref({
  keyword: '',
  description: ''
})

function goBack() {
  router.push('/')
}

function selectPopularDream(dream) {
  formData.value.keyword = dream.replace('梦见', '')
}

async function handleSearchDream() {
  if (!formData.value.keyword.trim()) {
    alert('请输入梦境关键词！')
    return
  }

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const luckLevels = ['大吉', '吉', '中', '凶', '大凶']
    const luckColors = ['#16a34a', '#22c55e', '#eab308', '#dc2626', '#991b1b']
    const luckIndex = Math.floor(Math.random() * 5)
    
    const interpretations = [
      `梦见${formData.value.keyword}通常预示着近期会有好运降临，事业和财运都会有不错的进展。`,
      `此梦暗示您内心深处对${formData.value.keyword}有所期待，建议把握机会，勇敢追求。`,
      `梦见${formData.value.keyword}提醒您要注意身边的人际关系，多与家人朋友沟通交流。`,
      `这个梦境反映了您近期的心理状态，建议适当放松心情，调整作息。`,
      `梦见${formData.value.keyword}是一个警示，提醒您在做重要决定时要三思而后行。`
    ]
    
    const advices = [
      '保持积极乐观的心态，好运自然会来。',
      '多关注身边的人和事，机会就在不经意间。',
      '适当调整生活节奏，劳逸结合更重要。',
      '遇到困难不要气馁，坚持就是胜利。',
      '多听取长辈和朋友的建议，会有意想不到的收获。'
    ]
    
    result.value = {
      keyword: formData.value.keyword,
      description: formData.value.description,
      luck: {
        level: luckLevels[luckIndex],
        color: luckColors[luckIndex]
      },
      interpretation: interpretations[Math.floor(Math.random() * interpretations.length)],
      advice: advices[Math.floor(Math.random() * advices.length)],
      related: popularDreams.filter(d => d !== `梦见${formData.value.keyword}`).slice(0, 3)
    }
  } catch (err) {
    alert('解梦失败，请重试')
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  result.value = null
  formData.value = {
    keyword: '',
    description: ''
  }
}
</script>

<template>
  <div class="jiemeng-page">
    <header class="page-header">
      <button class="back-btn" @click="goBack">← 返回首页</button>
      <h1 class="page-title">💭 周公解梦</h1>
      <p class="page-subtitle">解读梦境背后的含义</p>
    </header>

    <div v-if="!result" class="form-section">
      <div class="form-card">
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
          <div class="luck-badge" :style="{ background: result.luck.color }">
            {{ result.luck.level }}
          </div>
        </div>

        <div class="interpretation-section">
          <h3>📖 梦境解析</h3>
          <p class="interpretation-text">{{ result.interpretation }}</p>
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

.page-title {
  color: white;
  font-size: 2rem;
  margin-bottom: 10px;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
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
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.category-card {
  text-align: center;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
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
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.result-header h2 {
  color: #4facfe;
  font-size: 1.5rem;
}

.luck-badge {
  padding: 8px 20px;
  border-radius: 20px;
  color: white;
  font-weight: 600;
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
}

.interpretation-text,
.advice-text {
  color: #4b5563;
  line-height: 1.6;
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

  .back-btn {
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

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .result-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
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
