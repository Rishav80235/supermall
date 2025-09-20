import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { AppContext } from '../../App';
import LoadingSpinner from '../UI/LoadingSpinner';

const ShopManagement = () => {
  const { databaseService } = useContext(AppContext);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadShops();
    
    // Set up real-time subscription
    const unsubscribe = databaseService.subscribeToShops((shopsData) => {
      setShops(shopsData);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      const shopsData = await databaseService.getShops();
      setShops(shopsData);
    } catch (error) {
      console.error('Error loading shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteShop = async (shopId) => {
    if (window.confirm('Are you sure you want to delete this shop?')) {
      try {
        await databaseService.deleteShop(shopId);
        await loadShops(); // Reload shops
      } catch (error) {
        console.error('Error deleting shop:', error);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading shops..." />;
  }

  return (
    <div className="tab-content">
      <div className="admin-actions">
        <h3>Shop Management</h3>
        <Link to="/admin/add-shop" className="btn btn-primary">
          <Plus size={20} />
          Add New Shop
        </Link>
      </div>

      {/* Search */}
      <div className="admin-search">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search shops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Shops Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Shop Details</th>
              <th>Floor</th>
              <th>Category</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredShops.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No shops found matching your search' : 'No shops available'}
                </td>
              </tr>
            ) : (
              filteredShops.map(shop => (
                <tr key={shop.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {shop.imageURL && (
                        <img 
                          src={shop.imageURL} 
                          alt={shop.name} 
                          className="image-preview"
                        />
                      )}
                      <div>
                        <div className="font-semibold">{shop.name}</div>
                        <div className="text-sm text-gray-600">
                          {shop.description || 'No description'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{shop.floorId}</td>
                  <td>{shop.categoryId}</td>
                  <td>{shop.contact}</td>
                  <td>
                    <span className={`status-badge ${shop.isActive ? 'status-active' : 'status-inactive'}`}>
                      {shop.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-view">
                        <Eye size={16} />
                      </button>
                      <button className="btn btn-sm btn-edit">
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn btn-sm btn-delete"
                        onClick={() => handleDeleteShop(shop.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredShops.length} of {shops.length} shops
      </div>
    </div>
  );
};

export default ShopManagement;
