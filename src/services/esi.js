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
  const clientId = import.meta.env.VITE_ESI_CLIENT_ID
  const clientSecret = import.meta.env.VITE_ESI_CLIENT_SECRET
  const callbackUrl = import.meta.env.VITE_ESI_CALLBACK_URL
  
  const response = await fetch(ESI_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens')
  }
  
  return await response.json()
}

export const verifyToken = async (accessToken) => {
  const response = await fetch(ESI_VERIFY_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to verify token')
  }
  
  return await response.json()
}

export const refreshAccessToken = async (refreshToken) => {
  const clientId = import.meta.env.VITE_ESI_CLIENT_ID
  const clientSecret = import.meta.env.VITE_ESI_CLIENT_SECRET
  
  const response = await fetch(ESI_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }
  
  return await response.json()
}
