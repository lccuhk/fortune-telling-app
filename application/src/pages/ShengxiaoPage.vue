<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const result = ref(null)

const shengxiaoList = [
  { name: '鼠', emoji: '🐭', years: '2020, 2008, 1996, 1984, 1972, 1960' },
  { name: '牛', emoji: '🐮', years: '2021, 2009, 1997, 1985, 1973, 1961' },
  { name: '虎', emoji: '🐯', years: '2022, 2010, 1998, 1986, 1974, 1962' },
  { name: '兔', emoji: '🐰', years: '2023, 2011, 1999, 1987, 1975, 1963' },
  { name: '龙', emoji: '🐲', years: '2024, 2012, 2000, 1988, 1976, 1964' },
  { name: '蛇', emoji: '🐍', years: '2025, 2013, 2001, 1989, 1977, 1965' },
  { name: '马', emoji: '🐴', years: '2026, 2014, 2002, 1990, 1978, 1966' },
  { name: '羊', emoji: '🐑', years: '2027, 2015, 2003, 1991, 1979, 1967' },
  { name: '猴', emoji: '🐵', years: '2028, 2016, 2004, 1992, 1980, 1968' },
  { name: '鸡', emoji: '🐔', years: '2029, 2017, 2005, 1993, 1981, 1969' },
  { name: '狗', emoji: '🐶', years: '2030, 2018, 2006, 1994, 1982, 1970' },
  { name: '猪', emoji: '🐷', years: '2031, 2019, 2007, 1995, 1983, 1971' }
]

const questionTypes = ['年度运势', '财运', '感情', '事业', '健康', '贵人运']

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

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const scores = {
      overall: Math.floor(Math.random() * 40) + 60,
      career: Math.floor(Math.random() * 40) + 60,
      wealth: Math.floor(Math.random() * 40) + 60,
      love: Math.floor(Math.random() * 40) + 60,
      health: Math.floor(Math.random() * 40) + 60
    }
    
    const yiList = ['结婚', '搬家', '开业', '签约', '出行', '求职', '投资', '学习']
    const jiList = ['争吵', '借贷', '冒险', '冲动消费', '熬夜', '拖延']
    
    result.value = {
      shengxiao: formData.value.selectedShengxiao,
      questionType: formData.value.questionType,
      scores: scores,
      yi: yiList.slice(0, 4),
      ji: jiList.slice(0, 3),
      luckyNumber: Math.floor(Math.random() * 99) + 1,
      luckyColor: ['红色', '金色', '绿色', '蓝色', '紫色'][Math.floor(Math.random() * 5)],
      luckyDirection: ['东南', '西北', '正南', '正北', '西南'][Math.floor(Math.random() * 5)],
      analysis: `${formData.value.selectedShengxiao.name}年生肖的朋友，今年整体运势${scores.overall >= 80 ? '相当不错' : scores.overall >= 70 ? '较为平稳' : '需要多加注意'}。事业上${scores.career >= 80 ? '有贵人相助，升职加薪的机会较多' : '需要脚踏实地，稳扎稳打'}。财运方面${scores.wealth >= 80 ? '正财偏财都有收获' : '宜守不宜攻，理性投资'}。感情${scores.love >= 80 ? '甜蜜美满，单身者有望脱单' : '需要多沟通理解'}。健康方面${scores.health >= 80 ? '状态良好' : '要注意劳逸结合'}。`
    }
  } catch (err) {
    alert('生肖运势查询失败，请重试')
  } finally {
    loading.value = false
  }
}

function resetShengxiao() {
  result.value = null
  formData.value.selectedShengxiao = null
  formData.value.questionType = '年度运势'
}
</script>

