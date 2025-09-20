import React, { useState, useEffect, useContext } from 'react';
import { Search, Filter, MapPin, Phone, Store } from 'lucide-react';
import { AppContext } from '../App';
import LoadingSpinner from './UI/LoadingSpinner';

const Shops = () => {
  const { databaseService } = useContext(AppContext);
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [floors, setFloors] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterShops();
  }, [shops, searchTerm, selectedFloor, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shopsData, floorsData, categoriesData] = await Promise.all([
        databaseService.getShops(),
        databaseService.getFloors(),
        databaseService.getCategories()
      ]);
      
      setShops(shopsData);
      setFloors(floorsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterShops = () => {
    let filtered = shops;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(shop =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by floor
    if (selectedFloor) {
      filtered = filtered.filter(shop => shop.floorId === selectedFloor);
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(shop => shop.categoryId === selectedCategory);
    }

    setFilteredShops(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFloor('');
    setSelectedCategory('');
  };

  if (loading) {
    return <LoadingSpinner message="Loading shops..." />;
  }

  return (
    <div className="section">
      <div className="container">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Shops</h1>
          <p className="text-gray-600">Discover amazing shops across all floors</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold">Filter Shops</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Floors</option>
              {floors.map(floor => (
                <option key={floor.id} value={floor.id}>
                  {floor.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <button
              onClick={clearFilters}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredShops.length} of {shops.length} shops
          </div>
        </div>

        {/* Shops Grid */}
        {filteredShops.length === 0 ? (
          <div className="text-center py-12">
            <Store size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No shops found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="shops-grid">
            {filteredShops.map(shop => (
              <div key={shop.id} className="card shop-card">
                {shop.imageURL && (
                  <img 
                    src={shop.imageURL} 
                    alt={shop.name} 
                    className="shop-card-image"
                  />
                )}
                <div className="shop-card-content">
                  <h3 className="shop-card-title">{shop.name}</h3>
                  <p className="shop-card-description">
                    {shop.description || 'No description available.'}
                  </p>
                  <div className="shop-card-meta">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="shop-floor">Floor {shop.floorId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-sm">{shop.contact}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="shop-category">{shop.categoryId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shops;
