// Firebase Setup Utility
export const setupFirebaseConfig = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project-id",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id"
  };

  // Check if using demo config
  const isDemoConfig = config.apiKey === "demo-api-key";
  
  if (isDemoConfig) {
    console.warn('⚠️ Using demo Firebase configuration. Please set up your own Firebase project for production.');
    console.log('📝 To set up Firebase:');
    console.log('1. Go to https://console.firebase.google.com/');
    console.log('2. Create a new project');
    console.log('3. Enable Firestore, Authentication, and Storage');
    console.log('4. Copy your config to .env.local file');
    console.log('5. Set VITE_USE_MOCK_DATA=false');
  }

  return config;
};

export const validateFirebaseConfig = (config) => {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = required.filter(key => !config[key] || config[key].includes('demo-'));
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing or invalid Firebase configuration:', missing);
    return false;
  }
  
  return true;
};

export const getFirebaseSetupInstructions = () => {
  return {
    title: 'Firebase Setup Instructions',
    steps: [
      {
        step: 1,
        title: 'Create Firebase Project',
        description: 'Go to https://console.firebase.google.com/ and create a new project',
        action: 'Create Project'
      },
      {
        step: 2,
        title: 'Enable Services',
        description: 'Enable Firestore Database, Authentication, and Storage',
        services: ['Firestore', 'Authentication', 'Storage']
      },
      {
        step: 3,
        title: 'Get Configuration',
        description: 'Copy your Firebase configuration from Project Settings',
        action: 'Copy Config'
      },
      {
        step: 4,
        title: 'Update Environment',
        description: 'Create .env.local file with your Firebase configuration',
        action: 'Create .env.local'
      },
      {
        step: 5,
        title: 'Enable Real-time',
        description: 'Set VITE_USE_MOCK_DATA=false to use Firebase instead of mock data',
        action: 'Update Config'
      }
    ]
  };
};
