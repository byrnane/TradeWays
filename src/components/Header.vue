<template>
  <header class="fixed top-0 left-0 right-0 z-40 h-[73px] bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800">
    <div class="flex items-center justify-between h-full px-6">
      <!-- Left Section -->
      <div class="flex items-center gap-4">
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
      </div>

      <!-- Right Section -->
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

        <!-- Settings Button -->
        <router-link 
          to="/settings" 
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
        >
          <Cog6ToothIcon class="h-5 w-5" />
          <span class="text-sm font-medium">{{ $t('common.settings') }}</span>
        </router-link>
        
        <!-- Player Profile (if logged in) -->
        <div v-if="authStore.isAuthenticated && authStore.character" class="relative" @click="toggleProfileDropdown">
          <button class="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-neutral-800/50 hover:to-neutral-700/50 transition-all duration-200 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 backdrop-blur-sm">
            <img 
              :src="`https://images.evetech.net/characters/${authStore.character.character_id}/portrait?size=128`"
              :alt="authStore.character.name"
              class="h-12 w-12 rounded-full ring-2 ring-accent/20 flex-shrink-0"
              @error="handleImageError"
            />
            <div class="hidden sm:block text-left">
              <div class="flex items-center justify-between gap-2">
                <div class="font-medium text-neutral-100">{{ authStore.character.name }}</div>
                <div class="text-xs font-mono text-neutral-500">
                  <UpdateTimer :initial-time="60" :is-loading="authStore.isRefreshing" :compact="true" />
                </div>
              </div>
              <div class="text-sm text-neutral-400">{{ authStore.character.corporation_name }}</div>
              <div class="flex items-center gap-2 mt-1">
                <CharacterStatus :character="authStore.characterData" />
                <div class="text-xs text-neutral-500">
                  <CharacterLocation :character="authStore.characterData" view-mode="system" />
                </div>
              </div>
            </div>
            <ChevronDownIcon class="h-4 w-4 text-neutral-400" :class="{ 'rotate-180': profileDropdownOpen }" />
          </button>
          
          <!-- Profile Dropdown -->
          <div v-if="profileDropdownOpen" class="absolute right-0 top-full mt-2 w-80 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg py-2">
            <!-- Character List -->
            <div v-if="authStore.characters.length > 0" class="py-2 max-h-60 overflow-y-auto">
              <div v-for="char in authStore.characters" :key="char.character_id">
                <div v-if="char.character_id === authStore.character.character_id" 
                     class="w-full px-4 py-3 text-left text-sm bg-neutral-700/50 flex items-center gap-3 cursor-not-allowed opacity-75">
                  <img 
                    :src="`https://images.evetech.net/characters/${char.character_id}/portrait?size=32&tenant=tranquility`"
                    :alt="char.name"
                    class="h-8 w-8 rounded-full"
                    @error="handleImageError"
                    crossorigin="anonymous"
                    referrerpolicy="no-referrer"
                  />
                  <div class="flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <div class="font-medium text-neutral-100">{{ char.name }}</div>
                      <div class="text-xs font-mono text-neutral-500">
                        <UpdateTimer :last-update="allCharactersData.getCharacterData(char.character_id)?.lastUpdated" :compact="true" />
                      </div>
                    </div>
                    <div class="text-xs text-neutral-400">{{ char.corporation_name }}</div>
                    <div class="flex items-center gap-3 mt-1">
                      <CharacterStatus :character="getCharacterData(char.character_id)" />
                      <div class="text-xs text-neutral-500">
                        <CharacterLocation :character="getCharacterData(char.character_id)" view-mode="system" />
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  v-else
                  @click.stop="switchCharacter(char)"
                  class="w-full px-4 py-3 text-left text-sm hover:bg-neutral-700 flex items-center gap-3"
                >
                  <img 
                    :src="`https://images.evetech.net/characters/${char.character_id}/portrait?size=32&tenant=tranquility`"
                    :alt="char.name"
                    class="h-8 w-8 rounded-full"
                    @error="handleImageError"
                    crossorigin="anonymous"
                    referrerpolicy="no-referrer"
                  />
                  <div class="flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <div class="font-medium text-neutral-100">{{ char.name }}</div>
                      <div class="text-xs font-mono text-neutral-500">
                        <UpdateTimer :last-update="allCharactersData.getCharacterData(char.character_id)?.lastUpdated" :compact="true" />
                      </div>
                    </div>
                    <div class="text-xs text-neutral-400">{{ char.corporation_name }}</div>
                    <div class="flex items-center gap-3 mt-1">
                      <CharacterStatus :character="getCharacterData(char.character_id)" />
                      <div class="text-xs text-neutral-500">
                        <CharacterLocation :character="getCharacterData(char.character_id)" view-mode="system" />
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            <!-- Divider -->
            <div class="border-t border-neutral-700"></div>
            
            <!-- All Characters Button -->
            <div class="py-2">
              <router-link 
                to="/profiles"
                @click.stop="profileDropdownOpen = false"
                class="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 transition-colors"
              >
                {{ $t('profile.allCharacters') }}
              </router-link>
            </div>
            
            <!-- Add Profile Section -->
            <div class="py-2">
              <button
                @click.stop="addNewProfile"
                class="w-full px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 transition-colors flex items-center gap-2"
              >
                <PlusIcon class="h-4 w-4" />
                {{ $t('profile.addCharacter') }}
              </button>
            </div>
            
            <!-- Divider -->
            <div class="border-t border-neutral-700"></div>
            
            <!-- Logout -->
            <div class="py-2">
              <button
                @click.stop="logout"
                class="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors flex items-center gap-2"
              >
                <ArrowRightOnRectangleIcon class="h-4 w-4" />
                {{ $t('common.logout') }}
              </button>
            </div>
          </div>
        </div>
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
  ComputerDesktopIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'
