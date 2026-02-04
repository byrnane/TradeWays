// Utility functions for token management

export const getTokens = () => {
  const tokensData = localStorage.getItem('esi_tokens')
  return tokensData ? JSON.parse(tokensData) : {}
}

export const setTokens = (tokens) => {
  localStorage.setItem('esi_tokens', JSON.stringify(tokens))
}

export const getTokenForCharacter = (characterId) => {
  const tokens = getTokens()
  return tokens[characterId]
}

export const setTokenForCharacter = (characterId, tokenData) => {
  const tokens = getTokens()
  tokens[characterId] = tokenData
  setTokens(tokens)
}

export const getCurrentCharacterId = () => {
  const id = localStorage.getItem('current_character_id')
  return id ? parseInt(id) : null
}
