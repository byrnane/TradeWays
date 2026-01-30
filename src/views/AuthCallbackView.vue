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
import { loadEssentialCharacterData } from '../services/character.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const success = ref(false)
const characterName = ref('')

const loadFullCharacterData = async (accessToken, characterId) => {
  try {
    const response = await fetch(`https://esi.evetech.net/latest/characters/${characterId}/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to load character data: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to load full character data:', error)
    throw error
  }
}

onMounted(async () => {
  try {
    const { code, state } = route.query
    const savedState = localStorage.getItem('esi_state')
    
    if (!code || !state || state !== savedState) {
      throw new Error('Invalid authorization response')
    }
    
    localStorage.removeItem('esi_state')
    
    const tokenData = await exchangeCodeForTokens(code)
    const authCharacterData = await verifyToken(tokenData.access_token)
    
    // Extract character_id from CharacterID field (ESI returns it with capital letters)
    if (!authCharacterData.character_id && authCharacterData.CharacterID) {
      authCharacterData.character_id = authCharacterData.CharacterID
    }
    
    // Map other fields to consistent naming
    if (authCharacterData.CharacterName && !authCharacterData.name) {
      authCharacterData.name = authCharacterData.CharacterName
    }
    
    if (!authCharacterData.character_id) {
      throw new Error('Could not extract character_id from auth data')
    }
    
    // Load full character data with game parameters
    const fullCharacterData = await loadFullCharacterData(
      tokenData.access_token,
      authCharacterData.character_id
    )
    
    // Merge auth data with full character data
    const mergedCharacterData = {
      ...authCharacterData,
      ...fullCharacterData
    }
    
    authStore.setTokens(
      tokenData.access_token,
      tokenData.refresh_token,
      tokenData.expires_in
    )
    authStore.setCharacter(mergedCharacterData)
    
    // Load essential character data (wallet, location, etc.)
    try {
      const essentialData = await loadEssentialCharacterData(
        tokenData.access_token,
        authCharacterData.character_id
      )
      authStore.setCharacterData(essentialData)
    } catch (dataError) {
      console.error('Failed to load character data:', dataError)
      // Don't fail auth if character data loading fails
    }
    
    characterName.value = mergedCharacterData.name
    success.value = true
    
    setTimeout(() => {
      router.push('/')
    }, 2000)
    
  } catch (err) {
    console.error('Auth callback error:', err)
    error.value = err.message || 'Произошла ошибка при обработке авторизации'
  } finally {
    loading.value = false
  }
})
</script>
