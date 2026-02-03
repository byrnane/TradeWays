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

    // Get pinia instance
    const pinia = app.config.globalProperties.$pinia

    // Add interceptors later when pinia is available
    app.mixin({
      mounted() {
        // Only add interceptors once
        if (!http._interceptorsAdded) {
          const interceptors = createInterceptors(http)
          http.interceptors.request.use(
            interceptors.requestSuccess,
            interceptors.requestError
          )
          http.interceptors.response.use(
            interceptors.responseSuccess,
            interceptors.responseError
          )
          http._interceptorsAdded = true
        }
      }
    })

    // Create API requests
    const api = createRequests(http, pinia)

    // Provide to app
    app.config.globalProperties.$http = http
    app.config.globalProperties.$api = api
    app.provide('http', http)
    app.provide('api', api)
  }
}
