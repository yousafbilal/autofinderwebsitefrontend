import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { server_ip } from '../Utils/Data';
import { FaCar, FaMotorcycle, FaRocket, FaCheckCircle } from 'react-icons/fa';

function BoostAd() {
  const navigate = useNavigate();
  const location = useLocation();
  const { packageId, purchaseId } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [boosting, setBoosting] = useState(false);
  const [ads, setAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserId(user._id || user.userId || null);
      }
    } catch (e) {
      console.log('Could not get user from localStorage');
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserAds();
    }
  }, [userId]);

  const fetchUserAds = async () => {
    try {
      setLoading(true);
      const API_URL = server_ip || 'http://localhost:8001';
      
      // Fetch all user ads using the same endpoint as MyAds
      const response = await fetch(`${API_URL}/all_user_ads/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ads');
      }

      const data = await response.json();
      const adsArray = Array.isArray(data) ? data : [];
      
      // Filter only active, non-deleted ads
      const activeAds = adsArray.filter(ad => {
        // Check if ad is deleted
        if (ad.isDeleted === true) {
          return false;
        }
        // Check if ad is active
        if (ad.isActive === false) {
          return false;
        }
        // Some collections might not have isActive field, so include them if undefined
        if (ad.isActive !== undefined && ad.isActive !== true) {
          return false;
        }
        return true;
      });

      // Add adType based on collection or ad properties
      const adsWithType = activeAds.map(ad => {
        let adType = 'car';
        if (ad.adType === 'bike' || ad.modelType === 'Bike' || ad.collection === 'bike') {
          adType = 'bike';
        } else if (ad.adType === 'rent' || ad.modelType === 'Rent' || ad.collection === 'rent') {
          adType = 'rent';
        }
        return { ...ad, adType };
      });

      console.log('📦 User active ads:', adsWithType);
      setAds(adsWithType);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast.error('Failed to load your ads');
    } finally {
      setLoading(false);
    }
  };

  const handleBoost = async () => {
    if (!selectedAd) {
      toast.error('Please select an ad to boost');
      return;
    }

    if (!packageId || !purchaseId) {
      toast.error('Package information missing');
      return;
    }

    try {
      setBoosting(true);
      const API_URL = server_ip || 'http://localhost:8001';
      
      const response = await fetch(`${API_URL}/mobile/ads/${selectedAd._id}/boost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          packageId: packageId
        }),
        mode: 'cors',
        credentials: 'omit',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Ad boosted successfully! It will appear at the top of listings.');
        // Navigate back to My Packages
        setTimeout(() => {
          navigate('/my-packages');
        }, 1500);
      } else {
        toast.error(data.message || 'Failed to boost ad');
      }
    } catch (error) {
      console.error('Error boosting ad:', error);
      toast.error('Failed to boost ad. Please try again.');
    } finally {
      setBoosting(false);
    }
  };

  const getAdTitle = (ad) => {
    if (ad.title) return ad.title;
    if (ad.make && ad.model && ad.year) {
      return `${ad.make} ${ad.model} ${ad.year}`;
    }
    return 'Untitled Ad';
  };

  const getAdImage = (ad) => {
    if (ad.image1) return `${server_ip || 'http://localhost:8001'}/uploads/${ad.image1}`;
    return '/assets/images/placeholder-car.jpg';
  };

  const getAdIcon = (adType) => {
    switch (adType) {
      case 'car':
        return <FaCar className="w-6 h-6" />;
      case 'bike':
        return <FaMotorcycle className="w-6 h-6" />;
      case 'rent':
        return <FaCar className="w-6 h-6" />;
      default:
        return <FaCar className="w-6 h-6" />;
    }
  };

  if (!packageId || !purchaseId) {
    return (
      <>
        <Helmet>
          <title>Boost Ad - Auto Finder</title>
        </Helmet>
        <div className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Invalid package information</p>
            <button
              onClick={() => navigate('/my-packages')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Boost Ad - Auto Finder</title>
      </Helmet>
      <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <button
                onClick={() => navigate('/my-packages')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to My Packages
              </button>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Boost Your Ad
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Select an active ad to boost. Boosted ads appear at the top of listings for 3 days.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your ads...</p>
              </div>
            ) : ads.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <FaRocket className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  No Active Ads Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You need to have at least one active ad to boost it.
                </p>
                <button
                  onClick={() => navigate('/sell-car')}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Create an Ad
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {ads.map((ad) => (
                    <div
                      key={ad._id}
                      onClick={() => setSelectedAd(ad)}
                      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 cursor-pointer transition-all ${
                        selectedAd?._id === ad._id
                          ? 'border-red-600 dark:border-red-500 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={getAdImage(ad)}
                          alt={getAdTitle(ad)}
                          className="w-full h-48 object-cover rounded-t-lg"
                          onError={(e) => {
                            e.target.src = '/assets/images/placeholder-car.jpg';
                          }}
                        />
                        {selectedAd?._id === ad._id && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2">
                            <FaCheckCircle className="w-5 h-5" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded flex items-center gap-1">
                          {getAdIcon(ad.adType)}
                          <span className="text-xs capitalize">{ad.adType}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          {getAdTitle(ad)}
                        </h3>
                        {ad.price && (
                          <p className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                            PKR {ad.price.toLocaleString()}
                          </p>
                        )}
                        {ad.location && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            📍 {ad.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        {selectedAd ? `Selected: ${getAdTitle(selectedAd)}` : 'No ad selected'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedAd 
                          ? 'This ad will be boosted to the top of listings for 3 days'
                          : 'Please select an ad to boost'}
                      </p>
                    </div>
                    <button
                      onClick={handleBoost}
                      disabled={!selectedAd || boosting}
                      className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                        selectedAd && !boosting
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {boosting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          Boosting...
                        </>
                      ) : (
                        <>
                          <FaRocket className="w-5 h-5" />
                          Boost Ad
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default BoostAd;

