import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../Context/LanguageContext';
import { server_ip } from '../Utils/Data';
import { toast } from 'react-toastify';

// Component to handle ad image with error handling
const AdImageComponent = ({ ad, getAdImage, getAdTitle }) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const imageUrl = getAdImage(ad);
  const API_URL = server_ip;

  useEffect(() => {
    // Reset error state when image URL changes
    setImageError(false);
    setAttemptCount(0);
    setCurrentImageUrl(imageUrl);
  }, [imageUrl]);

  // Function to generate alternative image URLs
  const getAlternativeUrls = (originalPath) => {
    const alternatives = [];

    // Extract filename from path
    let filename = originalPath;
    if (originalPath && originalPath.includes('/')) {
      filename = originalPath.split('/').pop();
    }

    if (!filename) return alternatives;

    // Try different server URLs
    const serverUrls = [
      API_URL,
      'http://localhost:8001',
      'https://backend.autofinder.pk',
      'http://backend.autofinder.pk'
    ];

    // Generate multiple URL variations
    for (const baseUrl of serverUrls) {
      // Variation 1: /uploads/filename (most common)
      alternatives.push(`${baseUrl}/uploads/${filename}`);
      // Variation 2: Direct filename (if server serves from root)
      alternatives.push(`${baseUrl}/${filename}`);
    }

    // Remove duplicates and original
    return [...new Set(alternatives)].filter(url => url !== originalPath);
  };

  // Handle image load error - try alternatives sequentially
  const handleImageError = (e) => {
    const failedUrl = currentImageUrl || imageUrl;

    // Only log error once per ad to reduce console spam
    if (attemptCount === 0) {
      console.warn('⚠️ Image not found for ad:', ad._id, 'URL:', failedUrl);
    }

    // Try alternatives if we haven't tried them all yet
    const alternatives = getAlternativeUrls(failedUrl);
    const maxAttempts = Math.min(alternatives.length, 3); // Try max 3 alternatives

    if (attemptCount < maxAttempts && alternatives[attemptCount]) {
      const nextUrl = alternatives[attemptCount];
      setAttemptCount(prev => prev + 1);
      setCurrentImageUrl(nextUrl);
      e.target.src = nextUrl;
      return; // Don't set error yet, try the alternative
    }

    // All attempts failed, show placeholder
    setImageError(true);
    e.target.style.display = 'none';
  };

  // Use currentImageUrl if set, otherwise use imageUrl
  const displayUrl = currentImageUrl || imageUrl;

  // Show placeholder if error or no URL
  if (imageError || !displayUrl) {
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
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
    );
  }

  // Try to load image
  return (
    <img
      key={`img-${ad._id}-${displayUrl}`}
      src={displayUrl}
      alt={getAdTitle(ad)}
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      onError={handleImageError}
      onLoad={() => {
        // Only log success in development mode to reduce console spam
        if (process.env.NODE_ENV === 'development' && attemptCount === 0) {
          console.log('✅ Image loaded:', displayUrl.substring(0, 50) + '...');
        }
        setImageError(false);
      }}
    />
  );
};

