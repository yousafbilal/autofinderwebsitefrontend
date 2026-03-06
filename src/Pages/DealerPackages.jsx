import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';
import { useLanguage } from '../contexts/LanguageContext';

function DealerPackages() {
  const { t } = useLanguage();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('car'); // car, bike, booster

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        const API_URL = server_ip || 'http://localhost:8001';
        // Correct endpoint for dealer packages as per backend route
        const response = await fetchWithRetry(`${API_URL}/mobile/dealer_packages/${activeTab}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.packages) {
          setPackages(data.packages);
        } else {
          setPackages([]);
        }
      } catch (err) {
        console.error('❌ Error fetching packages:', err);
        setError(err.message || 'Failed to fetch packages');
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [activeTab]);

  return (
    <>
      <Helmet>
        <title>{t('dealerPackages')} | Auto Finder</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('dealerPackages')}</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('choosePackageDescription')}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex">
              <button
                onClick={() => setActiveTab('car')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'car'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                {t('carPackages')}
              </button>
              <button
                onClick={() => setActiveTab('bike')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'bike'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                {t('bikePackages')}
              </button>
              <button
                onClick={() => setActiveTab('booster')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'booster'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                {t('boosterPackages')}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">{t('loading')}...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-8 rounded-2xl text-center max-w-lg mx-auto">
              <p className="text-red-800 dark:text-red-400 font-bold mb-4">{t('error')}: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                {t('retry')}
              </button>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 text-lg uppercase">{t('noPackagesAvailable')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg) => {
                const packagePrice = pkg.discountedPrice || pkg.discountedRate || pkg.price || 0;
                const originalPrice = pkg.actualPrice || pkg.price || packagePrice;
                const youSaved = pkg.youSaved || (originalPrice - packagePrice > 0 ? originalPrice - packagePrice : 0);
                const savingsPercentage = originalPrice > 0 ? Math.round((youSaved / originalPrice) * 100) : 0;
                const isPopular = pkg.popular || false;
                const packageType = pkg.type || activeTab;
                const totalAds = pkg.totalAds || pkg.listingLimit || (activeTab === 'booster' ? 0 : 0);
                const validityDays = pkg.validityDays || pkg.noOfDays || pkg.liveAdDays || pkg.duration || 0;
                const boosts = pkg.freeBoosters || pkg.noOfBoosts || pkg.featuredListings || 0;

                return (
                  <div
                    key={pkg._id}
                    className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-2 flex flex-col h-full ${isPopular ? 'border-red-600 dark:border-red-500 scale-[1.02]' : 'border-gray-100 dark:border-gray-700'
                      }`}
                  >
                    {/* Header */}
                    <div className={`${isPopular ? 'bg-red-600' : 'bg-gray-800'} p-3 flex-shrink-0`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-white break-words line-clamp-1">
                            {pkg.name || pkg.bundleName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-white/20 text-white px-2 py-0.5 rounded">
                              {packageType}
                            </span>
                            {isPopular && (
                              <div className="flex items-center gap-1 mt-1 bg-white/30 px-2 py-0.5 rounded-full w-fit">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-[10px] font-semibold text-white uppercase">{t('popular')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {savingsPercentage > 0 && (
                          <div className="bg-white/25 border border-white/50 px-2.5 py-1 rounded-xl">
                            <span className="text-xs font-bold text-white">{savingsPercentage}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      {/* Price Section */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-baseline gap-2">
                          {originalPrice > packagePrice && (
                            <span className="text-sm font-medium text-gray-500 line-through">
                              PKR {originalPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="text-2xl font-bold text-red-600 dark:text-red-500">
                            PKR {packagePrice.toLocaleString()}
                          </span>
                        </div>
                        {youSaved > 0 && (
                          <div className="bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-lg">
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                              {t('save')} {youSaved.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Highlights - Icons in a row */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 mb-3 flex items-center justify-around">
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{totalAds}</span>
                          <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium uppercase">{t('ads')}</span>
                        </div>
                        <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{validityDays}</span>
                          <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium uppercase">{t('days')}</span>
                        </div>
                        <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{boosts}</span>
                          <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium uppercase">{t('boost')}</span>
                        </div>
                      </div>

                      {/* Features - Only show 2 features */}
                      {pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3 flex-1">
                          {pkg.features.slice(0, 2).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md flex-1 min-w-[45%]">
                              <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1">{feature}</span>
                            </div>
                          ))}
                          {pkg.features.length > 2 && (
                            <div className="text-xs text-red-600 dark:text-red-400 italic self-center">
                              +{pkg.features.length - 2} {t('more')}
                            </div>
                          )}
                        </div>
                      )}

                      {/* View Package Button */}
                      <button
                        onClick={() => {
                          const packageId = pkg.id || pkg._id;
                          window.location.href = `/package-detail/${packageId}`;
                        }}
                        className="w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 mt-auto"
                      >
                        <span>{t('viewPackage')}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
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

export default DealerPackages;
