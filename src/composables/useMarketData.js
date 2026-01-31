import { ref, onMounted } from 'vue'
import { 
  getMarketCategories, 
  getMarketCategory, 
  getMarketGroupItems,
  getTypeInfo,
  buildCategoryTree,
  getCachedMarketCategories,
  getCachedMarketCategory,
  getCachedMarketGroupItems,
  getCachedTypeInfo
} from '../services/market.js'
import { useUIStore } from '../stores/ui.js'
import { batchRequest } from '../utils/requestQueue.js'

export function useMarketData() {
  const uiStore = useUIStore()
  
  // State
  const categories = ref([])
  const currentCategory = ref(null)
  const categoryItems = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Load all market categories
  const loadCategories = async () => {
    try {
      loading.value = true
      error.value = null
      uiStore.startLoading('Загрузка категорий рынка...')
      
      // Try to build full category tree
      const categoryTree = await buildCategoryTree()
      categories.value = categoryTree
      
      uiStore.stopLoading()
    } catch (err) {
      console.error('Failed to load market categories:', err)
      error.value = err.message
      uiStore.stopLoading()
    } finally {
      loading.value = false
    }
  }
  
  // Load specific category details
  const loadCategory = async (categoryId) => {
    try {
      loading.value = true
      error.value = null
      uiStore.startLoading('Загрузка категории...')
      
      const category = await getCachedMarketCategory(categoryId)
      currentCategory.value = category
      
      // If category has a parent group, load items
      if (category.market_group_id) {
        const items = await getCachedMarketGroupItems(category.market_group_id)
        
        // Load items in batches to prevent spam
        uiStore.startLoading(`Загрузка ${Math.min(items.length, 100)} предметов...`)
        
        const itemResults = await batchRequest(
          items.slice(0, 100), // Limit to first 100 items
          async (itemId) => {
            const typeInfo = await getCachedTypeInfo(itemId)
            return {
              id: itemId,
              name: typeInfo.name.en || `Item ${itemId}`,
              description: typeInfo.description?.en || '',
              groupId: typeInfo.group_id,
              categoryId: categoryId,
              volume: typeInfo.volume,
              packagedVolume: typeInfo.packaged_volume,
              capacity: typeInfo.capacity,
              mass: typeInfo.mass,
              radius: typeInfo.radius,
              iconId: typeInfo.icon_id,
              published: typeInfo.published
            }
          },
          5, // Process 5 items at once
          300 // 300ms delay between batches
        )
        
        // Filter successful results
        const itemsWithDetails = itemResults
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value)
        
        // Add failed items as placeholders
        itemResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            const itemId = items[index]
            itemsWithDetails.push({
              id: itemId,
              name: `Item ${itemId}`,
              groupId: null,
              categoryId: categoryId
            })
          }
        })
        
        categoryItems.value = itemsWithDetails
      }
      
      uiStore.stopLoading()
      return category
    } catch (err) {
      console.error(`Failed to load category ${categoryId}:`, err)
      error.value = err.message
      uiStore.stopLoading()
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Load items for a specific group
  const loadGroupItems = async (groupId) => {
    try {
      loading.value = true
      error.value = null
      uiStore.startLoading('Загрузка предметов...')
      
      const itemIds = await getCachedMarketGroupItems(groupId)
      
      // Get detailed info for each item (limit to first 100 for performance)
      const itemsWithDetails = await Promise.all(
        itemIds.slice(0, 100).map(async (itemId) => {
          try {
            const typeInfo = await getCachedTypeInfo(itemId)
            return {
              id: itemId,
              name: typeInfo.name.en || `Item ${itemId}`,
              description: typeInfo.description?.en || '',
              groupId: typeInfo.group_id,
              volume: typeInfo.volume,
              packagedVolume: typeInfo.packaged_volume,
              capacity: typeInfo.capacity,
              mass: typeInfo.mass,
              radius: typeInfo.radius,
              iconId: typeInfo.icon_id,
              published: typeInfo.published
            }
          } catch (err) {
            console.warn(`Failed to load info for item ${itemId}:`, err)
            return {
              id: itemId,
              name: `Item ${itemId}`,
              groupId: groupId
            }
          }
        })
      )
      
      categoryItems.value = itemsWithDetails
      uiStore.stopLoading()
      return itemsWithDetails
    } catch (err) {
      console.error(`Failed to load group items ${groupId}:`, err)
      error.value = err.message
      uiStore.stopLoading()
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Search items by name
  const searchItems = async (query) => {
    if (!query || query.length < 3) {
      return []
    }
    
    try {
      uiStore.startLoading('Поиск предметов...')
      
      // This would require a search API endpoint
      // For now, we'll search through loaded items
      const results = categoryItems.value.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      )
      
      uiStore.stopLoading()
      return results
    } catch (err) {
      console.error('Failed to search items:', err)
      error.value = err.message
      uiStore.stopLoading()
      return []
    }
  }
  
  // Get item details
  const getItemDetails = async (itemId) => {
    try {
      uiStore.startLoading('Загрузка информации о предмете...')
      
      const typeInfo = await getCachedTypeInfo(itemId)
      
      const item = {
        id: itemId,
        name: typeInfo.name.en || `Item ${itemId}`,
        description: typeInfo.description?.en || '',
        groupId: typeInfo.group_id,
        volume: typeInfo.volume,
        packagedVolume: typeInfo.packaged_volume,
        capacity: typeInfo.capacity,
        mass: typeInfo.mass,
        radius: typeInfo.radius,
        iconId: typeInfo.icon_id,
        published: typeInfo.published,
        dogmaAttributes: typeInfo.dogma_attributes || [],
        dogmaEffects: typeInfo.dogma_effects || []
      }
      
      uiStore.stopLoading()
      return item
    } catch (err) {
      console.error(`Failed to load item details ${itemId}:`, err)
      error.value = err.message
      uiStore.stopLoading()
      throw err
    }
  }
  
  // Initialize on mount
  onMounted(() => {
    loadCategories()
  })
  
  return {
    // State
    categories,
    currentCategory,
    categoryItems,
    loading,
    error,
    
    // Methods
    loadCategories,
    loadCategory,
    loadGroupItems,
    searchItems,
    getItemDetails
  }
}
