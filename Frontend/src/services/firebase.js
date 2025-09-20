import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { firebaseConfig, appConfig } from '../config/firebase.config';

class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.storage = null;
    this.analytics = null;
    this.isInitialized = false;
    this.isDevelopment = import.meta.env.DEV;
  }

  async initialize() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Initialize Firebase
      this.app = initializeApp(firebaseConfig);
      
      // Initialize Firebase services
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.storage = getStorage(this.app);
      
      // Initialize Analytics in production
      if (appConfig.enableAnalytics && !this.isDevelopment) {
        this.analytics = getAnalytics(this.app);
      }
      
      // Connect to emulators in development
      if (this.isDevelopment) {
        this.connectToEmulators();
      }
      
      this.isInitialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  }

  connectToEmulators() {
    try {
      // Connect to Auth emulator
      if (!this.auth._delegate._config?.emulator) {
        connectAuthEmulator(this.auth, 'http://localhost:9099');
      }
      
      // Connect to Firestore emulator
      if (!this.db._delegate._databaseId.projectId.includes('demo-')) {
        connectFirestoreEmulator(this.db, 'localhost', 8080);
      }
      
      // Connect to Storage emulator
      if (!this.storage._delegate._host.includes('localhost')) {
        connectStorageEmulator(this.storage, 'localhost', 9199);
      }
      
      console.log('Connected to Firebase emulators');
    } catch (error) {
      console.warn('Could not connect to emulators:', error);
    }
  }

  getAuth() {
    if (!this.isInitialized) {
      throw new Error('Firebase not initialized');
    }
    return this.auth;
  }

  getFirestore() {
    if (!this.isInitialized) {
      throw new Error('Firebase not initialized');
    }
    return this.db;
  }

  getStorage() {
    if (!this.isInitialized) {
      throw new Error('Firebase not initialized');
    }
    return this.storage;
  }

  getApp() {
    if (!this.isInitialized) {
      throw new Error('Firebase not initialized');
    }
    return this.app;
  }

  getAnalytics() {
    if (!this.isInitialized) {
      throw new Error('Firebase not initialized');
    }
    return this.analytics;
  }

  // Performance monitoring
  logEvent(eventName, parameters = {}) {
    if (this.analytics) {
      import('firebase/analytics').then(({ logEvent }) => {
        logEvent(this.analytics, eventName, parameters);
      });
    }
  }

  // Error tracking
  logError(error, context = {}) {
    console.error('Firebase Error:', error, context);
    this.logEvent('error_occurred', {
      error_message: error.message,
      error_code: error.code,
      ...context
    });
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
