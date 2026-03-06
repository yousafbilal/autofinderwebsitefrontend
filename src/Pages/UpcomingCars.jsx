import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';

function UpcomingCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpcomingCars = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL = server_ip || 'http://localhost:8001';
        // Fetch from new_cars as upcoming cars (cars that are coming soon)
        const endpoint = `${API_URL}/new_cars`;

        console.log('🔄 Fetching upcoming cars from:', endpoint);

        const response = await fetchWithRetry(endpoint, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Upcoming cars received:', data.length);

        if (Array.isArray(data) && data.length > 0) {
          // Filter for active new cars and take latest 9
          const upcomingCars = data
            .filter(car => car.make && car.model && car.status === 'active')
            .sort((a, b) => {
              const dateA = new Date(a.dateAdded || a.createdAt || 0);
              const dateB = new Date(b.dateAdded || b.createdAt || 0);
              return dateB - dateA;
            })
            .slice(0, 9);

          setCars(upcomingCars);
          console.log('✅ Upcoming cars set:', upcomingCars.length);
        } else {
          setCars([]);
        }
      } catch (err) {
        console.error('❌ Error fetching upcoming cars:', err);
        setError(err.message || 'Failed to fetch upcoming cars');
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingCars();
  }, []);

  const buildImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ECar Image%3C/text%3E%3C/svg%3E';
    }
    if (imagePath.startsWith('http')) return imagePath;

    const API_URL = server_ip || 'http://localhost:8001';
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_URL}/uploads/${cleanPath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Upcoming Cars - Auto Finder</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8">Upcoming Cars</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden animate-pulse transition-colors">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
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
          <title>Upcoming Cars - Auto Finder</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
          <div className="container mx-auto px-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center transition-colors">
              <p className="text-yellow-800 dark:text-yellow-400 font-semibold mb-2">Unable to load upcoming cars</p>
              <p className="text-yellow-700 dark:text-yellow-500 text-sm mb-2">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-600"
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
        <title>Upcoming Cars - Auto Finder</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-2 transition-colors">
        <div className="container mx-auto px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Upcoming Cars</h1>

          {cars.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center transition-colors">
              <p className="text-gray-600 dark:text-gray-400 mb-2 font-semibold">No upcoming cars available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cars.map((car) => {
                const imageUrl = buildImageUrl(car.image1);
                const carName = `${car.make || ''} ${car.model || ''} ${car.variant || ''}`.trim();
                return (
                  <div key={car._id || car.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden hover:shadow-xl transition-colors">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={carName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ECar Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <span className="absolute top-2 right-2 bg-blue-500 dark:bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">UPCOMING</span>
                    </div>
                    <div className="p-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{formatDate(car.dateAdded || car.createdAt)}</div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{carName}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {car.description || car.excerpt || `${carName} - Coming soon with advanced features`}
                      </p>
                      <Link
                        to={`/car-detail/${car._id}`}
                        className="block w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white text-center py-2 rounded-md transition"
                      >
                        Learn More
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

export default UpcomingCars;

