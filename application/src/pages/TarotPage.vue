<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const result = ref(null)
const isShuffling = ref(false)
const showHistory = ref(false)
const historyList = ref([])
const flippedCards = ref([])
const showCards = ref(false)

const cardSpreads = [
  { name: '单张牌', cards: 1, desc: '快速获取指引', icon: '🃏' },
  { name: '三张牌', cards: 3, desc: '过去-现在-未来', icon: '🎴' },
  { name: '凯尔特十字', cards: 10, desc: '全面深度解读', icon: '✨' }
]

const positionDetails = {
  1: {
    name: '现状',
    number: 1,
    description: '代表当前的情况，你所询问问题的核心状态。这张牌揭示了你现在所处的位置和感受。',
    advice: '仔细思考这张牌如何反映你当前的处境。它是积极的还是需要改变的？'
  },
  2: {
    name: '挑战',
    number: 2,
    description: '代表你目前面临的主要挑战或障碍。这是横在你面前的问题或困难。',
    advice: '这张牌揭示了你需要克服的困难。正视它，不要逃避。'
  },
  3: {
    name: '基础',
    number: 3,
    description: '代表问题的根源或过去的基础。是什么导致了当前的情况？',
    advice: '了解过去才能更好地理解现在。这张牌告诉你问题从何而来。'
  },
  4: {
    name: '过去',
    number: 4,
    description: '代表近期的过去，以及它如何影响现在。过去的经历和选择。',
    advice: '回顾过去的经验，看看有什么可以学习的。'
  },
  5: {
    name: '目标',
    number: 5,
    description: '代表你的目标、希望或你想要达到的状态。你真正想要的是什么？',
    advice: '这张牌揭示了你内心真正渴望的东西。它与你的行动一致吗？'
  },
  6: {
    name: '未来',
    number: 6,
    description: '代表近期的未来，如果继续当前的道路会发生什么。',
    advice: '这是一个预告，不是宿命。你可以通过改变来影响结果。'
  },
  7: {
    name: '自我',
    number: 7,
    description: '代表你自己，你的态度和你在这个情况中的角色。',
    advice: '诚实地看待自己。你在这个情况中扮演什么角色？'
  },
  8: {
    name: '环境',
    number: 8,
    description: '代表周围的环境、他人的影响或外部因素。',
    advice: '注意周围的人和事如何影响你的情况。'
  },
  9: {
    name: '希望',
    number: 9,
    description: '代表你的希望、恐惧或潜意识的期望。你内心深处的期待。',
    advice: '希望和恐惧往往是同一枚硬币的两面。了解你的真实感受。'
  },
  10: {
    name: '结果',
    number: 10,
    description: '代表最终的结果或长期的趋势。事情可能会如何发展。',
    advice: '这是一个可能的结局。记住，你有能力改变自己的命运。'
  }
}

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

