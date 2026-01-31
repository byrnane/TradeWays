import { ref, computed } from 'vue'
import { getMarketCategories, getMarketCategory, getMarketGroupItems, getTypeInfo } from '../services/market.js'
import { useUIStore } from '../stores/ui.js'
import { marketCache, CACHE_KEYS } from '../utils/marketCache.js'

export function useMarketDataSmart() {
  const uiStore = useUIStore()
  
  // State
  const categories = ref([])
  const expandedCategories = ref(new Set())
  const loading = ref(false)
  const error = ref(null)
  const lastRefresh = ref(null)
  const loadingQueue = new Set() // Track what's currently loading
  
  // Build category tree from flat list
  const buildTreeFromFlat = (flatCategories, parentId = null) => {
    return flatCategories
      .filter(cat => cat.parent_group_id === parentId)
      .map(cat => ({
        ...cat,
        children: buildTreeFromFlat(flatCategories, cat.market_group_id),
        loaded: false,
        hasItems: false,
        itemsCount: 0
      }))
  }
  
  // Load only top-level categories initially
  const loadTopLevelCategories = async (forceRefresh = false) => {
    try {
      loading.value = true
      error.value = null
      
      // Check cache first
      if (!forceRefresh) {
        const cached = marketCache.get(CACHE_KEYS.CATEGORIES + '_top')
        if (cached) {
          categories.value = cached
          lastRefresh.value = marketCache.get('last_refresh_categories') || null
          return cached
        }
      }
      
      uiStore.startLoading('Загрузка категорий рынка...')
      
      // Fetch all category IDs
      const categoryIds = await getMarketCategories()
      
      // Fetch details for ALL categories (but we'll build tree smartly)
      const allCategories = []
      for (let i = 0; i < categoryIds.length; i++) {
        const categoryId = categoryIds[i]
        try {
          const category = await getMarketCategory(categoryId)
          allCategories.push({
            id: categoryId,
            market_group_id: categoryId,
            name: category.name.en || `Category ${categoryId}`,
            description: category.description?.en || '',
            parent_group_id: category.parent_group_id || null,
            icon: getCategoryIcon(categoryId)
          })
          
          // Small delay between requests
          if (i < categoryIds.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 30))
          }
        } catch (err) {
          console.warn(`Failed to load category ${categoryId}:`, err)
        }
      }
      
      // Build tree structure
      const tree = buildTreeFromFlat(allCategories)
      
      // Sort top level
      tree.sort((a, b) => a.name.localeCompare(b.name))
      
      // Mark top-level as loaded but not expanded
      tree.forEach(cat => {
        cat.loaded = true
        cat.hasChildren = cat.children && cat.children.length > 0
      })
      
      categories.value = tree
      
      // Cache
      marketCache.set(CACHE_KEYS.CATEGORIES + '_top', tree)
      marketCache.set(CACHE_KEYS.CATEGORIES + '_flat', allCategories) // Save flat list for later
      marketCache.set('last_refresh_categories', Date.now())
      lastRefresh.value = Date.now()
      
      uiStore.stopLoading()
      return tree
    } catch (err) {
      console.error('Failed to load categories:', err)
      error.value = err.message
      uiStore.stopLoading()
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Load children for a specific category
  const loadCategoryChildren = async (categoryId) => {
    if (loadingQueue.has(categoryId)) return // Already loading
    
    loadingQueue.add(categoryId)
    
    try {
      const category = findCategoryInTree(categoryId)
      if (!category || category.loaded) return
      
      // Check cache
      const cached = marketCache.get(CACHE_KEYS.CHILDREN + categoryId)
      if (cached) {
        category.children = cached
        category.loaded = true
        loadingQueue.delete(categoryId)
        return cached
      }
      
      // Get flat list from cache or fetch
      let flatCategories = marketCache.get(CACHE_KEYS.CATEGORIES + '_flat')
      if (!flatCategories) {
        // Shouldn't happen if we loaded top level first, but just in case
        const categoryIds = await getMarketCategories()
        flatCategories = []
        for (const categoryId of categoryIds) {
          const category = await getMarketCategory(categoryId)
          flatCategories.push({
            id: categoryId,
            market_group_id: categoryId,
            name: category.name.en || `Category ${categoryId}`,
            description: category.description?.en || '',
            parent_group_id: category.parent_group_id || null,
            icon: getCategoryIcon(categoryId)
          })
        }
        marketCache.set(CACHE_KEYS.CATEGORIES + '_flat', flatCategories)
      }
      
      // Find direct children
      const children = flatCategories
        .filter(cat => cat.parent_group_id === categoryId)
        .map(cat => {
          const hasGrandchildren = flatCategories.some(c => c.parent_group_id === cat.market_group_id)
          return {
            ...cat,
            children: null, // Will be loaded on demand
            loaded: false,
            hasChildren: hasGrandchildren,
            hasItems: !hasGrandchildren, // Only leaf categories have items
            itemsCount: 0 // Will be loaded when needed
          }
        })
      
      // Sort children
      children.sort((a, b) => a.name.localeCompare(b.name))
      
      // Update category
      category.children = children
      category.loaded = true
      
      // Cache
      marketCache.set(CACHE_KEYS.CHILDREN + categoryId, children)
      
      loadingQueue.delete(categoryId)
      return children
    } catch (err) {
      console.error(`Failed to load children for ${categoryId}:`, err)
      loadingQueue.delete(categoryId)
      throw err
    }
  }
  
  // Toggle category expansion
  const toggleCategory = async (categoryId) => {
    const category = findCategoryInTree(categoryId)
    if (!category) return
    
    if (expandedCategories.value.has(categoryId)) {
      expandedCategories.value.delete(categoryId)
    } else {
      expandedCategories.value.add(categoryId)
      
      // Load children if not loaded
      if (!category.loaded && category.hasChildren) {
        await loadCategoryChildren(categoryId)
      }
    }
  }
  
  // Get items for a leaf category
  const getCategoryItems = async (categoryId, limit = 50) => {
    try {
      // Check cache first
      const cached = marketCache.get(CACHE_KEYS.GROUP_ITEMS + categoryId)
      if (cached) {
        return cached.slice(0, limit)
      }
      
      // Check if this is actually a leaf category
      const category = findCategoryInTree(categoryId)
      if (!category) {
        throw new Error('Category not found')
      }
      
      if (category.hasChildren) {
        // Don't load items for categories with children
        return []
      }
      
      // Fetch category data to get types
      uiStore.startLoading('Загрузка предметов...')
      const categoryData = await getMarketCategory(categoryId)
      
      if (!categoryData.types || categoryData.types.length === 0) {
        uiStore.stopLoading()
        return []
      }
      
      // Load items
      const items = []
      const actualLimit = Math.min(categoryData.types.length, limit)
      
      for (let i = 0; i < actualLimit; i++) {
        const typeId = categoryData.types[i]
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
          
          // Update progress
          if (i % 5 === 0) {
            uiStore.startLoading(`Загружено ${items.length} из ${actualLimit} предметов...`)
          }
          
          // Small delay
          await new Promise(resolve => setTimeout(resolve, 50))
        } catch (err) {
          console.warn(`Failed to load item ${typeId}:`, err)
          items.push({
            id: typeId,
            name: `Item ${typeId}`,
            groupId: null
          })
        }
      }
      
      // Cache
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
  
  // Helper to find category in tree
  const findCategoryInTree = (categoryId, categoryList = categories.value) => {
    for (const category of categoryList) {
      if (category.id === categoryId) {
        return category
      }
      
      if (category.children) {
        const found = findCategoryInTree(categoryId, category.children)
        if (found) return found
      }
    }
    return null
  }
  
  // Clear cache and refresh
  const refreshCache = async () => {
    marketCache.clearAll()
    expandedCategories.value.clear()
    await loadTopLevelCategories(true)
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
  
  // Initialize
  const initialize = async () => {
    await loadTopLevelCategories()
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
    loadTopLevelCategories,
    toggleCategory,
    loadCategoryChildren,
    getCategoryItems,
    refreshCache,
    getCacheInfo
  }
}
