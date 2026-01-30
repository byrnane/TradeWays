import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import './style.css'
import { useUIStore } from './stores/ui.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize UI store
const uiStore = useUIStore(pinia)

// Show initial loading
uiStore.startLoading('Загрузка приложения...')

// Mount app and hide loading
app.mount('#app')

// Hide loading after app is mounted
setTimeout(() => {
  uiStore.stopLoading()
}, 500)
