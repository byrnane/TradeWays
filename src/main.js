import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { useUIStore } from './stores/ui.js'

// Import API plugin
import apiPlugin from './api'

// Import styles
import './style.css'
import './themes/light.css'

const app = createApp(App)
const pinia = createPinia()

// Use plugins
app.use(pinia)
app.use(router)
app.use(i18n)

// Make pinia available globally
app.config.globalProperties.$pinia = pinia

// Use API plugin
const http = axios.create({
  baseURL: 'https://esi.evetech.net/latest',
  timeout: 30000
})

app.use(apiPlugin, {
  baseURL: 'https://esi.evetech.net/latest',
  timeout: 30000
})

// Initialize UI store
const uiStore = useUIStore(pinia)

// Show initial loading
uiStore.startLoading('Загрузка приложения...')

// Mount app
app.mount('#app')

// Make http and api instances globally available for services after mount
window.__app_http__ = app.config.globalProperties.$http
window.__app_api__ = app.config.globalProperties.$api

// Hide loading after app is mounted
setTimeout(() => {
  uiStore.stopLoading()
}, 500)