const minorArcana = {
  wands: {
    name: '权杖',
    element: '火',
    color: '#ef4444',
    icon: '🔥',
    cards: [
      { id: 'w1', name: '权杖一', number: 1, meaning: '新的灵感，创造力的火花', keyword: '灵感' },
      { id: 'w2', name: '权杖二', number: 2, meaning: '规划，决策，远见', keyword: '规划' },
      { id: 'w3', name: '权杖三', number: 3, meaning: '探索，扩展，机会', keyword: '探索' },
      { id: 'w4', name: '权杖四', number: 4, meaning: '稳定，和谐，庆祝', keyword: '稳定' },
      { id: 'w5', name: '权杖五', number: 5, meaning: '竞争，冲突，挑战', keyword: '竞争' },
      { id: 'w6', name: '权杖六', number: 6, meaning: '胜利，认可，成功', keyword: '胜利' },
      { id: 'w7', name: '权杖七', number: 7, meaning: '坚持，防御，勇气', keyword: '坚持' },
      { id: 'w8', name: '权杖八', number: 8, meaning: '快速行动，消息，进展', keyword: '快速' },
      { id: 'w9', name: '权杖九', number: 9, meaning: '坚韧，警惕，力量', keyword: '坚韧' },
      { id: 'w10', name: '权杖十', number: 10, meaning: '负担，责任，压力', keyword: '负担' },
      { id: 'wp', name: '权杖侍从', number: 11, meaning: '热情，探索，学习', keyword: '热情' },
      { id: 'wkn', name: '权杖骑士', number: 12, meaning: '行动，冒险，冲动', keyword: '行动' },
      { id: 'wq', name: '权杖皇后', number: 13, meaning: '自信，魅力，领导', keyword: '自信' },
      { id: 'wk', name: '权杖国王', number: 14, meaning: '领导力，远见，热情', keyword: '领导' }
    ]
  },
  cups: {
    name: '圣杯',
    element: '水',
    color: '#3b82f6',
    icon: '💧',
    cards: [
      { id: 'c1', name: '圣杯一', number: 1, meaning: '新的感情，爱，直觉', keyword: '感情' },
      { id: 'c2', name: '圣杯二', number: 2, meaning: '结合，伙伴关系，和谐', keyword: '结合' },
      { id: 'c3', name: '圣杯三', number: 3, meaning: '庆祝，友谊，团聚', keyword: '庆祝' },
      { id: 'c4', name: '圣杯四', number: 4, meaning: '厌倦，沉思，不满', keyword: '沉思' },
      { id: 'c5', name: '圣杯五', number: 5, meaning: '失落，悲伤，遗憾', keyword: '失落' },
      { id: 'c6', name: '圣杯六', number: 6, meaning: '回忆，童年，纯真', keyword: '回忆' },
      { id: 'c7', name: '圣杯七', number: 7, meaning: '幻想，选择，迷茫', keyword: '幻想' },
      { id: 'c8', name: '圣杯八', number: 8, meaning: '放弃，追寻，离开', keyword: '追寻' },
      { id: 'c9', name: '圣杯九', number: 9, meaning: '满足，愿望实现，幸福', keyword: '满足' },
      { id: 'c10', name: '圣杯十', number: 10, meaning: '圆满，家庭，和谐', keyword: '圆满' },
      { id: 'cp', name: '圣杯侍从', number: 11, meaning: '敏感，创意，直觉', keyword: '敏感' },
      { id: 'ckn', name: '圣杯骑士', number: 12, meaning: '浪漫，理想主义，追求', keyword: '浪漫' },
      { id: 'cq', name: '圣杯皇后', number: 13, meaning: '爱，关怀，直觉', keyword: '关怀' },
      { id: 'ck', name: '圣杯国王', number: 14, meaning: '情感成熟，智慧，慈悲', keyword: '智慧' }
    ]
  },
  swords: {
    name: '宝剑',
    element: '风',
    color: '#6366f1',
    icon: '⚔️',
    cards: [
      { id: 's1', name: '宝剑一', number: 1, meaning: '清晰，真理，突破', keyword: '清晰' },
      { id: 's2', name: '宝剑二', number: 2, meaning: '犹豫，僵局，平衡', keyword: '犹豫' },
      { id: 's3', name: '宝剑三', number: 3, meaning: '心碎，悲伤，背叛', keyword: '悲伤' },
      { id: 's4', name: '宝剑四', number: 4, meaning: '休息，恢复，沉思', keyword: '休息' },
      { id: 's5', name: '宝剑五', number: 5, meaning: '冲突，失败，损失', keyword: '冲突' },
      { id: 's6', name: '宝剑六', number: 6, meaning: '过渡，离开，治愈', keyword: '过渡' },
      { id: 's7', name: '宝剑七', number: 7, meaning: '策略，欺骗，独立', keyword: '策略' },
      { id: 's8', name: '宝剑八', number: 8, meaning: '束缚，限制，自我囚禁', keyword: '束缚' },
      { id: 's9', name: '宝剑九', number: 9, meaning: '焦虑，噩梦，恐惧', keyword: '焦虑' },
      { id: 's10', name: '宝剑十', number: 10, meaning: '终结，痛苦，重生', keyword: '终结' },
      { id: 'sp', name: '宝剑侍从', number: 11, meaning: '好奇，警觉，沟通', keyword: '好奇' },
      { id: 'skn', name: '宝剑骑士', number: 12, meaning: '冲动，直接，行动', keyword: '直接' },
      { id: 'sq', name: '宝剑皇后', number: 13, meaning: '独立，清晰，公正', keyword: '独立' },
      { id: 'sk', name: '宝剑国王', number: 14, meaning: '权威，理性，公正', keyword: '理性' }
    ]
  },
  pentacles: {
    name: '星币',
    element: '土',
    color: '#22c55e',
    icon: '💰',
    cards: [
      { id: 'p1', name: '星币一', number: 1, meaning: '新机会，物质，稳定', keyword: '机会' },
      { id: 'p2', name: '星币二', number: 2, meaning: '平衡，适应，灵活', keyword: '平衡' },
      { id: 'p3', name: '星币三', number: 3, meaning: '合作，技能，成就', keyword: '合作' },
      { id: 'p4', name: '星币四', number: 4, meaning: '保守，控制，占有', keyword: '保守' },
      { id: 'p5', name: '星币五', number: 5, meaning: '困难，孤立，挑战', keyword: '困难' },
      { id: 'p6', name: '星币六', number: 6, meaning: '给予，接受，平衡', keyword: '给予' },
      { id: 'p7', name: '星币七', number: 7, meaning: '耐心，评估，等待', keyword: '耐心' },
      { id: 'p8', name: '星币八', number: 8, meaning: '技能，专注，勤奋', keyword: '专注' },
      { id: 'p9', name: '星币九', number: 9, meaning: '独立，成就，享受', keyword: '独立' },
      { id: 'p10', name: '星币十', number: 10, meaning: '传承，家庭，稳定', keyword: '传承' },
      { id: 'pp', name: '星币侍从', number: 11, meaning: '学习，实用，可靠', keyword: '学习' },
      { id: 'pkn', name: '星币骑士', number: 12, meaning: '可靠，稳定，耐心', keyword: '可靠' },
      { id: 'pq', name: '星币皇后', number: 13, meaning: '实际，关怀，稳定', keyword: '实际' },
      { id: 'pk', name: '星币国王', number: 14, meaning: '成功，稳定，务实', keyword: '成功' }
    ]
  }
}

