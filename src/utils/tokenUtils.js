// Utility functions for token management

// Simple mutex to prevent race conditions
let tokenOperationLock = false

export const getTokens = () => {
  try {
    const tokensData = localStorage.getItem('esi_tokens')
    return tokensData ? JSON.parse(tokensData) : {}
  } catch (error) {
    console.error('Failed to parse tokens from localStorage:', error)
    return {}
  }
}

export const setTokens = (tokens) => {
  try {
    localStorage.setItem('esi_tokens', JSON.stringify(tokens))
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded, attempting to clean up...')
      // Try to clean up old tokens
      try {
        const allTokens = tokens
        const tokenEntries = Object.entries(allTokens)
        
        // Sort by expiration time and keep only the newest half
        tokenEntries.sort((a, b) => (b[1].expires_at || 0) - (a[1].expires_at || 0))
        const keepCount = Math.floor(tokenEntries.length / 2)
        const cleanedTokens = Object.fromEntries(tokenEntries.slice(0, keepCount))
        
        localStorage.setItem('esi_tokens', JSON.stringify(cleanedTokens))
        console.warn(`Cleaned up ${tokenEntries.length - keepCount} old tokens`)
      } catch (cleanupError) {
        console.error('Failed to clean up tokens:', cleanupError)
      }
    } else {
      console.error('Failed to save tokens to localStorage:', error)
    }
  }
}

export const getTokenForCharacter = (characterId) => {
  const tokens = getTokens()
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
  
  // Wait for any ongoing operation with timeout
  const startTime = Date.now()
  const timeout = 5000 // 5 seconds timeout
  
  while (tokenOperationLock) {
    if (Date.now() - startTime > timeout) {
      console.error('Token operation timeout - possible deadlock')
      tokenOperationLock = false // Force unlock
      break
    }
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  
  tokenOperationLock = true
  try {
    const tokens = getTokens()
    tokens[characterId] = tokenData
    setTokens(tokens)
  } finally {
    tokenOperationLock = false
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
