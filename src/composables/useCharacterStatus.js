import { computed } from 'vue'

export function useCharacterStatus(character) {
  const getCharacterStatus = (char) => {
    if (!char) return { text: 'Unknown', color: 'text-gray-500', bgColor: 'bg-gray-100' }
    
    // Check if character is online
    if (char.online !== undefined) {
      // Convert to boolean if it's a string
      const isOnline = typeof char.online === 'string' ? char.online === 'true' : Boolean(char.online)
      
      // Debug logging
      console.log(`Character ${char.name || char.character_id} online status:`, char.online, 'type:', typeof char.online, 'converted:', isOnline)
      
      if (isOnline) {
        return { text: 'Online', color: 'text-green-600', bgColor: 'bg-green-50' }
      } else {
        return { text: 'Offline', color: 'text-red-600', bgColor: 'bg-red-50' }
      }
    }
    
    // Fallback to last login check
    if (char.last_login) {
      const lastLogin = new Date(char.last_login)
      const now = new Date()
      const diffMs = now - lastLogin
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      
      if (diffHours < 1) {
        return { text: 'Recently', color: 'text-green-600', bgColor: 'bg-green-50' }
      } else if (diffHours < 24) {
        return { text: `${diffHours}h ago`, color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
      } else {
        return { text: 'Offline', color: 'text-red-600', bgColor: 'bg-red-50' }
      }
    }
    
    return { text: 'Unknown', color: 'text-gray-500', bgColor: 'bg-gray-100' }
  }
  
  const status = computed(() => getCharacterStatus(character))
  
  return {
    status
  }
}
