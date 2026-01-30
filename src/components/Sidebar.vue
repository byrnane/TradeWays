<template>
  <div class="fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 border-r border-neutral-800 transform transition-transform duration-200 ease-in-out" 
       :class="isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-neutral-800">
      <router-link to="/" class="flex items-center gap-3">
        <div class="grid h-9 w-9 place-items-center rounded-lg bg-neutral-800 ring-1 ring-neutral-700 shadow-soft text-neutral-200 font-semibold">
          TW
        </div>
        <div>
          <h1 class="text-xl font-semibold tracking-tight">TradeWay</h1>
          <p class="text-sm text-neutral-400">Trading Tools</p>
        </div>
      </router-link>
      <button @click="$emit('close')" class="lg:hidden p-2 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="p-4 space-y-2">
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        @click="handleNavigation"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="$route.path === item.href 
          ? 'bg-accent/10 text-accent border border-accent/20' 
          : 'text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800'"
      >
        <component :is="item.icon" class="h-5 w-5" />
        {{ item.name }}
      </router-link>
    </nav>

    <!-- Character Info (when logged in) -->
    <div v-if="authStore.isAuthenticated" class="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800">
      <router-link to="/" class="block group cursor-pointer">
        <div class="flex items-center gap-3">
          <img 
            :src="`https://images.evetech.net/characters/${authStore.character?.character_id}/portrait?size=64`"
            :alt="authStore.character?.name"
            class="h-10 w-10 rounded-full border-2 border-neutral-700 group-hover:border-accent/50 transition-colors"
            @error="handleImageError"
          />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-neutral-100 truncate group-hover:text-accent transition-colors">{{ authStore.character?.name }}</div>
            <div class="text-base font-bold text-accent mt-1">{{ uiStore.formatISKShort(authStore.characterData?.wallet || 0) }}</div>
            <DataUpdateTimer />
          </div>
        </div>
      </router-link>
    </div>
  </div>

  <!-- Overlay for mobile -->
  <div v-if="isOpen" @click="$emit('close')" class="fixed inset-0 z-40 bg-black/50 lg:hidden"></div>
</template>

<script setup>
import { computed, h } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { useUIStore } from '../stores/ui.js';
import { useRoute } from 'vue-router';
import DataUpdateTimer from './DataUpdateTimer.vue';

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const authStore = useAuthStore();
const route = useRoute();
const uiStore = useUIStore();

const navigation = [
  {
    name: 'Профиль',
    href: '/',
    icon: () => h('svg', { 
      xmlns: 'http://www.w3.org/2000/svg', 
      fill: 'none', 
      viewBox: '0 0 24 24', 
      stroke: 'currentColor',
      'stroke-width': '1.5'
    }, [
      h('path', { 
        'stroke-linecap': 'round', 
        'stroke-linejoin': 'round', 
        d: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' 
      })
    ])
  },
  {
    name: 'Рынок',
    href: '/market',
    icon: () => h('svg', { 
      xmlns: 'http://www.w3.org/2000/svg', 
      fill: 'none', 
      viewBox: '0 0 24 24', 
      stroke: 'currentColor',
      'stroke-width': '1.5'
    }, [
      h('path', { 
        'stroke-linecap': 'round', 
        'stroke-linejoin': 'round', 
        d: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z' 
      })
    ])
  }
]

const formatISK = (value) => {
  if (!value || value === 0) return '0.00';
  return new Intl.NumberFormat('ru-RU').format(value);
};

const handleImageError = (event) => {
  event.target.src = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  `)}`
  event.target.classList.add('p-2', 'bg-neutral-800');
};

const handleNavigation = () => {
  // Close sidebar on mobile after navigation
  if (window.innerWidth < 1024) {
    emit('close');
  }
};
</script>
