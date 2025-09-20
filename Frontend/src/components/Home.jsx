import React, { useState, useEffect, useContext } from 'react';
import { ShoppingBag, Tag, Store, TrendingUp, ShoppingCart } from 'lucide-react';
import { AppContext } from '../App';
import toast from 'react-hot-toast';

const Home = () => {
  const { databaseService, cartService } = useContext(AppContext);
  const [stats, setStats] = useState({
    totalShops: 0,
    totalOffers: 0,
    totalProducts: 0
  });
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statistics, productsData, offersData, shopsData] = await Promise.all([
        databaseService.getStatistics(),
        databaseService.getProducts(),
        databaseService.getOffers(),
        databaseService.getShops()
      ]);
      
      setStats(statistics);
      setProducts(productsData.filter(p => p.isActive).slice(0, 6)); // Show first 6 active products
      setOffers(offersData.slice(0, 4)); // Show first 4 offers
      setShops(shopsData.slice(0, 4)); // Show first 4 shops
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (cartService) {
      const success = cartService.addItem(product, 1);
      if (success) {
        toast.success(`${product.name} added to cart!`);
      }
    } else {
      toast.error('Cart service not available');
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to Super Mall</h1>
            <p>Discover amazing shops, exclusive offers, and endless shopping possibilities</p>
            
            <div className="hero-stats">
              <div className="stat">
                <Store size={32} />
                <span>{stats.totalShops}</span>
                <label>Shops</label>
              </div>
              <div className="stat">
                <Tag size={32} />
                <span>{stats.totalOffers}</span>
                <label>Active Offers</label>
              </div>
              <div className="stat">
                <ShoppingBag size={32} />
                <span>{stats.totalProducts}</span>
                <label>Products</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="section">
          <div className="text-center mb-6">
            <h2>Why Choose Super Mall?</h2>
            <p className="text-gray-600">Experience shopping like never before</p>
          </div>

          <div className="shops-grid">
            <div className="card">
              <div className="card-content">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Store className="text-blue-600" size={24} />
                  </div>
                  <h3 className="card-title">Diverse Shops</h3>
                </div>
                <p className="card-description">
                  Explore a wide variety of shops across different floors and categories. 
                  From fashion to electronics, we have everything you need.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-content">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Tag className="text-green-600" size={24} />
                  </div>
                  <h3 className="card-title">Exclusive Offers</h3>
                </div>
                <p className="card-description">
                  Take advantage of special discounts and limited-time offers. 
                  Save more on your favorite brands and products.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-content">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <TrendingUp className="text-purple-600" size={24} />
                  </div>
                  <h3 className="card-title">Smart Shopping</h3>
                </div>
                <p className="card-description">
                  Compare products, find the best deals, and make informed decisions 
                  with our advanced filtering and comparison tools.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="text-center mb-6">
            <h2>Quick Access</h2>
            <p className="text-gray-600">Navigate to your favorite sections</p>
          </div>

          <div className="shops-grid">
            <div className="card">
              <div className="card-content text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="text-white" size={32} />
                </div>
                <h3 className="card-title">Browse Shops</h3>
                <p className="card-description">
                  Discover all the shops in our mall, organized by floor and category.
                </p>
                <a href="/shops" className="btn btn-primary mt-4">
                  View Shops
                </a>
              </div>
            </div>

            <div className="card">
              <div className="card-content text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="text-white" size={32} />
                </div>
                <h3 className="card-title">Special Offers</h3>
                <p className="card-description">
                  Check out the latest deals and discounts available in our mall.
                </p>
                <a href="/offers" className="btn btn-primary mt-4">
                  View Offers
                </a>
              </div>
            </div>

            <div className="card">
              <div className="card-content text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="text-white" size={32} />
                </div>
                <h3 className="card-title">Product Categories</h3>
                <p className="card-description">
                  Browse products by category and find exactly what you're looking for.
                </p>
                <a href="/categories" className="btn btn-primary mt-4">
                  View Categories
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="section">
          <div className="text-center mb-6">
            <h2>Featured Products</h2>
            <p className="text-gray-600">Discover our most popular items</p>
          </div>
          
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0].url} alt={product.name} />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <ShoppingBag className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  {product.discountPercentage > 0 && (
                    <div className="discount-badge">
                      {product.discountPercentage}% OFF
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-brand">{product.brand}</p>
                  <div className="product-price">
                    <span className="current-price">${product.price.toFixed(2)}</span>
                    {product.originalPrice > product.price && (
                      <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="product-rating">
                    <span className="stars">★★★★★</span>
                    <span className="rating-text">(0 reviews)</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Offers Section */}
        <div className="section">
          <div className="text-center mb-6">
            <h2>Special Offers</h2>
            <p className="text-gray-600">Don't miss out on these amazing deals</p>
          </div>
          
          <div className="offers-grid">
            {offers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <div className="offer-image">
                  <img src={offer.image} alt={offer.title} />
                </div>
                <div className="offer-content">
                  <h3 className="offer-title">{offer.title}</h3>
                  <p className="offer-description">{offer.description}</p>
                  <div className="offer-discount">
                    <span className="discount-percentage">{offer.discount}% OFF</span>
                  </div>
                  <div className="offer-terms">
                    <small>{offer.terms}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Shops Section */}
        <div className="section">
          <div className="text-center mb-6">
            <h2>Popular Shops</h2>
            <p className="text-gray-600">Visit our most loved stores</p>
          </div>
          
          <div className="shops-grid">
            {shops.map((shop) => (
              <div key={shop.id} className="shop-card">
                <div className="shop-image">
                  <img src={shop.image} alt={shop.name} />
                </div>
                <div className="shop-info">
                  <h3 className="shop-name">{shop.name}</h3>
                  <p className="shop-category">{shop.category}</p>
                  <p className="shop-description">{shop.description}</p>
                  <div className="shop-rating">
                    <span className="stars">★★★★★</span>
                    <span className="rating-text">{shop.rating}</span>
                  </div>
                  <div className="shop-location">
                    <span className="floor">{shop.floor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
