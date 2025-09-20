// Order Management Service
import { databaseService } from './database';
import { cartService } from './cartService';
import { cacheService } from './cacheService';
import toast from 'react-hot-toast';

class OrderService {
  constructor() {
    this.isInitialized = false;
    this.orderStatuses = {
      PENDING: 'pending',
      CONFIRMED: 'confirmed',
      PROCESSING: 'processing',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled',
      REFUNDED: 'refunded'
    };
    this.paymentStatuses = {
      PENDING: 'pending',
      PAID: 'paid',
      FAILED: 'failed',
      REFUNDED: 'refunded',
      PARTIALLY_REFUNDED: 'partially_refunded'
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await databaseService.initialize();
      this.isInitialized = true;
      console.log('OrderService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OrderService:', error);
      throw error;
    }
  }

  // ==================== ORDER CREATION ====================

  async createOrder(orderData) {
    if (!this.isInitialized) {
      throw new Error('OrderService not initialized');
    }

    try {
      const order = {
        id: this.generateOrderId(),
        orderNumber: this.generateOrderNumber(),
        customerId: orderData.customerId,
        customerInfo: orderData.customerInfo,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        paymentInfo: orderData.paymentInfo,
        orderStatus: this.orderStatuses.PENDING,
        paymentStatus: this.paymentStatuses.PENDING,
        subtotal: orderData.subtotal,
        tax: orderData.tax || 0,
        shipping: orderData.shipping || 0,
        discount: orderData.discount || 0,
        total: orderData.total,
        currency: orderData.currency || 'USD',
        notes: orderData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedDelivery: this.calculateEstimatedDelivery(),
        trackingNumber: null,
        orderHistory: [{
          status: this.orderStatuses.PENDING,
          timestamp: new Date().toISOString(),
          note: 'Order created'
        }]
      };

      // Save order to database
      const result = await databaseService.createOrder(order);
      
      if (result.success) {
        // Clear cart after successful order
        cartService.clearCart();
        
        // Cache order for quick access
        cacheService.set(`order:${order.id}`, order, 24 * 60 * 60 * 1000); // 24 hours
        
        // Track analytics
        this.trackOrderEvent('order_created', order);
        
        toast.success('Order placed successfully!');
        return { success: true, order };
      } else {
        throw new Error(result.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Create order error:', error);
      toast.error('Failed to create order. Please try again.');
      throw error;
    }
  }

  async createOrderFromCart(customerInfo, shippingAddress, paymentInfo) {
    const cartSummary = cartService.getCartSummary();
    
    if (cartSummary.isEmpty) {
      toast.error('Your cart is empty');
      return { success: false, message: 'Cart is empty' };
    }

    // Validate cart
    const validation = cartSummary.validation;
    if (validation.errors.length > 0) {
      toast.error('Please resolve cart issues before checkout');
      return { success: false, message: 'Cart validation failed', errors: validation.errors };
    }

    // Calculate totals
    const subtotal = cartSummary.total;
    const tax = this.calculateTax(subtotal, shippingAddress);
    const shipping = this.calculateShipping(cartSummary.cartByShop, shippingAddress);
    const discount = this.calculateDiscount(cartSummary);
    const total = subtotal + tax + shipping - discount;

    const orderData = {
      customerId: customerInfo.id,
      customerInfo: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone
      },
      items: cartSummary.items.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.image,
        quantity: item.quantity,
        price: item.price,
        originalPrice: item.originalPrice,
        options: item.options,
        shopId: item.product.shopId,
        shopName: item.product.shopName
      })),
      shippingAddress,
      billingAddress: customerInfo.billingAddress || shippingAddress,
      paymentInfo: {
        method: paymentInfo.method,
        transactionId: paymentInfo.transactionId,
        amount: total,
        currency: 'USD'
      },
      subtotal,
      tax,
      shipping,
      discount,
      total,
      currency: 'USD'
    };

    return await this.createOrder(orderData);
  }

  // ==================== ORDER MANAGEMENT ====================

  async getOrder(orderId) {
    if (!this.isInitialized) {
      throw new Error('OrderService not initialized');
    }

    try {
      // Check cache first
      const cached = cacheService.get(`order:${orderId}`);
      if (cached) {
        return cached;
      }

      const order = await databaseService.getOrder(orderId);
      if (order) {
        cacheService.set(`order:${orderId}`, order, 24 * 60 * 60 * 1000);
      }
      return order;
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  }

  async getOrders(filters = {}) {
    if (!this.isInitialized) {
      throw new Error('OrderService not initialized');
    }

    try {
      return await databaseService.getOrders(filters);
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  }

  async getCustomerOrders(customerId, filters = {}) {
    if (!this.isInitialized) {
      throw new Error('OrderService not initialized');
    }

    try {
      return await databaseService.getOrders({ ...filters, customerId });
    } catch (error) {
      console.error('Get customer orders error:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status, note = '') {
    if (!this.isInitialized) {
      throw new Error('OrderService not initialized');
    }

    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const updatedOrder = {
        ...order,
        orderStatus: status,
        updatedAt: new Date().toISOString(),
        orderHistory: [
          ...order.orderHistory,
          {
            status,
            timestamp: new Date().toISOString(),
            note
          }
        ]
      };

      const result = await databaseService.updateOrder(orderId, updatedOrder);
      
      if (result.success) {
        // Update cache
        cacheService.set(`order:${orderId}`, updatedOrder, 24 * 60 * 60 * 1000);
        
        // Track analytics
        this.trackOrderEvent('order_status_updated', { orderId, status, note });
        
        toast.success('Order status updated');
        return { success: true, order: updatedOrder };
      } else {
        throw new Error(result.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Update order status error:', error);
      toast.error('Failed to update order status');
      throw error;
    }
  }

  async cancelOrder(orderId, reason = '') {
    return await this.updateOrderStatus(orderId, this.orderStatuses.CANCELLED, reason);
  }

  async refundOrder(orderId, amount = null, reason = '') {
    if (!this.isInitialized) {
      throw new Error('OrderService not initialized');
    }

    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const refundAmount = amount || order.total;
      const updatedOrder = {
        ...order,
        paymentStatus: refundAmount < order.total ? 
          this.paymentStatuses.PARTIALLY_REFUNDED : 
          this.paymentStatuses.REFUNDED,
        updatedAt: new Date().toISOString(),
        orderHistory: [
          ...order.orderHistory,
          {
            status: this.orderStatuses.REFUNDED,
            timestamp: new Date().toISOString(),
            note: `Refunded $${refundAmount}. ${reason}`
          }
        ]
      };

      const result = await databaseService.updateOrder(orderId, updatedOrder);
      
      if (result.success) {
        cacheService.set(`order:${orderId}`, updatedOrder, 24 * 60 * 60 * 1000);
        this.trackOrderEvent('order_refunded', { orderId, amount: refundAmount, reason });
        toast.success('Order refunded successfully');
        return { success: true, order: updatedOrder };
      } else {
        throw new Error(result.message || 'Failed to refund order');
      }
    } catch (error) {
      console.error('Refund order error:', error);
      toast.error('Failed to refund order');
      throw error;
    }
  }

  // ==================== ORDER TRACKING ====================

  async addTrackingNumber(orderId, trackingNumber, carrier = '') {
    if (!this.isInitialized) {
      throw new Error('OrderService not initialized');
    }

    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const updatedOrder = {
        ...order,
        trackingNumber,
        carrier,
        updatedAt: new Date().toISOString(),
        orderHistory: [
          ...order.orderHistory,
          {
            status: order.orderStatus,
            timestamp: new Date().toISOString(),
            note: `Tracking number added: ${trackingNumber}${carrier ? ` (${carrier})` : ''}`
          }
        ]
      };

      const result = await databaseService.updateOrder(orderId, updatedOrder);
      
      if (result.success) {
        cacheService.set(`order:${orderId}`, updatedOrder, 24 * 60 * 60 * 1000);
        this.trackOrderEvent('tracking_added', { orderId, trackingNumber, carrier });
        toast.success('Tracking number added');
        return { success: true, order: updatedOrder };
      } else {
        throw new Error(result.message || 'Failed to add tracking number');
      }
    } catch (error) {
      console.error('Add tracking number error:', error);
      toast.error('Failed to add tracking number');
      throw error;
    }
  }

  // ==================== CALCULATIONS ====================

  calculateTax(subtotal, shippingAddress) {
    // Simple tax calculation - in real app, use proper tax service
    const taxRate = 0.08; // 8% tax rate
    return Math.round(subtotal * taxRate * 100) / 100;
  }

  calculateShipping(cartByShop, shippingAddress) {
    // Simple shipping calculation
    const baseShipping = 5.99;
    const perShopShipping = 2.99;
    const shopCount = cartByShop.length;
    
    return Math.round((baseShipping + (shopCount - 1) * perShopShipping) * 100) / 100;
  }

  calculateDiscount(cartSummary) {
    // Apply discounts based on cart total
    const total = cartSummary.total;
    let discount = 0;

    // 10% discount for orders over $100
    if (total >= 100) {
      discount = Math.round(total * 0.1 * 100) / 100;
    }
    // 5% discount for orders over $50
    else if (total >= 50) {
      discount = Math.round(total * 0.05 * 100) / 100;
    }

    return discount;
  }

  calculateEstimatedDelivery() {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
    return deliveryDate.toISOString();
  }

  // ==================== UTILITY METHODS ====================

  generateOrderId() {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    return `SM${year}${month}${day}${random}`;
  }

  // ==================== ANALYTICS ====================

  trackOrderEvent(event, data) {
    const analyticsData = {
      event,
      timestamp: new Date().toISOString(),
      ...data
    };

    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', event, analyticsData);
    }

    console.log('Order Analytics:', analyticsData);
  }

  // ==================== ORDER STATISTICS ====================

  async getOrderStatistics(filters = {}) {
    if (!this.isInitialized) {
      throw new Error('OrderService not initialized');
    }

    try {
      const orders = await this.getOrders(filters);
      
      const stats = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
        averageOrderValue: orders.length > 0 ? 
          orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
        ordersByStatus: {},
        ordersByMonth: {},
        topProducts: {},
        topShops: {}
      };

      // Calculate orders by status
      orders.forEach(order => {
        stats.ordersByStatus[order.orderStatus] = 
          (stats.ordersByStatus[order.orderStatus] || 0) + 1;
      });

      // Calculate orders by month
      orders.forEach(order => {
        const month = new Date(order.createdAt).toISOString().slice(0, 7);
        stats.ordersByMonth[month] = (stats.ordersByMonth[month] || 0) + 1;
      });

      // Calculate top products
      orders.forEach(order => {
        order.items.forEach(item => {
          stats.topProducts[item.productId] = {
            name: item.productName,
            quantity: (stats.topProducts[item.productId]?.quantity || 0) + item.quantity,
            revenue: (stats.topProducts[item.productId]?.revenue || 0) + (item.price * item.quantity)
          };
        });
      });

      // Calculate top shops
      orders.forEach(order => {
        order.items.forEach(item => {
          if (!stats.topShops[item.shopId]) {
            stats.topShops[item.shopId] = {
              name: item.shopName,
              orders: 0,
              revenue: 0
            };
          }
          stats.topShops[item.shopId].orders += 1;
          stats.topShops[item.shopId].revenue += item.price * item.quantity;
        });
      });

      return stats;
    } catch (error) {
      console.error('Get order statistics error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const orderService = new OrderService();
