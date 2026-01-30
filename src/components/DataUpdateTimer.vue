<template>
  <div v-if="uiStore.lastDataUpdate" class="flex items-center gap-1">
    <div class="h-2 w-2 rounded-full" :class="uiStore.isDataStale ? 'bg-yellow-500' : 'bg-green-500'"></div>
    <span class="text-xs text-neutral-500">
      {{ uiStore.isDataStale ? 'Данные устарели' : `Обновление через: ${timeLeft}` }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '../stores/ui.js'

const uiStore = useUIStore()
const currentTime = ref(Date.now())
const updateInterval = ref(null)

const timeLeft = computed(() => {
  if (!uiStore.nextDataUpdate) return 'N/A'
  if (uiStore.isDataStale) return 'Данные устарели'
  
  const remaining = uiStore.nextDataUpdate - currentTime.value
  if (remaining <= 0) return 'Обновление...'
  
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

onMounted(() => {
  // Update current time every second
  updateInterval.value = setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value)
  }
})
</script>
