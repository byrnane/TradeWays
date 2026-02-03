<template>
  <div class="min-h-screen bg-neutral-950">
    <div class="max-w-4xl mx-auto px-6 py-8">
      <h1 class="text-3xl font-bold text-neutral-100 mb-8">{{ $t('settings.title') }}</h1>
      
      <div class="space-y-6">
        <!-- Language Settings -->
        <div class="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
          <h2 class="text-xl font-semibold text-neutral-100 mb-4">{{ $t('settings.language') }}</h2>
          <div class="flex gap-4">
            <button
              @click="setLanguage('ru')"
              class="px-4 py-2 rounded-lg transition-colors"
              :class="locale === 'ru' 
                ? 'bg-accent text-white' 
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'"
            >
              Русский
            </button>
            <button
              @click="setLanguage('en')"
              class="px-4 py-2 rounded-lg transition-colors"
              :class="locale === 'en' 
                ? 'bg-accent text-white' 
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'"
            >
              English
            </button>
          </div>
        </div>

        <!-- Theme Settings -->
        <div class="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
          <h2 class="text-xl font-semibold text-neutral-100 mb-4">{{ $t('settings.theme') }}</h2>
          <div class="flex gap-4">
            <button
              @click="setTheme('dark')"
              class="px-4 py-2 rounded-lg transition-colors"
              :class="theme === 'dark' 
                ? 'bg-accent text-white' 
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'"
            >
              Тёмная
            </button>
            <button
              @click="setTheme('light')"
              class="px-4 py-2 rounded-lg transition-colors"
              :class="theme === 'light' 
                ? 'bg-accent text-white' 
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'"
            >
              Светлая
            </button>
          </div>
        </div>

        <!-- Data Refresh Settings -->
        <div class="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
          <h2 class="text-xl font-semibold text-neutral-100 mb-4">{{ $t('settings.dataRefresh') }}</h2>
          <p class="text-sm text-neutral-400 mb-4">{{ $t('settings.dataRefreshDescription') }}</p>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-neutral-300 mb-2">
                {{ $t('settings.refreshInterval') }}
              </label>
              <select
                v-model="dataRefreshInterval"
                class="w-32 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option :value="5">5 {{ $t('common.minutes') }}</option>
                <option :value="10">10 {{ $t('common.minutes') }}</option>
                <option :value="15">15 {{ $t('common.minutes') }}</option>
                <option :value="30">30 {{ $t('common.minutes') }}</option>
                <option :value="60">1 {{ $t('common.hour') }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
          <button
            @click="saveSettings"
            class="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
          >
            {{ $t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth.js'

const { locale } = useI18n()
const authStore = useAuthStore()

const theme = ref('dark')
const dataRefreshInterval = ref(10)

const setLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
}

const saveSettings = () => {
  // Save theme
  localStorage.setItem('theme', theme.value)
  document.documentElement.classList.toggle('dark', theme.value === 'dark')
  
  // Save data refresh interval
  const settings = JSON.parse(localStorage.getItem('app_settings') || '{}')
  settings.dataRefreshInterval = dataRefreshInterval.value
  localStorage.setItem('app_settings', JSON.stringify(settings))
  
  // Restart periodic updates with new interval
  if (authStore.isAuthenticated) {
    authStore.stopPeriodicUpdates()
    authStore.startPeriodicUpdates()
  }
}

onMounted(() => {
  // Load saved settings
  theme.value = localStorage.getItem('theme') || 'dark'
  
  const settings = JSON.parse(localStorage.getItem('app_settings') || '{}')
  dataRefreshInterval.value = settings.dataRefreshInterval || 10
})
</script>
