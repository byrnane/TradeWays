import { computed } from 'vue'

export function useCharacterLocation(character) {
  const getFullLocation = (char) => {
    if (!char || !char.location) return null
    
    const parts = []
    
    // Add station if character is in one
    if (char.location.station_name) {
      parts.push(char.location.station_name)
      parts.push(char.location.solar_system_name || char.locationName || 'Unknown System')
    } else {
      parts.push(char.location.solar_system_name || char.locationName || 'Unknown System')
    }
    
    // Add constellation and region
    if (char.location.constellation_name || char.constellationName) {
      parts.push(char.location.constellation_name || char.constellationName)
    }
    
    if (char.location.region_name || char.regionName) {
      parts.push(char.location.region_name || char.regionName)
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
    if (character.location && character.location.station_name) {
      return character.location.station_name
    }
    
    // Otherwise show system name
    if (character.locationName) {
      return character.locationName
    }
    
    if (character.location && character.location.solar_system_name) {
      return character.location.solar_system_name
    }
    
    return 'Unknown'
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
