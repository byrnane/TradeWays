import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { refreshAccessToken as esiRefreshToken } from '../services/esi.js'

export const useAuthStore = defineStore('auth', () => {
  const characters = ref(JSON.parse(localStorage.getItem('esi_characters') || '[]'))
  const currentCharacterId = ref(localStorage.getItem('esi_current_character_id') || null)
  const characterData = ref(JSON.parse(localStorage.getItem('esi_character_data') || '{}'))
  const isLoading = ref(false)
  const isRefreshing = ref(false)
  
  // Get current character
  const character = computed(() => {
    return characters.value.find(char => char.character_id.toString() === currentCharacterId.value) || null
  })
  
  // Get current character's tokens
  const accessToken = computed(() => {
    const char = character.value
    return char ? char.access_token : null
  })
  
  const refreshToken = computed(() => {
    const char = character.value
    return char ? char.refresh_token : null
  })
  
  const expiresAt = computed(() => {
    const char = character.value
    return char ? char.expires_at : 0
  })

  const isAuthenticated = computed(() => {
    return accessToken.value && Date.now() < expiresAt.value
  })

  const isTokenExpired = computed(() => {
    return !expiresAt.value || Date.now() >= expiresAt.value
  })

  const isTokenExpiringSoon = computed(() => {
    // Token expires in less than 5 minutes
    return expiresAt.value && Date.now() >= expiresAt.value - 300000
  })

  const addCharacter = (charData, tokenData) => {
    const newCharacter = {
      ...charData,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    }
    
    // Check if character already exists
    const existingIndex = characters.value.findIndex(char => char.character_id === newCharacter.character_id)
    
    if (existingIndex >= 0) {
      // Update existing character
      characters.value[existingIndex] = newCharacter
    } else {
      // Add new character
      characters.value.push(newCharacter)
    }
    
    // Set as current character
    currentCharacterId.value = newCharacter.character_id.toString()
    
    // Save to localStorage
    saveCharacters()
    saveCurrentCharacterId()
  }

  const switchCharacter = (characterId) => {
    const char = characters.value.find(c => c.character_id.toString() === characterId.toString())
    if (char) {
      currentCharacterId.value = characterId.toString()
      saveCurrentCharacterId()
      // Clear character data when switching
      characterData.value = {}
      localStorage.removeItem('esi_character_data')
    }
  }

  const removeCharacter = (characterId) => {
    const index = characters.value.findIndex(char => char.character_id.toString() === characterId.toString())
    if (index >= 0) {
      characters.value.splice(index, 1)
      
      // If removing current character, switch to another or logout
      if (currentCharacterId.value === characterId.toString()) {
        if (characters.value.length > 0) {
          currentCharacterId.value = characters.value[0].character_id.toString()
          saveCurrentCharacterId()
        } else {
          logout()
        }
      }
      
      saveCharacters()
    }
  }

  const saveCharacters = () => {
    // Don't save tokens to localStorage, save only character info
    const charsToSave = characters.value.map(char => ({
      character_id: char.character_id,
      name: char.name,
      corporation_id: char.corporation_id,
      corporation_name: char.corporation_name,
      alliance_id: char.alliance_id,
      alliance_name: char.alliance_name,
      security_status: char.security_status,
      // Note: tokens are kept in memory but not persisted
      // They will be refreshed when needed
    }))
    localStorage.setItem('esi_characters', JSON.stringify(charsToSave))
  }

  const saveCurrentCharacterId = () => {
    localStorage.setItem('esi_current_character_id', currentCharacterId.value)
  }

  const setTokens = (token, refresh, expiresIn) => {
    const char = character.value
    if (char) {
      char.access_token = token
      char.refresh_token = refresh
      char.expires_at = Date.now() + (expiresIn * 1000)
    }
  }

  const clearTokens = () => {
    const char = character.value
    if (char) {
      char.access_token = null
      char.refresh_token = null
      char.expires_at = null
    }
  }

  const refreshAccessToken = async () => {
    if (!refreshToken.value || isRefreshing.value) {
      throw new Error('No refresh token available or refresh already in progress')
    }

    isRefreshing.value = true

    try {
      const data = await esiRefreshToken(refreshToken.value)
      
      // Update tokens with new values
      setTokens(data.access_token, data.refresh_token || refreshToken.value, data.expires_in)
      
      console.log('Token refreshed successfully')
      return data.access_token
    } catch (error) {
      console.error('Failed to refresh token:', error)
      // If refresh fails, remove this character
      if (character.value) {
        removeCharacter(character.value.character_id)
      }
      throw error
    } finally {
      isRefreshing.value = false
    }
  }

  const getValidToken = async () => {
    // If no token, throw error
    if (!accessToken.value) {
      throw new Error('No access token available')
    }

    // If token is expired or expiring soon, refresh it
    if (isTokenExpired.value || isTokenExpiringSoon.value) {
      await refreshAccessToken()
    }
    
    return accessToken.value
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
    // Clear current character's tokens
    clearTokens()
    
    // Clear all data
    characterData.value = {}
    currentCharacterId.value = null
    
    // Clear localStorage
    localStorage.removeItem('esi_character_data')
    localStorage.removeItem('esi_current_character_id')
  }

  const logoutAll = () => {
    // Clear everything
    characters.value = []
    characterData.value = {}
    currentCharacterId.value = null
    isLoading.value = false
    isRefreshing.value = false
    
    localStorage.removeItem('esi_characters')
    localStorage.removeItem('esi_character_data')
    localStorage.removeItem('esi_current_character_id')
  }

  // Initialize characters from localStorage (without tokens)
  // Tokens will be refreshed when needed
  const initializeCharacters = () => {
    const savedChars = localStorage.getItem('esi_characters')
    if (savedChars) {
      characters.value = JSON.parse(savedChars)
    }
  }

  // Auto-refresh mechanism
  let refreshTimer = null

  const startAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
    }

    // Check every minute if token needs refresh
    refreshTimer = setInterval(async () => {
      if (isAuthenticated.value && isTokenExpiringSoon.value && !isRefreshing.value) {
        try {
          await refreshAccessToken()
        } catch (error) {
          console.error('Auto-refresh failed:', error)
          clearInterval(refreshTimer)
        }
      }
    }, 60000) // Check every minute
  }

  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  // Initialize
  initializeCharacters()
  
  // Start auto-refresh when store is created
  if (isAuthenticated.value) {
    startAutoRefresh()
  }

  return {
    // State
    characters,
    currentCharacterId,
    character,
    characterData,
    accessToken,
    refreshToken,
    expiresAt,
    isLoading,
    isRefreshing,
    isAuthenticated,
    isTokenExpired,
    isTokenExpiringSoon,
    // Actions
    addCharacter,
    switchCharacter,
    removeCharacter,
    setTokens,
    clearTokens,
    refreshAccessToken,
    getValidToken,
    setCharacterData,
    updateCharacterData,
    logout,
    logoutAll,
    startAutoRefresh,
    stopAutoRefresh
  }
})
