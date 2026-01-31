import { ref, computed } from 'vue'
import { getMarketCategories, getMarketCategory, getMarketGroupItems, getTypeInfo } from '../services/market.js'
import { useUIStore } from '../stores/ui.js'
import { marketCache, CACHE_KEYS } from '../utils/marketCache.js'

export function useMarketDataLazy() {
  const uiStore = useUIStore()
  
  // State
  const categories = ref([])
  const expandedCategories = ref(new Set()) // Track which categories are expanded
  const loading = ref(false)
  const error = ref(null)
  const lastRefresh = ref(null)
  
  // Load categories (only root level)
  const loadCategories = async (forceRefresh = false) => {
    try {
      loading.value = true
      error.value = null
      
      // Check cache first
      if (!forceRefresh) {
        const cached = marketCache.get(CACHE_KEYS.CATEGORIES)
        if (cached) {
          categories.value = cached
          lastRefresh.value = marketCache.get('last_refresh_categories') || null
          return cached
        }
      }
      
      uiStore.startLoading('Загрузка категорий рынка...')
      
      // Fetch root categories
      const categoryIds = await getMarketCategories()
      
      // Fetch details for each category with minimal delay
      const categoriesData = []
      for (let i = 0; i < categoryIds.length; i++) {
        const categoryId = categoryIds[i]
        try {
          const category = await getMarketCategory(categoryId)
          categoriesData.push({
            id: categoryId,
            name: category.name.en || `Category ${categoryId}`,
            description: category.description?.en || '',
            icon: getCategoryIcon(categoryId),
            children: null, // Will be loaded on demand
            hasChildren: true,
            loaded: false
          })
          
          // Small delay between requests
          if (i < categoryIds.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 50))
          }
        } catch (err) {
          console.warn(`Failed to load category ${categoryId}:`, err)
        }
      }
      
      // Sort and cache
      categoriesData.sort((a, b) => a.name.localeCompare(b.name))
      categories.value = categoriesData
      
      // Update cache
      marketCache.set(CACHE_KEYS.CATEGORIES, categoriesData)
      marketCache.set('last_refresh_categories', Date.now())
      lastRefresh.value = Date.now()
      
      uiStore.stopLoading()
      return categoriesData
    } catch (err) {
      console.error('Failed to load categories:', err)
      error.value = err.message
      uiStore.stopLoading()
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Load subcategories for a specific category
  const loadSubcategories = async (categoryId) => {
    try {
      const category = categories.value.find(c => c.id === categoryId)
      if (!category || category.loaded) return category.children
      
      // Check cache first
      const cached = marketCache.get(CACHE_KEYS.SUBCATEGORIES + categoryId)
      if (cached) {
        category.children = cached
        category.loaded = true
        return cached
      }
      
      // Fetch from API
      const categoryData = await getMarketCategory(categoryId)
      const children = []
      
      // Process subcategories if any
      if (categoryData.categories && categoryData.categories.length > 0) {
        for (const subcategoryId of categoryData.categories) {
          try {
            const subcategoryData = await getMarketCategory(subcategoryId)
            
            // Check if this subcategory has both items and subcategories
            const hasTypes = subcategoryData.types && subcategoryData.types.length > 0
            const hasSubcategories = subcategoryData.categories && subcategoryData.categories.length > 0
            
            // Don't show items count if category has subcategories
            // Items should be loaded from leaf categories only
            const itemsCount = hasSubcategories ? 0 : (hasTypes ? subcategoryData.types.length : 0)
            
            children.push({
              id: subcategoryId,
              name: subcategoryData.name.en || `Category ${subcategoryId}`,
              description: subcategoryData.description?.en || '',
              parent_id: categoryId,
              children: null, // Will be loaded on demand
              hasChildren: hasSubcategories,
              hasItems: hasTypes && !hasSubcategories, // Only if no subcategories
              loaded: false,
              itemsCount: itemsCount,
              subcategoriesCount: hasSubcategories ? subcategoryData.categories.length : 0,
              isMixed: hasTypes && hasSubcategories,
              // Store types if this is a leaf category
              types: hasTypes && !hasSubcategories ? subcategoryData.types : null
            })
            
            // Small delay
            await new Promise(resolve => setTimeout(resolve, 50))
          } catch (err) {
            console.warn(`Failed to load subcategory ${subcategoryId}:`, err)
          }
        }
      }
      
      // Sort children
      children.sort((a, b) => a.name.localeCompare(b.name))
      
      // Update category
      category.children = children
      category.loaded = true
      category.hasChildren = children.length > 0
      category.hasItems = categoryData.types && categoryData.types.length > 0 && !categoryData.categories
      category.itemsCount = category.hasItems ? categoryData.types.length : 0
      category.isMixed = category.hasChildren && category.hasItems
      
      // Cache
      marketCache.set(CACHE_KEYS.SUBCATEGORIES + categoryId, children)
      
      return children
    } catch (err) {
      console.error(`Failed to load subcategories for ${categoryId}:`, err)
      throw err
    }
  }
  
  // Toggle category expansion
  const toggleCategory = async (categoryId) => {
    const category = findCategoryById(categoryId)
    if (!category) return
    
    if (expandedCategories.value.has(categoryId)) {
      expandedCategories.value.delete(categoryId)
    } else {
      expandedCategories.value.add(categoryId)
      
      // Load subcategories if not loaded
      if (!category.loaded && category.hasChildren) {
        await loadSubcategories(categoryId)
      }
    }
  }
  
  // Helper to find category at any level
  const findCategoryById = (categoryId, categoryList = categories.value) => {
    for (const category of categoryList) {
      if (category.id === categoryId) {
        return category
      }
      
      if (category.children) {
        const found = findCategoryById(categoryId, category.children)
        if (found) return found
      }
    }
    return null
  }
  
  // Get items for a category (lazy loaded)
  const getCategoryItems = async (categoryId, limit = 50) => {
    try {
      // Check cache first
      const cached = marketCache.get(CACHE_KEYS.GROUP_ITEMS + categoryId)
      if (cached) {
        return cached.slice(0, limit)
      }
      
      // First try to find the category in the tree to get cached types
      const category = findCategoryById(categoryId)
      let typeIds = null
      
      if (category && category.types) {
        // Use cached types from leaf category
        typeIds = category.types
      } else {
        // Fetch from API
        uiStore.startLoading('Загрузка информации о категории...')
        const categoryData = await getMarketCategory(categoryId)
        typeIds = categoryData.types
        
        // If category has subcategories, don't load items
        if (categoryData.categories && categoryData.categories.length > 0) {
          uiStore.stopLoading()
          return []
        }
      }
      
      if (!typeIds || typeIds.length === 0) {
        uiStore.stopLoading()
        return []
      }
      
      // Load items in small batches
      uiStore.startLoading(`Загрузка предметов...`)
      const items = []
      const batchSize = 5
      const actualLimit = Math.min(typeIds.length, limit)
      const batches = Math.ceil(actualLimit / batchSize)
      
      for (let i = 0; i < batches; i++) {
        const start = i * batchSize
        const end = Math.min(start + batchSize, actualLimit)
        const batch = typeIds.slice(start, end)
        
        for (const typeId of batch) {
          try {
            const typeInfo = await getTypeInfo(typeId)
            items.push({
              id: typeId,
              name: typeInfo.name.en || `Item ${typeId}`,
              description: typeInfo.description?.en || '',
              groupId: typeInfo.group_id,
              volume: typeInfo.volume,
              mass: typeInfo.mass,
              iconId: typeInfo.icon_id,
              published: typeInfo.published
            })
          } catch (err) {
            console.warn(`Failed to load item ${typeId}:`, err)
            items.push({
              id: typeId,
              name: `Item ${typeId}`,
              groupId: null
            })
          }
          
          // Small delay between items
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        // Update UI progress
        uiStore.startLoading(`Загружено ${items.length} из ${actualLimit} предметов...`)
      }
      
      // Cache results
      marketCache.set(CACHE_KEYS.GROUP_ITEMS + categoryId, items)
      
      uiStore.stopLoading()
      return items
    } catch (err) {
      console.error(`Failed to load items for category ${categoryId}:`, err)
      error.value = err.message
      uiStore.stopLoading()
      throw err
    }
  }
  
  // Clear cache and refresh
  const refreshCache = async () => {
    marketCache.clearAll()
    expandedCategories.value.clear()
    await loadCategories(true)
  }
  
  // Get cache info
  const getCacheInfo = () => {
    return marketCache.getInfo()
  }
  
  // Helper to get icon
  const getCategoryIcon = (categoryId) => {
    const iconMap = {
      1: '🔧', // Modules
      2: '🚀', // Ships
      3: '💣', // Ammo
      4: '🐝', // Drones
      5: '⛏️', // Ore
      6: '📋', // Blueprints
      7: '🔩', // Components
      8: '🛡️', // Implants & Boosters
      9: '🧪', // Materials
      10: '🎁', // Miscellaneous
      11: '⚡', // Ship Equipment
      12: '🔬', // Science & Industry
      13: '🎯', // Combat Rigs
      14: '🏭', // Structures
      15: '🌟', // Sovereignty
      16: '🎪', // Apparel
      17: '🎨', // SKINs
      18: '📦', // Fuel
      19: '🔑', // Decryptors
      20: '🎭', // Special Edition
    }
    
    return iconMap[categoryId] || '📦'
  }
  
  // Initialize on load
  const initialize = async () => {
    await loadCategories()
  }
  
  return {
    // State
    categories,
    expandedCategories,
    loading,
    error,
    lastRefresh,
    
    // Computed
    cacheInfo: computed(getCacheInfo),
    
    // Methods
    initialize,
    loadCategories,
    toggleCategory,
    loadSubcategories,
    getCategoryItems,
    refreshCache,
    getCacheInfo
  }
}
