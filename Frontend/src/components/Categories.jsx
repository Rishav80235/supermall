import React, { useState, useEffect, useContext } from 'react';
import { Tag, Package, ArrowRight } from 'lucide-react';
import { AppContext } from '../App';
import LoadingSpinner from './UI/LoadingSpinner';

const Categories = () => {
  const { databaseService } = useContext(AppContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await databaseService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    // Navigate to products filtered by category
    // This would typically use React Router navigation
    console.log('Navigate to category:', categoryId);
  };

  if (loading) {
    return <LoadingSpinner message="Loading categories..." />;
  }

  return (
    <div className="section">
      <div className="container">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Categories</h1>
          <p className="text-gray-600">Browse products by category</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No categories available</h3>
            <p className="text-gray-500">Categories will appear here once they are added</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map(category => (
              <div 
                key={category.id} 
                className="card category-card"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="category-icon">
                  <Tag size={32} />
                </div>
                <h3 className="category-title">{category.name}</h3>
                <p className="category-description">
                  {category.description || 'No description available.'}
                </p>
                <div className="category-count">
                  <span className="flex items-center gap-2">
                    View Products
                    <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Info Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How Categories Work
            </h2>
            <p className="text-gray-600 mb-6">
              Our product categories help you find exactly what you're looking for. 
              Each category contains related products from various shops in our mall.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <Tag size={16} className="text-blue-600" />
                  </div>
                  Organized Shopping
                </h3>
                <p className="text-gray-600">
                  Products are organized into logical categories to make your shopping 
                  experience more efficient and enjoyable.
                </p>
              </div>
              
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Package size={16} className="text-green-600" />
                  </div>
                  Easy Navigation
                </h3>
                <p className="text-gray-600">
                  Click on any category to view all products in that category 
                  from different shops across the mall.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Shopping?</h2>
            <p className="mb-6 opacity-90">
              Explore our shops and discover amazing products across all categories
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/shops" className="btn bg-white text-blue-600 hover:bg-gray-100">
                Browse Shops
              </a>
              <a href="/offers" className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600">
                View Offers
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
