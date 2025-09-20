// Advanced Caching Service with TTL and LRU eviction
class CacheService {
  constructor() {
    this.cache = new Map();
    this.accessTimes = new Map();
    this.maxSize = 1000; // Maximum number of items
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
    this.cleanupInterval = 60 * 1000; // Cleanup every minute
    this.isCleanupRunning = false;
    
    this.startCleanup();
  }

  // ==================== CORE CACHING METHODS ====================

  set(key, value, ttl = this.defaultTTL) {
    const now = Date.now();
    const expiresAt = now + ttl;
    
    // Remove old entry if exists
    if (this.cache.has(key)) {
      this.delete(key);
    }
    
    // Check if we need to evict items
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    // Store the item
    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: now
    });
    
    this.accessTimes.set(key, now);
    
    return true;
  }

  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }
    
    const item = this.cache.get(key);
    const now = Date.now();
    
    // Check if expired
    if (now > item.expiresAt) {
      this.delete(key);
      return null;
    }
    
    // Update access time
    this.accessTimes.set(key, now);
    
    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.cache.delete(key);
    this.accessTimes.delete(key);
    return true;
  }

  clear() {
    this.cache.clear();
    this.accessTimes.clear();
  }

  // ==================== ADVANCED CACHING METHODS ====================

  // Get or set pattern
  async getOrSet(key, fetchFunction, ttl = this.defaultTTL) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const value = await fetchFunction();
      this.set(key, value, ttl);
      return value;
    } catch (error) {
      console.error('Error in getOrSet:', error);
      throw error;
    }
  }

  // Batch operations
  mget(keys) {
    const results = {};
    keys.forEach(key => {
      results[key] = this.get(key);
    });
    return results;
  }

  mset(items, ttl = this.defaultTTL) {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key, value, ttl);
    });
    return true;
  }

  // Pattern-based operations
  keys(pattern = null) {
    const allKeys = Array.from(this.cache.keys());
    if (!pattern) return allKeys;
    
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return allKeys.filter(key => regex.test(key));
  }

  // Clear by pattern
  clearPattern(pattern) {
    const keysToDelete = this.keys(pattern);
    keysToDelete.forEach(key => this.delete(key));
    return keysToDelete.length;
  }

  // ==================== TTL MANAGEMENT ====================

  // Extend TTL
  extendTTL(key, additionalTTL) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    item.expiresAt += additionalTTL;
    return true;
  }

  // Set TTL
  setTTL(key, ttl) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    item.expiresAt = Date.now() + ttl;
    return true;
  }

  // Get remaining TTL
  getTTL(key) {
    const item = this.cache.get(key);
    if (!item) return -1;
    
    const remaining = item.expiresAt - Date.now();
    return Math.max(0, remaining);
  }

  // ==================== LRU EVICTION ====================

  evictLRU() {
    if (this.cache.size === 0) return;
    
    // Find least recently used item
    let oldestKey = null;
    let oldestTime = Infinity;
    
    this.accessTimes.forEach((time, key) => {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    });
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  // ==================== CLEANUP ====================

  startCleanup() {
    if (this.isCleanupRunning) return;
    
    this.isCleanupRunning = true;
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.isCleanupRunning = false;
  }

  cleanup() {
    const now = Date.now();
    const expiredKeys = [];
    
    this.cache.forEach((item, key) => {
      if (now > item.expiresAt) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => this.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired cache items`);
    }
  }

  // ==================== STATISTICS ====================

  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let totalSize = 0;
    
    this.cache.forEach((item, key) => {
      if (now > item.expiresAt) {
        expiredCount++;
      }
      totalSize += this.getItemSize(item);
    });
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expiredCount,
      totalSize: this.formatBytes(totalSize),
      hitRate: this.calculateHitRate(),
      oldestItem: this.getOldestItem(),
      newestItem: this.getNewestItem()
    };
  }

  getItemSize(item) {
    try {
      return JSON.stringify(item.value).length * 2; // Rough estimate
    } catch {
      return 0;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getOldestItem() {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    this.accessTimes.forEach((time, key) => {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    });
    
    return oldestKey ? {
      key: oldestKey,
      age: Date.now() - oldestTime
    } : null;
  }

  getNewestItem() {
    let newestKey = null;
    let newestTime = 0;
    
    this.accessTimes.forEach((time, key) => {
      if (time > newestTime) {
        newestTime = time;
        newestKey = key;
      }
    });
    
    return newestKey ? {
      key: newestKey,
      age: Date.now() - newestTime
    } : null;
  }

  // Hit rate calculation (simplified)
  calculateHitRate() {
    // This would need to track hits/misses over time
    // For now, return a placeholder
    return 'N/A';
  }

  // ==================== SPECIALIZED CACHES ====================

  // API response cache
  cacheApiResponse(endpoint, params, response, ttl = 5 * 60 * 1000) {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    this.set(key, {
      data: response,
      timestamp: Date.now(),
      endpoint,
      params
    }, ttl);
  }

  getCachedApiResponse(endpoint, params) {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    const cached = this.get(key);
    return cached ? cached.data : null;
  }

  // User data cache
  cacheUserData(userId, data, ttl = 10 * 60 * 1000) {
    const key = `user:${userId}`;
    this.set(key, {
      ...data,
      cachedAt: Date.now()
    }, ttl);
  }

  getCachedUserData(userId) {
    const key = `user:${userId}`;
    return this.get(key);
  }

  // Product cache
  cacheProduct(productId, product, ttl = 15 * 60 * 1000) {
    const key = `product:${productId}`;
    this.set(key, {
      ...product,
      cachedAt: Date.now()
    }, ttl);
  }

  getCachedProduct(productId) {
    const key = `product:${productId}`;
    return this.get(key);
  }

  // Shop cache
  cacheShop(shopId, shop, ttl = 15 * 60 * 1000) {
    const key = `shop:${shopId}`;
    this.set(key, {
      ...shop,
      cachedAt: Date.now()
    }, ttl);
  }

  getCachedShop(shopId) {
    const key = `shop:${shopId}`;
    return this.get(key);
  }

  // ==================== PERSISTENCE ====================

  // Save to localStorage
  persist() {
    try {
      const data = {
        cache: Array.from(this.cache.entries()),
        accessTimes: Array.from(this.accessTimes.entries()),
        timestamp: Date.now()
      };
      
      localStorage.setItem('app_cache', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error persisting cache:', error);
      return false;
    }
  }

  // Load from localStorage
  restore() {
    try {
      const data = localStorage.getItem('app_cache');
      if (!data) return false;
      
      const parsed = JSON.parse(data);
      const now = Date.now();
      
      // Only restore if cache is less than 1 hour old
      if (now - parsed.timestamp > 60 * 60 * 1000) {
        localStorage.removeItem('app_cache');
        return false;
      }
      
      this.cache = new Map(parsed.cache);
      this.accessTimes = new Map(parsed.accessTimes);
      
      // Clean up expired items
      this.cleanup();
      
      return true;
    } catch (error) {
      console.error('Error restoring cache:', error);
      localStorage.removeItem('app_cache');
      return false;
    }
  }

  // ==================== DESTRUCTION ====================

  destroy() {
    this.stopCleanup();
    this.clear();
    localStorage.removeItem('app_cache');
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Auto-restore cache on initialization
cacheService.restore();

// Auto-persist cache every 5 minutes
setInterval(() => {
  cacheService.persist();
}, 5 * 60 * 1000);

// Persist cache before page unload
window.addEventListener('beforeunload', () => {
  cacheService.persist();
});
