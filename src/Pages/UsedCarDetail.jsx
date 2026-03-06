import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaCar, FaMapMarkerAlt, FaCalendarAlt, FaCog, FaBolt, FaPhone, FaStar } from 'react-icons/fa';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';
import { useLanguage } from '../contexts/LanguageContext';

function UsedCarDetail() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      if (!id) {
        setError('Car ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const API_URL = server_ip || 'http://localhost:8001';
        const endpoint = `${API_URL}/all_ads/${id}`;

        console.log('🔄 Fetching car details for ID:', id);
        console.log('🔗 Endpoint:', endpoint);

        const response = await fetchWithRetry(endpoint);

        console.log('📡 Response status:', response.status, response.statusText);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Car not found');
            console.error('❌ Car not found with ID:', id);
          } else {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
          }
          return;
        }

        const carData = await response.json();

        if (carData) {
          setCar(carData);
          // Set first image as selected
          if (carData.image1) {
            setSelectedImage(carData.image1);
          }
          console.log('✅ Car data loaded:', carData);
          console.log('✅ Car images:', {
            image1: carData.image1,
            image2: carData.image2,
            image3: carData.image3,
            image4: carData.image4
          });
        } else {
          setError('Car not found');
          console.error('❌ Car data is null');
        }
      } catch (err) {
        console.error('❌ Error fetching car details:', err);
        setError(err.message || 'Failed to fetch car details');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  const buildImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') {
      return null;
    }

    // Skip base64 images
    if (imagePath.startsWith('data:image')) return imagePath;

    // Skip local file paths
    if (imagePath.startsWith('file://')) return null;

    // Already a full URL - return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    const API_URL = server_ip || 'http://localhost:8001';

    // Remove leading slash if present
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

    // Build full URL - ensure /uploads/ is in the path
    if (cleanPath.startsWith('uploads/')) {
      return `${API_URL}/${cleanPath}`;
    }

    // Default: prepend /uploads/
    return `${API_URL}/uploads/${cleanPath}`;
  };

  // Function to try alternative image URLs
  const tryAlternativeImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') return null;

    // Extract filename from path
    let filename = imagePath;
    if (imagePath.includes('/')) {
      filename = imagePath.split('/').pop();
    }

    const API_URL = server_ip || 'http://localhost:8001';
    const serverUrls = [
      API_URL,
      'http://localhost:8001',
      'https://backend.autofinder.pk',
      'http://backend.autofinder.pk'
    ];

    // Return first alternative URL to try
    for (const baseUrl of serverUrls) {
      const altUrl = `${baseUrl}/uploads/${filename}`;
      if (altUrl !== buildImageUrl(imagePath)) {
        return altUrl;
      }
    }

    return null;
  };

  const formatPrice = (price) => {
    if (!price) return t('priceOnCall');
    return `${t('pkr')} ${price.toLocaleString()}`;
  };

  const formatMileage = (km) => {
    if (!km) return t('na');
    return `${km.toLocaleString()} ${t('km')}`;
  };

  // Get all available images (check up to image20 for featured ads)
  const getAllImages = () => {
    if (!car) return [];
    const images = [];
    // Check image1 through image20 (featured ads can have up to 20 images)
    for (let i = 1; i <= 20; i++) {
      const imgKey = `image${i}`;
      if (car[imgKey]) {
        images.push(car[imgKey]);
      }
    }
    // Also check for images array if present
    if (car.images && Array.isArray(car.images) && car.images.length > 0) {
      car.images.forEach(img => {
        if (img && !images.includes(img)) {
          images.push(img);
        }
      });
    }
    return images;
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>{t('loadingCarDetails')} - Auto Finder</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-4 transition-colors">
                  <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-6 transition-colors">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !car) {
    return (
      <>
        <Helmet>
          <title>{t('carNotFound')} - Auto Finder</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
          <div className="container mx-auto px-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center transition-colors">
              <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-400 mb-4">{t('carNotFound')}</h2>
              <p className="text-yellow-700 dark:text-yellow-500 mb-4">{error || t('carNotFoundDesc')}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/used-cars')}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-6 py-3 rounded-md font-semibold transition"
                >
                  {t('browseUsedCars')}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-md font-semibold transition"
                >
                  {t('goBack')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const carName = `${car.make || ''} ${car.model || ''} ${car.variant || ''} ${car.year || ''}`.trim();
  const images = getAllImages();
  const mainImage = selectedImage || images[0] || car.image1;

  return (
    <>
      <Helmet>
        <title>{carName} - Auto Finder</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-red-600 dark:hover:text-red-500">{t('home')}</Link>
            <span className="mx-2">/</span>
            <Link to="/used-cars" className="hover:text-red-600 dark:hover:text-red-500">{t('usedCars')}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 dark:text-gray-200">{carName}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Car Images */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-4 transition-colors">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden relative">
                {mainImage ? (
                  <img
                    src={buildImageUrl(mainImage)}
                    alt={carName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('❌ Main image failed to load:', buildImageUrl(mainImage));
                      console.error('   Original image path:', mainImage);
                      // Try alternative URL
                      const altUrl = tryAlternativeImageUrl(mainImage);
                      if (altUrl && altUrl !== e.target.src) {
                        console.log('🔄 Trying alternative URL:', altUrl);
                        e.target.src = altUrl;
                      } else {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }
                    }}
                    onLoad={() => {
                      console.log('✅ Main image loaded successfully:', buildImageUrl(mainImage));
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-400 dark:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`h-20 bg-gray-200 dark:bg-gray-700 rounded cursor-pointer overflow-hidden border-2 ${selectedImage === img ? 'border-red-600 dark:border-red-500' : 'border-transparent hover:border-gray-400 dark:hover:border-gray-600'
                        }`}
                    >
                      {img ? (
                        <img
                          src={buildImageUrl(img)}
                          alt={`${carName} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const altUrl = tryAlternativeImageUrl(img);
                            if (altUrl && altUrl !== e.target.src) {
                              e.target.src = altUrl;
                            } else {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="80"%3E%3Crect fill="%23ddd" width="100" height="80"/%3E%3C/svg%3E';
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Car Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-6 transition-colors">
              <div className="mb-4 flex flex-wrap gap-2">
                {car.sourceType === 'Managed by AutoFinder' && (
                  <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">{t('managedByAutofinder')}</span>
                )}
                {car.sourceType === 'Premium Cars' && (
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded text-sm font-semibold flex items-center gap-1">
                    <FaStar className="text-xs" />
                    {t('premium')}
                  </span>
                )}
                {car.sourceType === 'Free Ads' && (
                  <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">{t('freeAd')}</span>
                )}
                {car.location && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold flex items-center gap-1">
                    <FaMapMarkerAlt className="text-xs" />
                    {t(car.location.toLowerCase().replace(/[\s\-\/]/g, '')) || car.location}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">{carName}</h1>

              <div className="mb-6">
                <span className="text-red-600 dark:text-red-500 font-bold text-4xl">{formatPrice(car.price)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {car.year && (
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-red-600 dark:text-red-500" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t('year')}</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{car.year}</div>
                    </div>
                  </div>
                )}
                {car.kmDriven && (
                  <div className="flex items-center gap-2">
                    <FaCar className="text-red-600 dark:text-red-500" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t('mileage')}</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{formatMileage(car.kmDriven)}</div>
                    </div>
                  </div>
                )}
                {car.transmission && (
                  <div className="flex items-center gap-2">
                    <FaCog className="text-red-600 dark:text-red-500" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t('transmission')}</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{t(car.transmission.toLowerCase())}</div>
                    </div>
                  </div>
                )}
                {car.engineCapacity && (
                  <div className="flex items-center gap-2">
                    <FaBolt className="text-red-600 dark:text-red-500" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t('engine')}</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{car.engineCapacity}</div>
                    </div>
                  </div>
                )}
                {car.fuelType && (
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('fuelType')}</div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{t(car.fuelType.toLowerCase())}</div>
                  </div>
                )}
                {car.color && (
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('color')}</div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{t(car.color.toLowerCase())}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mb-6">
                <button className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white py-3 px-6 rounded-md font-semibold transition flex items-center justify-center gap-2">
                  <FaPhone />
                  {t('contactSeller')}
                </button>
                <Link
                  to="/compare-cars"
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-md font-semibold transition text-center flex items-center justify-center"
                >
                  {t('compare')}
                </Link>
              </div>

              {car.phoneNumber && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 transition-colors">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <FaPhone className="text-red-600 dark:text-red-500" />
                    <span className="font-semibold">{car.phoneNumber}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Car Description */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-6 mb-8 transition-colors">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('carDescription')}</h2>
            {car.description ? (
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{car.description}</p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                {carName} is available for sale. This vehicle is in excellent condition and ready for immediate use.
                Contact the seller for more details and to schedule a viewing.
              </p>
            )}
          </div>

          {/* Additional Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-6 transition-colors">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('additionalDetails')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {car.bodyType && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('bodyType')}</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{t(car.bodyType.toLowerCase())}</div>
                </div>
              )}
              {car.driveType && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('driveType')}</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{car.driveType}</div>
                </div>
              )}
              {car.seats && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('seats')}</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{car.seats}</div>
                </div>
              )}
              {car.condition && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('condition')}</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{car.condition}</div>
                </div>
              )}
              {car.registrationCity && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('registrationCity')}</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{t(car.registrationCity.toLowerCase().replace(/[\s\-\/]/g, '')) || car.registrationCity}</div>
                </div>
              )}
              {car.assembly && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('assembly')}</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{t(car.assembly.toLowerCase())}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UsedCarDetail;