function MyAds() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [, setUser] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, inactive, pending

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/signin');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      fetchUserAds(userData.userId);
    } catch (e) {
      console.error('Error parsing user data:', e);
      navigate('/signin');
    }
  }, [navigate]);

  const fetchUserAds = async (userId) => {
    try {
      setLoading(true);
      // FORCE 8001 - Standardize for connectivity
      const API_URL = server_ip;
      console.log(`📡 [FORCED FIX] Fetching user ads from: ${API_URL}`);

      const fetchWithRetry = async (url, options = {}) => {
        try {
          const res = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit',
          });
          return res;
        } catch (err) {
          console.warn(`⚠️ Retrying fetch for ${url} (localhost fallback)`);
          const fallbackUrl = url.includes('127.0.0.1')
            ? url.replace('127.0.0.1', 'localhost')
            : url.replace('localhost', '127.0.0.1');
          return fetch(fallbackUrl, {
            ...options,
            headers: {
              ...options.headers,
              'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit',
          });
        }
      };

      const response = await fetchWithRetry(`${API_URL}/all_user_ads/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch ads');
      }

      const data = await response.json();
      const adsArray = Array.isArray(data) ? data : [];

      // Filter out deleted ads on frontend as well (double check)
      const nonDeletedAds = adsArray.filter(ad => {
        // Check if ad is deleted
        if (ad.isDeleted === true) {
          return false;
        }
        // Some collections might not have isDeleted field, so check if it exists and is false
        if (ad.isDeleted !== undefined && ad.isDeleted !== false) {
          return false;
        }
        return true;
      });

      console.log(`📋 Total ads: ${adsArray.length}, Non-deleted ads: ${nonDeletedAds.length}`);

      // Debug: Log first ad structure to understand image format
      if (nonDeletedAds.length > 0) {
        console.log('📸 First ad structure:', {
          id: nonDeletedAds[0]._id,
          title: nonDeletedAds[0].title || nonDeletedAds[0].make,
          adType: nonDeletedAds[0].adType,
          isDeleted: nonDeletedAds[0].isDeleted,
          imageFields: Object.keys(nonDeletedAds[0]).filter(key =>
            key.toLowerCase().includes('image') ||
            key.toLowerCase().includes('photo') ||
            key.toLowerCase().includes('picture')
          ),
          sampleImageData: {
            image1: nonDeletedAds[0].image1,
            image2: nonDeletedAds[0].image2,
            images: nonDeletedAds[0].images,
            image: nonDeletedAds[0].image
          }
        });
      }

      setAds(nonDeletedAds);
      setError(null);
    } catch (err) {
      console.error('Error fetching ads:', err);
      setError('Failed to load your ads. Please try again later.');
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const getAdImage = (ad) => {
    if (!ad) return null;

    const API_URL = server_ip;

    // Helper function to build image URL
    const buildImageUrl = (imagePath) => {
      if (!imagePath || typeof imagePath !== 'string') return null;

      // Skip base64 images (data:image)
      if (imagePath.startsWith('data:image')) return null;

      // Skip local file paths (file://)
      if (imagePath.startsWith('file://')) return null;

      // Already a full URL - return as is
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }

      // Remove leading slash if present
      const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

      // Build full URL - ensure /uploads/ is in the path
      if (cleanPath.startsWith('uploads/')) {
        return `${API_URL}/${cleanPath}`;
      }

      // Default: prepend /uploads/
      return `${API_URL}/uploads/${cleanPath}`;
    };

    // 1) Check for generic images array (if backend returns it)
    if (ad.images && Array.isArray(ad.images) && ad.images.length > 0) {
      for (const img of ad.images) {
        const url = buildImageUrl(img);
        if (url) {
          console.log('✅ Found image in ad.images array:', url, 'for ad:', ad._id);
          return url;
        }
      }
    }

    // 2) Check for single image field
    if (ad.image) {
      const url = buildImageUrl(ad.image);
      if (url) {
        console.log('✅ Found image in ad.image field:', url, 'for ad:', ad._id);
        return url;
      }
    }

    // 3) Check for adData.images (used in some pending ads)
    if (ad.adData?.images && Array.isArray(ad.adData.images) && ad.adData.images.length > 0) {
      for (const img of ad.adData.images) {
        const url = buildImageUrl(img);
        if (url) {
          console.log('✅ Found image in adData.images:', url, 'for ad:', ad._id);
          return url;
        }
      }
    }

    // 4) Check for image1, image2, ..., image20 fields (most common for car ads from mobile app)
    //    Sort by image number so image1 is preferred over image10, etc.
    const imageKeys = Object.keys(ad)
      .filter((key) => {
        const lowerKey = key.toLowerCase();
        // Match image1, image2, etc. but not images (array)
        if (lowerKey === 'images' || lowerKey === 'image') return false;
        return lowerKey.startsWith('image') && ad[key];
      })
      .sort((a, b) => {
        const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
        return numA - numB;
      });

    if (imageKeys.length > 0) {
      for (const key of imageKeys) {
        const imageValue = ad[key];

        // Handle array values
        if (Array.isArray(imageValue) && imageValue.length > 0) {
          for (const img of imageValue) {
            const url = buildImageUrl(img);
            if (url) {
              console.log(`✅ Found image in ${key} array:`, url, 'for ad:', ad._id);
              return url;
            }
          }
        }
        // Handle string values
        else if (typeof imageValue === 'string' && imageValue.trim().length > 0) {
          const url = buildImageUrl(imageValue);
          if (url) {
            console.log(`✅ Found image in ${key} field:`, url, 'for ad:', ad._id);
            return url;
          }
        }
      }
    }

    // 5) Check nested objects (for mobile app ads that might store differently)
    if (ad.carImages && Array.isArray(ad.carImages) && ad.carImages.length > 0) {
      const url = buildImageUrl(ad.carImages[0]);
      if (url) {
        console.log('✅ Found image in carImages:', url, 'for ad:', ad._id);
        return url;
      }
    }

    if (ad.vehicleImages && Array.isArray(ad.vehicleImages) && ad.vehicleImages.length > 0) {
      const url = buildImageUrl(ad.vehicleImages[0]);
      if (url) {
        console.log('✅ Found image in vehicleImages:', url, 'for ad:', ad._id);
        return url;
      }
    }

    // 6) Check for photo fields (some mobile apps use 'photo' instead of 'image')
    const photoKeys = Object.keys(ad)
      .filter((key) => {
        const lowerKey = key.toLowerCase();
        return lowerKey.includes('photo') && ad[key];
      });

    for (const key of photoKeys) {
      const photoValue = ad[key];
      if (Array.isArray(photoValue) && photoValue.length > 0) {
        const url = buildImageUrl(photoValue[0]);
        if (url) {
          console.log(`✅ Found image in ${key}:`, url, 'for ad:', ad._id);
          return url;
        }
      } else if (typeof photoValue === 'string') {
        const url = buildImageUrl(photoValue);
        if (url) {
          console.log(`✅ Found image in ${key}:`, url, 'for ad:', ad._id);
          return url;
        }
      }
    }

    // 7) Debug: Log ad structure if no image found
    console.log('⚠️ No image found for ad:', {
      id: ad._id,
      title: ad.title || ad.make || 'Unknown',
      adType: ad.adType,
      availableFields: Object.keys(ad).filter(key =>
        key.toLowerCase().includes('image') ||
        key.toLowerCase().includes('photo') ||
        key.toLowerCase().includes('picture')
      ),
      sampleImageData: {
        image1: ad.image1,
        image2: ad.image2,
        image3: ad.image3,
        images: ad.images,
        image: ad.image,
        carImages: ad.carImages,
        vehicleImages: ad.vehicleImages
      },
      allKeys: Object.keys(ad).slice(0, 20) // First 20 keys for debugging
    });

    return null;
  };

  const getAdTitle = (ad) => {
    if (ad.title) return ad.title;
    if (ad.adData?.title) return ad.adData.title;
    if (ad.make && ad.model) return `${ad.make} ${ad.model}`;
    if (ad.adData?.make && ad.adData?.model) return `${ad.adData.make} ${ad.adData.model}`;
    return t('untitledAd');
  };

  const getAdPrice = (ad) => {
    if (ad.price) return ad.price;
    if (ad.adData?.price) return ad.adData.price;
    return 0;
  };

  const getAdLocation = (ad) => {
    if (ad.location) return ad.location;
    if (ad.adData?.location) return ad.adData.location;
    if (ad.city) return ad.city;
    if (ad.adCity) return ad.adCity;
    return 'N/A';
  };

  const getAdDetailLink = (ad) => {
    if (ad.adType === 'bike') {
      return `/bike-detail/${ad._id}`;
    } else if (ad.adType === 'autoparts') {
      return `/auto-part-detail/${ad._id}`;
    } else if (ad.adType === 'newCar') {
      return `/car-detail/${ad._id}`;
    } else if (ad.adType === 'newBike') {
      return `/bike-detail/${ad._id}`;
    } else {
      return `/used-car-detail/${ad._id}`;
    }
  };

  const getStatusBadge = (ad) => {
    if (ad.status === 'pending') {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          {t('pending')}
        </span>
      );
    } else if (ad.isActive || ad.status === 'active') {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          {t('active')}
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          {t('inactive')}
        </span>
      );
    }
  };

  const getAdTypeBadge = (ad) => {
    const adType = ad.adType || 'car';

    // For bike ads, check if it's premium or free
    if (adType === 'bike') {
      // Check if it's a premium bike ad (isFeatured === 'Approved' && isPaidAd === true)
      const isPremiumBike = ad.isFeatured === 'Approved' && ad.isPaidAd === true;

      if (isPremiumBike) {
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
            Premium Bike
          </span>
        );
      } else {
        // Free bike ad - don't show any badge or show "Free Bike"
        return null; // Don't show badge for free bike ads
      }
    }

    const typeLabels = {
      'featured': t('featuredCar'),
      'listItForYou': t('listItForYouBadge'),
      'free': t('freeAdBadgeShort'),
      'autoparts': t('autoPartsBadge'),
      'newCar': t('newCarBadge'),
      'newBike': t('newBikeBadge'),
      'rentCar': t('rentCarBadge'),
      'pending': t('pending')
    };

    const label = typeLabels[adType] || t('ad');
    const colors = {
      'featured': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'listItForYou': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'free': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'autoparts': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'newCar': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'newBike': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      'rentCar': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${colors[adType] || colors['free']}`}>
        {label}
      </span>
    );
  };

  // Helper function to check if ad is pending
  const isAdPending = (ad) => {
    return ad.status === 'pending' ||
      ad.status === 'Pending' ||
      ad.isFeatured === 'Pending' ||
      ad.paymentStatus === 'pending';
  };

  // Helper function to check if ad is active
  const isAdActive = (ad) => {
    return ad.isActive === true || ad.status === 'active' || ad.status === 'Active';
  };

  const filteredAds = ads.filter(ad => {
    if (filter === 'all') return true;

    const isPending = isAdPending(ad);
    const isActive = isAdActive(ad);

    if (filter === 'active') {
      // Show ads that are active and not pending
      return isActive && !isPending;
    }

    if (filter === 'inactive') {
      // Show ads that are inactive (not active and not pending)
      // This includes premium ads that are not yet approved (isActive: false)
      return !isActive && !isPending;
    }

    if (filter === 'pending') {
      // Show ads that are pending
      return isPending;
    }

    return true;
  });

  // Calculate counts for each tab
  const activeCount = ads.filter(ad => {
    const isPending = isAdPending(ad);
    const isActive = isAdActive(ad);
    return isActive && !isPending;
  }).length;

  const pendingCount = ads.filter(ad => isAdPending(ad)).length;

  const inactiveCount = ads.filter(ad => {
    const isPending = isAdPending(ad);
    const isActive = isAdActive(ad);
    return !isActive && !isPending;
  }).length;

  const handleEditAd = (ad) => {
    // Navigate to edit page - use generic route that handles all ad types
    navigate(`/edit-ad/${ad._id}`);
  };

  const handleDeleteAd = async (ad) => {
    if (!window.confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      setLoading(true);
      // FORCE 8001 - Standardize for connectivity
      const API_URL = server_ip;
      console.log(`📡 [FORCED FIX] Deleting ad from: ${API_URL}`);

      const fetchWithRetry = async (url, options = {}) => {
        try {
          const res = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit',
          });
          return res;
        } catch (err) {
          console.warn(`⚠️ Retrying fetch for ${url} (localhost fallback)`);
          const fallbackUrl = url.includes('127.0.0.1')
            ? url.replace('127.0.0.1', 'localhost')
            : url.replace('localhost', '127.0.0.1');
          return fetch(fallbackUrl, {
            ...options,
            headers: {
              ...options.headers,
              'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit',
          });
        }
      };

      // Determine the correct endpoint based on ad type
      let deleteEndpoint = '';
      if (ad.adType === 'featured' || ad.adType === 'listItForYou') {
        deleteEndpoint = `${API_URL}/featured_ads/${ad._id}`;
      } else if (ad.adType === 'free' || !ad.adType) {
        deleteEndpoint = `${API_URL}/free_ads/${ad._id}`;
      } else {
        // Use generic delete endpoint for other types
        deleteEndpoint = `${API_URL}/delete_ad/${ad._id}`;
      }

      const response = await fetchWithRetry(deleteEndpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete ad');
      }

      const result = await response.json();
      console.log('✅ Ad deleted successfully:', result);

      toast.success(t('adDeletedSuccess'));

      // Refresh ads list
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        await fetchUserAds(userData.userId);
      }
    } catch (err) {
      console.error('❌ Error deleting ad:', err);
      toast.error(err.message || 'Failed to delete ad. Please try again.');
      setError(err.message || 'Failed to delete ad');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('myAds')} - Auto Finder</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">{t('myAds')}</h1>
            <Link
              to="/sell-car"
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              {t('postNewAd')}
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 font-medium transition-colors ${filter === 'all'
                ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
            >
              {t('allAdsCount', { count: ads.length })}
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 font-medium transition-colors ${filter === 'active'
                ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
            >
              {t('activeAdsCount', { count: activeCount })}
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 font-medium transition-colors ${filter === 'pending'
                ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
            >
              {t('pendingAdsCount', { count: pendingCount })}
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 font-medium transition-colors ${filter === 'inactive'
                ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
            >
              {t('inactiveAdsCount', { count: inactiveCount })}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {filteredAds.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-12 text-center transition-colors">
              <svg
                className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                No ads found
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {filter === 'all'
                  ? "You haven't posted any ads yet."
                  : `You don't have any ${filter} ads.`}
              </p>
              <Link
                to="/sell-car"
                className="mt-6 inline-block px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Post Your First Ad
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAds.map((ad) => (
                <div
                  key={ad._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                >
                  {/* Ad Image */}
                  <Link to={getAdDetailLink(ad)} className="block">
                    <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <AdImageComponent ad={ad} getAdImage={getAdImage} getAdTitle={getAdTitle} />
                      <div className="absolute top-2 right-2 flex gap-2">
                        {getAdTypeBadge(ad)}
                        {getStatusBadge(ad)}
                      </div>
                    </div>
                  </Link>

                  {/* Ad Details */}
                  <div className="p-4 flex flex-col flex-grow">
                    <Link to={getAdDetailLink(ad)} className="block flex-grow">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        {getAdTitle(ad)}
                      </h3>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                        PKR {getAdPrice(ad).toLocaleString()}
                      </p>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {getAdLocation(ad)}
                      </div>
                      {ad.year && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('year')}: {ad.year}
                        </p>
                      )}
                      {ad.dateAdded && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {t('posted')}: {new Date(ad.dateAdded).toLocaleDateString()}
                        </p>
                      )}
                    </Link>

                    {/* Edit and Delete Buttons */}
                    <div className="mt-4 flex gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <button
                        onClick={() => handleEditAd(ad)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyAds;

