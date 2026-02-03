<template>
  <div class="fixed top-20 left-0 bottom-0 z-30 w-64 bg-neutral-900 border-r border-neutral-800 transform transition-transform duration-200 ease-in-out" 
       :class="isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
    <!-- Navigation -->
    <nav class="p-4 space-y-2">
      <!-- Mobile Close Button -->
      <div class="flex justify-end lg:hidden mb-4">
        <button @click="$emit('close')" class="p-2 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation Title -->
      <h3 class="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
        {{ $t('nav.menu') }}
      </h3>

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
  </div>

  <!-- Overlay for mobile -->
  <div v-if="isOpen" @click="$emit('close')" class="fixed inset-0 z-40 bg-black/50 lg:hidden"></div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { 
  HomeIcon, 
  UserGroupIcon, 
  CalculatorIcon 
} from '@heroicons/vue/24/outline';

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const authStore = useAuthStore();
const route = useRoute();
const { t } = useI18n();

const navigation = computed(() => [
  {
    name: t('nav.dashboard'),
    href: '/',
    icon: HomeIcon
  },
  {
    name: t('nav.profiles'),
    href: '/profiles',
    icon: UserGroupIcon
  },
  {
    name: t('nav.calculators'),
    href: '/calculators',
    icon: CalculatorIcon
  }
])

const handleNavigation = () => {
  // Close sidebar on mobile after navigation
  if (window.innerWidth < 1024) {
    emit('close');
  }
};
</script>
