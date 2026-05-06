<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const result = ref(null)

const formData = ref({
  name: '',
  gender: '男',
  birthDate: '',
  birthTime: '',
  questionType: '综合'
})

const questionTypes = ['综合', '事业', '财运', '感情', '健康']
const genders = ['男', '女']

function goBack() {
  router.push('/')
}

async function handleGetZiwei() {
  if (!formData.value.name.trim() || !formData.value.birthDate || !formData.value.birthTime) {
    alert('请填写完整信息！')
    return
  }

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const stars = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军']
    const palaces = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '仆役宫', '官禄宫', '田宅宫', '福德宫', '父母宫']
    
    const mainStars = []
    for (let i = 0; i < 4; i++) {
      mainStars.push(stars[Math.floor(Math.random() * stars.length)])
    }
    
    result.value = {
      name: formData.value.name,
      gender: formData.value.gender,
      mainStars: mainStars,
      lifePalace: palaces[Math.floor(Math.random() * palaces.length)],
      analysis: {
        personality: `您的命宫主星为${mainStars[0]}，性格${mainStars[0] === '紫微' ? '稳重有领导力' : mainStars[0] === '天机' ? '聪明机智' : '热情开朗'}，善于${mainStars[0] === '紫微' ? '统筹规划' : mainStars[0] === '天机' ? '分析思考' : '交际应酬'}。`,
        career: `${mainStars[1]}入官禄宫，事业上适合从事${mainStars[1] === '武曲' ? '金融财务' : mainStars[1] === '太阳' ? '公职教育' : '创意艺术'}相关工作，有贵人相助。`,
        wealth: `财帛宫见${mainStars[2]}，财运${mainStars[2] === '天府' ? '稳健丰厚' : mainStars[2] === '太阴' ? '细水长流' : '起伏较大但有机会暴富'}，建议理性理财。`,
        relationship: `夫妻宫主星${mainStars[3]}，感情${mainStars[3] === '天同' ? '甜蜜和谐' : mainStars[3] === '巨门' ? '需要多沟通' : '充满激情'}，宜晚婚更利稳定。`
      }
    }
  } catch (err) {
    alert('紫微排盘失败，请重试')
  } finally {
    loading.value = false
  }
}

function resetZiwei() {
  result.value = null
  formData.value = {
    name: '',
    gender: '男',
    birthDate: '',
    birthTime: '',
    questionType: '综合'
  }
}
</script>

<template>
  <div class="ziwei-page">
    <header class="page-header">
      <button class="back-btn" @click="goBack">← 返回首页</button>
      <h1 class="page-title">⭐ 紫微斗数</h1>
      <p class="page-subtitle">十四主星命盘分析</p>
    </header>

    <div v-if="!result" class="form-section">
      <div class="form-card">
        <div class="form-group">
          <label>👤 姓名</label>
          <input v-model="formData.name" type="text" placeholder="请输入您的姓名" class="form-input" />
        </div>

        <div class="form-group">
          <label>⚥ 性别</label>
          <div class="gender-selector">
            <button v-for="g in genders" :key="g" :class="['gender-btn', { active: formData.gender === g }]" @click="formData.gender = g">
              {{ g === '男' ? '👨' : '👩' }} {{ g }}
            </button>
          </div>
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

        <button class="submit-btn" @click="handleGetZiwei" :disabled="loading">
          {{ loading ? '✨ 正在排盘...' : '⭐ 紫微排盘' }}
        </button>
      </div>
    </div>

    <div v-else class="result-section">
      <div class="result-card">
        <div class="result-header">
          <h2>⭐ 紫微命盘</h2>
          <div class="user-info">
            <span class="user-name">{{ result.name }}</span>
            <span class="user-gender">{{ result.gender }}</span>
          </div>
        </div>

        <div class="stars-section">
          <h3>🌟 主星分布</h3>
          <div class="stars-list">
            <span v-for="(star, index) in result.mainStars" :key="index" class="star-tag">{{ star }}</span>
          </div>
        </div>

        <div class="palace-section">
          <h3>🏛️ 命宫位置</h3>
          <div class="palace-name">{{ result.lifePalace }}</div>
        </div>

        <div class="analysis-content">
          <div class="analysis-item">
            <h4>👤 性格分析</h4>
            <p>{{ result.analysis.personality }}</p>
          </div>
          <div class="analysis-item">
            <h4>💼 事业运势</h4>
            <p>{{ result.analysis.career }}</p>
          </div>
          <div class="analysis-item">
            <h4>💰 财运分析</h4>
            <p>{{ result.analysis.wealth }}</p>
          </div>
          <div class="analysis-item">
            <h4>💕 感情婚姻</h4>
            <p>{{ result.analysis.relationship }}</p>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn-secondary" @click="resetZiwei">🔄 重新排盘</button>
          <button class="btn-primary" @click="goBack">🏠 返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ziwei-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #4B0082 0%, #8A2BE2 100%);
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
  border-color: #8A2BE2;
  outline: none;
  box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.1);
}

.gender-selector {
  display: flex;
  gap: 10px;
}

.gender-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.gender-btn:hover {
  border-color: #8A2BE2;
  background: #faf5ff;
}

.gender-btn.active {
  background: linear-gradient(135deg, #4B0082 0%, #8A2BE2 100%);
  color: white;
  border-color: transparent;
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
  border-color: #8A2BE2;
  background: #faf5ff;
}

.type-btn.active {
  background: linear-gradient(135deg, #4B0082 0%, #8A2BE2 100%);
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
  background: linear-gradient(135deg, #4B0082 0%, #8A2BE2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(138, 43, 226, 0.4);
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
  color: #4B0082;
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

.user-gender {
  padding: 4px 12px;
  background: #f3e8ff;
  color: #7c3aed;
  border-radius: 12px;
  font-size: 0.9rem;
}

.stars-section {
  margin-bottom: 25px;
  padding: 20px;
  background: #faf5ff;
  border-radius: 12px;
}

.stars-section h3 {
  color: #4B0082;
  margin-bottom: 15px;
}

.stars-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.star-tag {
  padding: 8px 16px;
  background: linear-gradient(135deg, #4B0082 0%, #8A2BE2 100%);
  color: white;
  border-radius: 20px;
  font-weight: 500;
}

.palace-section {
  text-align: center;
  margin-bottom: 25px;
  padding: 20px;
  background: #faf5ff;
  border-radius: 12px;
}

.palace-section h3 {
  color: #4B0082;
  margin-bottom: 10px;
}

.palace-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4B0082;
}

.analysis-content {
  margin-bottom: 30px;
}

.analysis-item {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #8A2BE2;
}

.analysis-item h4 {
  color: #4B0082;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.analysis-item p {
  color: #4b5563;
  line-height: 1.6;
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
  background: linear-gradient(135deg, #4B0082 0%, #8A2BE2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(138, 43, 226, 0.4);
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
  border-color: #8A2BE2;
  color: #8A2BE2;
}

@media (max-width: 768px) {
  .ziwei-page {
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

  .result-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
