<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const result = ref(null)

const tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

const tianganWuxing = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
}

const dizhiWuxing = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水'
}

const dizhiShengxiao = {
  '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
  '辰': '龙', '巳': '蛇', '午': '马', '未': '羊',
  '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪'
}

const wuxingColors = {
  '金': '#f59e0b',
  '木': '#22c55e',
  '水': '#3b82f6',
  '火': '#ef4444',
  '土': '#a16207'
}

const wuxingEmojis = {
  '金': '⚔️',
  '木': '🌲',
  '水': '💧',
  '火': '🔥',
  '土': '🏔️'
}

const shishen = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印']

const formData = ref({
  name: '',
  birthDate: '',
  birthTime: '',
  gender: '男',
  questionType: '综合'
})

const questionTypes = ['综合', '事业', '财运', '感情', '健康', '性格']
const genders = ['男', '女']

function goBack() {
  router.push('/')
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateBazi() {
  const yearTG = getRandomItem(tiangan)
  const yearDZ = getRandomItem(dizhi)
  const monthTG = getRandomItem(tiangan)
  const monthDZ = getRandomItem(dizhi)
  const dayTG = getRandomItem(tiangan)
  const dayDZ = getRandomItem(dizhi)
  const hourTG = getRandomItem(tiangan)
  const hourDZ = getRandomItem(dizhi)
  
  return {
    year: { tg: yearTG, dz: yearDZ, full: yearTG + yearDZ },
    month: { tg: monthTG, dz: monthDZ, full: monthTG + monthDZ },
    day: { tg: dayTG, dz: dayDZ, full: dayTG + dayDZ },
    hour: { tg: hourTG, dz: hourDZ, full: hourTG + hourDZ }
  }
}

function calculateWuxingCount(bazi) {
  const counts = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 }
  
  const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour]
  
  pillars.forEach(pillar => {
    counts[tianganWuxing[pillar.tg]]++
    counts[dizhiWuxing[pillar.dz]]++
  })
  
  return counts
}

function getMainWuxing(counts) {
  let max = 0
  let main = '土'
  
  Object.entries(counts).forEach(([wuxing, count]) => {
    if (count > max) {
      max = count
      main = wuxing
    }
  })
  
  return main
}

function getWuxingBalance(counts) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const avg = total / 5
  
  const balance = {}
  Object.entries(counts).forEach(([wuxing, count]) => {
    const diff = count - avg
    if (diff > 1) {
      balance[wuxing] = '过旺'
    } else if (diff < -1) {
      balance[wuxing] = '偏弱'
    } else {
      balance[wuxing] = '平衡'
    }
  })
  
  return balance
}

