import React, { useState } from 'react';
import { Settings, Store, Package, Tag, Building, BarChart3, Activity, TrendingUp } from 'lucide-react';
import ShopManagement from './ShopManagement';
import ProductManagement from './ProductManagement';
import OfferManagement from './OfferManagement';
import CategoryManagement from './CategoryManagement';
import FloorManagement from './FloorManagement';
import Dashboard from './Dashboard';
import PerformanceMonitor from './PerformanceMonitor';
import AnalyticsDashboard from './AnalyticsDashboard';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'shops', label: 'Shops', icon: Store },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'offers', label: 'Offers', icon: Tag },
    { id: 'categories', label: 'Categories', icon: Settings },
    { id: 'floors', label: 'Floors', icon: Building },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'performance', label: 'Performance', icon: Activity }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'shops':
        return <ShopManagement />;
      case 'products':
        return <ProductManagement />;
      case 'offers':
        return <OfferManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'floors':
        return <FloorManagement />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'performance':
        return <PerformanceMonitor />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="admin-section">
      <div className="container">
        <div className="admin-header">
          <h2>Admin Panel</h2>
          <p className="text-gray-600">Manage your mall operations</p>
        </div>

        <div className="admin-tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="admin-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
