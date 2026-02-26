import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { FaCog, FaMapMarkerAlt, FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';
import VoiceSearchComp from '../Components/VoiceSearch';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';
import { useLanguage } from '../Context/LanguageContext';

function AutoStore() {
  const { t } = useLanguage();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredParts, setFilteredParts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');

  // Collapsible sections state
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);

  // Auto parts categories
  const categories = [
    'All',
    'Engine Parts',
    'Body Parts',
    'Electrical',
    'Interior',
    'Exterior',
    'Accessories',
    'Tires & Wheels',
    'Brake System',
    'Suspension',
    'Transmission',
    'Other'
  ];

  const getCategoryKey = (category) => {
    switch (category) {
      case 'All': return 'allCategories';
      case 'Engine Parts': return 'engineParts';
      case 'Body Parts': return 'bodyParts';
      case 'Electrical': return 'electrical';
      case 'Interior': return 'interior';
      case 'Exterior': return 'exterior';
      case 'Accessories': return 'accessories';
      case 'Tires & Wheels': return 'tiresWheels';
      case 'Brake System': return 'brakeSystem';
      case 'Suspension': return 'suspension';
      case 'Transmission': return 'transmission';
      case 'Other': return 'other';
      default: return category.toLowerCase().replace(/\s+/g, '');
    }
  };


  // Fetch auto parts from backend
  useEffect(() => {
    const fetchAutoParts = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL = server_ip || 'http://localhost:8001';
        const endpoint = `${API_URL}/autoparts/public`;

        console.log('🔄 Fetching auto parts from:', endpoint);

        const response = await fetchWithRetry(endpoint);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Response error:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Auto parts received:', data.length);

        if (Array.isArray(data) && data.length > 0) {
          // Filter for active, non-deleted parts
          const validParts = data.filter(part =>
            part.title &&
            (part.isActive === true || part.isActive === undefined) &&
            !part.isDeleted
          );

          console.log(`✅ Valid auto parts: ${validParts.length}`);
          setParts(validParts);
          setFilteredParts(validParts);
        } else {
          setParts([]);
          setFilteredParts([]);
        }
      } catch (err) {
        console.error('❌ Error fetching auto parts:', err);
        setError(err.message || 'Failed to fetch auto parts');
        setParts([]);
        setFilteredParts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAutoParts();
  }, []);

  // Toggle category selection
  const toggleCategory = (category) => {
    if (category === 'All') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(prev =>
        prev.includes(category)
          ? prev.filter(c => c !== category)
          : [...prev, category]
      );
    }
  };

  // Calculate category counts
  const categoryCounts = categories.reduce((acc, category) => {
    if (category === 'All') return acc;
    acc[category] = parts.filter((part) => {
      const partCategory = (part.category || part.partCategory || '').toString().toLowerCase().trim();
      const categoryLower = category.toLowerCase().trim();
      return partCategory === categoryLower || partCategory.includes(categoryLower);
    }).length;
    return acc;
  }, {});

  // Filter parts based on category and price
  useEffect(() => {
    let filtered = [...parts];

    console.log(`🔍 Filtering - Total parts: ${parts.length}, Categories: [${selectedCategories.join(', ')}]`);

    // Filter by category
    if (selectedCategories.length > 0) {
      const beforeCategoryFilter = filtered.length;
      filtered = filtered.filter((part) => {
        const partCategory = (part.category || part.partCategory || '').toString().toLowerCase().trim();
        return selectedCategories.some(selectedCat => {
          const selectedCategoryLower = selectedCat.toLowerCase().trim();
          return partCategory === selectedCategoryLower || partCategory.includes(selectedCategoryLower);
        });
      });
      console.log(`📂 Category filter [${selectedCategories.join(', ')}]: ${beforeCategoryFilter} → ${filtered.length} parts`);
    }

    // Filter by price range (From/To inputs)
    if (priceFrom) {
      const fromPrice = parseFloat(priceFrom) || 0;
      filtered = filtered.filter((part) => {
        const price = parseFloat(part.price) || 0;
        return price >= fromPrice;
      });
    }
    if (priceTo) {
      const toPrice = parseFloat(priceTo) || 0;
      filtered = filtered.filter((part) => {
        const price = parseFloat(part.price) || 0;
        return price <= toPrice;
      });
    }

    // Filter by keyword
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase().trim();
      filtered = filtered.filter((part) => {
        return (
          (part.title || '').toLowerCase().includes(keyword) ||
          (part.description || '').toLowerCase().includes(keyword) ||
          (part.category || '').toLowerCase().includes(keyword)
        );
      });
    }

    setFilteredParts(filtered);
    console.log(`✅ Final result: ${filtered.length} parts will be displayed`);
  }, [parts, selectedCategories, priceFrom, priceTo]);

  const buildImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EAuto Part%3C/text%3E%3C/svg%3E';
    }
    if (imagePath.startsWith('http')) return imagePath;

    const API_URL = server_ip || 'http://localhost:8001';
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_URL}/uploads/${cleanPath}`;
  };

  const formatPrice = (price) => {
    if (!price) return t('priceOnCall');
    return `PKR ${price.toLocaleString()}`;
  };

  return (
    <>
      <Helmet>
        <title>{t('autoStore')} - {t('findAutoParts')} | Auto Finder</title>
        <meta name="description" content={t('findAutoParts')} />
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-2 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">{t('autoStore')}</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t('findAutoParts')}</p>
          </div>

          {/* Active Filters */}
          {(selectedCategories.length > 0 || priceFrom || priceTo || searchKeyword) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {searchKeyword && (
                <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                  {t('search')}: {searchKeyword}
                </span>
              )}
              {selectedCategories.length > 0 && (
                <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                  {t('category')}: {selectedCategories.map(c => t(getCategoryKey(c))).join(', ')}
                </span>
              )}
              {(priceFrom || priceTo) && (
                <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                  {t('price')}: {priceFrom ? `PKR ${parseFloat(priceFrom).toLocaleString()}` : '0'} - {priceTo ? `PKR ${parseFloat(priceTo).toLocaleString()}` : '∞'}
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSearchKeyword('');
                  setPriceFrom('');
                  setPriceTo('');
                }}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium transition-colors"
              >
                {t('clearFilters')}
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Sidebar - Filters */}
            <div className="w-full lg:w-64 xl:w-72 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                {/* SHOW RESULTS BY Header */}
                <div className="bg-red-600 dark:bg-red-700 text-white px-2.5 py-2 font-semibold text-xs text-center border-b border-white/10">
                  {t('showResultsBy')}
                </div>

                {/* SEARCH BY KEYWORD */}
                <div className="p-2.5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={t('searchByPartName')}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="w-full px-2 py-1.5 pr-8 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <div className="absolute right-0 top-0 h-full flex items-center pr-1">
                        <VoiceSearchComp
                          onResult={(text) => {
                            setSearchKeyword(text);
                          }}
                          className="scale-90"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => { }}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 rounded text-xs font-semibold transition whitespace-nowrap"
                    >
                      <FaSearch />
                    </button>
                  </div>
                </div>

                {/* BY CATEGORY Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsCategoryOpen(!isCategoryOpen);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 uppercase">{t('byCategory')}</span>
                    {isCategoryOpen ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                  {isCategoryOpen && (
                    <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
                      {categories.filter(c => c !== 'All').map((category) => {
                        const count = categoryCounts[category] || 0;
                        const isChecked = selectedCategories.includes(category);
                        return (
                          <label
                            key={category}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCategory(category)}
                                className="w-4 h-4 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{t(getCategoryKey(category))}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* BY PRICE Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsPriceOpen(!isPriceOpen);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 uppercase">{t('byPrice')}</span>
                    {isPriceOpen ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                  {isPriceOpen && (
                    <div className="px-4 pb-4">
                      <div className="flex gap-1.5 items-center w-full">
                        <input
                          type="number"
                          placeholder={t('from')}
                          value={priceFrom}
                          onChange={(e) => setPriceFrom(e.target.value)}
                          className="flex-1 min-w-0 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <input
                          type="number"
                          placeholder={t('to')}
                          value={priceTo}
                          onChange={(e) => setPriceTo(e.target.value)}
                          className="flex-1 min-w-0 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <button
                          onClick={() => { }}
                          className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-semibold transition whitespace-nowrap flex-shrink-0"
                        >
                          {t('go')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Parts List */}
            <div className="flex-1 min-w-0 w-full">

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">{t('loading')}...</p>
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
                  <p className="text-yellow-800 dark:text-yellow-400 font-semibold mb-2">{t('unableToLoad')}</p>
                  <p className="text-yellow-700 dark:text-yellow-500 text-sm mb-2">{t('error')}: {error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-800"
                  >
                    {t('retry')}
                  </button>
                </div>
              )}

              {/* No Parts Found */}
              {!loading && !error && filteredParts.length === 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-2 font-semibold text-lg">
                    {t('noResultsFound')}
                    {selectedCategories.length > 0 && ` ${t('inKeyword')} ${selectedCategories.map(c => t(getCategoryKey(c))).join(', ')}`}
                    {(priceFrom || priceTo) && ` ${t('forYourQuickLook')} ${priceFrom ? `PKR ${parseFloat(priceFrom).toLocaleString()}` : '0'} - ${priceTo ? `PKR ${parseFloat(priceTo).toLocaleString()}` : '∞'}`}
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">{t('trySelectingDifferentFilters')}</p>
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setPriceFrom('');
                      setPriceTo('');
                    }}
                    className="mt-4 bg-red-600 dark:bg-red-700 text-white px-6 py-2 rounded hover:bg-red-700 dark:hover:bg-red-800"
                  >
                    {t('clearFilters')}
                  </button>
                </div>
              )}

              {/* Auto Parts List */}
              {!loading && !error && filteredParts.length > 0 && (
                <>
                  <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {t('showing')} {filteredParts.length} {t('itemsFound')}
                    {selectedCategories.length > 0 && ` ${t('inKeyword')} ${selectedCategories.map(c => t(getCategoryKey(c))).join(', ')}`}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredParts.map((part) => {
                      const imageUrl = buildImageUrl(part.image1 || part.image);

                      return (
                        <div key={part._id || Math.random()} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group h-full flex flex-col">
                          <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden flex-shrink-0">
                            <img
                              src={imageUrl}
                              alt={part.title || 'Auto Part'}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EAuto Part%3C/text%3E%3C/svg%3E';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {part.category && (
                              <span className="absolute top-2 left-2 bg-red-600 dark:bg-red-700 text-white px-2 py-1 rounded text-xs font-semibold">
                                {t(getCategoryKey(part.category)) || part.category}
                              </span>
                            )}
                          </div>
                          <div className="p-6 flex-grow flex flex-col">
                            <h3 className="text-xl font-semibold mb-2 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2 text-gray-800 dark:text-gray-200">
                              {part.title || 'Auto Part'}
                            </h3>
                            <div className="mb-3">
                              <span className="text-red-600 dark:text-red-500 font-bold text-lg">{formatPrice(part.price)}</span>
                            </div>
                            {part.description && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                {part.description}
                              </p>
                            )}
                            {part.location && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                <FaMapMarkerAlt className="text-red-600 dark:text-red-500" />
                                <span>{part.location}</span>
                              </div>
                            )}
                            {part.brand && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                <FaCog className="text-red-600 dark:text-red-500" />
                                <span>{t('make')}: {part.brand}</span>
                              </div>
                            )}
                            {/* Spacer to push button to bottom */}
                            <div className="flex-grow"></div>
                            <Link
                              to={`/auto-part-detail/${part._id}`}
                              className="block w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white text-center py-2 rounded-md transition font-semibold mt-auto"
                            >
                              {t('viewDetails')}
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
        </div>
      </div>
    </>
  );
}

export default AutoStore;

