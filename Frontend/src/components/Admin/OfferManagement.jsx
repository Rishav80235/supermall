import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, Plus } from 'lucide-react';

const OfferManagement = () => {
  return (
    <div className="tab-content">
      <div className="admin-actions">
        <h3>Offer Management</h3>
        <Link to="/admin/add-offer" className="btn btn-primary">
          <Plus size={20} />
          Add New Offer
        </Link>
      </div>
      
      <div className="text-center py-12">
        <Tag size={64} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Offers Yet</h3>
        <p className="text-gray-500 mb-6">Start by creating your first promotional offer</p>
        <Link to="/admin/add-offer" className="btn btn-primary">
          <Plus size={20} />
          Add Your First Offer
        </Link>
      </div>
    </div>
  );
};

export default OfferManagement;
