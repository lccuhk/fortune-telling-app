<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const result = ref(null)
const isShuffling = ref(false)

const cardSpreads = [
  { name: '单张牌', cards: 1, desc: '快速获取指引' },
  { name: '三张牌', cards: 3, desc: '过去-现在-未来' },
  { name: '凯尔特十字', cards: 10, desc: '全面深度解读' }
]

const majorArcana = [
  { name: '愚者', number: 0, meaning: '新的开始，冒险，纯真' },
  { name: '魔术师', number: 1, meaning: '创造力，意志力，显化' },
  { name: '女祭司', number: 2, meaning: '直觉，神秘，内在智慧' },
  { name: '皇后', number: 3, meaning: '丰饶，母性，创造力' },
  { name: '皇帝', number: 4, meaning: '权威，稳定，控制' },
  { name: '教皇', number: 5, meaning: '传统，信仰，指导' },
  { name: '恋人', number: 6, meaning: '爱情，选择，和谐' },
  { name: '战车', number: 7, meaning: '意志力，胜利，决心' },
  { name: '力量', number: 8, meaning: '勇气，耐心，内在力量' },
  { name: '隐者', number: 9, meaning: '内省，独处，寻求真理' },
  { name: '命运之轮', number: 10, meaning: '变化，命运，周期' },
  { name: '正义', number: 11, meaning: '公正，平衡，因果' },
  { name: '倒吊人', number: 12, meaning: '牺牲，等待，新视角' },
  { name: '死神', number: 13, meaning: '结束，转变，重生' },
  { name: '节制', number: 14, meaning: '平衡，调和，耐心' },
  { name: '恶魔', number: 15, meaning: '束缚，欲望，物质主义' },
  { name: '塔', number: 16, meaning: '突变，觉醒，破坏' },
  { name: '星星', number: 17, meaning: '希望，灵感，宁静' },
  { name: '月亮', number: 18, meaning: '幻觉，恐惧，潜意识' },
  { name: '太阳', number: 19, meaning: '快乐，成功，活力' },
  { name: '审判', number: 20, meaning: '重生，觉醒，救赎' },
  { name: '世界', number: 21, meaning: '完成，成就，圆满' }
]

const formData = ref({
  question: '',
  selectedSpread: cardSpreads[0]
})

function goBack() {
  router.push('/')
}

function selectSpread(spread) {
  formData.value.selectedSpread = spread
}

async function shuffleCards() {
  isShuffling.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  isShuffling.value = false
}

async function handleDrawTarot() {
  if (!formData.value.question.trim()) {
    alert('请输入您的问题！')
    return
  }

  loading.value = true
  await shuffleCards()
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const drawnCards = []
    const positions = []
    
    if (formData.value.selectedSpread.cards === 1) {
      positions.push('指引')
    } else if (formData.value.selectedSpread.cards === 3) {
      positions.push('过去', '现在', '未来')
    } else {
      positions.push('现状', '挑战', '基础', '过去', '目标', '未来', '自我', '环境', '希望', '结果')
    }
    
    for (let i = 0; i < formData.value.selectedSpread.cards; i++) {
      const card = majorArcana[Math.floor(Math.random() * majorArcana.length)]
      const isReversed = Math.random() > 0.7
      drawnCards.push({
        ...card,
        position: positions[i],
        isReversed,
        displayMeaning: isReversed ? getReversedMeaning(card.name) : card.meaning
      })
    }
    
    result.value = {
      question: formData.value.question,
      spread: formData.value.selectedSpread,
      cards: drawnCards,
      overall: generateOverallReading(drawnCards)
    }
  } catch (err) {
    alert('抽牌失败，请重试')
  } finally {
    loading.value = false
  }
}

function getReversedMeaning(cardName) {
  const reversedMeanings = {
    '愚者': '鲁莽，冒险过度，缺乏计划',
    '魔术师': '欺骗，缺乏意志力，技能不足',
    '女祭司': '表面化，忽视直觉，秘密暴露',
    '皇后': '依赖，创造力受阻，不育',
    '皇帝': '专制，僵化，滥用权力',
    '教皇': '反叛，非传统，个人信仰',
    '恋人': '不和谐，错误选择，分离',
    '战车': '失控，失败，缺乏方向',
    '力量': '软弱，自我怀疑，缺乏勇气',
    '隐者': '孤独，隔离，拒绝建议',
    '命运之轮': '厄运，抗拒改变，坏运气',
    '正义': '不公正，偏见，法律问题',
    '倒吊人': '无谓牺牲，拖延，抗拒',
    '死神': '抗拒结束，停滞，害怕改变',
    '节制': '极端，失衡，过度',
    '恶魔': '解放，摆脱束缚，觉醒',
    '塔': '避免灾难，延迟改变，恐惧',
    '星星': '绝望，缺乏信心，悲观',
    '月亮': '澄清，真相大白，克服恐惧',
    '太阳': '暂时的快乐，悲观，缺乏活力',
    '审判': '自我怀疑，拒绝改变，内疚',
    '世界': '未完成，缺乏成就感，停滞'
  }
  return reversedMeanings[cardName] || '逆位含义'
}

