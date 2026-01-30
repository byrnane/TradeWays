<template>
  <div class="relative min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900">
    <header class="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <router-link to="/" class="flex items-center gap-3">
          <div class="grid h-9 w-9 place-items-center rounded-lg bg-neutral-800 ring-1 ring-neutral-700 shadow-soft text-neutral-200 font-semibold">
            TW
          </div>
          <div>
            <h1 class="text-xl font-semibold tracking-tight">TradeWay</h1>
            <p class="text-sm text-neutral-400">Рынок</p>
          </div>
        </router-link>
        <div class="flex gap-2">
          <router-link to="/" class="rounded-md border border-neutral-700 bg-neutral-800/60 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700/60">
            Главная
          </router-link>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-10">
      <div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-soft">
        <h2 class="mb-4 text-lg font-semibold">Рыночные данные</h2>
        <p class="text-neutral-300">Здесь будет отображаться информация о рынках, ордерах и ценах.</p>
        
        <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
            <div class="text-sm text-neutral-400">Баланс кошелька</div>
            <div class="text-xl font-semibold">{{ formatISK(walletBalance) }} ISK</div>
          </div>
          <div class="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
            <div class="text-sm text-neutral-400">Активные ордера</div>
            <div class="text-xl font-semibold">{{ orderCount }}</div>
          </div>
          <div class="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
            <div class="text-sm text-neutral-400">Регион</div>
            <div class="text-xl font-semibold">{{ currentRegion }}</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()
const walletBalance = ref(0)
const orderCount = ref(0)
const currentRegion = ref('The Forge')

const formatISK = (value) => {
  return new Intl.NumberFormat('ru-RU').format(value)
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    return
  }
})
</script>
