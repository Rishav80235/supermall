// Shopping Cart Service
import { cacheService } from './cacheService';
import toast from 'react-hot-toast';

class CartService {
  constructor() {
    this.cartKey = 'super_mall_cart';
    this.cart = this.loadCart();
    this.listeners = new Set();
    this.maxItems = 50; // Maximum items in cart
  }

  // ==================== CART MANAGEMENT ====================

  loadCart() {
    try {
      const savedCart = localStorage.getItem(this.cartKey);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  // ==================== CART OPERATIONS ====================

  addItem(product, quantity = 1, options = {}) {
    if (!product || !product.id) {
      toast.error('Invalid product');
      return false;
    }

    if (this.cart.length >= this.maxItems) {
      toast.error(`Cart is full. Maximum ${this.maxItems} items allowed.`);
      return false;
    }

    const existingItemIndex = this.cart.findIndex(
      item => item.productId === product.id && 
      JSON.stringify(item.options) === JSON.stringify(options)
    );

    if (existingItemIndex > -1) {
      // Update existing item
      this.cart[existingItemIndex].quantity += quantity;
      
      // Check stock availability
      if (this.cart[existingItemIndex].quantity > product.stock) {
        this.cart[existingItemIndex].quantity = product.stock;
        toast.error(`Only ${product.stock} items available in stock`);
      }
    } else {
      // Add new item
      const cartItem = {
        id: this.generateCartItemId(),
        productId: product.id,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images?.[0]?.url || product.imageURL,
          brand: product.brand,
          category: product.category,
          stock: product.stock,
          shopId: product.shopId,
          shopName: product.shopName
        },
        quantity: Math.min(quantity, product.stock),
        options: options,
        addedAt: new Date().toISOString(),
        price: product.price,
        originalPrice: product.originalPrice || product.price
      };

      this.cart.push(cartItem);
    }

    this.saveCart();
    toast.success(`${product.name} added to cart`);
    return true;
  }

  removeItem(cartItemId) {
    const itemIndex = this.cart.findIndex(item => item.id === cartItemId);
    if (itemIndex > -1) {
      const item = this.cart[itemIndex];
      this.cart.splice(itemIndex, 1);
      this.saveCart();
      toast.success(`${item.product.name} removed from cart`);
      return true;
    }
    return false;
  }

  updateQuantity(cartItemId, quantity) {
    const item = this.cart.find(item => item.id === cartItemId);
    if (item) {
      if (quantity <= 0) {
        return this.removeItem(cartItemId);
      }

      if (quantity > item.product.stock) {
        toast.error(`Only ${item.product.stock} items available in stock`);
        quantity = item.product.stock;
      }

      item.quantity = quantity;
      this.saveCart();
      return true;
    }
    return false;
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    toast.success('Cart cleared');
  }

  // ==================== CART QUERIES ====================

  getCart() {
    return [...this.cart];
  }

  getCartItemCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal() {
    return this.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  getCartOriginalTotal() {
    return this.cart.reduce((total, item) => {
      return total + ((item.originalPrice || item.price) * item.quantity);
    }, 0);
  }

  getCartSavings() {
    return this.getCartOriginalTotal() - this.getCartTotal();
  }

  getCartByShop() {
    const cartByShop = {};
    this.cart.forEach(item => {
      const shopId = item.product.shopId;
      if (!cartByShop[shopId]) {
        cartByShop[shopId] = {
          shopId: shopId,
          shopName: item.product.shopName,
          items: [],
          subtotal: 0,
          originalSubtotal: 0
        };
      }
      cartByShop[shopId].items.push(item);
      cartByShop[shopId].subtotal += item.price * item.quantity;
      cartByShop[shopId].originalSubtotal += (item.originalPrice || item.price) * item.quantity;
    });
    return Object.values(cartByShop);
  }

  isInCart(productId, options = {}) {
    return this.cart.some(
      item => item.productId === productId && 
      JSON.stringify(item.options) === JSON.stringify(options)
    );
  }

  getItemQuantity(productId, options = {}) {
    const item = this.cart.find(
      item => item.productId === productId && 
      JSON.stringify(item.options) === JSON.stringify(options)
    );
    return item ? item.quantity : 0;
  }

  // ==================== CART VALIDATION ====================

  validateCart() {
    const errors = [];
    const warnings = [];

    this.cart.forEach((item, index) => {
      // Check if product still exists and is available
      if (!item.product) {
        errors.push(`Item ${index + 1}: Product no longer available`);
        return;
      }

      // Check stock availability
      if (item.quantity > item.product.stock) {
        if (item.product.stock === 0) {
          errors.push(`${item.product.name}: Out of stock`);
        } else {
          warnings.push(`${item.product.name}: Only ${item.product.stock} available, quantity adjusted`);
          item.quantity = item.product.stock;
        }
      }

      // Check if price has changed
      if (item.price !== item.product.price) {
        warnings.push(`${item.product.name}: Price updated from $${item.price} to $${item.product.price}`);
        item.price = item.product.price;
      }
    });

    if (errors.length > 0 || warnings.length > 0) {
      this.saveCart();
    }

    return { errors, warnings };
  }

  // ==================== CART PERSISTENCE ====================

  syncWithServer() {
    // This would sync cart with server for logged-in users
    const userId = this.getCurrentUserId();
    if (userId) {
      // Save cart to server
      this.saveCartToServer(userId, this.cart);
    }
  }

  loadFromServer() {
    const userId = this.getCurrentUserId();
    if (userId) {
      // Load cart from server
      return this.loadCartFromServer(userId);
    }
    return false;
  }

  // ==================== UTILITY METHODS ====================

  generateCartItemId() {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentUserId() {
    // Get current user ID from auth service
    try {
      const userData = JSON.parse(localStorage.getItem('current_user'));
      return userData?.id;
    } catch {
      return null;
    }
  }

  // ==================== EVENT LISTENERS ====================

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.getCart());
      } catch (error) {
        console.error('Error in cart listener:', error);
      }
    });
  }

  // ==================== ANALYTICS ====================

  trackCartEvent(event, data = {}) {
    const analyticsData = {
      event,
      cartItemCount: this.getCartItemCount(),
      cartTotal: this.getCartTotal(),
      timestamp: new Date().toISOString(),
      ...data
    };

    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', event, analyticsData);
    }

    console.log('Cart Analytics:', analyticsData);
  }

  // ==================== CART SUMMARY ====================

  getCartSummary() {
    const cartByShop = this.getCartByShop();
    const total = this.getCartTotal();
    const originalTotal = this.getCartOriginalTotal();
    const savings = this.getCartSavings();
    const itemCount = this.getCartItemCount();

    return {
      items: this.cart,
      cartByShop,
      itemCount,
      total,
      originalTotal,
      savings,
      discountPercentage: originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0,
      isEmpty: this.cart.length === 0,
      validation: this.validateCart()
    };
  }

  // ==================== CART EXPORT/IMPORT ====================

  exportCart() {
    return {
      items: this.cart,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  importCart(cartData) {
    if (cartData && cartData.items && Array.isArray(cartData.items)) {
      this.cart = cartData.items;
      this.saveCart();
      toast.success('Cart imported successfully');
      return true;
    }
    toast.error('Invalid cart data');
    return false;
  }
}

// Export singleton instance
export const cartService = new CartService();

// Auto-save cart every 30 seconds
setInterval(() => {
  cartService.saveCart();
}, 30000);

// Save cart before page unload
window.addEventListener('beforeunload', () => {
  cartService.saveCart();
});
