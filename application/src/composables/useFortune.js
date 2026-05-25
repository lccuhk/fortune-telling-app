import { ref, computed } from 'vue'

export function useFortune() {
  const loading = ref(false)
  const result = ref(null)
  const error = ref('')

  const hasResult = computed(() => result.value !== null)
  const isLoading = computed(() => loading.value)

  function reset() {
    result.value = null
    error.value = ''
  }

  function setLoading(value) {
    loading.value = value
  }

  function setResult(data) {
    result.value = data
    error.value = ''
  }

  function setError(message) {
    error.value = message
    result.value = null
  }

  async function executeFortune(fn, ...args) {
    if (loading.value) return

    loading.value = true
    error.value = ''

    try {
      const data = await fn(...args)
      result.value = data
      return data
    } catch (err) {
      error.value = err.message || '操作失败，请重试'
      console.error('[Fortune] 执行失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    result,
    error,
    hasResult,
    isLoading,
    reset,
    setLoading,
    setResult,
    setError,
    executeFortune
  }
}
