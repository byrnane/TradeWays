<template>
  <div class="min-h-screen bg-neutral-950 pt-20">
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

        <!-- Auto Refresh Settings -->
        <div class="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
          <h2 class="text-xl font-semibold text-neutral-100 mb-4">{{ $t('settings.autoRefresh') }}</h2>
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              v-model="autoRefresh"
              class="w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-accent focus:ring-accent focus:ring-offset-0"
            />
            <span class="text-neutral-300">{{ $t('settings.autoRefresh') }}</span>
          </label>
          
          <div v-if="autoRefresh" class="mt-4">
            <label class="block text-sm text-neutral-400 mb-2">
              {{ $t('settings.refreshInterval') }}
            </label>
            <input
              type="number"
              v-model="refreshInterval"
              min="5"
              max="300"
              class="w-32 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent"
            />
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

const { locale } = useI18n()

const theme = ref('dark')
const autoRefresh = ref(false)
const refreshInterval = ref(30)

const setLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
}

const setTheme = (newTheme) => {
  theme.value = newTheme
  if (newTheme === 'light') {
    document.documentElement.classList.remove('dark')
  } else {
    document.documentElement.classList.add('dark')
  }
  localStorage.setItem('theme', newTheme)
}

const saveSettings = () => {
  localStorage.setItem('autoRefresh', autoRefresh.value)
  localStorage.setItem('refreshInterval', refreshInterval.value)
  // Show success message (you can add a toast notification here)
  console.log('Settings saved')
}

onMounted(() => {
  // Load saved settings
  const savedTheme = localStorage.getItem('theme') || 'dark'
  theme.value = savedTheme
  
  const savedAutoRefresh = localStorage.getItem('autoRefresh') === 'true'
  autoRefresh.value = savedAutoRefresh
  
  const savedRefreshInterval = localStorage.getItem('refreshInterval') || '30'
  refreshInterval.value = parseInt(savedRefreshInterval)
})
</script>
