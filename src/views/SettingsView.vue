<template>
  <div class="space-y-6">
    <div class="grid gap-6">
      <!-- Theme Settings -->
      <div class="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-3 bg-neutral-800 rounded-lg">
            <Cog6ToothIcon class="h-6 w-6 text-accent" />
          </div>
          <h2 class="text-xl font-semibold text-neutral-100">{{ $t('settings.title') }}</h2>
        </div>
        
        <div class="space-y-6">
          <!-- Language Selection -->
          <div>
            <label class="block text-sm font-medium text-neutral-400 mb-3">{{ $t('settings.language') }}</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                v-for="lang in languages"
                :key="lang.code"
                @click="setLanguage(lang.code)"
                class="px-4 py-2 rounded-lg border transition-colors"
                :class="locale === lang.code 
                  ? 'bg-accent text-accent-dark border-accent' 
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-600'"
              >
                {{ lang.name }}
              </button>
            </div>
          </div>

          <!-- Theme Selection -->
          <div>
            <label class="block text-sm font-medium text-neutral-400 mb-3">{{ $t('settings.theme') }}</label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="themeOption in themes"
                :key="themeOption.value"
                @click="theme = themeOption.value"
                class="px-4 py-2 rounded-lg border transition-colors"
                :class="theme === themeOption.value 
                  ? 'bg-accent text-accent-dark border-accent' 
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-600'"
              >
                {{ themeOption.label }}
              </button>
            </div>
          </div>

          <!-- Data Refresh Interval -->
          <div>
            <label class="block text-sm font-medium text-neutral-400 mb-3">{{ $t('settings.refreshInterval') }}</label>
            <select 
              v-model="dataRefreshInterval"
              class="w-full md:w-64 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:border-accent focus:outline-none"
            >
              <option value="5">5 {{ $t('settings.seconds') }}</option>
              <option value="10">10 {{ $t('settings.seconds') }}</option>
              <option value="30">30 {{ $t('settings.seconds') }}</option>
              <option value="60">1 {{ $t('settings.minute') }}</option>
              <option value="300">5 {{ $t('settings.minutes') }}</option>
            </select>
          </div>
        </div>

        <div class="mt-8 flex justify-end">
          <button
            @click="saveSettings"
            class="px-6 py-3 bg-accent text-accent-dark rounded-lg hover:bg-accent/90 transition-colors font-medium"
          >
            {{ $t('common.save') }}
          </button>
        </div>
      </div>

      <!-- Account Settings -->
      <div v-if="authStore.isAuthenticated" class="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
        <h3 class="text-lg font-semibold text-neutral-100 mb-4">{{ $t('settings.account') }}</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-neutral-300">{{ $t('settings.loggedInAs') }}</span>
            <span class="text-accent font-medium">{{ authStore.character?.name }}</span>
          </div>
          <button
            @click="logout"
            class="w-full md:w-auto px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
          >
            {{ $t('common.logout') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Cog6ToothIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth.js'

const { locale } = useI18n()
const authStore = useAuthStore()
const setPageHeader = inject('setPageHeader')

const languages = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
]

const themes = [
  { value: 'dark', label: 'Тёмная' },
  { value: 'light', label: 'Светлая' },
]

onMounted(() => {
  setPageHeader({
    title: t('settings.title'),
    subtitle: '',
    icon: Cog6ToothIcon
  })
})

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
