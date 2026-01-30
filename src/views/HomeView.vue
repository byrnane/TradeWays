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
            <p class="text-sm text-neutral-400">Помощник по торговле в EVE Online</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button @click="toggleTheme" :aria-label="theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'" class="inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800/60 px-3 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-700/60 focus:outline-none focus:ring-2 focus:ring-accent/40">
            <span class="sr-only">Переключить тему</span>
            <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
              <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.95 7.05-1.41-1.41M7.46 6.46 6.05 5.05m12.9 0-1.41 1.41M7.46 17.54 6.05 18.95"/>
              <circle cx="12" cy="12" r="4"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
          <a href="https://www.eveonline.com/" target="_blank" class="rounded-md border border-neutral-700 bg-neutral-800/60 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700/60">EVE</a>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-10">
      <section class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-soft">
          <h2 class="mb-4 text-lg font-semibold">Быстрый калькулятор прибыли</h2>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label class="block">
              <span class="mb-1 block text-sm text-neutral-300">Цена покупки (ISK)</span>
              <input type="number" v-model.number="buy" min="0" step="1" class="w-full rounded-lg border border-neutral-700 bg-neutral-800/70 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="1000000" />
            </label>
            <label class="block">
              <span class="mb-1 block text-sm text-neutral-300">Цена продажи (ISK)</span>
              <input type="number" v-model.number="sell" min="0" step="1" class="w-full rounded-lg border border-neutral-700 bg-neutral-800/70 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="1100000" />
            </label>
            <label class="block">
              <span class="mb-1 block text-sm text-neutral-300">Количество</span>
              <input type="number" v-model.number="qty" min="1" step="1" class="w-full rounded-lg border border-neutral-700 bg-neutral-800/70 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="1" />
            </label>
          </div>
          <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
              <div class="text-sm text-neutral-400">Ожидаемая прибыль</div>
              <div class="text-2xl font-semibold">{{ nf.format(profit) }} ISK</div>
            </div>
            <div class="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
              <div class="text-sm text-neutral-400">ROI</div>
              <div class="text-2xl font-semibold">{{ pf.format(roi) }}%</div>
            </div>
          </div>
          <p class="mt-4 text-sm text-neutral-400">Эта панель — демо интерфейса. Позже сюда можно добавить комиссии брокера/налога, расчёт логистики и т.п.</p>
        </div>

        <div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-soft">
          <h2 class="mb-4 text-lg font-semibold">Профиль персонажа</h2>
          <div v-if="authStore.isAuthenticated" class="space-y-4">
            <div class="flex items-start gap-4">
              <img 
                :src="`https://images.evetech.net/characters/${authStore.character?.character_id}/portrait?size=128`"
                :alt="authStore.character?.name"
                class="h-16 w-16 rounded-full border-2 border-neutral-700"
                @error="handleImageError"
              />
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-neutral-100">{{ authStore.character?.name }}</h3>
                <p class="text-sm text-neutral-400">Corporation: {{ authStore.character?.corporation_name }}</p>
                <p v-if="authStore.character?.alliance_name" class="text-sm text-neutral-400">Alliance: {{ authStore.character?.alliance_name }}</p>
                <div class="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                  <span>ID: {{ authStore.character?.character_id }}</span>
                  <span>•</span>
                  <span>Expires: {{ formatExpiration(authStore.expiresAt) }}</span>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3 rounded-lg border border-neutral-800 bg-neutral-900/50 p-3">
              <div>
                <div class="text-xs text-neutral-400">Security Status</div>
                <div class="font-medium">{{ authStore.character?.security_status || 'N/A' }}</div>
              </div>
              <div>
                <div class="text-xs text-neutral-400">Wallet Balance</div>
                <div class="font-medium">{{ formatISK(authStore.characterData?.wallet || 0) }}</div>
              </div>
              <div>
                <div class="text-xs text-neutral-400">Location</div>
                <div class="font-medium text-xs">{{ authStore.characterData?.location?.solar_system_name || 'N/A' }}</div>
              </div>
              <div>
                <div class="text-xs text-neutral-400">Online Status</div>
                <div class="font-medium">
                  <span v-if="authStore.characterData?.onlineStatus?.online" class="text-green-400">Online</span>
                  <span v-else class="text-red-400">Offline</span>
                </div>
              </div>
              <div>
                <div class="text-xs text-neutral-400">Active Orders</div>
                <div class="font-medium">{{ (authStore.characterData?.orders || []).length }}</div>
              </div>
              <div>
                <div class="text-xs text-neutral-400">Ship</div>
                <div class="font-medium text-xs">{{ authStore.characterData?.shipType?.ship_type_name || 'N/A' }}</div>
              </div>
            </div>

            <div class="flex gap-2">
              <router-link to="/market" class="rounded-md border border-neutral-700 bg-neutral-800/60 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700/60 transition-colors">
                Рынок
              </router-link>
              <button @click="authStore.logout" class="rounded-md border border-red-800/50 bg-red-900/20 px-3 py-2 text-sm text-red-300 hover:bg-red-900/30 transition-colors">
                Выйти
              </button>
            </div>
          </div>
          <div v-else class="space-y-4">
            <div class="text-center py-8">
              <div class="mx-auto h-12 w-12 rounded-full bg-neutral-800 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 text-neutral-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <p class="text-neutral-300 mb-4">Не авторизован в EVE ESI</p>
              <router-link to="/auth" class="inline-flex items-center gap-2 rounded-md border border-accent/60 bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 12.75l3-3m0 0-3-3m3 3H3.75" />
                </svg>
                Авторизоваться через EVE SSO
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useCharacterData } from '../composables/useCharacterData.js'

const authStore = useAuthStore()
const { loadCharacterData } = useCharacterData()

const buy = ref(1000000)
const sell = ref(1100000)
const qty = ref(1)

const profit = computed(() => Math.max(0, (Number(sell.value) - Number(buy.value)) * Number(qty.value)))
const roi = computed(() => {
  const b = Number(buy.value)
  const s = Number(sell.value)
  if (!isFinite(b) || b <= 0) return 0
  return ((s - b) / b) * 100
})

const nf = new Intl.NumberFormat('ru-RU')
const pf = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })

const formatISK = (value) => {
  if (!value || value === 0) return '0.00'
  return nf.format(value)
}

const formatExpiration = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const handleImageError = (event) => {
  event.target.src = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  `)}`
  event.target.classList.add('p-4', 'bg-neutral-800')
}

const theme = ref('dark')
function applyTheme () {
  const isDark = theme.value === 'dark'
  document.documentElement.classList.toggle('dark', isDark)
  try { localStorage.setItem('theme', theme.value) } catch (_) {}
}
function toggleTheme () {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  applyTheme()
}

onMounted(() => {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') theme.value = saved
  } catch (_) {}
  applyTheme()
})
</script>