const allCards = [...majorArcana]
Object.values(minorArcana).forEach(suit => {
  suit.cards.forEach(card => {
    allCards.push({
      ...card,
      suit: suit.name,
      element: suit.element,
      suitColor: suit.color,
      suitIcon: suit.icon
    })
  })
})

const formData = ref({
  question: '',
  selectedSpread: cardSpreads[0]
})

onMounted(() => {
  loadHistory()
})

function loadHistory() {
  const saved = localStorage.getItem('tarotHistory')
  if (saved) {
    historyList.value = JSON.parse(saved)
  }
}

function saveToHistory(data) {
  const record = {
    id: Date.now(),
    date: new Date().toLocaleString('zh-CN'),
    question: data.question,
    spread: data.spread.name,
    cards: data.cards.map(c => ({
      name: c.name,
      position: c.position,
      isReversed: c.isReversed
    })),
    overall: data.overall
  }
  historyList.value.unshift(record)
  if (historyList.value.length > 20) {
    historyList.value = historyList.value.slice(0, 20)
  }
  localStorage.setItem('tarotHistory', JSON.stringify(historyList.value))
}

function clearHistory() {
  if (confirm('确定要清空所有历史记录吗？')) {
    historyList.value = []
    localStorage.removeItem('tarotHistory')
  }
}

function goBack() {
  router.push('/')
}

function selectSpread(spread) {
  formData.value.selectedSpread = spread
}

async function shuffleCards() {
  isShuffling.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  isShuffling.value = false
}

function drawRandomCard() {
  const card = allCards[Math.floor(Math.random() * allCards.length)]
  const isReversed = Math.random() > 0.75
  return {
    ...card,
    isReversed,
    displayMeaning: isReversed ? getReversedMeaning(card) : card.meaning
  }
}

async function handleDrawTarot() {
  if (!formData.value.question.trim()) {
    alert('请输入您的问题！')
    return
  }

  loading.value = true
  flippedCards.value = []
  showCards.value = false
  await shuffleCards()
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const positions = getPositions(formData.value.selectedSpread.cards)
    const drawnCards = []
    
    for (let i = 0; i < formData.value.selectedSpread.cards; i++) {
      const card = drawRandomCard()
      const posDetail = formData.value.selectedSpread.cards === 10 ? positionDetails[i + 1] : null
      drawnCards.push({
        ...card,
        position: positions[i],
        positionIndex: i + 1,
        positionDetail: posDetail
      })
    }
    
    const overallReading = generateOverallReading(drawnCards)
    
    result.value = {
      question: formData.value.question,
      spread: formData.value.selectedSpread,
      cards: drawnCards,
      overall: overallReading
    }
    
    saveToHistory(result.value)
    
    await nextTick()
    showCards.value = true
    
    await new Promise(resolve => setTimeout(resolve, 200))
    animateCardFlip(drawnCards.length)
  } catch (err) {
    console.error(err)
    alert('抽牌失败，请重试')
  } finally {
    loading.value = false
  }
}

function getPositions(count) {
  if (count === 1) {
    return ['指引']
  } else if (count === 3) {
    return ['过去', '现在', '未来']
  } else {
    return ['现状', '挑战', '基础', '过去', '目标', '未来', '自我', '环境', '希望', '结果']
  }
}

