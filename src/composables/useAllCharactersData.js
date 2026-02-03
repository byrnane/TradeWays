import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { esiCharacterWallet, esiCharacterLocation, esiCharacterOnline, esiCharacterSheet, esiUniverseNames, esiUniverseSystem, esiUniverseConstellation } from '../services/esi.js'

// Shared state for singleton pattern
const isRefreshing = ref({})
const lastUpdate = ref({})
const timers = ref({})
const allCharactersData = ref({})
let updateInterval = null

export function useAllCharactersData() {
  
  // Get auth store lazily to avoid circular dependency
  const getAuthStore = () => {
    return useAuthStore()
  }
  
  // Get character data from storage or return empty object
  const getCharacterData = (characterId) => {
    // First check memory
    if (allCharactersData.value[characterId]) {
      return allCharactersData.value[characterId]
    }
    
    // Then check localStorage
    const dataKey = `character_data_${characterId}`
    const stored = localStorage.getItem(dataKey)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        // Add lastUpdated if it doesn't exist (for old data)
        if (!data.lastUpdated) {
          data.lastUpdated = Date.now()
        }
        allCharactersData.value[characterId] = data
        return data
      } catch (e) {
        console.error('Failed to parse character data:', e)
        return {}
      }
    }
    // If it's the current character, return from store
    const authStore = getAuthStore()
    if (characterId === authStore.currentCharacterId) {
      return authStore.characterData || {}
    }
    return {}
  }
  
  // Save character data to storage
  const saveCharacterData = (characterId, data) => {
    try {
      const dataKey = `character_data_${characterId}`
      localStorage.setItem(dataKey, JSON.stringify(data))
      lastUpdate.value[characterId] = Date.now()
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded, cleaning old data...')
        // Clean oldest character data
        const sortedIds = Object.keys(lastUpdate.value).sort((a, b) => 
          lastUpdate.value[a] - lastUpdate.value[b]
        )
        if (sortedIds.length > 0) {
          const oldestId = sortedIds[0]
          localStorage.removeItem(`character_data_${oldestId}`)
          delete lastUpdate.value[oldestId]
          delete allCharactersData.value[oldestId]
          // Retry saving
          try {
            const dataKey = `character_data_${characterId}`
            localStorage.setItem(dataKey, JSON.stringify(data))
            lastUpdate.value[characterId] = Date.now()
          } catch (retryError) {
            console.error('Failed to save data even after cleanup:', retryError)
          }
        }
      } else {
        console.error('Failed to save character data:', error)
      }
    }
  }
  
  // Update character data using their token
  const updateCharacterData = async (characterId, charactersList = null) => {
    if (!characterId) return
    
    isRefreshing.value[characterId] = true
    
    try {
      // Get auth store lazily
      const authStore = getAuthStore()
      
      // Use provided characters list or get from store
      const characters = charactersList || authStore.characters || []
      
      // Get character from store
      const character = characters.find(c => c.character_id === characterId)
      if (!character) {
        console.error('Character not found:', characterId)
        return
      }
      
      // Get token from localStorage
      const tokensData = localStorage.getItem('esi_tokens')
      if (!tokensData) {
        console.error('No tokens found in localStorage')
        return
      }
      
      const tokens = JSON.parse(tokensData)
      let token = tokens[characterId]
      
      if (!token) {
        console.error('No token found for character:', characterId)
        return
      }
      
      // Validate token before using
      const validateToken = (token) => {
        return token &&
               typeof token.access_token === 'string' &&
               token.access_token.length > 0 &&
               typeof token.refresh_token === 'string' &&
               token.refresh_token.length > 0
      }
      
      if (!validateToken(token)) {
        console.error('Token is invalid for character:', characterId)
        return
      }
      
      // Check if access token is expired
      if (token.expires_at && token.expires_at <= Date.now()) {
        console.log('Access token expired for character:', characterId)
        try {
          await authStore.refreshCharacterToken(characterId)
          // Get updated token
          const updatedTokens = JSON.parse(localStorage.getItem('esi_tokens'))
          const updatedToken = updatedTokens[characterId]
          if (updatedToken) {
            token = updatedToken
          }
        } catch (error) {
          console.error('Failed to refresh token:', error)
          return
        }
      }
      
      // Load existing data
      let existingData = getCharacterData(characterId) || {}
      
      // Fetch all data in parallel
      const [wallet, location, online, characterSheet] = await Promise.all([
        esiCharacterWallet(characterId, token.access_token).catch(e => {
          console.error('Failed to load wallet:', e)
          return existingData.wallet
        }),
        esiCharacterLocation(characterId, token.access_token).catch(e => {
          console.error('Failed to load location:', e)
          return existingData.location
        }),
        esiCharacterOnline(characterId, token.access_token).catch(e => {
          console.error('Failed to load online status:', e)
          return existingData.online
        }),
        // Only fetch character sheet if we don't have security status or it's old (24 hours)
        (!existingData.security_status || !existingData.securityUpdated || Date.now() - existingData.securityUpdated > 86400000)
          ? esiCharacterSheet(characterId, token.access_token).catch(e => {
              console.error('Failed to load character sheet:', e)
              return null
            })
          : Promise.resolve(null)
      ])
      
      // Update data
      const updatedData = {
        ...existingData,
        wallet: wallet,
        location: location,
        online: typeof online === 'boolean' ? online : (online === 'true' || online === true), // Ensure boolean
        locationName: null, // Will be filled below
        lastUpdated: Date.now() // Add timestamp of last update
      }
      
      // Update security status if we got new data
      if (characterSheet) {
        updatedData.security_status = characterSheet.security_status
        updatedData.securityUpdated = Date.now()
      }
      
      // Get location name if we have location data
      if (updatedData.location && updatedData.location.solar_system_id) {
        try {
          // Get system information which includes constellation
          const systemInfo = await esiUniverseSystem(updatedData.location.solar_system_id, token.access_token)
          
          // Save system security status
          if (systemInfo.security_status !== undefined) {
            updatedData.system_security_status = systemInfo.security_status
            updatedData.location.system_security_status = systemInfo.security_status
          }
          
          // Get constellation information to find region
          const constellationInfo = await esiUniverseConstellation(systemInfo.constellation_id, token.access_token)
          
          // Collect unique IDs
          const idsToFetch = [updatedData.location.solar_system_id]
          if (systemInfo.constellation_id && !idsToFetch.includes(systemInfo.constellation_id)) {
            idsToFetch.push(systemInfo.constellation_id)
          }
          if (constellationInfo.region_id && !idsToFetch.includes(constellationInfo.region_id)) {
            idsToFetch.push(constellationInfo.region_id)
          }
          
          // Get names for all IDs
          const namesResponse = await esiUniverseNames(idsToFetch, token.access_token)
          
          if (namesResponse && namesResponse.length > 0) {
            namesResponse.forEach(item => {
              if (item.id === updatedData.location.solar_system_id) {
                updatedData.locationName = item.name
                updatedData.location.solar_system_name = item.name
              } else if (item.id === systemInfo.constellation_id) {
                updatedData.constellationName = item.name
                updatedData.location.constellation_name = item.name
              } else if (item.id === constellationInfo.region_id) {
                updatedData.regionName = item.name
                updatedData.location.region_name = item.name
              }
            })
          }
          
          // Get station name if in station
          if (updatedData.location.station_id) {
            const stationNames = await esiUniverseNames([updatedData.location.station_id], token.access_token)
            if (stationNames && stationNames.length > 0) {
              updatedData.location.station_name = stationNames[0].name
            }
          }
        } catch (error) {
          console.error('Failed to get location names:', error)
        }
      }
      
      // Save to state and localStorage
      allCharactersData.value[characterId] = updatedData
      saveCharacterData(characterId, updatedData)
      
      // Update auth store if it's current character
      if (characterId === authStore.currentCharacterId) {
        authStore.setCharacterData(updatedData)
      }
      
      return updatedData
    } catch (error) {
      console.error(`Failed to update data for character ${characterId}:`, error)
      
      // Get auth store lazily for error handling
      const authStore = getAuthStore()
      
      // If authentication failed permanently, remove the character
      if (error.response?.status === 401) {
        console.error('Authentication failed for character:', characterId)
        if (error.response?.data?.error === 'invalid_grant' || 
            error.response?.data?.error_description?.includes('invalid')) {
          console.log('Token is invalid, removing character')
          authStore.removeCharacterAuthFailed(characterId)
          return
        }
      }
      
      // Keep existing data on other errors
      const existingDataToKeep = getCharacterData(characterId) || {}
    } finally {
      isRefreshing.value[characterId] = false
    }
  }
  
  // Update data for all characters
  const updateAllCharactersData = async (charactersList = null) => {
    const authStore = getAuthStore()
    const characters = charactersList || authStore.characters || []
    
    if (characters.length === 0) {
      return
    }
    
    const promises = characters.map(char => 
      updateCharacterData(char.character_id, characters).catch(error => {
        console.error(`Failed to update ${char.name}:`, error)
      })
    )
    
    await Promise.allSettled(promises)
  }
  
  // Start periodic updates for all characters
  const startPeriodicUpdates = () => {
    // Clear existing interval
    if (updateInterval) {
      clearInterval(updateInterval)
    }
    
    const interval = getRefreshInterval()
    
    updateInterval = setInterval(async () => {
      // Check if we have characters
      const authStore = getAuthStore()
      if (authStore.characters && authStore.characters.length > 0) {
        console.log('Updating data for all characters...')
        await updateAllCharactersData()
      }
    }, interval)
  }
  
  // Stop periodic updates
  const stopPeriodicUpdates = () => {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
    Object.values(timers.value).forEach(timer => {
      clearInterval(timer)
    })
    timers.value = {}
  }
  
  // Get time since last update
  const getTimeSinceUpdate = (characterId) => {
    const last = lastUpdate.value[characterId]
    if (!last) return null
    
    const diff = Date.now() - last
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    
    if (minutes > 0) {
      return `${minutes}m ago`
    }
    return `${seconds}s ago`
  }
  
  // Initialize - load all saved data
  const initialize = () => {
    const authStore = getAuthStore()
    if (authStore.characters && authStore.characters.length > 0) {
      authStore.characters.forEach(char => {
        const savedData = getCharacterData(char.character_id)
        if (savedData) {
          allCharactersData.value[char.character_id] = savedData
        }
      })
    }
  }
  
  // Get refresh interval from settings
  const getRefreshInterval = () => {
    try {
      const settings = JSON.parse(localStorage.getItem('app_settings') || '{}')
      return (settings.dataRefreshInterval || 10) * 60 * 1000 // Default 10 minutes
    } catch (error) {
      console.error('Failed to load refresh interval:', error)
      return 10 * 60 * 1000 // Default 10 minutes
    }
  }
  
  return {
    // State
    allCharactersData: computed(() => allCharactersData.value),
    isRefreshing: computed(() => isRefreshing.value),
    lastUpdate: computed(() => lastUpdate.value),
    timers: computed(() => timers.value),
    
    // Methods
    getCharacterData,
    updateCharacterData,
    updateAllCharactersData,
    startPeriodicUpdates,
    stopPeriodicUpdates,
    getTimeSinceUpdate,
    initialize
  }
}
