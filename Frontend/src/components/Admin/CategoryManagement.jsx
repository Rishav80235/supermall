import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Plus } from 'lucide-react';

const CategoryManagement = () => {
  return (
    <div className="tab-content">
      <div className="admin-actions">
        <h3>Category Management</h3>
        <Link to="/admin/add-category" className="btn btn-primary">
          <Plus size={20} />
          Add New Category
        </Link>
      </div>
      
      <div className="text-center py-12">
        <Settings size={64} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Categories Yet</h3>
        <p className="text-gray-500 mb-6">Start by creating your first product category</p>
        <Link to="/admin/add-category" className="btn btn-primary">
          <Plus size={20} />
          Add Your First Category
        </Link>
      </div>
    </div>
  );
};

export default CategoryManagement;