async function animateCardFlip(count) {
  for (let i = 0; i < count; i++) {
    await new Promise(resolve => setTimeout(resolve, 400))
    flippedCards.value = [...flippedCards.value, i]
  }
}

function getReversedMeaning(card) {
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
  
  if (reversedMeanings[card.name]) {
    return reversedMeanings[card.name]
  }
  
  if (card.suit) {
    return `逆位：${card.meaning}的能量受阻或过度表达`
  }
  
  return '逆位含义'
}

function generateOverallReading(cards) {
  const hasMajorArcana = cards.some(c => !c.suit)
  const positiveCards = cards.filter(c => !c.isReversed && ['太阳', '星星', '世界', '魔术师', '皇后', '命运之轮', '力量'].includes(c.name))
  const challengingCards = cards.filter(c => c.isReversed || ['塔', '恶魔', '死神', '宝剑三', '宝剑五', '宝剑十', '星币五'].includes(c.name))
  
  const majorCount = cards.filter(c => !c.suit).length
  const reversedCount = cards.filter(c => c.isReversed).length
  
  let analysis = ''
  
  if (majorCount >= cards.length / 2) {
    analysis += '牌面中大阿卡纳牌居多，说明这是一个关于人生重大课题的时刻。'
  }
  
  if (reversedCount > cards.length / 2) {
    analysis += '逆位牌较多，提示你可能正处于能量受阻或需要调整的阶段。'
  }
  
  if (positiveCards.length > challengingCards.length) {
    analysis += '整体牌面积极向上，预示着你所询问的事情将会有良好的发展。保持乐观，把握机会。'
  } else if (challengingCards.length > positiveCards.length) {
    analysis += '牌面显示你可能面临一些挑战。但请记住，困难是成长的机会，通过努力和坚持，你能够克服这些障碍。'
  } else {
    analysis += '牌面显示情况复杂，既有挑战也有机遇。建议保持平衡的心态，在困难中寻找机会，在顺境中保持警惕。'
  }
  
  return analysis
}

function resetTarot() {
  result.value = null
  flippedCards.value = []
  showCards.value = false
  formData.value = {
    question: '',
    selectedSpread: cardSpreads[0]
  }
}

function getCardColor(card) {
  if (card.suit) {
    return card.suitColor
  }
  const colors = {
    '火': '#ef4444',
    '水': '#3b82f6',
    '风': '#6366f1',
    '土': '#22c55e'
  }
  return colors[card.element] || '#667eea'
}

function getCardIcon(card) {
  if (card.suit) {
    return card.suitIcon
  }
  return card.icon || '🃏'
}
</script>

