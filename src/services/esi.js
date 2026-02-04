// ESI API service using the API module

// Helper to check if API is available
const ensureApiAvailable = () => {
  if (!window.__app_api__) {
    throw new Error('API instance not available. Make sure the app is mounted.')
  }
}

// Helper to get default headers
const getDefaultHeaders = (accessToken) => ({
  'Authorization': `Bearer ${accessToken}`
})

export const getAuthUrl = () => {
  ensureApiAvailable()
  const clientId = import.meta.env.VITE_ESI_CLIENT_ID
  const callbackUrl = import.meta.env.VITE_ESI_CALLBACK_URL
  const scopes = import.meta.env.VITE_ESI_SCOPES
  const state = Math.random().toString(36).substring(7)
  
  localStorage.setItem('esi_state', state)
  
  // Use global API instance
  return window.__app_api__.auth.getAuthUrl(clientId, callbackUrl, scopes, state)
}

export const exchangeCodeForTokens = async (code) => {
  ensureApiAvailable()
  const clientId = import.meta.env.VITE_ESI_CLIENT_ID
  const clientSecret = import.meta.env.VITE_ESI_CLIENT_SECRET
  
  const response = await window.__app_api__.auth.exchangeCodeForTokens(code, clientId, clientSecret)
  return response.data
}

export const verifyToken = async (accessToken) => {
  ensureApiAvailable()
  const response = await window.__app_api__.auth.verifyToken(accessToken)
  return response.data
}

export const refreshAccessToken = async (refreshToken) => {
  ensureApiAvailable()
  const clientId = import.meta.env.VITE_ESI_CLIENT_ID
  const clientSecret = import.meta.env.VITE_ESI_CLIENT_SECRET
  
  const response = await window.__app_api__.auth.refreshAccessToken(refreshToken, clientId, clientSecret)
  
  // Validate response structure
  if (!response.data || !response.data.access_token) {
    throw new Error('Invalid token refresh response: missing access_token')
  }
  
  if (!response.data.expires_in || typeof response.data.expires_in !== 'number') {
    throw new Error('Invalid token refresh response: invalid expires_in')
  }
  
  return response.data
}

// ESI API functions for character data
export const esiCharacterWallet = async (characterId, accessToken) => {
  const response = await window.__app_api__.characters.wallet.balance(characterId, {
    headers: getDefaultHeaders(accessToken)
  })
  return response.data
}

export const esiCharacterLocation = async (characterId, accessToken) => {
  const response = await window.__app_api__.characters.location(characterId, {
    headers: getDefaultHeaders(accessToken)
  })
  return response.data
}

export const esiCharacterOnline = async (characterId, accessToken) => {
  const response = await window.__app_api__.characters.online(characterId, {
    headers: getDefaultHeaders(accessToken)
  })
  return response.data
}

export const esiCharacterSheet = async (characterId, accessToken) => {
  const response = await window.__app_api__.characters.sheet(characterId, {
    headers: getDefaultHeaders(accessToken)
  })
  return response.data
}

export const esiUniverseNames = async (ids, accessToken) => {
  const response = await window.__app_api__.universe.names(ids, {
    headers: getDefaultHeaders(accessToken)
  })
  return response.data
}

export const esiUniverseSystem = async (systemId, accessToken) => {
  const response = await window.__app_api__.universe.system(systemId, {
    headers: getDefaultHeaders(accessToken)
  })
  return response.data
}

export const esiUniverseConstellation = async (constellationId, accessToken) => {
  const response = await window.__app_api__.universe.constellation(constellationId, {
    headers: getDefaultHeaders(accessToken)
  })
  return response.data
}
