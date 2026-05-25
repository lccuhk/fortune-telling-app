<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useShengxiao } from '../composables/useFortuneCommon.js'

const router = useRouter()
const { loading, result, shengxiaoList, questionTypes, hasResult, getShengxiaoFortune, reset } =
  useShengxiao()

const formData = ref({
  selectedShengxiao: null,
  questionType: '年度运势'
})

function goBack() {
  router.push('/')
}

function selectShengxiao(sx) {
  formData.value.selectedShengxiao = sx
}

async function handleGetShengxiao() {
  if (!formData.value.selectedShengxiao) {
    alert('请选择您的生肖！')
    return
  }

  await getShengxiaoFortune(formData.value.selectedShengxiao, formData.value.questionType)
}

function handleReset() {
  reset()
  formData.value = {
    selectedShengxiao: null,
    questionType: '年度运势'
  }
}
</script>

<template>
  <div class="shengxiao-page">
    <header class="page-header">
      <button class="back-btn" @click="goBack">← 返回首页</button>
      <h1 class="page-title">🐲 生肖运势</h1>
      <p class="page-subtitle">基于中国传统生肖的运势分析</p>
    </header>

    <div v-if="!hasResult" class="form-section">
      <div class="form-card">
        <div class="form-group">
          <label>🐲 选择您的生肖</label>
          <div class="shengxiao-grid">
            <button
              v-for="sx in shengxiaoList"
              :key="sx.name"
              :class="['shengxiao-btn', { active: formData.selectedShengxiao?.name === sx.name }]"
              @click="selectShengxiao(sx)"
            >
              <span class="sx-emoji">{{ sx.emoji }}</span>
              <span class="sx-name">{{ sx.name }}</span>
              <span class="sx-years">{{ sx.years.split(', ')[0] }}</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>🎯 运势类型</label>
          <div class="type-buttons">
            <button
              v-for="type in questionTypes"
              :key="type"
              :class="['type-btn', { active: formData.questionType === type }]"
              @click="formData.questionType = type"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <button class="submit-btn" :disabled="loading" @click="handleGetShengxiao">
          {{ loading ? '✨ 正在分析...' : '🐲 查看生肖运势' }}
        </button>
      </div>
    </div>

    <div v-else class="result-section">
      <div class="result-card">
        <div class="result-header">
          <div class="shengxiao-icon">{{ result.shengxiao.emoji }}</div>
          <h2>{{ result.shengxiao.name }}年运势</h2>
          <p class="result-subtitle">{{ result.questionType }}</p>
        </div>

        <div class="score-section">
          <div class="score-item">
            <span class="score-label">综合运势</span>
            <div class="score-bar">
              <div class="score-fill" :style="{ width: result.scores.overall + '%' }"></div>
            </div>
            <span class="score-value">{{ result.scores.overall }}分</span>
          </div>
          <div class="score-item">
            <span class="score-label">事业运</span>
            <div class="score-bar">
              <div class="score-fill career" :style="{ width: result.scores.career + '%' }"></div>
            </div>
            <span class="score-value">{{ result.scores.career }}分</span>
          </div>
          <div class="score-item">
            <span class="score-label">财运</span>
            <div class="score-bar">
              <div class="score-fill wealth" :style="{ width: result.scores.wealth + '%' }"></div>
            </div>
            <span class="score-value">{{ result.scores.wealth }}分</span>
          </div>
          <div class="score-item">
            <span class="score-label">感情运</span>
            <div class="score-bar">
              <div class="score-fill love" :style="{ width: result.scores.love + '%' }"></div>
            </div>
            <span class="score-value">{{ result.scores.love }}分</span>
          </div>
          <div class="score-item">
            <span class="score-label">健康运</span>
            <div class="score-bar">
              <div class="score-fill health" :style="{ width: result.scores.health + '%' }"></div>
            </div>
            <span class="score-value">{{ result.scores.health }}分</span>
          </div>
        </div>

        <div class="lucky-section">
          <div class="lucky-item">
            <span class="lucky-label">幸运数字</span>
            <span class="lucky-value">{{ result.luckyNumber }}</span>
          </div>
          <div class="lucky-item">
            <span class="lucky-label">幸运颜色</span>
            <span class="lucky-value">{{ result.luckyColor }}</span>
          </div>
          <div class="lucky-item">
            <span class="lucky-label">幸运方位</span>
            <span class="lucky-value">{{ result.luckyDirection }}</span>
          </div>
        </div>

        <div class="yi-ji-section">
          <div class="yi-section">
            <h3>✅ 宜</h3>
            <div class="yi-ji-list">
              <span v-for="item in result.yi" :key="item" class="yi-ji-tag yi">{{ item }}</span>
            </div>
          </div>
          <div class="ji-section">
            <h3>❌ 忌</h3>
            <div class="yi-ji-list">
              <span v-for="item in result.ji" :key="item" class="yi-ji-tag ji">{{ item }}</span>
            </div>
          </div>
        </div>

        <div class="analysis-section">
          <h3>📖 运势分析</h3>
          <p>{{ result.analysis }}</p>
        </div>

        <div class="result-actions">
          <button class="btn-primary" @click="handleGetShengxiao">🔄 重新分析</button>
          <button class="btn-secondary" @click="handleReset">← 返回选择</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shengxiao-page {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding-top: 60px;
}

