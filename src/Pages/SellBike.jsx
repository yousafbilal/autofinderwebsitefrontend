import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTimes, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';
import { bikeData } from '../Utils/bikeData';

// Searchable Bike Make Select Component
const SearchableBikeMakeSelect = ({ value, onChange, name, required = false, placeholder = "Select Make" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const makes = Object.keys(bikeData).sort((a, b) => a.localeCompare(b));
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
          {value || placeholder}
        </span>
        <FaChevronDown className={`text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search make..."
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
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">No make found</div>
            )}
          </div>
        </div>
      )}
      {required && !value && <input type="hidden" required />}
    </div>
  );
};

// Searchable Bike Model Select Component
const SearchableBikeModelSelect = ({ value, onChange, name, selectedMake, required = false, placeholder = "Select Model" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const models = selectedMake && bikeData[selectedMake]
    ? Object.keys(bikeData[selectedMake].models).sort((a, b) => a.localeCompare(b))
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
          {value || (selectedMake ? placeholder : 'Select Make first')}
        </span>
        <FaChevronDown className={`text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>
      {isOpen && selectedMake && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search model..."
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
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">No model found</div>
            )}
          </div>
        </div>
      )}
      {required && !value && <input type="hidden" required />}
    </div>
  );
};

// Searchable Bike Variant Select Component
const SearchableBikeVariantSelect = ({ value, onChange, name, selectedMake, selectedModel, placeholder = "Select Variant" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const variants = selectedMake && selectedModel && bikeData[selectedMake]?.models[selectedModel]
    ? Object.keys(bikeData[selectedMake].models[selectedModel].variants).sort((a, b) => a.localeCompare(b))
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
          {value || (selectedMake && selectedModel ? placeholder : 'Select Make & Model first')}
        </span>
        <FaChevronDown className={`text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>
      {isOpen && selectedMake && selectedModel && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search variant..."
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
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">No variant found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function SellBike() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if coming from dealer package (My Packages page)
  const dealerPackageId = location.state?.dealerPackageId || null;
  const purchaseId = location.state?.purchaseId || null;
  const skipPayment = location.state?.skipPayment || false;
  const [activeForm, setActiveForm] = useState(null); // 'free', 'premium', or null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Package Selection State
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPackageSelection, setShowPackageSelection] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // Premium Bike Ad Form State
  const [premiumForm, setPremiumForm] = useState({
    title: '',
    make: '',
    model: '',
    year: '',
    price: '',
    location: '',
    registrationCity: '',
    bodyColor: '',
    customColor: '',
    kmDriven: '',
    fuelType: '',
    engineCapacity: '',
    bodyType: '',
    description: '',
    preferredContact: 'phone',
    adCity: '',
    variant: '',
    enginetype: '',
    transmission: '',
    packageId: '',
    packageName: '',
    packagePrice: '',
    isFeatured: 'true',
    isPaidAd: 'true',
    paymentStatus: 'pending'
  });
  const [premiumImages, setPremiumImages] = useState([]);
  const [premiumInvoiceImage, setPremiumInvoiceImage] = useState(null);
  const [premiumFeatures, setPremiumFeatures] = useState({
    LEDHeadlamp: false,
    DigitalConsole: false,
    USBChargingPort: false,
    BluetoothConnectivity: false,
    Navigation: false,
    ABS: false,
    SlipperClutch: false,
    QuickShifter: false,
    TractionControl: false,
    StabilityControl: false,
    HillStartAssist: false,
    EmergencyStopSignal: false,
  });
  const [showPremiumCustomColorInput, setShowPremiumCustomColorInput] = useState(false);

  // Free Bike Ad Form State
  const [freeForm, setFreeForm] = useState({
    title: '',
    make: '',
    model: '',
    year: '',
    price: '',
    location: '',
    registrationCity: '',
    bodyColor: '',
    customColor: '',
    kmDriven: '',
    fuelType: '',
    engineCapacity: '',
    bodyType: '',
    description: '',
    preferredContact: 'phone',
    adCity: '',
    variant: '',
    enginetype: '',
    transmission: '',
    features: ''
  });
  const [freeImages, setFreeImages] = useState([]);
  const [freeFeatures, setFreeFeatures] = useState({
    LEDHeadlamp: false,
    DigitalConsole: false,
    USBChargingPort: false,
    BluetoothConnectivity: false,
    Navigation: false,
    ABS: false,
    SlipperClutch: false,
    QuickShifter: false,
    TractionControl: false,
    StabilityControl: false,
    HillStartAssist: false,
    EmergencyStopSignal: false,
  });
  const [showCustomColorInput, setShowCustomColorInput] = useState(false);

  // Get user from localStorage
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserId(user._id || user.userId || null);
      } else {
        toast.info('Please login to post an ad');
        navigate('/signin');
      }
    } catch (e) {
      console.log('Could not get user from localStorage');
      navigate('/signin');
    }
  }, [navigate]);

  // Auto-select premium form if coming from dealer package
  useEffect(() => {
    if (dealerPackageId && skipPayment) {
      setActiveForm('premium');
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
      fetchBikePackages();
      setShowPackageSelection(true);
    }
  }, [activeForm, dealerPackageId]);

  // Fetch bike packages from backend API (same as mobile app)
  const fetchBikePackages = async () => {
    try {
      setLoadingPackages(true);
      const API_URL = server_ip || 'http://localhost:8001';

      console.log('📦 Fetching bike packages from backend...');
      const response = await fetch(`${API_URL}/mobile/dealer_packages/bike`, {
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
      console.log('📦 Bike packages response:', data);

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

      console.log(`✅ Loaded ${transformedPackages.length} bike packages from backend`);
      setPackages(transformedPackages);
    } catch (err) {
      console.error('❌ Error loading bike packages from backend:', err);
      setError('Failed to load packages. Please try again.');
      // Fallback to empty array if API fails
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  // Handle package selection
  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setShowPackageSelection(false);
    // Update form with package info
    setPremiumForm(prev => ({
      ...prev,
      packageId: pkg._id || pkg.id,
      packageName: pkg.name || pkg.bundleName,
      packagePrice: pkg.discountedPrice || pkg.discountedRate || pkg.price,
      paymentAmount: pkg.discountedPrice || pkg.discountedRate || pkg.price
    }));
  };

  // Fuel types matching mobile app
  const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'LPG', 'CNG'];
  // Engine types matching mobile app
  const bodyTypes = ['2 Strokes', '4 Strokes', 'Electric'];
  // Colors matching mobile app
  const colors = ['White', 'Black', 'Gray', 'Silver', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Brown', 'Beige', 'Gold', 'Pink', 'Purple', 'Teal', 'Maroon', 'Navy', 'Champagne', 'Turquoise', 'Mint'];
  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad'];

  // Bike features matching mobile app
  const bikeFeatures = [
    'LEDHeadlamp',
    'DigitalConsole',
    'USBChargingPort',
    'BluetoothConnectivity',
    'Navigation',
    'ABS',
    'SlipperClutch',
    'QuickShifter',
    'TractionControl',
    'StabilityControl',
    'HillStartAssist',
    'EmergencyStopSignal'
  ];

  // Generate years from 1990 to current year + 1
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 20);
    setPremiumImages(files);
  };

  const removeImage = (index) => {
    setPremiumImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFreeInputChange = (e) => {
    const { name, value } = e.target;
    setFreeForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFreeImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 20);
      setFreeImages(files);
    }
  };

  const removeFreeImage = (index) => {
    setFreeImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePremiumInputChange = (e) => {
    const { name, value } = e.target;
    setPremiumForm(prev => ({ ...prev, [name]: value }));
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

      // Use location as adCity if adCity is not provided
      if (!premiumForm.adCity && premiumForm.location) {
        formData.append('adCity', premiumForm.location);
      }

      // Use adCity as registrationCity if registrationCity is not provided
      if (!premiumForm.registrationCity && premiumForm.adCity) {
        formData.append('registrationCity', premiumForm.adCity);
      } else if (!premiumForm.registrationCity && premiumForm.location) {
        formData.append('registrationCity', premiumForm.location);
      }

      // Append bodyColor (use customColor if "Other" is selected)
      if (premiumForm.bodyColor) {
        formData.append('bodyColor', premiumForm.bodyColor === "Other" ? premiumForm.customColor : premiumForm.bodyColor);
      }

      // Append features from checkbox state
      const selectedFeatures = Object.keys(premiumFeatures).filter(key => premiumFeatures[key]);
      if (selectedFeatures.length > 0) {
        formData.append('features', selectedFeatures.join(','));
      }

      // Append images
      premiumImages.forEach((image, index) => {
        formData.append(`image${index + 1}`, image);
      });

      // If coming from dealer package, add package info and skip payment
      if (dealerPackageId && skipPayment) {
        formData.append('dealerPackageId', dealerPackageId);
        if (purchaseId) {
          formData.append('purchaseId', purchaseId);
        }
        formData.append('skipPayment', 'true');
        console.log('📦 Using dealer package:', dealerPackageId, 'Purchase:', purchaseId);
      }

      // Append invoice image only if NOT using dealer package
      if (premiumInvoiceImage && !skipPayment) {
        formData.append('invoiceImage', premiumInvoiceImage);
      }

      console.log('🔄 Submitting premium bike ad...');

      const response = await fetchWithRetry(`${API_URL}/bike_ads`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Premium bike ad created successfully:', result);

      setSuccess(true);
      setActiveForm(null);

      toast.success('Premium bike ad submitted successfully! Your ad is pending admin approval and will be active after verification.');

      // Reset form
      setPremiumForm({
        title: '',
        make: '',
        model: '',
        year: '',
        price: '',
        location: '',
        registrationCity: '',
        bodyColor: '',
        customColor: '',
        kmDriven: '',
        fuelType: '',
        engineCapacity: '',
        bodyType: '',
        description: '',
        preferredContact: 'phone',
        adCity: '',
        variant: '',
        enginetype: '',
        transmission: '',
        packageId: '',
        packageName: '',
        packagePrice: '',
        isFeatured: 'true',
        isPaidAd: 'true',
        paymentStatus: 'pending'
      });
      setPremiumImages([]);
      setPremiumInvoiceImage(null);
      setPremiumFeatures({
        LEDHeadlamp: false,
        DigitalConsole: false,
        USBChargingPort: false,
        BluetoothConnectivity: false,
        Navigation: false,
        ABS: false,
        SlipperClutch: false,
        QuickShifter: false,
        TractionControl: false,
        StabilityControl: false,
        HillStartAssist: false,
        EmergencyStopSignal: false,
      });
      setShowPremiumCustomColorInput(false);

      setTimeout(() => {
        setSuccess(false);
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('❌ Error creating premium bike ad:', err);
      setError(err.message || 'Failed to create premium bike ad. Please try again.');
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

    try {
      const API_URL = server_ip || 'http://localhost:8001';
      const formData = new FormData();

      formData.append('userId', userId);

      // Helper function to get string value (handle arrays)
      const getStringValue = (value) => {
        if (Array.isArray(value)) {
          return value[0] || '';
        }
        return value || '';
      };

      // Append all form fields EXCEPT location, adCity, registrationCity, bodyColor (we'll handle these separately)
      const excludedFields = ['location', 'adCity', 'registrationCity', 'bodyColor', 'customColor'];
      Object.keys(freeForm).forEach(key => {
        if (!excludedFields.includes(key) && freeForm[key]) {
          const value = getStringValue(freeForm[key]);
          if (value) {
            formData.append(key, value);
          }
        }
      });

      // Handle location, adCity, registrationCity - ensure they're strings, not arrays
      const locationValue = getStringValue(freeForm.location) || getStringValue(freeForm.adCity) || 'Unknown';
      const adCityValue = getStringValue(freeForm.adCity) || locationValue || 'Unknown';
      const registrationCityValue = getStringValue(freeForm.registrationCity) || adCityValue || locationValue || 'Unknown';

      formData.append('location', locationValue);
      formData.append('adCity', adCityValue);
      formData.append('registrationCity', registrationCityValue);

      // Append bodyColor (use customColor if "Other" is selected) - ensure it's a string
      const bodyColorValue = getStringValue(freeForm.bodyColor);
      if (bodyColorValue) {
        const finalBodyColor = bodyColorValue === "Other" ? getStringValue(freeForm.customColor) : bodyColorValue;
        if (finalBodyColor) {
          formData.append('bodyColor', finalBodyColor);
        }
      }

      // Append features from checkbox state
      const selectedFeatures = Object.keys(freeFeatures).filter(key => freeFeatures[key]);
      if (selectedFeatures.length > 0) {
        formData.append('features', selectedFeatures.join(','));
      }

      // Don't set isFeatured, isPaidAd, or paymentStatus for free ads
      // Backend will treat it as free ad

      // Append images
      freeImages.forEach((image, index) => {
        formData.append(`image${index + 1}`, image);
      });

      console.log('🔄 Submitting free bike ad...');

      const response = await fetchWithRetry(`${API_URL}/bike_ads`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          if (errorData.details) {
            console.error('❌ Validation errors:', errorData.details);
          }
        } catch (e) {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (e2) {
            // If both fail, use default message
          }
        }
        console.error('❌ Error response:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Free bike ad created successfully:', result);

      setSuccess(true);
      setActiveForm(null);

      toast.success('Free bike ad created successfully!');

      // Reset form
      setFreeForm({
        title: '',
        make: '',
        model: '',
        year: '',
        price: '',
        location: '',
        registrationCity: '',
        bodyColor: '',
        kmDriven: '',
        fuelType: '',
        engineCapacity: '',
        bodyType: '',
        description: '',
        preferredContact: 'phone',
        adCity: '',
        variant: '',
        enginetype: '',
        transmission: '',
        features: '',
        customColor: ''
      });
      setFreeImages([]);
      setFreeFeatures({
        LEDHeadlamp: false,
        DigitalConsole: false,
        USBChargingPort: false,
        BluetoothConnectivity: false,
        Navigation: false,
        ABS: false,
        SlipperClutch: false,
        QuickShifter: false,
        TractionControl: false,
        StabilityControl: false,
        HillStartAssist: false,
        EmergencyStopSignal: false,
      });
      setShowCustomColorInput(false);

      setTimeout(() => {
        setSuccess(false);
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('❌ Error creating free bike ad:', err);
      setError(err.message || 'Failed to create free bike ad. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkLoginAndProceed = (formType) => {
    if (!userId) {
      alert('Please login first to create an ad');
      navigate('/signin');
      return;
    }
    setActiveForm(formType);
  };

  const offerings = [
    {
      id: 1,
      title: 'FREE AD SERVICE',
      icon: '🆓',
      badge: 'FREE',
      description: 'Post your bike ad for free. Reach thousands of buyers.',
      onClick: () => {
        if (!userId) {
          alert('Please login first to create an ad');
          navigate('/signin');
          return;
        }
        setActiveForm('free');
      }
    },
    {
      id: 2,
      title: 'PREMIUM AD SERVICE',
      icon: '⭐',
      badge: 'PREMIUM',
      description: 'Get premium visibility. Contact directly with buyers.',
      onClick: () => checkLoginAndProceed('premium')
    }
  ];

  return (
    <>
      <Helmet>
        <title>Sell Your Bike - Autofinder</title>
      </Helmet>

      <div className="bg-white dark:bg-gray-900 min-h-screen py-8 transition-colors">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Sell Your Bike</h1>

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6 mb-6 text-center max-w-4xl mx-auto">
              <p className="text-green-800 dark:text-green-400 font-semibold text-lg mb-2">✅ Ad Submitted Successfully!</p>
              <p className="text-green-700 dark:text-green-500">Your premium bike ad has been submitted and is pending admin approval. It will be active after admin verification. Redirecting...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 mb-6 text-center max-w-4xl mx-auto">
              <p className="text-red-800 dark:text-red-400 font-semibold mb-2">Error</p>
              <p className="text-red-700 dark:text-red-500">{error}</p>
            </div>
          )}

          {!activeForm && !dealerPackageId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-4xl mx-auto">
              {offerings.map((offering) => (
                <div
                  key={offering.id}
                  onClick={offering.onClick}
                  className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-red-500 dark:hover:border-red-600 transition-all cursor-pointer group"
                >
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <svg className="w-32 h-24 text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                    </svg>

                    <div className="absolute top-3 right-3 bg-red-600 dark:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg">
                      {offering.icon}
                    </div>

                    <div className={`absolute bottom-3 left-3 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold ${offering.badge === 'PREMIUM'
                      ? 'bg-yellow-400 dark:bg-yellow-500 text-gray-800 dark:text-gray-900'
                      : 'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200'
                      }`}>
                      {offering.badge}
                    </div>
                  </div>
                  <div className="p-5 text-center">
                    <div className="text-xs font-bold text-red-600 dark:text-red-500 mb-2">AUTOFINDER</div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                      {offering.title}
                    </h3>
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{offering.description}</p>
                    <button className="mt-4 w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white py-2 px-4 rounded-md font-semibold transition-colors">
                      {offering.id === 1 ? 'Post Free Ad' : 'Create Premium Ad Service'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Free Bike Ad Form */}
          {activeForm === 'free' && (
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Create Free Bike Ad</h2>
                <button
                  onClick={() => setActiveForm(null)}
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
                      Title <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={freeForm.title}
                      onChange={handleFreeInputChange}
                      placeholder="e.g., Honda CD 70 2020"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Make <span className="text-red-600">*</span>
                    </label>
                    <SearchableBikeMakeSelect
                      name="make"
                      value={freeForm.make}
                      onChange={handleFreeInputChange}
                      required
                      placeholder="Select Make"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Model <span className="text-red-600">*</span>
                    </label>
                    <SearchableBikeModelSelect
                      name="model"
                      value={freeForm.model}
                      onChange={handleFreeInputChange}
                      selectedMake={freeForm.make}
                      required
                      placeholder="Select Model"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Variant
                    </label>
                    <SearchableBikeVariantSelect
                      name="variant"
                      value={freeForm.variant}
                      onChange={handleFreeInputChange}
                      selectedMake={freeForm.make}
                      selectedModel={freeForm.model}
                      placeholder="Select Variant"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Year <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="year"
                      value={freeForm.year}
                      onChange={handleFreeInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="">Select Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Price (PKR) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={freeForm.price}
                      onChange={handleFreeInputChange}
                      placeholder="e.g., 150000"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                </div>

                {/* Location Information - Matching Mobile App */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Select City <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="adCity"
                      value={freeForm.adCity}
                      onChange={handleFreeInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="">Select City</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Select Area
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={freeForm.location}
                      onChange={handleFreeInputChange}
                      placeholder="e.g., DHA Phase 5"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Registration City <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="registrationCity"
                      value={freeForm.registrationCity}
                      onChange={handleFreeInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="">Select Registration City</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bike Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Fuel Type
                    </label>
                    <select
                      name="fuelType"
                      value={freeForm.fuelType}
                      onChange={handleFreeInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select Fuel Type</option>
                      {fuelTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Body Type
                    </label>
                    <select
                      name="bodyType"
                      value={freeForm.bodyType}
                      onChange={handleFreeInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select Body Type</option>
                      {bodyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Body Color
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setFreeForm(prev => ({ ...prev, bodyColor: color, customColor: '' }));
                            setShowCustomColorInput(false);
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${freeForm.bodyColor === color
                            ? 'bg-red-600 dark:bg-red-700 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                          {color}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setFreeForm(prev => ({ ...prev, bodyColor: 'Other' }));
                          setShowCustomColorInput(true);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${showCustomColorInput
                          ? 'bg-red-600 dark:bg-red-700 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                      >
                        Other
                      </button>
                    </div>
                    {showCustomColorInput && (
                      <input
                        type="text"
                        name="customColor"
                        value={freeForm.customColor}
                        onChange={handleFreeInputChange}
                        placeholder="Enter custom color"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mt-2"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      KM Driven
                    </label>
                    <input
                      type="number"
                      name="kmDriven"
                      value={freeForm.kmDriven}
                      onChange={handleFreeInputChange}
                      placeholder="e.g., 10000"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Engine Capacity (CC)
                    </label>
                    <input
                      type="text"
                      name="engineCapacity"
                      value={freeForm.engineCapacity}
                      onChange={handleFreeInputChange}
                      placeholder="e.g., 70"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Engine Type
                    </label>
                    <select
                      name="enginetype"
                      value={freeForm.enginetype}
                      onChange={handleFreeInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select Engine Type</option>
                      {bodyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Transmission
                    </label>
                    <select
                      name="transmission"
                      value={freeForm.transmission}
                      onChange={handleFreeInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select Transmission</option>
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Semi-Automatic">Semi-Automatic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Preferred Contact Method
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFreeForm(prev => ({ ...prev, preferredContact: 'phone' }))}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${freeForm.preferredContact === 'phone'
                          ? 'bg-red-600 dark:bg-red-700 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                      >
                        Phone
                      </button>
                      <button
                        type="button"
                        onClick={() => setFreeForm(prev => ({ ...prev, preferredContact: 'whatsapp' }))}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${freeForm.preferredContact === 'whatsapp'
                          ? 'bg-red-600 dark:bg-red-700 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                      >
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => setFreeForm(prev => ({ ...prev, preferredContact: 'both' }))}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${freeForm.preferredContact === 'both'
                          ? 'bg-red-600 dark:bg-red-700 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                      >
                        Both
                      </button>
                    </div>
                  </div>
                </div>

                {/* Features Section - Matching Mobile App */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Features
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {bikeFeatures.map((feature) => (
                      <label
                        key={feature}
                        className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={freeFeatures[feature]}
                          onChange={(e) => {
                            setFreeFeatures(prev => ({ ...prev, [feature]: e.target.checked }));
                          }}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={freeForm.description}
                    onChange={handleFreeInputChange}
                    rows={4}
                    placeholder="Describe your bike..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Images <span className="text-red-600">*</span> (Max 20)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFreeImageChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                  {freeImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {freeImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeFreeImage(index)}
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
                    {loading ? 'Creating Ad...' : 'Create Free Bike Ad'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveForm(null)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Package Selection */}
          {activeForm === 'premium' && showPackageSelection && !dealerPackageId && (
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Select Premium Package</h2>
                <button
                  onClick={() => {
                    setActiveForm(null);
                    setShowPackageSelection(false);
                    setSelectedPackage(null);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              {loadingPackages ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading packages...</p>
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">No packages available at the moment.</p>
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
                        className={`relative bg-white dark:bg-gray-700 rounded-lg border-2 p-6 transition-all cursor-pointer hover:shadow-xl flex flex-col h-full ${isPopular
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
                            className="w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white py-3 px-6 rounded-lg font-semibold transition-colors mt-auto"
                          >
                            Select Package
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Premium Bike Ad Form - Show directly if using dealer package */}
          {activeForm === 'premium' && (!showPackageSelection || dealerPackageId) && selectedPackage && (
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Create Premium Bike Ad</h2>
                  {selectedPackage && !dealerPackageId && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Selected Package: <span className="font-semibold">{selectedPackage.name || selectedPackage.bundleName}</span>
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
                      Title <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={premiumForm.title}
                      onChange={handlePremiumInputChange}
                      placeholder="e.g., Honda CD 70 2020"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Make <span className="text-red-600">*</span>
                    </label>
                    <SearchableBikeMakeSelect
                      name="make"
                      value={premiumForm.make}
                      onChange={handlePremiumInputChange}
                      required
                      placeholder="Select Make"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Model <span className="text-red-600">*</span>
                    </label>
                    <SearchableBikeModelSelect
                      name="model"
                      value={premiumForm.model}
                      onChange={handlePremiumInputChange}
                      selectedMake={premiumForm.make}
                      required
                      placeholder="Select Model"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Variant
                    </label>
                    <SearchableBikeVariantSelect
                      name="variant"
                      value={premiumForm.variant}
                      onChange={handlePremiumInputChange}
                      selectedMake={premiumForm.make}
                      selectedModel={premiumForm.model}
                      placeholder="Select Variant"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Year <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="year"
                      value={premiumForm.year}
                      onChange={handlePremiumInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="">Select Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Price (PKR) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={premiumForm.price}
                      onChange={handlePremiumInputChange}
                      placeholder="e.g., 150000"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                </div>

                {/* Location Information - Matching Mobile App */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Select City <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="adCity"
                      value={premiumForm.adCity}
                      onChange={handlePremiumInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="">Select City</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Select Area
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={premiumForm.location}
                      onChange={handlePremiumInputChange}
                      placeholder="e.g., DHA Phase 5"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Registration City <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="registrationCity"
                      value={premiumForm.registrationCity}
                      onChange={handlePremiumInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="">Select Registration City</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bike Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Fuel Type
                    </label>
                    <select
                      name="fuelType"
                      value={premiumForm.fuelType}
                      onChange={handlePremiumInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select Fuel Type</option>
                      {fuelTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Body Type
                    </label>
                    <select
                      name="bodyType"
                      value={premiumForm.bodyType}
                      onChange={handlePremiumInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select Body Type</option>
                      {bodyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Body Color
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setPremiumForm(prev => ({ ...prev, bodyColor: color, customColor: '' }));
                            setShowPremiumCustomColorInput(false);
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${premiumForm.bodyColor === color
                            ? 'bg-red-600 dark:bg-red-700 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                          {color}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setPremiumForm(prev => ({ ...prev, bodyColor: 'Other' }));
                          setShowPremiumCustomColorInput(true);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${showPremiumCustomColorInput
                          ? 'bg-red-600 dark:bg-red-700 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                      >
                        Other
                      </button>
                    </div>
                    {showPremiumCustomColorInput && (
                      <input
                        type="text"
                        name="customColor"
                        value={premiumForm.customColor}
                        onChange={handlePremiumInputChange}
                        placeholder="Enter custom color"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mt-2"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      KM Driven
                    </label>
                    <input
                      type="number"
                      name="kmDriven"
                      value={premiumForm.kmDriven}
                      onChange={handlePremiumInputChange}
                      placeholder="e.g., 10000"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Engine Capacity (CC)
                    </label>
                    <input
                      type="text"
                      name="engineCapacity"
                      value={premiumForm.engineCapacity}
                      onChange={handlePremiumInputChange}
                      placeholder="e.g., 70"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Engine Type
                    </label>
                    <select
                      name="enginetype"
                      value={premiumForm.enginetype}
                      onChange={handlePremiumInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select Engine Type</option>
                      {bodyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Transmission
                    </label>
                    <select
                      name="transmission"
                      value={premiumForm.transmission}
                      onChange={handlePremiumInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select Transmission</option>
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Semi-Automatic">Semi-Automatic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Preferred Contact Method
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPremiumForm(prev => ({ ...prev, preferredContact: 'phone' }))}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${premiumForm.preferredContact === 'phone'
                          ? 'bg-red-600 dark:bg-red-700 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                      >
                        Phone
                      </button>
                      <button
                        type="button"
                        onClick={() => setPremiumForm(prev => ({ ...prev, preferredContact: 'whatsapp' }))}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${premiumForm.preferredContact === 'whatsapp'
                          ? 'bg-red-600 dark:bg-red-700 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                      >
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => setPremiumForm(prev => ({ ...prev, preferredContact: 'both' }))}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${premiumForm.preferredContact === 'both'
                          ? 'bg-red-600 dark:bg-red-700 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                      >
                        Both
                      </button>
                    </div>
                  </div>
                </div>

                {/* Features Section - Matching Mobile App */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Features
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {bikeFeatures.map((feature) => (
                      <label
                        key={feature}
                        className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={premiumFeatures[feature]}
                          onChange={(e) => {
                            setPremiumFeatures(prev => ({ ...prev, [feature]: e.target.checked }));
                          }}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={premiumForm.description}
                    onChange={handlePremiumInputChange}
                    rows="4"
                    placeholder="Describe your bike..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Images <span className="text-red-600">*</span> (Up to 20 images)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
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
                            onClick={() => removeImage(index)}
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
                      Payment Invoice Image (Optional)
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
                    {loading ? 'Creating Ad...' : 'Create Premium Bike Ad'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveForm(null)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SellBike;
