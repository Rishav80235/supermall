// Mock API service for testing without Firebase
import { mockApi } from './mockData.js';

class MockApiService {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    console.log('Mock API Service initialized');
    this.initialized = true;
    return Promise.resolve();
  }

  // Shops
  async getShops() {
    return await mockApi.getShops();
  }

  async getShop(id) {
    return await mockApi.getShop(id);
  }

  async createShop(shopData) {
    return await mockApi.createShop(shopData);
  }

  async updateShop(id, shopData) {
    return await mockApi.updateShop(id, shopData);
  }

  async deleteShop(id) {
    return await mockApi.deleteShop(id);
  }

  // Products
  async getProducts() {
    return await mockApi.getProducts();
  }

  async getProductsByShop(shopId) {
    return await mockApi.getProductsByShop(shopId);
  }

  // Offers
  async getOffers() {
    return await mockApi.getOffers();
  }

  async getOffersByShop(shopId) {
    return await mockApi.getOffersByShop(shopId);
  }

  // Categories
  async getCategories() {
    return await mockApi.getCategories();
  }

  // Floors
  async getFloors() {
    return await mockApi.getFloors();
  }

  // Statistics
  async getStatistics() {
    return await mockApi.getStatistics();
  }

  // Search
  async searchShops(query) {
    const { data: shops } = await this.getShops();
    const filteredShops = shops.filter(shop => 
      shop.name.toLowerCase().includes(query.toLowerCase()) ||
      shop.category.toLowerCase().includes(query.toLowerCase()) ||
      shop.description.toLowerCase().includes(query.toLowerCase())
    );
    return { success: true, data: filteredShops };
  }

  async searchProducts(query) {
    const { data: products } = await this.getProducts();
    const filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );
    return { success: true, data: filteredProducts };
  }

  // Filter by category
  async getShopsByCategory(category) {
    const { data: shops } = await this.getShops();
    const filteredShops = shops.filter(shop => 
      shop.category.toLowerCase() === category.toLowerCase()
    );
    return { success: true, data: filteredShops };
  }

  // Filter by floor
  async getShopsByFloor(floor) {
    const { data: shops } = await this.getShops();
    const filteredShops = shops.filter(shop => 
      shop.floor.toLowerCase() === floor.toLowerCase()
    );
    return { success: true, data: filteredShops };
  }

  // ==================== E-COMMERCE METHODS ====================

  async addOrder(orderData) {
    const order = {
      ...orderData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    return { success: true, id: order.id };
  }

  async getOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders.find(order => order.id === orderId) || null;
  }

  async getOrders(filters = {}) {
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    if (filters.customerId) {
      orders = orders.filter(order => order.customerId === filters.customerId);
    }
    
    return orders;
  }

  async updateOrder(orderId, orderData) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex > -1) {
      orders[orderIndex] = { ...orders[orderIndex], ...orderData };
      localStorage.setItem('orders', JSON.stringify(orders));
      return { success: true };
    }
    
    return { success: false, message: 'Order not found' };
  }

  async addPayment(paymentData) {
    const payment = {
      ...paymentData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    payments.push(payment);
    localStorage.setItem('payments', JSON.stringify(payments));
    
    return { success: true, id: payment.id };
  }

  async getPayment(paymentId) {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    return payments.find(payment => payment.id === paymentId) || null;
  }

  async getPayments(filters = {}) {
    let payments = JSON.parse(localStorage.getItem('payments') || '[]');
    
    if (filters.customerId) {
      payments = payments.filter(payment => payment.customerId === filters.customerId);
    }
    
    return payments;
  }

  async updatePayment(paymentId, paymentData) {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const paymentIndex = payments.findIndex(payment => payment.id === paymentId);
    
    if (paymentIndex > -1) {
      payments[paymentIndex] = { ...payments[paymentIndex], ...paymentData };
      localStorage.setItem('payments', JSON.stringify(payments));
      return { success: true };
    }
    
    return { success: false, message: 'Payment not found' };
  }

  // ==================== UTILITY METHODS ====================

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Export singleton instance
export const mockApiService = new MockApiService();
