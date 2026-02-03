export default (http) => ({
  // Location
  location: (characterId, config = {}) => http.get(`/characters/${characterId}/location/`, config),
  
  // Online status
  online: (characterId, config = {}) => http.get(`/characters/${characterId}/online/`, config),
  
  // Wallet
  wallet: {
    balance: (characterId, config = {}) => http.get(`/characters/${characterId}/wallet/`, config)
  },
  
  // Universe information
  universe: {
    solarSystem: (systemId, config = {}) => http.get(`/universe/systems/${systemId}/`, config),
    constellation: (constellationId, config = {}) => http.get(`/universe/constellations/${constellationId}/`, config),
    region: (regionId, config = {}) => http.get(`/universe/regions/${regionId}/`, config),
    station: (stationId, config = {}) => http.get(`/universe/stations/${stationId}/`, config)
  }
})
