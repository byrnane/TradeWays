<template>
  <div class="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900">
    <!-- Header -->
    <div class="px-6 py-8 border-b border-neutral-800">
      <h1 class="text-3xl font-bold text-neutral-100">{{ $t('profile.allCharacters') }}</h1>
      <p class="text-neutral-400 mt-2">{{ $t('profiles.manageCharacters') }}</p>
    </div>

    <!-- Characters Grid -->
    <div class="p-6">
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
            <div v-if="char.character_id === authStore.currentCharacterId" class="absolute top-3 right-3">
              <div class="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <div class="h-2 w-2 rounded-full bg-green-500"></div>
                {{ $t('profile.active') }}
              </div>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-semibold text-neutral-100 mb-2">{{ char.name }}</h3>
            <p class="text-sm text-neutral-400 mb-1">{{ char.corporation_name }}</p>
            <p v-if="char.alliance_name" class="text-sm text-neutral-400 mb-4">{{ char.alliance_name }}</p>
            
            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-neutral-400">{{ $t('profile.balance') }}</span>
                <span class="text-accent font-medium">{{ uiStore.formatISKShort(0) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-neutral-400">{{ $t('profile.location') }}</span>
                <span class="text-neutral-200">{{ $t('common.unknown') }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-neutral-400">{{ $t('profile.securityStatus') }}</span>
                <span 
                  class="font-medium"
                  :class="getSecurityStatusColor(char.security_status)"
                >
                  {{ char.security_status?.toFixed(1) || '0.0' }}
                </span>
              </div>
            </div>
            
            <div class="flex gap-2">
              <button 
                v-if="char.character_id !== authStore.currentCharacterId"
                @click="switchToCharacter(char)"
                class="flex-1 bg-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-accent/90 transition-colors"
              >
                {{ $t('profiles.switchTo') }}
              </button>
              <button 
                v-else
                disabled
                class="flex-1 bg-neutral-700 text-neutral-400 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
              >
                {{ $t('profiles.currentlyActive') }}
              </button>
              <button 
                @click="removeCharacter(char)"
                class="px-4 py-2 rounded-lg border border-red-700/50 text-red-400 hover:bg-red-900/20 transition-colors"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State for no characters -->
      <div v-else class="text-center py-16">
        <UserCircleIcon class="h-24 w-24 text-neutral-600 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-neutral-100 mb-2">{{ $t('profiles.noCharacters') }}</h3>
        <p class="text-neutral-400 mb-6">{{ $t('profiles.addFirstCharacter') }}</p>
        <router-link 
          to="/auth"
          class="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors"
        >
          <PlusIcon class="h-5 w-5" />
          {{ $t('profile.addCharacter') }}
        </router-link>
      </div>
      
      <!-- Add Character Card -->
      <router-link 
        v-if="authStore.isAuthenticated"
        to="/auth"
        class="group block bg-neutral-900/50 border-2 border-dashed border-neutral-700 rounded-xl p-8 hover:border-accent/50 hover:bg-neutral-900/80 transition-all"
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useUIStore } from '../stores/ui.js'
import { useI18n } from 'vue-i18n'
import { UserCircleIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()
const { t } = useI18n()

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

const switchToCharacter = (character) => {
  authStore.switchCharacter(character.character_id)
  window.location.reload()
}

const removeCharacter = (character) => {
  if (confirm(t('profiles.confirmRemove', { name: character.name }))) {
    authStore.removeCharacter(character.character_id)
    if (authStore.characters.length === 0) {
      router.push('/')
    }
  }
}
</script>
