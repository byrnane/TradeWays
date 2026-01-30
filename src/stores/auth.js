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

  const setTokens = (token, refresh, expiresIn) => {
    accessToken.value = token
    refreshToken.value = refresh
    expiresAt.value = Date.now() + (expiresIn * 1000)
    
    localStorage.setItem('esi_access_token', token)
    localStorage.setItem('esi_refresh_token', refresh)
    localStorage.setItem('esi_expires_at', expiresAt.value.toString())
  }

  const clearTokens = () => {
    accessToken.value = null
    refreshToken.value = null
    expiresAt.value = null
    
    localStorage.removeItem('esi_access_token')
    localStorage.removeItem('esi_refresh_token')
    localStorage.removeItem('esi_expires_at')
  }

  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch('https://login.eveonline.com/v2/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_ESI_CLIENT_ID}:${import.meta.env.VITE_ESI_CLIENT_SECRET}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=refresh_token&refresh_token=' + refreshToken.value
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      setTokens(data.access_token, data.refresh_token, data.expires_in)
      
      return data.access_token
    } catch (error) {
      console.error('Failed to refresh token:', error)
      logout()
      throw error
    }
  }

  const getValidToken = async () => {
    // Check if token is expired or will expire in next 5 minutes
    if (!expiresAt.value || Date.now() >= expiresAt.value - 300000) {
      await refreshAccessToken()
    }
    return accessToken.value
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

  const isLoadingAuth = computed(() => isLoading.value)

  return {
    // State
    accessToken,
    refreshToken,
    character,
    characterData,
    expiresAt,
    isAuthenticated,
    isLoading: isLoadingAuth,
    // Actions
    setTokens,
    clearTokens,
    refreshAccessToken,
    getValidToken,
    setCharacter,
    setCharacterData,
    updateCharacterData,
    logout
  }
})
