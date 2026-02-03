<template>
  <div class="min-h-screen bg-neutral-950">
    <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Welcome Section -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-neutral-100 mb-4">
          {{ $t('nav.title') }}
        </h1>
        <p class="text-xl text-neutral-400">
          {{ $t('nav.subtitle') }}
        </p>
      </div>

      <!-- Profile Section -->
      <div v-if="authStore.isAuthenticated && authStore.character" class="bg-neutral-900 rounded-xl p-8 border border-neutral-800 mb-8">
        <div class="flex items-start gap-6">
          <img 
            :src="`https://images.evetech.net/characters/${authStore.character.character_id}/portrait?size=128&tenant=tranquility`"
            :alt="authStore.character.name"
            class="h-32 w-32 rounded-full border-4 border-neutral-700 flex-shrink-0"
            @error="handleImageError"
            crossorigin="anonymous"
            referrerpolicy="no-referrer"
          />
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h2 class="text-3xl font-bold text-neutral-100">{{ authStore.character.name }}</h2>
              <CharacterStatus :character="authStore.characterData" />
            </div>
            <p class="text-lg text-neutral-400 mb-4">{{ authStore.character.corporation_name }}</p>
            <p v-if="authStore.character.alliance_name" class="text-neutral-400 mb-4">{{ authStore.character.alliance_name }}</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-neutral-800 rounded-lg p-4">
                <div class="text-sm text-neutral-400 mb-1">{{ $t('profile.balance') }}</div>
                <div class="text-xl font-bold text-accent">{{ uiStore.formatISKShort(authStore.characterData?.wallet || 0) }}</div>
              </div>
              <div class="bg-neutral-800 rounded-lg p-4">
                <div class="text-sm text-neutral-400 mb-1">{{ $t('profile.location') }}</div>
                <CharacterLocation :character="authStore.characterData" :show-details="true" />
              </div>
              <div class="bg-neutral-800 rounded-lg p-4">
                <div class="text-sm text-neutral-400 mb-1">{{ $t('profile.activeOrders') }}</div>
                <div class="text-xl font-bold text-neutral-200">{{ (authStore.characterData?.orders || []).length }}</div>
              </div>
              <div class="bg-neutral-800 rounded-lg p-4">
                <div class="text-sm text-neutral-400 mb-1">{{ $t('profile.securityStatus') }}</div>
                <div class="text-xl font-bold" :class="authStore.character.security_status < -5 ? 'text-red-400' : authStore.character.security_status < 0 ? 'text-yellow-400' : 'text-green-400'">
                  {{ authStore.character.security_status?.toFixed(2) || '0.00' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Auth Banner for non-authenticated users -->
      <div v-else class="bg-gradient-to-r from-accent/20 to-accent/10 rounded-xl p-8 border border-accent/30 mb-8 text-center">
        <div class="max-w-2xl mx-auto">
          <div class="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <UserCircleIcon class="h-8 w-8 text-accent" />
          </div>
          <h2 class="text-2xl font-bold text-neutral-100 mb-3">{{ $t('home.unlockPotential') }}</h2>
          <p class="text-neutral-300 mb-6">
            {{ $t('home.authDescription') }}
          </p>
          <router-link 
            to="/auth" 
            class="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors"
          >
            <ArrowRightOnRectangleIcon class="h-5 w-5" />
            {{ $t('auth.loginWithEVE') }}
          </router-link>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link 
          to="/settings" 
          class="bg-neutral-900 rounded-lg p-6 border border-neutral-800 hover:border-accent/50 transition-colors group"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="p-3 bg-neutral-800 rounded-lg group-hover:bg-accent/20 transition-colors">
              <Cog6ToothIcon class="h-6 w-6 text-accent" />
            </div>
            <h3 class="text-lg font-semibold text-neutral-100 group-hover:text-accent transition-colors">{{ $t('settings.title') }}</h3>
          </div>
          <p class="text-neutral-400 text-sm">{{ $t('home.settingsDescription') }}</p>
        </router-link>
        
        <router-link 
          to="/calculators" 
          class="bg-neutral-900 rounded-lg p-6 border border-neutral-800 hover:border-accent/50 transition-colors group"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="p-3 bg-neutral-800 rounded-lg group-hover:bg-accent/20 transition-colors">
              <CalculatorIcon class="h-6 w-6 text-accent" />
            </div>
            <h3 class="text-lg font-semibold text-neutral-100 group-hover:text-accent transition-colors">{{ $t('calculators.title') }}</h3>
          </div>
          <p class="text-neutral-400 text-sm">{{ $t('home.calculatorDescription') }}</p>
        </router-link>

        <!-- Placeholder for future features -->
        <div class="bg-neutral-900 rounded-lg p-6 border border-neutral-800 opacity-50">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-3 bg-neutral-800 rounded-lg">
              <PlusIcon class="h-6 w-6 text-neutral-400" />
            </div>
            <h3 class="text-lg font-semibold text-neutral-100">{{ $t('home.comingSoon') }}</h3>
          </div>
          <p class="text-neutral-400 text-sm">{{ $t('home.comingSoonDescription') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth.js'
import { useUIStore } from '../stores/ui.js'
import { 
  CalculatorIcon,
  Cog6ToothIcon,
  PlusIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'
import CharacterStatus from '../components/CharacterStatus.vue'
import CharacterLocation from '../components/CharacterLocation.vue'

const authStore = useAuthStore()
const uiStore = useUIStore()

const handleImageError = (event) => {
  event.target.src = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  `)}`
  event.target.classList.add('p-2', 'bg-neutral-800')
}
</script>
