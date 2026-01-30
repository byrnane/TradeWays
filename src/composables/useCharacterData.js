import { onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { loadEssentialCharacterData } from '../services/character.js'

const loadFullCharacterData = async (accessToken, characterId) => {
  try {
    const response = await fetch(`https://esi.evetech.net/latest/characters/${characterId}/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to load character data: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to load full character data:', error)
    throw error
  }
}

export function useCharacterData() {
  const authStore = useAuthStore()

  const loadCharacterData = async () => {
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

    // Always load fresh data (no caching)
    try {
      // Load full character data if missing security status
      if (!authStore.character?.security_status) {
        const fullCharacterData = await loadFullCharacterData(
          authStore.accessToken,
          characterId
        )
        
        // Merge with existing character data
        const mergedCharacterData = {
          ...authStore.character,
          ...fullCharacterData
        }
        
        authStore.setCharacter(mergedCharacterData)
      }
      
      // Load essential data (wallet, location, etc.)
      const essentialData = await loadEssentialCharacterData(
        authStore.accessToken,
        characterId
      )
      
      authStore.setCharacterData(essentialData)
    } catch (error) {
      console.error('Failed to load character data:', error)
    }
  }

  onMounted(() => {
    loadCharacterData()
  })

  return {
    loadCharacterData
  }
}
