import { ref, computed } from 'vue'
import { useFortune } from './useFortune.js'
import { useCardAnimation } from './useAnimation.js'
import { getRandomItem, delay } from '../utils/helpers.js'

const majorArcana = [
  {
    id: 'm0',
    name: '愚者',
    number: 0,
    meaning: '新的开始，冒险，纯真',
    keyword: '自由',
    element: '风',
    icon: '🃏'
  },
  {
    id: 'm1',
    name: '魔术师',
    number: 1,
    meaning: '创造力，意志力，显化',
    keyword: '创造',
    element: '风',
    icon: '🧙'
  },
  {
    id: 'm2',
    name: '女祭司',
    number: 2,
    meaning: '直觉，神秘，内在智慧',
    keyword: '直觉',
    element: '水',
    icon: '👸'
  },
  {
    id: 'm3',
    name: '皇后',
    number: 3,
    meaning: '丰饶，母性，创造力',
    keyword: '丰饶',
    element: '土',
    icon: '👑'
  },
  {
    id: 'm4',
    name: '皇帝',
    number: 4,
    meaning: '权威，稳定，控制',
    keyword: '权威',
    element: '火',
    icon: '🏛️'
  },
  {
    id: 'm5',
    name: '教皇',
    number: 5,
    meaning: '传统，信仰，指导',
    keyword: '信仰',
    element: '土',
    icon: '⛪'
  },
  {
    id: 'm6',
    name: '恋人',
    number: 6,
    meaning: '爱情，选择，和谐',
    keyword: '选择',
    element: '风',
    icon: '💕'
  },
  {
    id: 'm7',
    name: '战车',
    number: 7,
    meaning: '意志力，胜利，决心',
    keyword: '胜利',
    element: '水',
    icon: '🏎️'
  },
  {
    id: 'm8',
    name: '力量',
    number: 8,
    meaning: '勇气，耐心，内在力量',
    keyword: '力量',
    element: '火',
    icon: '🦁'
  },
  {
    id: 'm9',
    name: '隐者',
    number: 9,
    meaning: '内省，独处，寻求真理',
    keyword: '内省',
    element: '土',
    icon: '🏮'
  },
  {
    id: 'm10',
    name: '命运之轮',
    number: 10,
    meaning: '变化，命运，周期',
    keyword: '命运',
    element: '火',
    icon: '☸️'
  },
  {
    id: 'm11',
    name: '正义',
    number: 11,
    meaning: '公正，平衡，因果',
    keyword: '公正',
    element: '风',
    icon: '⚖️'
  },
  {
    id: 'm12',
    name: '倒吊人',
    number: 12,
    meaning: '牺牲，等待，新视角',
    keyword: '牺牲',
    element: '水',
    icon: '🙃'
  },
  {
    id: 'm13',
    name: '死神',
    number: 13,
    meaning: '结束，转变，重生',
    keyword: '转变',
    element: '水',
    icon: '💀'
  },
  {
    id: 'm14',
    name: '节制',
    number: 14,
    meaning: '平衡，调和，耐心',
    keyword: '平衡',
    element: '火',
    icon: '⚗️'
  },
  {
    id: 'm15',
    name: '恶魔',
    number: 15,
    meaning: '束缚，欲望，物质主义',
    keyword: '束缚',
    element: '土',
    icon: '😈'
  },
  {
    id: 'm16',
    name: '塔',
    number: 16,
    meaning: '突变，觉醒，破坏',
    keyword: '突变',
    element: '火',
    icon: '🗼'
  },
  {
    id: 'm17',
    name: '星星',
    number: 17,
    meaning: '希望，灵感，宁静',
    keyword: '希望',
    element: '风',
    icon: '⭐'
  },
  {
    id: 'm18',
    name: '月亮',
    number: 18,
    meaning: '幻觉，恐惧，潜意识',
    keyword: '幻觉',
    element: '水',
    icon: '🌙'
  },
  {
    id: 'm19',
    name: '太阳',
    number: 19,
    meaning: '快乐，成功，活力',
    keyword: '快乐',
    element: '火',
    icon: '☀️'
  },
  {
    id: 'm20',
    name: '审判',
    number: 20,
    meaning: '重生，觉醒，救赎',
    keyword: '觉醒',
    element: '火',
    icon: '📯'
  },
  {
    id: 'm21',
    name: '世界',
    number: 21,
    meaning: '完成，成就，圆满',
    keyword: '圆满',
    element: '土',
    icon: '🌍'
  }
]

const suits = [
  { name: '权杖', element: '火', icon: '🔥' },
  { name: '圣杯', element: '水', icon: '💧' },
  { name: '宝剑', element: '风', icon: '⚔️' },
  { name: '星币', element: '土', icon: '💰' }
]

const minorNumbers = [
  'Ace',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '侍从',
  '骑士',
  '王后',
  '国王'
]
const minorMeanings = {
  Ace: '新的开始，机会',
  2: '平衡，选择',
  3: '合作，发展',
  4: '稳定，基础',
  5: '冲突，失去',
  6: '和谐，给予',
  7: '挑战，评估',
  8: '行动，专注',
  9: '满足，成就',
  10: '完成，圆满',
  侍从: '探索，学习',
  骑士: '行动，热情',
  王后: '直觉，情感',
  国王: '权威，稳定'
}

const minorArcana = []
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

export function useTarot() {
  const { loading, result, reset, executeFortune } = useFortune()
  const { cardRotations, flippedCards, flipCards, resetCardAnimation } = useCardAnimation()

  const showCards = ref(false)
  const usedCards = ref([])

  const cardSpreads = [
    { name: '单张牌', cards: 1, desc: '快速指引', icon: '🃏' },
    { name: '三张牌', cards: 3, desc: '过去-现在-未来', icon: '🎴' }
  ]

  const hasResult = computed(() => result.value !== null)

  function getCardColor(card) {
    const colors = {
      火: '#ef4444',
      水: '#3b82f6',
      土: '#eab308',
      风: '#8b5cf6'
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
      return getRandomItem(allCards)
    }
    const card = getRandomItem(available)
    usedCards.value.push(card.id)
    return card
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

  async function drawTarot(question, selectedSpread) {
    return executeFortune(async () => {
      resetCardAnimation()
      showCards.value = false

      await delay(1500)

      const positions = getPositions(selectedSpread)
      const drawnCards = []

      for (let i = 0; i < selectedSpread.cards; i++) {
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

      const overallReading = generateOverallReading(drawnCards, question)

      const tarotResult = {
        question,
        spread: selectedSpread,
        cards: drawnCards,
        overall: overallReading
      }

      await delay(300)
      showCards.value = true
      await delay(200)
      await flipCards(drawnCards.length)

      return tarotResult
    })
  }

  function resetTarot() {
    reset()
    resetCardAnimation()
    showCards.value = false
  }

  return {
    loading,
    result,
    showCards,
    cardRotations,
    flippedCards,
    cardSpreads,
    allCards,
    majorArcana,
    minorArcana,
    hasResult,
    getCardColor,
    getPositions,
    drawTarot,
    resetTarot
  }
}