<template>
  <div class="tarot-page">
    <header class="page-header">
      <button class="back-btn" @click="goBack">← 返回首页</button>
      <h1 class="page-title">🃏 塔罗牌占卜</h1>
      <p class="page-subtitle">神秘的塔罗牌在线抽牌和解读</p>
      <button class="history-btn" @click="showHistory = !showHistory">
        📜 历史 ({{ historyList.length }})
      </button>
    </header>

    <Transition name="slide">
      <div v-if="showHistory" class="history-panel">
        <div class="history-header">
          <h3>📜 占卜历史</h3>
          <button class="clear-btn" @click="clearHistory" v-if="historyList.length">清空</button>
        </div>
        <div v-if="historyList.length === 0" class="empty-history">
          <span class="empty-icon">🔮</span>
          <p>暂无历史记录</p>
        </div>
        <div v-else class="history-list">
          <div v-for="record in historyList" :key="record.id" class="history-item">
            <div class="history-date">{{ record.date }}</div>
            <div class="history-question">{{ record.question }}</div>
            <div class="history-spread">{{ record.spread }}</div>
            <div class="history-cards">
              <span v-for="(card, idx) in record.cards" :key="idx" class="mini-card">
                {{ card.name }}{{ card.isReversed ? '↺' : '' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

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
              <span class="spread-icon">{{ spread.icon }}</span>
              <span class="spread-name">{{ spread.name }}</span>
              <span class="spread-cards">{{ spread.cards }}张牌</span>
              <span class="spread-desc">{{ spread.desc }}</span>
            </button>
          </div>
        </div>

        <div class="deck-preview">
          <div class="deck-info">
            <span class="deck-count">共 {{ allCards.length }} 张牌</span>
            <span class="deck-detail">22张大阿卡纳 + 56张小阿卡纳</span>
          </div>
          <div class="deck-stack">
            <div v-for="i in 5" :key="i" class="deck-card" :style="{ transform: `rotate(${(i-3) * 3}deg) translateY(${(i-3) * 2}px)` }">
              <div class="card-back">
                <div class="card-pattern">✦</div>
              </div>
            </div>
          </div>
        </div>

        <button class="submit-btn" @click="handleDrawTarot" :disabled="loading">
          <span v-if="isShuffling" class="shuffle-text">
            <span class="shuffle-icon">🃏</span> 洗牌中...
          </span>
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

        <div v-if="result.spread.cards === 10" class="celtic-cross-layout">
          <div class="cross-section">
            <div class="cross-title">✚ 十字区 (1-6)</div>
            <div class="cross-grid">
              <div class="cross-row">
                <div class="cross-slot">
                  <div class="slot-label">5. 目标</div>
                  <TarotCard 
                    v-if="result.cards[4]" 
                    :card="result.cards[4]" 
                    :flipped="flippedCards.includes(4)"
                    :show="showCards"
                  />
                </div>
              </div>
              <div class="cross-row">
                <div class="cross-slot">
                  <div class="slot-label">4. 过去</div>
                  <TarotCard 
                    v-if="result.cards[3]" 
                    :card="result.cards[3]" 
                    :flipped="flippedCards.includes(3)"
                    :show="showCards"
                  />
                </div>
              </div>
              <div class="cross-row">
                <div class="cross-slot">
                  <div class="slot-label">3. 基础</div>
                  <TarotCard 
                    v-if="result.cards[2]" 
                    :card="result.cards[2]" 
                    :flipped="flippedCards.includes(2)"
                    :show="showCards"
                  />
                </div>
              </div>
              <div class="cross-row">
                <div class="cross-slot">
                  <div class="slot-label">2. 挑战</div>
                  <TarotCard 
                    v-if="result.cards[1]" 
                    :card="result.cards[1]" 
                    :flipped="flippedCards.includes(1)"
                    :show="showCards"
                  />
                </div>
              </div>
              <div class="cross-row">
                <div class="cross-slot">
                  <div class="slot-label">1. 现状</div>
                  <TarotCard 
                    v-if="result.cards[0]" 
                    :card="result.cards[0]" 
                    :flipped="flippedCards.includes(0)"
                    :show="showCards"
                  />
                </div>
              </div>
              <div class="cross-row">
                <div class="cross-slot">
                  <div class="slot-label">6. 未来</div>
                  <TarotCard 
                    v-if="result.cards[5]" 
                    :card="result.cards[5]" 
                    :flipped="flippedCards.includes(5)"
                    :show="showCards"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="staff-section">
            <div class="staff-title">📜 权杖区 (7-10)</div>
            <div class="staff-grid">
              <div v-for="i in 4" :key="i" class="staff-slot">
                <div class="slot-label">{{ i + 6 }}. {{ result.cards[i + 5]?.position }}</div>
                <TarotCard 
                  v-if="result.cards[i + 5]" 
                  :card="result.cards[i + 5]" 
                  :flipped="flippedCards.includes(i + 5)"
                  :show="showCards"
                />
              </div>
            </div>
          </div>
        </div>

        <TransitionGroup v-else name="card-appear" tag="div" class="cards-display" :class="`cards-${result.spread.cards}`">
          <div 
            v-for="(card, index) in result.cards" 
            :key="index"
            v-show="showCards"
            class="tarot-card-wrapper"
            :class="{ flipped: flippedCards.includes(index) }"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <div class="card-inner">
              <div class="card-face card-back-face">
                <span class="corner-tl">✦</span>
                <div class="card-pattern">✦</div>
                <span class="corner-br">✦</span>
              </div>
              <div class="card-face card-front-face" :style="{ '--card-color': getCardColor(card) }">
                <div class="card-position">{{ card.position }}</div>
                <div class="card-content" :class="{ reversed: card.isReversed }">
                  <div class="card-icon">{{ getCardIcon(card) }}</div>
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
        </TransitionGroup>

        <div v-if="result.spread.cards === 10" class="position-notes">
          <h3>📖 位置解读指南</h3>
          <div class="notes-grid">
            <div v-for="(detail, key) in positionDetails" :key="key" class="note-card">
              <div class="note-header">
                <span class="note-number">{{ detail.number }}</span>
                <span class="note-name">{{ detail.name }}</span>
              </div>
              <p class="note-desc">{{ detail.description }}</p>
              <p class="note-advice">💡 {{ detail.advice }}</p>
            </div>
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

<script>
import { h } from 'vue'

export default {
  components: {
    TarotCard: {
      props: ['card', 'flipped', 'show', 'horizontal'],
      setup(props) {
        const getCardColor = (card) => {
          if (card.suit) {
            return card.suitColor
          }
          const colors = {
            '火': '#ef4444',
            '水': '#3b82f6',
            '风': '#6366f1',
            '土': '#22c55e'
          }
          return colors[card.element] || '#667eea'
        }

        const getCardIcon = (card) => {
          if (card.suit) {
            return card.suitIcon
          }
          return card.icon || '🃏'
        }

        return { getCardColor, getCardIcon }
      },
      template: `
        <div 
          v-show="show"
          class="tarot-card-wrapper small"
          :class="{ flipped: flipped, horizontal: horizontal }"
        >
          <div class="card-inner">
            <div class="card-face card-back-face">
              <span class="corner-tl">✦</span>
              <div class="card-pattern">✦</div>
              <span class="corner-br">✦</span>
            </div>
            <div class="card-face card-front-face" :style="{ '--card-color': getCardColor(card) }">
              <div class="card-position">{{ card.position }}</div>
              <div class="card-content" :class="{ reversed: card.isReversed }">
                <div class="card-icon">{{ getCardIcon(card) }}</div>
                <div class="card-number" v-if="!card.suit">{{ card.number }}</div>
                <div class="card-name">{{ card.name }}</div>
                <div v-if="card.suit" class="card-suit">{{ card.suit }}</div>
                <div v-if="card.isReversed" class="reversed-badge">逆位</div>
              </div>
              <div class="card-keyword">{{ card.keyword }}</div>
            </div>
          </div>
        </div>
      `
    }
  }
}
</script>

<style scoped>
.tarot-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
  position: relative;
}

.tarot-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
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
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.history-btn {
  position: absolute;
  right: 0;
  top: 0;
  padding: 10px 20px;
  background: rgba(139, 92, 246, 0.3);
  border: 1px solid rgba(139, 92, 246, 0.5);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-btn:hover {
  background: rgba(139, 92, 246, 0.5);
}

.page-title {
  color: white;
  font-size: 2.2rem;
  margin-bottom: 10px;
  text-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { text-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
  to { text-shadow: 0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(236, 72, 153, 0.3); }
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.card-appear-enter-active {
  transition: all 0.5s ease-out;
}

.card-appear-enter-from {
  opacity: 0;
  transform: translateY(50px) scale(0.8);
}

.card-appear-leave-active {
  transition: all 0.3s ease-in;
}

.card-appear-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.history-panel {
  max-width: 600px;
  margin: 0 auto 30px;
  background: rgba(30, 30, 50, 0.95);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  position: relative;
  z-index: 1;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.history-header h3 {
  color: white;
  margin: 0;
}

.clear-btn {
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 6px;
  color: #fca5a5;
  cursor: pointer;
  font-size: 0.85rem;
}

.empty-history {
  text-align: center;
  padding: 30px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 10px;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-bottom: 10px;
  border-left: 3px solid #8b5cf6;
}

.history-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.history-question {
  color: white;
  font-weight: 500;
  margin-bottom: 4px;
}

.history-spread {
  font-size: 0.8rem;
  color: #a78bfa;
  margin-bottom: 8px;
}

.history-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mini-card {
  padding: 3px 8px;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 4px;
  font-size: 0.75rem;
  color: #c4b5fd;
}

.form-section {
  max-width: 650px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.form-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
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
  background: linear-gradient(90deg, #8b5cf6, #ec4899, #8b5cf6);
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.form-group {
  margin-bottom: 30px;
}

.form-group label {
  display: block;
  margin-bottom: 12px;
  color: #374151;
  font-weight: 600;
  font-size: 1.05rem;
}

.form-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  background: #ffffff;
  color: #1f2937;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #8b5cf6;
  outline: none;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.spread-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.spread-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.spread-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(236, 72, 153, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.spread-btn:hover::before {
  opacity: 1;
}

.spread-btn:hover {
  border-color: #8b5cf6;
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.2);
}

.spread-btn.active {
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
}

.spread-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.spread-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.spread-cards {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 4px;
}

.spread-desc {
  font-size: 0.75rem;
  opacity: 0.6;
}

.deck-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%);
  border-radius: 16px;
  margin-bottom: 25px;
}

.deck-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.deck-count {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7c3aed;
}

.deck-detail {
  font-size: 0.85rem;
  color: #9ca3af;
}

.deck-stack {
  position: relative;
  width: 80px;
  height: 110px;
}

.deck-card {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.card-back {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #ec4899 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.card-pattern {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.submit-btn {
  width: 100%;
  padding: 18px;
  border: none;
  border-radius: 14px;
  font-size: 1.15rem;
  font-weight: 600;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
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
  box-shadow: 0 12px 35px rgba(139, 92, 246, 0.5);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.shuffle-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.shuffle-icon {
  animation: shuffle 0.5s ease-in-out infinite;
  display: inline-block;
}

@keyframes shuffle {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}

.result-section {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.result-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
}

.result-header {
  text-align: center;
  margin-bottom: 35px;
  padding-bottom: 25px;
  border-bottom: 2px solid #f0f0f0;
}

.result-header h2 {
  color: #8b5cf6;
  font-size: 2rem;
  margin-bottom: 12px;
}

.question-text {
  color: #6b7280;
  font-size: 1rem;
  margin-bottom: 6px;
}

.spread-text {
  color: #ec4899;
  font-weight: 600;
  font-size: 1.05rem;
}

.celtic-cross-layout {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 35px;
}

.cross-section,
.staff-section {
  background: linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%);
  border-radius: 20px;
  padding: 25px;
}

.cross-title,
.staff-title {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: #7c3aed;
  margin-bottom: 20px;
}

.cross-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cross-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.cross-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.slot-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
  white-space: nowrap;
}

.staff-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.staff-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.6);
  padding: 15px;
  border-radius: 12px;
}

.cards-display {
  display: grid;
  gap: 20px;
  margin-bottom: 35px;
}

.cards-1 {
  grid-template-columns: 1fr;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.cards-3 {
  grid-template-columns: repeat(3, 1fr);
}

.tarot-card-wrapper {
  perspective: 1500px;
  height: 280px;
  animation: cardFloat 3s ease-in-out infinite;
}

.tarot-card-wrapper.small {
  height: 200px;
  width: 140px;
  perspective: 1200px;
}

.tarot-card-wrapper.horizontal .card-inner {
  transform: rotate(90deg);
}

.tarot-card-wrapper.horizontal.flipped .card-inner {
  transform: rotate(270deg);
}

.tarot-card-wrapper:nth-child(odd) {
  animation-delay: 0.5s;
}

.tarot-card-wrapper:nth-child(even) {
  animation-delay: 1s;
}

@keyframes cardFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 1.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform-style: preserve-3d;
  transform-origin: center center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border-radius: 16px;
}

.tarot-card-wrapper:hover .card-inner {
  transform: rotateY(15deg) rotateX(5deg);
  box-shadow: 0 20px 50px rgba(139, 92, 246, 0.4);
}

.tarot-card-wrapper.flipped .card-inner {
  transform: rotateY(180deg);
  animation: flipGlow 0.8s ease-out;
}

.tarot-card-wrapper.flipped:hover .card-inner {
  transform: rotateY(195deg) rotateX(5deg);
}

@keyframes flipGlow {
  0% { 
    filter: brightness(1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
  25% { 
    filter: brightness(1.5);
    box-shadow: 0 20px 60px rgba(139, 92, 246, 0.8), 0 0 80px rgba(236, 72, 153, 0.4);
  }
  50% { 
    filter: brightness(1.3);
    box-shadow: 0 15px 45px rgba(139, 92, 246, 0.6), 0 0 60px rgba(236, 72, 153, 0.3);
  }
  100% { 
    filter: brightness(1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  overflow: hidden;
}

.card-back-face {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #581c87 75%, #701a75 100%);
  background-size: 400% 400%;
  animation: gradientShift 4s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 8px 25px rgba(139, 92, 246, 0.5),
    0 0 40px rgba(139, 92, 246, 0.3),
    inset 0 0 60px rgba(139, 92, 246, 0.2);
  position: relative;
  overflow: hidden;
}

.card-back-face::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  pointer-events: none;
  box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.3);
}

.card-back-face::after {
  content: '✦ ✧ ✦ ✧ ✦';
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.25);
  font-size: 0.7rem;
  letter-spacing: 8px;
}

.card-back-face .corner-tl,
.card-back-face .corner-br {
  position: absolute;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.3);
}

.card-back-face .corner-tl {
  top: 15px;
  left: 15px;
}

.card-back-face .corner-br {
  bottom: 15px;
  right: 15px;
  transform: rotate(180deg);
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.card-back-face .card-pattern {
  font-size: 4rem;
  animation: pulseRotate 2.5s ease-in-out infinite;
  text-shadow: 
    0 0 20px rgba(255, 255, 255, 0.6),
    0 0 40px rgba(139, 92, 246, 0.5),
    0 0 60px rgba(236, 72, 153, 0.3);
  position: relative;
  z-index: 1;
}

.tarot-card-wrapper.small .card-back-face .card-pattern {
  font-size: 3rem;
}

@keyframes pulseRotate {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
  50% { transform: scale(1.15) rotate(180deg); opacity: 1; }
}

.card-front-face {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.15),
    0 0 40px rgba(139, 92, 246, 0.1);
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative;
  overflow: hidden;
}

.tarot-card-wrapper.small .card-front-face {
  padding: 8px;
}

.card-front-face::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--card-color, #8b5cf6), #ec4899, var(--card-color, #8b5cf6));
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}

.card-front-face::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--card-color, #8b5cf6);
  opacity: 0.3;
}

.card-position {
  text-align: center;
  font-size: 0.65rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 6px;
  font-weight: 600;
}

.tarot-card-wrapper.small .card-position {
  font-size: 0.55rem;
  margin-bottom: 4px;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
}

.card-content.reversed {
  transform: rotate(180deg);
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 6px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
}

.tarot-card-wrapper.small .card-icon {
  font-size: 1.8rem;
  margin-bottom: 4px;
}

.card-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--card-color, #8b5cf6);
  line-height: 1;
  margin-bottom: 2px;
}

