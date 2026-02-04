export default (http) => ({
  // Location
  location: (characterId, config = {}) => http.get(`/characters/${characterId}/location/`, config),
  
  // Online status
  online: (characterId, config = {}) => http.get(`/characters/${characterId}/online/`, config),
  
  // Wallet
  wallet: {
    balance: (characterId, config = {}) => http.get(`/characters/${characterId}/wallet/`, config)
  },
  
  // Character sheet
  sheet: (characterId, config = {}) => http.get(`/characters/${characterId}/`, config),
  
  // Universe information
  universe: {
    // Get names for multiple IDs
    names: (ids, config = {}) => http.post('/universe/names/', ids, config),
    
    // Solar system information
    system: (systemId, config = {}) => http.get(`/universe/systems/${systemId}/`, config),
    
    // Constellation information
    constellation: (constellationId, config = {}) => http.get(`/universe/constellations/${constellationId}/`, config),
    
    // Region information
    region: (regionId, config = {}) => http.get(`/universe/regions/${regionId}/`, config),
    
    // Station information
    station: (stationId, config = {}) => http.get(`/universe/stations/${stationId}/`, config)
  }
})
