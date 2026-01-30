<template>
  <div class="relative min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900 flex items-center justify-center">
    <div class="text-center">
      <div v-if="loading" class="space-y-4">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-accent"></div>
        <p class="text-neutral-300">Обработка авторизации...</p>
      </div>
      
      <div v-else-if="error" class="space-y-4">
        <div class="rounded-lg border border-red-800/50 bg-red-900/20 p-6 text-red-300 max-w-md">
          <h2 class="mb-2 text-lg font-semibold">Ошибка авторизации</h2>
          <p>{{ error }}</p>
        </div>
        <router-link to="/auth" class="inline-block rounded-md border border-neutral-700 bg-neutral-800/60 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700/60">
          Попробовать снова
        </router-link>
      </div>
      
      <div v-else-if="success" class="space-y-4">
        <div class="rounded-lg border border-green-800/50 bg-green-900/20 p-6 text-green-300 max-w-md">
          <h2 class="mb-2 text-lg font-semibold">Авторизация успешна!</h2>
          <p>Добро пожаловать, {{ characterName }}!</p>
        </div>
        <router-link to="/" class="inline-block rounded-md border border-accent/60 bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20">
          Перейти на главную
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { exchangeCodeForTokens, verifyToken } from '../services/esi.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const success = ref(false)
const characterName = ref('')

onMounted(async () => {
  try {
    const { code, state } = route.query
    const savedState = localStorage.getItem('esi_state')
    
    if (!code || !state || state !== savedState) {
      throw new Error('Invalid authorization response')
    }
    
    localStorage.removeItem('esi_state')
    
    const tokenData = await exchangeCodeForTokens(code)
    const characterData = await verifyToken(tokenData.access_token)
    
    authStore.setTokens(
      tokenData.access_token,
      tokenData.refresh_token,
      tokenData.expires_in
    )
    authStore.setCharacter(characterData)
    
    characterName.value = characterData.name
    success.value = true
    
    setTimeout(() => {
      router.push('/')
    }, 2000)
    
  } catch (err) {
    error.value = err.message || 'Произошла ошибка при обработке авторизации'
  } finally {
    loading.value = false
  }
})
</script>