.tarot-card-wrapper.small .card-number {
  font-size: 1.4rem;
}

.card-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2px;
}

.tarot-card-wrapper.small .card-name {
  font-size: 0.7rem;
}

.card-suit,
.card-element {
  font-size: 0.6rem;
  color: #6b7280;
}

.tarot-card-wrapper.small .card-suit {
  font-size: 0.5rem;
}

.reversed-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.5rem;
  font-weight: 600;
}

.card-keyword {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--card-color, #8b5cf6);
  padding: 4px 8px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 12px;
  margin: 6px 0;
}

.tarot-card-wrapper.small .card-keyword {
  font-size: 0.55rem;
  padding: 2px 6px;
  margin: 4px 0;
}

.card-meaning {
  text-align: center;
  font-size: 0.65rem;
  color: #6b7280;
  line-height: 1.4;
  padding: 6px;
  background: #f8fafc;
  border-radius: 6px;
}

.tarot-card-wrapper.small .card-meaning {
  display: none;
}

.position-notes {
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 16px;
  border-left: 4px solid #f59e0b;
}

.position-notes h3 {
  color: #92400e;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.note-card {
  background: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.note-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.note-number {
  width: 24px;
  height: 24px;
  background: #f59e0b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.note-name {
  font-weight: 700;
  color: #92400e;
  font-size: 0.95rem;
}

.note-desc {
  font-size: 0.8rem;
  color: #78350f;
  line-height: 1.5;
  margin-bottom: 6px;
}

.note-advice {
  font-size: 0.75rem;
  color: #a16207;
  font-style: italic;
  background: rgba(245, 158, 11, 0.1);
  padding: 6px 10px;
  border-radius: 6px;
}

.overall-section {
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%);
  border-radius: 16px;
  border-left: 4px solid #8b5cf6;
}