<template>
  <div class="shengxiao-page">
    <header class="page-header">
      <button class="back-btn" @click="goBack">← 返回首页</button>
      <h1 class="page-title">🐲 生肖运势</h1>
      <p class="page-subtitle">基于中国传统生肖的运势分析</p>
    </header>

    <div v-if="!result" class="form-section">
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

        <button class="submit-btn" @click="handleGetShengxiao" :disabled="loading">
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

        <div class="analysis-section">
          <h3>📊 运势详解</h3>
          <p>{{ result.analysis }}</p>
        </div>

        <div class="lucky-section">
          <div class="lucky-item">
            <span class="lucky-icon">🔢</span>
            <span class="lucky-label">幸运数字</span>
            <span class="lucky-value">{{ result.luckyNumber }}</span>
          </div>
          <div class="lucky-item">
            <span class="lucky-icon">🎨</span>
            <span class="lucky-label">幸运颜色</span>
            <span class="lucky-value">{{ result.luckyColor }}</span>
          </div>
          <div class="lucky-item">
            <span class="lucky-icon">🧭</span>
            <span class="lucky-label">吉利方位</span>
            <span class="lucky-value">{{ result.luckyDirection }}</span>
          </div>
        </div>

        <div class="yiji-section">
          <div class="yi-list">
            <h4>✅ 宜</h4>
            <span v-for="(item, index) in result.yi" :key="index" class="yiji-tag yi">{{ item }}</span>
          </div>
          <div class="ji-list">
            <h4>❌ 忌</h4>
            <span v-for="(item, index) in result.ji" :key="index" class="yiji-tag ji">{{ item }}</span>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn-secondary" @click="resetShengxiao">🔄 重新查询</button>
          <button class="btn-primary" @click="goBack">🏠 返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shengxiao-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
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

.shengxiao-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.shengxiao-btn {
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

.shengxiao-btn:hover {
  border-color: #FF6B6B;
  background: #fff5f5;
  transform: translateY(-2px);
}

.shengxiao-btn.active {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  color: white;
  border-color: transparent;
}

.sx-emoji {
  font-size: 2rem;
  margin-bottom: 5px;
}

.sx-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 3px;
}

.sx-years {
  font-size: 0.75rem;
  opacity: 0.7;
}

.type-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.type-btn {
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.type-btn:hover {
  border-color: #FF6B6B;
  background: #fff5f5;
}

.type-btn.active {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
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
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
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

.shengxiao-icon {
  font-size: 4rem;
  margin-bottom: 10px;
}

.result-header h2 {
  color: #FF6B6B;
  font-size: 1.8rem;
  margin-bottom: 5px;
}

.result-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.score-section {
  margin-bottom: 30px;
}

.score-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 15px;
}

.score-label {
  width: 80px;
  font-weight: 600;
  color: #374151;
}

.score-bar {
  flex: 1;
  height: 10px;
  background: #e5e7eb;
  border-radius: 5px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.score-fill.career { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.score-fill.wealth { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.score-fill.love { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.score-fill.health { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }

.score-value {
  width: 50px;
  text-align: right;
  font-weight: 600;
  color: #FF6B6B;
}

.analysis-section {
  margin-bottom: 25px;
  padding: 20px;
  background: #fff5f5;
  border-radius: 12px;
}

.analysis-section h3 {
  color: #FF6B6B;
  margin-bottom: 10px;
}

.analysis-section p {
  color: #4b5563;
  line-height: 1.6;
}

.lucky-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.lucky-item {
  text-align: center;
  padding: 15px;
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  border-radius: 12px;
  color: white;
}

.lucky-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 5px;
}

.lucky-label {
  display: block;
  font-size: 0.8rem;
  opacity: 0.9;
  margin-bottom: 5px;
}

.lucky-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
}

.yiji-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.yi-list, .ji-list {
  padding: 15px;
  border-radius: 12px;
}

.yi-list {
  background: #f0fdf4;
}

.ji-list {
  background: #fef2f2;
}

.yi-list h4 {
  color: #16a34a;
  margin-bottom: 10px;
}

.ji-list h4 {
  color: #dc2626;
  margin-bottom: 10px;
}

.yiji-tag {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  margin: 3px;
}

.yiji-tag.yi {
  background: #bbf7d0;
  color: #16a34a;
}

.yiji-tag.ji {
  background: #fecaca;
  color: #dc2626;
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
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
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
  border-color: #FF6B6B;
  color: #FF6B6B;
}

@media (max-width: 768px) {
  .shengxiao-page {
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

  .shengxiao-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .type-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  .lucky-section {
    grid-template-columns: 1fr;
  }

  .yiji-section {
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
