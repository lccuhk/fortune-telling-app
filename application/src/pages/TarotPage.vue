<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const result = ref(null)
const showCards = ref(false)
const flippedCards = ref([])
const showHistory = ref(false)
const cardRotations = ref([])
const animationFrames = ref([])

const cardSpreads = [
  { name: '单张牌', cards: 1, desc: '快速指引', icon: '🃏' },
  { name: '三张牌', cards: 3, desc: '过去-现在-未来', icon: '🎴' }
]

const formData = ref({
  question: '',
  selectedSpread: cardSpreads[0]
})

const majorArcana = [
  { id: 'm0', name: '愚者', number: 0, meaning: '新的开始，冒险，纯真', keyword: '自由', element: '风', icon: '🃏' },
  { id: 'm1', name: '魔术师', number: 1, meaning: '创造力，意志力，显化', keyword: '创造', element: '风', icon: '🧙' },
  { id: 'm2', name: '女祭司', number: 2, meaning: '直觉，神秘，内在智慧', keyword: '直觉', element: '水', icon: '👸' },
  { id: 'm3', name: '皇后', number: 3, meaning: '丰饶，母性，创造力', keyword: '丰饶', element: '土', icon: '👑' },
  { id: 'm4', name: '皇帝', number: 4, meaning: '权威，稳定，控制', keyword: '权威', element: '火', icon: '🏛️' },
  { id: 'm5', name: '教皇', number: 5, meaning: '传统，信仰，指导', keyword: '信仰', element: '土', icon: '⛪' },
  { id: 'm6', name: '恋人', number: 6, meaning: '爱情，选择，和谐', keyword: '选择', element: '风', icon: '💕' },
  { id: 'm7', name: '战车', number: 7, meaning: '意志力，胜利，决心', keyword: '胜利', element: '水', icon: '🏎️' },
  { id: 'm8', name: '力量', number: 8, meaning: '勇气，耐心，内在力量', keyword: '力量', element: '火', icon: '🦁' },
  { id: 'm9', name: '隐者', number: 9, meaning: '内省，独处，寻求真理', keyword: '内省', element: '土', icon: '🏮' },
  { id: 'm10', name: '命运之轮', number: 10, meaning: '变化，命运，周期', keyword: '命运', element: '火', icon: '☸️' },
  { id: 'm11', name: '正义', number: 11, meaning: '公正，平衡，因果', keyword: '公正', element: '风', icon: '⚖️' },
  { id: 'm12', name: '倒吊人', number: 12, meaning: '牺牲，等待，新视角', keyword: '牺牲', element: '水', icon: '🙃' },
  { id: 'm13', name: '死神', number: 13, meaning: '结束，转变，重生', keyword: '转变', element: '水', icon: '💀' },
  { id: 'm14', name: '节制', number: 14, meaning: '平衡，调和，耐心', keyword: '平衡', element: '火', icon: '⚗️' },
  { id: 'm15', name: '恶魔', number: 15, meaning: '束缚，欲望，物质主义', keyword: '束缚', element: '土', icon: '😈' },
  { id: 'm16', name: '塔', number: 16, meaning: '突变，觉醒，破坏', keyword: '突变', element: '火', icon: '🗼' },
  { id: 'm17', name: '星星', number: 17, meaning: '希望，灵感，宁静', keyword: '希望', element: '风', icon: '⭐' },
  { id: 'm18', name: '月亮', number: 18, meaning: '幻觉，恐惧，潜意识', keyword: '幻觉', element: '水', icon: '🌙' },
  { id: 'm19', name: '太阳', number: 19, meaning: '快乐，成功，活力', keyword: '快乐', element: '火', icon: '☀️' },
  { id: 'm20', name: '审判', number: 20, meaning: '重生，觉醒，救赎', keyword: '觉醒', element: '火', icon: '📯' },
  { id: 'm21', name: '世界', number: 21, meaning: '完成，成就，圆满', keyword: '圆满', element: '土', icon: '🌍' }
]

const minorArcana = []
const suits = [
  { name: '权杖', element: '火', icon: '🔥' },
  { name: '圣杯', element: '水', icon: '💧' },
  { name: '宝剑', element: '风', icon: '⚔️' },
  { name: '星币', element: '土', icon: '💰' }
]

const minorNumbers = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', '侍从', '骑士', '王后', '国王']
const minorMeanings = {
  Ace: '新的开始，机会',
  '2': '平衡，选择',
  '3': '合作，发展',
  '4': '稳定，基础',
  '5': '冲突，失去',
  '6': '和谐，给予',
  '7': '挑战，评估',
  '8': '行动，专注',
  '9': '满足，成就',
  '10': '完成，圆满',
  侍从: '探索，学习',
  骑士: '行动，热情',
  王后: '直觉，情感',
  国王: '权威，稳定'
}