.back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  z-index: 100;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: white;
  transform: translateY(-2px);
}

.page-title {
  font-size: 2rem;
  color: white;
  margin: 0 0 10px 0;
}

.page-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.form-section,
.result-section {
  max-width: 800px;
  margin: 0 auto;
}

.form-card,
.result-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 15px;
  font-weight: 600;
  color: #374151;
  font-size: 1.1rem;
}

.shengxiao-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.shengxiao-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 20px 10px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.shengxiao-btn:hover {
  border-color: #ff6b6b;
  transform: translateY(-2px);
}

.shengxiao-btn.active {
  border-color: #ff6b6b;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%);
}

.sx-emoji {
  font-size: 2rem;
}

.sx-name {
  font-weight: 600;
  color: #374151;
}

.sx-years {
  font-size: 0.75rem;
  color: #6b7280;
}

.type-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.type-btn {
  padding: 10px 20px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.type-btn:hover {
  border-color: #ff6b6b;
}

.type-btn.active {
  border-color: #ff6b6b;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%);
  color: #ff6b6b;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 107, 107, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.result-header {
  text-align: center;
  margin-bottom: 30px;
}

.shengxiao-icon {
  font-size: 4rem;
  margin-bottom: 10px;
}

.result-header h2 {
  margin: 0 0 5px 0;
  color: #374151;
}

.result-subtitle {
  margin: 0;
  color: #ff6b6b;
  font-weight: 500;
}

.score-section {
  margin-bottom: 30px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.score-label {
  width: 80px;
  font-weight: 500;
  color: #374151;
}

.score-bar {
  flex: 1;
  height: 20px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b 0%, #ff8e53 100%);
  border-radius: 10px;
  transition: width 1s ease;
}

.score-fill.career {
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
}

.score-fill.wealth {
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
}

.score-fill.love {
  background: linear-gradient(90deg, #ec4899 0%, #f472b6 100%);
}

.score-fill.health {
  background: linear-gradient(90deg, #22c55e 0%, #4ade80 100%);
}

.score-value {
  width: 50px;
  text-align: right;
  font-weight: 600;
  color: #374151;
}

.lucky-section {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%);
  border-radius: 12px;
}

.lucky-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.lucky-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.lucky-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ff6b6b;
}

.yi-ji-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.yi-section,
.ji-section {
  padding: 20px;
  border-radius: 12px;
}

.yi-section {
  background: rgba(34, 197, 94, 0.1);
}

.ji-section {
  background: rgba(239, 68, 68, 0.1);
}

.yi-section h3,
.ji-section h3 {
  margin: 0 0 15px 0;
  font-size: 1rem;
}

.yi-ji-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.yi-ji-tag {
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.yi-ji-tag.yi {
  background: #22c55e;
  color: white;
}

.yi-ji-tag.ji {
  background: #ef4444;
  color: white;
}

.analysis-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.analysis-section h3 {
  margin: 0 0 10px 0;
  color: #374151;
}

.analysis-section p {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
}

.result-actions {
  display: flex;
  gap: 15px;
}

.result-actions .btn-primary,
.result-actions .btn-secondary {
  flex: 1;
}

.btn-primary {
  padding: 15px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 107, 107, 0.4);
}

.btn-secondary {
  padding: 15px;
  background: white;
  color: #ff6b6b;
  border: 2px solid #ff6b6b;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #ff6b6b;
  color: white;
}

@media (max-width: 768px) {
  .shengxiao-page {
    padding: 10px;
  }

  .back-btn {
    position: static;
    margin-bottom: 20px;
  }

  .page-header {
    padding-top: 0;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .form-card,
  .result-card {
    padding: 20px;
  }

  .shengxiao-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .type-buttons {
    justify-content: center;
  }

  .yi-ji-section {
    grid-template-columns: 1fr;
  }

  .result-actions {
    flex-direction: column;
  }
}
</style>
