import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaCog, FaBolt, FaStar } from 'react-icons/fa';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';

function NewBikes() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewBikes = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL = server_ip || 'http://localhost:8001';
        const endpoint = `${API_URL}/new-bike`;

        console.log('🔄 Fetching new bikes from:', endpoint);

        const response = await fetchWithRetry(endpoint, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 New bikes received:', data.length);

        if (Array.isArray(data) && data.length > 0) {
          console.log('📦 Total bikes from backend:', data.length);
          console.log('📦 Sample bike:', data[0] ? {
            _id: data[0]._id,
            make: data[0].make,
            model: data[0].model,
            status: data[0].status,
            isActive: data[0].isActive,
            isDeleted: data[0].isDeleted,
            dateAdded: data[0].dateAdded
          } : 'No data');

          // Filter for active new bikes
          const validBikes = data.filter(bike => {
            const hasRequiredFields = bike.make && bike.model;
            const isActive = bike.status === 'active' || !bike.status || bike.isActive === true || bike.isActive === undefined;
            const isNotDeleted = !bike.isDeleted;

            const isValid = hasRequiredFields && isActive && isNotDeleted;

            if (!isValid) {
              console.log(`⚠️ Bike filtered out: ${bike._id}`, {
                hasRequiredFields,
                isActive,
                isNotDeleted,
                status: bike.status,
                bikeIsActive: bike.isActive,
                make: bike.make,
                model: bike.model
              });
            }

            return isValid;
          });

          console.log(`✅ Valid bikes after filtering: ${validBikes.length}`);

          // Sort by dateAdded (newest first) - latest bikes first
          const latestBikes = validBikes.sort((a, b) => {
            const dateA = new Date(a.dateAdded || a.createdAt || a.updatedAt || 0);
            const dateB = new Date(b.dateAdded || b.createdAt || b.updatedAt || 0);
            return dateB - dateA; // Newest first
          });

          console.log('✅ Latest bikes sorted by date:', latestBikes.slice(0, 3).map(b => ({
            make: b.make,
            model: b.model,
            dateAdded: b.dateAdded
          })));

          setBikes(latestBikes);
          console.log('✅ Latest new bikes set:', latestBikes.length);
        } else {
          console.warn('⚠️ No bikes found or data is not an array');
          setBikes([]);
        }
      } catch (err) {
        console.error('❌ Error fetching new bikes:', err);
        setError(err.message || 'Failed to fetch new bikes');
        setBikes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewBikes();
  }, []);

  const buildImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
    }
    if (imagePath.startsWith('http')) return imagePath;

    const API_URL = server_ip || 'http://localhost:8001';
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_URL}/uploads/${cleanPath}`;
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on call';
    return `PKR ${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>New Bikes - Auto Finder</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8">New Bikes</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>New Bikes - Auto Finder</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
          <div className="container mx-auto px-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
              <p className="text-yellow-800 dark:text-yellow-400 font-semibold mb-2">Unable to load new bikes</p>
              <p className="text-yellow-700 dark:text-yellow-500 text-sm mb-2">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-800"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>New Bikes - Auto Finder</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-2 transition-colors">
        <div className="container mx-auto px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">New Bikes</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Latest new bikes available in Pakistan - Sorted by newest first</p>

          {bikes.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-2 font-semibold">No new bikes available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bikes.map((bike) => {
                const imageUrl = buildImageUrl(bike.image1);
                const bikeName = `${bike.make || ''} ${bike.model || ''} ${bike.variant || ''} ${bike.year || ''}`.trim();
                return (
                  <div key={bike._id || bike.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden hover:shadow-xl transition h-full flex flex-col">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={bikeName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EBike Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <span className="absolute top-2 right-2 bg-red-600 dark:bg-red-700 text-white px-2 py-1 rounded text-xs font-semibold">NEW</span>
                      {/* Only show PREMIUM tag for approved premium/featured bike ads, not free ads */}
                      {bike.isFeatured === 'Approved' && bike.isPaidAd === true && (
                        <span className="absolute top-2 left-2 bg-yellow-500 dark:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                          <FaStar className="text-xs" />
                          Premium
                        </span>
                      )}
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{bikeName}</h3>
                      <div className="mb-2">
                        <span className="text-red-600 dark:text-red-500 font-bold text-lg">{formatPrice(bike.price)}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {bike.year && (
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt className="text-red-600 dark:text-red-500" />
                            {bike.year}
                          </span>
                        )}
                        {bike.transmission && (
                          <span className="flex items-center gap-1">
                            <FaCog className="text-red-600 dark:text-red-500" />
                            {bike.transmission}
                          </span>
                        )}
                        {bike.engineCapacity && (
                          <span className="flex items-center gap-1">
                            <FaBolt className="text-red-600 dark:text-red-500" />
                            {bike.engineCapacity}
                          </span>
                        )}
                      </div>
                      {/* Spacer to push button to bottom */}
                      <div className="flex-grow"></div>
                      <Link
                        to={`/bike-detail/${bike._id}`}
                        className="block w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white text-center py-2 rounded-md transition mt-auto"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default NewBikes;