function generateOverallReading(cards) {
  const hasPositive = cards.some(c => !c.isReversed && ['太阳', '星星', '世界', '魔术师', '皇后'].includes(c.name))
  const hasNegative = cards.some(c => c.isReversed || ['塔', '恶魔', '死神'].includes(c.name))
  
  if (hasPositive && !hasNegative) {
    return '整体牌面非常积极，预示着你所询问的事情将会有好的发展。保持乐观和积极的态度，把握机会。'
  } else if (hasNegative && !hasPositive) {
    return '牌面显示你可能面临一些挑战和困难。但这只是暂时的，通过努力和坚持，你能够克服这些障碍。'
  } else {
    return '牌面显示情况复杂，既有挑战也有机遇。建议你保持平衡的心态，在困难中寻找机会。'
  }
}

function resetTarot() {
  result.value = null
  formData.value = {
    question: '',
    selectedSpread: cardSpreads[0]
  }
}
</script>

<template>
  <div class="tarot-page">
    <header class="page-header">
      <button class="back-btn" @click="goBack">← 返回首页</button>
      <h1 class="page-title">🃏 塔罗牌占卜</h1>
      <p class="page-subtitle">神秘的塔罗牌在线抽牌和解读</p>
    </header>

    <div v-if="!result" class="form-section">
      <div class="form-card">
        <div class="form-group">
          <label>💭 您的问题</label>
          <input 
            v-model="formData.question" 
            type="text" 
            placeholder="例如：我最近的运势如何？"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>🎴 选择牌阵</label>
          <div class="spread-grid">
            <button
              v-for="spread in cardSpreads"
              :key="spread.name"
              :class="['spread-btn', { active: formData.selectedSpread.name === spread.name }]"
              @click="selectSpread(spread)"
            >
              <span class="spread-name">{{ spread.name }}</span>
              <span class="spread-cards">{{ spread.cards }}张牌</span>
              <span class="spread-desc">{{ spread.desc }}</span>
            </button>
          </div>
        </div>

        <button class="submit-btn" @click="handleDrawTarot" :disabled="loading">
          <span v-if="isShuffling" class="shuffle-animation">🃏 洗牌中...</span>
          <span v-else-if="loading">✨ 正在抽牌...</span>
          <span v-else>🃏 开始抽牌</span>
        </button>
      </div>
    </div>

    <div v-else class="result-section">
      <div class="result-card">
        <div class="result-header">
          <h2>🃏 塔罗牌阵</h2>
          <p class="question-text">问：{{ result.question }}</p>
          <p class="spread-text">{{ result.spread.name }} ({{ result.spread.cards }}张牌)</p>
        </div>

        <div class="cards-display">
          <div 
            v-for="(card, index) in result.cards" 
            :key="index"
            class="tarot-card"
            :class="{ reversed: card.isReversed }"
          >
            <div class="card-position">{{ card.position }}</div>
            <div class="card-content">
              <div class="card-number">{{ card.number }}</div>
              <div class="card-name">{{ card.name }}</div>
              <div v-if="card.isReversed" class="reversed-badge">逆位</div>
            </div>
            <div class="card-meaning">{{ card.displayMeaning }}</div>
          </div>
        </div>

        <div class="overall-section">
          <h3>🔮 整体解读</h3>
          <p>{{ result.overall }}</p>
        </div>

        <div class="result-actions">
          <button class="btn-secondary" @click="resetTarot">🔄 重新抽牌</button>
          <button class="btn-primary" @click="goBack">🏠 返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tarot-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2D1B4E 0%, #6B4EE6 100%);
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
  border-color: #6B4EE6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(107, 78, 230, 0.1);
}

.spread-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.spread-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 15px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.spread-btn:hover {
  border-color: #6B4EE6;
  background: #faf5ff;
  transform: translateY(-2px);
}

.spread-btn.active {
  background: linear-gradient(135deg, #2D1B4E 0%, #6B4EE6 100%);
  color: white;
  border-color: transparent;
}

.spread-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.spread-cards {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 3px;
}

.spread-desc {
  font-size: 0.75rem;
  opacity: 0.7;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #2D1B4E 0%, #6B4EE6 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(107, 78, 230, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.shuffle-animation {
  animation: shuffle 0.5s ease-in-out infinite;
}

@keyframes shuffle {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
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
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.result-header h2 {
  color: #2D1B4E;
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.question-text {
  color: #6b7280;
  font-size: 1rem;
  margin-bottom: 5px;
}

.spread-text {
  color: #6B4EE6;
  font-weight: 600;
}

.cards-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.tarot-card {
  background: linear-gradient(135deg, #2D1B4E 0%, #6B4EE6 100%);
  border-radius: 16px;
  padding: 20px;
  color: white;
  text-align: center;
  position: relative;
  transition: transform 0.3s ease;
}

.tarot-card.reversed {
  transform: rotate(180deg);
}

.tarot-card.reversed .card-content {
  transform: rotate(180deg);
}

.card-position {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-content {
  margin-bottom: 10px;
}

.card-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.card-name {
  font-size: 1.1rem;
  font-weight: 600;
}

.reversed-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
}

.card-meaning {
  font-size: 0.85rem;
  opacity: 0.9;
  line-height: 1.4;
}

.overall-section {
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, #faf5ff 0%, #f0e6ff 100%);
  border-radius: 16px;
  border-left: 4px solid #6B4EE6;
}

.overall-section h3 {
  color: #2D1B4E;
  margin-bottom: 10px;
}

.overall-section p {
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
  background: linear-gradient(135deg, #2D1B4E 0%, #6B4EE6 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(107, 78, 230, 0.4);
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
  border-color: #6B4EE6;
  color: #6B4EE6;
}

@media (max-width: 768px) {
  .tarot-page {
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

  .spread-grid {
    grid-template-columns: 1fr;
  }

  .cards-display {
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
