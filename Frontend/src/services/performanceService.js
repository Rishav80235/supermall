// Performance Optimization Service
class PerformanceService {
  constructor() {
    this.metrics = {
      pageLoadTimes: [],
      apiResponseTimes: [],
      renderTimes: [],
      memoryUsage: [],
      networkRequests: []
    };
    this.observers = new Map();
    this.isMonitoring = false;
    this.thresholds = {
      slowPageLoad: 3000, // 3 seconds
      slowApiResponse: 2000, // 2 seconds
      slowRender: 100, // 100ms
      highMemoryUsage: 50 * 1024 * 1024 // 50MB
    };
  }

  // ==================== INITIALIZATION ====================

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.observePerformance();
    this.observeMemory();
    this.observeNetwork();
    
    console.log('Performance monitoring started');
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    console.log('Performance monitoring stopped');
  }

  // ==================== PERFORMANCE OBSERVATION ====================

  observePerformance() {
    if (!('PerformanceObserver' in window)) return;

    // Observe navigation timing
    const navObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'navigation') {
          this.recordPageLoadTime(entry.loadEventEnd - entry.loadEventStart);
        }
      });
    });
    
    navObserver.observe({ entryTypes: ['navigation'] });
    this.observers.set('navigation', navObserver);

    // Observe paint timing
    const paintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.recordRenderTime(entry.startTime, 'first-contentful-paint');
        }
        if (entry.name === 'largest-contentful-paint') {
          this.recordRenderTime(entry.startTime, 'largest-contentful-paint');
        }
      });
    });
    
    paintObserver.observe({ entryTypes: ['paint'] });
    this.observers.set('paint', paintObserver);

    // Observe long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn('Long task detected:', entry.duration + 'ms');
          this.recordLongTask(entry.duration);
        }
      });
    });
    
    longTaskObserver.observe({ entryTypes: ['longtask'] });
    this.observers.set('longtask', longTaskObserver);
  }

  observeMemory() {
    if (!('memory' in performance)) return;

    const checkMemory = () => {
      const memory = performance.memory;
      if (memory) {
        this.recordMemoryUsage(memory.usedJSHeapSize);
        
        if (memory.usedJSHeapSize > this.thresholds.highMemoryUsage) {
          console.warn('High memory usage detected:', this.formatBytes(memory.usedJSHeapSize));
          this.triggerMemoryCleanup();
        }
      }
    };

    // Check memory every 30 seconds
    const memoryInterval = setInterval(checkMemory, 30000);
    this.observers.set('memory', { disconnect: () => clearInterval(memoryInterval) });
  }

  observeNetwork() {
    if (!('PerformanceObserver' in window)) return;

    const networkObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'resource') {
          this.recordNetworkRequest(entry);
        }
      });
    });
    
    networkObserver.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', networkObserver);
  }

  // ==================== METRIC RECORDING ====================

  recordPageLoadTime(loadTime) {
    this.metrics.pageLoadTimes.push({
      time: loadTime,
      timestamp: Date.now()
    });

    if (loadTime > this.thresholds.slowPageLoad) {
      console.warn('Slow page load detected:', loadTime + 'ms');
    }

    // Keep only last 50 measurements
    if (this.metrics.pageLoadTimes.length > 50) {
      this.metrics.pageLoadTimes.shift();
    }
  }

  recordApiResponseTime(responseTime, endpoint) {
    this.metrics.apiResponseTimes.push({
      time: responseTime,
      endpoint,
      timestamp: Date.now()
    });

    if (responseTime > this.thresholds.slowApiResponse) {
      console.warn('Slow API response detected:', endpoint, responseTime + 'ms');
    }

    // Keep only last 100 measurements
    if (this.metrics.apiResponseTimes.length > 100) {
      this.metrics.apiResponseTimes.shift();
    }
  }

  recordRenderTime(renderTime, type) {
    this.metrics.renderTimes.push({
      time: renderTime,
      type,
      timestamp: Date.now()
    });

    if (renderTime > this.thresholds.slowRender) {
      console.warn('Slow render detected:', type, renderTime + 'ms');
    }

    // Keep only last 50 measurements
    if (this.metrics.renderTimes.length > 50) {
      this.metrics.renderTimes.shift();
    }
  }

  recordMemoryUsage(memoryUsage) {
    this.metrics.memoryUsage.push({
      usage: memoryUsage,
      timestamp: Date.now()
    });

    // Keep only last 100 measurements
    if (this.metrics.memoryUsage.length > 100) {
      this.metrics.memoryUsage.shift();
    }
  }

  recordNetworkRequest(entry) {
    this.metrics.networkRequests.push({
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      timestamp: Date.now()
    });

    // Keep only last 200 measurements
    if (this.metrics.networkRequests.length > 200) {
      this.metrics.networkRequests.shift();
    }
  }

  recordLongTask(duration) {
    console.warn('Long task detected:', duration + 'ms');
    // Could trigger performance optimizations here
  }

  // ==================== PERFORMANCE OPTIMIZATIONS ====================

  // Debounce function calls
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function calls
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Lazy load images
  lazyLoadImages() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // Preload critical resources
  preloadCriticalResources(resources) {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as || 'script';
      if (resource.crossorigin) {
        link.crossOrigin = resource.crossorigin;
      }
      document.head.appendChild(link);
    });
  }

  // Optimize images
  optimizeImage(img, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    });
  }

  // Memory cleanup
  triggerMemoryCleanup() {
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }

    // Clear unused caches
    this.clearUnusedCaches();
    
    console.log('Memory cleanup triggered');
  }

  clearUnusedCaches() {
    // Clear old performance metrics
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    Object.keys(this.metrics).forEach(key => {
      this.metrics[key] = this.metrics[key].filter(item => 
        now - item.timestamp < maxAge
      );
    });
  }

  // ==================== ANALYTICS ====================

  getPerformanceReport() {
    const report = {
      pageLoad: this.getAverageMetric('pageLoadTimes'),
      apiResponse: this.getAverageMetric('apiResponseTimes'),
      render: this.getAverageMetric('renderTimes'),
      memory: this.getAverageMetric('memoryUsage'),
      network: this.getNetworkStats(),
      recommendations: this.getRecommendations()
    };

    return report;
  }

  getAverageMetric(metricName) {
    const metrics = this.metrics[metricName];
    if (!metrics.length) return null;

    const values = metrics.map(m => m.time || m.usage || m.duration);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return {
      average: Math.round(average),
      max: Math.round(max),
      min: Math.round(min),
      count: metrics.length
    };
  }

  getNetworkStats() {
    const requests = this.metrics.networkRequests;
    if (!requests.length) return null;

    const totalSize = requests.reduce((sum, req) => sum + (req.size || 0), 0);
    const averageDuration = requests.reduce((sum, req) => sum + req.duration, 0) / requests.length;

    return {
      totalRequests: requests.length,
      totalSize: this.formatBytes(totalSize),
      averageDuration: Math.round(averageDuration)
    };
  }

  getRecommendations() {
    const recommendations = [];
    const report = this.getPerformanceReport();

    if (report.pageLoad && report.pageLoad.average > this.thresholds.slowPageLoad) {
      recommendations.push('Consider optimizing page load time with code splitting and lazy loading');
    }

    if (report.apiResponse && report.apiResponse.average > this.thresholds.slowApiResponse) {
      recommendations.push('API responses are slow. Consider implementing caching or optimizing queries');
    }

    if (report.memory && report.memory.average > this.thresholds.highMemoryUsage) {
      recommendations.push('High memory usage detected. Consider implementing memory cleanup strategies');
    }

    if (report.render && report.render.average > this.thresholds.slowRender) {
      recommendations.push('Render times are slow. Consider optimizing React components and reducing re-renders');
    }

    return recommendations;
  }

  // ==================== UTILITY METHODS ====================

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Measure function execution time
  measureExecutionTime(func, name) {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    
    this.recordApiResponseTime(end - start, name);
    return result;
  }

  // Async version
  async measureAsyncExecutionTime(asyncFunc, name) {
    const start = performance.now();
    const result = await asyncFunc();
    const end = performance.now();
    
    this.recordApiResponseTime(end - start, name);
    return result;
  }

  // ==================== REACT OPTIMIZATIONS ====================

  // Memoization helper for React components
  createMemoizedComponent(Component, areEqual) {
    return React.memo(Component, areEqual);
  }

  // Virtual scrolling helper
  createVirtualScroll(items, itemHeight, containerHeight) {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = 0;
    const endIndex = Math.min(startIndex + visibleCount, items.length);
    
    return {
      visibleItems: items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      totalHeight: items.length * itemHeight
    };
  }
}

// Export singleton instance
export const performanceService = new PerformanceService();

// Auto-start monitoring in development
if (import.meta.env.DEV) {
  performanceService.startMonitoring();
}
