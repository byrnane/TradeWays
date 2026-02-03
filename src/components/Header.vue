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
            <ChevronDownIcon class="h-4 w-4" :class="{ 'rotate-180': languageDropdownOpen }" />
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
            <ChevronDownIcon class="h-4 w-4" :class="{ 'rotate-180': themeDropdownOpen }" />
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
          <UserIcon class="h-5 w-5" />
          <span class="text-sm font-medium">{{ $t('common.profile') }}</span>
        </router-link>

        <!-- Settings Button -->
        <router-link 
          to="/settings" 
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
        >
          <Cog6ToothIcon class="h-5 w-5" />
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
import { 
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/vue/24/outline'

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
