// EVE Online ESI Market API Service
import { requestQueue, batchRequest, debounceRequest } from '../utils/requestQueue.js'

// Get all market categories
export const getMarketCategories = async () => {
  return requestQueue.add(async () => {
    const response = await fetch('https://esi.evetech.net/latest/markets/groups/', {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch market categories: ${response.status}`)
    }
    
    return await response.json()
  }, 2) // High priority for categories
}

// Get specific market category information
export const getMarketCategory = async (categoryId) => {
  return requestQueue.add(async () => {
    const response = await fetch(`https://esi.evetech.net/latest/markets/groups/${categoryId}/`, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch market category ${categoryId}: ${response.status}`)
    }
    
    return await response.json()
  }, 1)
}

// Get all items in a specific market group
export const getMarketGroupItems = async (groupId) => {
  return requestQueue.add(async () => {
    const response = await fetch(`https://esi.evetech.net/latest/markets/groups/${groupId}/`, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch market group ${groupId}: ${response.status}`)
    }
    
    const data = await response.json()
    return data.types || []
  }, 1)
}

// Get type information for specific item
export const getTypeInfo = async (typeId) => {
  return requestQueue.add(async () => {
    const response = await fetch(`https://esi.evetech.net/latest/universe/types/${typeId}/`, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch type info ${typeId}: ${response.status}`)
    }
    
    return await response.json()
  }, 0) // Lower priority for individual items
}

// Get market orders for a specific region and type
export const getMarketOrders = async (regionId, typeId) => {
  try {
    const response = await fetch(`https://esi.evetech.net/latest/markets/${regionId}/orders/?type_id=${typeId}`, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch market orders for type ${typeId}: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch market orders for type ${typeId}:`, error)
    throw error
  }
}

// Get market history for a specific region and type
export const getMarketHistory = async (regionId, typeId) => {
  try {
    const response = await fetch(`https://esi.evetech.net/latest/markets/${regionId}/history/?type_id=${typeId}`, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch market history for type ${typeId}: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch market history for type ${typeId}:`, error)
    throw error
  }
}

// Get all regions
export const getRegions = async () => {
  try {
    const response = await fetch('https://esi.evetech.net/latest/universe/regions/', {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch regions: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch regions:', error)
    throw error
  }
}

// Get region information
export const getRegionInfo = async (regionId) => {
  try {
    const response = await fetch(`https://esi.evetech.net/latest/universe/regions/${regionId}/`, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch region ${regionId}: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch region ${regionId}:`, error)
    throw error
  }
}

// Helper function to build category tree
export const buildCategoryTree = async () => {
  try {
    // Get all root category IDs
    const categoryIds = await getMarketCategories()
    
    // Fetch details for each category
    const categories = await Promise.all(
      categoryIds.map(async (categoryId) => {
        const category = await getMarketCategory(categoryId)
        return {
          id: categoryId,
          name: category.name.en || `Category ${categoryId}`,
          description: category.description?.en || '',
          icon: getCategoryIcon(categoryId),
          children: []
        }
      })
    )
    
    // Sort categories by name
    categories.sort((a, b) => a.name.localeCompare(b.name))
    
    return categories
  } catch (error) {
    console.error('Failed to build category tree:', error)
    throw error
  }
}

// Helper function to get icon for category
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

// Cache for market data
const marketCache = new Map()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour for categories and items
const PRICE_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes for prices (when we add them)

// Cached version of getMarketCategories
export const getCachedMarketCategories = async () => {
  const cacheKey = 'market_categories'
  const cached = marketCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  const data = await getMarketCategories()
  marketCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  })
  
  return data
}

// Cached version of getMarketCategory
export const getCachedMarketCategory = async (categoryId) => {
  const cacheKey = `market_category_${categoryId}`
  const cached = marketCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  const data = await getMarketCategory(categoryId)
  marketCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  })
  
  return data
}

// Cached version of getMarketGroupItems
export const getCachedMarketGroupItems = async (groupId) => {
  const cacheKey = `market_group_items_${groupId}`
  const cached = marketCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  const data = await getMarketGroupItems(groupId)
  marketCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  })
  
  return data
}

// Cached version of getTypeInfo
export const getCachedTypeInfo = async (typeId) => {
  const cacheKey = `type_info_${typeId}`
  const cached = marketCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  const data = await getTypeInfo(typeId)
  marketCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  })
  
  return data
}

// Clear market cache
export const clearMarketCache = () => {
  marketCache.clear()
}
