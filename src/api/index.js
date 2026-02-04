import axios from 'axios'
import { createInterceptors } from './interceptors.js'
import { createRequests } from './requests.js'

export default {
  install(app, options) {
    // Create axios instance
    const http = axios.create({
      baseURL: options.baseURL || 'https://esi.evetech.net/latest',
      timeout: options.timeout || 30000
    })

    // Add interceptors immediately
    const interceptors = createInterceptors(http)
    http.interceptors.request.use(
      interceptors.requestSuccess,
      interceptors.requestError
    )
    http.interceptors.response.use(
      interceptors.responseSuccess,
      interceptors.responseError
    )

    // Create API requests
    const api = createRequests(http)

    // Make http and api available globally immediately
    app.config.globalProperties.$http = http
    app.config.globalProperties.$api = api
    
    // Also provide for injection
    app.provide('http', http)
    app.provide('api', api)
    
    // Make available globally for services immediately
    window.__app_http__ = http
    window.__app_api__ = api
  }
}
