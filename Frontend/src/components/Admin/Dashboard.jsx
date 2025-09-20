import React, { useState, useEffect, useContext } from 'react';
import { Store, Package, Tag, TrendingUp, Users, DollarSign } from 'lucide-react';
import { AppContext } from '../../App';
import LoadingSpinner from '../UI/LoadingSpinner';

const Dashboard = () => {
  const { databaseService } = useContext(AppContext);
  const [stats, setStats] = useState({
    totalShops: 0,
    totalOffers: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
    
    // Set up real-time subscriptions
    const unsubscribeShops = databaseService.subscribeToShops((shops) => {
      setStats(prev => ({ ...prev, totalShops: shops.length }));
    });
    
    const unsubscribeProducts = databaseService.subscribeToProducts((products) => {
      setStats(prev => ({ ...prev, totalProducts: products.length }));
    });
    
    const unsubscribeOffers = databaseService.subscribeToOffers((offers) => {
      setStats(prev => ({ ...prev, totalOffers: offers.length }));
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeShops();
      unsubscribeProducts();
      unsubscribeOffers();
    };
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const statistics = await databaseService.getStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const statCards = [
    {
      title: 'Total Shops',
      value: stats.totalShops,
      icon: Store,
      color: 'blue',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Offers',
      value: stats.totalOffers,
      icon: Tag,
      color: 'green',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'purple',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Revenue',
      value: '$24,500',
      icon: DollarSign,
      color: 'orange',
      change: '+5%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="tab-content">
      <div className="admin-actions">
        <h3>Dashboard Overview</h3>
        <button 
          className="btn btn-primary"
          onClick={loadStatistics}
        >
          <TrendingUp size={20} />
          Refresh Data
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
                <span className={`stat-change ${stat.changeType === 'negative' ? 'negative' : ''}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {stat.title}
              </h3>
              <div className="stat-value">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
            onClick={() => {/* Navigate to add shop */}}
          >
            <Store className="text-blue-600 mb-2" size={24} />
            <h4 className="font-semibold">Add New Shop</h4>
            <p className="text-sm text-gray-600">Register a new shop in the mall</p>
          </button>

          <button 
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
            onClick={() => {/* Navigate to add product */}}
          >
            <Package className="text-green-600 mb-2" size={24} />
            <h4 className="font-semibold">Add Product</h4>
            <p className="text-sm text-gray-600">Add a new product to catalog</p>
          </button>

          <button 
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
            onClick={() => {/* Navigate to add offer */}}
          >
            <Tag className="text-purple-600 mb-2" size={24} />
            <h4 className="font-semibold">Create Offer</h4>
            <p className="text-sm text-gray-600">Create a special discount offer</p>
          </button>

          <button 
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
            onClick={() => {/* Navigate to analytics */}}
          >
            <TrendingUp className="text-orange-600 mb-2" size={24} />
            <h4 className="font-semibold">View Analytics</h4>
            <p className="text-sm text-gray-600">Check detailed performance metrics</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Store className="text-green-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-medium">New shop "Tech Store" added</p>
                <p className="text-sm text-gray-600">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="text-blue-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-medium">15 new products added to Fashion Store</p>
                <p className="text-sm text-gray-600">4 hours ago</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Tag className="text-purple-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-medium">New 20% off offer created for Electronics</p>
                <p className="text-sm text-gray-600">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