function generateAnalysis(bazi, wuxingCounts, mainWuxing, balance, questionType) {
  const dayTG = bazi.day.tg
  const dayDZ = bazi.day.dz
  const dayWuxing = tianganWuxing[dayTG]
  
  const templates = {
    '综合': [
      `您的日主为${dayTG}${dayDZ}，五行属${dayWuxing}。${dayTG}日出生的人，性格${dayTG === '甲' ? '正直刚强，有领导才能' : dayTG === '乙' ? '温柔善良，善于协调' : dayTG === '丙' ? '热情开朗，积极向上' : dayTG === '丁' ? '细腻敏感，富有艺术气息' : dayTG === '戊' ? '稳重踏实，值得信赖' : dayTG === '己' ? '包容大度，有耐心' : dayTG === '庚' ? '果断坚决，讲义气' : dayTG === '辛' ? '精致细腻，追求完美' : dayTG === '壬' ? '聪明灵活，善于变通' : '智慧深沉，有谋略'}。`,
      `从五行来看，您的${mainWuxing}${wuxingEmojis[mainWuxing]}最为旺盛，这意味着您在${mainWuxing === '金' ? '决断力和执行力' : mainWuxing === '木' ? '创造力和成长力' : mainWuxing === '水' ? '智慧和适应力' : mainWuxing === '火' ? '热情和表现力' : '稳定性和包容力'}方面具有天赋。`,
      `整体命格${Object.values(balance).every(b => b === '平衡') ? '五行平衡，命格清奇' : '五行有偏，需要注意调和'}。建议在日常生活中多关注${Object.entries(balance).find(([_, b]) => b === '偏弱')?.[0] || '各方面'}的补充。`
    ],
    '事业': [
      `您的事业运势${mainWuxing === '金' || mainWuxing === '火' ? '较为强劲' : '平稳发展'}。${dayTG}日出生的人在事业上${dayTG === '甲' || dayTG === '庚' ? '适合担任领导职务' : dayTG === '丙' || dayTG === '丁' ? '适合从事创意或服务行业' : '适合稳定发展的职业'}。`,
      `从八字来看，您在${bazi.year.tg === '庚' || bazi.year.tg === '辛' ? '金融、法律' : bazi.year.tg === '甲' || bazi.year.tg === '乙' ? '教育、文化' : bazi.year.tg === '丙' || bazi.year.tg === '丁' ? '媒体、艺术' : bazi.year.tg === '壬' || bazi.year.tg === '癸' ? '科研、技术' : '房地产、建筑'}等领域会有较好的发展。`,
      `建议：在工作中多发挥${dayWuxing}的特质，${dayWuxing === '金' ? '果断决策' : dayWuxing === '木' ? '创新思维' : dayWuxing === '水' ? '灵活应变' : dayWuxing === '火' ? '热情投入' : '稳重踏实'}，会有意想不到的收获。`
    ],
    '财运': [
      `您的财运${mainWuxing === '金' || mainWuxing === '土' ? '较为旺盛' : '需要努力积累'}。${dayTG}日出生的人在理财方面${dayTG === '戊' || dayTG === '己' ? '善于储蓄' : dayTG === '壬' || dayTG === '癸' ? '善于投资' : '需要理性规划'}。`,
      `从五行来看，${balance['金'] === '平衡' || balance['金'] === '过旺' ? '正财偏财都有机会' : '需要注意守财'}。建议在${mainWuxing === '水' ? '流动性强的行业' : mainWuxing === '土' ? '固定资产' : '多元化'}方面进行投资。`,
      `提醒：财运起伏是正常的，保持平常心，理性投资，避免冲动决策。`
    ],
    '感情': [
      `您的感情运势${mainWuxing === '木' || mainWuxing === '水' ? '较为浪漫' : '需要用心经营'}。${dayTG}日出生的人在感情中${dayTG === '乙' || dayTG === '丁' ? '温柔体贴' : dayTG === '甲' || dayTG === '庚' ? '主动积极' : '稳重可靠'}。`,
      `${formData.value.gender === '男' ? '您的正财代表妻子' : '您的正官代表丈夫'}，从八字来看，您的感情生活${bazi.day.dz === '子' || bazi.day.dz === '午' ? '较为热烈' : bazi.day.dz === '丑' || bazi.day.dz === '未' ? '需要磨合' : '平稳发展'}。`,
      `建议：在感情中多沟通，${dayWuxing === '火' ? '控制情绪' : dayWuxing === '金' ? '学会妥协' : '保持热情'}，珍惜眼前人。`
    ],
    '健康': [
      `您的健康运势${mainWuxing === '土' || mainWuxing === '水' ? '较为平稳' : '需要注意调养'}。${dayTG}日出生的人需要特别注意${dayWuxing === '木' ? '肝胆' : dayWuxing === '火' ? '心脏' : dayWuxing === '土' ? '脾胃' : dayWuxing === '金' ? '呼吸系统' : '肾脏'}方面的保养。`,
      `从五行平衡来看，${Object.entries(balance).find(([w, b]) => b !== '平衡') ? '五行有偏，建议通过饮食和运动来调和' : '五行平衡，继续保持良好的生活习惯'}。`,
      `建议：保持规律作息，适当运动，${dayWuxing === '火' ? '避免熬夜' : dayWuxing === '金' ? '注意保暖' : dayWuxing === '水' ? '避免过度劳累' : '保持心情愉悦'}。`
    ],
    '性格': [
      `您的日主${dayTG}${dayDZ}，五行属${dayWuxing}。${dayTG}日出生的人性格特点：${dayTG === '甲' ? '正直、有领导力、但有时过于固执' : dayTG === '乙' ? '温柔、善解人意、但有时过于优柔' : dayTG === '丙' ? '热情、乐观、但有时冲动' : dayTG === '丁' ? '细腻、敏感、但有时多疑' : dayTG === '戊' ? '稳重、可靠、但有时保守' : dayTG === '己' ? '包容、耐心、但有时被动' : dayTG === '庚' ? '果断、义气、但有时强硬' : dayTG === '辛' ? '精致、完美、但有时挑剔' : dayTG === '壬' ? '聪明、灵活、但有时善变' : '智慧、深沉、但有时孤僻'}。`,
      `您的生肖属${dizhiShengxiao[bazi.year.dz]}，这为您的性格增添了${dizhiShengxiao[bazi.year.dz] === '龙' || dizhiShengxiao[bazi.year.dz] === '虎' ? '领导力和魄力' : dizhiShengxiao[bazi.year.dz] === '兔' || dizhiShengxiao[bazi.year.dz] === '羊' ? '温柔和善良' : dizhiShengxiao[bazi.year.dz] === '马' || dizhiShengxiao[bazi.year.dz] === '猴' ? '活力和智慧' : '稳重和坚持'}的特质。`,
      `总体来说，您是一个${mainWuxing === '金' ? '果断、讲义气' : mainWuxing === '木' ? '有创造力、积极向上' : mainWuxing === '水' ? '聪明、善于变通' : mainWuxing === '火' ? '热情、有魅力' : '稳重、值得信赖'}的人。`
    ]
  }
  
  return templates[questionType] || templates['综合']
}

