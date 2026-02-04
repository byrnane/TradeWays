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
    console.error('Failed to save tokens to localStorage:', error)
  }
}

export const getTokenForCharacter = (characterId) => {
  const tokens = getTokens()
  return tokens[characterId]
}

export const setTokenForCharacter = async (characterId, tokenData) => {
  // Wait for any ongoing operation
  while (tokenOperationLock) {
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
