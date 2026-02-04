import axios from 'axios'
import characters from './modules/characters.js'
import auth from './modules/auth.js'

export const createRequests = (http) => {
  const requests = {
    // Authentication endpoints
    auth: auth(http),
    
    // Character endpoints
    characters: characters(http)
  }

  // Add universe endpoints from characters module for convenience
  requests.universe = requests.characters.universe

  // Add utility methods
  requests.getCancelToken = () => axios.CancelToken.source()
  requests.isCancel = axios.isCancel

  return requests
}
