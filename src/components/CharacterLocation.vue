<template>
  <div class="character-location">
    <!-- Show only system name for dropdown -->
    <div v-if="!showFull && !showDetails" class="text-sm">
      {{ mainSystemName }}
    </div>
    
    <!-- Full layout for main page -->
    <div v-else>
      <!-- Main system name -->
      <div class="text-lg font-semibold text-white mb-1">
        {{ mainSystemName }}
      </div>
      
      <!-- Breadcrumb navigation -->
      <div class="text-xs text-gray-400 mb-1">
        <template v-for="(part, index) in breadcrumbParts" :key="index">
          <span v-if="index > 0" class="mx-1 text-gray-600">›</span>
          <span>{{ part }}</span>
        </template>
      </div>
      
      <!-- Current position (station or "In Space") -->
      <div class="text-sm text-gray-300">
        {{ currentPosition }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCharacterLocation } from '../composables/useCharacterLocation.js'

const props = defineProps({
  character: {
    type: Object,
    required: true
  },
  showFull: {
    type: Boolean,
    default: false
  },
  showDetails: {
    type: Boolean,
    default: false
  }
})

const { location, shortLocation, locationParts } = useCharacterLocation(props.character)

// Main system name (large text)
const mainSystemName = computed(() => {
  if (!props.character) return 'Unknown'
  return props.character.locationName || 
         props.character.location?.solar_system_name || 
         'Unknown System'
})

// Breadcrumb parts (region > constellation)
const breadcrumbParts = computed(() => {
  const parts = []
  if (props.character?.regionName) {
    parts.push(props.character.regionName)
  }
  if (props.character?.constellationName) {
    parts.push(props.character.constellationName)
  }
  return parts
})

// Current position (station or "In Space")
const currentPosition = computed(() => {
  if (!props.character?.location) return 'Unknown'
  
  if (props.character.location.station_name) {
    return props.character.location.station_name
  }
  
  return 'In Space'
})
</script>
