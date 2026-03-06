import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';
import { toast } from 'react-toastify';
import { FaCar, FaMotorcycle, FaRocket } from 'react-icons/fa';

function MyPackages() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'pending', 'expired'
  const [showAdOptions, setShowAdOptions] = useState(null); // Package ID for which to show options

  useEffect(() => {
    fetchUserPackages();
  }, []);

  const fetchUserPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.userId || userData._id;

      if (!userId) {
        toast.error('Please login to view your packages');
        navigate('/signin');
        return;
      }

      const API_URL = server_ip || 'http://localhost:8001';
      const timestamp = new Date().getTime();


      // Fetch all packages including pending
      const endpoint = `${API_URL}/mobile/user-mobile-packages/${userId}?includePending=true&_t=${timestamp}`;
      const response = await fetchWithRetry(endpoint, {
        method: 'GET',
      });

      let allPackages = [];

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.packages)) {
          allPackages = data.packages;
        }
      }

      console.log('📦 User packages response:', allPackages);
      console.log('📦 Total packages received:', allPackages.length);
      console.log('📦 Package statuses:', allPackages.map(p => ({
        name: p.package?.name || p.purchase?.packageName,
        status: p.purchase?.status || 'unknown',
        isActive: p.isActive
      })));

      if (allPackages.length > 0) {
        // Transform data to match display format
        const transformedPackages = allPackages.map((item) => {
          const purchase = item.purchase || {};
          const pkg = item.package || {};
          const usage = item.usage || {};

          // Calculate totals
          const totalAds = pkg?.listingLimit || pkg?.noOfBoosts || usage.totalAds || 0;
          const totalBoosters = pkg?.featuredListings || usage.totalBoosters || 0;
          const adsRemaining = usage.adsRemaining || 0;
          const adsUsed = usage.adsUsed || 0;
          const boostersRemaining = usage.boostersRemaining || 0;
          const boostersUsed = usage.boostersUsed || 0;

          // Calculate expiry
          const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
          const isActive = item.isActive || (expiryDate && expiryDate > new Date());
          const daysRemaining = expiryDate ? Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

          // Determine status - check both purchase.status and item status
          let status = 'active';
          const purchaseStatus = purchase.status || item.status || '';
          if (purchaseStatus === 'pending' || purchaseStatus === 'Pending' || !item.isActive && !expiryDate) {
            status = 'pending';
          } else if (!isActive || daysRemaining <= 0) {
            status = 'expired';
          }

          return {
            id: purchase._id || item._id,
            packageId: purchase.packageId || pkg._id,
            packageName: pkg.name || purchase.packageName || 'Package',
            packageType: pkg.type || purchase.packageType || 'car',
            purchaseDate: purchase.approvedAt ? new Date(purchase.approvedAt) : (purchase.submittedAt ? new Date(purchase.submittedAt) : new Date()),
            expiryDate: expiryDate,
            daysRemaining: daysRemaining,
            isActive: isActive,
            status: status,
            totalAds: totalAds,
            adsUsed: adsUsed,
            adsRemaining: adsRemaining,
            totalBoosters: totalBoosters,
            boostersUsed: boostersUsed,
            boostersRemaining: boostersRemaining,
            validityDays: pkg.noOfDays || pkg.duration || 0,
            amount: purchase.amount || pkg.discountedPrice || pkg.price || 0,
            package: pkg,
            purchase: purchase
          };
        });

        console.log('📦 Transformed packages:', transformedPackages);
        console.log('📦 Pending packages:', transformedPackages.filter(p => p.status === 'pending'));
        setPackages(transformedPackages);
      } else {
        setPackages([]);
      }
    } catch (err) {
      console.error('❌ Error fetching user packages:', err);
      setError('Failed to load packages. Please try again.');
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const getPackageIcon = (type) => {
    if (type === 'car') return <FaCar className="w-6 h-6" />;
    if (type === 'bike') return <FaMotorcycle className="w-6 h-6" />;
    return <FaRocket className="w-6 h-6" />;
  };

  const getStatusBadge = (status, isActive) => {
    if (status === 'pending') {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Pending
        </span>
      );
    }
    if (status === 'expired' || !isActive) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Expired
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Active
      </span>
    );
  };

  const calculatePercentage = (used, total) => {
    if (total === 0) return 0;
    return Math.min(100, Math.round((used / total) * 100));
  };

  // Filter packages based on active tab
  const filteredPackages = packages.filter((pkg) => {
    if (activeTab === 'active') {
      return pkg.status === 'active' && pkg.isActive === true;
    } else if (activeTab === 'pending') {
      return pkg.status === 'pending' || (!pkg.isActive && !pkg.expiryDate);
    } else if (activeTab === 'expired') {
      return pkg.status === 'expired' || (pkg.isActive === false && pkg.status !== 'pending' && pkg.expiryDate);
    }
    return true;
  });

  // Count packages for each tab
  const activeCount = packages.filter(p => p.status === 'active' && p.isActive === true).length;
  const pendingCount = packages.filter(p => p.status === 'pending' || (!p.isActive && !p.expiryDate)).length;
  const expiredCount = packages.filter(p => p.status === 'expired' || (p.isActive === false && p.status !== 'pending' && p.expiryDate)).length;

  return (
    <>
      <Helmet>
        <title>My Packages - Auto Finder</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8 transition-colors">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              My Packages
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View your purchased packages and usage statistics
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'active'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
            >
              Active ({activeCount})
              {activeTab === 'active' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-400"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'pending'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
            >
              Pending ({pendingCount})
              {activeTab === 'pending' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-400"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('expired')}
              className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'expired'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
            >
              Expired ({expiredCount})
              {activeTab === 'expired' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-400"></span>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 mb-6 text-center">
              <p className="text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading packages...</p>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No {activeTab === 'active' ? 'active' : activeTab === 'pending' ? 'pending' : 'expired'} packages found
              </p>
              <button
                onClick={() => navigate('/dealer-packages')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Browse Packages
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Package Header */}
                  <div className="bg-gradient-to-r from-red-600 to-red-700 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                          {getPackageIcon(pkg.packageType)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{pkg.packageName}</h3>
                          <p className="text-sm text-white/80">
                            {pkg.packageType === 'car' ? 'Car Package' : pkg.packageType === 'bike' ? 'Bike Package' : 'Booster Pack'}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(pkg.status, pkg.isActive)}
                    </div>
                  </div>

                  {/* Package Content */}
                  <div className="p-6">
                    {/* Expiry Info */}
                    {pkg.status === 'pending' ? (
                      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-400">
                          ⏳ Your package is pending admin approval. It will be activated once approved.
                        </p>
                      </div>
                    ) : pkg.isActive && pkg.expiryDate ? (
                      <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {pkg.daysRemaining === 0
                            ? 'Expires today!'
                            : pkg.daysRemaining === 1
                              ? 'Expires tomorrow!'
                              : `Expires in ${pkg.daysRemaining} days`}
                        </span>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-400">
                          ❌ Package expired on {pkg.expiryDate ? pkg.expiryDate.toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    )}

                    {/* Usage Statistics */}
                    <div className="space-y-4">
                      {/* Ads Usage */}
                      {pkg.totalAds > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Ads</span>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {pkg.adsUsed} / {pkg.totalAds} used
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full transition-all"
                              style={{ width: `${calculatePercentage(pkg.adsUsed, pkg.totalAds)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {pkg.adsRemaining} ads remaining
                          </p>
                        </div>
                      )}

                      {/* Boosters Usage */}
                      {pkg.totalBoosters > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Boosters</span>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {pkg.boostersUsed} / {pkg.totalBoosters} used
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className="bg-purple-600 h-2.5 rounded-full transition-all"
                              style={{ width: `${calculatePercentage(pkg.boostersUsed, pkg.totalBoosters)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {pkg.boostersRemaining} boosters remaining
                          </p>
                        </div>
                      )}

                      {/* Package Details */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Purchase Date</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                              {pkg.purchaseDate.toLocaleDateString()}
                            </p>
                          </div>
                          {pkg.expiryDate && (
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Expiry Date</p>
                              <p className="font-semibold text-gray-800 dark:text-gray-200">
                                {pkg.expiryDate.toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Validity</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                              {pkg.validityDays} days
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Amount Paid</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                              PKR {pkg.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4 space-y-2">
                        {/* Buy Again Button - Show when all ads are used OR package is expired */}
                        {(pkg.adsRemaining === 0 && pkg.totalAds > 0) || pkg.status === 'expired' ? (
                          <button
                            onClick={() => {
                              // Navigate to dealer packages page with the same package type
                              const packageType = pkg.packageType || 'car';
                              navigate('/dealer-packages', { state: { highlightType: packageType } });
                            }}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Buy Again
                          </button>
                        ) : null}

                        {/* Post New Ad Button for Active Packages */}
                        {pkg.status === 'active' && pkg.isActive && pkg.adsRemaining > 0 && (
                          <>
                            {showAdOptions === pkg.id ? (
                              // Show ad type options
                              <div className="space-y-2">
                                <button
                                  onClick={() => {
                                    navigate('/sell-car', {
                                      state: {
                                        dealerPackageId: pkg.packageId,
                                        purchaseId: pkg.id,
                                        skipPayment: true,
                                        service: 'premium'
                                      }
                                    });
                                  }}
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                  <FaCar className="w-4 h-4" />
                                  Premium Car Ad
                                </button>
                                <button
                                  onClick={() => {
                                    navigate('/sell-bike', {
                                      state: {
                                        dealerPackageId: pkg.packageId,
                                        purchaseId: pkg.id,
                                        skipPayment: true
                                      }
                                    });
                                  }}
                                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                  <FaMotorcycle className="w-4 h-4" />
                                  Premium Bike Ad
                                </button>
                                <button
                                  onClick={() => {
                                    navigate('/post-rent-car', {
                                      state: {
                                        dealerPackageId: pkg.packageId,
                                        purchaseId: pkg.id,
                                        skipPayment: true
                                      }
                                    });
                                  }}
                                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Car on Rent
                                </button>
                                <button
                                  onClick={() => setShowAdOptions(null)}
                                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              // Show Post New Ad button
                              <button
                                onClick={() => {
                                  if (pkg.packageType === 'booster') {
                                    toast.info('Booster packages are used to boost existing ads, not create new ones.');
                                    return;
                                  }
                                  setShowAdOptions(pkg.id);
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Post New Ad
                              </button>
                            )}
                          </>
                        )}

                        {/* Boost Ad Button for Active Packages with Boosters */}
                        {pkg.status === 'active' && pkg.isActive && pkg.boostersRemaining > 0 && (
                          <button
                            onClick={() => {
                              navigate('/boost-ad', {
                                state: {
                                  packageId: pkg.packageId,
                                  purchaseId: pkg.id
                                }
                              });
                            }}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Boost Ad
                          </button>
                        )}

                      </div>
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

export default MyPackages;

