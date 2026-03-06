import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaChevronDown, FaCar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { server_ip } from '../Utils/Data';
import { carData } from '../Utils/carData';

// Searchable City Select Component
const SearchableCitySelect = ({ value, onChange, name, required = false, placeholder = "Select City" }) => {
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
              placeholder="Search city..."
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
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">No city found</div>
            )}
          </div>
        </div>
      )}
      {required && !value && <input type="hidden" required />}
    </div>
  );
};

// Searchable Make Select Component
const SearchableMakeSelect = ({ value, onChange, name, required = false, placeholder = "Select Make" }) => {
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

// Searchable Model Select Component
const SearchableModelSelect = ({ value, onChange, name, selectedMake, required = false, placeholder = "Select Model" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const models = selectedMake && carData[selectedMake]
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

// Searchable Variant Select Component
const SearchableVariantSelect = ({ value, onChange, name, selectedMake, selectedModel, placeholder = "Select Variant" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const variants = selectedMake && selectedModel && carData[selectedMake]?.models[selectedModel]
    ? Object.keys(carData[selectedMake].models[selectedModel].variants).sort((a, b) => a.localeCompare(b))
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

function ListItForYou() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);

  // Package Selection State
  const [listItPackages, setListItPackages] = useState([]);
  const [selectedListItPackage, setSelectedListItPackage] = useState(null);
  const [showListItPackageSelection, setShowListItPackageSelection] = useState(true);
  const [loadingListItPackages, setLoadingListItPackages] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
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
  const [images, setImages] = useState([]);
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

  // Generate years from 1990 to current year + 1
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);
  const colors = ['White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Green', 'Brown', 'Beige', 'Gold', 'Orange', 'Yellow', 'Purple', 'Pink'];
  const fuelTypes = ['Petrol', 'Diesel', 'CNG', 'Hybrid', 'Electric'];
  const bodyTypes = ['Sedan', 'Hatchback', 'SUV', 'Coupe', 'Convertible', 'Wagon', 'Van', 'Pickup', 'Other'];
  const transmissionTypes = ['Automatic', 'Manual', 'CVT', 'AMT'];
  const assemblyTypes = ['Local', 'Imported'];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    fetchListItPackages();
  }, [navigate]);

  const fetchListItPackages = async () => {
    try {
      setLoadingListItPackages(true);
      // Packages from mobile app
      const simplePackages = [
        {
          _id: 'basic-package',
          id: 'basic-package',
          name: 'Basic Package',
          bundleName: 'Basic Package',
          discountedPrice: 1800,
          price: 1800,
          validityDays: 7,
          noOfDays: 7,
          description: 'Listing creation and basic support...',
          features: [
            'Up to 1000 cc',
            'Listing creation',
            'Basic photo editing',
            'Inquiry forwarding'
          ],
          recommended: false,
        },
        {
          _id: 'standard-package',
          id: 'standard-package',
          name: 'Standard Package',
          bundleName: 'Standard Package',
          discountedPrice: 4000,
          price: 4000,
          validityDays: 15,
          noOfDays: 15,
          description: 'Essential listing services...',
          features: [
            '1001 cc – 2000 cc',
            'Professional photography',
            'Standard listing placement',
            'Inquiry management'
          ],
          recommended: true,
          popular: true,
        },
        {
          _id: 'premium-package',
          id: 'premium-package',
          name: 'Premium Package',
          bundleName: 'Premium Package',
          discountedPrice: 5500,
          price: 5500,
          validityDays: 30,
          noOfDays: 30,
          description: 'Full-service listing management...',
          features: [
            '2001cc OR SUV\'s, 4X4, Jeeps and German cars',
            'Professional photography',
            'Featured listing placement',
            'Dedicated listing agent',
            'Paperwork assistance'
          ],
          recommended: false,
        },
      ];
      console.log('📦 List It For You packages loaded:', simplePackages);
      console.log('📦 Total packages:', simplePackages.length);
      setListItPackages(simplePackages);
    } catch (err) {
      console.error('Error loading packages:', err);
    } finally {
      setLoadingListItPackages(false);
    }
  };

  const handlePackageSelect = (pkg) => {
    setSelectedListItPackage(pkg);
    setShowListItPackageSelection(false);
    setFormData(prev => ({
      ...prev,
      packageId: pkg._id || pkg.id,
      packageName: pkg.name || pkg.bundleName,
      packagePrice: pkg.discountedPrice || pkg.discountedRate || pkg.price,
      paymentAmount: pkg.discountedPrice || pkg.discountedRate || pkg.price,
      validityDays: pkg.validityDays || pkg.noOfDays,
      liveAdDays: pkg.validityDays || pkg.noOfDays,
      totalAds: pkg.totalAds || pkg.listingLimit || pkg.noOfBoosts
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 8);
    setImages(files);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFeature = (feature) => {
    setFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!userId) {
      setError('Please login to create an ad');
      toast.error('Please login first');
      setLoading(false);
      return;
    }

    if (!selectedListItPackage) {
      setError('Please select a package first.');
      setShowListItPackageSelection(true);
      toast.error('Please select a package first');
      setLoading(false);
      return;
    }

    if (!formData.location || !formData.make || !formData.model || !formData.year || !formData.price) {
      setError('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (images.length === 0) {
      setError('Please upload at least one image');
      toast.error('Please upload at least one image');
      setLoading(false);
      return;
    }

    try {
      const API_URL = server_ip || 'http://localhost:8001';
      const formDataToSend = new FormData();

      formDataToSend.append('userId', userId);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('make', formData.make);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('variant', formData.variant || '');
      formDataToSend.append('year', formData.year);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('registrationCity', formData.registrationCity || '');
      formDataToSend.append('bodyColor', formData.bodyColor || '');
      formDataToSend.append('kmDriven', formData.kmDriven || '0');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('fuelType', formData.fuelType || '');
      formDataToSend.append('bodyType', formData.bodyType || '');
      formDataToSend.append('engineCapacity', formData.engineCapacity || '');
      formDataToSend.append('transmission', formData.transmission || 'Automatic');
      formDataToSend.append('assembly', formData.assembly || 'Local');

      if (selectedListItPackage) {
        formDataToSend.append('packageId', selectedListItPackage._id || selectedListItPackage.id || '');
        formDataToSend.append('packageName', selectedListItPackage.name || selectedListItPackage.bundleName || '');
        formDataToSend.append('packagePrice', (selectedListItPackage.discountedPrice || selectedListItPackage.discountedRate || selectedListItPackage.price || 0).toString());
        formDataToSend.append('paymentAmount', (selectedListItPackage.discountedPrice || selectedListItPackage.discountedRate || selectedListItPackage.price || 0).toString());
        formDataToSend.append('validityDays', (selectedListItPackage.validityDays || selectedListItPackage.noOfDays || 0).toString());
      }

      const selectedFeatures = Object.keys(features).filter(key => features[key]);
      formDataToSend.append('features', selectedFeatures.join(','));

      images.forEach((image, index) => {
        formDataToSend.append(`image${index + 1}`, image);
      });

      console.log('🔄 Submitting list it for you ad...');

      const response = await fetch(`${API_URL}/list_it_for_you_ad`, {
        method: 'POST',
        body: formDataToSend,
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ List it for you ad created successfully:', result);

      setSuccess(true);
      toast.success('Ad created successfully!');

      // Reset form
      setFormData({
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
      setImages([]);
      setFeatures({
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
      setSelectedListItPackage(null);
      setShowListItPackageSelection(true);

      setTimeout(() => {
        setSuccess(false);
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('❌ Error creating list it for you ad:', err);
      setError(err.message || 'Failed to create ad. Please try again.');
      toast.error(err.message || 'Failed to create ad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>List It For You - Autofinder</title>
        <meta name="description" content="Let Autofinder list your car hassle free for you. Professional car listing service." />
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center justify-center gap-3">
              <FaCar className="text-red-600 dark:text-red-500" />
              Autofinder List It For You
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Let Autofinder list your car hassle free for you
            </p>
          </div>

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6 mb-6 text-center">
              <p className="text-green-800 dark:text-green-400 font-semibold text-lg mb-2">✅ Ad Created Successfully!</p>
              <p className="text-green-700 dark:text-green-500">Your ad has been submitted. Our team will contact you soon.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 mb-6 text-center">
              <p className="text-red-800 dark:text-red-400 font-semibold mb-2">Error</p>
              <p className="text-red-700 dark:text-red-500">{error}</p>
            </div>
          )}

          {/* Package Selection */}
          {showListItPackageSelection && (
            <div className="w-full max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Select Premium Package</h2>
              </div>

              {loadingListItPackages ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading packages...</p>
                </div>
              ) : listItPackages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">No packages available at the moment.</p>
                </div>
              ) : (
                <div className="w-full">
                  <div className="mb-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {listItPackages.length} package{listItPackages.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {listItPackages.map((pkg, index) => {
                      console.log(`📦 Rendering package ${index + 1}:`, pkg.name);
                      const packagePrice = pkg.discountedPrice || pkg.discountedRate || pkg.price || 0;
                      const originalPrice = pkg.actualPrice || pkg.price || packagePrice;
                      const youSaved = originalPrice - packagePrice;
                      const isPopular = pkg.popular;

                      return (
                        <div
                          key={pkg._id || pkg.id}
                          className={`relative bg-white dark:bg-gray-700 rounded-lg border-2 p-6 transition-all cursor-pointer hover:shadow-xl flex flex-col h-full ${isPopular || pkg.recommended
                              ? 'border-yellow-500 dark:border-yellow-600 shadow-lg'
                              : 'border-gray-200 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-600'
                            }`}
                          onClick={() => handlePackageSelect(pkg)}
                        >
                          {(isPopular || pkg.recommended) && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                              {pkg.recommended ? 'RECOMMENDED' : 'POPULAR'}
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
                              {(pkg.validityDays || pkg.noOfDays) && (
                                <div className="flex items-center justify-center gap-2 mt-2">
                                  <span className="text-green-600 font-semibold">✓</span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Validity: {pkg.validityDays || pkg.noOfDays} days
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2 mb-6 text-left flex-1">
                              {pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0 ? (
                                pkg.features.map((feature, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-semibold text-green-600">✓</span>
                                    <span>{feature}</span>
                                  </div>
                                ))
                              ) : null}
                            </div>
                            <button
                              type="button"
                              className="w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white py-3 px-6 rounded-lg font-semibold transition-colors mt-auto"
                            >
                              Select Package
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          {!showListItPackageSelection && selectedListItPackage && (
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">List It For You</h2>
                  {selectedListItPackage && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Selected Package: <span className="font-semibold">{selectedListItPackage.name || selectedListItPackage.bundleName}</span>
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Location <span className="text-red-600">*</span>
                    </label>
                    <SearchableCitySelect
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="Select City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Make <span className="text-red-600">*</span>
                    </label>
                    <SearchableMakeSelect
                      name="make"
                      value={formData.make}
                      onChange={handleInputChange}
                      required
                      placeholder="Select Make"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Model <span className="text-red-600">*</span>
                    </label>
                    <SearchableModelSelect
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      selectedMake={formData.make}
                      required
                      placeholder="Select Model"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Variant
                    </label>
                    <SearchableVariantSelect
                      name="variant"
                      value={formData.variant}
                      onChange={handleInputChange}
                      selectedMake={formData.make}
                      selectedModel={formData.model}
                      placeholder="Select Variant"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Year <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
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
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g., 2500000"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Registration City
                    </label>
                    <SearchableCitySelect
                      name="registrationCity"
                      value={formData.registrationCity}
                      onChange={handleInputChange}
                      placeholder="Select City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Body Color
                    </label>
                    <select
                      name="bodyColor"
                      value={formData.bodyColor}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select Color</option>
                      {colors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      KM Driven
                    </label>
                    <input
                      type="number"
                      name="kmDriven"
                      value={formData.kmDriven}
                      onChange={handleInputChange}
                      placeholder="e.g., 50000"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Fuel Type
                    </label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleInputChange}
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
                      value={formData.bodyType}
                      onChange={handleInputChange}
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
                      Engine Capacity (CC)
                    </label>
                    <input
                      type="text"
                      name="engineCapacity"
                      value={formData.engineCapacity}
                      onChange={handleInputChange}
                      placeholder="e.g., 1800"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Transmission
                    </label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {transmissionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Assembly
                    </label>
                    <select
                      name="assembly"
                      value={formData.assembly}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {assemblyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Describe your car..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Features
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.keys(features).map(feature => (
                      <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={features[feature]}
                          onChange={() => toggleFeature(feature)}
                          className="w-4 h-4 text-red-600 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Images <span className="text-red-600">*</span> (Up to 8 images)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                  {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {images.map((image, index) => (
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

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white py-3 rounded-lg font-semibold transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {loading ? 'Creating Ad...' : 'List It For You'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
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

export default ListItForYou;

