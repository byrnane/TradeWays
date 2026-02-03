import axios from 'axios'

const ESI_BASE_URL = 'https://login.eveonline.com/v2/oauth/authorize'
const ESI_TOKEN_URL = 'https://login.eveonline.com/v2/oauth/token'
const ESI_VERIFY_URL = 'https://login.eveonline.com/oauth/verify'

export const getAuthUrl = () => {
  const clientId = import.meta.env.VITE_ESI_CLIENT_ID
  const callbackUrl = import.meta.env.VITE_ESI_CALLBACK_URL
  const scopes = import.meta.env.VITE_ESI_SCOPES
  const state = Math.random().toString(36).substring(7)
  
  localStorage.setItem('esi_state', state)
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: callbackUrl,
    scope: scopes,
    state: state
  })
  
  return `${ESI_BASE_URL}?${params.toString()}`
}

export const exchangeCodeForTokens = async (code) => {
  const response = await axios.post(`${ESI_TOKEN_URL}`, 
    `grant_type=authorization_code&code=${code}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${import.meta.env.VITE_ESI_CLIENT_ID}:${import.meta.env.VITE_ESI_CLIENT_SECRET}`)}`
      }
    }
  )
  return response.data
}

export const verifyToken = async (accessToken) => {
  const response = await axios.get(ESI_VERIFY_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  return response.data
}

export const refreshAccessToken = async (refreshToken) => {
  const response = await axios.post(`${ESI_TOKEN_URL}`,
    `grant_type=refresh_token&refresh_token=${refreshToken}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${import.meta.env.VITE_ESI_CLIENT_ID}:${import.meta.env.VITE_ESI_CLIENT_SECRET}`)}`
      }
    }
  )
  return response.data
}

// ESI API functions for character data
export const esiCharacterWallet = async (characterId, accessToken) => {
  const response = await axios.get(`https://esi.evetech.net/latest/characters/${characterId}/wallet/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': `EVE Horizon - TradeWays (contact: ${import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com'})`
    }
  })
  return response.data
}

export const esiCharacterLocation = async (characterId, accessToken) => {
  const response = await axios.get(`https://esi.evetech.net/latest/characters/${characterId}/location/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': `EVE Horizon - TradeWays (contact: ${import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com'})`
    }
  })
  return response.data
}

export const esiCharacterOnline = async (characterId, accessToken) => {
  const response = await axios.get(`https://esi.evetech.net/latest/characters/${characterId}/online/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': `EVE Horizon - TradeWays (contact: ${import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com'})`
    }
  })
  return response.data
}

export const esiUniverseNames = async (ids, accessToken) => {
  const response = await axios.post(`https://esi.evetech.net/latest/universe/names/`, ids, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': `EVE Horizon - TradeWays (contact: ${import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com'})`
    }
  })
  return response.data
}

export const esiUniverseSystem = async (systemId, accessToken) => {
  const response = await axios.get(`https://esi.evetech.net/latest/universe/systems/${systemId}/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': `EVE Horizon - TradeWays (contact: ${import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com'})`
    }
  })
  return response.data
}

export const esiUniverseConstellation = async (constellationId, accessToken) => {
  const response = await axios.get(`https://esi.evetech.net/latest/universe/constellations/${constellationId}/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': `EVE Horizon - TradeWays (contact: ${import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com'})`
    }
  })
  return response.data
}
