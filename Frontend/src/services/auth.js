import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firebaseService } from './firebase';
import toast from 'react-hot-toast';

class AuthService {
  constructor() {
    this.auth = null;
    this.db = null;
    this.authStateListeners = [];
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) {
      return;
    }

    this.auth = firebaseService.getAuth();
    this.db = firebaseService.getFirestore();
    this.isInitialized = true;

    // Set up auth state listener
    this.setupAuthStateListener();
    
    console.log('AuthService initialized successfully');
  }

  setupAuthStateListener() {
    if (!this.isInitialized) return;

    onAuthStateChanged(this.auth, async (user) => {
      this.authStateListeners.forEach(listener => {
        try {
          listener(user);
        } catch (error) {
          console.error('Error in auth state listener:', error);
        }
      });
    });
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

  async signIn(email, password) {
    if (!this.isInitialized) {
      throw new Error('AuthService not initialized');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Get user data
      const userDoc = await getDoc(doc(this.db, 'users', user.uid));
      const userData = userDoc.exists ? userDoc.data() : null;

      // Update last login time
      if (userData) {
        await this.updateUserProfile(user.uid, { lastLoginAt: new Date() });
      }
      
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
      await signOut(this.auth);
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Logout failed');
      throw error;
    }
  }

  async signUp(userData) {
    if (!this.isInitialized) {
      throw new Error('AuthService not initialized');
    }

    try {
      const { email, password, name, userType, phone, company } = userData;
      
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      const userDocData = {
        uid: user.uid,
        email: user.email,
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

      await setDoc(doc(this.db, 'users', user.uid), userDocData);

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: name
      });

      console.log('User created successfully:', { uid: user.uid, userType, role: userDocData.role });
      return { success: true, user, userData: userDocData };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, message: error.message || 'Failed to create account' };
    }
  }

  async createUser(email, password, userData = {}) {
    if (!this.isInitialized) {
      throw new Error('AuthService not initialized');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(this.db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || '',
        role: userData.role || 'user',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        ...userData
      });

      // Update Firebase Auth profile
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName
        });
      }

      return user;
    } catch (error) {
      console.error('Create user error:', error);
      toast.error(error.message || 'Failed to create user');
      throw error;
    }
  }

  async updateUserProfile(uid, userData) {
    if (!this.isInitialized) {
      throw new Error('AuthService not initialized');
    }

    try {
      const userRef = doc(this.db, 'users', uid);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }

  async isAdmin(uid) {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const userDoc = await getDoc(doc(this.db, 'users', uid));
      return userDoc.exists && userDoc.data().role === 'admin';
    } catch (error) {
      console.error('Check admin status error:', error);
      return false;
    }
  }

  async getCurrentUserData() {
    if (!this.auth.currentUser) return null;

    try {
      const userDoc = await getDoc(doc(this.db, 'users', this.auth.currentUser.uid));
      return userDoc.exists ? userDoc.data() : null;
    } catch (error) {
      console.error('Get current user data error:', error);
      return null;
    }
  }

  getCurrentUser() {
    return this.auth?.currentUser || null;
  }

  isAuthenticated() {
    return !!this.auth?.currentUser;
  }
}

// Export singleton instance
export const authService = new AuthService();
