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
  limit,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { firebaseService } from './firebase';
import { appConfig } from '../config/firebase.config';
import toast from 'react-hot-toast';

class RealtimeDatabaseService {
  constructor() {
    this.db = null;
    this.storage = null;
    this.isInitialized = false;
    this.cache = new Map();
    this.listeners = new Map();
    this.retryCount = 0;
    this.maxRetries = appConfig.maxRetries;
    this.retryDelay = appConfig.retryDelay;
    this.cacheDuration = appConfig.cacheDuration;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      this.db = firebaseService.getFirestore();
      this.storage = firebaseService.getStorage();
      this.isInitialized = true;
      
      // Enable offline persistence
      await this.enableOfflinePersistence();
      
      console.log('RealtimeDatabaseService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize realtime database service:', error);
      throw error;
    }
  }

  async enableOfflinePersistence() {
    try {
      // Enable offline persistence for better performance
      await enableNetwork(this.db);
    } catch (error) {
      console.warn('Could not enable offline persistence:', error);
    }
  }

  // ==================== CACHING SYSTEM ====================

  setCache(key, data, ttl = this.cacheDuration) {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      ttl
    };
    this.cache.set(key, cacheItem);
  }

  getCache(key) {
    const cacheItem = this.cache.get(key);
    if (!cacheItem) return null;

    const isExpired = Date.now() - cacheItem.timestamp > cacheItem.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cacheItem.data;
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // ==================== REAL-TIME LISTENERS ====================

  subscribeToCollection(collectionName, callback, filters = {}) {
    if (!this.isInitialized) {
      throw new Error('RealtimeDatabaseService not initialized');
    }

    const cacheKey = `${collectionName}_${JSON.stringify(filters)}`;
    
    // Return cached data immediately if available
    const cachedData = this.getCache(cacheKey);
    if (cachedData) {
      callback(cachedData);
    }

    try {
      let q = query(collection(this.db, collectionName), orderBy('createdAt', 'desc'));

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          q = query(q, where(key, '==', value));
        }
      });

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = [];
          snapshot.forEach(doc => {
            data.push({
              id: doc.id,
              ...doc.data()
            });
          });

          // Update cache
          this.setCache(cacheKey, data);
          
          // Call callback with new data
          callback(data);
        },
        (error) => {
          console.error(`Error listening to ${collectionName}:`, error);
          this.handleError(error, { collection: collectionName, filters });
        }
      );

      // Store listener for cleanup
      this.listeners.set(cacheKey, unsubscribe);
      
      return unsubscribe;
    } catch (error) {
      console.error(`Error setting up listener for ${collectionName}:`, error);
      this.handleError(error, { collection: collectionName, filters });
      throw error;
    }
  }

  subscribeToDocument(collectionName, docId, callback) {
    if (!this.isInitialized) {
      throw new Error('RealtimeDatabaseService not initialized');
    }

    const cacheKey = `${collectionName}_${docId}`;
    
    // Return cached data immediately if available
    const cachedData = this.getCache(cacheKey);
    if (cachedData) {
      callback(cachedData);
    }

    try {
      const docRef = doc(this.db, collectionName, docId);
      
      const unsubscribe = onSnapshot(
        docRef,
        (doc) => {
          if (doc.exists()) {
            const data = {
              id: doc.id,
              ...doc.data()
            };

            // Update cache
            this.setCache(cacheKey, data);
            
            // Call callback with new data
            callback(data);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error(`Error listening to document ${docId}:`, error);
          this.handleError(error, { collection: collectionName, docId });
        }
      );

      // Store listener for cleanup
      this.listeners.set(cacheKey, unsubscribe);
      
      return unsubscribe;
    } catch (error) {
      console.error(`Error setting up document listener for ${docId}:`, error);
      this.handleError(error, { collection: collectionName, docId });
      throw error;
    }
  }

  // ==================== BATCH OPERATIONS ====================

  async batchWrite(operations) {
    if (!this.isInitialized) {
      throw new Error('RealtimeDatabaseService not initialized');
    }

    try {
      const batch = writeBatch(this.db);
      
      operations.forEach(operation => {
        const { type, collection, docId, data } = operation;
        const docRef = doc(this.db, collection, docId);
        
        switch (type) {
          case 'set':
            batch.set(docRef, { ...data, updatedAt: serverTimestamp() });
            break;
          case 'update':
            batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      });

      await batch.commit();
      
      // Clear related cache
      operations.forEach(operation => {
        this.clearCache(operation.collection);
      });
      
      toast.success('Batch operation completed successfully');
    } catch (error) {
      console.error('Batch write error:', error);
      this.handleError(error, { operations });
      throw error;
    }
  }

  // ==================== IMAGE MANAGEMENT ====================

  async uploadImage(file, path, onProgress = null) {
    if (!this.isInitialized) {
      throw new Error('RealtimeDatabaseService not initialized');
    }

    try {
      const storageRef = ref(this.storage, path);
      
      // Upload with progress tracking
      const uploadTask = uploadBytes(storageRef, file);
      
      if (onProgress) {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          }
        );
      }
      
      const snapshot = await uploadTask;
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Image upload error:', error);
      this.handleError(error, { path, fileName: file.name });
      throw error;
    }
  }

  async deleteImage(imagePath) {
    if (!this.isInitialized) {
      throw new Error('RealtimeDatabaseService not initialized');
    }

    try {
      const imageRef = ref(this.storage, imagePath);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Image deletion error:', error);
      this.handleError(error, { imagePath });
      throw error;
    }
  }

  // ==================== CRUD OPERATIONS WITH REAL-TIME ====================

  async createDocument(collectionName, data, options = {}) {
    if (!this.isInitialized) {
      throw new Error('RealtimeDatabaseService not initialized');
    }

    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(this.db, collectionName), docData);
      
      // Clear cache for this collection
      this.clearCache(collectionName);
      
      // Log analytics event
      firebaseService.logEvent('document_created', {
        collection: collectionName,
        document_id: docRef.id
      });
      
      toast.success(`${collectionName.slice(0, -1)} created successfully!`);
      return docRef.id;
    } catch (error) {
      console.error(`Create ${collectionName} error:`, error);
      this.handleError(error, { collection: collectionName, data });
      throw error;
    }
  }

  async updateDocument(collectionName, docId, data) {
    if (!this.isInitialized) {
      throw new Error('RealtimeDatabaseService not initialized');
    }

    try {
      const docRef = doc(this.db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      // Clear cache for this document and collection
      this.clearCache(`${collectionName}_${docId}`);
      this.clearCache(collectionName);
      
      // Log analytics event
      firebaseService.logEvent('document_updated', {
        collection: collectionName,
        document_id: docId
      });
      
      toast.success(`${collectionName.slice(0, -1)} updated successfully!`);
      return docId;
    } catch (error) {
      console.error(`Update ${collectionName} error:`, error);
      this.handleError(error, { collection: collectionName, docId, data });
      throw error;
    }
  }

  async deleteDocument(collectionName, docId) {
    if (!this.isInitialized) {
      throw new Error('RealtimeDatabaseService not initialized');
    }

    try {
      const docRef = doc(this.db, collectionName, docId);
      await deleteDoc(docRef);
      
      // Clear cache for this document and collection
      this.clearCache(`${collectionName}_${docId}`);
      this.clearCache(collectionName);
      
      // Log analytics event
      firebaseService.logEvent('document_deleted', {
        collection: collectionName,
        document_id: docId
      });
      
      toast.success(`${collectionName.slice(0, -1)} deleted successfully!`);
      return docId;
    } catch (error) {
      console.error(`Delete ${collectionName} error:`, error);
      this.handleError(error, { collection: collectionName, docId });
      throw error;
    }
  }

  // ==================== ERROR HANDLING & RETRY LOGIC ====================

  async handleError(error, context = {}) {
    console.error('Database Error:', error, context);
    
    // Log error to analytics
    firebaseService.logError(error, context);
    
    // Implement retry logic for network errors
    if (this.shouldRetry(error)) {
      await this.retryOperation(error, context);
    } else {
      toast.error(this.getErrorMessage(error));
    }
  }

  shouldRetry(error) {
    const retryableErrors = [
      'unavailable',
      'deadline-exceeded',
      'resource-exhausted',
      'aborted',
      'internal'
    ];
    
    return retryableErrors.some(code => error.code?.includes(code)) && 
           this.retryCount < this.maxRetries;
  }

  async retryOperation(error, context) {
    this.retryCount++;
    const delay = this.retryDelay * Math.pow(2, this.retryCount - 1);
    
    console.log(`Retrying operation in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Reset retry count on success
    this.retryCount = 0;
  }

  getErrorMessage(error) {
    const errorMessages = {
      'permission-denied': 'You do not have permission to perform this action',
      'not-found': 'The requested resource was not found',
      'already-exists': 'This resource already exists',
      'failed-precondition': 'The operation failed due to a precondition',
      'unavailable': 'Service is temporarily unavailable. Please try again.',
      'unauthenticated': 'Please log in to continue',
      'network-request-failed': 'Network error. Please check your connection.'
    };
    
    return errorMessages[error.code] || 'An unexpected error occurred. Please try again.';
  }

  // ==================== CLEANUP ====================

  cleanup() {
    // Unsubscribe from all listeners
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
    
    // Clear cache
    this.cache.clear();
    
    console.log('RealtimeDatabaseService cleaned up');
  }

  // ==================== PERFORMANCE MONITORING ====================

  getPerformanceMetrics() {
    return {
      cacheSize: this.cache.size,
      activeListeners: this.listeners.size,
      retryCount: this.retryCount
    };
  }
}

// Export singleton instance
export const realtimeDatabaseService = new RealtimeDatabaseService();
