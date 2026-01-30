import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // State
  const isLoading = ref(false)
  const loadingMessage = ref('')
  const lastDataUpdate = ref(null)
  const nextDataUpdate = ref(null)
  const dataUpdateInterval = 10 * 60 * 1000 // 10 minutes in milliseconds

  // Getters
  const isDataStale = computed(() => {
    if (!lastDataUpdate.value) return true
    return Date.now() - lastDataUpdate.value > dataUpdateInterval
  })

  const timeUntilNextUpdate = computed(() => {
    if (!nextDataUpdate.value) return null
    const remaining = nextDataUpdate.value - Date.now()
    if (remaining <= 0) return 'Обновление...'
    
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })

  // Actions
  const setLoading = (loading, message = '') => {
    isLoading.value = loading
    loadingMessage.value = message
  }

  const startLoading = (message = 'Загрузка...') => {
    setLoading(true, message)
  }

  const stopLoading = () => {
    setLoading(false)
  }

  const updateDataTimestamp = () => {
    lastDataUpdate.value = Date.now()
    nextDataUpdate.value = lastDataUpdate.value + dataUpdateInterval
  }

  const formatISK = (value) => {
    if (!value || value === 0) return '0.00 ISK'
    return new Intl.NumberFormat('ru-RU').format(value) + ' ISK'
  }

  const formatISKShort = (value) => {
    if (!value || value === 0) return '0 ISK'
    
    const abs = Math.abs(value)
    const sign = value < 0 ? '-' : ''
    
    if (abs >= 1e12) {
      return sign + (abs / 1e12).toFixed(1) + 't ISK' // Trillion
    } else if (abs >= 1e9) {
      return sign + (abs / 1e9).toFixed(1) + 'b ISK' // Billion
    } else if (abs >= 1e6) {
      return sign + (abs / 1e6).toFixed(1) + 'm ISK' // Million
    } else if (abs >= 1e3) {
      return sign + (abs / 1e3).toFixed(1) + 'k ISK' // Thousand
    } else {
      return sign + Math.round(abs).toString() + ' ISK'
    }
  }

  return {
    // State
    isLoading,
    loadingMessage,
    lastDataUpdate,
    nextDataUpdate,
    // Getters
    isDataStale,
    timeUntilNextUpdate,
    // Actions
    setLoading,
    startLoading,
    stopLoading,
    updateDataTimestamp,
    formatISK,
    formatISKShort
  }
})
