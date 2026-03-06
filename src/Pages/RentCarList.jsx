import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaCar, FaMapMarkerAlt, FaCog, FaBolt, FaTag } from 'react-icons/fa';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';

function RentCarList() {
  const [, setCars] = useState([]); // cars state kept for setCars calls but not used directly
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredCars, setFilteredCars] = useState([]);

  useEffect(() => {
    const fetchRentCars = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL = server_ip || 'http://localhost:8001';
        const endpoint = `${API_URL}/rent_car`;

        const response = await fetchWithRetry(endpoint, {
          method: 'GET',
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          // Filter: Show only active, non-deleted rent cars
          const validCars = data.filter((car) => {
            const hasRequiredFields = car.make && car.model;
            const isActive = car.isActive === true || car.isActive === undefined;
            const isNotDeleted = !car.isDeleted;

            return hasRequiredFields && isActive && isNotDeleted;
          });

          setCars(validCars);
          setFilteredCars(validCars);
        } else {
          setCars([]);
          setFilteredCars([]);
        }
      } catch (err) {
        console.error('Error fetching rent cars:', err);
        setError(err.message || 'Failed to fetch rent cars');
        setCars([]);
        setFilteredCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRentCars();
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

  const formatPrice = (price, availabilityType) => {
    if (!price) return 'Price on call';
    const formattedPrice = `PKR ${price.toLocaleString()}`;
    const typeLabel = availabilityType === 'day' ? '/day' : availabilityType === 'week' ? '/week' : '/month';
    return `${formattedPrice}${typeLabel}`;
  };

  const getFirstImage = (car) => {
    if (car.image1) return car.image1;
    if (car.image) return car.image;
    if (car.images && car.images.length > 0) return car.images[0];
    return null;
  };

  return (
    <>
      <Helmet>
        <title>Rent Car - Find Cars for Rent | Auto Finder</title>
        <meta name="description" content="Find cars for rent in Pakistan. Browse available rental cars with daily, weekly, and monthly rates." />
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-2 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">Rent Car</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Find cars available for rent</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">Loading rent cars...</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                {[1, 2, 3, 4].map((i) => (
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
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
              <p className="text-yellow-800 dark:text-yellow-400 font-semibold mb-2">Unable to load rent cars</p>
              <p className="text-yellow-700 dark:text-yellow-500 text-sm mb-2">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-800"
              >
                Retry
              </button>
            </div>
          )}

          {/* No Cars Found */}
          {!loading && !error && filteredCars.length === 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-2 font-semibold text-lg">
                No rent cars found
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Try again later</p>
            </div>
          )}

          {/* Rent Cars List */}
          {!loading && !error && filteredCars.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'} available for rent
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCars.map((car) => {
                  const imageUrl = buildImageUrl(getFirstImage(car));

                  return (
                    <div key={car._id || Math.random()} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group flex flex-col">
                      <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="absolute top-2 left-2 bg-red-600 dark:bg-red-700 text-white px-2 py-1 rounded text-xs font-semibold">
                          RENT
                        </span>
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2 text-gray-800 dark:text-gray-200">
                          {car.make} {car.model} {car.year && `(${car.year})`}
                        </h3>
                        <div className="mb-3">
                          <span className="text-red-600 dark:text-red-500 font-bold text-xl">
                            {formatPrice(car.price, car.availabilityType)}
                          </span>
                        </div>

                        {car.availabilityType && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <FaTag className="text-red-600 dark:text-red-500" />
                            <span className="capitalize">{car.availabilityType}</span>
                          </div>
                        )}

                        {car.transmission && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <FaCog className="text-red-600 dark:text-red-500" />
                            <span>{car.transmission}</span>
                          </div>
                        )}

                        {car.engineCapacity && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <FaBolt className="text-red-600 dark:text-red-500" />
                            <span>{car.engineCapacity} CC</span>
                          </div>
                        )}

                        {car.kmDriven && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <FaCar className="text-red-600 dark:text-red-500" />
                            <span>{car.kmDriven.toLocaleString()} km</span>
                          </div>
                        )}

                        {car.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <FaMapMarkerAlt className="text-red-600 dark:text-red-500" />
                            <span className="truncate">{car.location}</span>
                          </div>
                        )}

                        {/* Spacer to push button to bottom */}
                        <div className="flex-grow"></div>

                        <Link
                          to={`/used-car-detail/${car._id}`}
                          className="block w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-center py-2 rounded-lg transition-all transform hover:scale-105 font-semibold text-sm shadow-md hover:shadow-lg mt-auto"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default RentCarList;

