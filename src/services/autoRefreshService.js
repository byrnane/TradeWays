/**
 * Auto-refresh service for character data
 * Handles periodic updates independently of UI components
 */
import { useAuthStore } from '../stores/auth.js'
import { useAllCharactersData } from '../composables/useAllCharactersData.js'

class AutoRefreshService {
  constructor() {
    this.refreshInterval = null
    this.isRunning = false
    this.intervalTime = 10 * 60 * 1000 // 10 minutes default
  }

  /**
   * Start auto-refresh for all characters
   */
  start() {
    if (this.isRunning) return

    const authStore = useAuthStore()
    const allCharactersData = useAllCharactersData()

    // Don't start if no characters
    if (!authStore.isAuthenticated || authStore.characters.length === 0) {
      return
    }

    this.isRunning = true

    // Initial update
    this.updateAllCharacters()

    // Set up interval
    this.refreshInterval = setInterval(() => {
      this.updateAllCharacters()
    }, this.getIntervalTime())
  }

  /**
   * Stop auto-refresh
   */
  stop() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
    this.isRunning = false
  }

  /**
   * Force update all characters
   */
  async updateAllCharacters() {
    try {
      const authStore = useAuthStore()
      const allCharactersData = useAllCharactersData()

      if (authStore.isAuthenticated && authStore.characters.length > 0) {
        await allCharactersData.updateAllCharactersData()
      }
    } catch (error) {
      console.error('Auto-refresh failed:', error)
    }
  }

  /**
   * Update a specific character
   */
  async updateCharacter(characterId) {
    try {
      const allCharactersData = useAllCharactersData()
      await allCharactersData.updateCharacterData(characterId)
    } catch (error) {
      console.error(`Failed to update character ${characterId}:`, error)
    }
  }

  /**
   * Get refresh interval from settings
   */
  getIntervalTime() {
    try {
      const settings = JSON.parse(localStorage.getItem('app_settings') || '{}')
      return (settings.dataRefreshInterval || 10) * 60 * 1000
    } catch (error) {
      console.error('Failed to load refresh interval:', error)
      return 10 * 60 * 1000
    }
  }

  /**
   * Restart service with new interval
   */
  restart() {
    this.stop()
    this.start()
  }

  /**
   * Check if service is running
   */
  isActive() {
    return this.isRunning
  }
}

// Create singleton instance
const autoRefreshService = new AutoRefreshService()

export default autoRefreshService
