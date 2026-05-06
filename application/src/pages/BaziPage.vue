<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const result = ref(null)

const formData = ref({
  name: '',
  birthDate: '',
  birthTime: '',
  questionType: '综合'
})

const questionTypes = ['综合', '事业', '财运', '感情', '健康', '性格']

function goBack() {
  router.push('/')
}

async function handleGetBazi() {
  if (!formData.value.name.trim() || !formData.value.birthDate || !formData.value.birthTime) {
    alert('请填写完整信息！')
    return
  }

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
    const dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    
    result.value = {
      name: formData.value.name,
      bazi: {
        year: tiangan[Math.floor(Math.random() * 10)] + dizhi[Math.floor(Math.random() * 12)],
        month: tiangan[Math.floor(Math.random() * 10)] + dizhi[Math.floor(Math.random() * 12)],
        day: tiangan[Math.floor(Math.random() * 10)] + dizhi[Math.floor(Math.random() * 12)],
        hour: tiangan[Math.floor(Math.random() * 10)] + dizhi[Math.floor(Math.random() * 12)]
      },
      wuxing: ['金', '木', '水', '火', '土'][Math.floor(Math.random() * 5)],
      analysis: '您的八字五行平衡，命格清奇。事业上有贵人相助，财运亨通。感情方面需要多加耐心，健康方面注意劳逸结合。',
      advice: '建议多行善积德，广结善缘。在重要决策时多听取长辈意见，会有意想不到的收获。'
    }
  } catch (err) {
    alert('八字排盘失败，请重试')
  } finally {
    loading.value = false
  }
}

function resetBazi() {
  result.value = null
  formData.value = {
    name: '',
    birthDate: '',
    birthTime: '',
    questionType: '综合'
  }
}
</script>

<template>
  <div class="bazi-page">
    <header class="page-header">
      <button class="back-btn" @click="goBack">← 返回首页</button>
      <h1 class="page-title">🎯 八字算命</h1>
      <p class="page-subtitle">基于天干地支的传统命理分析</p>
    </header>

    <div v-if="!result" class="form-section">
      <div class="form-card">
        <div class="form-group">
          <label>👤 姓名</label>
          <input v-model="formData.name" type="text" placeholder="请输入您的姓名" class="form-input" />
        </div>

        <div class="form-group">
          <label>🎂 出生日期</label>
          <input v-model="formData.birthDate" type="date" class="form-input" />
        </div>

        <div class="form-group">
          <label>⏰ 出生时间</label>
          <input v-model="formData.birthTime" type="time" class="form-input" />
        </div>

        <div class="form-group">
          <label>🎯 问题类型</label>
          <div class="type-buttons">
            <button v-for="type in questionTypes" :key="type" :class="['type-btn', { active: formData.questionType === type }]" @click="formData.questionType = type">
              {{ type }}
            </button>
          </div>
        </div>

        <button class="submit-btn bazi-btn" @click="handleGetBazi" :disabled="loading">
          {{ loading ? '✨ 正在排盘...' : '🎯 八字排盘' }}
        </button>
      </div>
    </div>

    <div v-else class="result-section">
      <div class="result-card">
        <div class="result-header">
          <h2>🎯 八字排盘结果</h2>
          <div class="user-info">
            <span class="user-name">{{ result.name }}</span>
          </div>
        </div>

        <div class="bazi-display">
          <div class="bazi-item">
            <span class="bazi-label">年柱</span>
            <span class="bazi-value">{{ result.bazi.year }}</span>
          </div>
          <div class="bazi-item">
            <span class="bazi-label">月柱</span>
            <span class="bazi-value">{{ result.bazi.month }}</span>
          </div>
          <div class="bazi-item">
            <span class="bazi-label">日柱</span>
            <span class="bazi-value">{{ result.bazi.day }}</span>
          </div>
          <div class="bazi-item">
            <span class="bazi-label">时柱</span>
            <span class="bazi-value">{{ result.bazi.hour }}</span>
          </div>
        </div>

        <div class="wuxing-section">
          <h3>🌟 五行属性</h3>
          <div class="wuxing-value">{{ result.wuxing }}</div>
        </div>

        <div class="result-content">
          <div class="result-item">
            <h3>📊 命理分析</h3>
            <p>{{ result.analysis }}</p>
          </div>
          <div class="result-item">
            <h3>💡 人生建议</h3>
            <p>{{ result.advice }}</p>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn-secondary" @click="resetBazi">🔄 重新排盘</button>
          <button class="btn-primary" @click="goBack">🏠 返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bazi-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
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
  max-width: 500px;
  margin: 0 auto;
}

.form-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

.form-input {
  width: 100%;
  padding: 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  background: #ffffff;
  color: #1f2937;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #8B4513;
  outline: none;
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.type-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.type-btn {
  padding: 10px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.type-btn:hover {
  border-color: #8B4513;
  background: #faf5f0;
}

.type-btn.active {
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
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
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.4);
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
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.result-header h2 {
  color: #8B4513;
  font-size: 1.8rem;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.user-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
}

.bazi-display {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.bazi-item {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  border-radius: 12px;
  color: white;
}

.bazi-label {
  display: block;
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 8px;
}

.bazi-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
}

.wuxing-section {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #faf5f0;
  border-radius: 12px;
}

.wuxing-section h3 {
  color: #8B4513;
  margin-bottom: 10px;
}

.wuxing-value {
  font-size: 2rem;
  font-weight: 700;
  color: #8B4513;
}

.result-content {
  margin-bottom: 30px;
}

.result-item {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #8B4513;
}

.result-item h3 {
  color: #8B4513;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.result-item p {
  color: #4b5563;
  line-height: 1.6;
  font-size: 1rem;
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
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.4);
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
  border-color: #8B4513;
  color: #8B4513;
}

@media (max-width: 768px) {
  .bazi-page {
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

  .type-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  .bazi-display {
    grid-template-columns: repeat(2, 1fr);
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
