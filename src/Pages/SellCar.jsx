import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTimes, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';
import { carData } from '../Utils/carData';
import { useLanguage } from '../contexts/LanguageContext';

// Searchable City Select Component
const SearchableCitySelect = ({ value, onChange, name, required = false, placeholder }) => {
  const { t } = useLanguage();
  const displayPlaceholder = placeholder || t('selectCity');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // All Pakistani Cities
  const allCities = [
    "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan",
    "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Sargodha",
    "Bahawalpur", "Sukkur", "Abbottabad", "Mardan", "Swat", "Kasur",
    "Sheikhupura", "Okara", "Jhang", "Larkana", "Rahim Yar Khan", "Gujrat",
    "Dera Ghazi Khan", "Mirpur", "Muzaffarabad", "Nawabshah", "Chiniot",
    "Khairpur", "Charsadda", "Nowshera", "Kohat", "Karak", "Bannu", "Dera Ismail Khan",
    "Haripur", "Kamoke", "Turbat", "Gwadar", "Hub", "Jacobabad", "Khuzdar",
    "Mansehra", "Attock", "Hassan Abdal", "Lodhran", "Toba Tek Singh", "Jhelum",
    "Kharian", "Wazirabad", "Pakpattan", "Shikarpur", "Badin", "Thatta",
    "Matiari", "Hala", "Mianwali", "Bhakkar", "Hafizabad", "Khanewal",
    "Sadiqabad", "Ghotki", "Kotri", "Shahdadpur", "Umerkot", "Sanghar",
    "Dadu", "Tando Adam", "Tando Allahyar", "Moro", "Khairpur Nathan Shah",
    "Rohri", "Chaman", "Zhob", "Loralai", "Pishin", "Kalat", "Sibi", "Vehari",
    "Arifwala", "Khanpur", "Kot Addu", "Muzaffargarh", "Jatoi", "Chishtian",
    "Hasilpur", "Muridke", "Kaswal", "Mandi Bahauddin", "Narowal", "Shorkot",
    "Jaranwala", "Pattoki",
    "Gilgit", "Skardu", "Hunza", "Nagar", "Ghizer", "Astore", "Diamer",
    "Mirpur AJK", "Kotli AJK", "Rawalakot", "Bagh AJK", "Bhimber"
  ].sort((a, b) => a.localeCompare(b));

  const filteredCities = allCities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (city) => {
    onChange({ target: { name, value: city } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer flex items-center justify-between"
      >
        <span className={value ? '' : 'text-gray-500 dark:text-gray-400'}>
          {value || displayPlaceholder}
        </span>
        <FaChevronDown className={`text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder={t('searchCity')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <div
                  key={city}
                  onClick={() => handleSelect(city)}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${value === city ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : ''
                    }`}
                >
                  {city}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">
                {t('noCityFound')}
              </div>
            )}
          </div>
        </div>
      )}
      {required && !value && (
        <input type="hidden" required />
      )}
    </div>
  );
};

// Searchable Make Select Component
const SearchableMakeSelect = ({ value, onChange, name, required = false, placeholder }) => {
  const { t } = useLanguage();
  const displayPlaceholder = placeholder || t('selectMake');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const makes = carData ? Object.keys(carData).sort((a, b) => a.localeCompare(b)) : [];
  const filteredMakes = makes.filter(make =>
    make.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (make) => {
    onChange({ target: { name, value: make } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer flex items-center justify-between"
      >
        <span className={value ? '' : 'text-gray-500 dark:text-gray-400'}>
          {value || displayPlaceholder}
        </span>
        <FaChevronDown className={`text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder={t('searchMake')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredMakes.length > 0 ? (
              filteredMakes.map((make) => (
                <div
                  key={make}
                  onClick={() => handleSelect(make)}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${value === make ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : ''
                    }`}
                >
                  {make}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">
                {t('noMakeFound')}
              </div>
            )}
          </div>
        </div>
      )}
      {required && !value && (
        <input type="hidden" required />
      )}
    </div>
  );
};

