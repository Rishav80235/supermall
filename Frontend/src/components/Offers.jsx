import React, { useState, useEffect, useContext } from 'react';
import { Tag, Calendar, Store, Percent } from 'lucide-react';
import { AppContext } from '../App';
import LoadingSpinner from './UI/LoadingSpinner';

const Offers = () => {
  const { databaseService } = useContext(AppContext);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const offersData = await databaseService.getOffers();
      setOffers(offersData);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOfferValid = (validUntil) => {
    return new Date(validUntil) > new Date();
  };

  if (loading) {
    return <LoadingSpinner message="Loading offers..." />;
  }

  return (
    <div className="section">
      <div className="container">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Special Offers</h1>
          <p className="text-gray-600">Don't miss out on these amazing deals!</p>
        </div>

        {offers.length === 0 ? (
          <div className="text-center py-12">
            <Tag size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No offers available</h3>
            <p className="text-gray-500">Check back later for new deals and discounts</p>
          </div>
        ) : (
          <div className="offers-grid">
            {offers.map(offer => (
              <div key={offer.id} className="card offer-card">
                <div className="offer-badge">
                  <Percent size={16} />
                  {offer.discount}% OFF
                </div>
                
                <div className="offer-card-content">
                  <h3 className="offer-card-title">{offer.title}</h3>
                  <p className="offer-card-description">
                    {offer.description || 'No description available.'}
                  </p>
                  
                  <div className="offer-details">
                    <div className="flex items-center gap-2">
                      <div className="offer-discount">
                        {offer.discount}% Discount
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="offer-validity">
                        Valid until {formatDate(offer.validUntil)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Store size={16} className="text-blue-500" />
                    <span className="offer-shop">Shop: {offer.shopId}</span>
                  </div>

                  <div className="mt-4">
                    <span className={`status-badge ${
                      isOfferValid(offer.validUntil) ? 'status-active' : 'status-inactive'
                    }`}>
                      {isOfferValid(offer.validUntil) ? 'Active' : 'Expired'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Info Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How to Use These Offers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Find Your Offer</h3>
                <p className="text-gray-600 text-sm">
                  Browse through our available offers and find the one that interests you.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Visit the Shop</h3>
                <p className="text-gray-600 text-sm">
                  Go to the shop mentioned in the offer and show them the deal.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Enjoy Savings</h3>
                <p className="text-gray-600 text-sm">
                  Get your discount and enjoy great savings on your purchase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers;