function generateAdvice(mainWuxing, balance) {
  const advices = []
  
  if (balance[mainWuxing] === '过旺') {
    advices.push(`您的${mainWuxing}过旺，建议适当克制，避免${mainWuxing === '金' ? '过于固执' : mainWuxing === '木' ? '过于冲动' : mainWuxing === '水' ? '过于投机' : mainWuxing === '火' ? '过于急躁' : '过于保守'}。`)
  }
  
  const weakWuxing = Object.entries(balance).find(([_, b]) => b === '偏弱')?.[0]
  if (weakWuxing) {
    advices.push(`您的${weakWuxing}偏弱，建议多补充：${weakWuxing === '金' ? '多穿白色、金色衣物，多吃辛辣食物' : weakWuxing === '木' ? '多穿绿色衣物，多吃蔬菜水果' : weakWuxing === '水' ? '多穿黑色、蓝色衣物，多喝水' : weakWuxing === '火' ? '多穿红色衣物，多吃热性食物' : '多穿黄色衣物，多吃甜食'}。`)
  }
  
  advices.push('建议多行善积德，广结善缘，命运会更加顺遂。')
  advices.push('在重要决策前多听取长辈或专业人士的意见。')
  
  return advices
}

async function handleGetBazi() {
  if (!formData.value.name.trim() || !formData.value.birthDate || !formData.value.birthTime) {
    alert('请填写完整信息！')
    return
  }

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const bazi = generateBazi()
    const wuxingCounts = calculateWuxingCount(bazi)
    const mainWuxing = getMainWuxing(wuxingCounts)
    const balance = getWuxingBalance(wuxingCounts)
    const analysis = generateAnalysis(bazi, wuxingCounts, mainWuxing, balance, formData.value.questionType)
    const advice = generateAdvice(mainWuxing, balance)
    
    result.value = {
      name: formData.value.name,
      gender: formData.value.gender,
      birthDate: formData.value.birthDate,
      birthTime: formData.value.birthTime,
      questionType: formData.value.questionType,
      bazi: bazi,
      wuxingCounts: wuxingCounts,
      mainWuxing: mainWuxing,
      balance: balance,
      analysis: analysis,
      advice: advice,
      shengxiao: dizhiShengxiao[bazi.year.dz]
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
    gender: '男',
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
          <label>⚧️ 性别</label>
          <div class="gender-buttons">
            <button 
              v-for="g in genders" 
              :key="g" 
              :class="['gender-btn', { active: formData.gender === g }]" 
              @click="formData.gender = g"
            >
              {{ g === '男' ? '👨 男' : '👩 女' }}
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
            <span class="user-gender">{{ result.gender }}</span>
            <span class="user-shengxiao">🐾 {{ result.shengxiao }}</span>
          </div>
          <div class="birth-info">
            {{ result.birthDate }} {{ result.birthTime }}
          </div>
        </div>

        <div class="bazi-display">
          <div class="bazi-item" v-for="(pillar, key) in result.bazi" :key="key">
            <div class="pillar-label">
              {{ key === 'year' ? '年柱' : key === 'month' ? '月柱' : key === 'day' ? '日柱' : '时柱' }}
            </div>
            <div class="pillar-content">
              <div class="pillar-tg" :style="{ color: wuxingColors[tianganWuxing[pillar.tg]] }">
                {{ pillar.tg }}
                <span class="wuxing-tag">{{ tianganWuxing[pillar.tg] }}</span>
              </div>
              <div class="pillar-dz" :style="{ color: wuxingColors[dizhiWuxing[pillar.dz]] }">
                {{ pillar.dz }}
                <span class="wuxing-tag">{{ dizhiWuxing[pillar.dz] }}</span>
              </div>
            </div>
            <div class="pillar-full">{{ pillar.full }}</div>
          </div>
        </div>

        <div class="wuxing-section">
          <h3>🌟 五行分析</h3>
          <div class="wuxing-chart">
            <div v-for="(count, wuxing) in result.wuxingCounts" :key="wuxing" class="wuxing-bar-item">
              <div class="wuxing-label">
                <span class="wuxing-emoji">{{ wuxingEmojis[wuxing] }}</span>
                <span class="wuxing-name">{{ wuxing }}</span>
              </div>
              <div class="wuxing-bar-container">
                <div 
                  class="wuxing-bar" 
                  :style="{ 
                    width: (count / 8 * 100) + '%',
                    backgroundColor: wuxingColors[wuxing]
                  }"
                ></div>
              </div>
              <div class="wuxing-count">{{ count }}</div>
              <div 
                class="wuxing-status"
                :class="{
                  'over': result.balance[wuxing] === '过旺',
                  'weak': result.balance[wuxing] === '偏弱',
                  'balanced': result.balance[wuxing] === '平衡'
                }"
              >
                {{ result.balance[wuxing] }}
              </div>
            </div>
          </div>
          <div class="main-wuxing">
            <span class="main-label">主五行：</span>
            <span class="main-value" :style="{ color: wuxingColors[result.mainWuxing] }">
              {{ wuxingEmojis[result.mainWuxing] }} {{ result.mainWuxing }}
            </span>
          </div>
        </div>

        <div class="analysis-section">
          <h3>📊 {{ result.questionType }}分析</h3>
          <div class="analysis-content">
            <div v-for="(item, index) in result.analysis" :key="index" class="analysis-item">
              <span class="analysis-number">{{ index + 1 }}</span>
              <p>{{ item }}</p>
            </div>
          </div>
        </div>

        <div class="advice-section">
          <h3>💡 人生建议</h3>
          <div class="advice-list">
            <div v-for="(item, index) in result.advice" :key="index" class="advice-item">
              <span class="advice-icon">✨</span>
              <p>{{ item }}</p>
            </div>
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
  background: linear-gradient(135deg, #78350f 0%, #92400e 30%, #b45309 60%, #d97706 100%);
  padding: 20px;
  position: relative;
}

