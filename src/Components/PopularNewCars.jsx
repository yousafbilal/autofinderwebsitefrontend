import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaCalendarAlt, FaCog, FaBolt, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';
import { useLanguage } from '../contexts/LanguageContext';

const PopularNewCars = () => {
  const { t } = useLanguage();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  console.log('🎯 PopularNewCars component rendered');

  useEffect(() => {
    console.log('🚀 PopularNewCars component mounted');

    const fetchPopularNewCars = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL = server_ip || 'http://localhost:8001';
        const endpoint = `${API_URL}/new_cars`;

        console.log('🔗 Using API URL:', API_URL);
        console.log('🔗 Full endpoint:', endpoint);
        console.log('🔄 Fetching popular new cars from:', endpoint);


        const response = await fetchWithRetry(endpoint, {
          method: 'GET',
        });

        console.log('📡 Response status:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Response error:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Raw data received:', data);
        console.log('📦 Data type:', typeof data);
        console.log('📦 Is array:', Array.isArray(data));
        console.log('📦 Data length:', Array.isArray(data) ? data.length : 'N/A');

        if (Array.isArray(data) && data.length > 0) {
          // Backend already filters for: status: 'active', isDeleted: false
          // Filter on frontend: Show only cars with required fields
          const validCars = data.filter((car) => {
            const hasRequiredFields = car.make && car.model;
            const isActive = car.status === 'active';
            const isNotDeleted = !car.isDeleted;

            const isValid = hasRequiredFields && isActive && isNotDeleted;

            if (!isValid) {
              console.log(`⚠️ Car filtered out: ${car._id}`, {
                hasRequiredFields,
                isActive,
                isNotDeleted,
                status: car.status,
                make: car.make,
                model: car.model
              });
            }

            return isValid;
          });

          console.log(`✅ Total cars from backend: ${data.length}`);
          console.log(`✅ Valid cars after filtering: ${validCars.length}`);
          console.log('✅ Valid cars data:', validCars.map(car => ({
            _id: car._id,
            make: car.make,
            model: car.model,
            price: car.price,
            status: car.status,
            isDeleted: car.isDeleted
          })));

          if (validCars.length > 0) {
            setCars(validCars.slice(0, 8)); // Show first 8 cars
            console.log('✅ Cars set successfully:', validCars.slice(0, 8).length);
          } else {
            console.warn('⚠️ No valid cars found after filtering');
            setCars([]);
          }
        } else {
          console.warn('⚠️ No cars found or data is not an array');
          console.warn('⚠️ Data received:', data);
          setCars([]);
        }
      } catch (err) {
        console.error('❌ Error fetching popular new cars:', err);
        console.error('❌ Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        setError(err.message || 'Failed to fetch popular new cars');
        setCars([]);
      } finally {
        setLoading(false);
        console.log('✅ Loading completed');
      }
    };

    fetchPopularNewCars();
  }, []);

  const buildImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
    }
    if (imagePath.startsWith('http')) return imagePath;

    const API_URL = server_ip || 'http://localhost:8001';
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const fullUrl = `${API_URL}/uploads/${cleanPath}`;
    console.log('🖼️ Building image URL:', imagePath, '->', fullUrl);
    return fullUrl;
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on call';
    return `PKR ${price.toLocaleString()}`;
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.car-card')?.offsetWidth || 220;
      const gap = 24;
      const scrollAmount = (cardWidth + gap) * 4;
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.car-card')?.offsetWidth || 220;
      const gap = 24;
      const scrollAmount = (cardWidth + gap) * 4;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Update arrows when cars change
  useEffect(() => {
    if (cars.length > 0 && !loading) {
      setTimeout(() => {
        checkScrollPosition();
      }, 100);
    }
  }, [cars, loading]);

  if (loading) {
    return (
      <div>
        <div className="text-center mb-4">
          <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex-shrink-0 w-[240px] md:w-[280px] bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900 overflow-hidden animate-pulse transition-colors">
              <div className="h-40 sm:h-44 md:h-48 bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-3 sm:p-4">
                <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2 sm:mb-3"></div>
                <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4 sm:p-6 text-center transition-colors">
        <p className="text-yellow-800 dark:text-yellow-400 font-semibold mb-2 text-sm sm:text-base">{t('unableToLoad')} {t('popularNewCars').toLowerCase()}</p>
        <p className="text-yellow-700 dark:text-yellow-500 text-xs sm:text-sm mb-2">Error: {error}</p>
        <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">Please check browser console (F12) for more details</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 sm:mt-4 bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (cars.length === 0 && !loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6 md:p-8 text-center transition-colors">
        <p className="text-gray-600 dark:text-gray-400 mb-2 font-semibold text-sm sm:text-base">No popular new cars available at the moment.</p>
        {error && (
          <p className="text-red-600 dark:text-red-500 text-xs sm:text-sm mt-2">Error: {error}</p>
        )}
        <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs mt-2">Check browser console (F12) for details.</p>
        <p className="text-gray-400 dark:text-gray-500 text-[10px] sm:text-xs mt-1">Make sure backend is running and accessible.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
          aria-label="Scroll left"
        >
          <FaChevronLeft className="w-5 h-5 text-red-600 dark:text-red-500" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollPosition}
        className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {cars.map((car) => {
          const imageUrl = buildImageUrl(car.image1);

          return (
            <div
              key={car._id || Math.random()}
              className="car-card flex-shrink-0 w-[240px] md:w-[280px] bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group flex flex-col"
            >
              <div className="h-40 sm:h-44 md:h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden flex-shrink-0">
                <img
                  src={imageUrl}
                  alt={`${car.make || 'Car'} ${car.model || ''}`}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    console.error('❌ Image failed to load:', imageUrl);
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ECar Image%3C/text%3E%3C/svg%3E';
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully:', imageUrl);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-[10px] sm:text-xs font-bold shadow-lg z-10">
                  {t('new')}
                </div>

                {car.featured && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-[10px] sm:text-xs font-bold shadow-lg flex items-center gap-1">
                    <FaStar className="text-xs" />
                    <span className="hidden xs:inline">{t('featured')}</span>
                    <span className="xs:hidden">F</span>
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-4 flex flex-col flex-grow">
                <h3 className="text-sm sm:text-base font-bold mb-2 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-1 text-gray-800 dark:text-gray-200">
                  {car.make} {car.model} {car.variant ? car.variant : ''} {car.year}
                </h3>

                <div className="mb-2">
                  <span className="text-red-600 dark:text-red-500 font-extrabold text-base sm:text-lg">{formatPrice(car.price)}</span>
                </div>

                <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {car.year && (
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt className="text-red-600 dark:text-red-500 text-xs" />
                      {car.year}
                    </span>
                  )}
                  {car.transmission && (
                    <span className="flex items-center gap-1">
                      <FaCog className="text-red-600 dark:text-red-500 text-xs" />
                      {car.transmission}
                    </span>
                  )}
                  {car.fuelType && (
                    <span className="flex items-center gap-1">
                      <FaBolt className="text-red-600 dark:text-red-500 text-xs" />
                      {car.fuelType}
                    </span>
                  )}
                  {car.bodyType && (
                    <span className="flex items-center gap-1">
                      <FaCar className="text-red-600 dark:text-red-500 text-xs" />
                      {car.bodyType}
                    </span>
                  )}
                </div>

                {/* Spacer to push button to bottom */}
                <div className="flex-grow"></div>

                <Link
                  to={`/car-detail/${car._id}`}
                  className="block w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-center py-2 sm:py-2.5 rounded-xl transition-all transform hover:scale-105 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg mt-auto"
                >
                  {t('viewDetails')}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={scrollRight}
          className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
          aria-label="Scroll right"
        >
          <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-500" />
        </button>
      )}

      {/* See All Link */}
      <div className="text-center mt-4 sm:mt-6">
        <Link
          to="/search-cars"
          className="inline-flex items-center gap-1.5 sm:gap-2 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-600 font-semibold text-xs sm:text-sm transition-colors"
        >
          {t('viewAll')}
          <FaChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>
      </div>
    </div>
  );
};

export default PopularNewCars;

