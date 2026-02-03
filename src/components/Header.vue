<template>
  <header class="fixed top-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800">
    <div class="flex items-center justify-between px-6 py-4">
      <!-- Mobile Menu Button -->
      <button 
        @click="$emit('toggleSidebar')"
        class="lg:hidden p-2 rounded-lg text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <!-- Logo and Title (Desktop) -->
      <div class="hidden lg:flex items-center gap-4">
        <router-link to="/" class="flex items-center gap-3">
          <div class="grid h-10 w-10 place-items-center rounded-lg bg-neutral-800 ring-1 ring-neutral-700 shadow-soft text-neutral-200 font-semibold">
            EH
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-neutral-100">{{ $t('nav.title') }}</h1>
            <p class="text-sm text-neutral-400">{{ $t('nav.subtitle') }}</p>
          </div>
        </router-link>
      </div>

      <!-- Logo (Mobile) -->
      <div class="lg:hidden">
        <router-link to="/" class="flex items-center gap-3">
          <div class="grid h-10 w-10 place-items-center rounded-lg bg-neutral-800 ring-1 ring-neutral-700 shadow-soft text-neutral-200 font-semibold">
            EH
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-neutral-100">EVE Horizon</h1>
          </div>
        </router-link>
      </div>

      <!-- Spacer -->
      <div class="flex items-center gap-3">
        <!-- Language Switcher -->
        <div class="relative" @click="toggleLanguageDropdown">
          <button 
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <span class="text-lg">{{ currentLocale === 'ru' ? '🇷🇺' : '🇺🇸' }}</span>
            <span class="text-sm font-medium">{{ currentLocale === 'ru' ? 'Русский' : 'English' }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4" :class="{ 'rotate-180': languageDropdownOpen }">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          
          <!-- Dropdown -->
          <div v-if="languageDropdownOpen" class="absolute right-0 top-full mt-2 w-40 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg py-2">
            <button
              @click.stop="setLanguage('ru')"
              class="w-full px-4 py-2 text-left text-sm hover:bg-neutral-700 transition-colors flex items-center gap-2"
              :class="currentLocale === 'ru' ? 'text-accent font-medium' : 'text-neutral-300'"
            >
              <span class="text-lg">🇷🇺</span>
              Русский
            </button>
            <button
              @click.stop="setLanguage('en')"
              class="w-full px-4 py-2 text-left text-sm hover:bg-neutral-700 transition-colors flex items-center gap-2"
              :class="currentLocale === 'en' ? 'text-accent font-medium' : 'text-neutral-300'"
            >
              <span class="text-lg">🇺🇸</span>
              English
            </button>
          </div>
        </div>

        <!-- Theme Switcher -->
        <div class="relative" @click="toggleThemeDropdown">
          <button 
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <span class="text-lg">{{ themeIcon }}</span>
            <span class="text-sm font-medium">{{ themeText }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4" :class="{ 'rotate-180': themeDropdownOpen }">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          
          <!-- Dropdown -->
          <div v-if="themeDropdownOpen" class="absolute right-0 top-full mt-2 w-40 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg py-2">
            <button
              @click.stop="setTheme('light')"
              class="w-full px-4 py-2 text-left text-sm hover:bg-neutral-700 transition-colors flex items-center gap-2"
              :class="currentTheme === 'light' ? 'text-accent font-medium' : 'text-neutral-300'"
            >
              <span class="text-lg">☀️</span>
              {{ $t('settings.themeLight') }}
            </button>
            <button
              @click.stop="setTheme('dark')"
              class="w-full px-4 py-2 text-left text-sm hover:bg-neutral-700 transition-colors flex items-center gap-2"
              :class="currentTheme === 'dark' ? 'text-accent font-medium' : 'text-neutral-300'"
            >
              <span class="text-lg">🌙</span>
              {{ $t('settings.themeDark') }}
            </button>
            <button
              @click.stop="setTheme('system')"
              class="w-full px-4 py-2 text-left text-sm hover:bg-neutral-700 transition-colors flex items-center gap-2"
              :class="currentTheme === 'system' ? 'text-accent font-medium' : 'text-neutral-300'"
            >
              <span class="text-lg">💻</span>
              {{ $t('settings.themeSystem') }}
            </button>
          </div>
        </div>

        <!-- Profiles Button (if logged in) -->
        <router-link 
          v-if="authStore.isAuthenticated"
          to="/profiles" 
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <span class="text-sm font-medium">{{ $t('common.profile') }}</span>
        </router-link>

        <!-- Settings Button -->
        <router-link 
          to="/settings" 
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.094c.55 0 1.02.398 1.11.94l.149.894c.07.424.364.764.765.936.4.172.86.143 1.231-.078l.765-.446c.459-.268 1.045-.213 1.447.136l.774.635c.402.349.47.917.16 1.341l-.527.698c-.247.327-.292.766-.117 1.134.175.368.537.618.947.664l.836.099c.543.064.94.56.94 1.109v1.094c0 .55-.397 1.045-.94 1.109l-.836.099c-.41.046-.772.296-.947.664-.175.368-.13.807.117 1.134l.527.698c.31.424.242.992-.16 1.341l-.774.635c-.402.349-.988.404-1.447.136l-.765-.446c-.371-.221-.831-.25-1.231-.078-.401.172-.695.512-.765.936l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.02-.398-1.11-.94l-.149-.894c-.07-.424-.364-.764-.765-.936-.4-.172-.86-.143-1.231.078l-.765.446c-.459.268-1.045.213-1.447-.136l-.774-.635c-.402-.349-.47-.917-.16-1.341l.527-.698c.247-.327.292-.766.117-1.134-.175-.368-.537-.618-.947-.664l-.836-.099c-.543-.064-.94-.56-.94-1.109v-1.094c0-.55.397-1.045.94-1.109l.836-.099c.41-.046.772-.296.947-.664.175-.368.13-.807-.117-1.134l-.527-.698c-.31-.424-.242-.992.16-1.341l.774-.635c.402-.349.988-.404 1.447-.136l.765.446c.371.221.831.25 1.231.078.401-.172.695-.512.765-.936l.149-.894Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <span class="text-sm font-medium">{{ $t('common.settings') }}</span>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth.js'
import { useSettingsStore } from '../stores/settings.js'

const emit = defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const languageDropdownOpen = ref(false)
const themeDropdownOpen = ref(false)

const currentLocale = computed(() => locale.value)
const currentTheme = computed(() => settingsStore.theme)

const themeIcon = computed(() => {
  if (currentTheme.value === 'light') return '☀️'
  if (currentTheme.value === 'dark') return '🌙'
  return '💻'
})

const themeText = computed(() => {
  if (currentTheme.value === 'light') return t('settings.themeLight')
  if (currentTheme.value === 'dark') return t('settings.themeDark')
  return t('settings.themeSystem')
})

const toggleLanguageDropdown = () => {
  languageDropdownOpen.value = !languageDropdownOpen.value
  themeDropdownOpen.value = false
}

const toggleThemeDropdown = () => {
  themeDropdownOpen.value = !themeDropdownOpen.value
  languageDropdownOpen.value = false
}

const setLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
  languageDropdownOpen.value = false
}

const setTheme = (theme) => {
  settingsStore.theme = theme
  themeDropdownOpen.value = false
}

const closeDropdowns = (e) => {
  if (!e.target.closest('.relative')) {
    languageDropdownOpen.value = false
    themeDropdownOpen.value = false
  }
}

onMounted(() => {
  // Initialize theme
  const cleanup = settingsStore.initTheme()
  
  document.addEventListener('click', closeDropdowns)
  
  onUnmounted(() => {
    cleanup?.()
    document.removeEventListener('click', closeDropdowns)
  })
})
</script>
