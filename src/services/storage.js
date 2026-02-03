// Storage keys
export const STORAGE_KEYS = {
  CHARACTERS: 'esi_characters',
  CURRENT_CHARACTER_ID: 'esi_current_character_id',
  CHARACTER_DATA: 'esi_character_data',
  LAST_UPDATE: 'esi_last_update',
  SETTINGS: 'app_settings'
}

// Save data to localStorage
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error)
  }
}

// Load data from localStorage
export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error)
    return defaultValue
  }
}

// Remove data from localStorage
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Failed to remove ${key} from localStorage:`, error)
  }
}

// Clear all auth-related data
export const clearAuthStorage = () => {
  removeFromStorage(STORAGE_KEYS.CHARACTERS)
  removeFromStorage(STORAGE_KEYS.CURRENT_CHARACTER_ID)
  removeFromStorage(STORAGE_KEYS.CHARACTER_DATA)
  removeFromStorage(STORAGE_KEYS.LAST_UPDATE)
}

// Check if data needs refresh (default 10 minutes)
export const needsRefresh = (lastUpdate, refreshInterval = 10 * 60 * 1000) => {
  if (!lastUpdate) return true
  return Date.now() - lastUpdate > refreshInterval
}

// Get refresh interval from settings
export const getRefreshInterval = () => {
  const settings = loadFromStorage(STORAGE_KEYS.SETTINGS, {})
  return (settings.dataRefreshInterval || 10) * 60 * 1000 // Convert minutes to milliseconds
}
