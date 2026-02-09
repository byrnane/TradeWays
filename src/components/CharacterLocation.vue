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
import { 
  SECURITY_COLORS
} from '../constants/security.js'
import { normalizeCharacterData, getSystemName, getSpecialSpaceType } from '../utils/characterNormalizer.js'

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

// Normalized character data
const normalizedCharacter = computed(() => normalizeCharacterData(props.character))

// Main system name
const mainSystemName = computed(() => {
  if (!props.character) return t('common.unknown')
  return getSystemName(props.character) || t('common.unknown')
})

// Security status (system security, not character)
const securityStatus = computed(() => {
  return normalizedCharacter.value?.systemSecurityStatus
})

// Security status color class (for system security with detailed gradient)
const securityStatusClass = computed(() => {
  if (securityStatus.value === null) return ''
  
  const status = parseFloat(securityStatus.value)
  const specialType = getSpecialSpaceType(props.character)
  
  // Check for special space types first
  if (specialType === 'wormhole') return SECURITY_COLORS.WORMHOLE
  if (specialType === 'abyssal') return SECURITY_COLORS.ABYSSAL
  if (specialType === 'pochven') return SECURITY_COLORS.POCHVEN
  
  // Use exact security status colors if available
  const exactStatus = status.toFixed(1)
  if (SECURITY_COLORS[exactStatus]) {
    return SECURITY_COLORS[exactStatus]
  }
  
  // Fallback colors based on range
  if (status > 0.6) return SECURITY_COLORS.HIGH_SEC_FALLBACK
  if (status > 0) return SECURITY_COLORS.LOW_SEC_FALLBACK
  return SECURITY_COLORS.NULL_SEC_FALLBACK
})

// Breadcrumb parts (region > constellation)
const breadcrumbParts = computed(() => {
  const parts = []
  if (normalizedCharacter.value?.regionName) {
    parts.push(normalizedCharacter.value.regionName)
  }
  if (normalizedCharacter.value?.constellationName) {
    parts.push(normalizedCharacter.value.constellationName)
  }
  return parts
})

// Current position (station, structure, or "In Space")
const currentPosition = computed(() => {
  if (!normalizedCharacter.value?.location) return t('common.unknown')
  
  // Check if in structure first (citadel, etc.)
  if (normalizedCharacter.value.structureName) {
    return normalizedCharacter.value.structureName
  }
  
  // Then check if in station
  if (normalizedCharacter.value.stationName && normalizedCharacter.value.stationName !== normalizedCharacter.value.structureName) {
    return normalizedCharacter.value.stationName
  }
  
  return t('location.inSpace')
})
</script>
