import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { refreshAccessToken as esiRefreshToken } from '../services/esi.js'
import { saveToStorage, removeFromStorage, STORAGE_KEYS, needsRefresh } from '../services/storage.js'

export const useAuthStore = defineStore('auth', () => {
  // State
  const characters = ref([])
  const currentCharacterId = ref(null)
  const characterData = ref({})
  const isLoading = ref(false)
  const isRefreshing = ref(false)
  const dataUpdateInterval = ref(null)
  const isInitializing = ref(true) // Add initialization state
  
  // Helper functions
  const saveCurrentCharacterId = () => {
    if (currentCharacterId.value && currentCharacterId.value !== 'null') {
      localStorage.setItem('esi_current_character_id', currentCharacterId.value.toString())
    } else {
      localStorage.removeItem('esi_current_character_id')
    }
  }
  
  // Load from localStorage (tokens are in memory only)
  const loadFromStorage = () => {
    try {
      // Load characters metadata
      const savedCharacters = localStorage.getItem('esi_characters')
      if (savedCharacters) {
        const parsed = JSON.parse(savedCharacters)
        // Ensure character_id is a number
        characters.value = parsed.map(char => ({
          ...char,
          character_id: parseInt(char.character_id)
        }))
      }
      
      // Load current character ID
      const savedCurrentId = localStorage.getItem('esi_current_character_id')
      if (savedCurrentId && savedCurrentId !== 'undefined' && savedCurrentId !== 'null') {
        currentCharacterId.value = savedCurrentId
      } else if (characters.value.length > 0) {
        // If no current character ID but we have characters, select the first one
        currentCharacterId.value = characters.value[0].character_id.toString()
        saveCurrentCharacterId()
        console.log('Auth store: Auto-selected first character:', currentCharacterId.value)
      }
      
      // Load character data
      const savedData = localStorage.getItem('esi_character_data')
      if (savedData) {
        characterData.value = JSON.parse(savedData)
      }
    } catch (error) {
      console.error('Failed to load from storage:', error)
    }
  }
  
  // Initial load
  loadFromStorage()
  
  // Get current character
  const character = computed(() => {
    return characters.value.find(char => char.character_id === parseInt(currentCharacterId.value)) || null
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
    const char = characters.value.find(c => c.character_id === parseInt(characterId))
    if (char) {
      currentCharacterId.value = char.character_id.toString()
      saveCurrentCharacterId()
      // Clear character data when switching
      characterData.value = {}
      localStorage.removeItem('esi_character_data')
    }
  }

  const removeCharacter = (characterId) => {
    const index = characters.value.findIndex(c => c.character_id === parseInt(characterId))
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

  // Save tokens to sessionStorage
  const saveTokensToSession = () => {
    const char = character.value
    if (char && char.access_token) {
      // Get all existing tokens
      const allTokens = JSON.parse(sessionStorage.getItem('esi_session_tokens') || '{}')
      
      // Update tokens for current character
      allTokens[char.character_id] = {
        access_token: char.access_token,
        refresh_token: char.refresh_token,
        expires_at: char.expires_at
      }
      
      // Save back
      sessionStorage.setItem('esi_session_tokens', JSON.stringify(allTokens))
    }
  }

  const saveCharacters = () => {
    const charactersToSave = characters.value.map(char => ({
      character_id: char.character_id, // Keep as number
      name: char.name,
      corporation_id: char.corporation_id,
      corporation_name: char.corporation_name,
      alliance_id: char.alliance_id,
      alliance_name: char.alliance_name,
      security_status: char.security_status,
      expires_at: char.expires_at
    }))
    saveToStorage(STORAGE_KEYS.CHARACTERS, charactersToSave)
    // Also save tokens to session
    saveTokensToSession()
  }

  const saveCharacterData = () => {
    saveToStorage(STORAGE_KEYS.CHARACTER_DATA, characterData.value)
  }

  const setTokens = (token, refresh, expiresIn) => {
    const char = character.value
    if (char) {
      char.access_token = token
      char.refresh_token = refresh
      char.expires_at = Date.now() + (expiresIn * 1000)
      // Save tokens to session
      saveTokensToSession()
    }
  }

  const clearTokens = () => {
    const char = character.value
    if (char) {
      char.access_token = null
      char.refresh_token = null
      char.expires_at = null
      // Update session storage
      saveTokensToSession()
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
    saveCharacterData()
    saveToStorage(STORAGE_KEYS.LAST_UPDATE, Date.now())
  }

  const updateCharacterData = async () => {
    if (!isAuthenticated.value || !character.value) return
    
    // Wait a bit for API to be available
    let retries = 0
    while (!window.__app_api__ && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      retries++
    }
    
    try {
      // Use the global API instance
      const api = window.__app_api__
      if (!api) {
        console.warn('API not available after waiting, skipping update')
        return
      }
      
      const characterId = character.value.character_id
      
      // Load data in parallel with error handling
      const results = await Promise.allSettled([
        api.characters.wallet.balance(characterId),
        api.characters.location(characterId),
        api.characters.online(characterId)
      ])

      const currentData = characterData.value || {}
      const updatedData = {
        ...currentData,
        lastUpdated: Date.now()
      }

      // Handle each result individually
      if (results[0].status === 'fulfilled') {
        updatedData.wallet = results[0].value.data
      } else {
        console.error('Failed to load wallet:', results[0].reason)
        // Keep old data if available
        if (currentData.wallet) {
          updatedData.wallet = currentData.wallet
        }
      }

      if (results[1].status === 'fulfilled') {
        updatedData.location = results[1].value.data
      } else {
        console.error('Failed to load location:', results[1].reason)
        if (currentData.location) {
          updatedData.location = currentData.location
        }
      }

      if (results[2].status === 'fulfilled') {
        updatedData.online = results[2].value.data
      } else {
        console.error('Failed to load online status:', results[2].reason)
        if (currentData.online) {
          updatedData.online = currentData.online
        }
      }

      setCharacterData(updatedData)
      
      return updatedData
    } catch (error) {
      console.error('Failed to update character data:', error)
      throw error
    }
  }

  const logout = () => {
    // Clear current character's tokens
    clearTokens()
    
    // Clear all data
    characterData.value = {}
    currentCharacterId.value = null
    
    // Clear localStorage
    removeFromStorage(STORAGE_KEYS.CHARACTER_DATA)
    removeFromStorage(STORAGE_KEYS.CURRENT_CHARACTER_ID)
  }

  const logoutAll = () => {
    // Clear all data
    clearAll()
  }

  const clearAll = () => {
    characters.value = []
    currentCharacterId.value = null
    characterData.value = {}
    
    // Clear localStorage
    removeFromStorage(STORAGE_KEYS.CHARACTERS)
    removeFromStorage(STORAGE_KEYS.CURRENT_CHARACTER_ID)
    removeFromStorage(STORAGE_KEYS.CHARACTER_DATA)
    removeFromStorage(STORAGE_KEYS.LAST_UPDATE)
    
    // Clear sessionStorage
    sessionStorage.removeItem('esi_session_tokens')
    
    // Stop periodic updates
    stopPeriodicUpdates()
  }

  // Initialize store (synchronous part)
  const initializeSync = () => {
    loadFromStorage()
    
    // Restore tokens from sessionStorage
    if (characters.value.length > 0 && currentCharacterId.value) {
      const targetId = parseInt(currentCharacterId.value)
      const currentChar = characters.value.find(char => char.character_id === targetId)
      
      if (currentChar) {
        const sessionData = sessionStorage.getItem('esi_session_tokens')
        
        if (sessionData) {
          try {
            const allTokens = JSON.parse(sessionData)
            const charTokens = allTokens[currentChar.character_id]
            
            if (charTokens) {
              const charIndex = characters.value.findIndex(c => c.character_id === currentChar.character_id)
              if (charIndex >= 0) {
                characters.value[charIndex].access_token = charTokens.access_token
                characters.value[charIndex].refresh_token = charTokens.refresh_token
                characters.value[charIndex].expires_at = charTokens.expires_at
              }
            }
          } catch (error) {
            console.error('Failed to restore tokens from session:', error)
          }
        }
      }
    }
  }
  
  // Initialize async part (token refresh and data loading)
  const initializeAsync = async () => {
    if (characters.value.length > 0 && currentCharacterId.value) {
      const currentChar = characters.value.find(char => 
        char.character_id === parseInt(currentCharacterId.value)
      )
      
      if (currentChar && currentChar.access_token) {
        // Check if token needs refresh (only if actually expired)
        const isExpired = Date.now() >= currentChar.expires_at
        
        if (isExpired) {
          try {
            await refreshAccessToken()
          } catch (error) {
            console.error('Failed to refresh token on init:', error)
            // Remove expired character
            removeCharacter(currentChar.character_id)
            isInitializing.value = false
            return
          }
        }
        
        // Always load character data on init
        try {
          console.log('Character ID from store:', currentChar.character_id)
          console.log('Character ID from token sub:', currentChar.sub)
          await updateCharacterData()
        } catch (error) {
          console.error('Failed to update character data on init:', error)
          // Don't fail completely if ESI is down
        }
        
        // Start periodic updates
        startPeriodicUpdates()
      } else {
        // No valid tokens, clear current character
        currentCharacterId.value = null
        saveCurrentCharacterId()
      }
    }
    
    isInitializing.value = false
    console.log('initializeAsync completed')
  }
  
  // Get refresh interval from settings
  const getRefreshInterval = () => {
    try {
      const settings = JSON.parse(localStorage.getItem('app_settings') || '{}')
      return (settings.dataRefreshInterval || 10) * 60 * 1000
    } catch (error) {
      console.error('Failed to load refresh interval:', error)
      return 10 * 60 * 1000 // Default 10 minutes
    }
  }
  
  // Start periodic data updates
  const startPeriodicUpdates = () => {
    if (dataUpdateInterval.value) {
      clearInterval(dataUpdateInterval.value)
    }
    
    const interval = getRefreshInterval()
    dataUpdateInterval.value = setInterval(async () => {
      if (isAuthenticated.value) {
        try {
          await updateCharacterData()
        } catch (error) {
          console.error('Failed to update character data periodically:', error)
        }
      }
    }, interval)
  }
  
  // Stop periodic updates
  const stopPeriodicUpdates = () => {
    if (dataUpdateInterval.value) {
      clearInterval(dataUpdateInterval.value)
      dataUpdateInterval.value = null
    }
  }

  // Initialize store (synchronous)
  initializeSync()
  
  // Start auto-refresh when store is created
  if (isAuthenticated.value) {
    startPeriodicUpdates()
  }
  
  // Initialize async part in background
  initializeAsync()

  return {
    // State
    characters,
    currentCharacterId,
    characterData,
    isLoading,
    isRefreshing,
    isInitializing,
    
    // Computed
    character,
    accessToken,
    refreshToken,
    expiresAt,
    isAuthenticated,
    isTokenExpired,
    isTokenExpiringSoon,
    
    // Methods
    addCharacter,
    switchCharacter,
    removeCharacter,
    setTokens,
    clearTokens,
    refreshAccessToken,
    logout,
    logoutAll,
    initializeAsync,
    updateCharacterData,
    setCharacterData,
    startPeriodicUpdates,
    stopPeriodicUpdates
  }
})
