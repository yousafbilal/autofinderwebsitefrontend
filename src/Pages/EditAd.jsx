import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';
import { toast } from 'react-toastify';
import { FaTimes, FaChevronDown } from 'react-icons/fa';
import { carData } from '../Utils/carData';

// Searchable City Select Component
const SearchableCitySelect = ({ value, onChange, name, required = false, placeholder }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
          {value || placeholder}
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
                  {t(city.toLowerCase().replace(/\s+/g, ''))}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">{t('noCityFound')}</div>
            )}
          </div>
        </div>
      )}
      {required && !value && <input type="hidden" required />}
    </div>
  );
};

// Searchable Make Select Component
const SearchableMakeSelect = ({ value, onChange, name, required = false, placeholder }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const makes = Object.keys(carData).sort((a, b) => a.localeCompare(b));
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
                  {t(make.toLowerCase().replace(/\s+/g, ''))}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">{t('noMakeFound')}</div>
            )}
          </div>
        </div>
      )}
      {required && !value && <input type="hidden" required />}
    </div>
  );
};

// Searchable Model Select Component
const SearchableModelSelect = ({
  value,
  onChange,
  name,
  selectedMake,
  required = false,
  placeholder,
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const models =
    selectedMake && carData[selectedMake]
      ? Object.keys(carData[selectedMake].models).sort((a, b) => a.localeCompare(b))
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
          {value || (selectedMake ? (placeholder || t('selectModel')) : t('selectMakeFirst'))}
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
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">{t('noModelFound')}</div>
            )}
          </div>
        </div>
      )}
      {required && !value && <input type="hidden" required />}
    </div>
  );
};

