import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Plus } from 'lucide-react';

const FloorManagement = () => {
  return (
    <div className="tab-content">
      <div className="admin-actions">
        <h3>Floor Management</h3>
        <Link to="/admin/add-floor" className="btn btn-primary">
          <Plus size={20} />
          Add New Floor
        </Link>
      </div>
      
      <div className="text-center py-12">
        <Building size={64} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Floors Yet</h3>
        <p className="text-gray-500 mb-6">Start by creating your first mall floor</p>
        <Link to="/admin/add-floor" className="btn btn-primary">
          <Plus size={20} />
          Add Your First Floor
        </Link>
      </div>
    </div>
  );
};

export default FloorManagement;
