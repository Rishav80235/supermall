// Payment Processing Service
import { databaseService } from './database';
import { orderService } from './orderService';
import { cacheService } from './cacheService';
import toast from 'react-hot-toast';

class PaymentService {
  constructor() {
    this.isInitialized = false;
    this.paymentMethods = {
      CREDIT_CARD: 'credit_card',
      DEBIT_CARD: 'debit_card',
      PAYPAL: 'paypal',
      STRIPE: 'stripe',
      CASH_ON_DELIVERY: 'cash_on_delivery',
      BANK_TRANSFER: 'bank_transfer'
    };
    this.paymentStatuses = {
      PENDING: 'pending',
      PROCESSING: 'processing',
      COMPLETED: 'completed',
      FAILED: 'failed',
      CANCELLED: 'cancelled',
      REFUNDED: 'refunded'
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await databaseService.initialize();
      this.isInitialized = true;
      console.log('PaymentService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PaymentService:', error);
      throw error;
    }
  }

  // ==================== PAYMENT PROCESSING ====================

  async processPayment(paymentData) {
    if (!this.isInitialized) {
      throw new Error('PaymentService not initialized');
    }

    try {
      const payment = {
        id: this.generatePaymentId(),
        orderId: paymentData.orderId,
        customerId: paymentData.customerId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        method: paymentData.method,
        status: this.paymentStatuses.PENDING,
        paymentDetails: paymentData.paymentDetails,
        transactionId: null,
        gatewayResponse: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        processedAt: null,
        failureReason: null
      };

      // Save payment record
      const result = await databaseService.createPayment(payment);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create payment record');
      }

      // Process payment based on method
      let paymentResult;
      switch (paymentData.method) {
        case this.paymentMethods.CREDIT_CARD:
        case this.paymentMethods.DEBIT_CARD:
          paymentResult = await this.processCardPayment(paymentData);
          break;
        case this.paymentMethods.PAYPAL:
          paymentResult = await this.processPayPalPayment(paymentData);
          break;
        case this.paymentMethods.STRIPE:
          paymentResult = await this.processStripePayment(paymentData);
          break;
        case this.paymentMethods.CASH_ON_DELIVERY:
          paymentResult = await this.processCashOnDelivery(paymentData);
          break;
        case this.paymentMethods.BANK_TRANSFER:
          paymentResult = await this.processBankTransfer(paymentData);
          break;
        default:
          throw new Error('Unsupported payment method');
      }

      // Update payment record
      const updatedPayment = {
        ...payment,
        status: paymentResult.success ? this.paymentStatuses.COMPLETED : this.paymentStatuses.FAILED,
        transactionId: paymentResult.transactionId,
        gatewayResponse: paymentResult.gatewayResponse,
        processedAt: new Date().toISOString(),
        failureReason: paymentResult.failureReason,
        updatedAt: new Date().toISOString()
      };

      await databaseService.updatePayment(payment.id, updatedPayment);

      // Update order payment status
      if (paymentResult.success) {
        await orderService.updateOrderStatus(
          paymentData.orderId, 
          'confirmed', 
          'Payment completed successfully'
        );
        
        // Cache payment for quick access
        cacheService.set(`payment:${payment.id}`, updatedPayment, 24 * 60 * 60 * 1000);
        
        // Track analytics
        this.trackPaymentEvent('payment_completed', updatedPayment);
        
        toast.success('Payment completed successfully!');
      } else {
        await orderService.updateOrderStatus(
          paymentData.orderId, 
          'cancelled', 
          `Payment failed: ${paymentResult.failureReason}`
        );
        
        this.trackPaymentEvent('payment_failed', updatedPayment);
        toast.error(`Payment failed: ${paymentResult.failureReason}`);
      }

      return paymentResult;
    } catch (error) {
      console.error('Process payment error:', error);
      toast.error('Payment processing failed. Please try again.');
      throw error;
    }
  }

  // ==================== PAYMENT METHODS ====================

  async processCardPayment(paymentData) {
    try {
      // Simulate card payment processing
      // In real app, integrate with payment gateway like Stripe, Square, etc.
      
      const cardDetails = paymentData.paymentDetails;
      
      // Validate card details
      if (!this.validateCardDetails(cardDetails)) {
        return {
          success: false,
          failureReason: 'Invalid card details',
          transactionId: null
        };
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate random success/failure for demo
      const isSuccess = Math.random() > 0.1; // 90% success rate

      if (isSuccess) {
        return {
          success: true,
          transactionId: this.generateTransactionId(),
          gatewayResponse: {
            status: 'approved',
            authorizationCode: this.generateAuthCode(),
            processorResponse: '00'
          }
        };
      } else {
        return {
          success: false,
          failureReason: 'Card declined by issuer',
          transactionId: null
        };
      }
    } catch (error) {
      return {
        success: false,
        failureReason: 'Payment processing error',
        transactionId: null
      };
    }
  }

  async processPayPalPayment(paymentData) {
    try {
      // Simulate PayPal payment processing
      // In real app, integrate with PayPal SDK
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      const isSuccess = Math.random() > 0.05; // 95% success rate

      if (isSuccess) {
        return {
          success: true,
          transactionId: this.generateTransactionId(),
          gatewayResponse: {
            status: 'approved',
            paypalTransactionId: this.generatePayPalTransactionId(),
            payerId: this.generatePayerId()
          }
        };
      } else {
        return {
          success: false,
          failureReason: 'PayPal payment failed',
          transactionId: null
        };
      }
    } catch (error) {
      return {
        success: false,
        failureReason: 'PayPal processing error',
        transactionId: null
      };
    }
  }

  async processStripePayment(paymentData) {
    try {
      // Simulate Stripe payment processing
      // In real app, integrate with Stripe SDK
      
      await new Promise(resolve => setTimeout(resolve, 1800));

      const isSuccess = Math.random() > 0.08; // 92% success rate

      if (isSuccess) {
        return {
          success: true,
          transactionId: this.generateTransactionId(),
          gatewayResponse: {
            status: 'succeeded',
            stripeChargeId: this.generateStripeChargeId(),
            balanceTransaction: this.generateBalanceTransactionId()
          }
        };
      } else {
        return {
          success: false,
          failureReason: 'Stripe payment failed',
          transactionId: null
        };
      }
    } catch (error) {
      return {
        success: false,
        failureReason: 'Stripe processing error',
        transactionId: null
      };
    }
  }

  async processCashOnDelivery(paymentData) {
    try {
      // Cash on delivery - always successful
      return {
        success: true,
        transactionId: this.generateTransactionId(),
        gatewayResponse: {
          status: 'pending',
          paymentMethod: 'cash_on_delivery',
          note: 'Payment to be collected on delivery'
        }
      };
    } catch (error) {
      return {
        success: false,
        failureReason: 'Cash on delivery setup failed',
        transactionId: null
      };
    }
  }

  async processBankTransfer(paymentData) {
    try {
      // Bank transfer - always successful but pending
      return {
        success: true,
        transactionId: this.generateTransactionId(),
        gatewayResponse: {
          status: 'pending',
          paymentMethod: 'bank_transfer',
          note: 'Payment pending bank transfer confirmation'
        }
      };
    } catch (error) {
      return {
        success: false,
        failureReason: 'Bank transfer setup failed',
        transactionId: null
      };
    }
  }

  // ==================== PAYMENT VALIDATION ====================

  validateCardDetails(cardDetails) {
    if (!cardDetails) return false;

    const { cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = cardDetails;

    // Validate card number (Luhn algorithm)
    if (!this.validateCardNumber(cardNumber)) {
      return false;
    }

    // Validate expiry date
    if (!this.validateExpiryDate(expiryMonth, expiryYear)) {
      return false;
    }

    // Validate CVV
    if (!this.validateCVV(cvv, cardNumber)) {
      return false;
    }

    // Validate cardholder name
    if (!cardholderName || cardholderName.trim().length < 2) {
      return false;
    }

    return true;
  }

  validateCardNumber(cardNumber) {
    // Remove spaces and non-digits
    const cleaned = cardNumber.replace(/\D/g, '');
    
    // Check length
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  validateExpiryDate(month, year) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const expiryYear = parseInt(year);
    const expiryMonth = parseInt(month);

    if (expiryYear < currentYear) {
      return false;
    }

    if (expiryYear === currentYear && expiryMonth < currentMonth) {
      return false;
    }

    if (expiryMonth < 1 || expiryMonth > 12) {
      return false;
    }

    return true;
  }

  validateCVV(cvv, cardNumber) {
    const cleaned = cvv.replace(/\D/g, '');
    const cardType = this.getCardType(cardNumber);

    if (cardType === 'amex') {
      return cleaned.length === 4;
    } else {
      return cleaned.length === 3;
    }
  }

  getCardType(cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
    if (cleaned.startsWith('3')) return 'amex';
    if (cleaned.startsWith('6')) return 'discover';
    
    return 'unknown';
  }

  // ==================== PAYMENT MANAGEMENT ====================

  async getPayment(paymentId) {
    if (!this.isInitialized) {
      throw new Error('PaymentService not initialized');
    }

    try {
      // Check cache first
      const cached = cacheService.get(`payment:${paymentId}`);
      if (cached) {
        return cached;
      }

      const payment = await databaseService.getPayment(paymentId);
      if (payment) {
        cacheService.set(`payment:${paymentId}`, payment, 24 * 60 * 60 * 1000);
      }
      return payment;
    } catch (error) {
      console.error('Get payment error:', error);
      throw error;
    }
  }

  async getPayments(filters = {}) {
    if (!this.isInitialized) {
      throw new Error('PaymentService not initialized');
    }

    try {
      return await databaseService.getPayments(filters);
    } catch (error) {
      console.error('Get payments error:', error);
      throw error;
    }
  }

  async refundPayment(paymentId, amount = null, reason = '') {
    if (!this.isInitialized) {
      throw new Error('PaymentService not initialized');
    }

    try {
      const payment = await this.getPayment(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      const refundAmount = amount || payment.amount;
      
      // Simulate refund processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const refundResult = {
        success: true,
        refundId: this.generateRefundId(),
        amount: refundAmount,
        reason: reason
      };

      // Update payment record
      const updatedPayment = {
        ...payment,
        status: this.paymentStatuses.REFUNDED,
        updatedAt: new Date().toISOString(),
        refunds: [
          ...(payment.refunds || []),
          {
            id: refundResult.refundId,
            amount: refundAmount,
            reason: reason,
            processedAt: new Date().toISOString()
          }
        ]
      };

      await databaseService.updatePayment(paymentId, updatedPayment);
      
      // Update order status
      await orderService.refundOrder(payment.orderId, refundAmount, reason);
      
      // Update cache
      cacheService.set(`payment:${paymentId}`, updatedPayment, 24 * 60 * 60 * 1000);
      
      // Track analytics
      this.trackPaymentEvent('payment_refunded', { paymentId, amount: refundAmount, reason });
      
      toast.success('Payment refunded successfully');
      return { success: true, refund: refundResult };
    } catch (error) {
      console.error('Refund payment error:', error);
      toast.error('Failed to refund payment');
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  generatePaymentId() {
    return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateTransactionId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateAuthCode() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  generatePayPalTransactionId() {
    return `PP_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  generatePayerId() {
    return `PAYER_${Math.random().toString(36).substr(2, 10).toUpperCase()}`;
  }

  generateStripeChargeId() {
    return `ch_${Math.random().toString(36).substr(2, 24)}`;
  }

  generateBalanceTransactionId() {
    return `txn_${Math.random().toString(36).substr(2, 24)}`;
  }

  generateRefundId() {
    return `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== ANALYTICS ====================

  trackPaymentEvent(event, data) {
    const analyticsData = {
      event,
      timestamp: new Date().toISOString(),
      ...data
    };

    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', event, analyticsData);
    }

    console.log('Payment Analytics:', analyticsData);
  }

  // ==================== PAYMENT STATISTICS ====================

  async getPaymentStatistics(filters = {}) {
    if (!this.isInitialized) {
      throw new Error('PaymentService not initialized');
    }

    try {
      const payments = await this.getPayments(filters);
      
      const stats = {
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
        averageAmount: payments.length > 0 ? 
          payments.reduce((sum, payment) => sum + payment.amount, 0) / payments.length : 0,
        paymentsByMethod: {},
        paymentsByStatus: {},
        successRate: 0,
        refundRate: 0
      };

      // Calculate payments by method
      payments.forEach(payment => {
        stats.paymentsByMethod[payment.method] = 
          (stats.paymentsByMethod[payment.method] || 0) + 1;
      });

      // Calculate payments by status
      payments.forEach(payment => {
        stats.paymentsByStatus[payment.status] = 
          (stats.paymentsByStatus[payment.status] || 0) + 1;
      });

      // Calculate success rate
      const successfulPayments = payments.filter(p => p.status === this.paymentStatuses.COMPLETED).length;
      stats.successRate = payments.length > 0 ? (successfulPayments / payments.length) * 100 : 0;

      // Calculate refund rate
      const refundedPayments = payments.filter(p => p.status === this.paymentStatuses.REFUNDED).length;
      stats.refundRate = payments.length > 0 ? (refundedPayments / payments.length) * 100 : 0;

      return stats;
    } catch (error) {
      console.error('Get payment statistics error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
