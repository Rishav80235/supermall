import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../App';
import { AppContext } from '../App';
import { Menu, X, ShoppingBag, User, LogOut, ShoppingCart } from 'lucide-react';
import ShoppingCartComponent from './Cart/ShoppingCart';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { currentUser, isAdmin, showLogin, handleLogout, cartService } = useApp();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = async () => {
    await handleLogout();
    closeMobileMenu();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
          <ShoppingBag size={24} />
          Super Mall
        </Link>

        <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link 
            to="/shops" 
            className={`nav-link ${isActive('/shops') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Shops
          </Link>
          <Link 
            to="/offers" 
            className={`nav-link ${isActive('/offers') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Offers
          </Link>
          <Link 
            to="/categories" 
            className={`nav-link ${isActive('/categories') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Categories
          </Link>
        </div>

        <div className="nav-auth">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Shopping Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="nav-link relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartService && cartService.getCartItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartService.getCartItemCount()}
              </span>
            )}
          </button>
          {currentUser ? (
            <>
              <div className="user-info">
                <User size={16} />
                <span>{currentUser.displayName || currentUser.email}</span>
              </div>
              {isAdmin ? (
                <Link 
                  to="/admin" 
                  className="btn btn-secondary btn-sm"
                  onClick={closeMobileMenu}
                >
                  Admin Panel
                </Link>
              ) : (
                <Link 
                  to="/customer" 
                  className="btn btn-secondary btn-sm"
                  onClick={closeMobileMenu}
                >
                  My Dashboard
                </Link>
              )}
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleLogoutClick}
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link 
                to="/login" 
                className="btn btn-outline btn-sm"
                onClick={closeMobileMenu}
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="btn btn-primary btn-sm"
                onClick={closeMobileMenu}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <div className="hamburger" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>
      </div>
      
      {/* Shopping Cart Modal */}
      {/* <ShoppingCartComponent 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      /> */}
    </nav>
  );
};

export default Navbar;
