<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const result = ref(null)

const formData = ref({
  surname: '',
  name: '',
  gender: '男'
})

const genders = ['男', '女']

function goBack() {
  router.push('/')
}

async function handleGetXingming() {
  if (!formData.value.surname.trim() || !formData.value.name.trim()) {
    alert('请填写完整的姓名！')
    return
  }

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const tiange = Math.floor(Math.random() * 20) + 1
    const renge = Math.floor(Math.random() * 20) + 1
    const dige = Math.floor(Math.random() * 20) + 1
    const waige = Math.floor(Math.random() * 20) + 1
    const zongge = tiange + renge + dige
    
    const getLuckLevel = (num) => {
      if (num >= 15) return { level: '大吉', color: '#16a34a' }
      if (num >= 10) return { level: '吉', color: '#22c55e' }
      if (num >= 6) return { level: '中', color: '#eab308' }
      return { level: '凶', color: '#dc2626' }
    }
    
    result.value = {
      fullName: formData.value.surname + formData.value.name,
      gender: formData.value.gender,
      wuge: {
        tiange: { num: tiange, ...getLuckLevel(tiange) },
        renge: { num: renge, ...getLuckLevel(renge) },
        dige: { num: dige, ...getLuckLevel(dige) },
        waige: { num: waige, ...getLuckLevel(waige) },
        zongge: { num: zongge, ...getLuckLevel(zongge) }
      },
      analysis: {
        personality: `您的名字五格中，人格数为${renge}，代表${renge >= 10 ? '性格稳重，做事有条理，能够得到他人的信任和支持' : '性格较为急躁，需要多加磨练，学会控制情绪'}。`,
        career: `地格数为${dige}，对事业发展${dige >= 10 ? '非常有利，适合从事管理或专业技术工作' : '有一定挑战，需要脚踏实地，循序渐进'}。`,
        relationship: `外格数为${waige}，人际关系${waige >= 10 ? '良好，容易结交贵人，得到他人帮助' : '需要多加维护，注意与人沟通的方式方法'}。`,
        overall: `总格数为${zongge}，整体运势${zongge >= 25 ? '极佳，一生顺遂，事业有成' : zongge >= 15 ? '较好，只要努力就能有所成就' : '平平，需要付出更多努力'}。`
      }
    }
  } catch (err) {
    alert('姓名分析失败，请重试')
  } finally {
    loading.value = false
  }
}

function resetXingming() {
  result.value = null
  formData.value = {
    surname: '',
    name: '',
    gender: '男'
  }
}
</script>