.bazi-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(217, 119, 6, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(146, 64, 14, 0.2) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
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
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
}

.form-section {
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.form-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #92400e, #d97706, #92400e);
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  color: #78350f;
  font-weight: 600;
  font-size: 1rem;
}

.form-input {
  width: 100%;
  padding: 14px;
  border: 2px solid #fde68a;
  border-radius: 12px;
  font-size: 1rem;
  background: #fffbeb;
  color: #78350f;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #d97706;
  outline: none;
  box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.1);
  background: white;
}

.gender-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.gender-btn {
  padding: 14px;
  border: 2px solid #fde68a;
  border-radius: 12px;
  background: #fffbeb;
  color: #78350f;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 1rem;
}

.gender-btn:hover {
  border-color: #d97706;
  background: #fef3c7;
}

.gender-btn.active {
  background: linear-gradient(135deg, #92400e 0%, #d97706 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(146, 64, 14, 0.3);
}

.type-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.type-btn {
  padding: 12px;
  border: 2px solid #fde68a;
  border-radius: 10px;
  background: #fffbeb;
  color: #78350f;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.type-btn:hover {
  border-color: #d97706;
  background: #fef3c7;
}

.type-btn.active {
  background: linear-gradient(135deg, #92400e 0%, #d97706 100%);
  color: white;
  border-color: transparent;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #92400e 0%, #d97706 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.submit-btn:hover::before {
  left: 100%;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(146, 64, 14, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.result-section {
  max-width: 700px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.result-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
}

.result-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 25px;
  border-bottom: 2px solid #fde68a;
}

.result-header h2 {
  color: #92400e;
  font-size: 1.8rem;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.user-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: #78350f;
}

.user-gender,
.user-shengxiao {
  padding: 4px 12px;
  background: #fef3c7;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #92400e;
}

.birth-info {
  color: #9ca3af;
  font-size: 0.95rem;
}

.bazi-display {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.bazi-item {
  text-align: center;
  padding: 20px 15px;
  background: linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%);
  border-radius: 16px;
  color: white;
  box-shadow: 0 8px 25px rgba(120, 53, 15, 0.3);
}

.pillar-label {
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 12px;
  letter-spacing: 2px;
}

.pillar-content {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.pillar-tg,
.pillar-dz {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.pillar-tg {
  font-size: 2rem;
  font-weight: 700;
}

.pillar-dz {
  font-size: 2rem;
  font-weight: 700;
}

.wuxing-tag {
  font-size: 0.65rem;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white !important;
}

.pillar-full {
  font-size: 1.1rem;
  opacity: 0.9;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.wuxing-section {
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-radius: 16px;
}

.wuxing-section h3 {
  color: #92400e;
  margin-bottom: 20px;
  text-align: center;
}

.wuxing-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.wuxing-bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wuxing-label {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 60px;
}

.wuxing-emoji {
  font-size: 1.2rem;
}

.wuxing-name {
  font-weight: 600;
  color: #78350f;
  width: 24px;
}

.wuxing-bar-container {
  flex: 1;
  height: 20px;
  background: #fde68a;
  border-radius: 10px;
  overflow: hidden;
}

.wuxing-bar {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.wuxing-count {
  width: 24px;
  text-align: center;
  font-weight: 600;
  color: #78350f;
}

.wuxing-status {
  width: 40px;
  text-align: center;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.wuxing-status.over {
  background: #fee2e2;
  color: #dc2626;
}

.wuxing-status.weak {
  background: #fef3c7;
  color: #d97706;
}

.wuxing-status.balanced {
  background: #d1fae5;
  color: #059669;
}

.main-wuxing {
  text-align: center;
  padding-top: 15px;
  border-top: 2px solid #fde68a;
}

.main-label {
  color: #78350f;
  font-weight: 600;
}

.main-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-left: 8px;
}

.analysis-section,
.advice-section {
  margin-bottom: 25px;
  padding: 25px;
  background: #fffbeb;
  border-radius: 16px;
  border-left: 4px solid #d97706;
}

.analysis-section h3,
.advice-section h3 {
  color: #92400e;
  margin-bottom: 15px;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analysis-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.analysis-number {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #92400e, #d97706);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  flex-shrink: 0;
}

.analysis-item p {
  color: #78350f;
  line-height: 1.7;
  margin: 0;
}

.advice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.advice-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  background: white;
  border-radius: 10px;
}

.advice-icon {
  font-size: 1.2rem;
}

.advice-item p {
  color: #78350f;
  line-height: 1.6;
  margin: 0;
}

.result-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn-primary {
  padding: 14px 30px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #92400e 0%, #d97706 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(146, 64, 14, 0.4);
}

.btn-secondary {
  padding: 14px 30px;
  border: 2px solid #fde68a;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  background: white;
  color: #78350f;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #fef3c7;
  border-color: #d97706;
  color: #92400e;
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
