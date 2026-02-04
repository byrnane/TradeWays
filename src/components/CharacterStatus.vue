<template>
  <div 
    class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
    :class="status.bgColor"
  >
    <div 
      class="h-2 w-2 rounded-full"
      :class="status.color === 'text-green-600' ? 'bg-green-500' : 
             status.color === 'text-yellow-600' ? 'bg-yellow-500' : 
             status.color === 'text-red-600' ? 'bg-red-500' :
             status.color === 'text-gray-600' ? 'bg-gray-500' : 'bg-gray-400'"
    ></div>
    <span :class="status.color">{{ status.text }}</span>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useCharacterStatusStore } from '../composables/useCharacterStatusStore.js'
import { useAuthStore } from '../stores/auth.js'

const props = defineProps({
  characterId: {
    type: Number,
    required: true
  }
})

const { characterStatuses, updateStatus } = useCharacterStatusStore()
const authStore = useAuthStore()

// Watch for character data changes and update status accordingly
watch(() => authStore.getCharacterData(props.characterId), (newData) => {
  if (newData && newData.online !== undefined) {
    updateStatus(props.characterId, Boolean(newData.online))
  }
}, { immediate: true })

const status = computed(() => {
  if (!props.characterId) return { text: 'Unknown', color: 'text-gray-500', bgColor: 'bg-gray-800/50' }
  
  // First check the status store
  let isOnline = characterStatuses.value[props.characterId]
  
  // If not found in status store, check character data as fallback
  if (isOnline === undefined) {
    const characterData = authStore.getCharacterData(props.characterId)
    if (characterData && characterData.online !== undefined) {
      isOnline = Boolean(characterData.online)
      // Update the status store for future reference
      updateStatus(props.characterId, isOnline)
    }
  }
  
  if (isOnline === true) {
    return { text: 'Online', color: 'text-green-400', bgColor: 'bg-green-900/30' }
  } else if (isOnline === false) {
    return { text: 'Offline', color: 'text-red-400', bgColor: 'bg-red-900/30' }
  }
  
  return { text: 'Unknown', color: 'text-gray-500', bgColor: 'bg-gray-800/50' }
})
</script>
