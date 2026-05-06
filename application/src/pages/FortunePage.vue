<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const result = ref(null)

// 表单数据
const formData = ref({
  name: '',
  birthDate: '',
  questionType: '综合',
  question: ''
})

const questionTypes = ['综合', '事业', '感情', '财运', '健康', '学业']

// 返回首页
function goBack() {
  router.push('/')
}

// 处理算命
async function handleGetFortune() {
  if (!formData.value.name.trim() || !formData.value.birthDate) {
    alert('请填写姓名和出生日期！')
    return
  }
  if (formData.value.questionType === '综合' && !formData.value.question.trim()) {
    alert('请填写具体问题！')
    return
  }

  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const fortunes = [
      '近期运势平稳，宜守不宜攻。保持现状，等待时机。',
      '财运亨通，正财偏财皆有收获。把握投资机会。',
      '感情运势上升，单身者有望遇到心仪对象。',
      '事业运强劲，有贵人相助，适合拓展业务。',
      '健康需注意，劳逸结合，保持规律作息。'
    ]
    
    const advices = [
      '建议多与家人沟通，家庭和睦是事业成功的基础。',
      '保持谦逊态度，虚心学习，会有意想不到的收获。',
      '适当放松心情，不要给自己太大压力。',
      '多关注身边的机会，把握时机，果断行动。',
      '注意身体健康，定期体检，预防胜于治疗。'
    ]
    
    result.value = {
      name: formData.value.name,
      birthDate: formData.value.birthDate,
      questionType: formData.value.questionType,
      question: formData.value.question,
      fortune: fortunes[Math.floor(Math.random() * fortunes.length)],
      advice: advices[Math.floor(Math.random() * advices.length)],
      luckyNumber: Math.floor(Math.random() * 99) + 1,
      luckyColor: ['红色', '蓝色', '绿色', '紫色', '黄色'][Math.floor(Math.random() * 5)],
      luckyDirection: ['东方', '南方', '西方', '北方'][Math.floor(Math.random() * 4)]
    }
  } catch (err) {
    alert('算命失败，请重试')
  } finally {
    loading.value = false
  }
}

// 重新算命
function resetFortune() {
  result.value = null
  formData.value = {
    name: '',
    birthDate: '',
    questionType: '综合',
    question: ''
  }
}
</script>

<template>
  <div class="fortune-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <button class="back-btn" @click="goBack">← 返回首页</button>
      <h1 class="page-title">🔮 传统算命</h1>
      <p class="page-subtitle">基于生辰八字的传统命理分析</p>
    </header>

    <!-- 表单区域 -->
    <div v-if="!result" class="form-section">
      <div class="form-card">
        <div class="form-group">
          <label>👤 姓名</label>
          <input 
            v-model="formData.name" 
            type="text" 
            placeholder="请输入您的姓名"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>🎂 出生日期</label>
          <input 
            v-model="formData.birthDate" 
            type="date"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>🎯 问题类型</label>
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

        <div v-if="formData.questionType === '综合'" class="form-group">
          <label>💭 具体问题</label>
          <input 
            v-model="formData.question" 
            type="text" 
            placeholder="例如：我的未来会怎样？"
            class="form-input"
          />
        </div>

        <button 
          class="submit-btn"
          @click="handleGetFortune"
          :disabled="loading"
        >
          {{ loading ? '✨ 正在占卜中...' : '🔮 开始算命' }}
        </button>
      </div>
    </div>

    <!-- 结果区域 -->
    <div v-else class="result-section">
      <div class="result-card">
        <div class="result-header">
          <h2>✨ 算命结果</h2>
          <div class="user-info">
            <span class="user-name">{{ result.name }}</span>
            <span class="user-date">{{ result.birthDate }}</span>
          </div>
        </div>

        <div class="result-content">
          <div class="result-item">
            <h3>🌟 运势概述</h3>
            <p>{{ result.fortune }}</p>
          </div>

          <div class="result-item">
            <h3>💡 建议指引</h3>
            <p>{{ result.advice }}</p>
          </div>

          <div class="lucky-info">
            <div class="lucky-item">
              <span class="lucky-label">幸运数字</span>
              <span class="lucky-value">{{ result.luckyNumber }}</span>
            </div>
            <div class="lucky-item">
              <span class="lucky-label">幸运颜色</span>
              <span class="lucky-value">{{ result.luckyColor }}</span>
            </div>
            <div class="lucky-item">
              <span class="lucky-label">吉利方位</span>
              <span class="lucky-value">{{ result.luckyDirection }}</span>
            </div>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn-secondary" @click="resetFortune">🔄 重新算命</button>
          <button class="btn-primary" @click="goBack">🏠 返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fortune-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  border-color: #667eea;
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
  border-color: #667eea;
  background: #f5f3ff;
}

.type-btn.active {
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
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.result-header h2 {
  color: #667eea;
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

.user-date {
  color: #6b7280;
  font-size: 0.9rem;
}

.result-content {
  margin-bottom: 30px;
}

.result-item {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.result-item h3 {
  color: #667eea;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.result-item p {
  color: #4b5563;
  line-height: 1.6;
  font-size: 1rem;
}

.lucky-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 25px;
}

.lucky-item {
  text-align: center;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.lucky-label {
  display: block;
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 5px;
}

.lucky-value {
  display: block;
  font-size: 1.3rem;
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
  .fortune-page {
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

  .lucky-info {
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
