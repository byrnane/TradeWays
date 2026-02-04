import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { refreshAccessToken as esiRefreshToken } from '../services/esi.js'
import { removeFromStorage, STORAGE_KEYS } from '../services/storage.js'
import { useAllCharactersData } from '../composables/useAllCharactersData.js'
import { useCharacterStatusStore } from '../composables/useCharacterStatusStore.js'
import { getTokens, setTokenForCharacter, removeTokenForCharacter } from '../utils/tokenUtils.js'

export const useAuthStore = defineStore('auth', () => {
  // State
  const characters = ref([])
  const currentCharacterId = ref(null)
  const characterData = ref({})
  const charactersData = ref({})
  const isLoading = ref(false)
  const isRefreshing = ref(false)
  const isInitializing = ref(true)
  
  // Managers
  const allCharactersManager = useAllCharactersData()
  const statusStore = useCharacterStatusStore()
  
  // Constants
  const TOKEN_REFRESH_THRESHOLD = 300000 // 5 minutes
  
  // Helper functions
  const saveCurrentCharacterId = () => {
    if (currentCharacterId.value) {
      localStorage.setItem('current_character_id', currentCharacterId.value.toString())
    } else {
      localStorage.removeItem('current_character_id')
    }
  }
  
  const saveCharacters = () => {
    const charactersToSave = characters.value.map(char => ({
      character_id: char.character_id,
      name: char.name,
      corporation_id: char.corporation_id,
      corporation_name: char.corporation_name,
      alliance_id: char.alliance_id,
      alliance_name: char.alliance_name,
      security_status: char.security_status
    }))
    
    localStorage.setItem('characters', JSON.stringify(charactersToSave))
  }
  
  const getStoredTokens = () => {
    try {
      const tokensData = localStorage.getItem('esi_tokens')
      return tokensData ? JSON.parse(tokensData) : {}
    } catch (error) {
      console.error('Failed to parse tokens:', error)
      return {}
    }
  }
  // Load data from localStorage
  const loadFromStorage = () => {
    try {
      // Load characters
      const savedCharacters = localStorage.getItem('characters')
      if (savedCharacters) {
        const parsed = JSON.parse(savedCharacters)
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
        currentCharacterId.value = characters.value[0].character_id
        saveCurrentCharacterId()
      }
      
      // Load character data
      characters.value.forEach(char => {
        const dataKey = `character_data_${char.character_id}`
        const storedData = localStorage.getItem(dataKey)
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData)
            charactersData.value[char.character_id] = parsed
            statusStore.updateStatus(char.character_id, parsed?.online)
          } catch (error) {
            console.error(`Failed to load data for character ${char.character_id}:`, error)
          }
        }
      })
      
      // Set current character data
      if (currentCharacterId.value) {
        characterData.value = charactersData.value[currentCharacterId.value] || {}
      }
    } catch (error) {
      console.error('Failed to load from storage:', error)
    }
  }
  
  // Initial load
  loadFromStorage()
  // Computed properties
  const character = computed(() => 
    characters.value.find(char => char.character_id === currentCharacterId.value) || null
  )
  
  const accessToken = computed(() => {
    const tokens = getStoredTokens()
    const token = tokens[currentCharacterId.value]
    return token?.access_token || null
  })
  
  const refreshToken = computed(() => {
    const tokens = getStoredTokens()
    const token = tokens[currentCharacterId.value]
    return token?.refresh_token || null
  })
  
  const expiresAt = computed(() => {
    const tokens = getStoredTokens()
    const token = tokens[currentCharacterId.value]
    return token?.expires_at || 0
  })
  
  const isTokenExpired = computed(() => 
    !expiresAt.value || Date.now() >= expiresAt.value
  )
  
  const isTokenExpiringSoon = computed(() => 
    expiresAt.value && Date.now() >= expiresAt.value - TOKEN_REFRESH_THRESHOLD
  )
  const isAuthenticated = computed(() => {
    if (!characters.value.length || !currentCharacterId.value) {
      return false
    }
    
    const tokens = getStoredTokens()
    const token = tokens[currentCharacterId.value]
    
    if (!token || (!token.access_token && !token.refresh_token)) {
      return false
    }
    
    // If we have access token, check if it's valid
    if (token.access_token) {
      return token.expires_at && token.expires_at > Date.now()
    }
    
    // We have refresh token but no access token - still considered authenticated
    return true
  })
  
  const needsReauth = computed(() => {
    if (!isAuthenticated.value) return false
    
    const tokens = getStoredTokens()
    const token = tokens[currentCharacterId.value]
    
    if (!token) return false
    
    // If we have refresh token but no valid access token
    return token.refresh_token && (!token.access_token || Date.now() >= token.expires_at)
  })

  // Character management
  const addCharacter = async (charData, tokenData) => {
    const newCharacter = { ...charData }
    
    // Save tokens FIRST before updating any reactive state
    await setTokenForCharacter(newCharacter.character_id, {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    })
    
    // Check if character already exists
    const existingIndex = characters.value.findIndex(char => char.character_id === newCharacter.character_id)
    
    if (existingIndex >= 0) {
      characters.value[existingIndex] = newCharacter
    } else {
      characters.value.push(newCharacter)
    }
    
    // Set as current character AFTER token is saved
    currentCharacterId.value = newCharacter.character_id
    
    // Save to localStorage
    saveCharacters()
    saveCurrentCharacterId()
  }

  const switchCharacter = async (characterId) => {
    const char = characters.value.find(c => c.character_id === characterId)
    if (!char) return
    
    currentCharacterId.value = char.character_id
    saveCurrentCharacterId()
    
    // Update character data
    characterData.value = charactersData.value[characterId] || {}
    
    // Restart periodic updates
    allCharactersManager.stopPeriodicUpdates()
    if (isAuthenticated.value) {
      allCharactersManager.startPeriodicUpdates()
    }
  }

  const removeCharacter = async (characterId) => {
    const index = characters.value.findIndex(c => c.character_id === characterId)
    if (index < 0) return
    
    characters.value.splice(index, 1)
    
    // Remove character data
    localStorage.removeItem(`character_data_${characterId}`)
    delete charactersData.value[characterId]
    
    // Remove token
    await removeTokenForCharacter(characterId)
    
    // Handle current character removal
    if (currentCharacterId.value === characterId) {
      if (characters.value.length > 0) {
        currentCharacterId.value = characters.value[0].character_id
        saveCurrentCharacterId()
      } else {
        await logout()
      }
    }
    
    saveCharacters()
  }

  // Token management
  const setCurrentCharacterTokens = async (token, refresh, expiresIn) => {
    if (!currentCharacterId.value) return
    
    await setTokenForCharacter(currentCharacterId.value, {
      access_token: token,
      refresh_token: refresh,
      expires_at: Date.now() + (expiresIn * 1000)
    })
  }
  
  const clearTokens = async () => {
    if (!currentCharacterId.value) return
    await removeTokenForCharacter(currentCharacterId.value)
  }

  const refreshAccessToken = async () => {
    if (!refreshToken.value || isRefreshing.value) {
      throw new Error('No refresh token available or refresh already in progress')
    }
    
    isRefreshing.value = true
    
    try {
      const data = await esiRefreshToken(refreshToken.value)
      await setCurrentCharacterTokens(
        data.access_token, 
        data.refresh_token || refreshToken.value, 
        data.expires_in
      )
      return data.access_token
    } catch (error) {
      console.error('Failed to refresh token:', error)
      // Don't remove character automatically on token refresh error
      // User should manually reauthorize if needed
      throw error
    } finally {
      isRefreshing.value = false
    }
  }

  const refreshCharacterToken = async (characterId) => {
    const tokens = await getTokens()
    const token = tokens[characterId]
    
    if (!token?.refresh_token) {
      throw new Error('No refresh token for character')
    }
    
    try {
      const data = await esiRefreshToken(token.refresh_token)
      await setTokenForCharacter(characterId, {
        access_token: data.access_token,
        refresh_token: data.refresh_token || token.refresh_token,
        expires_at: Date.now() + (data.expires_in * 1000)
      })
      return data.access_token
    } catch (error) {
      console.error(`Failed to refresh token for character ${characterId}:`, error)
      // Don't remove character automatically on token refresh error
      // User should manually reauthorize if needed
      throw error
    }
  }

  const getValidToken = async () => {
    if (!accessToken.value) {
      throw new Error('No access token available')
    }
    
    if (isTokenExpired.value || isTokenExpiringSoon.value) {
      await refreshAccessToken()
    }
    
    return accessToken.value
  }

  // Data management
  const setCharacterData = (data) => {
    if (!currentCharacterId.value) return
    
    charactersData.value[currentCharacterId.value] = data
    characterData.value = data
    
    const dataKey = `character_data_${currentCharacterId.value}`
    localStorage.setItem(dataKey, JSON.stringify(data))
    
    statusStore.updateStatus(currentCharacterId.value, data?.online)
  }
  
  const setCharacterDataById = (characterId, data) => {
    charactersData.value[characterId] = data
    
    if (characterId === currentCharacterId.value) {
      characterData.value = data
    }
    
    const dataKey = `character_data_${characterId}`
    localStorage.setItem(dataKey, JSON.stringify(data))
    
    statusStore.updateStatus(characterId, data?.online)
  }
  
  const getCharacterData = (characterId) => 
    charactersData.value[characterId] || null
  
  const getCharacterDataById = (characterId) => 
    charactersData.value[characterId] || null
  const updateCharacterData = async () => {
    if (!isAuthenticated.value || !character.value) return
    
    try {
      await allCharactersManager.updateCharacterData(character.value.character_id, characters.value)
      const updatedData = allCharactersManager.getCharacterData(character.value.character_id)
      if (updatedData) {
        setCharacterData(updatedData)
      }
    } catch (error) {
      console.error('Failed to update character data:', error)
      throw error
    }
  }
  
  const updateAllCharactersData = async () => 
    await allCharactersManager.updateAllCharactersData(characters.value)
  
  const updateSpecificCharacterData = async (characterId) => 
    await allCharactersManager.updateCharacterData(characterId, characters.value)
  
  // Periodic updates
  const getRefreshInterval = () => {
    try {
      const settings = JSON.parse(localStorage.getItem('app_settings') || '{}')
      return (settings.dataRefreshInterval || 10) * 60 * 1000
    } catch (error) {
      console.error('Failed to load refresh interval:', error)
      return 10 * 60 * 1000
    }
  }
  
  const startPeriodicUpdates = () => 
    allCharactersManager.startPeriodicUpdates()
  
  const stopPeriodicUpdates = () => 
    allCharactersManager.stopPeriodicUpdates()
  // Authentication
  const logout = async () => {
    stopPeriodicUpdates()
    await clearTokens()
    
    characterData.value = {}
    currentCharacterId.value = null
    
    removeFromStorage(STORAGE_KEYS.CHARACTER_DATA)
    removeFromStorage(STORAGE_KEYS.CURRENT_CHARACTER_ID)
  }
  
  // Initialization
  const initializeSync = () => {
    loadFromStorage()
    
    // Create characters from tokens if none exist
    if (characters.value.length === 0) {
      const tokens = getStoredTokens()
      const tokenEntries = Object.entries(tokens)
      
      if (tokenEntries.length > 0) {
        characters.value = tokenEntries.map(([charId]) => ({
          character_id: parseInt(charId),
          name: `Character ${charId}`,
          corporation_id: null,
          corporation_name: null,
          alliance_id: null,
          alliance_name: null,
          security_status: 0
        }))
        
        saveCharacters()
        
        if (characters.value.length > 0) {
          currentCharacterId.value = characters.value[0].character_id
          saveCurrentCharacterId()
        }
      }
    }
  }
  
  const initializeAsync = async () => {
    if (characters.value.length === 0 || !currentCharacterId.value) {
      isInitializing.value = false
      return
    }
    
    const currentChar = characters.value.find(char => 
      char.character_id === currentCharacterId.value
    )
    
    if (!currentChar) {
      isInitializing.value = false
      return
    }
    
    try {
      // Check and refresh token if needed
      const tokens = await getTokens()
      const token = tokens[currentChar.character_id]
      
      if (token?.access_token && Date.now() >= token.expires_at) {
        try {
          await refreshAccessToken()
        } catch (error) {
          console.error('Failed to refresh token on init:', error)
        }
      } else if (token?.refresh_token && !token?.access_token) {
        try {
          await refreshAccessToken()
        } catch (error) {
          console.error('Failed to get new access token on init:', error)
        }
      }
      
      // Load character data
      const currentTokens = (await getTokens())[currentCharacterId.value]
      if (currentTokens?.access_token || currentTokens?.refresh_token) {
        try {
          await updateCharacterData()
          await updateAllCharactersData()
        } catch (error) {
          console.error('Failed to update character data on init:', error)
          
          // Retry once if it's a 401 error
          if (error.response?.status === 401 && currentTokens.refresh_token) {
            try {
              await refreshAccessToken()
              await updateCharacterData()
              await updateAllCharactersData()
            } catch (retryError) {
              console.error('Failed to refresh and load data:', retryError)
            }
          }
        }
      }
      
      // Start periodic updates
      if (isAuthenticated.value) {
        startPeriodicUpdates()
      }
    } finally {
      isInitializing.value = false
    }
  }
  
  // Initialize store
  initializeSync()
  initializeAsync()

  return {
    // State
    characters,
    currentCharacterId,
    characterData,
    charactersData,
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
    logout,
    
    // Token methods
    refreshAccessToken,
    refreshCharacterToken,
    setCurrentCharacterTokens,
    clearTokens,
    getValidToken,
    
    // Data methods
    getCharacterData,
    getCharacterDataById,
    setCharacterData,
    setCharacterDataById,
    updateCharacterData,
    updateAllCharactersData,
    updateSpecificCharacterData,
    
    // Lifecycle methods
    initializeAsync,
    startPeriodicUpdates,
    stopPeriodicUpdates
  }
})
