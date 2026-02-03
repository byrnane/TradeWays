import axios from 'axios'
import characters from './modules/characters.js'

export const createRequests = (http, store) => {
  const requests = {
    // Character endpoints
    characters: characters(http)
  }

  // Add utility methods
  requests.getCancelToken = () => axios.CancelToken.source()
  requests.isCancel = axios.isCancel

  return requests
}