suits.forEach(suit => {
  minorNumbers.forEach((num, idx) => {
    minorArcana.push({
      id: `${suit.name[0]}${idx}`,
      name: `${num}${suit.name}`,
      number: idx + 1,
      suit: suit.name,
      meaning: `${suit.element}元素的${minorMeanings[num]}`,
      keyword: minorMeanings[num],
      element: suit.element,
      icon: suit.icon
    })
  })
})

const allCards = [...majorArcana, ...minorArcana]
const usedCards = ref([])

function getCardColor(card) {
  const colors = {
    '火': '#ef4444',
    '水': '#3b82f6',
    '土': '#eab308',
    '风': '#8b5cf6'
  }
  return colors[card.element] || '#6b7280'
}

function getPositions(spread) {
  if (spread.cards === 1) return ['指引']
  if (spread.cards === 3) return ['过去', '现在', '未来']
  return []
}

function drawRandomCard() {
  const available = allCards.filter(c => !usedCards.value.includes(c.id))
  if (available.length === 0) {
    usedCards.value = []
    return allCards[Math.floor(Math.random() * allCards.length)]
  }
  const card = available[Math.floor(Math.random() * available.length)]
  usedCards.value.push(card.id)
  return card
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function animateCardRotation(index, duration = 500) {
  return new Promise((resolve) => {
    const startTime = performance.now()
    const startRotation = cardRotations.value[index] || 0
    const endRotation = 180
    let frameCount = 0
    let lastFrameTime = startTime
    const frameIntervals = []

    console.log(`[Card ${index}] 🎬 动画开始 - 开始时间: ${startTime.toFixed(2)}ms, 目标时长: ${duration}ms`)

    function animate(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeInOutCubic(progress)
      const currentRotation = startRotation + (endRotation - startRotation) * easedProgress

      frameCount++
      const frameInterval = currentTime - lastFrameTime
      frameIntervals.push(frameInterval)
      const actualFps = 1000 / frameInterval

      console.log(
        `[Card ${index}] 🎞️ 帧 #${frameCount} | ` +
        `时间: ${currentTime.toFixed(2)}ms | ` +
        `进度: ${(progress * 100).toFixed(1)}% | ` +
        `旋转: ${currentRotation.toFixed(2)}° | ` +
        `帧间隔: ${frameInterval.toFixed(2)}ms | ` +
        `实际帧率: ${actualFps.toFixed(1)}fps`
      )

      cardRotations.value[index] = currentRotation
      lastFrameTime = currentTime

      if (progress < 1) {
        animationFrames.value[index] = requestAnimationFrame(animate)
      } else {
        cardRotations.value[index] = endRotation
        flippedCards.value.push(index)

        const totalDuration = currentTime - startTime
        const avgInterval = frameIntervals.reduce((a, b) => a + b, 0) / frameIntervals.length
        const avgFps = 1000 / avgInterval

        console.log(`
[Card ${index}] ✅ 动画完成统计
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
总帧数: ${frameCount}
总时长: ${totalDuration.toFixed(2)}ms (目标: ${duration}ms)
平均帧间隔: ${avgInterval.toFixed(2)}ms
平均帧率: ${avgFps.toFixed(1)}fps
最小帧间隔: ${Math.min(...frameIntervals).toFixed(2)}ms
最大帧间隔: ${Math.max(...frameIntervals).toFixed(2)}ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `)

        resolve()
      }
    }

    animationFrames.value[index] = requestAnimationFrame(animate)
  })
}

async function animateCardFlip(count) {
  cardRotations.value = new Array(count).fill(0)
  
  for (let i = 0; i < count; i++) {
    await new Promise(resolve => setTimeout(resolve, 300))
    await animateCardRotation(i, 500)
  }
}

function cancelAllAnimations() {
  animationFrames.value.forEach(frameId => {
    if (frameId) {
      cancelAnimationFrame(frameId)
    }
  })
  animationFrames.value = []
}

async function handleDrawTarot() {
  if (loading.value) return
  
  loading.value = true
  flippedCards.value = []
  showCards.value = false
  result.value = null
  
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const positions = getPositions(formData.value.selectedSpread)
  const drawnCards = []
  
  for (let i = 0; i < formData.value.selectedSpread.cards; i++) {
    const card = drawRandomCard()
    const isReversed = Math.random() > 0.75
    
    drawnCards.push({
      ...card,
      isReversed,
      position: positions[i] || `位置${i + 1}`,
      positionIndex: i + 1,
      displayMeaning: isReversed ? `逆位：${card.meaning}` : card.meaning
    })
  }
  
  const overallReading = generateOverallReading(drawnCards, formData.value.question)
  
  result.value = {
    question: formData.value.question,
    spread: formData.value.selectedSpread,
    cards: drawnCards,
    overall: overallReading
  }
  
  await new Promise(resolve => setTimeout(resolve, 300))
  showCards.value = true
  await new Promise(resolve => setTimeout(resolve, 200))
  animateCardFlip(drawnCards.length)
  
  loading.value = false
}

function generateOverallReading(cards, question) {
  const hasMajor = cards.some(c => !c.suit)
  const hasReversed = cards.some(c => c.isReversed)
  
  let reading = ''
  
  if (cards.length === 1) {
    const card = cards[0]
    reading = `抽到「${card.name}」${card.isReversed ? '（逆位）' : ''}，`
    reading += `这张牌暗示着${card.meaning}。`
    if (question) {
      reading += `关于「${question}」，`
    }
    reading += hasReversed 
      ? '建议你重新审视当前的情况，可能需要调整方向。'
      : '这是一个积极的信号，相信你的直觉并采取行动。'
  } else if (cards.length === 3) {
    reading = `过去受到「${cards[0].name}」的影响，`
    reading += `现在正处于「${cards[1].name}」的能量中，`
    reading += `未来可能会走向「${cards[2].name}」。`
    if (hasMajor) {
      reading += '有大阿卡纳牌出现，说明这是一个重要的人生阶段。'
    }
    if (hasReversed) {
      reading += '逆位牌提示需要注意某些方面的调整。'
    }
  }
  
  return reading
}

function resetTarot() {
  cancelAllAnimations()
  result.value = null
  flippedCards.value = []
  showCards.value = false
  cardRotations.value = []
  formData.value = {
    question: '',
    selectedSpread: cardSpreads[0]
  }
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="tarot-page">
    <button class="back-btn" @click="goBack">← 返回</button>
    
    <div class="page-header">
      <h1 class="page-title">🃏 塔罗牌占卜</h1>
      <p class="page-subtitle">探索内心的指引</p>
    </div>

    <div v-if="!result" class="form-card">
      <h2 class="form-title">选择牌阵</h2>
      
      <div class="spread-grid">
        <button 
          v-for="spread in cardSpreads" 
          :key="spread.name"
          class="spread-btn"
          :class="{ active: formData.selectedSpread.name === spread.name }"
          @click="formData.selectedSpread = spread"
        >
          <div class="spread-icon">{{ spread.icon }}</div>
          <div class="spread-name">{{ spread.name }}</div>
          <div class="spread-desc">{{ spread.desc }}</div>
        </button>
      </div>

      <div class="form-group">
        <label class="form-label">你的问题（可选）</label>
        <textarea 
          v-model="formData.question"
          class="form-textarea"
          placeholder="例如：我应该接受这份工作吗？"
          rows="3"
        ></textarea>
      </div>

      <button 
        class="btn-primary"
        :disabled="loading"
        @click="handleDrawTarot"
      >
        {{ loading ? '🔮 洗牌中...' : '✨ 开始抽牌' }}
      </button>
    </div>

    <div v-else class="result-card">
      <div class="result-header">
        <h2>🔮 抽牌结果</h2>
        <p v-if="result.question" class="question-text">问题：{{ result.question }}</p>
        <p class="spread-text">牌阵：{{ result.spread.name }}</p>
      </div>

      <div class="cards-display" :class="`cards-${result.spread.cards}`">
        <div 
          v-for="(card, index) in result.cards" 
          :key="index"
          class="card-slot"
        >
          <div class="tarot-card-wrapper">
            <div 
              class="card-inner"
              :style="{ transform: `rotateY(${cardRotations[index] || 0}deg) translateZ(0)` }"
            >
              <div class="card-face card-back-face">
                <span class="corner-tl">✦</span>
                <div class="card-pattern">✦</div>
                <span class="corner-br">✦</span>
              </div>
              <div class="card-face card-front-face" :style="{ '--card-color': getCardColor(card) }">
                <div class="card-content" :class="{ reversed: card.isReversed }">
                  <div class="card-icon">{{ card.icon }}</div>
                  <div class="card-number" v-if="!card.suit">{{ card.number }}</div>
                  <div class="card-name">{{ card.name }}</div>
                  <div v-if="card.suit" class="card-suit">{{ card.suit }} · {{ card.element }}</div>
                  <div v-else class="card-element">{{ card.element }}元素</div>
                  <div v-if="card.isReversed" class="reversed-badge">逆位</div>
                </div>
                <div class="card-keyword">{{ card.keyword }}</div>
                <div class="card-meaning">{{ card.displayMeaning }}</div>
              </div>
            </div>
          </div>
          <div class="slot-label">{{ index + 1 }}. {{ card.position }}</div>
        </div>
      </div>

      <div class="overall-section">
        <h3>📖 整体解读</h3>
        <p>{{ result.overall }}</p>
      </div>

      <div class="result-actions">
        <button class="btn-primary" @click="handleDrawTarot">🔄 重新抽牌</button>
        <button class="btn-secondary" @click="resetTarot">← 返回选择</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tarot-page {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding-top: 60px;
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

.form-card,
.result-card {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.form-title {
  text-align: center;
  margin-bottom: 25px;
  color: #374151;
}

.spread-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.spread-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 25px 15px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.spread-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.spread-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.spread-icon {
  font-size: 2.5rem;
}

.spread-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.spread-desc {
  font-size: 0.85rem;
  color: #6b7280;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.btn-primary,
.btn-secondary {
  display: block;
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.result-header {
  text-align: center;
  margin-bottom: 25px;
}

.result-header h2 {
  margin: 0 0 10px 0;
  color: #374151;
}

.question-text,
.spread-text {
  margin: 5px 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.cards-display {
  display: grid;
  gap: 25px;
  margin-bottom: 30px;
}

.cards-1 {
  grid-template-columns: 1fr;
  max-width: 220px;
  margin-left: auto;
  margin-right: auto;
}

.cards-3 {
  grid-template-columns: repeat(3, 1fr);
}

.card-slot {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.card-slot .tarot-card-wrapper {
  position: relative;
}

.card-slot .slot-label {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(107, 114, 128, 0.95);
  text-align: center;
  white-space: nowrap;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  padding: 3px 10px;
  border-radius: 4px;
  margin: 0 auto;
  width: fit-content;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tarot-card-wrapper {
  perspective: 1500px;
  height: 280px;
  width: 200px;
  transform-style: preserve-3d;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  will-change: transform;
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  box-sizing: border-box;
  transform: translateZ(0);
  will-change: transform;
}

.card-back-face {
  background: linear-gradient(145deg, #2D1B4E, #1a0f2e);
  color: #d4af37;
}

.card-back-face .corner-tl {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 1.2rem;
}

.card-back-face .corner-br {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 1.2rem;
}

.card-back-face .card-pattern {
  font-size: 3rem;
  opacity: 0.3;
}

.card-front-face {
  background: linear-gradient(145deg, var(--card-color), var(--card-color)dd);
  color: white;
  transform: rotateY(180deg);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.card-content.reversed {
  transform: rotate(180deg);
}

.card-icon {
  font-size: 3rem;
}

.card-number {
  font-size: 0.8rem;
  opacity: 0.8;
}

.card-name {
  font-size: 1.1rem;
  font-weight: 700;
}

.card-suit,
.card-element {
  font-size: 0.75rem;
  opacity: 0.9;
}

.reversed-badge {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
}

.card-keyword {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.card-meaning {
  font-size: 0.7rem;
  text-align: center;
  line-height: 1.4;
  background: rgba(0, 0, 0, 0.1);
  padding: 8px;
  border-radius: 6px;
}

.overall-section {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 25px;
}

.overall-section h3 {
  margin: 0 0 10px 0;
  color: #374151;
}

.overall-section p {
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

@media (max-width: 768px) {
  .tarot-page {
    padding: 15px;
  }

  .back-btn {
    position: static;
    margin-bottom: 15px;
    width: 100%;
  }

  .page-header {
    padding-top: 0;
  }

  .page-title {
    font-size: 1.6rem;
  }

  .form-card,
  .result-card {
    padding: 25px;
  }

  .spread-grid {
    grid-template-columns: 1fr;
  }

  .cards-3 {
    grid-template-columns: repeat(2, 1fr);
  }

  .tarot-card-wrapper {
    height: 260px;
    width: 180px;
  }

  .card-icon {
    font-size: 2.5rem;
  }

  .card-name {
    font-size: 1rem;
  }

  .card-slot .slot-label {
    bottom: 8px;
    font-size: 0.65rem;
    padding: 2px 8px;
  }

  .result-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .tarot-page {
    padding: 12px;
  }

  .page-title {
    font-size: 1.4rem;
  }

  .form-card,
  .result-card {
    padding: 20px;
  }

  .cards-3 {
    grid-template-columns: 1fr;
  }

  .tarot-card-wrapper {
    height: 220px;
    width: 160px;
  }

  .card-icon {
    font-size: 2rem;
  }

  .card-name {
    font-size: 0.9rem;
  }

  .card-keyword {
    font-size: 0.7rem;
    padding: 3px 8px;
  }

  .card-meaning {
    font-size: 0.65rem;
    padding: 6px;
  }

  .card-slot .slot-label {
    bottom: 6px;
    font-size: 0.6rem;
    padding: 2px 6px;
  }

  .overall-section h3 {
    font-size: 1rem;
  }

  .overall-section p {
    font-size: 0.9rem;
  }
}
</style>
