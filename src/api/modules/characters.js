export default (http) => ({
  // Location
  location: (characterId, config = {}) => http.get(`/characters/${characterId}/location/`, config),
  
  // Online status
  online: (characterId, config = {}) => http.get(`/characters/${characterId}/online/`, config),
  
  // Wallet
  wallet: {
    balance: (characterId, config = {}) => http.get(`/characters/${characterId}/wallet/`, config)
  }
})