.overall-section h3 {
  color: #7c3aed;
  margin-bottom: 12px;
  font-size: 1.2rem;
}

.overall-section p {
  color: #4b5563;
  line-height: 1.7;
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
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
}

.btn-secondary {
  padding: 14px 30px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  background: white;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #8b5cf6;
  color: #8b5cf6;
}

@media (max-width: 1024px) {
  .celtic-cross-layout {
    grid-template-columns: 1fr;
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .tarot-page {
    padding: 15px;
  }

  .back-btn,
  .history-btn {
    position: static;
    margin-bottom: 15px;
    width: 100%;
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

  .deck-preview {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .cards-display {
    gap: 15px;
  }

  .cards-3 {
    grid-template-columns: repeat(2, 1fr);
  }

  .tarot-card-wrapper {
    height: 260px;
  }

  .cross-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .slot-5 { grid-column: 1 / -1; grid-row: 1; }
  .slot-4 { grid-column: 1; grid-row: 2; }
  .slot-3 { grid-column: 2; grid-row: 2; }
  .slot-1 { grid-column: 1; grid-row: 3; }
  .slot-2 { grid-column: 2; grid-row: 3; }
  .slot-6 { grid-column: 1 / -1; grid-row: 4; }

  .result-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .cards-3 {
    grid-template-columns: 1fr;
  }

  .tarot-card-wrapper {
    height: 240px;
    max-width: 280px;
    margin: 0 auto;
  }

  .cross-grid {
    grid-template-columns: 1fr;
  }

  .slot-5, .slot-4, .slot-3, .slot-1, .slot-2, .slot-6 {
    grid-column: 1;
  }
}
</style>