import CharacterStatus from './CharacterStatus.vue'
import CharacterLocation from './CharacterLocation.vue'
import UpdateTimer from './UpdateTimer.vue'
import { useAllCharactersData } from '../composables/useAllCharactersData.js'

const emit = defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const allCharactersData = useAllCharactersData()

const languageDropdownOpen = ref(false)
const themeDropdownOpen = ref(false)
const profileDropdownOpen = ref(false)

const currentLocale = computed(() => locale.value)
const currentTheme = computed(() => settingsStore.theme)

const getCharacterData = (characterId) => {
  // Always check localStorage first for immediate data
  const dataKey = `character_data_${characterId}`
  const stored = localStorage.getItem(dataKey)
  let data = null
  
  if (stored) {
    try {
      data = JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse character data:', e)
    }
  }
  
  // If not in localStorage, try allCharactersData
  if (!data) {
    data = allCharactersData.getCharacterData(characterId)
  }
  
  return data || {}
}

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
  profileDropdownOpen.value = false
}

const toggleThemeDropdown = () => {
  themeDropdownOpen.value = !themeDropdownOpen.value
  languageDropdownOpen.value = false
  profileDropdownOpen.value = false
}

const toggleProfileDropdown = () => {
  profileDropdownOpen.value = !profileDropdownOpen.value
  languageDropdownOpen.value = false
  themeDropdownOpen.value = false
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

const switchCharacter = async (character) => {
  profileDropdownOpen.value = false
  await authStore.switchCharacter(character.character_id)
  // Update data for the new character
  await allCharactersData.updateCharacterData(character.character_id)
}

const addNewProfile = () => {
  profileDropdownOpen.value = false
  // TODO: Implement multi-profile support
  // For now, just redirect to auth page
  router.push('/auth')
}

const logout = () => {
  profileDropdownOpen.value = false
  authStore.logout()
  authStore.stopAutoRefresh()
  router.push('/')
}

const closeDropdowns = (e) => {
  if (!e.target.closest('.relative')) {
    languageDropdownOpen.value = false
    themeDropdownOpen.value = false
    profileDropdownOpen.value = false
  }
}

const handleImageError = (event) => {
  event.target.src = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  `)}`
  event.target.classList.add('p-2', 'bg-neutral-800')
}

onMounted(() => {
  // Debug character data
  console.log('Header mounted - authStore.character:', authStore.character)
  console.log('Header mounted - isAuthenticated:', authStore.isAuthenticated)
  
  // Initialize theme
  const cleanup = settingsStore.initTheme()
  
  // Load data for all characters if authenticated
  if (authStore.isAuthenticated && authStore.characters.length > 0) {
    allCharactersData.updateAllCharactersData(authStore.characters)
  }
  
  document.addEventListener('click', closeDropdowns)
  
  onUnmounted(() => {
    cleanup?.()
    document.removeEventListener('click', closeDropdowns)
  })
})
</script>
