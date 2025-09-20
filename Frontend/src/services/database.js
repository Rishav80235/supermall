import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseService } from './firebase';
import { realtimeDatabaseService } from './realtimeDatabase';
import { mockApiService } from './mockApi';
import { appConfig } from '../config/firebase.config';
import toast from 'react-hot-toast';

class DatabaseService {
  constructor() {
    this.db = null;
    this.storage = null;
    this.isInitialized = false;
    this.useMockData = appConfig.useMockData;
    this.realtimeService = realtimeDatabaseService;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      if (this.useMockData) {
        await mockApiService.initialize();
        this.isInitialized = true;
        console.log('Mock API service initialized successfully');
      } else {
        // Initialize Firebase services
        await firebaseService.initialize();
        await this.realtimeService.initialize();
        
        this.db = firebaseService.getFirestore();
        this.storage = firebaseService.getStorage();
        this.isInitialized = true;
        console.log('DatabaseService with real-time features initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize database service:', error);
      throw error;
    }
  }

  // ==================== IMAGE UPLOAD ====================

  async uploadImage(file, path) {
    if (!this.isInitialized) {
      throw new Error('DatabaseService not initialized');
    }

    try {
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
      throw error;
    }
  }

  // ==================== SHOPS ====================

  async createShop(shopData, imageFile = null) {
    if (!this.isInitialized) {
      throw new Error('DatabaseService not initialized');
    }

    try {
      let imageURL = null;
      
      // Upload image if provided
      if (imageFile) {
        const imagePath = `shop-images/${Date.now()}-${imageFile.name}`;
        imageURL = await this.uploadImage(imageFile, imagePath);
      }

      const shop = {
        name: shopData.name,
        description: shopData.description,
        floorId: shopData.floorId,
        categoryId: shopData.categoryId,
        contact: shopData.contact,
        imageURL: imageURL,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(this.db, 'shops'), shop);
      
      toast.success('Shop created successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Create shop error:', error);
      toast.error('Failed to create shop');
      throw error;
    }
  }

