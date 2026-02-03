import { computed } from 'vue'

export function useCharacterLocation(character) {
  const getFullLocation = (char) => {
    if (!char) return null
    
    const parts = []
    
    // Get system name from multiple sources
    const systemName = char.location?.solar_system_name || 
                      char.locationName || 
                      char.system_name ||
                      'Unknown System'
    
    // Add station if character is in one
    if (char.location?.station_name || char.station_name) {
      parts.push(char.location?.station_name || char.station_name)
      parts.push(systemName)
    } else {
      parts.push(systemName)
    }
    
    // Add constellation and region
    if (char.location?.constellation_name || char.constellationName) {
      parts.push(char.location?.constellation_name || char.constellationName)
    }
    
    if (char.location?.region_name || char.regionName) {
      parts.push(char.location?.region_name || char.regionName)
    }
    
    return parts
  }
  
  const location = computed(() => {
    const parts = getFullLocation(character)
    return parts ? parts.join(' > ') : 'Unknown Location'
  })
  
  const shortLocation = computed(() => {
    if (!character) return 'Unknown'
    
    // Show station if in one
    if (character.location?.station_name || character.station_name) {
      return character.location?.station_name || character.station_name
    }
    
    // Otherwise show system name from multiple sources
    return character.location?.solar_system_name || 
           character.locationName || 
           character.system_name ||
           'Unknown'
  })
  
  const locationParts = computed(() => {
    return getFullLocation(character) || []
  })
  
  return {
    location,
    shortLocation,
    locationParts
  }
}