// Searchable Variant Select Component
const SearchableVariantSelect = ({
  value,
  onChange,
  name,
  selectedMake,
  selectedModel,
  placeholder,
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Get variants - variants is an object, so get its keys
  const variants =
    selectedMake &&
      selectedModel &&
      carData[selectedMake]?.models[selectedModel]?.variants
      ? Object.keys(carData[selectedMake].models[selectedModel].variants).sort((a, b) =>
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
          {value || (selectedMake && selectedModel ? (placeholder || t('selectVariant')) : t('selectMakeModelFirst'))}
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
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">{t('noVariantFound')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function EditAd() {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [adData, setAdData] = useState(null);
  const [adType, setAdType] = useState(null);
  const [adEndpoint, setAdEndpoint] = useState(null); // Track which endpoint was used to fetch the ad

  // Form state
  const [form, setForm] = useState({
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
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [features, setFeatures] = useState({
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

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    // Check authentication
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.info(t('loginToEditAd'));
      navigate('/signin');
      return;
    }
    fetchAdData();
  }, [id, navigate]);

  const fetchAdData = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_URL = server_ip || 'http://localhost:8001';

      console.log('🔍 Fetching ad with ID:', id);

      let response;
      let endpointUsed = null;

      // Try to fetch from all_ads endpoint first (handles all collections)
      response = await fetchWithRetry(`${API_URL}/all_ads/${id}`, {
        method: 'GET',
      });

      // If all_ads fails, try specific endpoints based on common ad types
      if (!response.ok) {
        console.log('⚠️ all_ads endpoint failed, trying specific endpoints...');

        // Try free_ads endpoint
        response = await fetchWithRetry(`${API_URL}/free_ads/${id}`, {
          method: 'GET',
        });

        if (response.ok) {
          endpointUsed = 'free_ads';
        } else {
          // Try featured_ads endpoint
          response = await fetchWithRetry(`${API_URL}/featured_ads/${id}`, {
            method: 'GET',
          });

          if (response.ok) {
            endpointUsed = 'featured_ads';
          }
        }
      } else {
        // all_ads worked, but we need to determine the actual endpoint
        // We'll check the ad properties after fetching
        endpointUsed = 'all_ads';
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('❌ Failed to fetch ad:', errorData);
        console.error('❌ Response status:', response.status);

        if (response.status === 404) {
          throw new Error(t('adNotFound'));
        } else {
          throw new Error(errorData.message || t('adUpdateFailed'));
        }
      }

      const data = await response.json();
      console.log('📋 Fetched ad data:', data);

      // Determine the correct endpoint based on ad properties if not already determined
      if (!endpointUsed || endpointUsed === 'all_ads') {
        // Check if it's a premium/featured ad
        const isPremiumAd = data.isFeatured === 'Approved' ||
          data.isFeatured === true ||
          data.isPaidAd === true ||
          data.paymentStatus === 'verified' ||
          data.adType === 'featured' ||
          data.adType === 'listItForYou' ||
          (data.packagePrice && data.packagePrice !== 525);

        if (isPremiumAd) {
          endpointUsed = 'featured_ads';
        } else {
          endpointUsed = 'free_ads';
        }
      }

      console.log('✅ Using endpoint for updates:', endpointUsed);

      setAdData(data);
      setAdType(data.adType || 'free');
      setAdEndpoint(endpointUsed); // Store the endpoint used for fetching

      // Populate form with existing data
      setForm({
        title: data.title || '',
        make: data.make || '',
        model: data.model || '',
        variant: data.variant || '',
        year: data.year || '',
        price: data.price || '',
        location: data.location || '',
        registrationCity: data.registrationCity || '',
        bodyColor: data.bodyColor || '',
        kmDriven: data.kmDriven || '',
        fuelType: data.fuelType || '',
        engineCapacity: data.engineCapacity || '',
        transmission: data.transmission || '',
        assembly: data.assembly || '',
        bodyType: data.bodyType || '',
        description: data.description || '',
        preferredContact: data.preferredContact || 'phone',
      });

      // Populate features
      if (data.features && Array.isArray(data.features)) {
        const featuresObj = {};
        data.features.forEach(feature => {
          featuresObj[feature] = true;
        });
        setFeatures(prev => ({ ...prev, ...featuresObj }));
      }

      // Store existing images
      const existingImgs = [];
      for (let i = 1; i <= 20; i++) {
        const imgKey = `image${i}`;
        if (data[imgKey]) {
          existingImgs.push(data[imgKey]);
        }
      }
      setExistingImages(existingImgs);

    } catch (err) {
      console.error('❌ Error fetching ad data:', err);
      console.error('❌ Error details:', {
        message: err.message,
        name: err.name,
        adId: id
      });
      const errorMessage = err.message || 'Failed to load ad data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      toast.error(t('maxImagesAllowed'));
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (feature) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!form.title || !form.make || !form.model || !form.year || !form.price || !form.location) {
      toast.error(t('fillRequiredFields'));
      return;
    }

    if (images.length === 0 && existingImages.length === 0) {
      toast.error(t('uploadAtLeastOneImage'));
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const API_URL = server_ip || 'http://localhost:8001';

      // Determine endpoint based on stored endpoint or ad properties
      let updateEndpoint = '';

      // First, check if we have the endpoint from fetching
      if (adEndpoint) {
        updateEndpoint = `${API_URL}/${adEndpoint}/${id}`;
      } else if (adType === 'featured' || adType === 'listItForYou') {
        updateEndpoint = `${API_URL}/featured_ads/${id}`;
      } else if (adData) {
        // Check ad properties to determine endpoint
        const isPremiumAd = adData.isFeatured === 'Approved' ||
          adData.isFeatured === true ||
          adData.isPaidAd === true ||
          adData.paymentStatus === 'verified' ||
          (adData.packagePrice && adData.packagePrice !== 525);

        if (isPremiumAd) {
          updateEndpoint = `${API_URL}/featured_ads/${id}`;
        } else {
          updateEndpoint = `${API_URL}/free_ads/${id}`;
        }
      } else if (adType === 'free' || !adType) {
        updateEndpoint = `${API_URL}/free_ads/${id}`;
      } else {
        // Use generic endpoint as fallback
        updateEndpoint = `${API_URL}/all_ads/${id}`;
      }

      console.log('🔄 Update endpoint determined:', updateEndpoint);

      // Prepare update data
      const updateData = {};

      // Append form fields
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== undefined && form[key] !== '') {
          updateData[key] = String(form[key]);
        }
      });

      // Append features - backend expects array
      const selectedFeatures = Object.keys(features).filter(key => features[key]);
      updateData.features = selectedFeatures;

      // Also ensure year and price are numbers if they exist
      if (form.year) {
        updateData.year = parseInt(form.year) || form.year;
      }
      if (form.price) {
        updateData.price = parseFloat(form.price) || form.price;
      }
      if (form.kmDriven) {
        updateData.kmDriven = parseFloat(form.kmDriven) || form.kmDriven;
      }

      // If there are new images, we need to use FormData
      // Otherwise, use JSON
      if (images.length > 0) {
        const formData = new FormData();

        // Append form fields to FormData
        Object.keys(updateData).forEach(key => {
          if (key !== 'features') {
            formData.append(key, updateData[key]);
          }
        });

        // Append features as comma-separated string
        formData.append('features', selectedFeatures.join(','));

        // Append new images
        images.forEach((image, index) => {
          formData.append(`image${index + 1}`, image);
        });

        console.log('🔄 Updating ad with images at:', updateEndpoint);
        console.log('📋 Form data keys:', Array.from(formData.keys()));

        const response = await fetchWithRetry(updateEndpoint, {
          method: 'PUT',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || t('adUpdateFailed'));
        }

        const result = await response.json();
        console.log('✅ Ad updated successfully:', result);

        toast.success(t('adUpdatedSuccess'));

        // Navigate back to My Ads after 1 second
        setTimeout(() => {
          navigate('/my-ads');
        }, 1000);
        return;
      }

      // No new images - use JSON
      console.log('🔄 Updating ad at:', updateEndpoint);
      console.log('📋 Update data:', updateData);

      const response = await fetchWithRetry(updateEndpoint, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.message || 'Failed to update ad');
      }

      const result = await response.json();
      console.log('✅ Ad updated successfully:', result);

      toast.success('Ad updated successfully!');

      // Navigate back to My Ads after 1 second
      setTimeout(() => {
        navigate('/my-ads');
      }, 1000);

    } catch (err) {
      console.error('❌ Error updating ad:', err);
      setError(err.message || 'Failed to update ad');
      toast.error(err.message || 'Failed to update ad');
    } finally {
      setSaving(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const API_URL = server_ip || 'http://localhost:8001';

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    if (cleanPath.startsWith('uploads/')) {
      return `${API_URL}/${cleanPath}`;
    }
    return `${API_URL}/uploads/${cleanPath}`;
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

  if (error && !adData) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => navigate('/my-ads')}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Back to My Ads
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('editAdTitle')} - Auto Finder</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('editAdTitle')}</h1>
              <button
                onClick={() => navigate('/my-ads')}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('adTitle')} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder={t('adTitlePlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('make')} <span className="text-red-600">*</span>
                  </label>
                  <SearchableMakeSelect
                    name="make"
                    value={form.make}
                    onChange={handleInputChange}
                    required
                    placeholder="Select Make"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('model')} <span className="text-red-600">*</span>
                  </label>
                  <SearchableModelSelect
                    name="model"
                    value={form.model}
                    onChange={handleInputChange}
                    selectedMake={form.make}
                    required
                    placeholder="Select Model"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('variant')}
                  </label>
                  <SearchableVariantSelect
                    name="variant"
                    value={form.variant}
                    onChange={handleInputChange}
                    selectedMake={form.make}
                    selectedModel={form.model}
                    placeholder="Select Variant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('year')} <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="year"
                    value={form.year}
                    onChange={handleInputChange}
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
                    {t('pricePKR')} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
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
                    value={form.location}
                    onChange={handleInputChange}
                    required
                    placeholder="Select City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('registrationCity')}
                  </label>
                  <SearchableCitySelect
                    name="registrationCity"
                    value={form.registrationCity}
                    onChange={handleInputChange}
                    placeholder="Select Registration City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('fuelType')}
                  </label>
                  <select
                    name="fuelType"
                    value={form.fuelType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">{t('selectFuelType')}</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="LPG">LPG</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('transmission')}
                  </label>
                  <select
                    name="transmission"
                    value={form.transmission}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">{t('selectTransmission')}</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('bodyType')}
                  </label>
                  <select
                    name="bodyType"
                    value={form.bodyType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">{t('selectBodyType')}</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Convertible">Convertible</option>
                    <option value="Wagon">Wagon</option>
                    <option value="Van">Van</option>
                    <option value="Pickup">Pickup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('mileageKm')}
                  </label>
                  <input
                    type="number"
                    name="kmDriven"
                    value={form.kmDriven}
                    onChange={handleInputChange}
                    placeholder={t('mileagePlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('engineCapacityCc')}
                  </label>
                  <input
                    type="text"
                    name="engineCapacity"
                    value={form.engineCapacity}
                    onChange={handleInputChange}
                    placeholder={t('engineCapacityPlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('assembly')}
                  </label>
                  <select
                    name="assembly"
                    value={form.assembly}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">{t('selectAssembly')}</option>
                    <option value="Local">Local</option>
                    <option value="Imported">Imported</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('bodyColor')}
                  </label>
                  <input
                    type="text"
                    name="bodyColor"
                    value={form.bodyColor}
                    onChange={handleInputChange}
                    placeholder={t('bodyColorPlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('description')}
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder={t('descriptionPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('features')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.keys(features).map((feature) => (
                    <label key={feature} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={features[feature]}
                        onChange={() => handleFeatureChange(feature)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t(feature.toLowerCase().replace(/[\s\/]/g, '')) || feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('currentImages')}
                  </label>
                  <div className="grid grid-cols-4 gap-4">
                    {existingImages.map((img, index) => {
                      const imgUrl = getImageUrl(img);
                      return (
                        <div key={index} className="relative">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={`Current ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-500">{t('image')} {index + 1}</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* New Images */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('addNewImages')}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
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

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                >
                  {saving ? t('saving') : t('updateAd')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/my-ads')}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditAd;

