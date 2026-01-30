import { onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useUIStore } from '../stores/ui.js'
import { loadEssentialCharacterData, loadFullCharacterData } from '../services/character.js'

export function useCharacterData() {
  const authStore = useAuthStore()
  const uiStore = useUIStore()

  const loadCharacterData = async (forceRefresh = false) => {
    if (!authStore.isAuthenticated || !authStore.character) {
      return
    }

    // Extract character_id from CharacterID field if not present
    let characterId = authStore.character.character_id || authStore.character.CharacterID
    if (!characterId && authStore.character.sub) {
      characterId = parseInt(authStore.character.sub.split(':')[2])
    }

    if (!characterId) {
      console.error('No character_id available')
      return
    }

    try {
      uiStore.startLoading('Загрузка данных персонажа...')
      
      // Get valid token (refresh if needed)
      const token = await authStore.getValidToken()
      
      // Load full character data if missing security status
      if (!authStore.character?.security_status) {
        const fullCharacterData = await loadFullCharacterData(token, characterId)
        
        // Merge with existing character data
        const mergedCharacterData = {
          ...authStore.character,
          ...fullCharacterData
        }
        
        authStore.setCharacter(mergedCharacterData)
      }
      
      // Load essential data (wallet, location, etc.)
      const essentialData = await loadEssentialCharacterData(token, characterId, forceRefresh)
      
      authStore.setCharacterData(essentialData)
      uiStore.updateDataTimestamp()
    } catch (error) {
      console.error('Failed to load character data:', error)
      if (error.message.includes('Token refresh failed')) {
        // Token refresh failed, user needs to re-authenticate
        authStore.logout()
      }
    } finally {
      uiStore.stopLoading()
    }
  }

  onMounted(() => {
    loadCharacterData()
  })

  return {
    loadCharacterData
  }
}
