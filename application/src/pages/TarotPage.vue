<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTarot } from '../composables/useTarot.js'

const router = useRouter()
const {
  loading,
  result,
  showCards,
  cardRotations,
  cardSpreads,
  hasResult,
  getCardColor,
  drawTarot,
  resetTarot
} = useTarot()

const formData = ref({
  question: '',
  selectedSpread: cardSpreads[0]
})

function goBack() {
  router.push('/')
}

async function handleDrawTarot() {
  await drawTarot(formData.value.question, formData.value.selectedSpread)
}

function handleReset() {
  resetTarot()
  formData.value = {
    question: '',
    selectedSpread: cardSpreads[0]
  }
}
</script>

<template>
  <div class="tarot-page">
    <button class="back-btn" @click="goBack">← 返回</button>

    <div class="page-header">
      <h1 class="page-title">🃏 塔罗牌占卜</h1>
      <p class="page-subtitle">探索内心的指引</p>
    </div>

    <div v-if="!hasResult" class="form-card">
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

      <button class="btn-primary" :disabled="loading" @click="handleDrawTarot">
        {{ loading ? '🔮 洗牌中...' : '✨ 开始抽牌' }}
      </button>
    </div>

    <div v-else class="result-card">
      <div class="result-header">
        <h2>🔮 抽牌结果</h2>
        <p v-if="result.question" class="question-text">问题：{{ result.question }}</p>
        <p class="spread-text">牌阵：{{ result.spread.name }}</p>
      </div>

      <div v-if="showCards" class="cards-display" :class="`cards-${result.spread.cards}`">
        <div v-for="(card, index) in result.cards" :key="index" class="card-slot">
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
              <div
                class="card-face card-front-face"
                :style="{ '--card-color': getCardColor(card) }"
              >
                <div class="card-content" :class="{ reversed: card.isReversed }">
                  <div class="card-icon">{{ card.icon }}</div>
                  <div v-if="!card.suit" class="card-number">{{ card.number }}</div>
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

      <div v-if="showCards" class="overall-section">
        <h3>📖 整体解读</h3>
        <p>{{ result.overall }}</p>
      </div>

      <div class="result-actions">
        <button class="btn-primary" @click="handleDrawTarot">🔄 重新抽牌</button>
        <button class="btn-secondary" @click="handleReset">← 返回选择</button>
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
  font-size: 2rem;
}

.spread-name {
  font-weight: 600;
  color: #374151;
}

.spread-desc {
  font-size: 0.875rem;
  color: #6b7280;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
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
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.btn-primary {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.result-header {
  text-align: center;
  margin-bottom: 30px;
}

.result-header h2 {
  margin: 0 0 10px 0;
  color: #374151;
}

.question-text {
  margin: 0 0 5px 0;
  color: #6b7280;
  font-style: italic;
}

.spread-text {
  margin: 0;
  color: #667eea;
  font-weight: 500;
}

.cards-display {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.cards-1 {
  justify-content: center;
}

.cards-3 {
  justify-content: space-around;
}

.card-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.tarot-card-wrapper {
  width: 180px;
  height: 280px;
  perspective: 1000px;
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.card-back-face {
  background: linear-gradient(135deg, #2d1b4e 0%, #4b0082 100%);
  color: white;
}

.card-pattern {
  font-size: 3rem;
  opacity: 0.3;
}

.corner-tl,
.corner-br {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.5;
}

.corner-tl {
  top: 15px;
  left: 15px;
}

.corner-br {
  bottom: 15px;
  right: 15px;
}

.card-front-face {
  background: white;
  transform: rotateY(180deg);
  border: 3px solid var(--card-color, #667eea);
}

.card-content {
  text-align: center;
  margin-bottom: 15px;
}

.card-content.reversed {
  transform: rotate(180deg);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.card-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--card-color, #667eea);
  margin-bottom: 5px;
}

.card-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 5px;
}

.card-suit,
.card-element {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 5px;
}

.reversed-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #ef4444;
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-top: 5px;
}

.card-keyword {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--card-color, #667eea);
  margin-bottom: 10px;
}

.card-meaning {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  line-height: 1.4;
}

.slot-label {
  font-weight: 500;
  color: #374151;
}

.overall-section {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
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

.btn-secondary {
  padding: 15px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

@media (max-width: 768px) {
  .tarot-page {
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

  .spread-grid {
    grid-template-columns: 1fr;
  }

  .cards-display {
    flex-direction: column;
    align-items: center;
  }

  .tarot-card-wrapper {
    width: 150px;
    height: 240px;
  }

  .result-actions {
    flex-direction: column;
  }
}
</style>
