<template>
  <div class="character-location">
    <!-- Compact mode - only system name -->
    <div v-if="viewMode === 'compact'" class="flex items-center gap-2">
      <span class="text-sm">{{ mainSystemName }}</span>
      <span v-if="securityStatus !== null" 
            class="text-xs font-medium px-1.5 py-0.5 rounded"
            :class="securityStatusClass">
        {{ securityStatus.toFixed(1) }}
      </span>
    </div>
    
    <!-- System mode - system name with security status -->
    <div v-else-if="viewMode === 'system'" class="flex items-center gap-2">
      <span class="text-sm">{{ mainSystemName }}</span>
      <span v-if="securityStatus !== null" 
            class="text-xs font-medium px-1.5 py-0.5 rounded"
            :class="securityStatusClass">
        {{ securityStatus.toFixed(1) }}
      </span>
    </div>
    
    <!-- Full mode - system, breadcrumb, and position -->
    <div v-else class="space-y-1">
      <!-- Breadcrumb navigation first -->
      <div v-if="showBreadcrumb" class="text-xs text-neutral-400">
        <template v-for="(part, index) in breadcrumbParts" :key="index">
          <span v-if="index > 0" class="mx-1 text-neutral-600">›</span>
          <span>{{ part }}</span>
        </template>
      </div>
      
      <!-- System name with security status -->
      <div class="flex items-center gap-2">
        <div class="text-lg font-semibold text-white">
          {{ mainSystemName }}
        </div>
        <span v-if="securityStatus !== null" 
              class="text-sm font-medium px-2 py-1 rounded"
              :class="securityStatusClass">
          {{ securityStatus.toFixed(1) }}
        </span>
      </div>
      
      <!-- Current position -->
      <div v-if="showPosition" class="text-sm text-neutral-300">
        {{ currentPosition }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterLocation } from '../composables/useCharacterLocation.js'

const { t } = useI18n()

const props = defineProps({
  character: {
    type: Object,
    required: true
  },
  viewMode: {
    type: String,
    default: 'full', // 'compact', 'system', 'full'
    validator: (value) => ['compact', 'system', 'full'].includes(value)
  },
  showBreadcrumb: {
    type: Boolean,
    default: true
  },
  showPosition: {
    type: Boolean,
    default: true
  }
})

const { location, shortLocation, locationParts } = useCharacterLocation(props.character)

// Main system name
const mainSystemName = computed(() => {
  if (!props.character) return t('common.unknown')
  return props.character.location?.solar_system_name || 
         props.character.locationName || 
         props.character.system_name ||
         t('common.unknown')
})

// Security status (system security, not character)
const securityStatus = computed(() => {
  // Try to get system security from various sources
  if (props.character?.location?.system_security_status !== undefined) {
    return props.character.location.system_security_status
  }
  if (props.character?.system_security_status !== undefined) {
    return props.character.system_security_status
  }
  // For now, we don't have system security data, so don't show it
  return null
})

// Security status color class (for system security with detailed gradient)
const securityStatusClass = computed(() => {
  if (securityStatus.value === null) return ''
  
  const status = parseFloat(securityStatus.value)
  
  // Special space types
  if (props.character?.location?.solar_system_name?.toLowerCase().includes('wormhole') || 
      props.character?.system_name?.toLowerCase().includes('wormhole') ||
      props.character?.location?.solar_system_id >= 31000000 && props.character?.location?.solar_system_id < 32000000) {
    return 'bg-[#7A3DF0]/20 text-[#7A3DF0]'  // Фиолетовый - Wormhole Space
  }
  
  if (props.character?.location?.solar_system_name?.toLowerCase().includes('abyssal') || 
      props.character?.system_name?.toLowerCase().includes('abyssal')) {
    return 'bg-[#00C8FF]/20 text-[#00C8FF]'  // Неоново-синий - Abyssal Deadspace
  }
  
  if (props.character?.location?.solar_system_name?.toLowerCase().includes('pochven') || 
      props.character?.system_name?.toLowerCase().includes('pochven') ||
      (props.character?.location?.solar_system_id >= 20000000 && props.character?.location?.solar_system_id < 21000000)) {
    return 'bg-[#7F1D1D]/20 text-[#7F1D1D]'  // Гнилой красно-фиолетовый - Pochven
  }
  
  // High-sec colors
  if (status === 1.0) return 'bg-[#00FF66]/20 text-[#00FF66]'  // Ярко-зелёный
  if (status === 0.9) return 'bg-[#1AFF4D]/20 text-[#1AFF4D]'  // Зелёный
  if (status === 0.8) return 'bg-[#66FF33]/20 text-[#66FF33]'  // Жёлто-зелёный
  if (status === 0.7) return 'bg-[#99FF00]/20 text-[#99FF00]'  // Салатовый
  if (status === 0.6) return 'bg-[#CCFF00]/20 text-[#CCFF00]'  // Жёлтый
  
  // Low-sec colors
  if (status === 0.5) return 'bg-[#FFCC00]/20 text-[#FFCC00]'  // Жёлто-оранжевый
  if (status === 0.4) return 'bg-[#FF9900]/20 text-[#FF9900]'  // Оранжевый
  if (status === 0.3) return 'bg-[#FF6600]/20 text-[#FF6600]'  // Тёмно-оранжевый
  if (status === 0.2) return 'bg-[#FF3300]/20 text-[#FF3300]'  // Оранжево-красный
  if (status === 0.1) return 'bg-[#FF0000]/20 text-[#FF0000]'  // Красный
  
  // Null-sec
  if (status === 0.0) return 'bg-[#990000]/20 text-[#990000]'  // Тёмно-красный / бордовый
  
  // Fallback for any other values
  if (status > 0.6) return 'bg-green-500/20 text-green-400'
  if (status > 0) return 'bg-yellow-500/20 text-yellow-400'
  return 'bg-red-500/20 text-red-400'
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
  if (!props.character?.location) return t('common.unknown')
  
  if (props.character.location.station_name) {
    return props.character.location.station_name
  }
  
  return t('location.inSpace')
})
</script>
