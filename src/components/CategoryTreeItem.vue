<template>
  <div class="ml-4 mt-1 space-y-1">
    <!-- Category Item -->
    <div 
      @click="handleSelect"
      class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
      :class="isSelected 
        ? 'bg-accent/10 text-accent' 
        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'"
    >
      <!-- Expand/Collapse Icon -->
      <svg 
        v-if="category.hasChildren"
        @click.stop="handleToggle"
        class="w-4 h-4 transition-transform cursor-pointer hover:text-neutral-300"
        :class="{ 'rotate-90': isExpanded }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <div v-else class="w-4"></div>
      
      <!-- Category Info -->
      <span class="flex-1 text-sm">{{ category.name }}</span>
      
      <!-- Badges -->
      <div class="flex items-center gap-2 text-xs text-neutral-500">
        <span v-if="category.itemsCount && !category.hasChildren">
          {{ category.itemsCount }} предметов
        </span>
        <span v-if="category.isMixed" class="text-accent" title="Смешанная категория">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
          </svg>
        </span>
        <span v-if="category.subcategoriesCount" class="text-neutral-600">
          {{ category.subcategoriesCount }} →
        </span>
      </div>
    </div>
    
    <!-- Nested Children -->
    <div v-if="category.children && isExpanded">
      <CategoryTreeItem 
        v-for="child in category.children" 
        :key="child.id"
        :category="child"
        :selected-category="selectedCategory"
        :expanded="expanded"
        :depth="depth + 1"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  selectedCategory: {
    type: Number,
    default: null
  },
  expanded: {
    type: Set,
    required: true
  },
  depth: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['select', 'toggle'])

const isSelected = computed(() => props.selectedCategory === props.category.id)
const isExpanded = computed(() => props.expanded.has(props.category.id))

const handleSelect = () => {
  emit('select', props.category.id)
}

const handleToggle = () => {
  emit('toggle', props.category.id)
}
</script>

<style scoped>
/* Indent based on depth */
.ml-4 {
  margin-left: calc(1rem * var(--depth, 1));
}
</style>
