<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HePanAnalysis from '../components/HePanAnalysis.vue'

const router = useRouter()
const loading = ref(false)
const result = ref(null)

// 返回首页
function goBack() {
  router.push('/')
}

// 处理合盘分析
async function handleAnalyzeHepan(data) {
  console.log('💑 [合盘页面] 开始合盘分析')
  console.log('💑 [合盘页面] 人员1:', data.person1)
  console.log('💑 [合盘页面] 人员2:', data.person2)
  console.log('💑 [合盘页面] 分析类型:', data.analysisType)
  
  loading.value = true
  
  try {
    // 模拟合盘分析结果
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const analysisTypeMap = {
      marriage: '婚姻合盘',
      partnership: '合伙合盘',
      wealth: '财运合盘'
    }
    
    const typeName = analysisTypeMap[data.analysisType] || '合盘分析'
    const matchScore = Math.floor(Math.random() * 30) + 70 // 70-100分
    
    result.value = {
      type: typeName,
      score: matchScore,
      person1: data.person1,
      person2: data.person2,
      prediction: `${typeName}结果：${data.person1.name} 与 ${data.person2.name}`,
      analysis: {
        wuxing: `两人五行${matchScore > 85 ? '相生相合' : '基本相合'}，${matchScore > 85 ? '是' : '属于'}${data.analysisType === 'marriage' ? '上等婚配' : data.analysisType === 'partnership' ? '理想合作伙伴' : '财运互助组合'}。`,
        character: `${data.person1.name}性格${matchScore % 2 === 0 ? '外向开朗' : '内敛稳重'}，${data.person2.name}性格${matchScore % 2 === 0 ? '细腻温柔' : '果断坚毅'}，两人性格${matchScore > 80 ? '高度互补' : '较为互补'}。`,
        fortune: `未来三年运势${matchScore > 85 ? '持续上升' : '稳中有升'}，建议${data.analysisType === 'marriage' ? '把握良缘，珍惜彼此' : data.analysisType === 'partnership' ? '精诚合作，共创未来' : '共同理财，稳健投资'}。`
      }
    }
    
    console.log('💑 [合盘页面] 分析完成')
  } catch (err) {
    console.error('💑 [合盘页面] 分析失败:', err)
    alert('合盘分析失败，请重试')
  } finally {
    loading.value = false
  }
}

// 重新分析
function resetAnalysis() {
  result.value = null
}
</script>

<template>
  <div class="hepan-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        ← 返回首页
      </button>
      <h1 class="page-title">💑 多人合盘</h1>
      <p class="page-subtitle">分析两人的命理匹配度</p>
    </header>

    <!-- 合盘分析组件 -->
    <div v-if="!result" class="analysis-section">
      <HePanAnalysis
        :loading="loading"
        @analyze-hepan="handleAnalyzeHepan"
      />
    </div>

    <!-- 分析结果 -->
    <div v-else class="result-section">
      <div class="result-card">
        <div class="result-header">
          <h2>{{ result.type }}结果</h2>
          <div class="match-score">
            <span class="score-number">{{ result.score }}</span>
            <span class="score-label">匹配度</span>
          </div>
        </div>

        <div class="couple-info">
          <div class="person-info">
            <span class="person-name">{{ result.person1.name }}</span>
            <span class="person-gender" :class="result.person1.gender">{{ result.person1.gender }}</span>
          </div>
          <div class="vs">💕</div>
          <div class="person-info">
            <span class="person-name">{{ result.person2.name }}</span>
            <span class="person-gender" :class="result.person2.gender">{{ result.person2.gender }}</span>
          </div>
        </div>

        <div class="analysis-details">
          <div class="detail-item">
            <h3>🌟 五行分析</h3>
            <p>{{ result.analysis.wuxing }}</p>
          </div>
          <div class="detail-item">
            <h3>👥 性格互补</h3>
            <p>{{ result.analysis.character }}</p>
          </div>
          <div class="detail-item">
            <h3>📈 运势走向</h3>
            <p>{{ result.analysis.fortune }}</p>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn-secondary" @click="resetAnalysis">
            🔄 重新分析
          </button>
          <button class="btn-primary" @click="goBack">
            🏠 返回首页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hepan-page {
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

.analysis-section {
  max-width: 900px;
  margin: 0 auto;
}

.result-section {
  max-width: 800px;
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
  color: #667eea;
  font-size: 1.5rem;
}

.match-score {
  text-align: center;
}

.score-number {
  display: block;
  font-size: 3rem;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}

.score-label {
  color: #999;
  font-size: 0.9rem;
}

.couple-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.person-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.person-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.person-gender {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.person-gender.男 {
  background: #dbeafe;
  color: #1e40af;
}

.person-gender.女 {
  background: #fce7f3;
  color: #9d174d;
}

.vs {
  font-size: 2rem;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.analysis-details {
  margin-bottom: 30px;
}

.detail-item {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.detail-item h3 {
  color: #667eea;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.detail-item p {
  color: #666;
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
  color: #555;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #667eea;
  color: #667eea;
}

@media (max-width: 768px) {
  .hepan-page {
    padding: 15px;
  }

  .back-btn {
    position: static;
    margin-bottom: 15px;
    width: 100%;
  }

  .page-header {
    margin-bottom: 20px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .result-card {
    padding: 20px;
  }

  .result-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .couple-info {
    flex-direction: column;
    gap: 15px;
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
