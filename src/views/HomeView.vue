<template>
  <div class="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900">
    <!-- Mobile Header -->
    <header class="lg:hidden sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
      <div class="flex items-center justify-between px-4 py-3">
        <button @click="sidebarOpen = true" class="p-2 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold">Профиль</h1>
        <button @click="toggleTheme" class="p-2 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800">
          <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
            <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.95 7.05-1.41-1.41M7.46 6.46 6.05 5.05m12.9 0-1.41 1.41M7.46 17.54 6.05 18.95"/>
            <circle cx="12" cy="12" r="4"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="lg:pl-64">
      <div class="mx-auto max-w-6xl px-4 py-8">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold tracking-tight text-neutral-100">Профиль персонажа</h1>
          <p class="mt-2 text-neutral-400">Общая информация и статистика</p>
        </div>

        <!-- Content Grid -->
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Profit Calculator -->
          <div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-soft">
            <h2 class="mb-4 text-lg font-semibold">Калькулятор прибыли</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-neutral-300 mb-1">Цена покупки</label>
                <input 
                  v-model="buy" 
                  type="number" 
                  class="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="0"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-300 mb-1">Цена продажи</label>
                <input 
                  v-model="sell" 
                  type="number" 
                  class="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="0"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-300 mb-1">Количество</label>
                <input 
                  v-model="qty" 
                  type="number" 
                  class="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="1"
                >
              </div>
              <div class="grid grid-cols-3 gap-3 rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
                <div class="text-center">
                  <div class="text-sm text-neutral-400">Прибыль</div>
                  <div class="text-xl font-semibold text-green-400">{{ formatISK(profit) }}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm text-neutral-400">ROI</div>
                  <div class="text-xl font-semibold">{{ pf.format(roi) }}%</div>
                </div>
                <div class="text-center">
                  <div class="text-sm text-neutral-400">Объем</div>
                  <div class="text-xl font-semibold">{{ formatISK(sell * qty) }}</div>
                </div>
              </div>
              <p class="text-sm text-neutral-400">Эта панель — демо интерфейса. Позже сюда можно добавить комиссии брокера/налога, расчёт логистики и т.п.</p>
            </div>
          </div>

          <!-- Character Profile -->
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
                <button 
                  @click="loadCharacterData(true)" 
                  class="rounded-md border border-neutral-700 bg-neutral-800/60 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700/60 transition-colors"
                  :disabled="uiStore.isLoading"
                >
                  {{ uiStore.isLoading ? 'Обновление...' : 'Обновить данные' }}
                </button>
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
        </div>
      </div>
    </main>

    <!-- Sidebar -->
    <Sidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { useUIStore } from '../stores/ui.js';
import { useCharacterData } from '../composables/useCharacterData.js';
import Sidebar from '../components/Sidebar.vue';

const authStore = useAuthStore();
const uiStore = useUIStore();
const { loadCharacterData } = useCharacterData();
const sidebarOpen = ref(false);

const buy = ref(1000000);
const sell = ref(1100000);
const qty = ref(1);

const profit = computed(() => Math.max(0, (Number(sell.value) - Number(buy.value)) * Number(qty.value)));
const roi = computed(() => {
  const b = Number(buy.value);
  const s = Number(sell.value);
  if (!isFinite(b) || b <= 0) return 0;
  return ((s - b) / b * 100);
});

const nf = new Intl.NumberFormat('ru-RU');
const pf = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

const formatISK = (value) => {
  if (!value || value === 0) return '0.00 ISK';
  return nf.format(value) + ' ISK';
};

const formatExpiration = (ts) => {
  if (!ts) return 'N/A';
  const dt = new Date(ts);
  return dt.toLocaleString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const handleImageError = (event) => {
  event.target.src = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  `)}`
  event.target.classList.add('p-4', 'bg-neutral-800');
};

const theme = ref('dark');
function applyTheme () {
  const isDark = theme.value === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  try { localStorage.setItem('theme', theme.value); } catch (_) {}
}
function toggleTheme () {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  applyTheme();
}

onMounted(() => {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') theme.value = saved
  } catch (_) {}
  applyTheme();

  // Set up auto-refresh timer
  const refreshInterval = setInterval(() => {
    if (authStore.isAuthenticated && !document.hidden) {
      loadCharacterData();
    }
  }, 10 * 60 * 1000); // 10 minutes

  // Clean up interval on unmount
  onUnmounted(() => {
    clearInterval(refreshInterval);
  });
});
</script>
