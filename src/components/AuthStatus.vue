<template>
  <div v-if="authStore.isAuthenticated" class="flex items-center gap-2 text-xs text-neutral-500">
    <div class="flex items-center gap-1">
      <div 
        class="h-2 w-2 rounded-full" 
        :class="authStore.isRefreshing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'"
      ></div>
      <span v-if="authStore.isRefreshing">{{ $t('status.refreshing') }}</span>
      <span v-else>{{ $t('status.active') }}</span>
    </div>
    <span v-if="tokenExpiryTime">• {{ tokenExpiryTime }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const { t } = useI18n()

const tokenExpiryTime = computed(() => {
  if (!authStore.expiresAt) return null
  
  const now = Date.now()
  const expiresAt = authStore.expiresAt
  const diff = expiresAt - now
  
  if (diff <= 0) return t('status.expired')
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return t('status.expiresInHours', { hours, minutes })
  } else {
    return t('status.expiresInMinutes', { minutes })
  }
})
</script>
