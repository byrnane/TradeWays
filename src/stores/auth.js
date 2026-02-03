import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { refreshAccessToken as esiRefreshToken } from '../services/esi.js'
import { saveToStorage, removeFromStorage, STORAGE_KEYS, needsRefresh } from '../services/storage.js'
import { useAllCharactersData } from '../composables/useAllCharactersData.js'

export const useAuthStore = defineStore('auth', () => {
  // State
  const characters = ref([])
  const currentCharacterId = ref(null) // Always store as number
  const characterData = ref({})
  const isLoading = ref(false)
  const isRefreshing = ref(false)
  const dataUpdateInterval = ref(null)
  const isInitializing = ref(true) // Add initialization state
  
  // Get all characters data manager
  const allCharactersManager = useAllCharactersData()
  
  // Validate token object
  const validateToken = (token) => {
    return token && 
           typeof token.access_token === 'string' && 
           token.access_token.length > 0 &&
           typeof token.refresh_token === 'string' && 
           token.refresh_token.length > 0 &&
           typeof token.expires_at === 'number' &&
           token.expires_at > Date.now()
  }

  // Helper functions
  const saveCurrentCharacterId = () => {
    if (currentCharacterId.value) {
      localStorage.setItem('current_character_id', currentCharacterId.value.toString())
    } else {
      localStorage.removeItem('current_character_id')
    }
  }
  
  // Load from localStorage (tokens are in memory only)
  const loadFromStorage = () => {
    try {
      // Load characters metadata
      const savedCharacters = localStorage.getItem('characters')
      if (savedCharacters) {
        const parsed = JSON.parse(savedCharacters)
        // Ensure character_id is a number
        characters.value = parsed.map(char => ({
          ...char,
          character_id: parseInt(char.character_id)
        }))
      }
      
      // Load current character ID
      const savedCurrentId = localStorage.getItem('current_character_id')
      if (savedCurrentId && savedCurrentId !== 'undefined' && savedCurrentId !== 'null') {
        currentCharacterId.value = parseInt(savedCurrentId)
      } else if (characters.value.length > 0) {
        // If no current character ID but we have characters, select the first one
        currentCharacterId.value = characters.value[0].character_id
        saveCurrentCharacterId()
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
    return characters.value.find(char => char.character_id === currentCharacterId.value) || null
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
  // Check if we have any characters
  if (characters.value.length === 0) {
    return false
  }
  
  // Check if we have a current character selected
  if (!currentCharacterId.value) {
    return false
  }
  
  // Check if character exists
  const currentChar = characters.value.find(c => c.character_id === currentCharacterId.value)
  if (!currentChar) {
    return false
  }
  
  // Check if we have tokens (they might be expired)
  if (!currentChar.access_token && !currentChar.refresh_token) {
    return false
  }
  
  // If we have access token, check if it's valid
  if (currentChar.access_token) {
    return currentChar.expires_at && currentChar.expires_at > Date.now()
  }
  
  // We have refresh token but no access token - still considered authenticated
  return true
})

  const isTokenExpired = computed(() => {
    return !expiresAt.value || Date.now() >= expiresAt.value
  })

  const isTokenExpiringSoon = computed(() => {
    // Token expires in less than 5 minutes
    return expiresAt.value && Date.now() >= expiresAt.value - 300000
  })

  const needsReauth = computed(() => {
    // Check if current character needs re-authentication
    if (!isAuthenticated.value) return false
    
    const currentChar = characters.value.find(c => c.character_id === currentCharacterId.value)
    if (!currentChar) return false
    
    // If we have refresh token but no valid access token
    if (currentChar.refresh_token && (!currentChar.access_token || Date.now() >= currentChar.expires_at)) {
      return true
    }
    
    return false
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
    currentCharacterId.value = newCharacter.character_id
    character.value = newCharacter
    
    // Save to localStorage
    saveCharacters()
    saveCurrentCharacterId()
    
    // Save tokens to localStorage
    saveTokensToSession()
  }

  const switchCharacter = (characterId) => {
    const char = characters.value.find(c => c.character_id === characterId)
    if (char) {
      currentCharacterId.value = char.character_id
      saveCurrentCharacterId()
      
      // Restore tokens for this character from localStorage
      const tokensData = localStorage.getItem('esi_tokens')
      if (tokensData) {
        try {
          const allTokens = JSON.parse(tokensData)
          const charTokens = allTokens[characterId]
          
          if (charTokens && validateToken(charTokens)) {
            // Update character with tokens
            character.value = {
              ...char,
              access_token: charTokens.access_token,
              refresh_token: charTokens.refresh_token,
              expires_at: charTokens.expires_at
            }
          }
        } catch (error) {
          console.error('Failed to restore tokens for character:', error)
        }
      } else {
        character.value = char
      }
      
      // Clear character data when switching
      characterData.value = {}
      localStorage.removeItem('esi_character_data')
      // Clear last update timestamp to force refresh
      localStorage.removeItem('esi_last_update')
      // Stop periodic updates and restart them
      stopPeriodicUpdates()
      if (isAuthenticated.value) {
        startPeriodicUpdates()
      }
    }
  }

  const removeCharacter = (characterId) => {
    const index = characters.value.findIndex(c => c.character_id === characterId)
    if (index >= 0) {
      characters.value.splice(index, 1)
      
      // Remove character data from localStorage
      const dataKey = `character_data_${characterId}`
      localStorage.removeItem(dataKey)
      
      // Remove token from localStorage
      const tokensData = localStorage.getItem('esi_tokens')
      if (tokensData) {
        const tokens = JSON.parse(tokensData)
        delete tokens[characterId]
        localStorage.setItem('esi_tokens', JSON.stringify(tokens))
      }
      
      // If removing current character, switch to another or logout
      if (currentCharacterId.value === characterId) {
        if (characters.value.length > 0) {
          currentCharacterId.value = characters.value[0].character_id
          saveCurrentCharacterId()
        } else {
          logout()
        }
      }
      
      saveCharacters()
    }
  }

  // Remove character when authentication fails permanently
  const removeCharacterAuthFailed = (characterId) => {
    removeCharacter(characterId)
  }

  // Save tokens to localStorage for persistence
  const saveTokensToSession = () => {
    // Get all existing tokens
    const allTokens = JSON.parse(localStorage.getItem('esi_tokens') || '{}')
    
    // Update tokens for all characters that have them
    characters.value.forEach(char => {
      if (char.access_token) {
        allTokens[char.character_id] = {
          access_token: char.access_token,
          refresh_token: char.refresh_token,
          expires_at: char.expires_at
        }
      } else {
      }
    })
    
    // Save to localStorage
    localStorage.setItem('esi_tokens', JSON.stringify(allTokens))
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
    
    // Save to localStorage
    localStorage.setItem('characters', JSON.stringify(charactersToSave))
    
    // Also save tokens
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
      
      return data.access_token
    } catch (error) {
      console.error('Failed to refresh token:', error)
      // If refresh fails permanently, remove the character
      if (error.response?.status === 400 || error.response?.status === 401) {
        // Refresh token invalid, removing character
        removeCharacterAuthFailed(currentCharacterId.value)
      }
      throw error
    } finally {
      isRefreshing.value = false
    }
  }

  // Refresh token for specific character
  const refreshCharacterToken = async (characterId) => {
    const char = characters.value.find(c => c.character_id === characterId)
    if (!char || !char.refresh_token) {
      throw new Error('No refresh token for character')
    }

    try {
      const data = await esiRefreshToken(char.refresh_token)
      
      // Update tokens in localStorage
      const tokensData = localStorage.getItem('esi_tokens')
      if (tokensData) {
        const tokens = JSON.parse(tokensData)
        tokens[characterId] = {
          access_token: data.access_token,
          refresh_token: data.refresh_token || char.refresh_token,
          expires_at: Date.now() + (data.expires_in * 1000)
        }
        localStorage.setItem('esi_tokens', JSON.stringify(tokens))
        
        // Update character in array
        const index = characters.value.findIndex(c => c.character_id === characterId)
        if (index >= 0) {
          characters.value[index] = {
            ...characters.value[index],
            access_token: data.access_token,
            refresh_token: data.refresh_token || char.refresh_token,
            expires_at: Date.now() + (data.expires_in * 1000)
          }
        }
        
        // If it's current character, update character.value
        if (characterId === currentCharacterId.value) {
          character.value = {
            ...character.value,
            access_token: data.access_token,
            refresh_token: data.refresh_token || char.refresh_token,
            expires_at: Date.now() + (data.expires_in * 1000)
          }
        }
      }
      
      return data.access_token
    } catch (error) {
      console.error(`Failed to refresh token for character ${characterId}:`, error)
      // If refresh fails permanently, remove the character
      if (error.response?.status === 400 || error.response?.status === 401) {
        removeCharacterAuthFailed(characterId)
      }
      throw error
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

  // Get data for any character
  const getCharacterDataById = (characterId) => {
    return allCharactersManager.getCharacterData(characterId)
  }
  
  // Update data for all characters
  const updateAllCharactersData = async () => {
    return await allCharactersManager.updateAllCharactersData(characters.value)
  }
  
  // Update data for specific character
  const updateSpecificCharacterData = async (characterId) => {
    return await allCharactersManager.updateCharacterData(characterId, characters.value)
  }
  
  const updateCharacterData = async () => {
    if (!isAuthenticated.value || !character.value) return
    
    try {
      
      // Use allCharactersManager to update current character
      await allCharactersManager.updateCharacterData(character.value.character_id, characters.value)
      
      // Get the updated data and set it in the store
      const updatedData = allCharactersManager.getCharacterData(character.value.character_id)
      if (updatedData) {
        setCharacterData(updatedData)
      }
    } catch (error) {
      console.error('Failed to update character data:', error)
      throw error
    }
  }
  
  const logout = () => {
    // Stop periodic updates first
    stopPeriodicUpdates()
    
    // Clear current character's tokens
    clearTokens()
    
    // Clear all data for current character
    characterData.value = {}
    currentCharacterId.value = null
    
    // Clear localStorage for current character
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
    localStorage.removeItem('esi_tokens')
    
    // Clear sessionStorage (for backward compatibility)
    sessionStorage.removeItem('esi_session_tokens')
    sessionStorage.removeItem('esi_refresh_tokens')
    
    // Stop periodic updates
    stopPeriodicUpdates()
  }

  // Initialize store (synchronous part)
  const initializeSync = () => {
    loadFromStorage()
    
    // If no characters, try to create from tokens
    if (characters.value.length === 0) {
      const tokensData = localStorage.getItem('esi_tokens')
      if (tokensData) {
        const tokens = JSON.parse(tokensData)
        
        characters.value = Object.keys(tokens).map(charId => ({
          character_id: parseInt(charId),
          name: `Character ${charId}`,
          corporation_id: null,
          corporation_name: null,
          alliance_id: null,
          alliance_name: null,
          security_status: 0
        }))
        
        // Save the created characters
        localStorage.setItem('characters', JSON.stringify(characters.value))
        
        // Set first as current
        if (characters.value.length > 0) {
          currentCharacterId.value = characters.value[0].character_id
          localStorage.setItem('current_character_id', currentCharacterId.value.toString())
        }
      }
    }
    
    // Restore tokens from localStorage for all characters
    if (characters.value.length > 0) {
      const tokensData = localStorage.getItem('esi_tokens')
      
      if (tokensData) {
        try {
          const allTokens = JSON.parse(tokensData)
          
          // Update all characters with their tokens
          characters.value = characters.value.map(char => {
            const charTokens = allTokens[char.character_id]
            
            if (charTokens) {
              return {
                ...char,
                access_token: charTokens.access_token || null,
                refresh_token: charTokens.refresh_token || null,
                expires_at: charTokens.expires_at || 0
              }
            }
            
            return char
          })
        } catch (error) {
          console.error('Failed to restore tokens from localStorage:', error)
        }
      }
      
      // Set current character
      if (currentCharacterId.value) {
        const currentChar = characters.value.find(char => char.character_id === currentCharacterId.value)
        if (currentChar) {
          character.value = currentChar
        }
      }
    }
  }
  
  // Initialize async part (token refresh and data loading)
  const initializeAsync = async () => {
    // If no characters, nothing to initialize
    if (characters.value.length === 0) {
      isInitializing.value = false
      return
    }
    
    // First, validate all characters and remove those with invalid tokens
    const tokensData = localStorage.getItem('esi_tokens')
    if (tokensData) {
      const allTokens = JSON.parse(tokensData)
      const charactersToRemove = []
      
      characters.value.forEach(char => {
        const token = allTokens[char.character_id]
        // Only remove if we have no refresh token
        if (!token || !token.refresh_token) {
          charactersToRemove.push(char.character_id)
        }
      })
      
      // Remove characters with no refresh tokens
      charactersToRemove.forEach(id => {
        removeCharacterAuthFailed(id)
      })
    }
    
    if (characters.value.length > 0 && currentCharacterId.value) {
      const currentChar = characters.value.find(char => 
        char.character_id === currentCharacterId.value
      )
      
      if (currentChar) {
        // Set as current character
        character.value = currentChar
        
        // Check if we have valid tokens
        if (!currentChar.access_token) {
          console.error('No access token for current character')
          // Try to restore from localStorage
          const tokensData = localStorage.getItem('esi_tokens')
          if (tokensData) {
            const allTokens = JSON.parse(tokensData)
            const charTokens = allTokens[currentChar.character_id]
            if (charTokens && validateToken(charTokens)) {
              character.value = {
                ...currentChar,
                access_token: charTokens.access_token,
                refresh_token: charTokens.refresh_token,
                expires_at: charTokens.expires_at
              }
            }
          }
        }
        
        if (character.value.access_token) {
          // Check if token needs refresh
          const isExpired = Date.now() >= character.value.expires_at
          
          if (isExpired) {
            try {
              await refreshAccessToken()
            } catch (error) {
              console.error('Failed to refresh token on init:', error)
            }
          }
        } else if (character.value.refresh_token) {
          // We have refresh token but no access token, try to get new access token
          try {
            await refreshAccessToken()
          } catch (error) {
            console.error('Failed to get new access token on init:', error)
          }
        }
        
        // Load character data if we have valid access token
        if (character.value.access_token && character.value.expires_at > Date.now()) {
          try {
            await updateCharacterData()
            // Also load data for all other characters
            await updateAllCharactersData()
          } catch (error) {
            console.error('Failed to update character data on init:', error)
          }
        }
        
        // Start periodic updates
        startPeriodicUpdates()
      }
    }
    
    isInitializing.value = false
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
    // Use the centralized manager
    allCharactersManager.startPeriodicUpdates()
  }
  
  // Stop periodic updates
  const stopPeriodicUpdates = () => {
    // Stop both auth store and manager updates
    if (dataUpdateInterval.value) {
      clearInterval(dataUpdateInterval.value)
      dataUpdateInterval.value = null
    }
    allCharactersManager.stopPeriodicUpdates()
  }

  // Initialize store (synchronous)
  initializeSync()
  
  // Don't start periodic updates here - wait for async initialization
  
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
    needsReauth,
    
    // Methods
    addCharacter,
    switchCharacter,
    removeCharacter,
    removeCharacterAuthFailed,
    setTokens,
    clearTokens,
    refreshAccessToken,
    refreshCharacterToken,
    logout,
    logoutAll,
    initializeAsync,
    updateCharacterData,
    updateAllCharactersData,
    updateSpecificCharacterData,
    getCharacterDataById,
    setCharacterData,
    startPeriodicUpdates,
    stopPeriodicUpdates
  }
})
