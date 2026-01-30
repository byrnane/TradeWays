<template>
  <transition name="progress-fade">
    <div v-if="isVisible" class="fixed top-0 left-0 right-0 z-50">
      <div class="h-1 bg-neutral-800 overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-accent/50 via-accent to-accent/50 transition-all duration-300 ease-out"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <transition name="message-fade">
        <div v-if="uiStore.loadingMessage" class="bg-neutral-900 border-b border-neutral-800 px-4 py-2">
          <div class="flex items-center gap-2 text-sm text-neutral-300">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ uiStore.loadingMessage }}
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '../stores/ui.js'
import { useRouter } from 'vue-router'

const uiStore = useUIStore()
const router = useRouter()

const progress = ref(0)
const isVisible = ref(false)
const progressInterval = ref(null)
const minDurationTimer = ref(null)
const startTime = ref(0)
const MIN_DURATION = 300 // Minimum 300ms

// Simulate progress
const startProgress = () => {
  progress.value = 0
  isVisible.value = true
  startTime.value = Date.now()
  
  // Clear any existing intervals
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
  }
  
  // Simulate loading progress
  const targetProgress = 85 // Don't reach 100%, let completion handle it
  const increment = targetProgress / 20 // 20 steps to reach target
  let currentProgress = 0
  
  progressInterval.value = setInterval(() => {
    currentProgress += increment
    if (currentProgress >= targetProgress) {
      clearInterval(progressInterval.value)
      progressInterval.value = null
    }
    progress.value = Math.min(currentProgress, targetProgress)
  }, 50) // Update every 50ms for smooth animation
}

const completeProgress = () => {
  // Clear progress interval
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
    progressInterval.value = null
  }
  
  // Jump to 100%
  progress.value = 100
  
  // Ensure minimum duration
  const elapsed = Date.now() - startTime.value
  const remaining = Math.max(0, MIN_DURATION - elapsed)
  
  minDurationTimer.value = setTimeout(() => {
    isVisible.value = false
    progress.value = 0
  }, remaining)
}

// Watch loading state
watch(() => uiStore.isLoading, (isLoading) => {
  if (isLoading) {
    startProgress()
  } else {
    completeProgress()
  }
})

// Show progress during navigation
let navigationGuard = null

onMounted(() => {
  // Add navigation guard
  navigationGuard = router.beforeEach((to, from, next) => {
    // Don't show loading if navigating within the same component
    if (to.name === from.name) {
      next()
      return
    }
    
    uiStore.startLoading('Загрузка страницы...')
    
    // Small delay to ensure the progress bar is visible
    setTimeout(() => {
      next()
    }, 50)
  })
  
  // Hide progress after navigation completes
  router.afterEach(() => {
    setTimeout(() => {
      uiStore.stopLoading()
    }, 100)
  })
})

onUnmounted(() => {
  if (navigationGuard) {
    navigationGuard()
  }
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
  }
  if (minDurationTimer.value) {
    clearTimeout(minDurationTimer.value)
  }
})
</script>

<style scoped>
.progress-fade-enter-active,
.progress-fade-leave-active {
  transition: opacity 0.3s ease;
}

.progress-fade-enter-from,
.progress-fade-leave-to {
  opacity: 0;
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.2s ease;
}

.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