// Searchable Model Select Component (depends on Make)
const SearchableModelSelect = ({
  value,
  onChange,
  name,
  selectedMake,
  required = false,
  placeholder,
}) => {
  const { t } = useLanguage();
  const displayPlaceholder = placeholder || t('selectModel');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const models =
    selectedMake && carData && carData[selectedMake]
      ? Object.keys(carData[selectedMake].models || {}).sort((a, b) => a.localeCompare(b))
      : [];

  const filteredModels = models.filter((model) =>
    model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!selectedMake) {
      onChange({ target: { name, value: '' } });
    }
  }, [selectedMake, name, onChange]);

  const handleSelect = (model) => {
    onChange({ target: { name, value: model } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => selectedMake && setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between ${selectedMake ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          }`}
      >
        <span className={value ? '' : 'text-gray-500 dark:text-gray-400'}>
          {value || (selectedMake ? displayPlaceholder : t('selectMakeFirst'))}
        </span>
        <FaChevronDown className={`text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>

      {isOpen && selectedMake && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder={t('searchModel')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredModels.length > 0 ? (
              filteredModels.map((model) => (
                <div
                  key={model}
                  onClick={() => handleSelect(model)}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${value === model ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : ''
                    }`}
                >
                  {model}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">
                {t('noModelFound')}
              </div>
            )}
          </div>
        </div>
      )}
      {required && !value && (
        <input type="hidden" required />
      )}
    </div>
  );
};

// Searchable Variant Select Component (depends on Make and Model)
const SearchableVariantSelect = ({
  value,
  onChange,
  name,
  selectedMake,
  selectedModel,
  placeholder,
}) => {
  const { t } = useLanguage();
  const displayPlaceholder = placeholder || t('selectVariant');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const variants =
    selectedMake &&
      selectedModel &&
      carData &&
      carData[selectedMake]?.models?.[selectedModel]
      ? Object.keys(carData[selectedMake].models[selectedModel].variants || {}).sort((a, b) =>
        a.localeCompare(b)
      )
      : [];

  const filteredVariants = variants.filter((variant) =>
    variant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!selectedMake || !selectedModel) {
      onChange({ target: { name, value: '' } });
    }
  }, [selectedMake, selectedModel, name, onChange]);

  const handleSelect = (variant) => {
    onChange({ target: { name, value: variant } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => selectedMake && selectedModel && setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between ${selectedMake && selectedModel ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          }`}
      >
        <span className={value ? '' : 'text-gray-500 dark:text-gray-400'}>
          {value || (selectedMake && selectedModel ? displayPlaceholder : t('selectMakeAndModelFirst'))}
        </span>
        <FaChevronDown className={`text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>

      {isOpen && selectedMake && selectedModel && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder={t('searchVariant')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredVariants.length > 0 ? (
              filteredVariants.map((variant) => (
                <div
                  key={variant}
                  onClick={() => handleSelect(variant)}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${value === variant ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : ''
                    }`}
                >
                  {variant}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">
                {t('noVariantFound')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function SellCar() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);

  // Check if coming from dealer package (My Packages page)
  const dealerPackageId = location.state?.dealerPackageId || null;
  const purchaseId = location.state?.purchaseId || null;
  const skipPayment = location.state?.skipPayment || false;

  // Initialize selectedService from URL params
  const [activeForm, setActiveForm] = useState(null); // 'premium', 'listItForYou', 'free', or null

  // Get initial service from URL
  const getInitialService = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('service');
  };

  const [selectedService, setSelectedService] = useState(() => {
    const service = getInitialService();
    return service === 'listItForYou' ? 'listItForYou' :
      service === 'premium' ? 'premium' :
        service === 'free' ? 'free' : null;
  });

  // Sync selectedService with URL params whenever URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const serviceParam = searchParams.get('service');

    if (serviceParam === 'listItForYou' && selectedService !== 'listItForYou') {
      setSelectedService('listItForYou');
    } else if (serviceParam === 'premium' && selectedService !== 'premium') {
      setSelectedService('premium');
    } else if (serviceParam === 'free' && selectedService !== 'free') {
      setSelectedService('free');
    } else if (!serviceParam && selectedService !== null) {
      // Only reset if URL has no service param
      setSelectedService(null);
    }
  }, [location.search]);

  // Auto-select premium form if coming from dealer package
  useEffect(() => {
    if (dealerPackageId && skipPayment) {
      setActiveForm('premium');
      setSelectedService('premium');
      // Don't show package selection - user already has package
      setShowPackageSelection(false);
      // Set a dummy selected package so form shows directly
      setSelectedPackage({
        _id: dealerPackageId,
        id: dealerPackageId,
        name: 'Dealer Package',
        bundleName: 'Dealer Package',
        discountedPrice: 0,
        price: 0
      });
    }
  }, [dealerPackageId, skipPayment]);

  // Fetch packages when premium form is activated (only if NOT using dealer package)
  useEffect(() => {
    if (activeForm === 'premium' && !selectedPackage && !dealerPackageId) {
      fetchCarPackages();
      setShowPackageSelection(true);
    }
  }, [activeForm, dealerPackageId]);

  // Fetch packages when List It For You form is activated
  useEffect(() => {
    if (activeForm === 'listItForYou' && !selectedListItPackage) {
      fetchListItPackages();
      setShowListItPackageSelection(true);
    }
  }, [activeForm]);

  // Fetch car packages from backend API (same as mobile app)
  const fetchCarPackages = async () => {
    try {
      setLoadingPackages(true);
      const API_URL = server_ip || 'http://localhost:8001';

      console.log('📦 Fetching car packages from backend...');
      const response = await fetch(`${API_URL}/mobile/dealer_packages/car`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Car packages response:', data);

      // Handle both response formats: { success: true, packages: [...] } or direct array
      let packagesArray = [];
      if (data.success && Array.isArray(data.packages)) {
        packagesArray = data.packages;
      } else if (Array.isArray(data)) {
        packagesArray = data;
      }

      // Transform packages to match website format
      const transformedPackages = packagesArray.map(pkg => ({
        _id: pkg.id || pkg._id,
        id: pkg.id || pkg._id,
        name: pkg.name || pkg.bundleName,
        bundleName: pkg.bundleName || pkg.name,
        discountedPrice: pkg.discountedPrice || pkg.discountedRate || pkg.price || 0,
        price: pkg.originalPrice || pkg.actualPrice || pkg.price || pkg.discountedPrice || 0,
        actualPrice: pkg.originalPrice || pkg.actualPrice || pkg.price || 0,
        discountedRate: pkg.discountedPrice || pkg.discountedRate || pkg.price || 0,
        validityDays: pkg.validityDays || pkg.noOfDays || pkg.liveAdDays || 0,
        noOfDays: pkg.noOfDays || pkg.validityDays || pkg.liveAdDays || 0,
        description: pkg.description || '',
        features: pkg.features || [],
        popular: pkg.popular || false,
        totalAds: pkg.totalAds || 0,
        freeBoosters: pkg.freeBoosters || 0,
        youSaved: pkg.youSaved || 0,
        costPerAd: pkg.costPerAd || 0,
      }));

      console.log(`✅ Loaded ${transformedPackages.length} car packages from backend`);
      setPackages(transformedPackages);
    } catch (err) {
      console.error('❌ Error loading car packages from backend:', err);
      setError('Failed to load packages. Please try again.');
      // Fallback to empty array if API fails
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  // Handle package selection for Premium
  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setShowPackageSelection(false);
    // Update form with package info
    setPremiumForm(prev => ({
      ...prev,
      packageId: pkg._id || pkg.id,
      packageName: pkg.name || pkg.bundleName,
      packagePrice: pkg.discountedPrice || pkg.discountedRate || pkg.price,
      paymentAmount: pkg.discountedPrice || pkg.discountedRate || pkg.price,
      validityDays: pkg.validityDays || pkg.noOfDays,
      liveAdDays: pkg.liveAdDays || pkg.noOfDays,
      totalAds: pkg.totalAds || pkg.listingLimit || pkg.noOfBoosts
    }));
  };

  // Fetch packages for List It For You
  const fetchListItPackages = async () => {
    try {
      setLoadingListItPackages(true);
      // Simple car packages: Basic, Standard, Premium
      const simplePackages = [
        {
          _id: 'basic-package',
          id: 'basic-package',
          name: 'Basic',
          bundleName: 'Basic',
          discountedPrice: 1500,
          price: 1500,
          validityDays: 7,
          noOfDays: 7,
          description: 'Featured placement for 7 days with basic visibility benefits.',
        },
        {
          _id: 'standard-package',
          id: 'standard-package',
          name: 'Standard',
          bundleName: 'Standard',
          discountedPrice: 2250,
          price: 2250,
          validityDays: 15,
          noOfDays: 15,
          description: 'Featured placement for 15 days with standard visibility benefits.',
          popular: true,
        },
        {
          _id: 'premium-package',
          id: 'premium-package',
          name: 'Premium',
          bundleName: 'Premium',
          discountedPrice: 3150,
          price: 3150,
          validityDays: 30,
          noOfDays: 30,
          description: 'Featured placement for 30 days with all premium benefits included.',
        },
      ];
      setListItPackages(simplePackages);
    } catch (err) {
      console.error('Error loading packages:', err);
    } finally {
      setLoadingListItPackages(false);
    }
  };

  // Handle package selection for List It For You
  const handleListItPackageSelect = (pkg) => {
    setSelectedListItPackage(pkg);
    setShowListItPackageSelection(false);
    // Update form with package info
    setListItForm(prev => ({
      ...prev,
      packageId: pkg._id || pkg.id,
      packageName: pkg.name || pkg.bundleName,
      packagePrice: pkg.discountedPrice || pkg.discountedRate || pkg.price,
      paymentAmount: pkg.discountedPrice || pkg.discountedRate || pkg.price,
      validityDays: pkg.validityDays || pkg.noOfDays,
      liveAdDays: pkg.liveAdDays || pkg.noOfDays,
      totalAds: pkg.totalAds || pkg.listingLimit || pkg.noOfBoosts
    }));
  };

  // Check URL parameters on mount to show specific form
  useEffect(() => {
    // Check authentication
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.info('Please login to post an ad');
      navigate('/signin');
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const service = searchParams.get('service');
    if (service === 'free') {
      setActiveForm('free');
      setSelectedService('free');
      // Scroll to top when form opens
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (service === 'premium') {
      setActiveForm('premium');
      setSelectedService('premium');
      // Scroll to top when form opens
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (service === 'listItForMe') {
      setActiveForm('listItForYou');
      setSelectedService('listItForYou');
      // Scroll to top when form opens
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSelectedService(null);
    }
  }, [location.search, navigate, t]);

  // Scroll to form when activeForm changes
  useEffect(() => {
    if (activeForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (activeForm) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeForm]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Package Selection State
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPackageSelection, setShowPackageSelection] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // Package Selection State for List It For You
  const [listItPackages, setListItPackages] = useState([]);
  const [selectedListItPackage, setSelectedListItPackage] = useState(null);
  const [showListItPackageSelection, setShowListItPackageSelection] = useState(false);
  const [loadingListItPackages, setLoadingListItPackages] = useState(false);

  // 525 PKR Package State (for when free ad limit is exhausted)
  const [show525Package, setShow525Package] = useState(false);
  const [pendingFreeAdData, setPendingFreeAdData] = useState(null); // Store form data when payment is required
  const [canPostFreeAd, setCanPostFreeAd] = useState(true); // Track if user can post free ad
  const [checkingFreeAdLimit, setCheckingFreeAdLimit] = useState(false); // Loading state for checking limit
  const [paymentReceipt525, setPaymentReceipt525] = useState(null); // Payment receipt for 525 package

  // Premium Car Ad Form State
  const [premiumForm, setPremiumForm] = useState({
    title: '',
    make: '',
    model: '',
    variant: '',
    year: '',
    price: '',
    location: '',
    registrationCity: '',
    bodyColor: '',
    kmDriven: '',
    fuelType: '',
    engineCapacity: '',
    transmission: '',
    assembly: '',
    bodyType: '',
    description: '',
    preferredContact: 'phone',
    category: '',
    packageId: '',
    packageName: '',
    packagePrice: '',
    paymentAmount: '',
    isFeatured: 'true',
    adType: 'featured',
    modelType: 'Featured',
    forcePremium: 'true'
  });
  const [premiumImages, setPremiumImages] = useState([]);
  const [premiumFeatures, setPremiumFeatures] = useState({
    AirConditioning: false,
    PowerSteering: false,
    PowerWindows: false,
    Abs: false,
    Airbags: false,
    Sunroof: false,
    Bluetooth: false,
    CruiseControl: false,
    ParkingSensors: false,
    Navigation: false,
    LeatherSeats: false,
    HeatedSeats: false,
    RearCamera: false,
    KeylessEntry: false,
    AlloyWheels: false,
    FogLights: false,
    Touchscreen: false,
  });
  const [premiumInvoiceImage, setPremiumInvoiceImage] = useState(null);

  // Free Ad Form State
  const [freeForm, setFreeForm] = useState({
    title: '',
    make: '',
    model: '',
    variant: '',
    year: '',
    price: '',
    location: '',
    registrationCity: '',
    bodyColor: '',
    kmDriven: '',
    fuelType: '',
    engineCapacity: '',
    transmission: '',
    assembly: '',
    bodyType: '',
    description: '',
    preferredContact: 'phone',
    category: '',
    adType: 'free',
    isFeatured: 'false'
  });
  const [freeImages, setFreeImages] = useState([]);
  const [freeFeatures, setFreeFeatures] = useState({
    AirConditioning: false,
    PowerSteering: false,
    PowerWindows: false,
    Abs: false,
    Airbags: false,
    Sunroof: false,
    Bluetooth: false,
    CruiseControl: false,
    ParkingSensors: false,
    Navigation: false,
    LeatherSeats: false,
    HeatedSeats: false,
    RearCamera: false,
    KeylessEntry: false,
    AlloyWheels: false,
    FogLights: false,
    Touchscreen: false,
  });

  // List It For You Form State
  const [listItForm, setListItForm] = useState({
    location: '',
    make: '',
    model: '',
    variant: '',
    year: '',
    registrationCity: '',
    bodyColor: '',
    kmDriven: '',
    price: '',
    description: '',
    fuelType: '',
    bodyType: '',
    engineCapacity: '',
    transmission: 'Automatic',
    assembly: 'Local',
  });
  const [listItImages, setListItImages] = useState([]);
  const [listItFeatures, setListItFeatures] = useState({
    AirConditioning: false,
    PowerSteering: false,
    PowerWindows: false,
    Abs: false,
    Airbags: false,
    Sunroof: false,
    Bluetooth: false,
    CruiseControl: false,
    ParkingSensors: false,
    Navigation: false,
    LeatherSeats: false,
    HeatedSeats: false,
    RearCamera: false,
    KeylessEntry: false,
    AlloyWheels: false,
    FogLights: false,
    Touchscreen: false,
  });

  // Get user from localStorage
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

  const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'LPG', 'CNG'];
  const transmissionTypes = ['Automatic', 'Manual', 'Semi-Automatic', 'CVT'];
  const bodyTypes = ['Hatchback', 'Sedan', 'SUV', 'Crossover', 'Van', 'MPV', 'Pick Up', 'Coupe', 'Convertible'];
  const assemblyTypes = ['Local', 'Imported'];
  const colors = ['White', 'Black', 'Gray', 'Silver', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Brown', 'Beige', 'Gold'];

  // Generate years from 1990 to current year + 1
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

  const handleImageChange = (e, formType) => {
    const files = Array.from(e.target.files).slice(0, 20);
    if (formType === 'premium') {
      setPremiumImages(files);
    } else if (formType === 'free') {
      setFreeImages(files.slice(0, 10));
    } else {
      setListItImages(files.slice(0, 8));
    }
  };

  const removeImage = (index, formType) => {
    if (formType === 'premium') {
      setPremiumImages(prev => prev.filter((_, i) => i !== index));
    } else if (formType === 'free') {
      setFreeImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setListItImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handlePremiumInputChange = (e) => {
    const { name, value } = e.target;
    setPremiumForm(prev => ({ ...prev, [name]: value }));
  };

  const handleListItInputChange = (e) => {
    const { name, value } = e.target;
    setListItForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFreeInputChange = (e) => {
    const { name, value } = e.target;
    setFreeForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleFeature = (feature, formType) => {
    if (formType === 'premium') {
      setPremiumFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
    } else if (formType === 'free') {
      setFreeFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
    } else {
      setListItFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
    }
  };

  const handlePremiumInvoiceChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPremiumInvoiceImage(e.target.files[0]);
    }
  };

  const handlePremiumSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!userId) {
      setError('Please login to create an ad');
      setLoading(false);
      return;
    }

    // Validation
    if (!premiumForm.title || !premiumForm.make || !premiumForm.model || !premiumForm.year || !premiumForm.price) {
      setError('Please fill in all required fields: Title, Make, Model, Year, and Price');
      setLoading(false);
      return;
    }

    if (premiumImages.length === 0) {
      setError('Please upload at least one image');
      setLoading(false);
      return;
    }

    try {
      const API_URL = server_ip || 'http://localhost:8001';
      const formData = new FormData();

      // Append all form fields
      Object.keys(premiumForm).forEach(key => {
        if (premiumForm[key]) {
          formData.append(key, premiumForm[key]);
        }
      });

      formData.append('userId', userId);
      formData.append('category', 'premium');

      // If coming from dealer package, add package info and skip payment
      if (dealerPackageId && skipPayment) {
        formData.append('dealerPackageId', dealerPackageId);
        if (purchaseId) {
          formData.append('purchaseId', purchaseId);
        }
        formData.append('skipPayment', 'true');
        console.log('📦 Using dealer package:', dealerPackageId, 'Purchase:', purchaseId);
      }

      // Append features
      const features = Object.keys(premiumFeatures).filter(key => premiumFeatures[key]);
      formData.append('features', features.join(','));

      // Append images
      premiumImages.forEach((image, index) => {
        formData.append(`image${index + 1}`, image);
      });

      // Append invoice image only if NOT using dealer package
      if (premiumInvoiceImage && !skipPayment) {
        formData.append('invoiceImage', premiumInvoiceImage);
      }

      console.log('🔄 Submitting premium car ad...');

      const response = await fetch(`${API_URL}/featured_ads`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Premium car ad created successfully:', result);

      setSuccess(true);
      setActiveForm(null);

      // Reset form
      setPremiumForm({
        title: '',
        make: '',
        model: '',
        variant: '',
        year: '',
        price: '',
        location: '',
        registrationCity: '',
        bodyColor: '',
        kmDriven: '',
        fuelType: '',
        engineCapacity: '',
        transmission: '',
        assembly: '',
        bodyType: '',
        description: '',
        preferredContact: 'phone',
        category: '',
        packageId: '',
        packageName: '',
        packagePrice: '',
        paymentAmount: '',
        isFeatured: 'true',
        adType: 'featured',
        modelType: 'Featured',
        forcePremium: 'true'
      });
      setPremiumImages([]);
      setPremiumFeatures({
        AirConditioning: false,
        PowerSteering: false,
        PowerWindows: false,
        Abs: false,
        Airbags: false,
        Sunroof: false,
        Bluetooth: false,
        CruiseControl: false,
        ParkingSensors: false,
        Navigation: false,
        LeatherSeats: false,
        HeatedSeats: false,
        RearCamera: false,
        KeylessEntry: false,
        AlloyWheels: false,
        FogLights: false,
        Touchscreen: false,
      });
      setPremiumInvoiceImage(null);

      setTimeout(() => {
        setSuccess(false);
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('❌ Error creating premium car ad:', err);
      setError(err.message || 'Failed to create premium car ad. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleListItSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!userId) {
      setError('Please login to create an ad');
      setLoading(false);
      return;
    }

    if (!selectedListItPackage) {
      setError('Please select a package first.');
      setShowListItPackageSelection(true);
      setLoading(false);
      return;
    }

    // Validation
    if (!listItForm.location || !listItForm.make || !listItForm.model || !listItForm.year || !listItForm.price) {
      setError('Please fill in all required fields: Location, Make, Model, Year, and Price');
      setLoading(false);
      return;
    }

    if (listItImages.length === 0) {
      setError('Please upload at least one image');
      setLoading(false);
      return;
    }

    try {
      const API_URL = server_ip || 'http://localhost:8001';
      const formData = new FormData();

      formData.append('userId', userId);
      formData.append('addedBy', userId);

      // Append all form fields (including package info)
      Object.keys(listItForm).forEach(key => {
        if (listItForm[key]) {
          formData.append(key, listItForm[key]);
        }
      });

      // Add package info explicitly
      if (selectedListItPackage) {
        formData.append('packageId', selectedListItPackage._id || selectedListItPackage.id || '');
        formData.append('packageName', selectedListItPackage.name || selectedListItPackage.bundleName || '');
        formData.append('packagePrice', (selectedListItPackage.discountedPrice || selectedListItPackage.discountedRate || selectedListItPackage.price || 0).toString());
        formData.append('paymentAmount', (selectedListItPackage.discountedPrice || selectedListItPackage.discountedRate || selectedListItPackage.price || 0).toString());
        formData.append('validityDays', (selectedListItPackage.validityDays || selectedListItPackage.noOfDays || 0).toString());

        // Calculate expiry date
        const validityDays = selectedListItPackage.validityDays || selectedListItPackage.noOfDays || 0;
        if (validityDays > 0) {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + validityDays);
          formData.append('featuredExpiryDate', expiryDate.toISOString());
        }
      }

      // Append features
      const features = Object.keys(listItFeatures).filter(key => listItFeatures[key]);
      formData.append('features', features.join(','));

      // Append images
      listItImages.forEach((image, index) => {
        formData.append(`image${index + 1}`, image);
      });

      console.log('🔄 Submitting list it for you ad...');

      const response = await fetchWithRetry(`${API_URL}/list_it_for_you_ad`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ List it for you ad created successfully:', result);

      setSuccess(true);
      setActiveForm(null);

      // Reset form
      setListItForm({
        location: '',
        make: '',
        model: '',
        variant: '',
        year: '',
        registrationCity: '',
        bodyColor: '',
        kmDriven: '',
        price: '',
        description: '',
        fuelType: '',
        bodyType: '',
        engineCapacity: '',
        transmission: 'Automatic',
        assembly: 'Local',
        packageId: '',
        packageName: '',
        packagePrice: '',
        paymentAmount: '',
        validityDays: '',
        liveAdDays: '',
        totalAds: '',
      });
      setListItImages([]);
      setListItFeatures({
        AirConditioning: false,
        PowerSteering: false,
        PowerWindows: false,
        Abs: false,
        Airbags: false,
        Sunroof: false,
        Bluetooth: false,
        CruiseControl: false,
        ParkingSensors: false,
        Navigation: false,
        LeatherSeats: false,
        HeatedSeats: false,
        RearCamera: false,
        KeylessEntry: false,
        AlloyWheels: false,
        FogLights: false,
        Touchscreen: false,
      });
      // Reset package selection
      setSelectedListItPackage(null);
      setShowListItPackageSelection(false);

      setTimeout(() => {
        setSuccess(false);
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('❌ Error creating list it for you ad:', err);
      setError(err.message || 'Failed to create ad. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFreeSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!userId) {
      setError('Please login to create an ad');
      setLoading(false);
      return;
    }

    // Validation
    if (!freeForm.title || !freeForm.make || !freeForm.model || !freeForm.year || !freeForm.price) {
      setError('Please fill in all required fields: Title, Make, Model, Year, and Price');
      setLoading(false);
      return;
    }

    if (freeImages.length === 0) {
      setError('Please upload at least one image');
      setLoading(false);
      return;
    }

    // Check free ad limit BEFORE submitting - THIS IS CRITICAL
    console.log('🔍 Checking free ad limit before submission...');
    try {
      const API_URL = server_ip || 'http://localhost:8001';
      const limitCheckResponse = await fetchWithRetry(`${API_URL}/user-pricing/${userId}`, {
        method: 'GET',
      });

      console.log('📡 Limit check response status:', limitCheckResponse.status);

      if (limitCheckResponse.ok) {
        const limitData = await limitCheckResponse.json();
        console.log('💰 User pricing data:', limitData);
        const canPost = limitData.canPostFree || false;
        console.log('💰 Can post free ad:', canPost);
        console.log('💰 Free ads remaining:', limitData.freeAdsRemaining);

        // If user can't post free ad, show 525 package directly
        if (!canPost) {
          console.log('💰 Free ad limit exhausted - showing 525 PKR package');
          // Store the form data
          setPendingFreeAdData({
            form: freeForm,
            images: freeImages,
            features: freeFeatures
          });
          setShow525Package(true);
          setActiveForm('free'); // Keep form active
          setError(null);
          setLoading(false);
          toast.info(`You've used all ${limitData.pricingInfo?.freeAds || 2} free ads. Please upload payment receipt for PKR 525.`);
          // Scroll to package section
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
          return; // Don't submit, show package instead
        }
        console.log('✅ User can post free ad, proceeding with submission');
      } else {
        console.log('⚠️ Limit check response not OK, status:', limitCheckResponse.status);
        // If limit check fails, still try to submit - backend will handle it
      }
    } catch (limitError) {
      console.error('❌ Error checking free ad limit:', limitError);
      console.error('❌ Limit check error details:', limitError.message);
      // If limit check fails due to network, show package as fallback
      if (limitError.message && limitError.message.includes('fetch')) {
        console.log('⚠️ Network error during limit check - showing 525 package as fallback');
        setPendingFreeAdData({
          form: freeForm,
          images: freeImages,
          features: freeFeatures
        });
        setShow525Package(true);
        setActiveForm('free');
        setError(null);
        setLoading(false);
        toast.info('Unable to verify free ad limit. Please upload payment receipt for PKR 525 to continue.');
        return;
      }
      // Otherwise continue with submission - backend will handle it
      console.log('⚠️ Could not check limit before submission, proceeding with form submit');
    }

    try {
      const API_URL = server_ip || 'http://localhost:8001';
      const formData = new FormData();

      // Append all form fields
      Object.keys(freeForm).forEach(key => {
        if (freeForm[key]) {
          formData.append(key, freeForm[key]);
        }
      });

      formData.append('userId', userId);
      formData.append('category', 'free');

      // Append features
      const features = Object.keys(freeFeatures).filter(key => freeFeatures[key]);
      formData.append('features', features.join(','));

      // Append images
      freeImages.forEach((image, index) => {
        formData.append(`image${index + 1}`, image);
      });

      console.log('🔄 Submitting free car ad...');

      const response = await fetchWithRetry(`${API_URL}/free_ads`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If response is not JSON, try to get text
          const errorText = await response.text();
          errorData = { message: errorText || 'Failed to create ad' };
        }

        console.log('❌ Backend error response:', errorData);
        console.log('❌ Response status:', response.status);

        // Check if payment is required (525 PKR) - show package selection
        // Check multiple error message patterns
        const errorMessage = errorData.message || errorData.error || '';
        const hasPaymentError = (
          errorMessage.includes('Payment required') ||
          errorMessage.includes('Payment receipt is required') ||
          errorMessage.includes('receipt is required') ||
          errorMessage.includes('PKR 525') ||
          errorMessage.includes('525')
        );
        const hasCost525 = (errorData.cost === 525 || errorData.cost === '525' || errorMessage.includes('525'));

        if (hasPaymentError && hasCost525) {
          console.log('💰 Free ad limit exhausted - showing 525 PKR package');
          // Store the form data to use later when package is selected
          setPendingFreeAdData({
            form: freeForm,
            images: freeImages,
            features: freeFeatures
          });
          setShow525Package(true);
          setError(null);
          setLoading(false);
          toast.info('Free ad limit completed! Please upload payment receipt for PKR 525.');
          return; // Don't throw error, show package selection instead
        }

        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Free car ad created successfully:', result);

      // Check if ad is pending payment
      if (result.ad && result.ad.isPaidAd && result.ad.paymentStatus === 'pending') {
        setSuccess(true);
        setError(null);
        toast.success('Ad created successfully! However, payment of PKR 525 is required to activate it. Please contact admin for payment.');
      } else {
        setSuccess(true);
      }
      setActiveForm(null);

      // Reset form
      setFreeForm({
        title: '',
        make: '',
        model: '',
        variant: '',
        year: '',
        price: '',
        location: '',
        registrationCity: '',
        bodyColor: '',
        kmDriven: '',
        fuelType: '',
        engineCapacity: '',
        transmission: '',
        assembly: '',
        bodyType: '',
        description: '',
        preferredContact: 'phone',
        category: '',
        adType: 'free',
        isFeatured: 'false'
      });
      setFreeImages([]);
      setFreeFeatures({
        AirConditioning: false,
        PowerSteering: false,
        PowerWindows: false,
        Abs: false,
        Airbags: false,
        Sunroof: false,
        Bluetooth: false,
        CruiseControl: false,
        ParkingSensors: false,
        Navigation: false,
        LeatherSeats: false,
        HeatedSeats: false,
        RearCamera: false,
        KeylessEntry: false,
        AlloyWheels: false,
        FogLights: false,
        Touchscreen: false,
      });

      setTimeout(() => {
        setSuccess(false);
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('❌ Error creating free car ad:', err);
      console.error('❌ Error name:', err.name);
      console.error('❌ Error message:', err.message);

      // If it's a network error or fetch failed, ALWAYS check limit and show package if exhausted
      if (err.message && (
        err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError') ||
        err.name === 'TypeError' ||
        err.message.includes('fetch')
      )) {
        console.log('🔄 Network/fetch error detected - checking free ad limit as fallback...');
        try {
          const API_URL = server_ip || 'http://localhost:8001';
          const limitCheckResponse = await fetchWithRetry(`${API_URL}/user-pricing/${userId}`, {
            method: 'GET',
          });

          if (limitCheckResponse.ok) {
            const limitData = await limitCheckResponse.json();
            console.log('💰 Limit check data:', limitData);
            const canPost = limitData.canPostFree || false;

            if (!canPost) {
              console.log('💰 Free ad limit exhausted - showing 525 PKR package');
              setPendingFreeAdData({
                form: freeForm,
                images: freeImages,
                features: freeFeatures
              });
              setShow525Package(true);
              setError(null);
              setLoading(false);
              toast.info(`You've used all ${limitData.pricingInfo?.freeAds || 2} free ads. Please upload payment receipt for PKR 525.`);
              return;
            } else {
              // If can post but network error, show generic error
              setError('Network error. Please check your connection and try again.');
            }
          } else {
            // If limit check also fails, assume limit might be exhausted and show package
            console.log('⚠️ Limit check failed, showing 525 package as fallback');
            setPendingFreeAdData({
              form: freeForm,
              images: freeImages,
              features: freeFeatures
            });
            setShow525Package(true);
            setActiveForm('free');
            setError(null);
            setLoading(false);
            toast.info('Unable to verify free ad limit. Please upload payment receipt for PKR 525 to continue.');
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
            return;
          }
        } catch (limitErr) {
          console.error('Error checking limit after network error:', limitErr);
          // Even if limit check fails, show 525 package as fallback
          console.log('⚠️ Limit check also failed, showing 525 package as safe fallback');
          setPendingFreeAdData({
            form: freeForm,
            images: freeImages,
            features: freeFeatures
          });
          setShow525Package(true);
          setActiveForm('free');
          setError(null);
          setLoading(false);
          toast.info('Network error occurred. Please upload payment receipt for PKR 525 to continue.');
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
          return;
        }
      } else {
        // For any other error, also check limit as fallback
        console.log('🔄 Other error occurred, checking limit as fallback...');
        try {
          const API_URL = server_ip || 'http://localhost:8001';
          const limitCheckResponse = await fetch(`${API_URL}/user-pricing/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            mode: 'cors',
            credentials: 'omit',
          });

          if (limitCheckResponse.ok) {
            const limitData = await limitCheckResponse.json();
            const canPost = limitData.canPostFree || false;

            if (!canPost) {
              console.log('💰 Free ad limit exhausted - showing 525 PKR package');
              setPendingFreeAdData({
                form: freeForm,
                images: freeImages,
                features: freeFeatures
              });
              setShow525Package(true);
              setActiveForm('free');
              setError(null);
              setLoading(false);
              toast.info(`You've used all ${limitData.pricingInfo?.freeAds || 2} free ads. Please upload payment receipt for PKR 525.`);
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 100);
              return;
            }
          }
        } catch (limitErr) {
          console.error('Error in fallback limit check:', limitErr);
        }
      }

      setError(err.message || 'Failed to create free car ad. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check user's free ad limit
  const checkFreeAdLimit = async () => {
    if (!userId) return;

    setCheckingFreeAdLimit(true);
    try {
      const API_URL = server_ip || 'http://localhost:8001';
      const response = await fetchWithRetry(`${API_URL}/user-pricing/${userId}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('💰 User pricing info:', data);
        const canPost = data.canPostFree || false;
        setCanPostFreeAd(canPost);

        // If user can't post free ad, show 525 package directly
        if (!canPost) {
          setShow525Package(true);
          setActiveForm('free'); // Keep form active but show package
          toast.info(`You've used all ${data.pricingInfo?.freeAds || 2} free ads. Please select PKR 525 package to continue.`);
        } else {
          setShow525Package(false);
        }
      }
    } catch (error) {
      console.error('Error checking free ad limit:', error);
      // Default to allowing free ad if check fails
      setCanPostFreeAd(true);
    } finally {
      setCheckingFreeAdLimit(false);
    }
  };

  // Handle 525 PKR package selection for free ad limit exhausted
  const handle525PackageSelect = async () => {
    // If pendingFreeAdData exists, use it (from form submission)
    // Otherwise, use current freeForm data (when package shown directly)
    const formDataToUse = pendingFreeAdData ? pendingFreeAdData.form : freeForm;
    const imagesToUse = pendingFreeAdData ? pendingFreeAdData.images : freeImages;
    const featuresToUse = pendingFreeAdData ? pendingFreeAdData.features : freeFeatures;

    // Validate required fields
    console.log('🔍 Validating 525 package form data:', formDataToUse);
    console.log('🔍 Images count:', imagesToUse.length);
    console.log('🔍 Payment receipt:', paymentReceipt525 ? paymentReceipt525.name : 'Not selected');

    if (!formDataToUse.title || !formDataToUse.make || !formDataToUse.model || !formDataToUse.year || !formDataToUse.price || !formDataToUse.location) {
      setError('Please fill in all required fields: Title, Make, Model, Year, Price, and Location');
      toast.error('Please fill in all required fields');
      return;
    }

    if (imagesToUse.length === 0) {
      setError('Please upload at least one image');
      toast.error('Please upload at least one image');
      return;
    }

    if (!paymentReceipt525) {
      setError('Please upload payment receipt for PKR 525');
      toast.error('Please upload payment receipt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_URL = server_ip || 'http://localhost:8001';
      const formData = new FormData();

      // Use the form data - append all fields explicitly
      Object.keys(formDataToUse).forEach(key => {
        const value = formDataToUse[key];
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, String(value));
        }
      });

      formData.append('userId', userId);
      formData.append('category', 'free');
      formData.append('paymentAmount', '525'); // Add payment amount
      formData.append('adType', 'free');
      formData.append('isFeatured', 'false');

      // Append features
      const features = Object.keys(featuresToUse).filter(key => featuresToUse[key]);
      formData.append('features', features.length > 0 ? features.join(',') : '');

      // Append images
      imagesToUse.forEach((image, index) => {
        formData.append(`image${index + 1}`, image);
      });

      // Append payment receipt
      formData.append('paymentReceipt', paymentReceipt525);

      console.log('🔄 Submitting free car ad with 525 PKR payment and receipt...');
      console.log('📋 Form data keys:', Array.from(formData.keys()));
      console.log('💰 Payment amount: 525');
      console.log('📄 Payment receipt:', paymentReceipt525.name);

      const response = await fetchWithRetry(`${API_URL}/free_ads`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          const errorText = await response.text();
          errorData = { message: errorText || `HTTP error! status: ${response.status}` };
        }
        console.error('❌ Error response:', errorData);
        console.error('❌ Response status:', response.status);
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Free car ad created successfully with payment:', result);

      setSuccess(true);
      setError(null);
      setShow525Package(false);
      setPendingFreeAdData(null);
      setPaymentReceipt525(null);
      setActiveForm(null);
      toast.success('Ad created successfully! Payment receipt submitted. Ad will be activated after admin verification.');

      // Reset form
      setFreeForm({
        title: '',
        make: '',
        model: '',
        variant: '',
        year: '',
        price: '',
        location: '',
        registrationCity: '',
        bodyColor: '',
        kmDriven: '',
        fuelType: '',
        engineCapacity: '',
        transmission: '',
        assembly: '',
        bodyType: '',
        description: '',
        preferredContact: 'phone',
        category: '',
        adType: 'free',
        isFeatured: 'false'
      });
      setFreeImages([]);
      setFreeFeatures({
        AirConditioning: false,
        PowerSteering: false,
        PowerWindows: false,
        Abs: false,
        Airbags: false,
        Sunroof: false,
        Bluetooth: false,
        CruiseControl: false,
        ParkingSensors: false,
        Navigation: false,
        LeatherSeats: false,
        HeatedSeats: false,
        RearCamera: false,
        KeylessEntry: false,
        AlloyWheels: false,
        FogLights: false,
        Touchscreen: false,
      });

      toast.success('Ad created successfully! Payment of PKR 525 is pending admin verification.');

      // Update free ad limit status after successful ad creation
      if (userId) {
        await checkFreeAdLimit();
      }

      setTimeout(() => {
        setSuccess(false);
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('❌ Error creating free car ad with payment:', err);
      console.error('❌ Error name:', err.name);
      console.error('❌ Error message:', err.message);

      // Check if it's a connection error
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_REFUSED') || err.message.includes('NetworkError'))) {
        const errorMsg = 'Cannot connect to backend server. Please make sure the backend server is running on http://localhost:8001';
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
        setError(err.message || 'Failed to create ad with payment. Please try again.');
        toast.error(err.message || 'Failed to create ad. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkLoginAndProceed = async (formType) => {
    if (!userId) {
      alert('Please login first to create an ad');
      navigate('/signin');
      return;
    }

    // If user wants to create free ad, check limit first
    if (formType === 'free') {
      await checkFreeAdLimit();
      // If can't post free, show525Package will be set to true in checkFreeAdLimit
      if (!canPostFreeAd) {
        setActiveForm('free');
        setSelectedService('free');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setActiveForm(formType);
    setSelectedService(formType);
    // Scroll to top when form is activated
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const offerings = [
    {
      id: 1,
      title: t('sellYourCarFree'),
      icon: '🆓',
      badge: t('free'),
      description: t('freeAdDesc'),
      onClick: () => checkLoginAndProceed('free')
    },
    {
      id: 2,
      title: t('premiumCarAd'),
      icon: '⭐',
      badge: t('premium'),
      description: t('premiumAdDesc'),
      onClick: () => checkLoginAndProceed('premium')
    }
  ];

  return (
    <>
      <Helmet>
        <title>Autofinder Services - Auto Finder</title>
      </Helmet>

      <div className="bg-white dark:bg-gray-900 min-h-screen py-6 sm:py-8 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6 text-center">{t('autofinderServices')}</h1>

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6 mb-6 text-center max-w-4xl mx-auto">
              <p className="text-green-800 dark:text-green-400 font-semibold text-lg mb-2">✅ Ad Posted Successfully!</p>
              <p className="text-green-700 dark:text-green-500">Your ad has been created and will be reviewed by admin. Redirecting...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 mb-6 text-center max-w-4xl mx-auto">
              <p className="text-red-800 dark:text-red-400 font-semibold mb-2">Error</p>
              <p className="text-red-700 dark:text-red-500">{error}</p>
            </div>
          )}

          {!activeForm && (
            <div>
              {selectedService && (
                <div className="mb-6 text-center">
                  <button
                    onClick={() => {
                      setSelectedService(null);
                      navigate('/sell-car', { replace: true });
                    }}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 font-semibold flex items-center justify-center gap-2 mx-auto"
                  >
                    {t('backToAllServices')}
                  </button>
                </div>
              )}
              <div className={`flex justify-center ${selectedService ? '' : ''
                }`}>
                <div className={`grid grid-cols-1 ${selectedService ? 'sm:grid-cols-1 max-w-md' : 'sm:grid-cols-2 max-w-4xl'} gap-4 sm:gap-6 w-full`}>
                  {(() => {
                    // Filter offerings based on selectedService
                    const filtered = offerings.filter(offering => {
                      // If no service selected, show all cards
                      if (!selectedService) {
                        return true;
                      }
                      // Show only the matching card based on selectedService
                      if (selectedService === 'free') {
                        return offering.id === 1;
                      }
                      if (selectedService === 'premium') {
                        return offering.id === 2;
                      }
                      return false;
                    });

                    return filtered.map((offering) => (
                      <div
                        key={offering.id}
                        className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-red-500 dark:hover:border-red-600 transition-all group flex flex-col"
                      >
                        <div className="relative h-24 sm:h-28 md:h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                          <svg className="w-16 h-12 sm:w-18 sm:h-14 md:w-20 md:h-16 text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                          </svg>

                          <div className="absolute top-2 right-2 bg-red-600 dark:bg-red-700 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm">
                            {offering.icon}
                          </div>

                          <div className={`absolute bottom-2 left-2 backdrop-blur-sm px-2 py-1 rounded text-[9px] sm:text-[10px] font-bold ${offering.badge === 'PREMIUM'
                            ? 'bg-yellow-400 dark:bg-yellow-500 text-gray-800 dark:text-gray-900'
                            : 'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200'
                            }`}>
                            {offering.badge}
                          </div>
                        </div>
                        <div className="p-3 sm:p-4 md:p-5 text-center flex flex-col flex-1">
                          <div className="font-bold text-red-600 dark:text-red-500 mb-1 text-xs sm:text-sm">AUTOFINDER</div>
                          <h3 className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors text-sm sm:text-base md:text-lg mb-2">
                            {offering.title}
                          </h3>
                          <p className="mt-2 text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 flex-1">{offering.description}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              offering.onClick();
                            }}
                            className="mt-3 sm:mt-4 w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-md font-semibold transition-colors text-xs sm:text-sm"
                          >
                            {offering.id === 1 ? t('postFreeAd') : t('createPremiumAd')}
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Package Selection - Hide if using dealer package */}
          {activeForm === 'premium' && showPackageSelection && !dealerPackageId && (
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('selectPremiumPackage')}</h2>
                <button
                  onClick={() => {
                    setActiveForm(null);
                    setShowPackageSelection(false);
                    setSelectedPackage(null);
                    // Keep selectedService so only that card shows
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              {loadingPackages ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loadingPackages')}</p>
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">{t('noPackagesAvailable')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {packages.map((pkg) => {
                    const packagePrice = pkg.discountedPrice || pkg.discountedRate || pkg.price || 0;
                    const originalPrice = pkg.actualPrice || pkg.price || packagePrice;
                    const youSaved = originalPrice - packagePrice;
                    const isPopular = pkg.popular;

                    return (
                      <div
                        key={pkg._id || pkg.id}
                        className={`relative bg-white dark:bg-gray-700 rounded-lg border-2 p-6 transition-all cursor-pointer hover:shadow-xl ${isPopular
                          ? 'border-yellow-500 dark:border-yellow-600 shadow-lg'
                          : 'border-gray-200 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-600'
                          }`}
                        onClick={() => handlePackageSelect(pkg)}
                      >
                        {isPopular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                            POPULAR
                          </div>
                        )}
                        <div className="text-center">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            {pkg.name || pkg.bundleName}
                          </h3>
                          {pkg.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{pkg.description}</p>
                          )}
                          <div className="mb-4">
                            <div className="flex items-baseline justify-center gap-2">
                              {originalPrice > packagePrice && (
                                <span className="text-lg text-gray-400 line-through">PKR {originalPrice.toLocaleString()}</span>
                              )}
                              <span className="text-3xl font-bold text-red-600 dark:text-red-500">
                                PKR {packagePrice.toLocaleString()}
                              </span>
                            </div>
                            {youSaved > 0 && (
                              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                You Save: PKR {youSaved.toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2 mb-6 text-left">
                            {pkg.validityDays || pkg.noOfDays ? (
                              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">✓</span>
                                <span>Validity: {pkg.validityDays || pkg.noOfDays} days</span>
                              </div>
                            ) : null}
                            {pkg.totalAds || pkg.listingLimit || pkg.noOfBoosts ? (
                              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">✓</span>
                                <span>Total Ads: {pkg.totalAds || pkg.listingLimit || pkg.noOfBoosts}</span>
                              </div>
                            ) : null}
                            {pkg.featuredListings ? (
                              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">✓</span>
                                <span>Free Boosters: {pkg.featuredListings}</span>
                              </div>
                            ) : null}
                            {pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0 && (
                              <div className="mt-2">
                                {pkg.features.map((feature, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-semibold">✓</span>
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            className="w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                          >
                            {t('selectPackage')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Premium Car Ad Form - Show directly if using dealer package */}
          {activeForm === 'premium' && (!showPackageSelection || dealerPackageId) && selectedPackage && (
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('createPremiumAd')}</h2>
                  {selectedPackage && !dealerPackageId && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t('selectedPackageLabel')} <span className="font-semibold">{selectedPackage.name || selectedPackage.bundleName}</span>
                    </p>
                  )}
                  {dealerPackageId && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      ✓ Using your active dealer package
                    </p>
                  )}
                </div>
                {!dealerPackageId && (
                  <button
                    onClick={() => {
                      setShowPackageSelection(true);
                      setSelectedPackage(null);
                    }}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                )}
              </div>

              <form onSubmit={handlePremiumSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('titleLabel')} <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={premiumForm.title}
                      onChange={handlePremiumInputChange}
                      placeholder={t('titlePlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('makeLabel')} <span className="text-red-600">*</span>
                    </label>
                    <SearchableMakeSelect
                      name="make"
                      value={premiumForm.make}
                      onChange={handlePremiumInputChange}
                      required
                      placeholder={t('selectMake')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('modelLabel')} <span className="text-red-600">*</span>
                    </label>
                    <SearchableModelSelect
                      name="model"
                      value={premiumForm.model}
                      onChange={handlePremiumInputChange}
                      selectedMake={premiumForm.make}
                      required
                      placeholder={t('selectModel')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('variantLabel')}
                    </label>
                    <SearchableVariantSelect
                      name="variant"
                      value={premiumForm.variant}
                      onChange={handlePremiumInputChange}
                      selectedMake={premiumForm.make}
                      selectedModel={premiumForm.model}
                      placeholder={t('selectVariant')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('yearLabel')} <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="year"
                      value={premiumForm.year}
                      onChange={handlePremiumInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="">{t('selectYear')}</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('pricePkr')} <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={premiumForm.price}
                      onChange={handlePremiumInputChange}
                      placeholder={t('pricePlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                </div>

                {/* Location Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('location')} <span className="text-red-600">*</span>
                    </label>
                    <SearchableCitySelect
                      name="location"
                      value={premiumForm.location}
                      onChange={handlePremiumInputChange}
                      required
                      placeholder={t('selectCity')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('registrationCity')}
                    </label>
                    <SearchableCitySelect
                      name="registrationCity"
                      value={premiumForm.registrationCity}
                      onChange={handlePremiumInputChange}
                      placeholder={t('selectCity')}
                    />
                  </div>
                </div>

                {/* Car Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('fuelTypeLabel')}
                    </label>
                    <select
                      name="fuelType"
                      value={premiumForm.fuelType}
                      onChange={handlePremiumInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{t('selectFuelType')}</option>
                      {fuelTypes.map(type => (
                        <option key={type} value={type}>{t(type.toLowerCase()) || type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('transmissionLabel')}
                    </label>
                    <select
                      name="transmission"
                      value={premiumForm.transmission}
                      onChange={handlePremiumInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{t('selectTransmission')}</option>
                      {transmissionTypes.map(type => (
                        <option key={type} value={type}>{t(type.toLowerCase()) || type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('bodyTypeLabel')}
                    </label>
                    <select
                      name="bodyType"
                      value={premiumForm.bodyType}
                      onChange={handlePremiumInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{t('selectBodyType')}</option>
                      {bodyTypes.map(type => (
                        <option key={type} value={type}>{t(type.toLowerCase()) || type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('assemblyLabel')}
                    </label>
                    <select
                      name="assembly"
                      value={premiumForm.assembly}
                      onChange={handlePremiumInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{t('selectAssembly')}</option>
                      {assemblyTypes.map(type => (
                        <option key={type} value={type}>{t(type.toLowerCase()) || type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('bodyColor')}
                    </label>
                    <select
                      name="bodyColor"
                      value={premiumForm.bodyColor}
                      onChange={handlePremiumInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{t('selectColor')}</option>
                      {colors.map(color => (
                        <option key={color} value={color}>{t(color.toLowerCase()) || color}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('kmDrivenLabel')}
                    </label>
                    <input
                      type="number"
                      name="kmDriven"
                      value={premiumForm.kmDriven}
                      onChange={handlePremiumInputChange}
                      placeholder={t('kmPlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('engineCapacityLabel')} (CC)
                    </label>
                    <input
                      type="text"
                      name="engineCapacity"
                      value={premiumForm.engineCapacity}
                      onChange={handlePremiumInputChange}
                      placeholder={t('capacityPlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('descriptionLabel')}
                  </label>
                  <textarea
                    name="description"
                    value={premiumForm.description}
                    onChange={handlePremiumInputChange}
                    rows="4"
                    placeholder={t('descriptionPlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Features
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.keys(premiumFeatures).map(feature => (
                      <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={premiumFeatures[feature]}
                          onChange={() => toggleFeature(feature, 'premium')}
                          className="w-4 h-4 text-red-600 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t(feature.toLowerCase().replace(/\s+/g, ''))}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('imagesLabel')} <span className="text-red-600">*</span> {t('upTo20Images')}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageChange(e, 'premium')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                  {premiumImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {premiumImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index, 'premium')}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Invoice Image - Hide if using dealer package */}
                {!skipPayment && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('paymentInvoiceOptional')}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePremiumInvoiceChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                )}

                {/* Dealer Package Info */}
                {skipPayment && dealerPackageId && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      ✓ Using your active dealer package. Payment receipt not required.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white py-3 rounded-lg font-semibold transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {loading ? t('creatingAd') : t('createPremiumAd')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveForm(null);
                      // Keep selectedService so only that card shows
                    }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Free Ad Form */}
          {activeForm === 'free' && !show525Package && (
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('createFreeAd')}</h2>
                <button
                  onClick={() => {
                    setActiveForm(null);
                    // Keep selectedService so only that card shows
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleFreeSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('titleLabel')} <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={freeForm.title}
                      onChange={handleFreeInputChange}
                      placeholder="e.g., Toyota Corolla 2020"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('makeLabel')} <span className="text-red-600">*</span>
                    </label>
                    <SearchableMakeSelect
                      name="make"
                      value={freeForm.make}
                      onChange={handleFreeInputChange}
                      required
                      placeholder={t('selectMake')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('modelLabel')} <span className="text-red-600">*</span>
                    </label>
                    <SearchableModelSelect
                      name="model"
                      value={freeForm.model}
                      onChange={handleFreeInputChange}
                      selectedMake={freeForm.make}
                      required
                      placeholder={t('selectModel')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('yearLabel')} <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="year"
                      value={freeForm.year}
                      onChange={handleFreeInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="">{t('selectYear')}</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('pricePkr')} <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={freeForm.price}
                      onChange={handleFreeInputChange}
                      placeholder={t('pricePlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('location')} <span className="text-red-600">*</span>
                    </label>
                    <SearchableCitySelect
                      name="location"
                      value={freeForm.location}
                      onChange={handleFreeInputChange}
                      required
                      placeholder={t('selectCity')}
                    />
                  </div>
                </div>

                {/* Car Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('fuelTypeLabel')}
                    </label>
                    <select
                      name="fuelType"
                      value={freeForm.fuelType}
                      onChange={handleFreeInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{t('selectFuelType')}</option>
                      {fuelTypes.map(type => (
                        <option key={type} value={type}>{t(type.toLowerCase()) || type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('transmissionLabel')}
                    </label>
                    <select
                      name="transmission"
                      value={freeForm.transmission}
                      onChange={handleFreeInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{t('selectTransmission')}</option>
                      {transmissionTypes.map(type => (
                        <option key={type} value={type}>{t(type.toLowerCase()) || type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('mileageLabel')} (km)
                    </label>
                    <input
                      type="number"
                      name="kmDriven"
                      value={freeForm.kmDriven}
                      onChange={handleFreeInputChange}
                      placeholder={t('kmPlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('bodyTypeLabel')}
                    </label>
                    <select
                      name="bodyType"
                      value={freeForm.bodyType}
                      onChange={handleFreeInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{t('selectBodyType')}</option>
                      {bodyTypes.map(type => (
                        <option key={type} value={type}>{t(type.toLowerCase()) || type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('descriptionLabel')}
                  </label>
                  <textarea
                    name="description"
                    value={freeForm.description}
                    onChange={handleFreeInputChange}
                    rows={4}
                    placeholder={t('descriptionPlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('imagesLabel')} <span className="text-red-600">*</span> {t('max10Images')}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageChange(e, 'free')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  {freeImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      {freeImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index, 'free')}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {loading ? t('creatingAd') : t('postFreeAdBtn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveForm(null);
                      // Keep selectedService so only that card shows
                    }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Package Selection for List It For You */}
          {activeForm === 'listItForYou' && showListItPackageSelection && (
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('selectPremiumPackage')}</h2>
                <button
                  onClick={() => {
                    setActiveForm(null);
                    setShowListItPackageSelection(false);
                    setSelectedListItPackage(null);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              {loadingListItPackages ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loadingPackages')}</p>
                </div>
              ) : listItPackages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">{t('noPackagesAvailable')}</p>
                </div>
              ) : (
                <div className="flex justify-center">
                  {listItPackages.slice(0, 1).map((pkg) => {
                    const packagePrice = pkg.discountedPrice || pkg.discountedRate || pkg.price || 0;
                    const originalPrice = pkg.actualPrice || pkg.price || packagePrice;
                    const youSaved = originalPrice - packagePrice;
                    const isPopular = pkg.popular;

                    return (
                      <div
                        key={pkg._id || pkg.id}
                        className={`relative bg-white dark:bg-gray-700 rounded-lg border-2 p-6 transition-all cursor-pointer hover:shadow-xl flex flex-col w-full max-w-md ${isPopular
                          ? 'border-yellow-500 dark:border-yellow-600 shadow-lg'
                          : 'border-gray-200 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-600'
                          }`}
                        onClick={() => handleListItPackageSelect(pkg)}
                      >
                        {isPopular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                            POPULAR
                          </div>
                        )}
                        <div className="text-center flex flex-col flex-1">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            {pkg.name || pkg.bundleName}
                          </h3>
                          {pkg.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{pkg.description}</p>
                          )}
                          <div className="mb-4">
                            <div className="flex items-baseline justify-center gap-2">
                              {originalPrice > packagePrice && (
                                <span className="text-lg text-gray-400 line-through">PKR {originalPrice.toLocaleString()}</span>
                              )}
                              <span className="text-3xl font-bold text-red-600 dark:text-red-500">
                                PKR {packagePrice.toLocaleString()}
                              </span>
                            </div>
                            {youSaved > 0 && (
                              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                You Save: PKR {youSaved.toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2 mb-6 text-left flex-1">
                            {pkg.validityDays || pkg.noOfDays ? (
                              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">✓</span>
                                <span>{t('validity')} {pkg.validityDays || pkg.noOfDays} {t('days')}</span>
                              </div>
                            ) : null}
                            {pkg.totalAds || pkg.listingLimit || pkg.noOfBoosts ? (
                              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">✓</span>
                                <span>{t('totalAds')} {pkg.totalAds || pkg.listingLimit || pkg.noOfBoosts}</span>
                              </div>
                            ) : null}
                            {pkg.featuredListings ? (
                              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">✓</span>
                                <span>{t('freeBoosters')} {pkg.featuredListings}</span>
                              </div>
                            ) : null}
                            {pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0 && (
                              <div className="mt-2">
                                {pkg.features.map((feature, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-semibold">✓</span>
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            className="w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white py-3 px-6 rounded-lg font-semibold transition-colors mt-auto"
                          >
                            {t('selectPackage')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 525 PKR Package Selection (when free ad limit is exhausted) */}
          {show525Package && (
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('freeAdLimitCompleted')}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('freeAdLimitDesc')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShow525Package(false);
                    setPendingFreeAdData(null);
                    setPaymentReceipt525(null);
                    setActiveForm(null);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {t('freeAdLimitNote')}
                </p>
              </div>

              {/* 525 PKR Package Card - Show at Top */}
              <div className="border-2 border-red-500 rounded-lg p-6 bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 mb-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {t('standardAdPackage')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('standardAdDesc')}
                  </p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-red-600 dark:text-red-500">
                      PKR 525
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-green-600">✓</span>
                    <span>{t('standardVisibility')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-green-600">✓</span>
                    <span>{t('activeAfterVerification')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-green-600">✓</span>
                    <span>{t('amountAdjustable')}</span>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <h4 className="text-md font-bold text-gray-800 dark:text-gray-100 mb-3">{t('paymentDetails')}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('easypaisaJazzcash')}:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-900 dark:text-gray-100">03348400943</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('03348400943');
                            toast.success('Number copied to clipboard!');
                          }}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                          title="Copy to clipboard"
                        >
                          {t('copy')}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('accountNumber')}:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-900 dark:text-gray-100">03348400943</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('03348400943');
                            toast.success('Account number copied to clipboard!');
                          }}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                          title="Copy to clipboard"
                        >
                          {t('copy')}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('accountName')}:</span>
                      <span className="text-xs text-gray-900 dark:text-gray-100">Muhammad Asif Khan</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Show form if no pending data (user clicked directly) */}
              {!pendingFreeAdData && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{t('carDetails')}</h3>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('titleLabel')} <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={freeForm.title}
                          onChange={handleFreeInputChange}
                          placeholder={t('titlePlaceholder')}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('makeLabel')} <span className="text-red-600">*</span>
                        </label>
                        <SearchableMakeSelect
                          name="make"
                          value={freeForm.make}
                          onChange={handleFreeInputChange}
                          required
                          placeholder={t('selectMake')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('modelLabel')} <span className="text-red-600">*</span>
                        </label>
                        <SearchableModelSelect
                          name="model"
                          value={freeForm.model}
                          onChange={handleFreeInputChange}
                          selectedMake={freeForm.make}
                          required
                          placeholder={t('selectModel')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('yearLabel')} <span className="text-red-600">*</span>
                        </label>
                        <select
                          name="year"
                          value={freeForm.year}
                          onChange={handleFreeInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required
                        >
                          <option value="">{t('selectYear')}</option>
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('pricePkr')} <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={freeForm.price}
                          onChange={handleFreeInputChange}
                          placeholder={t('pricePlaceholder')}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('location')} <span className="text-red-600">*</span>
                        </label>
                        <SearchableCitySelect
                          name="location"
                          value={freeForm.location}
                          onChange={handleFreeInputChange}
                          required
                          placeholder={t('selectCity')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('variantLabel')}
                        </label>
                        <SearchableVariantSelect
                          name="variant"
                          value={freeForm.variant}
                          onChange={handleFreeInputChange}
                          selectedMake={freeForm.make}
                          selectedModel={freeForm.model}
                          placeholder={t('selectVariant')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('registrationCity')}
                        </label>
                        <SearchableCitySelect
                          name="registrationCity"
                          value={freeForm.registrationCity}
                          onChange={handleFreeInputChange}
                          placeholder={t('selectCity')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('fuelTypeLabel')}
                        </label>
                        <select
                          name="fuelType"
                          value={freeForm.fuelType}
                          onChange={handleFreeInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">{t('selectFuelType')}</option>
                          {fuelTypes.map(type => (
                            <option key={type} value={type}>{t(type.toLowerCase()) || type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('transmissionLabel')}
                        </label>
                        <select
                          name="transmission"
                          value={freeForm.transmission}
                          onChange={handleFreeInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">{t('selectTransmission')}</option>
                          {transmissionTypes.map(type => (
                            <option key={type} value={type}>{t(type.toLowerCase()) || type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('bodyTypeLabel')}
                        </label>
                        <select
                          name="bodyType"
                          value={freeForm.bodyType}
                          onChange={handleFreeInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">{t('selectBodyType')}</option>
                          {bodyTypes.map(type => (
                            <option key={type} value={type}>{t(type.toLowerCase()) || type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('mileageLabel')} (km)
                        </label>
                        <input
                          type="number"
                          name="kmDriven"
                          value={freeForm.kmDriven}
                          onChange={handleFreeInputChange}
                          placeholder={t('kmPlaceholder')}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('engineCapacityLabel')} (cc)
                        </label>
                        <input
                          type="text"
                          name="engineCapacity"
                          value={freeForm.engineCapacity}
                          onChange={handleFreeInputChange}
                          placeholder={t('capacityPlaceholder')}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('assemblyLabel')}
                        </label>
                        <select
                          name="assembly"
                          value={freeForm.assembly}
                          onChange={handleFreeInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">{t('selectAssembly')}</option>
                          <option value="Local">{t('local')}</option>
                          <option value="Imported">{t('imported')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('bodyColorLabel')}
                        </label>
                        <input
                          type="text"
                          name="bodyColor"
                          value={freeForm.bodyColor}
                          onChange={handleFreeInputChange}
                          placeholder={t('colorPlaceholder')}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('descriptionLabel')}
                      </label>
                      <textarea
                        name="description"
                        value={freeForm.description}
                        onChange={handleFreeInputChange}
                        rows={4}
                        placeholder={t('descriptionPlaceholder')}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    {/* Features */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('featuresLabel')}
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Object.keys(freeFeatures).map((feature) => (
                          <label key={feature} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={freeFeatures[feature]}
                              onChange={() => {
                                setFreeFeatures(prev => ({
                                  ...prev,
                                  [feature]: !prev[feature]
                                }));
                              }}
                              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {t(feature.toLowerCase().replace(/\s+/g, ''))}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Images */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('imagesLabel')} <span className="text-red-600">*</span> {t('max10Images')}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageChange(e, 'free')}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      {freeImages.length > 0 && (
                        <div className="mt-4 grid grid-cols-4 gap-4">
                          {freeImages.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index, 'free')}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                              >
                                <FaTimes className="text-xs" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* Payment Receipt Upload and Submit Button - At Bottom */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('paymentReceipt')} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setPaymentReceipt525(e.target.files[0] || null)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                  {paymentReceipt525 && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      {t('receiptSelected')}: {paymentReceipt525.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('uploadReceiptDesc')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handle525PackageSelect}
                  disabled={loading || !paymentReceipt525}
                  className={`w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white py-3 px-6 rounded-lg font-semibold transition-colors ${loading || !paymentReceipt525 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {loading ? t('creatingAd') : t('submitWithReceipt')}
                </button>
              </div>
            </div>
          )}

          {/* List It For You Form */}
          {activeForm === 'listItForYou' && !showListItPackageSelection && selectedListItPackage && (
            <div ref={formRef} className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('listItForYou')}</h2>
                  {selectedListItPackage && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t('selectedPackage')}: <span className="font-semibold">{selectedListItPackage.name || selectedListItPackage.bundleName}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowListItPackageSelection(true);
                    setSelectedListItPackage(null);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleListItSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('location')} <span className="text-red-600">*</span>
                    </label>
                    <SearchableCitySelect
                      name="location"
                      value={listItForm.location}
                      onChange={handleListItInputChange}
                      required
                      placeholder={t('selectCity')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('makeLabel')} <span className="text-red-600">*</span>
                    </label>
                    <SearchableMakeSelect
                      name="make"
                      value={listItForm.make}
                      onChange={handleListItInputChange}
                      required
                      placeholder={t('selectMake')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('modelLabel')} <span className="text-red-600">*</span>
                    </label>
                    <SearchableModelSelect
                      name="model"
                      value={listItForm.model}
                      onChange={handleListItInputChange}
                      selectedMake={listItForm.make}
                      required
                      placeholder={t('selectModel')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('variantLabel')}
                    </label>
                    <SearchableVariantSelect
                      name="variant"
                      value={listItForm.variant}
                      onChange={handleListItInputChange}
                      selectedMake={listItForm.make}
                      selectedModel={listItForm.model}
                      placeholder={t('selectVariant')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('yearLabel')} <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="year"
                      value={listItForm.year}
                      onChange={handleListItInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="">{t('selectYear')}</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('pricePkr')} <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={listItForm.price}
                      onChange={handleListItInputChange}
                      placeholder={t('pricePlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('registrationCity')}
                    </label>
                    <SearchableCitySelect
                      name="registrationCity"
                      value={listItForm.registrationCity}
                      onChange={handleListItInputChange}
                      placeholder={t('selectCity')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('bodyColorLabel')}
                    </label>
                    <select
                      name="bodyColor"
                      value={listItForm.bodyColor}
                      onChange={handleListItInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{t('selectColor')}</option>
                      {colors.map(color => (
                        <option key={color} value={color}>{t(color.toLowerCase()) || color}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('kmDrivenLabel')}
                    </label>
                    <input
                      type="number"
                      name="kmDriven"
                      value={listItForm.kmDriven}
                      onChange={handleListItInputChange}
                      placeholder={t('kmPlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('fuelTypeLabel')}
                    </label>
                    <select
                      name="fuelType"
                      value={listItForm.fuelType}
                      onChange={handleListItInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{t('selectFuelType')}</option>
                      {fuelTypes.map(type => (
                        <option key={type} value={type}>{t(type.toLowerCase()) || type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('bodyTypeLabel')}
                    </label>
                    <select
                      name="bodyType"
                      value={listItForm.bodyType}
                      onChange={handleListItInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{t('selectBodyType')}</option>
                      {bodyTypes.map(type => (
                        <option key={type} value={type}>{t(type.toLowerCase()) || type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('engineCapacityLabel')} (CC)
                    </label>
                    <input
                      type="text"
                      name="engineCapacity"
                      value={listItForm.engineCapacity}
                      onChange={handleListItInputChange}
                      placeholder={t('capacityPlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('transmissionLabel')}
                    </label>
                    <select
                      name="transmission"
                      value={listItForm.transmission}
                      onChange={handleListItInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{t('selectTransmission')}</option>
                      {transmissionTypes.map(type => (
                        <option key={type} value={type}>{t(type.toLowerCase()) || type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('assemblyLabel')}
                    </label>
                    <select
                      name="assembly"
                      value={listItForm.assembly}
                      onChange={handleListItInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{t('selectAssembly')}</option>
                      {assemblyTypes.map(type => (
                        <option key={type} value={type}>{t(type.toLowerCase()) || type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('descriptionLabel')}
                  </label>
                  <textarea
                    name="description"
                    value={listItForm.description}
                    onChange={handleListItInputChange}
                    rows="4"
                    placeholder={t('descriptionPlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Features
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.keys(listItFeatures).map(feature => (
                      <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={listItFeatures[feature]}
                          onChange={() => toggleFeature(feature, 'listIt')}
                          className="w-4 h-4 text-red-600 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t(feature.toLowerCase().replace(/\s+/g, ''))}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('imagesLabel')} <span className="text-red-600">*</span> (Up to 8 images)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageChange(e, 'listIt')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                  {listItImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {listItImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index, 'listIt')}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white py-3 rounded-lg font-semibold transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {loading ? t('creatingAd') : t('listItForYou')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveForm(null);
                      // Keep selectedService so only that card shows
                    }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div >
      </div >
    </>
  );
}

export default SellCar;
