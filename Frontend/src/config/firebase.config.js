import { setupFirebaseConfig, validateFirebaseConfig } from '../utils/setupFirebase';

// Firebase Configuration
export const firebaseConfig = setupFirebaseConfig();

// Validate configuration
export const isFirebaseConfigured = validateFirebaseConfig(firebaseConfig);

// Application Configuration
export const appConfig = {
  name: import.meta.env.VITE_APP_NAME || "Super Mall",
  version: import.meta.env.VITE_APP_VERSION || "1.0.0",
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true' || false,
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || true,
  cacheDuration: parseInt(import.meta.env.VITE_CACHE_DURATION) || 300000, // 5 minutes
  maxRetries: 3,
  retryDelay: 1000
};
