import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  ShoppingBag,
  Heart,
  Shield,
  Truck,
  Headphones
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        {/* Main Footer Content */}
        <div className="footer-main">
          <div className="footer-grid">
            {/* Company Info */}
            <div className="footer-section">
              <div className="footer-logo">
                <ShoppingBag className="logo-icon" />
                <span className="logo-text">Super Mall</span>
              </div>
              <p className="footer-description">
                Your premier destination for shopping, dining, and entertainment. 
                Discover amazing shops, exclusive offers, and endless possibilities 
                all under one roof.
              </p>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                <li><Link to="/" className="footer-link">Home</Link></li>
                <li><Link to="/shops" className="footer-link">Shops</Link></li>
                <li><Link to="/offers" className="footer-link">Offers</Link></li>
                <li><Link to="/categories" className="footer-link">Categories</Link></li>
                <li><Link to="/about" className="footer-link">About Us</Link></li>
                <li><Link to="/contact" className="footer-link">Contact</Link></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="footer-section">
              <h3 className="footer-title">Customer Service</h3>
              <ul className="footer-links">
                <li><Link to="/help" className="footer-link">Help Center</Link></li>
                <li><Link to="/faq" className="footer-link">FAQ</Link></li>
                <li><Link to="/shipping" className="footer-link">Shipping Info</Link></li>
                <li><Link to="/returns" className="footer-link">Returns & Exchanges</Link></li>
                <li><Link to="/size-guide" className="footer-link">Size Guide</Link></li>
                <li><Link to="/track-order" className="footer-link">Track Your Order</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-section">
              <h3 className="footer-title">Contact Info</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <MapPin className="contact-icon" />
                  <div>
                    <p>123 Mall Street</p>
                    <p>Downtown District, City 12345</p>
                  </div>
                </div>
                <div className="contact-item">
                  <Phone className="contact-icon" />
                  <div>
                    <p>+1 (555) 123-4567</p>
                    <p>+1 (555) 987-6543</p>
                  </div>
                </div>
                <div className="contact-item">
                  <Mail className="contact-icon" />
                  <div>
                    <p>info@supermall.com</p>
                    <p>support@supermall.com</p>
                  </div>
                </div>
                <div className="contact-item">
                  <Clock className="contact-icon" />
                  <div>
                    <p>Mon - Fri: 9:00 AM - 10:00 PM</p>
                    <p>Sat - Sun: 10:00 AM - 9:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="footer-features">
          <div className="feature-item">
            <Truck className="feature-icon" />
            <div>
              <h4>Free Shipping</h4>
              <p>On orders over $50</p>
            </div>
          </div>
          <div className="feature-item">
            <Shield className="feature-icon" />
            <div>
              <h4>Secure Payment</h4>
              <p>100% secure checkout</p>
            </div>
          </div>
          <div className="feature-item">
            <Headphones className="feature-icon" />
            <div>
              <h4>24/7 Support</h4>
              <p>Always here to help</p>
            </div>
          </div>
          <div className="feature-item">
            <Heart className="feature-icon" />
            <div>
              <h4>Customer First</h4>
              <p>Your satisfaction matters</p>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="footer-newsletter">
          <div className="newsletter-content">
            <h3>Stay Updated</h3>
            <p>Subscribe to our newsletter for exclusive offers and updates</p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="newsletter-input"
              />
              <button className="newsletter-btn">Subscribe</button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-bottom-left">
              <p>&copy; 2024 Super Mall. All rights reserved.</p>
            </div>
            <div className="footer-bottom-right">
              <div className="footer-bottom-links">
                <Link to="/privacy" className="footer-bottom-link">Privacy Policy</Link>
                <Link to="/terms" className="footer-bottom-link">Terms of Service</Link>
                <Link to="/cookies" className="footer-bottom-link">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
