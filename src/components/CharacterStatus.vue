<template>
  <div 
    class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
    :class="status.bgColor"
  >
    <div 
      class="h-2 w-2 rounded-full"
      :class="status.color === 'text-green-600' ? 'bg-green-500' : 
             status.color === 'text-yellow-600' ? 'bg-yellow-500' : 
             status.color === 'text-gray-600' ? 'bg-gray-500' : 'bg-gray-400'"
    ></div>
    <span :class="status.color">{{ status.text }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCharacterStatus } from '../composables/useCharacterStatus.js'

const props = defineProps({
  character: {
    type: Object,
    required: true
  }
})

const { status } = useCharacterStatus(props.character)
</script>
