// Enhanced market cache system using localStorage
const CACHE_PREFIX = 'tradeWays_market_'
const CACHE_VERSION = '1.0'

export class MarketCache {
  constructor() {
    this.memoryCache = new Map()
    this.checkVersion()
  }

  // Check cache version and clear if outdated
  checkVersion() {
    const version = localStorage.getItem(`${CACHE_PREFIX}version`)
    if (version !== CACHE_VERSION) {
      this.clearAll()
      localStorage.setItem(`${CACHE_PREFIX}version`, CACHE_VERSION)
    }
  }

  // Get data from cache (memory first, then localStorage)
  get(key) {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)
    }

    // Check localStorage
    try {
      const item = localStorage.getItem(`${CACHE_PREFIX}${key}`)
      if (item) {
        const parsed = JSON.parse(item)
        
        // Check if expired
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          localStorage.removeItem(`${CACHE_PREFIX}${key}`)
          return null
        }
        
        // Restore to memory cache
        this.memoryCache.set(key, parsed.data)
        return parsed.data
      }
    } catch (error) {
      console.error('Cache read error:', error)
    }
    
    return null
  }

  // Set data to cache (both memory and localStorage)
  set(key, data, ttl = 60 * 60 * 1000) { // Default 1 hour
    const expiresAt = Date.now() + ttl
    const cacheItem = {
      data,
      expiresAt,
      cachedAt: Date.now()
    }

    // Store in memory
    this.memoryCache.set(key, data)

    // Store in localStorage
    try {
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem))
    } catch (error) {
      // Handle quota exceeded
      if (error.name === 'QuotaExceededError') {
        this.cleanup()
        // Try again
        try {
          localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem))
        } catch (retryError) {
          console.error('Cache write failed after cleanup:', retryError)
        }
      } else {
        console.error('Cache write error:', error)
      }
    }
  }

  // Check if key exists and not expired
  has(key) {
    return this.get(key) !== null
  }

  // Delete specific key
  delete(key) {
    this.memoryCache.delete(key)
    localStorage.removeItem(`${CACHE_PREFIX}${key}`)
  }

  // Clear all cache
  clearAll() {
    this.memoryCache.clear()
    
    // Clear localStorage items with our prefix
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  }

  // Clean up expired items
  cleanup() {
    const now = Date.now()
    const keys = Object.keys(localStorage)
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX) && key !== `${CACHE_PREFIX}version`) {
        try {
          const item = JSON.parse(localStorage.getItem(key))
          if (item.expiresAt && now > item.expiresAt) {
            localStorage.removeItem(key)
          }
        } catch {
          // Remove corrupted items
          localStorage.removeItem(key)
        }
      }
    })
  }

  // Get cache size info
  getInfo() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX))
    let totalSize = 0
    
    keys.forEach(key => {
      const item = localStorage.getItem(key)
      totalSize += item ? item.length : 0
    })
    
    return {
      itemCount: keys.length,
      memorySize: this.memoryCache.size,
      storageSize: totalSize,
      storageSizeMB: (totalSize / 1024 / 1024).toFixed(2)
    }
  }

  // Export cache (for backup)
  export() {
    const data = {}
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX))
    
    keys.forEach(key => {
      data[key] = localStorage.getItem(key)
    })
    
    return data
  }

  // Import cache (for restore)
  import(data) {
    this.clearAll()
    
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, value)
    })
  }
}

// Create singleton instance
export const marketCache = new MarketCache()

// Cache keys constants
export const CACHE_KEYS = {
  CATEGORIES: 'categories',
  CATEGORY: 'category_',
  GROUP_ITEMS: 'group_items_',
  TYPE_INFO: 'type_info_',
  SUBCATEGORIES: 'subcategories_',
  CHILDREN: 'children_'
}

// Helper functions for specific cache operations
export const cacheCategories = (categories) => {
  marketCache.set(CACHE_KEYS.CATEGORIES, categories)
}

export const getCachedCategories = () => {
  return marketCache.get(CACHE_KEYS.CATEGORIES)
}

export const cacheCategory = (categoryId, data) => {
  marketCache.set(CACHE_KEYS.CATEGORY + categoryId, data)
}

export const getCachedCategory = (categoryId) => {
  return marketCache.get(CACHE_KEYS.CATEGORY + categoryId)
}

export const cacheGroupItems = (groupId, items) => {
  marketCache.set(CACHE_KEYS.GROUP_ITEMS + groupId, items)
}

export const getCachedGroupItems = (groupId) => {
  return marketCache.get(CACHE_KEYS.GROUP_ITEMS + groupId)
}

export const cacheTypeInfo = (typeId, info) => {
  marketCache.set(CACHE_KEYS.TYPE_INFO + typeId, info)
}

export const getCachedTypeInfo = (typeId) => {
  return marketCache.get(CACHE_KEYS.TYPE_INFO + typeId)
}
