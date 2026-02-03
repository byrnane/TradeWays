<template>
  <div class="update-timer">
    <div v-if="!compact" class="flex items-center gap-2 text-xs text-gray-500">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ formattedTime }}</span>
    </div>
    <div v-else class="flex items-center gap-1 text-xs text-gray-500">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ formattedTime }}</span>
    </div>
    <button
      v-if="!compact"
      @click="$emit('refresh')"
      :disabled="isLoading"
      class="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg v-if="isLoading" class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span>{{ isLoading ? $t('common.updating') : $t('common.refresh') }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  initialTime: {
    type: Number,
    default: 60 // 1 minute in seconds
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh', 'timer-expired'])

const timeLeft = ref(props.initialTime)
let intervalId = null

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const startTimer = () => {
  timeLeft.value = props.initialTime
  intervalId = setInterval(() => {
    timeLeft.value--
    
    if (timeLeft.value <= 0) {
      clearInterval(intervalId)
      emit('timer-expired')
      // Auto-restart timer after emitting
      setTimeout(() => {
        startTimer()
      }, 100)
    }
  }, 1000)
}

const resetTimer = () => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  startTimer()
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// Expose methods for parent component
defineExpose({
  resetTimer
})
</script>
