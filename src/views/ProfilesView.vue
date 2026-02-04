<template>
  <div v-if="authStore.isAuthenticated" class="space-y-6">
    <!-- Characters Grid -->
    <div v-if="authStore.characters.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <!-- Character Cards -->
      <div 
        v-for="char in authStore.characters" 
        :key="char.character_id"
        class="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden hover:border-accent/50 transition-colors group"
        :class="{ 'ring-2 ring-accent/50': char.character_id === authStore.currentCharacterId }"
      >
        <div class="relative">
          <img 
            :src="`https://images.evetech.net/characters/${char.character_id}/portrait?size=256&tenant=tranquility`"
            :alt="char.name"
            class="w-full h-48 object-cover"
            @error="handleImageError"
            crossorigin="anonymous"
            referrerpolicy="no-referrer"
          />
          <div class="absolute top-3 left-3">
            <CharacterStatus :character-id="char.character_id" />
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold text-neutral-100 mb-2">{{ char.name }}</h3>
          <p class="text-sm text-neutral-400 mb-1">{{ char.corporation_name }}</p>
          <p v-if="char.alliance_name" class="text-sm text-neutral-400 mb-4">{{ char.alliance_name }}</p>
          
          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-neutral-400">{{ $t('profile.balance') }}</span>
              <span class="text-accent font-medium">{{ uiStore.formatISKShort(getCharacterData(char.character_id)?.wallet || 0) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-neutral-400">{{ $t('profile.location') }}</span>
              <CharacterLocation 
                :character="{ ...char, ...getCharacterData(char.character_id) }" 
                view-mode="compact" 
                class="text-neutral-200 text-right"
              />
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-neutral-400">{{ $t('profile.securityStatus') }}</span>
              <span :class="getSecurityStatusColor(getCharacterData(char.character_id)?.security_status || 0)">
                {{ (getCharacterData(char.character_id)?.security_status || 0).toFixed(2) }}
              </span>
            </div>
          </div>
          
          <!-- Control Block -->
          <div class="border-t border-neutral-700 pt-4">
            <div class="flex gap-2">
              <div v-if="char.character_id === authStore.currentCharacterId" class="flex-1 bg-accent/10 border border-accent/30 rounded-lg px-3 py-2 text-center flex items-center justify-center">
                <span class="text-sm text-accent font-medium">{{ $t('profiles.currentCharacter') }}</span>
              </div>
              <button
                v-else
                @click="switchCharacter(char)"
                class="flex-1 bg-accent text-accent-dark px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-1"
              >
                <ArrowRightOnRectangleIcon class="h-4 w-4" />
                {{ $t('profiles.select') }}
              </button>
              <button
                @click="refreshCharacter(char.character_id)"
                class="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': isRefreshing[char.character_id] }" />
              </button>
              <button
                @click="removeCharacter(char)"
                class="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
            <!-- Update Info -->
            <div class="mt-2 text-xs text-neutral-500 flex items-center justify-between">
              <span>{{ $t('profiles.lastUpdate') }}: {{ formatLastUpdate(getCharacterData(char.character_id)?.lastUpdated) }}</span>
              <UpdateTimer 
                :key="`timer-${char.character_id}-${getCharacterData(char.character_id)?.lastUpdated || 0}`"
                :ref="el => timerRefs[char.character_id] = el"
                :initial-time="60" 
                :compact="true" 
                :label="$t('profiles.timeToUpdate')"
                :show-icon="false"
                @timer-expired="() => refreshCharacter(char.character_id)"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Add Character Card -->
      <router-link 
        to="/auth"
        class="group flex items-center justify-center bg-neutral-900/50 border-2 border-dashed border-neutral-700 rounded-xl p-8 hover:border-accent/50 hover:bg-neutral-900/80 transition-all"
      >
        <div class="text-center">
          <PlusIcon class="h-12 w-12 text-neutral-500 group-hover:text-accent mx-auto mb-3 transition-colors" />
          <h3 class="text-lg font-semibold text-neutral-100 group-hover:text-accent transition-colors">
            {{ $t('profile.addCharacter') }}
          </h3>
          <p class="text-sm text-neutral-400 mt-1">{{ $t('profiles.addAnotherCharacter') }}</p>
        </div>
      </router-link>
    </div>
    
    <!-- Empty State for no characters -->
    <div v-else class="text-center py-16">
      <UserCircleIcon class="h-24 w-24 text-neutral-600 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-neutral-100 mb-2">{{ $t('profiles.noCharacters') }}</h3>
      <p class="text-neutral-400 mb-6">{{ $t('profiles.addFirstCharacter') }}</p>
      <router-link 
        to="/auth"
        class="inline-flex items-center gap-2 bg-accent text-accent-dark px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors"
      >
        <PlusIcon class="h-5 w-5" />
        {{ $t('profile.addCharacter') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useUIStore } from '../stores/ui.js'
import { useI18n } from 'vue-i18n'
import { UserCircleIcon, PlusIcon, TrashIcon, ArrowRightOnRectangleIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import CharacterStatus from '../components/CharacterStatus.vue'
import CharacterLocation from '../components/CharacterLocation.vue'
import UpdateTimer from '../components/UpdateTimer.vue'
import { useAllCharactersData } from '../composables/useAllCharactersData.js'
import autoRefreshService from '../services/autoRefreshService.js'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()
const { t } = useI18n()
const setPageHeader = inject('setPageHeader')

const allCharactersData = useAllCharactersData()
const timerRefs = ref({})
const isRefreshing = ref({})

onMounted(() => {
  setPageHeader({
    title: t('profile.allCharacters'),
    subtitle: t('profiles.manageCharacters'),
    icon: UserCircleIcon
  })
  // Periodic updates are now handled in App.vue
})

const getCharacterData = (characterId) => {
  return authStore.getCharacterData(characterId)
}

const refreshCharacter = async (characterId) => {
  isRefreshing.value[characterId] = true
  try {
    await autoRefreshService.updateCharacter(characterId)
    // Reset timer for this character
    if (timerRefs.value[characterId]) {
      timerRefs.value[characterId].resetTimer()
    }
  } finally {
    isRefreshing.value[characterId] = false
  }
}

const switchCharacter = async (char) => {
  await authStore.switchCharacter(char.character_id)
  router.push({ name: 'Dashboard' })
}

const handleImageError = (event) => {
  event.target.src = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  `)}`
}

const getSecurityStatusColor = (status) => {
  if (!status) return 'text-neutral-400'
  if (status < -5) return 'text-red-500'
  if (status < -2) return 'text-orange-500'
  if (status < 0) return 'text-yellow-500'
  if (status < 2) return 'text-neutral-300'
  if (status < 4.5) return 'text-green-500'
  return 'text-blue-500'
}

const formatLastUpdate = (timestamp) => {
  if (!timestamp) return t('profiles.never')
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 60) return t('profiles.justNow')
  if (seconds < 3600) return t('profiles.minutesAgo', { minutes: Math.floor(seconds / 60) })
  if (seconds < 86400) return t('profiles.hoursAgo', { hours: Math.floor(seconds / 3600) })
  return t('profiles.daysAgo', { days: Math.floor(seconds / 86400) })
}

const switchToCharacter = async (character) => {
  await authStore.switchCharacter(character.character_id)
  window.location.reload()
}

const removeCharacter = async (character) => {
  if (confirm(t('profiles.confirmRemove', { name: character.name }))) {
    await authStore.removeCharacter(character.character_id)
    if (authStore.characters.length === 0) {
      router.push('/')
    }
  }
}
</script>
