import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('esi_access_token') || null)
  const refreshToken = ref(localStorage.getItem('esi_refresh_token') || null)
  const character = ref(JSON.parse(localStorage.getItem('esi_character') || 'null'))
  const characterData = ref(JSON.parse(localStorage.getItem('esi_character_data') || '{}'))
  const expiresAt = ref(parseInt(localStorage.getItem('esi_expires_at') || '0'))

  const isAuthenticated = computed(() => {
    return accessToken.value && Date.now() < expiresAt.value
  })

  const setTokens = (access, refresh, expiresIn) => {
    accessToken.value = access
    refreshToken.value = refresh
    expiresAt.value = Date.now() + (expiresIn * 1000)
    
    localStorage.setItem('esi_access_token', access)
    localStorage.setItem('esi_refresh_token', refresh)
    localStorage.setItem('esi_expires_at', expiresAt.value.toString())
  }

  const setCharacter = (charData) => {
    character.value = charData
    localStorage.setItem('esi_character', JSON.stringify(charData))
  }

  const setCharacterData = (data) => {
    characterData.value = data
    localStorage.setItem('esi_character_data', JSON.stringify(data))
  }

  const updateCharacterData = (key, value) => {
    characterData.value[key] = value
    localStorage.setItem('esi_character_data', JSON.stringify(characterData.value))
  }

  const logout = () => {
    accessToken.value = null
    refreshToken.value = null
    character.value = null
    characterData.value = {}
    expiresAt.value = 0
    
    localStorage.removeItem('esi_access_token')
    localStorage.removeItem('esi_refresh_token')
    localStorage.removeItem('esi_character')
    localStorage.removeItem('esi_character_data')
    localStorage.removeItem('esi_expires_at')
  }

  return {
    accessToken,
    refreshToken,
    character,
    characterData,
    expiresAt,
    isAuthenticated,
    setTokens,
    setCharacter,
    setCharacterData,
    updateCharacterData,
    logout
  }
})
