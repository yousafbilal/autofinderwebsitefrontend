import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { server_ip } from '../Utils/Data';
import { toast } from 'react-toastify';
import { FaCar, FaMotorcycle, FaRocket } from 'react-icons/fa';

function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPackageDetails();
  }, [id]);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_URL = server_ip || 'http://localhost:8001';

      // Try to fetch from all package endpoints
      const endpoints = [
        `${API_URL}/mobile/dealer_packages/car`,
        `${API_URL}/mobile/dealer_packages/bike`,
        `${API_URL}/mobile/dealer_packages/booster`,
      ];

      let foundPackage = null;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            credentials: 'omit',
          });

          if (response.ok) {
            const data = await response.json();
            const packages = data.success && Array.isArray(data.packages) ? data.packages : Array.isArray(data) ? data : [];
            const pkg = packages.find(p => (p.id || p._id) === id);
            if (pkg) {
              foundPackage = pkg;
              break;
            }
          }
        } catch (err) {
          console.error(`Error fetching from ${endpoint}:`, err);
        }
      }

      if (foundPackage) {
        setPackageData(foundPackage);
      } else {
        setError('Package not found');
      }
    } catch (err) {
      console.error('❌ Error fetching package details:', err);
      setError('Failed to load package details');
      toast.error('Failed to load package details');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!packageData) return;
    navigate(`/payment-receipt/${id}`, {
      state: {
        packageData: packageData,
      },
    });
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Package - Auto Finder</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading package details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !packageData) {
    return (
      <>
        <Helmet>
          <title>Package Not Found - Auto Finder</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Package not found'}</p>
            <button
              onClick={() => navigate('/dealer-packages')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  const packagePrice = packageData.discountedPrice || packageData.discountedRate || packageData.price || 0;
  const originalPrice = packageData.originalPrice || packageData.actualPrice || packageData.price || packagePrice;
  const youSaved = originalPrice - packagePrice;
  const savingsPercentage = originalPrice > 0 ? Math.round((youSaved / originalPrice) * 100) : 0;
  const packageType = packageData.type || 'car';
  const totalAds = packageType === 'booster' ? 0 : (packageData.totalAds || 0);
  const validityDays = packageData.validityDays || packageData.noOfDays || packageData.liveAdDays || 0;
  const boosts = packageType === 'booster' ? (packageData.freeBoosters || packageData.noOfBoosts || packageData.featuredListings || 0) : (packageData.freeBoosters || 0);

  // Get gradient colors
  const getGradientColors = (type) => {
    if (type === 'car') return 'from-[#FF6B6B] to-[#FF8E53]';
    if (type === 'bike') return 'from-[#4ECDC4] to-[#44A08D]';
    return 'from-[#A8E6CF] to-[#88D8A3]';
  };

  // Get icon
  const getPackageIcon = (type) => {
    if (type === 'car') return <FaCar className="w-8 h-8" />;
    if (type === 'bike') return <FaMotorcycle className="w-8 h-8" />;
    return <FaRocket className="w-8 h-8" />;
  };

  return (
    <>
      <Helmet>
        <title>{packageData.name || packageData.bundleName} - Auto Finder</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8 transition-colors">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dealer-packages')}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Packages
          </button>

          {/* Package Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Gradient Header */}
            <div className={`bg-gradient-to-br ${getGradientColors(packageType)} p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center text-white">
                    {getPackageIcon(packageType)}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white mb-2">
                      {packageData.name || packageData.bundleName}
                    </h1>
                    {packageData.popular && (
                      <div className="flex items-center gap-2 bg-white/30 px-3 py-1 rounded-full w-fit">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-semibold text-white">Popular</span>
                      </div>
                    )}
                  </div>
                </div>
                {savingsPercentage > 0 && (
                  <div className="bg-white/25 border border-white/50 px-4 py-2 rounded-xl">
                    <span className="text-lg font-bold text-white">{savingsPercentage}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Description */}
              {packageData.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-6">{packageData.description}</p>
              )}

              {/* Price Section */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-baseline gap-3">
                  {originalPrice > packagePrice && (
                    <span className="text-xl font-medium text-gray-400 line-through">
                      PKR {originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-red-600 dark:text-red-500">
                    PKR {packagePrice.toLocaleString()}
                  </span>
                </div>
                {youSaved > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      Save {youSaved.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Highlights */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 flex items-center justify-around">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-gray-800 dark:text-gray-200">{totalAds}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Ads</span>
                </div>
                <div className="w-px h-16 bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-gray-800 dark:text-gray-200">{validityDays}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Validity Days</span>
                </div>
                <div className="w-px h-16 bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-gray-800 dark:text-gray-200">{boosts}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {packageType === 'booster' ? 'Boosts' : 'Free Boosters'}
                  </span>
                </div>
              </div>

              {/* Features */}
              {packageData.features && Array.isArray(packageData.features) && packageData.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Features</h3>
                  <div className="space-y-2">
                    {packageData.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buy Now Button */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600 dark:text-gray-400">Total Price</span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-500">
                    PKR {packagePrice.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span>Buy Now</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PackageDetail;

