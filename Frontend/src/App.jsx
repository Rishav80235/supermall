import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import './theme.css';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Shops from './components/Shops';
import Offers from './components/Offers';
import Categories from './components/Categories';
import AdminPanel from './components/Admin/AdminPanel';
import AddProduct from './components/Admin/AddProduct';
import AddShop from './components/Admin/AddShop';
import AddOffer from './components/Admin/AddOffer';
import AddCategory from './components/Admin/AddCategory';
import AddFloor from './components/Admin/AddFloor';
import CustomerDashboard from './components/Customer/CustomerDashboard';
import LoginModal from './components/Auth/LoginModal';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import AuthTest from './components/Auth/AuthTest';
import LoadingSpinner from './components/UI/LoadingSpinner';
import Checkout from './components/Checkout/Checkout';

// Import services
import { firebaseService } from './services/firebase';
import { authService } from './services/auth';
import { mockAuthService } from './services/mockAuth';
import { databaseService } from './services/database';
import { performanceService } from './services/performanceService';
import { cacheService } from './services/cacheService';
import { cartService } from './services/cartService';
import { orderService } from './services/orderService';
import { paymentService } from './services/paymentService';
import { analyticsService } from './services/analyticsService';
import { appConfig } from './config/firebase.config';

// Create context for global state
export const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  // Initialize Firebase and services
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Initialize Firebase
        await firebaseService.initialize();
        setFirebaseInitialized(true);
        
        // Initialize Mock Auth service
        mockAuthService.initialize();
        
        // Initialize Database service (handles Firebase or mock data)
        await databaseService.initialize();
        
        // Initialize e-commerce services
        await orderService.initialize();
        await paymentService.initialize();
        await analyticsService.initialize();
        
        // Start performance monitoring
        performanceService.startMonitoring();
        
        // Initialize cache service
        cacheService.restore();
        
        // Set up auth state listener
        mockAuthService.onAuthStateChanged(async (user) => {
          setCurrentUser(user);
          if (user) {
            try {
              // Get user data to check role
              const userData = await mockAuthService.getCurrentUserData();
              const userIsAdmin = userData?.role === 'admin' || userData?.userType === 'admin';
              setIsAdmin(userIsAdmin);
            } catch (error) {
              console.error('Error checking admin status:', error);
              setIsAdmin(false);
            }
          } else {
            setIsAdmin(false);
          }
        });
        
        console.log('Super Mall Application initialized successfully!');
      } catch (error) {
        console.error('Failed to initialize application:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      performanceService.stopMonitoring();
      databaseService.cleanup();
      cacheService.persist();
    };
  }, []);

  // Handle login
  const handleLogin = async (email, password) => {
    try {
      const result = await mockAuthService.signIn(email, password);
      if (result.success) {
        setShowLoginModal(false);
        return result;
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await mockAuthService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show login modal
  const showLogin = () => {
    setShowLoginModal(true);
  };

  // Hide login modal
  const hideLogin = () => {
    setShowLoginModal(false);
  };

  // Context value
  const contextValue = {
    currentUser,
    isAdmin,
    isLoading,
    firebaseInitialized,
    showLogin,
    handleLogout,
    showLoginModal,
    hideLogin,
      databaseService: databaseService,
      performanceService: performanceService,
      cacheService: cacheService,
      cartService: cartService,
      orderService: orderService,
      paymentService: paymentService,
      analyticsService: analyticsService,
    authService: mockAuthService
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!firebaseInitialized) {
    return (
      <div className="app-error">
        <div className="error-content">
          <h3>Firebase Initialization Error</h3>
          <p>Failed to initialize Firebase. Please check your configuration.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="app">
          <Navbar />
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shops" element={<Shops />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/categories" element={<Categories />} />
              
              {/* E-commerce Routes */}
              <Route path="/checkout" element={<Checkout />} />
              
              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/auth-test" element={<AuthTest />} />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  isAdmin ? <AdminPanel /> : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/admin/add-product" 
                element={
                  isAdmin ? <AddProduct /> : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/admin/add-shop" 
                element={
                  isAdmin ? <AddShop /> : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/admin/add-offer" 
                element={
                  isAdmin ? <AddOffer /> : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/admin/add-category" 
                element={
                  isAdmin ? <AddCategory /> : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/admin/add-floor" 
                element={
                  isAdmin ? <AddFloor /> : <Navigate to="/login" replace />
                } 
              />
              
              {/* Customer Routes */}
              <Route 
                path="/customer" 
                element={
                  currentUser && !isAdmin ? <CustomerDashboard /> : <Navigate to="/login" replace />
                } 
              />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />

          {showLoginModal && (
            <LoginModal 
              onLogin={handleLogin}
              onClose={hideLogin}
            />
          )}

          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;