import { ref, computed, onMounted } from 'vue'
import { storageGet, storageSet, generateId, formatDateTime } from '../utils/helpers.js'

const STORAGE_KEY = 'fortune_history'
const MAX_HISTORY_ITEMS = 50

export function useHistory() {
  const history = ref([])
  const isLoading = ref(false)
  const showHistory = ref(false)

  const hasHistory = computed(() => history.value.length > 0)
  const historyCount = computed(() => history.value.length)

  onMounted(() => {
    loadHistory()
  })

  function loadHistory() {
    isLoading.value = true
    try {
      const saved = storageGet(STORAGE_KEY, [])
      history.value = saved
    } catch (error) {
      console.error('[History] 加载历史记录失败:', error)
      history.value = []
    } finally {
      isLoading.value = false
    }
  }

  function saveHistory() {
    try {
      storageSet(STORAGE_KEY, history.value)
    } catch (error) {
      console.error('[History] 保存历史记录失败:', error)
    }
  }

  function addHistoryItem(item) {
    const newItem = {
      id: generateId(),
      ...item,
      timestamp: new Date().toISOString(),
      formattedTime: formatDateTime(new Date())
    }

    history.value.unshift(newItem)

    if (history.value.length > MAX_HISTORY_ITEMS) {
      history.value = history.value.slice(0, MAX_HISTORY_ITEMS)
    }

    saveHistory()
    return newItem
  }

  function removeHistoryItem(id) {
    const index = history.value.findIndex(item => item.id === id)
    if (index !== -1) {
      history.value.splice(index, 1)
      saveHistory()
      return true
    }
    return false
  }

  function clearHistory() {
    history.value = []
    saveHistory()
  }

  function getHistoryByType(type) {
    return history.value.filter(item => item.type === type)
  }

  function getHistoryById(id) {
    return history.value.find(item => item.id === id)
  }

  function toggleHistory() {
    showHistory.value = !showHistory.value
  }

  function openHistory() {
    showHistory.value = true
  }

  function closeHistory() {
    showHistory.value = false
  }

  return {
    history,
    isLoading,
    showHistory,
    hasHistory,
    historyCount,
    loadHistory,
    addHistoryItem,
    removeHistoryItem,
    clearHistory,
    getHistoryByType,
    getHistoryById,
    toggleHistory,
    openHistory,
    closeHistory
  }
}