<template>
  <div class="xingming-page">
    <header class="page-header">
      <button class="back-btn" @click="goBack">← 返回首页</button>
      <h1 class="page-title">📝 姓名学</h1>
      <p class="page-subtitle">基于五格剖象法的姓名分析</p>
    </header>

    <div v-if="!result" class="form-section">
      <div class="form-card">
        <div class="form-row">
          <div class="form-group half">
            <label>姓氏</label>
            <input v-model="formData.surname" type="text" placeholder="如：张" class="form-input" />
          </div>
          <div class="form-group half">
            <label>名字</label>
            <input v-model="formData.name" type="text" placeholder="如：三" class="form-input" />
          </div>
        </div>

        <div class="form-group">
          <label>性别</label>
          <div class="gender-selector">
            <button v-for="g in genders" :key="g" :class="['gender-btn', { active: formData.gender === g }]" @click="formData.gender = g">
              {{ g === '男' ? '👨' : '👩' }} {{ g }}
            </button>
          </div>
        </div>

        <button class="submit-btn" @click="handleGetXingming" :disabled="loading">
          {{ loading ? '✨ 正在分析...' : '📝 开始分析' }}
        </button>
      </div>
    </div>

    <div v-else class="result-section">
      <div class="result-card">
        <div class="result-header">
          <h2>{{ result.fullName }}</h2>
          <span class="gender-tag">{{ result.gender }}</span>
        </div>

        <div class="wuge-section">
          <h3>五格数理</h3>
          <div class="wuge-grid">
            <div class="wuge-item">
              <span class="wuge-name">天格</span>
              <span class="wuge-num">{{ result.wuge.tiange.num }}</span>
              <span class="wuge-level" :style="{ color: result.wuge.tiange.color }">{{ result.wuge.tiange.level }}</span>
            </div>
            <div class="wuge-item">
              <span class="wuge-name">人格</span>
              <span class="wuge-num">{{ result.wuge.renge.num }}</span>
              <span class="wuge-level" :style="{ color: result.wuge.renge.color }">{{ result.wuge.renge.level }}</span>
            </div>
            <div class="wuge-item">
              <span class="wuge-name">地格</span>
              <span class="wuge-num">{{ result.wuge.dige.num }}</span>
              <span class="wuge-level" :style="{ color: result.wuge.dige.color }">{{ result.wuge.dige.level }}</span>
            </div>
            <div class="wuge-item">
              <span class="wuge-name">外格</span>
              <span class="wuge-num">{{ result.wuge.waige.num }}</span>
              <span class="wuge-level" :style="{ color: result.wuge.waige.color }">{{ result.wuge.waige.level }}</span>
            </div>
            <div class="wuge-item zongge">
              <span class="wuge-name">总格</span>
              <span class="wuge-num">{{ result.wuge.zongge.num }}</span>
              <span class="wuge-level" :style="{ color: result.wuge.zongge.color }">{{ result.wuge.zongge.level }}</span>
            </div>
          </div>
        </div>

        <div class="analysis-section">
          <div class="analysis-item">
            <h4>👤 性格分析</h4>
            <p>{{ result.analysis.personality }}</p>
          </div>
          <div class="analysis-item">
            <h4>💼 事业运势</h4>
            <p>{{ result.analysis.career }}</p>
          </div>
          <div class="analysis-item">
            <h4>🤝 人际关系</h4>
            <p>{{ result.analysis.relationship }}</p>
          </div>
          <div class="analysis-item">
            <h4>🌟 综合运势</h4>
            <p>{{ result.analysis.overall }}</p>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn-secondary" @click="resetXingming">🔄 重新分析</button>
          <button class="btn-primary" @click="goBack">🏠 返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.xingming-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
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

.form-row {
  display: flex;
  gap: 15px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group.half {
  flex: 1;
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
  border-color: #11998e;
  outline: none;
  box-shadow: 0 0 0 3px rgba(17, 153, 142, 0.1);
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
  border-color: #11998e;
  background: #f0fdf4;
}

.gender-btn.active {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
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
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(17, 153, 142, 0.4);
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
  color: #11998e;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.gender-tag {
  padding: 4px 16px;
  background: #f0fdf4;
  color: #11998e;
  border-radius: 12px;
  font-size: 0.9rem;
}

.wuge-section {
  margin-bottom: 30px;
}

.wuge-section h3 {
  color: #11998e;
  margin-bottom: 20px;
  text-align: center;
}

.wuge-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.wuge-item {
  text-align: center;
  padding: 15px 10px;
  background: #f0fdf4;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.wuge-item.zongge {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.wuge-name {
  font-size: 0.85rem;
  color: #6b7280;
}

.wuge-item.zongge .wuge-name {
  color: rgba(255, 255, 255, 0.9);
}

.wuge-num {
  font-size: 1.5rem;
  font-weight: 700;
  color: #11998e;
}

.wuge-item.zongge .wuge-num {
  color: white;
}

.wuge-level {
  font-size: 0.8rem;
  font-weight: 600;
}

.analysis-section {
  margin-bottom: 30px;
}

.analysis-item {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #11998e;
}

.analysis-item h4 {
  color: #11998e;
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
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(17, 153, 142, 0.4);
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
  border-color: #11998e;
  color: #11998e;
}

@media (max-width: 768px) {
  .xingming-page {
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

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .wuge-grid {
    grid-template-columns: repeat(3, 1fr);
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