  async getShops(filters = {}) {
    if (!this.isInitialized) {
      throw new Error('DatabaseService not initialized');
    }

    try {
      let q = query(collection(this.db, 'shops'), orderBy('createdAt', 'desc'));

      // Apply filters
      if (filters.floorId) {
        q = query(q, where('floorId', '==', filters.floorId));
      }
      if (filters.categoryId) {
        q = query(q, where('categoryId', '==', filters.categoryId));
      }
      if (filters.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      const snapshot = await getDocs(q);
      const shops = [];
      
      snapshot.forEach(doc => {
        shops.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return shops;
    } catch (error) {
      console.error('Get shops error:', error);
      toast.error('Failed to load shops');
      throw error;
    }
  }

  async getShop(shopId) {
    if (!this.isInitialized) {
      throw new Error('DatabaseService not initialized');
    }

    try {
      const docRef = doc(this.db, 'shops', shopId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Shop not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Get shop error:', error);
      toast.error('Failed to load shop');
      throw error;
    }
  }

  async updateShop(shopId, shopData, imageFile = null) {
    if (!this.isInitialized) {
      throw new Error('DatabaseService not initialized');
    }

    try {
      const updateData = {
        ...shopData,
        updatedAt: new Date()
      };

      // Upload new image if provided
      if (imageFile) {
        const imagePath = `shop-images/${Date.now()}-${imageFile.name}`;
        updateData.imageURL = await this.uploadImage(imageFile, imagePath);
      }

      const docRef = doc(this.db, 'shops', shopId);
      await updateDoc(docRef, updateData);
      
      toast.success('Shop updated successfully!');
      return shopId;
    } catch (error) {
      console.error('Update shop error:', error);
      toast.error('Failed to update shop');
      throw error;
    }
  }

  async deleteShop(shopId) {
    if (!this.isInitialized) {
      throw new Error('DatabaseService not initialized');
    }

    try {
      const docRef = doc(this.db, 'shops', shopId);
      await deleteDoc(docRef);
      
      toast.success('Shop deleted successfully!');
      return shopId;
    } catch (error) {
      console.error('Delete shop error:', error);
      toast.error('Failed to delete shop');
      throw error;
    }
  }

  // ==================== PRODUCTS ====================

  async createProduct(productData, imageFile = null) {
    if (!this.isInitialized) {
      throw new Error('DatabaseService not initialized');
    }

    try {
      let imageURL = null;
      
      // Upload image if provided
      if (imageFile) {
        const imagePath = `product-images/${Date.now()}-${imageFile.name}`;
        imageURL = await this.uploadImage(imageFile, imagePath);
      }

      const product = {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        shopId: productData.shopId,
        categoryId: productData.categoryId,
        features: productData.features || [],
        imageURL: imageURL,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(this.db, 'products'), product);
      
      toast.success('Product created successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Create product error:', error);
      toast.error('Failed to create product');
      throw error;
    }
  }

  async getProducts(filters = {}) {
    if (!this.isInitialized) {
      throw new Error('DatabaseService not initialized');
    }

    try {
      let q = query(collection(this.db, 'products'), orderBy('createdAt', 'desc'));

      // Apply filters
      if (filters.shopId) {
        q = query(q, where('shopId', '==', filters.shopId));
      }
      if (filters.categoryId) {
        q = query(q, where('categoryId', '==', filters.categoryId));
      }
      if (filters.minPrice !== undefined) {
        q = query(q, where('price', '>=', parseFloat(filters.minPrice)));
      }
      if (filters.maxPrice !== undefined) {
        q = query(q, where('price', '<=', parseFloat(filters.maxPrice)));
      }
      if (filters.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      const snapshot = await getDocs(q);
      const products = [];
      
      snapshot.forEach(doc => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return products;
    } catch (error) {
      console.error('Get products error:', error);
      toast.error('Failed to load products');
      throw error;
    }
  }

  async getProductsForComparison(productIds) {
    if (!this.isInitialized) {
      throw new Error('DatabaseService not initialized');
    }

    try {
      const products = [];
      
      for (const productId of productIds) {
        const docRef = doc(this.db, 'products', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          products.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        }
      }

      return products;
    } catch (error) {
      console.error('Get products for comparison error:', error);
      toast.error('Failed to load products for comparison');
      throw error;
    }
  }

  // ==================== OFFERS ====================

  async createOffer(offerData) {
    if (!this.isInitialized) {
      throw new Error('DatabaseService not initialized');
    }

    try {
      const offer = {
        title: offerData.title,
        description: offerData.description,
        discount: parseFloat(offerData.discount),
        shopId: offerData.shopId,
        validFrom: new Date(offerData.validFrom),
        validUntil: new Date(offerData.validUntil),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(this.db, 'offers'), offer);
      
      toast.success('Offer created successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Create offer error:', error);
      toast.error('Failed to create offer');
      throw error;
    }
  }

  async getOffers(filters = {}) {
    if (!this.isInitialized) {
      throw new Error('DatabaseService not initialized');
    }

    try {
      let q = query(collection(this.db, 'offers'), orderBy('createdAt', 'desc'));

      // Apply filters
      if (filters.shopId) {
        q = query(q, where('shopId', '==', filters.shopId));
      }
      if (filters.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      const snapshot = await getDocs(q);
      const offers = [];
      
      snapshot.forEach(doc => {
        offers.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return offers;
    } catch (error) {
      console.error('Get offers error:', error);
      toast.error('Failed to load offers');
      throw error;
    }
  }

  // ==================== CATEGORIES ====================

  async createCategory(categoryData) {
    if (!this.isInitialized) {
      throw new Error('DatabaseService not initialized');
    }

    try {
      const category = {
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(this.db, 'categories'), category);
      
      toast.success('Category created successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Create category error:', error);
      toast.error('Failed to create category');
      throw error;
    }
  }

  async getCategories() {
    if (!this.isInitialized) {
      throw new Error('DatabaseService not initialized');
    }

    try {
      const q = query(
        collection(this.db, 'categories'),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const categories = [];
      
      snapshot.forEach(doc => {
        categories.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return categories;
    } catch (error) {
      console.error('Get categories error:', error);
      toast.error('Failed to load categories');
      throw error;
    }
  }

  // ==================== FLOORS ====================

  async createFloor(floorData) {
    if (!this.isInitialized) {
      throw new Error('DatabaseService not initialized');
    }

    try {
      const floor = {
        name: floorData.name,
        description: floorData.description,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(this.db, 'floors'), floor);
      
      toast.success('Floor created successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Create floor error:', error);
      toast.error('Failed to create floor');
      throw error;
    }
  }

  async getFloors() {
    if (!this.isInitialized) {
      throw new Error('DatabaseService not initialized');
    }

    try {
      const q = query(
        collection(this.db, 'floors'),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const floors = [];
      
      snapshot.forEach(doc => {
        floors.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return floors;
    } catch (error) {
      console.error('Get floors error:', error);
      toast.error('Failed to load floors');
      throw error;
    }
  }

  // ==================== STATISTICS ====================

  async getStatistics() {
    if (!this.isInitialized) {
      throw new Error('DatabaseService not initialized');
    }

    try {
      if (this.useMockData) {
        return await mockApiService.getStatistics();
      }

      const [shopsSnapshot, offersSnapshot, productsSnapshot] = await Promise.all([
        getDocs(query(collection(this.db, 'shops'), where('isActive', '==', true))),
        getDocs(query(collection(this.db, 'offers'), where('isActive', '==', true))),
        getDocs(query(collection(this.db, 'products'), where('isActive', '==', true)))
      ]);

      const stats = {
        totalShops: shopsSnapshot.size,
        totalOffers: offersSnapshot.size,
        totalProducts: productsSnapshot.size
      };

      return stats;
    } catch (error) {
      console.error('Get statistics error:', error);
      toast.error('Failed to load statistics');
      throw error;
    }
  }

  // ==================== REAL-TIME METHODS ====================

  // Subscribe to real-time updates for shops
  subscribeToShops(callback, filters = {}) {
    if (this.useMockData) {
      // For mock data, simulate real-time updates
      const interval = setInterval(async () => {
        try {
          const shops = await mockApiService.getShops(filters);
          callback(shops);
        } catch (error) {
          console.error('Error in mock real-time subscription:', error);
        }
      }, 5000); // Update every 5 seconds
      
      return () => clearInterval(interval);
    }
    
    return this.realtimeService.subscribeToCollection('shops', callback, filters);
  }

  // Subscribe to real-time updates for products
  subscribeToProducts(callback, filters = {}) {
    if (this.useMockData) {
      const interval = setInterval(async () => {
        try {
          const products = await mockApiService.getProducts(filters);
          callback(products);
        } catch (error) {
          console.error('Error in mock real-time subscription:', error);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
    
    return this.realtimeService.subscribeToCollection('products', callback, filters);
  }

  // Subscribe to real-time updates for offers
  subscribeToOffers(callback, filters = {}) {
    if (this.useMockData) {
      const interval = setInterval(async () => {
        try {
          const offers = await mockApiService.getOffers(filters);
          callback(offers);
        } catch (error) {
          console.error('Error in mock real-time subscription:', error);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
    
    return this.realtimeService.subscribeToCollection('offers', callback, filters);
  }

  // Subscribe to real-time updates for categories
  subscribeToCategories(callback) {
    if (this.useMockData) {
      const interval = setInterval(async () => {
        try {
          const categories = await mockApiService.getCategories();
          callback(categories);
        } catch (error) {
          console.error('Error in mock real-time subscription:', error);
        }
      }, 10000); // Update every 10 seconds (categories change less frequently)
      
      return () => clearInterval(interval);
    }
    
    return this.realtimeService.subscribeToCollection('categories', callback);
  }

  // Subscribe to real-time updates for floors
  subscribeToFloors(callback) {
    if (this.useMockData) {
      const interval = setInterval(async () => {
        try {
          const floors = await mockApiService.getFloors();
          callback(floors);
        } catch (error) {
          console.error('Error in mock real-time subscription:', error);
        }
      }, 10000);
      
      return () => clearInterval(interval);
    }
    
    return this.realtimeService.subscribeToCollection('floors', callback);
  }

  // Subscribe to real-time updates for a specific document
  subscribeToDocument(collectionName, docId, callback) {
    if (this.useMockData) {
      // For mock data, we can't really subscribe to individual documents
      // Just return the current data
      return () => {};
    }
    
    return this.realtimeService.subscribeToDocument(collectionName, docId, callback);
  }

  // ==================== ENHANCED CRUD WITH REAL-TIME ====================

  async addProduct(productData) {
    if (this.useMockData) {
      return await mockApiService.addProduct(productData);
    }
    
    return await this.realtimeService.createDocument('products', productData);
  }

  async addShop(shopData) {
    if (this.useMockData) {
      return await mockApiService.addShop(shopData);
    }
    
    return await this.realtimeService.createDocument('shops', shopData);
  }

  async addOffer(offerData) {
    if (this.useMockData) {
      return await mockApiService.addOffer(offerData);
    }
    
    return await this.realtimeService.createDocument('offers', offerData);
  }

  async addCategory(categoryData) {
    if (this.useMockData) {
      return await mockApiService.addCategory(categoryData);
    }
    
    return await this.realtimeService.createDocument('categories', categoryData);
  }

  async addFloor(floorData) {
    if (this.useMockData) {
      return await mockApiService.addFloor(floorData);
    }
    
    return await this.realtimeService.createDocument('floors', floorData);
  }

  // ==================== PERFORMANCE MONITORING ====================

  getPerformanceMetrics() {
    if (this.useMockData) {
      return {
        mode: 'mock',
        cacheSize: 0,
        activeListeners: 0
      };
    }
    
    return {
      mode: 'realtime',
      ...this.realtimeService.getPerformanceMetrics()
    };
  }

  // ==================== E-COMMERCE METHODS ====================

  async createOrder(orderData) {
    if (this.useMockData) {
      return await mockApiService.addOrder(orderData);
    }
    
    return await this.realtimeService.createDocument('orders', orderData);
  }

  async getOrder(orderId) {
    if (this.useMockData) {
      return await mockApiService.getOrder(orderId);
    }
    
    return await this.realtimeService.getDocument('orders', orderId);
  }

  async getOrders(filters = {}) {
    if (this.useMockData) {
      return await mockApiService.getOrders(filters);
    }
    
    return await this.realtimeService.getCollection('orders', filters);
  }

  async updateOrder(orderId, orderData) {
    if (this.useMockData) {
      return await mockApiService.updateOrder(orderId, orderData);
    }
    
    return await this.realtimeService.updateDocument('orders', orderId, orderData);
  }

  async createPayment(paymentData) {
    if (this.useMockData) {
      return await mockApiService.addPayment(paymentData);
    }
    
    return await this.realtimeService.createDocument('payments', paymentData);
  }

  async getPayment(paymentId) {
    if (this.useMockData) {
      return await mockApiService.getPayment(paymentId);
    }
    
    return await this.realtimeService.getDocument('payments', paymentId);
  }

  async getPayments(filters = {}) {
    if (this.useMockData) {
      return await mockApiService.getPayments(filters);
    }
    
    return await this.realtimeService.getCollection('payments', filters);
  }

  async updatePayment(paymentId, paymentData) {
    if (this.useMockData) {
      return await mockApiService.updatePayment(paymentId, paymentData);
    }
    
    return await this.realtimeService.updateDocument('payments', paymentId, paymentData);
  }

  // ==================== CLEANUP ====================

  cleanup() {
    if (!this.useMockData && this.realtimeService) {
      this.realtimeService.cleanup();
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
