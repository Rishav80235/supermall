// Mock Auth Service for testing without Firebase
import toast from 'react-hot-toast';

class MockAuthService {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.authStateListeners = [];
    this.users = new Map(); // Store users in memory
    this.nextUserId = 1;
    this.storageKey = 'supermall_users';
    this.loadUsersFromStorage();
  }

  // Load users from localStorage
  loadUsersFromStorage() {
    try {
      const storedUsers = localStorage.getItem(this.storageKey);
      if (storedUsers) {
        const usersData = JSON.parse(storedUsers);
        this.users = new Map(usersData);
        // Find the highest user ID
        let maxId = 0;
        for (const [email, userRecord] of this.users.entries()) {
          const userId = parseInt(userRecord.user.uid.split('_').pop());
          if (userId > maxId) maxId = userId;
        }
        this.nextUserId = maxId + 1;
      }
    } catch (error) {
      console.error('Error loading users from storage:', error);
    }
  }

  // Save users to localStorage
  saveUsersToStorage() {
    try {
      const usersArray = Array.from(this.users.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(usersArray));
    } catch (error) {
      console.error('Error saving users to storage:', error);
    }
  }

  initialize() {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;
    
    // Add some test users if no users exist
    if (this.users.size === 0) {
      this.addTestUser('admin@supermall.com', 'admin123', {
        name: 'Admin User',
        role: 'admin',
        userType: 'admin',
        phone: '+1234567890',
        company: 'Super Mall Inc.'
      });

      this.addTestUser('customer@supermall.com', 'customer123', {
        name: 'Customer User',
        role: 'user',
        userType: 'user',
        phone: '+1234567891',
        company: ''
      });
    }

    console.log('Mock Auth service initialized successfully');
  }

  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  async signUp(userData) {
    if (!this.isInitialized) {
      throw new Error('MockAuthService not initialized');
    }

    try {
      const { email, password, name, userType, phone, company } = userData;
      
      // Check if user already exists
      if (this.users.has(email)) {
        return { success: false, message: 'User already exists with this email' };
      }

      // Create mock user
      const userId = `mock_user_${this.nextUserId++}`;
      const mockUser = {
        uid: userId,
        email: email,
        displayName: name,
        emailVerified: true,
        isAnonymous: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      };

      // Create user data document
      const userDocData = {
        uid: userId,
        email: email,
        displayName: name,
        name: name,
        role: userType === 'admin' ? 'admin' : 'user',
        userType: userType,
        phone: phone,
        company: company || '',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isActive: true
      };

      // Store user
      this.users.set(email, { user: mockUser, userData: userDocData });
      
      // Save to localStorage
      this.saveUsersToStorage();
      
      // Set current user
      this.currentUser = mockUser;
      
      // Notify listeners
      this.authStateListeners.forEach(listener => {
        try {
          listener(mockUser);
        } catch (error) {
          console.error('Error in auth state listener:', error);
        }
      });

      console.log('User created successfully:', { uid: userId, userType, role: userDocData.role });
      return { success: true, user: mockUser, userData: userDocData };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, message: error.message || 'Failed to create account' };
    }
  }

  async signIn(email, password) {
    if (!this.isInitialized) {
      throw new Error('MockAuthService not initialized');
    }

    try {
      // Check if user exists
      const userRecord = this.users.get(email);
      if (!userRecord) {
        return { success: false, message: 'User not found. Please sign up first.' };
      }

      const { user, userData } = userRecord;
      
      // In a real app, you would verify the password here
      // For this mock, we'll just check if the user exists
      
      // Update last login time
      userData.lastLoginAt = new Date();
      
      // Save updated data to localStorage
      this.saveUsersToStorage();
      
      // Set current user
      this.currentUser = user;
      
      // Notify listeners
      this.authStateListeners.forEach(listener => {
        try {
          listener(user);
        } catch (error) {
          console.error('Error in auth state listener:', error);
        }
      });

      console.log('User signed in successfully:', { uid: user.uid, role: userData?.role, userType: userData?.userType });
      return { success: true, user, userData };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, message: error.message || 'Login failed' };
    }
  }

  async signOut() {
    if (!this.isInitialized) return;

    try {
      this.currentUser = null;
      
      // Notify listeners
      this.authStateListeners.forEach(listener => {
        try {
          listener(null);
        } catch (error) {
          console.error('Error in auth state listener:', error);
        }
      });

      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Logout failed');
      throw error;
    }
  }

  async isAdmin(uid) {
    if (!this.isInitialized) {
      return false;
    }

    try {
      // Find user by uid
      for (const [email, userRecord] of this.users.entries()) {
        if (userRecord.user.uid === uid) {
          return userRecord.userData.role === 'admin';
        }
      }
      return false;
    } catch (error) {
      console.error('Check admin status error:', error);
      return false;
    }
  }

  async getCurrentUserData() {
    if (!this.currentUser) return null;

    try {
      // Find user data by current user's email
      for (const [email, userRecord] of this.users.entries()) {
        if (userRecord.user.uid === this.currentUser.uid) {
          return userRecord.userData;
        }
      }
      return null;
    } catch (error) {
      console.error('Get current user data error:', error);
      return null;
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  // Helper method to add test users
  addTestUser(email, password, userData) {
    const userId = `mock_user_${this.nextUserId++}`;
    const mockUser = {
      uid: userId,
      email: email,
      displayName: userData.name || email,
      emailVerified: true,
      isAnonymous: false,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      }
    };

    const userDocData = {
      uid: userId,
      email: email,
      displayName: userData.name || email,
      name: userData.name || email,
      role: userData.role || 'user',
      userType: userData.userType || 'user',
      phone: userData.phone || '',
      company: userData.company || '',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true
    };

    this.users.set(email, { user: mockUser, userData: userDocData });
    this.saveUsersToStorage();
    return { user: mockUser, userData: userDocData };
  }
}

// Export singleton instance
export const mockAuthService = new MockAuthService();
