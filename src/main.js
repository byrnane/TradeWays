import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

// Import API plugin FIRST
import apiPlugin from './api'

// Import styles
import './style.css'
import './themes/light.css'

// Create app instance
const app = createApp(App)

// Create pinia instance
const pinia = createPinia()

// Use pinia FIRST to make it available for API
app.use(pinia)

// Make pinia available globally before API plugin
app.config.globalProperties.$pinia = pinia

// Use API plugin SECOND (now pinia is available)
app.use(apiPlugin, {
  baseURL: 'https://esi.evetech.net/latest',
  timeout: 30000
})

// Use other plugins
app.use(router)
app.use(i18n)

// Initialize UI store
import { useUIStore } from './stores/ui.js'
const uiStore = useUIStore(pinia)

// Show initial loading
uiStore.startLoading('Загрузка приложения...')

// Mount app
app.mount('#app')

// Hide loading after app is mounted
setTimeout(() => {
  uiStore.stopLoading()
}, 500)
