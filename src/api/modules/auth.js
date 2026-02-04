export default (http) => ({
  // OAuth URLs
  getAuthUrl: (clientId, callbackUrl, scopes, state) => {
    const ESI_BASE_URL = 'https://login.eveonline.com/v2/oauth/authorize'
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: scopes,
      state: state
    })
    
    return `${ESI_BASE_URL}?${params.toString()}`
  },
  
  // Token operations
  exchangeCodeForTokens: (code, clientId, clientSecret) => {
    const ESI_TOKEN_URL = 'https://login.eveonline.com/v2/oauth/token'
    
    return http.post(`${ESI_TOKEN_URL}`,
      `grant_type=authorization_code&code=${code}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        }
      }
    )
  },
  
  verifyToken: (accessToken) => {
    const ESI_VERIFY_URL = 'https://login.eveonline.com/oauth/verify'
    
    return http.get(`${ESI_VERIFY_URL}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  },
  
  refreshAccessToken: (refreshToken, clientId, clientSecret) => {
    const ESI_TOKEN_URL = 'https://login.eveonline.com/v2/oauth/token'
    
    return http.post(`${ESI_TOKEN_URL}`,
      `grant_type=refresh_token&refresh_token=${refreshToken}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        }
      }
    )
  }
})
