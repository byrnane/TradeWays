<template>
  <div class="relative min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900">
    <header class="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div class="flex items-center gap-3">
          <div class="grid h-9 w-9 place-items-center rounded-lg bg-neutral-800 ring-1 ring-neutral-700 shadow-soft text-neutral-200 font-semibold">
            TW
          </div>
          <div>
            <h1 class="text-xl font-semibold tracking-tight">TradeWay</h1>
            <p class="text-sm text-neutral-400">Авторизация ESI</p>
          </div>
        </div>
        <router-link to="/" class="rounded-md border border-neutral-700 bg-neutral-800/60 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700/60">
          Назад
        </router-link>
      </div>
    </header>

    <main class="mx-auto max-w-md px-4 py-20">
      <div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-8 shadow-soft">
        <h2 class="mb-6 text-center text-xl font-semibold">Авторизация через EVE SSO</h2>
        
        <div class="space-y-4">
          <p class="text-center text-neutral-300">
            Для доступа к данным рынка и персонажа необходимо авторизоваться через EVE Single Sign-On.
          </p>
          
          <div class="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
            <h3 class="mb-2 font-medium">Запрашиваемые разрешения:</h3>
            <ul class="space-y-1 text-sm text-neutral-400">
              <li>• publicData - базовая информация о персонаже</li>
              <li>• esi-markets.read_structures.v1 - чтение рыночных данных структур</li>
              <li>• esi-markets.read_character_orders.v1 - чтение ордеров персонажа</li>
              <li>• esi-wallet.read_character_wallet.v1 - чтение баланса кошелька</li>
            </ul>
          </div>

          <button 
            @click="login" 
            :disabled="loading"
            class="w-full rounded-md border border-accent/60 bg-accent/10 px-4 py-3 font-medium text-accent hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Загрузка...</span>
            <span v-else>Авторизоваться через EVE SSO</span>
          </button>

          <div v-if="error" class="rounded-lg border border-red-800/50 bg-red-900/20 p-3 text-sm text-red-300">
            {{ error }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAuthUrl } from '../services/esi.js'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const login = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const authUrl = getAuthUrl()
    window.location.href = authUrl
  } catch (err) {
    error.value = 'Ошибка при подготовке авторизации: ' + err.message
    loading.value = false
  }
}
</script>
