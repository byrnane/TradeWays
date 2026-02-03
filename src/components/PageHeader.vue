<template>
  <div class="bg-neutral-900/50 border-b border-neutral-800">
    <div class="px-6 py-8">
      <div class="flex items-center gap-4">
        <div class="p-4 bg-neutral-800 rounded-xl">
          <component :is="isValidIcon ? icon : 'div'" class="h-8 w-8 text-accent" />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-neutral-100">{{ title }}</h1>
          <p class="text-lg text-neutral-400 mt-1">{{ subtitle }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: [Object, Function],
    required: true
  }
})

const isValidIcon = computed(() => {
  return props.icon && (typeof props.icon === 'object' || typeof props.icon === 'function')
})
</script>
