import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaMapMarkerAlt, FaCalendarAlt, FaCog, FaBolt, FaTag, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';
import { useLanguage } from '../contexts/LanguageContext';

const RentCars = () => {
  const { t } = useLanguage();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    const fetchRentCars = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL = server_ip || 'http://localhost:8001';
        const endpoint = `${API_URL}/rent_car`;

        console.log('🔄 Fetching rent cars from:', endpoint);

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

          console.log(`✅ Total rent cars: ${data.length}, Valid: ${validCars.length}`);

          if (validCars.length > 0) {
            setCars(validCars.slice(0, 8)); // Show first 8 cars
          } else {
            setCars([]);
          }
        } else {
          setCars([]);
        }
      } catch (err) {
        console.error('❌ Error fetching rent cars:', err);
        setError(err.message || 'Failed to fetch rent cars');
        setCars([]);
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
          <p className="text-gray-600 dark:text-gray-400">Loading rent cars...</p>
        </div>
        <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex-shrink-0 w-[160px] xs:w-[180px] sm:w-[200px] md:w-[220px] bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900 overflow-hidden animate-pulse transition-colors">
              <div className="h-24 sm:h-28 md:h-32 bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-2 sm:p-2.5">
                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1.5 sm:mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
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
        <p className="text-yellow-800 dark:text-yellow-400 font-semibold mb-2 text-sm sm:text-base">{t('unableToLoad')} {t('rentCar').toLowerCase()}</p>
        <p className="text-yellow-700 dark:text-yellow-500 text-xs sm:text-sm mb-2">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 sm:mt-4 bg-red-600 dark:bg-red-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm hover:bg-red-700 dark:hover:bg-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (cars.length === 0 && !loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6 md:p-8 text-center transition-colors">
        <p className="text-gray-600 dark:text-gray-400 mb-2 font-semibold text-sm sm:text-base">No rent cars available at the moment.</p>
        <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs mt-2">Check back later for updates.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
          aria-label="Scroll left"
        >
          <FaChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-500" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollPosition}
        className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
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
              className="car-card flex-shrink-0 w-[160px] xs:w-[180px] sm:w-[200px] md:w-[220px] bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg dark:shadow-gray-900 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group flex flex-col"
            >
              <div className="h-24 sm:h-28 md:h-32 bg-gray-200 dark:bg-gray-700 relative overflow-hidden flex-shrink-0">
                <img
                  src={imageUrl}
                  alt={`${car.make || 'Car'} ${car.model || ''}`}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ECar Image%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 bg-red-600 text-white px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold shadow-lg z-10 flex items-center gap-0.5 sm:gap-1">
                  <FaTag className="text-[10px] sm:text-xs" />
                  <span className="hidden xs:inline">RENT</span>
                  <span className="xs:hidden">R</span>
                </div>

                {car.isBoosted && (
                  <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-red-600 text-white px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold shadow-lg">
                    <span className="hidden xs:inline">BOOSTED</span>
                    <span className="xs:hidden">B</span>
                  </div>
                )}
              </div>

              <div className="p-2 sm:p-2.5 flex flex-col flex-grow">
                <h3 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-1.5 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-1 text-gray-800 dark:text-gray-200">
                  {car.make} {car.model} {car.variant ? car.variant : ''} {car.year}
                </h3>

                <div className="mb-1 sm:mb-1.5">
                  <span className="text-red-600 dark:text-red-500 font-bold text-sm sm:text-base">{formatPrice(car.price)}</span>
                  {car.availabilityType && (
                    <span className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 ml-1 sm:ml-2">/ {car.availabilityType}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2">
                  {car.year && (
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt className="text-red-600 dark:text-red-500" />
                      {car.year}
                    </span>
                  )}
                  {car.transmission && (
                    <span className="flex items-center gap-1">
                      <FaCog className="text-red-600 dark:text-red-500" />
                      {car.transmission}
                    </span>
                  )}
                  {car.engineCapacity && (
                    <span className="flex items-center gap-1">
                      <FaBolt className="text-red-600 dark:text-red-500" />
                      {car.engineCapacity}
                    </span>
                  )}
                  {car.kmDriven && (
                    <span className="flex items-center gap-1">
                      <FaCar className="text-red-600 dark:text-red-500" />
                      {car.kmDriven.toLocaleString()} km
                    </span>
                  )}
                </div>

                {car.location && (
                  <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2">
                    <FaMapMarkerAlt className="text-red-600 dark:text-red-500 text-[10px] sm:text-xs" />
                    <span className="truncate">{car.location}</span>
                  </div>
                )}

                {/* Spacer to push button to bottom */}
                <div className="flex-grow"></div>

                <Link
                  to={`/rent-car/${car._id}`}
                  className="block w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-center py-1 sm:py-1.5 rounded-lg transition-all transform hover:scale-105 font-semibold text-[10px] sm:text-xs shadow-md hover:shadow-lg mt-auto"
                >
                  View Details
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
          to="/rent-car"
          className="inline-flex items-center gap-1.5 sm:gap-2 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-600 font-semibold text-xs sm:text-sm transition-colors"
        >
          {t('viewAll')}
          <FaChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>
      </div>
    </div>
  );
};

export default RentCars;

