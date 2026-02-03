import axios from 'axios'

export const createInterceptors = (axios) => {
  // Request interceptor - add auth token
  const requestSuccess = (config) => {
    // Get tokens from sessionStorage
    const tokensData = sessionStorage.getItem('esi_session_tokens')
    
    if (tokensData) {
      try {
        const allTokens = JSON.parse(tokensData)
        // Get current character ID from localStorage
        const currentCharacterId = localStorage.getItem('esi_current_character_id')
        
        if (currentCharacterId && allTokens[currentCharacterId]) {
          const tokens = allTokens[currentCharacterId]
          if (tokens.access_token) {
            config.headers.Authorization = `Bearer ${tokens.access_token}`
          }
        }
      } catch (e) {
        console.error('Failed to parse tokens:', e)
      }
    }
    // Add user agent for ESI
    config.headers['User-Agent'] = `EVE Horizon - TradeWays (contact@example.com)`
    
    return config
  }

  const requestError = (error) => {
    return Promise.reject(error)
  }

  const responseSuccess = (response) => {
    return response
  }

  const responseError = async (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Get current character ID
      const currentCharacterId = localStorage.getItem('esi_current_character_id')
      const tokensData = sessionStorage.getItem('esi_session_tokens')
      
      if (currentCharacterId && tokensData && !error.config._retry) {
        try {
          const allTokens = JSON.parse(tokensData)
          const charTokens = allTokens[currentCharacterId]
          
          if (charTokens && charTokens.refresh_token) {
            error.config._retry = true
            // Import refresh function to avoid circular dependency
            const { refreshAccessToken } = await import('../services/esi.js')
            const newTokens = await refreshAccessToken(charTokens.refresh_token)
            
            // Update tokens for current character
            allTokens[currentCharacterId] = {
              access_token: newTokens.access_token,
              refresh_token: newTokens.refresh_token,
              expires_at: Date.now() + (newTokens.expires_in * 1000)
            }
            
            sessionStorage.setItem('esi_session_tokens', JSON.stringify(allTokens))
            
            // Retry the original request with new token
            error.config.headers.Authorization = `Bearer ${newTokens.access_token}`
            return axios.request(error.config)
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
        }
      }
      
      // Clear all auth data on failed refresh
      sessionStorage.clear()
      localStorage.removeItem('esi_characters')
      localStorage.removeItem('esi_current_character_id')
      localStorage.removeItem('esi_character_data')
      localStorage.removeItem('esi_last_update')
      
      // Reload page to trigger re-auth
      window.location.reload()
    }

    // Handle ESI rate limiting (error limited)
    if (error.response?.status === 420) {
      const retryAfter = error.response.headers['x-esi-error-limit-reset'] || 60
      console.warn(`ESI rate limit hit, retrying after ${retryAfter} seconds`)
      // TODO: Implement queue for retrying requests
    }

    // Handle ESI errors
    if (error.response?.data?.error) {
      console.error('ESI Error:', error.response.data.error)
    }

    return Promise.reject(error)
  }

  return {
    requestSuccess,
    requestError,
    responseSuccess,
    responseError
  }
}
