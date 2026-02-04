import axios from 'axios'
import { getTokens, setTokens, getCurrentCharacterId, isTokenExpired } from '../utils/tokenUtils.js'

export const createInterceptors = (axios) => {
  // Request interceptor - add auth token
  const requestSuccess = (config) => {
    // Only add auth token if not already present
    if (!config.headers.Authorization) {
      const allTokens = getTokens()
      
      // Try to determine which character's token to use
      let characterId = null
      
      // Check if we can get character ID from the URL
      const urlMatch = config.url?.match(/\/characters\/(\d+)\//)
      if (urlMatch) {
        characterId = parseInt(urlMatch[1])
      } else {
        // For non-character specific requests, use current character
        characterId = getCurrentCharacterId()
      }
      
      if (characterId && allTokens[characterId]) {
        const tokens = allTokens[characterId]
        if (tokens.access_token && !isTokenExpired(tokens)) {
          config.headers.Authorization = `Bearer ${tokens.access_token}`
        }
      }
    }
    
    // Add user agent for ESI
    config.headers['User-Agent'] = `EVE Horizon - TradeWays (contact: ${import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com'})`
    
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
      const allTokens = getTokens()
      
      if (!error.config._retry) {
        try {
          // Try to find which character's token was used
          // First check if we can get character ID from the URL
          let characterId = null
          const urlMatch = error.config.url?.match(/\/characters\/(\d+)\//)
          if (urlMatch) {
            characterId = parseInt(urlMatch[1])
          } else {
            // Fallback to current character
            characterId = getCurrentCharacterId()
          }
          
          if (characterId && allTokens[characterId]) {
            const charTokens = allTokens[characterId]
            
            if (charTokens && charTokens.refresh_token) {
              error.config._retry = true
              // Import refresh function to avoid circular dependency
              const { refreshAccessToken } = await import('../services/esi.js')
              const newTokens = await refreshAccessToken(charTokens.refresh_token)
              
              // Update tokens for this character
              allTokens[characterId] = {
                access_token: newTokens.access_token,
                refresh_token: newTokens.refresh_token || charTokens.refresh_token,
                expires_at: Date.now() + (newTokens.expires_in * 1000)
              }
              
              setTokens(allTokens)
              
              // Retry the original request with new token
              error.config.headers.Authorization = `Bearer ${newTokens.access_token}`
              return axios.request(error.config)
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
        }
      }
      
      // Clear all auth data on failed refresh
      localStorage.removeItem('characters')
      localStorage.removeItem('current_character_id')
      localStorage.removeItem('esi_tokens')
      
      // Clear character data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('character_data_')) {
          localStorage.removeItem(key)
        }
      })
      
      // Reload page to trigger re-auth
      window.location.reload()
    }

    // Handle ESI rate limiting (error limited)
    if (error.response?.status === 420) {
      const retryAfter = error.response.headers['x-esi-error-limit-reset'] || 60
      
      // Limit retry attempts to prevent infinite loops
      const retryCount = error.config._retryCount || 0
      if (retryCount >= 3) {
        console.error('Max retry attempts reached for rate limited request')
        return Promise.reject(error)
      }
      
      error.config._retryCount = retryCount + 1
      
      // Return a promise that retries after the delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(axios.request(error.config))
        }, retryAfter * 1000)
      })
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
