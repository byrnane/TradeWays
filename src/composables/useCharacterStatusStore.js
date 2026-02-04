import { ref } from 'vue'

// Глобальное реактивное хранилище статусов персонажей
const characterStatuses = ref({})

export function useCharacterStatusStore() {
  
  const updateStatus = (characterId, isOnline) => {
    characterStatuses.value[characterId] = isOnline
  }
  
  const getStatus = (characterId) => {
    return characterStatuses.value[characterId]
  }
  
  return {
    characterStatuses,
    updateStatus,
    getStatus
  }
}
