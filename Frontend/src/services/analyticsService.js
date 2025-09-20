// Advanced Analytics Service
import { databaseService } from './database';
import { orderService } from './orderService';
import { paymentService } from './paymentService';
import { cacheService } from './cacheService';

class AnalyticsService {
  constructor() {
    this.isInitialized = false;
    this.metrics = {
      pageViews: 0,
      uniqueVisitors: 0,
      conversionRate: 0,
      averageOrderValue: 0,
      totalRevenue: 0,
      topProducts: [],
      topShops: [],
      salesByMonth: [],
      userEngagement: {},
      performanceMetrics: {}
    };
    this.events = [];
    this.sessionData = {};
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await databaseService.initialize();
      this.isInitialized = true;
      this.initializeSession();
      console.log('AnalyticsService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AnalyticsService:', error);
      throw error;
    }
  }

  // ==================== SESSION MANAGEMENT ====================

  initializeSession() {
    const sessionId = this.generateSessionId();
    this.sessionData = {
      sessionId,
      startTime: new Date().toISOString(),
      pageViews: 0,
      events: [],
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    // Store session in localStorage
    localStorage.setItem('analytics_session', JSON.stringify(this.sessionData));
    
    // Track session start
    this.trackEvent('session_start', {
      sessionId,
      timestamp: new Date().toISOString()
    });
  }

  getSessionData() {
    return { ...this.sessionData };
  }

  // ==================== EVENT TRACKING ====================

  trackEvent(eventName, properties = {}) {
    const event = {
      id: this.generateEventId(),
      name: eventName,
      properties: {
        ...properties,
        sessionId: this.sessionData.sessionId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        path: window.location.pathname,
        title: document.title
      }
    };

    this.events.push(event);
    this.sessionData.events.push(event);

    // Store in localStorage
    this.saveEventsToStorage();

    // Send to analytics service
    this.sendEventToAnalytics(event);

    console.log('Analytics Event:', event);
  }

  trackPageView(pageName = null, properties = {}) {
    this.sessionData.pageViews++;
    
    this.trackEvent('page_view', {
      pageName: pageName || document.title,
      pageUrl: window.location.href,
      pagePath: window.location.pathname,
      ...properties
    });
  }

  trackUserAction(action, target = null, properties = {}) {
    this.trackEvent('user_action', {
      action,
      target,
      ...properties
    });
  }

  trackEcommerceEvent(eventType, data = {}) {
    this.trackEvent('ecommerce', {
      eventType,
      ...data
    });
  }

  trackPerformanceMetric(metricName, value, properties = {}) {
    this.trackEvent('performance', {
      metricName,
      value,
      ...properties
    });
  }

  // ==================== ECOMMERCE TRACKING ====================

  trackProductView(product) {
    this.trackEcommerceEvent('view_item', {
      itemId: product.id,
      itemName: product.name,
      itemCategory: product.category,
      itemBrand: product.brand,
      price: product.price,
      currency: 'USD'
    });
  }

  trackAddToCart(product, quantity = 1) {
    this.trackEcommerceEvent('add_to_cart', {
      itemId: product.id,
      itemName: product.name,
      itemCategory: product.category,
      itemBrand: product.brand,
      price: product.price,
      quantity,
      currency: 'USD'
    });
  }

  trackRemoveFromCart(product, quantity = 1) {
    this.trackEcommerceEvent('remove_from_cart', {
      itemId: product.id,
      itemName: product.name,
      itemCategory: product.category,
      itemBrand: product.brand,
      price: product.price,
      quantity,
      currency: 'USD'
    });
  }

  trackBeginCheckout(cartData) {
    this.trackEcommerceEvent('begin_checkout', {
      value: cartData.total,
      currency: 'USD',
      items: cartData.items.map(item => ({
        itemId: item.productId,
        itemName: item.product.name,
        itemCategory: item.product.category,
        itemBrand: item.product.brand,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }

  trackPurchase(order) {
    this.trackEcommerceEvent('purchase', {
      transactionId: order.id,
      value: order.total,
      currency: order.currency,
      tax: order.tax,
      shipping: order.shipping,
      items: order.items.map(item => ({
        itemId: item.productId,
        itemName: item.productName,
        itemCategory: item.category,
        itemBrand: item.brand,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }

  // ==================== ANALYTICS DASHBOARD ====================

  async getDashboardMetrics(timeRange = '30d') {
    if (!this.isInitialized) {
      throw new Error('AnalyticsService not initialized');
    }

    try {
      const cacheKey = `analytics_dashboard_${timeRange}`;
      const cached = cacheService.get(cacheKey);
      
      if (cached && this.isCacheValid(cached.timestamp, 5 * 60 * 1000)) { // 5 minutes
        return cached.data;
      }

      const [
        orderStats,
        paymentStats,
        productStats,
        shopStats,
        userStats,
        performanceStats
      ] = await Promise.all([
        this.getOrderAnalytics(timeRange),
        this.getPaymentAnalytics(timeRange),
        this.getProductAnalytics(timeRange),
        this.getShopAnalytics(timeRange),
        this.getUserAnalytics(timeRange),
        this.getPerformanceAnalytics(timeRange)
      ]);

      const dashboardData = {
        overview: {
          totalRevenue: orderStats.totalRevenue,
          totalOrders: orderStats.totalOrders,
          averageOrderValue: orderStats.averageOrderValue,
          conversionRate: this.calculateConversionRate(userStats, orderStats),
          totalCustomers: userStats.totalCustomers,
          totalProducts: productStats.totalProducts,
          totalShops: shopStats.totalShops
        },
        sales: {
          revenueByMonth: orderStats.revenueByMonth,
          ordersByMonth: orderStats.ordersByMonth,
          averageOrderValueByMonth: orderStats.averageOrderValueByMonth
        },
        products: {
          topSellingProducts: productStats.topSellingProducts,
          lowStockProducts: productStats.lowStockProducts,
          productCategories: productStats.categories
        },
        shops: {
          topPerformingShops: shopStats.topPerformingShops,
          shopPerformance: shopStats.performance
        },
        customers: {
          newCustomers: userStats.newCustomers,
          returningCustomers: userStats.returningCustomers,
          customerSegments: userStats.segments
        },
        payments: {
          paymentMethods: paymentStats.paymentMethods,
          successRate: paymentStats.successRate,
          refundRate: paymentStats.refundRate
        },
        performance: {
          pageLoadTimes: performanceStats.pageLoadTimes,
          apiResponseTimes: performanceStats.apiResponseTimes,
          errorRates: performanceStats.errorRates
        },
        timeRange,
        lastUpdated: new Date().toISOString()
      };

      // Cache the results
      cacheService.set(cacheKey, {
        data: dashboardData,
        timestamp: Date.now()
      }, 5 * 60 * 1000); // 5 minutes

      return dashboardData;
    } catch (error) {
      console.error('Get dashboard metrics error:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS QUERIES ====================

  async getOrderAnalytics(timeRange) {
    try {
      const orders = await orderService.getOrders();
      const filteredOrders = this.filterByTimeRange(orders, timeRange);

      const stats = {
        totalOrders: filteredOrders.length,
        totalRevenue: filteredOrders.reduce((sum, order) => sum + order.total, 0),
        averageOrderValue: filteredOrders.length > 0 ? 
          filteredOrders.reduce((sum, order) => sum + order.total, 0) / filteredOrders.length : 0,
        ordersByStatus: {},
        revenueByMonth: {},
        ordersByMonth: {},
        averageOrderValueByMonth: {}
      };

      // Calculate orders by status
      filteredOrders.forEach(order => {
        stats.ordersByStatus[order.orderStatus] = 
          (stats.ordersByStatus[order.orderStatus] || 0) + 1;
      });

      // Calculate monthly data
      filteredOrders.forEach(order => {
        const month = new Date(order.createdAt).toISOString().slice(0, 7);
        stats.revenueByMonth[month] = (stats.revenueByMonth[month] || 0) + order.total;
        stats.ordersByMonth[month] = (stats.ordersByMonth[month] || 0) + 1;
      });

      // Calculate average order value by month
      Object.keys(stats.revenueByMonth).forEach(month => {
        stats.averageOrderValueByMonth[month] = 
          stats.revenueByMonth[month] / stats.ordersByMonth[month];
      });

      return stats;
    } catch (error) {
      console.error('Get order analytics error:', error);
      return this.getDefaultOrderStats();
    }
  }

  async getPaymentAnalytics(timeRange) {
    try {
      const payments = await paymentService.getPayments();
      const filteredPayments = this.filterByTimeRange(payments, timeRange);

      const stats = {
        totalPayments: filteredPayments.length,
        totalAmount: filteredPayments.reduce((sum, payment) => sum + payment.amount, 0),
        paymentMethods: {},
        successRate: 0,
        refundRate: 0
      };

      // Calculate payments by method
      filteredPayments.forEach(payment => {
        stats.paymentMethods[payment.method] = 
          (stats.paymentMethods[payment.method] || 0) + 1;
      });

      // Calculate success rate
      const successfulPayments = filteredPayments.filter(p => p.status === 'completed').length;
      stats.successRate = filteredPayments.length > 0 ? 
        (successfulPayments / filteredPayments.length) * 100 : 0;

      // Calculate refund rate
      const refundedPayments = filteredPayments.filter(p => p.status === 'refunded').length;
      stats.refundRate = filteredPayments.length > 0 ? 
        (refundedPayments / filteredPayments.length) * 100 : 0;

      return stats;
    } catch (error) {
      console.error('Get payment analytics error:', error);
      return this.getDefaultPaymentStats();
    }
  }

  async getProductAnalytics(timeRange) {
    try {
      const products = await databaseService.getProducts();
      const orders = await orderService.getOrders();
      const filteredOrders = this.filterByTimeRange(orders, timeRange);

      const productStats = {};
      
      // Calculate product statistics
      filteredOrders.forEach(order => {
        order.items.forEach(item => {
          if (!productStats[item.productId]) {
            productStats[item.productId] = {
              id: item.productId,
              name: item.productName,
              category: item.category,
              brand: item.brand,
              totalSold: 0,
              totalRevenue: 0,
              orders: 0
            };
          }
          
          productStats[item.productId].totalSold += item.quantity;
          productStats[item.productId].totalRevenue += item.price * item.quantity;
          productStats[item.productId].orders += 1;
        });
      });

      const topSellingProducts = Object.values(productStats)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 10);

      const lowStockProducts = products
        .filter(product => product.stock < 10)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 10);

      const categories = {};
      products.forEach(product => {
        categories[product.category] = (categories[product.category] || 0) + 1;
      });

      return {
        totalProducts: products.length,
        topSellingProducts,
        lowStockProducts,
        categories
      };
    } catch (error) {
      console.error('Get product analytics error:', error);
      return this.getDefaultProductStats();
    }
  }

  async getShopAnalytics(timeRange) {
    try {
      const shops = await databaseService.getShops();
      const orders = await orderService.getOrders();
      const filteredOrders = this.filterByTimeRange(orders, timeRange);

      const shopStats = {};
      
      // Calculate shop statistics
      filteredOrders.forEach(order => {
        order.items.forEach(item => {
          if (!shopStats[item.shopId]) {
            shopStats[item.shopId] = {
              id: item.shopId,
              name: item.shopName,
              totalOrders: 0,
              totalRevenue: 0,
              totalItems: 0
            };
          }
          
          shopStats[item.shopId].totalOrders += 1;
          shopStats[item.shopId].totalRevenue += item.price * item.quantity;
          shopStats[item.shopId].totalItems += item.quantity;
        });
      });

      const topPerformingShops = Object.values(shopStats)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10);

      return {
        totalShops: shops.length,
        topPerformingShops,
        performance: shopStats
      };
    } catch (error) {
      console.error('Get shop analytics error:', error);
      return this.getDefaultShopStats();
    }
  }

  async getUserAnalytics(timeRange) {
    try {
      // This would typically come from user analytics
      // For now, we'll simulate the data
      return {
        totalCustomers: 1250,
        newCustomers: 45,
        returningCustomers: 1205,
        segments: {
          'high_value': 150,
          'regular': 800,
          'new': 300
        }
      };
    } catch (error) {
      console.error('Get user analytics error:', error);
      return this.getDefaultUserStats();
    }
  }

  async getPerformanceAnalytics(timeRange) {
    try {
      // This would come from performance monitoring
      return {
        pageLoadTimes: {
          average: 1.2,
          p95: 2.1,
          p99: 3.5
        },
        apiResponseTimes: {
          average: 250,
          p95: 500,
          p99: 1000
        },
        errorRates: {
          '4xx': 2.1,
          '5xx': 0.3
        }
      };
    } catch (error) {
      console.error('Get performance analytics error:', error);
      return this.getDefaultPerformanceStats();
    }
  }

  // ==================== UTILITY METHODS ====================

  filterByTimeRange(data, timeRange) {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return data.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= startDate;
    });
  }

  calculateConversionRate(userStats, orderStats) {
    if (userStats.totalCustomers === 0) return 0;
    return (orderStats.totalOrders / userStats.totalCustomers) * 100;
  }

  isCacheValid(timestamp, ttl) {
    return Date.now() - timestamp < ttl;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== STORAGE METHODS ====================

  saveEventsToStorage() {
    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events.slice(-1000))); // Keep last 1000 events
      localStorage.setItem('analytics_session', JSON.stringify(this.sessionData));
    } catch (error) {
      console.error('Error saving analytics to storage:', error);
    }
  }

  loadEventsFromStorage() {
    try {
      const events = localStorage.getItem('analytics_events');
      const session = localStorage.getItem('analytics_session');
      
      if (events) {
        this.events = JSON.parse(events);
      }
      
      if (session) {
        this.sessionData = JSON.parse(session);
      }
    } catch (error) {
      console.error('Error loading analytics from storage:', error);
    }
  }

  // ==================== ANALYTICS EXPORT ====================

  exportAnalytics(timeRange = '30d') {
    return {
      sessionData: this.sessionData,
      events: this.events,
      timeRange,
      exportedAt: new Date().toISOString()
    };
  }

  // ==================== DEFAULT STATS ====================

  getDefaultOrderStats() {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      ordersByStatus: {},
      revenueByMonth: {},
      ordersByMonth: {},
      averageOrderValueByMonth: {}
    };
  }

  getDefaultPaymentStats() {
    return {
      totalPayments: 0,
      totalAmount: 0,
      paymentMethods: {},
      successRate: 0,
      refundRate: 0
    };
  }

  getDefaultProductStats() {
    return {
      totalProducts: 0,
      topSellingProducts: [],
      lowStockProducts: [],
      categories: {}
    };
  }

  getDefaultShopStats() {
    return {
      totalShops: 0,
      topPerformingShops: [],
      performance: {}
    };
  }

  getDefaultUserStats() {
    return {
      totalCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0,
      segments: {}
    };
  }

  getDefaultPerformanceStats() {
    return {
      pageLoadTimes: { average: 0, p95: 0, p99: 0 },
      apiResponseTimes: { average: 0, p95: 0, p99: 0 },
      errorRates: { '4xx': 0, '5xx': 0 }
    };
  }

  // ==================== ANALYTICS SENDING ====================

  sendEventToAnalytics(event) {
    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', event.name, event.properties);
    }

    // Send to custom analytics endpoint
    this.sendToCustomAnalytics(event);
  }

  async sendToCustomAnalytics(event) {
    try {
      // This would send to your custom analytics service
      // For now, we'll just log it
      console.log('Sending to custom analytics:', event);
    } catch (error) {
      console.error('Error sending to custom analytics:', error);
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Auto-track page views
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    analyticsService.trackPageView();
  });

  // Track page changes in SPA
  let currentPath = window.location.pathname;
  setInterval(() => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      analyticsService.trackPageView();
    }
  }, 1000);
}
