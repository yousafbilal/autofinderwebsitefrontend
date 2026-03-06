import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaMotorcycle, FaMapMarkerAlt, FaCalendarAlt, FaCog, FaBolt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import PriceRangeDropdown from '../Components/PriceRangeDropdown';
import MileageRangeDropdown from '../Components/MileageRangeDropdown';
import VoiceSearchComp from '../Components/VoiceSearch';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';
import { useLanguage } from '../contexts/LanguageContext';

function UsedBikes() {
  const { t } = useLanguage();
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredBikes, setFilteredBikes] = useState([]);

  // Filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedRegistrationCities, setSelectedRegistrationCities] = useState([]);

  // Range filters
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [engineCapacityFrom, setEngineCapacityFrom] = useState('');
  const [engineCapacityTo, setEngineCapacityTo] = useState('');
  const [mileageFrom, setMileageFrom] = useState('');
  const [mileageTo, setMileageTo] = useState('');

  // Multi-select filters
  const [selectedBodyColors, setSelectedBodyColors] = useState([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState([]);
  const [selectedEngineTypes, setSelectedEngineTypes] = useState([]);

  // Special filters
  const [isFeatured, setIsFeatured] = useState(false);

  // Collapsible sections state
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isVariantOpen, setIsVariantOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isRegistrationCityOpen, setIsRegistrationCityOpen] = useState(false);
  const [isEngineCapacityOpen, setIsEngineCapacityOpen] = useState(false);
  const [isBodyColorOpen, setIsBodyColorOpen] = useState(false);
  const [isMileageOpen, setIsMileageOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isFuelTypeOpen, setIsFuelTypeOpen] = useState(false);
  const [isEngineTypeOpen, setIsEngineTypeOpen] = useState(false);
  const [isFeaturedOpen, setIsFeaturedOpen] = useState(false);

  // Price suggestions for bikes
  const bikePriceSuggestions = [
    10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000,
    125000, 150000, 175000, 200000, 250000, 300000, 350000, 400000, 450000, 500000,
    600000, 700000, 800000, 900000, 1000000
  ];

  // Mileage suggestions for bikes
  const bikeMileageSuggestions = [
    1000, 2000, 3000, 4000, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000,
    75000, 100000
  ];

  // Bike companies
  const companies = [
    'Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Bajaj', 'TVS', 'Hero',
    'Royal Enfield', 'KTM', 'Ducati', 'BMW', 'Harley Davidson', 'Triumph',
    'Aprilia', 'Benelli', 'MV Agusta', 'Moto Guzzi', 'Indian', 'Victory', 'Husqvarna'
  ];

  // Bike models (will be filtered based on selected companies)
  const allModels = [
    'CD-70', 'CG-125', 'CB-150F', 'CBR-150R', 'CBR-250R', 'CBR-600RR',
    'CBR-1000RR', 'VFR-800', 'VFR-1200F', 'Gold Wing', 'Shadow', 'Rebel', 'Africa Twin',
    'YZF-R1', 'YZF-R6', 'MT-07', 'MT-09', 'FZ-16', 'FZ-S', 'R15', 'R3', 'R6', 'R1',
    'GSX-R600', 'GSX-R750', 'GSX-R1000', 'GSX-S750', 'GSX-S1000', 'V-Strom', 'Boulevard',
    'Ninja 300', 'Ninja 400', 'Ninja 650', 'Ninja ZX-6R', 'Ninja ZX-10R', 'Versys', 'Vulcan',
    'Pulsar 150', 'Pulsar 200', 'Pulsar 220', 'Pulsar NS200', 'Pulsar RS200', 'Avenger',
    'Discover', 'Platina', 'CT 100', 'Boxer', 'V15', 'Dominar', 'KTM 200', 'KTM 390',
    'Classic 350', 'Classic 500', 'Bullet 350', 'Bullet 500', 'Thunderbird', 'Continental GT',
    'Interceptor 650', 'Himalayan', 'Scram 411', 'Super Meteor 650', 'Hunter 350'
  ];

  // Variants
  const variants = [
    'Standard', 'Self Start', 'Kick Start', 'Special Edition', 'Limited Edition',
    'Euro 2', 'Euro 5', 'ABS', 'Non-ABS', 'Alloy Rim', 'Spoke Rim'
  ];

  // Pakistani cities
  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
    'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Sargodha',
    'Bahawalpur', 'Sukkur', 'Larkana', 'Sheikhupura', 'Rahim Yar Khan', 'Gujrat',
    'Mardan', 'Mingora', 'Nawabshah', 'Chiniot', 'Kotri', 'Kāmoke', 'Hafizabad', 'Kohat'
  ];

  // Body colors
  const bodyColors = [
    'White', 'Black', 'Red', 'Blue', 'Green', 'Yellow', 'Orange',
    'Silver', 'Gray', 'Brown', 'Purple', 'Gold', 'Beige', 'Maroon', 'Navy',
    'Pearl White', 'Metallic Silver', 'Champagne', 'Bronze', 'Copper', 'Matte Black',
    'Carbon Fiber', 'Chrome', 'Titanium', 'Gunmetal'
  ];

  // Fuel types
  const fuelTypes = ['Petrol', 'Hybrid', 'Electric'];

  // Engine types
  const engineTypes = ['2 Stroke', '4 Stroke', 'Electric'];

  // Fetch bikes from backend
  useEffect(() => {
    const fetchUsedBikes = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL = server_ip || 'http://localhost:8001';
        const endpoint = `${API_URL}/bike_ads/public`;

        console.log('🔄 Fetching used bikes from:', endpoint);

        const response = await fetchWithRetry(endpoint);

        console.log('📡 Response status:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Response error:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Raw data received from /bike_ads:', data);
        console.log('📦 Data length:', Array.isArray(data) ? data.length : 'N/A');

        if (Array.isArray(data) && data.length > 0) {
          // Filter: Show only active bikes with required fields
          const validBikes = data.filter((bike) => {
            const hasRequiredFields = bike.make && bike.model;
            const isActive = bike.isActive === true;
            const isNotDeleted = !bike.isDeleted;

            const isValid = hasRequiredFields && isActive && isNotDeleted;

            if (!isValid) {
              console.log(`⚠️ Bike filtered out: ${bike._id}`, {
                hasRequiredFields,
                isActive,
                isNotDeleted,
                make: bike.make,
                model: bike.model
              });
            }

            return isValid;
          });

          console.log(`✅ Total bikes from backend: ${data.length}`);
          console.log(`✅ Valid active bikes: ${validBikes.length}`);

          if (validBikes.length > 0) {
            setBikes(validBikes);
            setFilteredBikes(validBikes);
            console.log(`✅ Bikes state updated: ${validBikes.length} bikes set`);
          } else {
            console.warn('⚠️ No valid bikes found after filtering');
            setBikes([]);
            setFilteredBikes([]);
          }
        } else {
          console.warn('⚠️ No bikes found or data is not an array');
          setBikes([]);
          setFilteredBikes([]);
        }
      } catch (err) {
        console.error('❌ Error fetching used bikes:', err);
        setError(err.message || 'Failed to fetch used bikes');
        setBikes([]);
        setFilteredBikes([]);
      } finally {
        setLoading(false);
        console.log('✅ Loading completed');
      }
    };

    fetchUsedBikes();
  }, []);

  // Toggle functions
  const toggleCompany = (company) => {
    setSelectedCompanies(prev =>
      prev.includes(company)
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  };

  const toggleModel = (model) => {
    setSelectedModels(prev =>
      prev.includes(model)
        ? prev.filter(m => m !== model)
        : [...prev, model]
    );
  };

  const toggleVariant = (variant) => {
    setSelectedVariants(prev =>
      prev.includes(variant)
        ? prev.filter(v => v !== variant)
        : [...prev, variant]
    );
  };

  const toggleLocation = (location) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const toggleRegistrationCity = (city) => {
    setSelectedRegistrationCities(prev =>
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  const toggleBodyColor = (color) => {
    setSelectedBodyColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const toggleFuelType = (fuelType) => {
    setSelectedFuelTypes(prev =>
      prev.includes(fuelType)
        ? prev.filter(f => f !== fuelType)
        : [...prev, fuelType]
    );
  };

  const toggleEngineType = (engineType) => {
    setSelectedEngineTypes(prev =>
      prev.includes(engineType)
        ? prev.filter(e => e !== engineType)
        : [...prev, engineType]
    );
  };

  // Calculate counts
  const companyCounts = companies.reduce((acc, company) => {
    acc[company] = bikes.filter((bike) => {
      const bikeMake = (bike.make || '').toString().toLowerCase().trim();
      return bikeMake === company.toLowerCase().trim() || bikeMake.includes(company.toLowerCase().trim());
    }).length;
    return acc;
  }, {});

  const modelCounts = allModels.reduce((acc, model) => {
    acc[model] = bikes.filter((bike) => {
      const bikeModel = (bike.model || '').toString().toLowerCase().trim();
      return bikeModel === model.toLowerCase().trim() || bikeModel.includes(model.toLowerCase().trim());
    }).length;
    return acc;
  }, {});

  const locationCounts = cities.reduce((acc, city) => {
    acc[city] = bikes.filter((bike) => {
      const bikeLocation = (bike.location || '').toString().toLowerCase().trim();
      const cityLower = city.toLowerCase().trim();
      return bikeLocation === cityLower || bikeLocation.includes(cityLower);
    }).length;
    return acc;
  }, {});

  const registrationCityCounts = cities.reduce((acc, city) => {
    acc[city] = bikes.filter((bike) => {
      const bikeRegCity = (bike.registrationCity || '').toString().toLowerCase().trim();
      const cityLower = city.toLowerCase().trim();
      return bikeRegCity === cityLower || bikeRegCity.includes(cityLower);
    }).length;
    return acc;
  }, {});

  const bodyColorCounts = bodyColors.reduce((acc, color) => {
    acc[color] = bikes.filter((bike) => {
      const bikeColor = (bike.bodyColor || bike.color || '').toString().toLowerCase().trim();
      return bikeColor === color.toLowerCase().trim() || bikeColor.includes(color.toLowerCase().trim());
    }).length;
    return acc;
  }, {});

  const fuelTypeCounts = fuelTypes.reduce((acc, fuelType) => {
    acc[fuelType] = bikes.filter((bike) => {
      const bikeFuelType = (bike.fuelType || '').toString().toLowerCase().trim();
      return bikeFuelType === fuelType.toLowerCase().trim() || bikeFuelType.includes(fuelType.toLowerCase().trim());
    }).length;
    return acc;
  }, {});

  const engineTypeCounts = engineTypes.reduce((acc, engineType) => {
    acc[engineType] = bikes.filter((bike) => {
      const bikeEngineType = (bike.engineType || '').toString().toLowerCase().trim();
      return bikeEngineType === engineType.toLowerCase().trim() || bikeEngineType.includes(engineType.toLowerCase().trim());
    }).length;
    return acc;
  }, {});

  // Filter bikes based on all filters
  useEffect(() => {
    let filtered = [...bikes];

    // Search keyword filter
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      filtered = filtered.filter((bike) => {
        const searchText = `${bike.make || ''} ${bike.model || ''} ${bike.variant || ''} ${bike.year || ''}`.toLowerCase();
        return searchText.includes(keyword);
      });
    }

    // Filter by company
    if (selectedCompanies.length > 0) {
      filtered = filtered.filter((bike) => {
        const bikeMake = (bike.make || '').toString().toLowerCase().trim();
        return selectedCompanies.some(company => {
          const companyLower = company.toLowerCase().trim();
          return bikeMake === companyLower || bikeMake.includes(companyLower);
        });
      });
    }

    // Filter by model
    if (selectedModels.length > 0) {
      filtered = filtered.filter((bike) => {
        const bikeModel = (bike.model || '').toString().toLowerCase().trim();
        return selectedModels.some(model => {
          const modelLower = model.toLowerCase().trim();
          return bikeModel === modelLower || bikeModel.includes(modelLower);
        });
      });
    }

    // Filter by variant
    if (selectedVariants.length > 0) {
      filtered = filtered.filter((bike) => {
        const bikeVariant = (bike.variant || '').toString().toLowerCase().trim();
        return selectedVariants.some(variant => {
          const variantLower = variant.toLowerCase().trim();
          return bikeVariant === variantLower || bikeVariant.includes(variantLower);
        });
      });
    }

    // Filter by year range
    if (yearFrom) {
      const yearFromNum = parseInt(yearFrom) || 1970;
      filtered = filtered.filter((bike) => {
        const bikeYear = parseInt(bike.year) || 0;
        return bikeYear >= yearFromNum;
      });
    }
    if (yearTo) {
      const yearToNum = parseInt(yearTo) || new Date().getFullYear();
      filtered = filtered.filter((bike) => {
        const bikeYear = parseInt(bike.year) || 0;
        return bikeYear <= yearToNum;
      });
    }

    // Filter by location
    if (selectedLocations.length > 0) {
      filtered = filtered.filter((bike) => {
        const bikeLocation = (bike.location || '').toString().toLowerCase().trim();
        return selectedLocations.some(location => {
          const locationLower = location.toLowerCase().trim();
          return bikeLocation === locationLower || bikeLocation.includes(locationLower);
        });
      });
    }

    // Filter by registration city
    if (selectedRegistrationCities.length > 0) {
      filtered = filtered.filter((bike) => {
        const bikeRegCity = (bike.registrationCity || '').toString().toLowerCase().trim();
        return selectedRegistrationCities.some(city => {
          const cityLower = city.toLowerCase().trim();
          return bikeRegCity === cityLower || bikeRegCity.includes(cityLower);
        });
      });
    }

    // Filter by engine capacity range
    if (engineCapacityFrom) {
      const engineFromNum = parseInt(engineCapacityFrom) || 50;
      filtered = filtered.filter((bike) => {
        const bikeEngine = parseInt(bike.engineCapacity) || 0;
        return bikeEngine >= engineFromNum;
      });
    }
    if (engineCapacityTo) {
      const engineToNum = parseInt(engineCapacityTo) || 1000;
      filtered = filtered.filter((bike) => {
        const bikeEngine = parseInt(bike.engineCapacity) || 0;
        return bikeEngine <= engineToNum;
      });
    }

    // Filter by body color
    if (selectedBodyColors.length > 0) {
      filtered = filtered.filter((bike) => {
        const bikeColor = (bike.bodyColor || bike.color || '').toString().toLowerCase().trim();
        return selectedBodyColors.some(color => {
          const colorLower = color.toLowerCase().trim();
          return bikeColor === colorLower || bikeColor.includes(colorLower);
        });
      });
    }

    // Filter by mileage range
    if (mileageFrom) {
      const mileageFromNum = parseInt(mileageFrom) || 0;
      filtered = filtered.filter((bike) => {
        const bikeMileage = parseInt(bike.kmDriven) || 0;
        return bikeMileage >= mileageFromNum;
      });
    }
    if (mileageTo) {
      const mileageToNum = parseInt(mileageTo) || 100000;
      filtered = filtered.filter((bike) => {
        const bikeMileage = parseInt(bike.kmDriven) || 0;
        return bikeMileage <= mileageToNum;
      });
    }

    // Filter by price range
    if (priceFrom) {
      const priceFromNum = parseInt(priceFrom) || 0;
      filtered = filtered.filter((bike) => {
        const bikePrice = parseFloat(bike.price) || 0;
        return bikePrice >= priceFromNum;
      });
    }
    if (priceTo) {
      const priceToNum = parseInt(priceTo) || 2000000;
      filtered = filtered.filter((bike) => {
        const bikePrice = parseFloat(bike.price) || 0;
        return bikePrice <= priceToNum;
      });
    }

    // Filter by fuel type
    if (selectedFuelTypes.length > 0) {
      filtered = filtered.filter((bike) => {
        const bikeFuelType = (bike.fuelType || '').toString().toLowerCase().trim();
        return selectedFuelTypes.some(fuelType => {
          const fuelTypeLower = fuelType.toLowerCase().trim();
          return bikeFuelType === fuelTypeLower || bikeFuelType.includes(fuelTypeLower);
        });
      });
    }

    // Filter by engine type
    if (selectedEngineTypes.length > 0) {
      filtered = filtered.filter((bike) => {
        const bikeEngineType = (bike.engineType || '').toString().toLowerCase().trim();
        return selectedEngineTypes.some(engineType => {
          const engineTypeLower = engineType.toLowerCase().trim();
          return bikeEngineType === engineTypeLower || bikeEngineType.includes(engineTypeLower);
        });
      });
    }

    // Filter by featured
    if (isFeatured) {
      filtered = filtered.filter((bike) => {
        return bike.isFeatured === 'Approved' || bike.isFeatured === true;
      });
    }

    setFilteredBikes(filtered);
  }, [
    bikes, searchKeyword, selectedCompanies, selectedModels, selectedVariants,
    selectedLocations, selectedRegistrationCities, selectedBodyColors,
    selectedFuelTypes, selectedEngineTypes, isFeatured,
    yearFrom, yearTo, engineCapacityFrom, engineCapacityTo,
    mileageFrom, mileageTo, priceFrom, priceTo
  ]);

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

  const formatMileage = (km) => {
    if (!km) return 'N/A';
    return `${km.toLocaleString()} km`;
  };

  return (
    <>
      <Helmet>
        <title>Used Bikes - Auto Finder</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-2 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">{t('usedBikesForSaleInPakistan')}</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t('findYourDreamBike')}</p>
          </div>

          {/* Active Filters */}
          {(searchKeyword.trim() || selectedCompanies.length > 0 || selectedModels.length > 0 ||
            selectedVariants.length > 0 || selectedLocations.length > 0 || selectedRegistrationCities.length > 0 ||
            selectedBodyColors.length > 0 || selectedFuelTypes.length > 0 || selectedEngineTypes.length > 0 ||
            isFeatured || yearFrom || yearTo || engineCapacityFrom || engineCapacityTo ||
            mileageFrom || mileageTo || priceFrom || priceTo) && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {searchKeyword.trim() && (
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                    Search: {searchKeyword}
                  </span>
                )}
                {selectedCompanies.length > 0 && (
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                    Companies: {selectedCompanies.join(', ')}
                  </span>
                )}
                {selectedModels.length > 0 && (
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                    Models: {selectedModels.join(', ')}
                  </span>
                )}
                {selectedLocations.length > 0 && (
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                    Locations: {selectedLocations.join(', ')}
                  </span>
                )}
                {(priceFrom || priceTo) && (
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                    Price: {priceFrom || '0'} - {priceTo || '∞'}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchKeyword('');
                    setSelectedCompanies([]);
                    setSelectedModels([]);
                    setSelectedVariants([]);
                    setSelectedLocations([]);
                    setSelectedRegistrationCities([]);
                    setSelectedBodyColors([]);
                    setSelectedFuelTypes([]);
                    setSelectedEngineTypes([]);
                    setIsFeatured(false);
                    setYearFrom('');
                    setYearTo('');
                    setEngineCapacityFrom('');
                    setEngineCapacityTo('');
                    setMileageFrom('');
                    setMileageTo('');
                    setPriceFrom('');
                    setPriceTo('');
                  }}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Sidebar - Filters */}
            <div className="w-full lg:w-56 xl:w-60 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors overflow-hidden">
                {/* SHOW RESULTS BY Header */}
                <div className="bg-red-600 dark:bg-red-700 text-white px-2.5 py-2 font-semibold text-xs text-center border-b border-white/10 uppercase">
                  {t('showResultsBy')}
                </div>

                {/* SEARCH BY KEYWORD */}
                <div className="p-2.5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="e.g. Honda CD-70"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="w-full px-2 py-1.5 pr-8 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <div className="absolute right-0 top-0 h-full flex items-center pr-1">
                        <VoiceSearchComp
                          onResult={(text) => {
                            setSearchKeyword(text);
                            // Optionally trigger search if needed, but usually state update is enough
                          }}
                          className="scale-90"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => { }}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 rounded text-xs font-semibold transition flex-shrink-0"
                    >
                      Go
                    </button>
                  </div>
                </div>

                {/* COMPANY Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                    className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">COMPANY</span>
                    {isCompanyOpen ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    )}
                  </button>
                  {isCompanyOpen && (
                    <div className="px-2.5 pb-2.5 space-y-1.5 max-h-48 overflow-y-auto">
                      {companies.map((company) => {
                        const count = companyCounts[company] || 0;
                        const isChecked = selectedCompanies.includes(company);
                        return (
                          <label
                            key={company}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-0.5 rounded"
                          >
                            <div className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCompany(company)}
                                className="w-3 h-3 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 flex-shrink-0"
                              />
                              <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{company}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* MODEL Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsModelOpen(!isModelOpen)}
                    className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">MODEL</span>
                    {isModelOpen ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    )}
                  </button>
                  {isModelOpen && (
                    <div className="px-2.5 pb-2.5 space-y-1.5 max-h-48 overflow-y-auto">
                      {allModels.map((model) => {
                        const count = modelCounts[model] || 0;
                        const isChecked = selectedModels.includes(model);
                        return (
                          <label
                            key={model}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-0.5 rounded"
                          >
                            <div className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleModel(model)}
                                className="w-3 h-3 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 flex-shrink-0"
                              />
                              <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{model}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* VARIANT Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsVariantOpen(!isVariantOpen)}
                    className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">VARIANT</span>
                    {isVariantOpen ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    )}
                  </button>
                  {isVariantOpen && (
                    <div className="px-2.5 pb-2.5 space-y-1.5 max-h-48 overflow-y-auto">
                      {variants.map((variant) => {
                        const isChecked = selectedVariants.includes(variant);
                        return (
                          <label
                            key={variant}
                            className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-0.5 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleVariant(variant)}
                              className="w-3 h-3 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 flex-shrink-0"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300 ml-1.5 truncate">{variant}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* YEAR Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsYearOpen(!isYearOpen)}
                    className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">YEAR</span>
                    {isYearOpen ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    )}
                  </button>
                  {isYearOpen && (
                    <div className="px-2.5 pb-2.5">
                      <div className="flex gap-1.5 items-center w-full">
                        <input
                          type="number"
                          placeholder="From"
                          value={yearFrom}
                          onChange={(e) => setYearFrom(e.target.value)}
                          className="flex-1 min-w-0 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <input
                          type="number"
                          placeholder="To"
                          value={yearTo}
                          onChange={(e) => setYearTo(e.target.value)}
                          className="flex-1 min-w-0 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <button
                          onClick={() => { }}
                          className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-semibold transition whitespace-nowrap flex-shrink-0"
                        >
                          Go
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* LOCATION Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsLocationOpen(!isLocationOpen)}
                    className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">LOCATION</span>
                    {isLocationOpen ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    )}
                  </button>
                  {isLocationOpen && (
                    <div className="px-2.5 pb-2.5 space-y-1.5 max-h-48 overflow-y-auto">
                      {cities.map((city) => {
                        const count = locationCounts[city] || 0;
                        const isChecked = selectedLocations.includes(city);
                        return (
                          <label
                            key={city}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-0.5 rounded"
                          >
                            <div className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleLocation(city)}
                                className="w-3 h-3 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 flex-shrink-0"
                              />
                              <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{city}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                      <div className="text-xs text-red-600 dark:text-red-400 mt-2 cursor-pointer hover:underline">
                        more choices...
                      </div>
                    </div>
                  )}
                </div>

                {/* REGISTRATION CITY Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsRegistrationCityOpen(!isRegistrationCityOpen)}
                    className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">REGISTRATION CITY</span>
                    {isRegistrationCityOpen ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    )}
                  </button>
                  {isRegistrationCityOpen && (
                    <div className="px-2.5 pb-2.5 space-y-1.5 max-h-48 overflow-y-auto">
                      {cities.map((city) => {
                        const count = registrationCityCounts[city] || 0;
                        const isChecked = selectedRegistrationCities.includes(city);
                        return (
                          <label
                            key={city}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-0.5 rounded"
                          >
                            <div className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleRegistrationCity(city)}
                                className="w-3 h-3 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 flex-shrink-0"
                              />
                              <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{city}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                      <div className="text-xs text-red-600 dark:text-red-400 mt-2 cursor-pointer hover:underline">
                        more choices...
                      </div>
                    </div>
                  )}
                </div>

                {/* ENGINE CAPACITY (CC) Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsEngineCapacityOpen(!isEngineCapacityOpen)}
                    className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">ENGINE CAPACITY (CC)</span>
                    {isEngineCapacityOpen ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    )}
                  </button>
                  {isEngineCapacityOpen && (
                    <div className="px-2.5 pb-2.5">
                      <div className="flex gap-1.5 items-center w-full">
                        <input
                          type="number"
                          placeholder="From"
                          value={engineCapacityFrom}
                          onChange={(e) => setEngineCapacityFrom(e.target.value)}
                          className="flex-1 min-w-0 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <input
                          type="number"
                          placeholder="To"
                          value={engineCapacityTo}
                          onChange={(e) => setEngineCapacityTo(e.target.value)}
                          className="flex-1 min-w-0 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <button
                          onClick={() => { }}
                          className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-semibold transition whitespace-nowrap flex-shrink-0"
                        >
                          Go
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* BODY COLOR Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsBodyColorOpen(!isBodyColorOpen)}
                    className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">BODY COLOR</span>
                    {isBodyColorOpen ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    )}
                  </button>
                  {isBodyColorOpen && (
                    <div className="px-2.5 pb-2.5 space-y-1.5 max-h-48 overflow-y-auto">
                      {bodyColors.map((color) => {
                        const count = bodyColorCounts[color] || 0;
                        const isChecked = selectedBodyColors.includes(color);
                        return (
                          <label
                            key={color}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-0.5 rounded"
                          >
                            <div className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleBodyColor(color)}
                                className="w-3 h-3 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 flex-shrink-0"
                              />
                              <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{color}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                      <div className="text-xs text-red-600 dark:text-red-400 mt-2 cursor-pointer hover:underline">
                        more choices...
                      </div>
                    </div>
                  )}
                </div>

                {/* MILEAGE (KM) Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsMileageOpen(!isMileageOpen)}
                    className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">MILEAGE (KM)</span>
                    {isMileageOpen ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    )}
                  </button>
                  {isMileageOpen && (
                    <div className="px-2.5 pb-2.5">
                      <MileageRangeDropdown
                        mileageFrom={mileageFrom}
                        mileageTo={mileageTo}
                        onFromChange={setMileageFrom}
                        onToChange={setMileageTo}
                        suggestions={bikeMileageSuggestions}
                        onGoClick={() => { }}
                      />
                    </div>
                  )}
                </div>

                {/* PRICE RANGE Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsPriceOpen(!isPriceOpen)}
                    className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">PRICE RANGE</span>
                    {isPriceOpen ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    )}
                  </button>
                  {isPriceOpen && (
                    <div className="px-2.5 pb-2.5">
                      <PriceRangeDropdown
                        priceFrom={priceFrom}
                        priceTo={priceTo}
                        onFromChange={setPriceFrom}
                        onToChange={setPriceTo}
                        suggestions={bikePriceSuggestions}
                        onGoClick={() => { }}
                        label="K"
                      />
                    </div>
                  )}
                </div>

                {/* FUEL TYPE Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsFuelTypeOpen(!isFuelTypeOpen)}
                    className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">FUEL TYPE</span>
                    {isFuelTypeOpen ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    )}
                  </button>
                  {isFuelTypeOpen && (
                    <div className="px-2.5 pb-2.5 space-y-1.5 max-h-48 overflow-y-auto">
                      {fuelTypes.map((fuelType) => {
                        const count = fuelTypeCounts[fuelType] || 0;
                        const isChecked = selectedFuelTypes.includes(fuelType);
                        return (
                          <label
                            key={fuelType}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-0.5 rounded"
                          >
                            <div className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleFuelType(fuelType)}
                                className="w-3 h-3 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 flex-shrink-0"
                              />
                              <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{fuelType}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ENGINE TYPE Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsEngineTypeOpen(!isEngineTypeOpen)}
                    className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">ENGINE TYPE</span>
                    {isEngineTypeOpen ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    )}
                  </button>
                  {isEngineTypeOpen && (
                    <div className="px-2.5 pb-2.5 space-y-1.5 max-h-48 overflow-y-auto">
                      {engineTypes.map((engineType) => {
                        const count = engineTypeCounts[engineType] || 0;
                        const isChecked = selectedEngineTypes.includes(engineType);
                        return (
                          <label
                            key={engineType}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-0.5 rounded"
                          >
                            <div className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleEngineType(engineType)}
                                className="w-3 h-3 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 flex-shrink-0"
                              />
                              <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{engineType}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* FEATURED ADS Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsFeaturedOpen(!isFeaturedOpen)}
                    className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">FEATURED ADS</span>
                    {isFeaturedOpen ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                    )}
                  </button>
                  {isFeaturedOpen && (
                    <div className="px-2.5 pb-2.5">
                      <label className="flex items-center cursor-pointer p-0.5">
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="w-3 h-3 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 flex-shrink-0"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300 ml-1.5 truncate">Show only featured ads</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Bikes List */}
            <div className="flex-1 min-w-0 w-full">

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">Loading used bikes...</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    {[1, 2, 3].map((i) => (
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
                  <p className="text-yellow-800 dark:text-yellow-400 font-semibold mb-2">Unable to load used bikes</p>
                  <p className="text-yellow-700 dark:text-yellow-500 text-sm mb-2">Error: {error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-800"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* No Bikes Found */}
              {!loading && !error && filteredBikes.length === 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-2 font-semibold text-lg">
                    No used bikes found
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Try selecting different filters</p>
                  <button
                    onClick={() => {
                      setSearchKeyword('');
                      setSelectedCompanies([]);
                      setSelectedModels([]);
                      setSelectedVariants([]);
                      setSelectedLocations([]);
                      setSelectedRegistrationCities([]);
                      setSelectedBodyColors([]);
                      setSelectedFuelTypes([]);
                      setSelectedEngineTypes([]);
                      setIsFeatured(false);
                      setYearFrom('');
                      setYearTo('');
                      setEngineCapacityFrom('');
                      setEngineCapacityTo('');
                      setMileageFrom('');
                      setMileageTo('');
                      setPriceFrom('');
                      setPriceTo('');
                    }}
                    className="mt-4 bg-red-600 dark:bg-red-700 text-white px-6 py-2 rounded hover:bg-red-700 dark:hover:bg-red-800"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Used Bikes List */}
              {!loading && !error && filteredBikes.length > 0 && (
                <>
                  <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Showing {filteredBikes.length} {filteredBikes.length === 1 ? 'bike' : 'bikes'}
                    {(selectedCompanies.length > 0 || selectedModels.length > 0 || selectedLocations.length > 0) && ' (filtered)'}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredBikes.map((bike) => {
                      const imageUrl = buildImageUrl(bike.image1);

                      return (
                        <div key={bike._id || Math.random()} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group h-full flex flex-col">
                          <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden flex-shrink-0">
                            <img
                              src={imageUrl}
                              alt={`${bike.make || 'Bike'} ${bike.model || ''}`}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EBike Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {/* Only show PREMIUM tag for approved premium/featured bike ads, not free ads */}
                            {bike.isFeatured === 'Approved' && bike.isPaidAd === true && (
                              <span className="absolute top-2 right-2 bg-yellow-500 dark:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-semibold">
                                PREMIUM
                              </span>
                            )}
                          </div>
                          <div className="p-6 flex-grow flex flex-col">
                            <h3 className="text-xl font-semibold mb-2 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors text-gray-800 dark:text-gray-200">
                              {bike.make} {bike.model} {bike.variant ? bike.variant : ''} {bike.year}
                            </h3>
                            <div className="mb-3">
                              <span className="text-red-600 dark:text-red-500 font-bold text-lg">{formatPrice(bike.price)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                              {bike.year && (
                                <div className="flex items-center gap-1">
                                  <FaCalendarAlt className="text-red-600 dark:text-red-500" />
                                  <strong>Year:</strong> {bike.year}
                                </div>
                              )}
                              {bike.transmission && (
                                <div className="flex items-center gap-1">
                                  <FaCog className="text-red-600 dark:text-red-500" />
                                  <strong>Transmission:</strong> {bike.transmission}
                                </div>
                              )}
                              {bike.engineCapacity && (
                                <div className="flex items-center gap-1">
                                  <FaBolt className="text-red-600 dark:text-red-500" />
                                  <strong>Engine:</strong> {bike.engineCapacity}
                                </div>
                              )}
                              {bike.kmDriven && (
                                <div className="flex items-center gap-1">
                                  <FaMotorcycle className="text-red-600 dark:text-red-500" />
                                  <strong>Mileage:</strong> {formatMileage(bike.kmDriven)}
                                </div>
                              )}
                            </div>
                            {bike.location && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                <FaMapMarkerAlt className="text-red-600 dark:text-red-500" />
                                <span>{bike.location}</span>
                              </div>
                            )}
                            {/* Spacer to push button to bottom */}
                            <div className="flex-grow"></div>
                            <Link
                              to={`/bike-detail/${bike._id}`}
                              className="block w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white text-center py-2 rounded-md transition font-semibold mt-auto"
                            >
                              View Details
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

export default UsedBikes;

