// Request queue system to prevent spamming ESI API
class RequestQueue {
  constructor() {
    this.queue = []
    this.processing = false
    this.concurrentLimit = 3 // Max 3 requests at once
    this.requestDelay = 100 // 100ms between requests
    this.activeRequests = 0
  }

  // Add request to queue
  async add(requestFn, priority = 0) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFn,
        resolve,
        reject,
        priority,
        timestamp: Date.now()
      })
      
      // Sort by priority (higher priority first)
      this.queue.sort((a, b) => b.priority - a.priority)
      
      this.processQueue()
    })
  }

  // Process the queue
  async processQueue() {
    if (this.processing || this.activeRequests >= this.concurrentLimit) {
      return
    }

    this.processing = true

    while (this.queue.length > 0 && this.activeRequests < this.concurrentLimit) {
      const { requestFn, resolve, reject } = this.queue.shift()
      this.activeRequests++

      // Execute request with delay
      try {
        await this.delay(this.requestDelay)
        const result = await requestFn()
        resolve(result)
      } catch (error) {
        reject(error)
      } finally {
        this.activeRequests--
        // Continue processing queue
        setTimeout(() => this.processQueue(), this.requestDelay)
      }
    }

    this.processing = false
  }

  // Simple delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Clear queue
  clear() {
    this.queue = []
  }

  // Get queue status
  getStatus() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      processing: this.processing
    }
  }
}

// Create singleton instance
export const requestQueue = new RequestQueue()

// Batch request helper for multiple items
export async function batchRequest(items, requestFn, batchSize = 5, delayBetween = 200) {
  const results = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    
    // Process batch in parallel but with queue
    const batchPromises = batch.map(item => 
      requestQueue.add(() => requestFn(item), 1)
    )
    
    const batchResults = await Promise.allSettled(batchPromises)
    results.push(...batchResults)
    
    // Delay between batches
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetween))
    }
  }
  
  return results
}

// Debounced request function
export function debounceRequest(fn, delay = 300) {
  let timeoutId = null
  let lastCall = 0
  
  return function(...args) {
    const now = Date.now()
    const timeSinceLastCall = now - lastCall
    
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    // If enough time passed, execute immediately
    if (timeSinceLastCall > delay) {
      lastCall = now
      return requestQueue.add(() => fn.apply(this, args))
    }
    
    // Otherwise, debounce
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          lastCall = Date.now()
          const result = await requestQueue.add(() => fn.apply(this, args))
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay - timeSinceLastCall)
    })
  }
}
