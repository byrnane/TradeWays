// Utility functions for token management

// Simple mutex to prevent race conditions for write operations
let tokenWriteLock = false

// Helper function to wait for write lock release
const waitForWriteLock = async (timeout = 5000) => {
  const startTime = Date.now()
  
  while (tokenWriteLock) {
    if (Date.now() - startTime > timeout) {
      console.error('Token write operation timeout - possible deadlock')
      tokenWriteLock = false
      break
    }
    await new Promise(resolve => setTimeout(resolve, 10))
  }
}

// Centralized token storage - tokens should only be stored in localStorage under 'esi_tokens'
// Character objects in the store should NOT contain tokens

export const getTokens = async () => {
  // Read operations don't need locking for localStorage
  try {
    const tokensData = localStorage.getItem('esi_tokens')
    return tokensData ? JSON.parse(tokensData) : {}
  } catch (error) {
    console.error('Failed to parse tokens from localStorage:', error)
    return {}
  }
}

export const setTokens = async (tokens) => {
  if (!tokens || typeof tokens !== 'object') {
    console.error('Invalid tokens provided to setTokens')
    return
  }
  
  await waitForWriteLock()
  tokenWriteLock = true
  
  try {
    localStorage.setItem('esi_tokens', JSON.stringify(tokens))
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded, attempting to clean up...')
      // Try to clean up old tokens using LRU strategy
      try {
        const allTokens = tokens
        const tokenEntries = Object.entries(allTokens)
        
        if (tokenEntries.length === 0) {
          console.error('No tokens to clean up')
          return
        }
        
        // Sort by expiration time (oldest first) and remove expired tokens
        const now = Date.now()
        const validTokens = tokenEntries.filter(([_, token]) => token.expires_at > now)
        const expiredTokens = tokenEntries.filter(([_, token]) => token.expires_at <= now)
        
        // Remove expired tokens first
        if (expiredTokens.length > 0) {
          console.log(`Removing ${expiredTokens.length} expired tokens`)
          const cleanedTokens = Object.fromEntries(validTokens)
          // Direct localStorage access to avoid recursion
          localStorage.setItem('esi_tokens', JSON.stringify(cleanedTokens))
          return
        }
        
        // If still over quota, remove oldest tokens but keep at least 80% of valid tokens
        const keepCount = Math.max(Math.floor(validTokens.length * 0.8), 1)
        validTokens.sort((a, b) => a[1].expires_at - b[1].expires_at)
        const tokensToKeep = validTokens.slice(-keepCount)
        const cleanedTokens = Object.fromEntries(tokensToKeep)
        
        // Direct localStorage access to avoid recursion
        localStorage.setItem('esi_tokens', JSON.stringify(cleanedTokens))
        console.warn(`Cleaned up ${tokenEntries.length - tokensToKeep.length} old tokens to free space`)
      } catch (cleanupError) {
        console.error('Failed to clean up tokens:', cleanupError)
        // As a last resort, clear all tokens
        try {
          localStorage.removeItem('esi_tokens')
          console.error('Cleared all tokens due to storage quota error')
        } catch (clearError) {
          console.error('Failed to clear tokens:', clearError)
        }
      }
    } else {
      console.error('Failed to save tokens to localStorage:', error)
    }
  } finally {
    tokenWriteLock = false
  }
}

export const getTokenForCharacter = async (characterId) => {
  const tokens = await getTokens()
  return tokens[characterId]
}

export const setTokenForCharacter = async (characterId, tokenData) => {
  // Validate characterId
  if (!characterId || typeof characterId !== 'number' || characterId <= 0) {
    throw new Error('Invalid characterId provided')
  }
  
  // Validate tokenData
  if (!tokenData || typeof tokenData !== 'object') {
    throw new Error('Invalid tokenData provided')
  }
  
  // Validate token structure
  if (!tokenData.access_token || !tokenData.refresh_token || !tokenData.expires_at) {
    throw new Error('Token data is missing required fields')
  }
  
  await waitForWriteLock()
  tokenWriteLock = true
  
  try {
    const tokens = await getTokens()
    tokens[characterId] = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at
    }
    // Direct localStorage access to avoid recursion through setTokens
    localStorage.setItem('esi_tokens', JSON.stringify(tokens))
  } finally {
    tokenWriteLock = false
  }
}

export const getCurrentCharacterId = () => {
  const id = localStorage.getItem('current_character_id')
  return id ? parseInt(id) : null
}

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token || !token.expires_at) return true
  return token.expires_at <= Date.now()
}

// Remove token for a character
export const removeTokenForCharacter = async (characterId) => {
  if (!characterId || typeof characterId !== 'number') {
    console.error('Invalid characterId provided to removeTokenForCharacter')
    return
  }
  
  await waitForWriteLock()
  tokenWriteLock = true
  
  try {
    const tokens = await getTokens()
    delete tokens[characterId]
    // Direct localStorage access to avoid recursion through setTokens
    localStorage.setItem('esi_tokens', JSON.stringify(tokens))
  } finally {
    tokenWriteLock = false
  }
}

// Clear all tokens
export const clearAllTokens = async () => {
  await waitForWriteLock()
  tokenWriteLock = true
  
  try {
    localStorage.removeItem('esi_tokens')
  } catch (error) {
    console.error('Failed to clear tokens:', error)
  } finally {
    tokenWriteLock = false
  }
}
