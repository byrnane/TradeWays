/**
 * Normalizes character data from various sources to ensure consistent structure
 */
export function normalizeCharacterData(character) {
  if (!character) return null
  
  return {
    ...character,
    
    // Normalize location data
    location: character.location || {},
    locationName: character.locationName || character.location?.solar_system_name || '',
    systemName: character.system_name || character.location?.solar_system_name || '',
    regionName: character.regionName || character.location?.region_name || '',
    constellationName: character.constellationName || character.location?.constellation_name || '',
    stationName: character.stationName || character.location?.station_name || character.location?.structure_name || '',
    structureName: character.structureName || character.location?.structure_name || '',
    
    // Normalize security status
    systemSecurityStatus: character.system_security_status || 
                         character.location?.system_security_status || 
                         null,
    
    // Normalize IDs
    systemId: character.system_id || character.location?.solar_system_id || null,
    characterId: character.characterId || character.character_id || character.id || null,
    stationId: character.stationId || character.location?.station_id || null,
    structureId: character.structureId || character.location?.structure_id || null
  }
}

/**
 * Extracts the primary system name from character data
 */
export function getSystemName(character) {
  if (!character) return ''
  
  const normalized = normalizeCharacterData(character)
  return normalized.systemName || normalized.locationName || ''
}

/**
 * Checks if a system is a special space type (wormhole, abyssal, pochven)
 */
export function getSpecialSpaceType(character) {
  if (!character) return null
  
  const normalized = normalizeCharacterData(character)
  const systemName = normalized.systemName.toLowerCase()
  const systemId = normalized.systemId
  
  // Check by system ID ranges
  if (systemId >= 31000000 && systemId < 32000000) return 'wormhole'
  if (systemId >= 20000000 && systemId < 21000000) return 'pochven'
  
  // Check by keywords
  if (systemName.includes('wormhole')) return 'wormhole'
  if (systemName.includes('abyssal')) return 'abyssal'
  if (systemName.includes('pochven')) return 'pochven'
  
  return null
}
