import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUpload, FaTimes, FaCheckCircle, FaChevronDown } from 'react-icons/fa';
import { server_ip } from '../Utils/Data';
import { carData } from '../Utils/carData';
import VoiceSearch from '../Components/VoiceSearch';
import { analyzeVoiceCommand } from '../Utils/VoiceNavigationLogic';
import { pakistaniCities } from '../Utils/pakistaniCities';


// Searchable components (similar to SellCar.jsx)
const SearchableMakeSelect = ({ value, onChange, name, required = false, placeholder = "Select Make" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef(null);
  const makes = Object.keys(carData || {}).sort();

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

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        readOnly
        value={value || ''}
        onClick={() => setIsOpen(!isOpen)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer"
        required={required}
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          <input
            type="text"
            placeholder="Search make..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            autoFocus
          />
          {filteredMakes.map(make => (
            <div
              key={make}
              onClick={() => {
                onChange({ target: { name, value: make } });
                setIsOpen(false);
                setSearchTerm('');
              }}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100"
            >
              {make}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchableModelSelect = ({ value, onChange, name, selectedMake, required = false, placeholder = "Select Model" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef(null);

  const models = selectedMake && carData && carData[selectedMake]
    ? Object.keys(carData[selectedMake].models || {}).sort()
    : [];

  const filteredModels = models.filter(model =>
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

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        readOnly
        value={value || ''}
        onClick={() => setIsOpen(!isOpen)}
        placeholder={selectedMake ? placeholder : "Select make first"}
        disabled={!selectedMake}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        required={required}
      />
      {isOpen && selectedMake && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          <input
            type="text"
            placeholder="Search model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            autoFocus
          />
          {filteredModels.map(model => (
            <div
              key={model}
              onClick={() => {
                onChange({ target: { name, value: model } });
                setIsOpen(false);
                setSearchTerm('');
              }}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100"
            >
              {model}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchableCitySelect = ({ value, onChange, name, required = false, placeholder = "Select City" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef(null);

  const cities = [
    "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan",
    "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Sargodha",
    "Bahawalpur", "Sukkur", "Abbottabad", "Mardan", "Swat", "Kasur"
  ].sort();

  const filteredCities = cities.filter(city =>
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

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        readOnly
        value={value || ''}
        onClick={() => setIsOpen(!isOpen)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer"
        required={required}
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          <input
            type="text"
            placeholder="Search city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            autoFocus
          />
          {filteredCities.map(city => (
            <div
              key={city}
              onClick={() => {
                onChange({ target: { name, value: city } });
                setIsOpen(false);
                setSearchTerm('');
              }}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100"
            >
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Mileage Input with Suggestions
const MileageInput = ({ value, onChange, name, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const dropdownRef = React.useRef(null);

  const mileageSuggestions = [
    '0', '5000', '10000', '15000', '20000', '25000', '30000', '35000', '40000',
    '45000', '50000', '60000', '70000', '80000', '90000', '100000', '120000',
    '150000', '200000', '250000', '300000'
  ];

  const filteredSuggestions = mileageSuggestions.filter(suggestion =>
    suggestion.includes(inputValue) || !inputValue
  );

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange({ target: { name, value: newValue } });
    setIsOpen(newValue.length > 0 && filteredSuggestions.length > 0);
  };

  const handleSelect = (suggestion) => {
    setInputValue(suggestion);
    onChange({ target: { name, value: suggestion } });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="number"
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(inputValue.length > 0 && filteredSuggestions.length > 0)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-auto">
          {filteredSuggestions.slice(0, 10).map((suggestion) => (
            <div
              key={suggestion}
              onClick={() => handleSelect(suggestion)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {suggestion} km
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Engine Capacity Input with Suggestions
const EngineCapacityInput = ({ value, onChange, name, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const dropdownRef = React.useRef(null);

  const engineCapacitySuggestions = [
    '660cc', '800cc', '1000cc', '1300cc', '1500cc', '1600cc', '1800cc', '2000cc',
    '2200cc', '2400cc', '2500cc', '3000cc', '3500cc', '4000cc', '4500cc', '5000cc'
  ];

  const filteredSuggestions = engineCapacitySuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(inputValue.toLowerCase()) || !inputValue
  );

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange({ target: { name, value: newValue } });
    setIsOpen(newValue.length > 0 && filteredSuggestions.length > 0);
  };

  const handleSelect = (suggestion) => {
    setInputValue(suggestion);
    onChange({ target: { name, value: suggestion } });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(inputValue.length > 0 && filteredSuggestions.length > 0)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-auto">
          {filteredSuggestions.slice(0, 10).map((suggestion) => (
            <div
              key={suggestion}
              onClick={() => handleSelect(suggestion)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {suggestion}
            </div>
          ))}
        </div>
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
  placeholder = "Select Variant",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef(null);

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

function Inspection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    variant: '',
    year: '',
    location: '',
    description: '',
    kmDriven: '',
    engineCapacity: ''
  });

  const [inspectionDate, setInspectionDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [cantFindSlot, setCantFindSlot] = useState(false);
  const [paymentReceiptImages, setPaymentReceiptImages] = useState([]);

  // Voice Search Handler
  const handleVoiceResult = (transcript) => {
    console.log("🎤 Voice Result:", transcript);
    const lowerTranscript = transcript.toLowerCase();

    // --- Navigation Logic ---
    const { action, path } = analyzeVoiceCommand(transcript);

    if (action === 'NAVIGATE' && path) {
      if (path === '/inspection') {
        // Already here
        return;
      }
      navigate(path);
      return;
    }

    // --- Form Filling Logic ---
    let updatedFormData = { ...formData };
    let foundMake = null;
    let foundModel = null;
    let foundYear = null;
    let foundCity = null;

    // 1. Find Make
    const makes = Object.keys(carData).sort((a, b) => b.length - a.length); // Longest first
    for (const make of makes) {
      if (lowerTranscript.includes(make.toLowerCase())) {
        foundMake = make;
        updatedFormData.make = make;
        break;
      }
    }

    // 2. Find Model (dependent on Make if found, otherwise search all)
    if (foundMake) {
      const models = Object.keys(carData[foundMake]?.models || {}).sort((a, b) => b.length - a.length);
      for (const model of models) {
        if (lowerTranscript.includes(model.toLowerCase())) {
          foundModel = model;
          updatedFormData.model = model;
          break;
        }
      }
    } else {
      // If make not found, try to find model in all makes
      for (const make of makes) {
        const models = Object.keys(carData[make]?.models || {}).sort((a, b) => b.length - a.length);
        for (const model of models) {
          if (lowerTranscript.includes(model.toLowerCase())) {
            foundModel = model;
            foundMake = make; // Infer make from model
            updatedFormData.model = model;
            updatedFormData.make = make;
            break;
          }
        }
        if (foundModel) break;
      }
    }

    // 3. Find Year (Simple 4 digit regex, 1990-2026)
    const yearMatch = transcript.match(/\b(199\d|20[0-2]\d)\b/);
    if (yearMatch) {
      foundYear = yearMatch[0];
      updatedFormData.year = parseInt(foundYear);
    }

    // 4. Find City
    // Use imported pakistaniCities or fallback
    const citiesToCheck = pakistaniCities && pakistaniCities.length > 0 ? pakistaniCities : [
      "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan",
      "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Sargodha",
      "Bahawalpur", "Sukkur", "Abbottabad", "Mardan", "Swat", "Kasur"
    ];

    for (const city of citiesToCheck) {
      if (lowerTranscript.includes(city.toLowerCase())) {
        foundCity = city;
        updatedFormData.location = city;
        break;
      }
    }

    if (foundMake || foundModel || foundYear || foundCity) {
      setFormData(updatedFormData);
    }
  };






  // Package Selection State
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPackageSelection, setShowPackageSelection] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // Fetch car packages for inspection
  useEffect(() => {
    fetchCarPackages();
  }, []);

  const fetchCarPackages = async () => {
    try {
      setLoadingPackages(true);
      // Car Inspection Packages - Same as mobile app
      const inspectionPackages = [
        {
          _id: 'silver-package',
          id: 'silver-package',
          name: 'Silver Whispers Package',
          bundleName: 'Silver Whispers Package',
          discountedPrice: 3200,
          price: 3200,
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
          _id: 'diamond-package',
          id: 'diamond-package',
          name: 'Diamond Delight package',
          bundleName: 'Diamond Delight package',
          discountedPrice: 4250,
          price: 4250,
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
          _id: 'platinum-package',
          id: 'platinum-package',
          name: 'Platinum Prestige package',
          bundleName: 'Platinum Prestige package',
          discountedPrice: 6500,
          price: 6500,
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
      setPackages(inspectionPackages);
    } catch (err) {
      console.error('Error loading packages:', err);
    } finally {
      setLoadingPackages(false);
    }
  };

  // Handle package selection
  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setShowPackageSelection(false);
    // Update formData with package info
    setFormData(prev => ({
      ...prev,
      packageId: pkg._id || pkg.id,
      packageName: pkg.name || pkg.bundleName,
      packagePrice: pkg.discountedPrice || pkg.discountedRate || pkg.price,
      paymentAmount: pkg.discountedPrice || pkg.discountedRate || pkg.price,
      validityDays: pkg.validityDays || pkg.noOfDays,
    }));
  };

  const availableTimeSlots = [
    "9:00 a.m.",
    "10:30 a.m.",
    "12:00 p.m.",
    "3:30 p.m.",
    "5:00 p.m."
  ];

  // Generate years from 1990 to current year + 1
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Get user from localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserId(user._id || user.userId || null);
      } else {
        // toast.info('Please login to request inspection');
        navigate('/signin');
      }
    } catch (e) {
      console.log('Could not get user from localStorage');
      navigate('/signin');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setPaymentReceiptImages(files);
  };

  const removeImage = (index) => {
    setPaymentReceiptImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!userId) {
      setError('Please login to request inspection');
      // toast.error('Please login first');
      setLoading(false);
      return;
    }

    if (!selectedPackage) {
      setError('Please select a package first.');
      setShowPackageSelection(true);
      // toast.error('Please select a package first');
      setLoading(false);
      return;
    }

    // Validation
    if (!formData.make || !formData.model || !formData.year || !formData.location) {
      setError('Please fill in all required fields: Make, Model, Year, and Location');
      // toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!inspectionDate) {
      setError('Please select inspection date');
      // toast.error('Please select inspection date');
      setLoading(false);
      return;
    }

    if (!cantFindSlot && !selectedTimeSlot) {
      setError('Please select inspection time slot');
      // toast.error('Please select inspection time slot');
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
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('kmDriven', formData.kmDriven || '0');
      formDataToSend.append('engineCapacity', formData.engineCapacity || '');

      // Add package info if selected
      if (selectedPackage) {
        formDataToSend.append('packageId', selectedPackage._id || selectedPackage.id || '');
        formDataToSend.append('packageName', selectedPackage.name || selectedPackage.bundleName || '');
        formDataToSend.append('packagePrice', (selectedPackage.discountedPrice || selectedPackage.discountedRate || selectedPackage.price || 0).toString());
        formDataToSend.append('paymentAmount', (selectedPackage.discountedPrice || selectedPackage.discountedRate || selectedPackage.price || 0).toString());
        formDataToSend.append('validityDays', (selectedPackage.validityDays || selectedPackage.noOfDays || 0).toString());
      }

      // Format date as ISO string
      const dateObj = new Date(inspectionDate);
      formDataToSend.append('inspection_date', dateObj.toISOString());

      // Time slot
      formDataToSend.append('inspection_time', cantFindSlot ? 'Call to book slot' : selectedTimeSlot);

      // Add payment receipt images
      paymentReceiptImages.forEach((image, index) => {
        formDataToSend.append('payment_receipt', image);
      });

      console.log('🔄 Submitting inspection request...');

      const response = await fetch(`${API_URL}/inspection`, {
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
      console.log('✅ Inspection request submitted successfully:', result);

      setSuccess(true);
      // toast.success('Inspection request submitted successfully!');

      // Reset form
      setFormData({
        make: '',
        model: '',
        variant: '',
        year: '',
        location: '',
        description: '',
        kmDriven: '',
        engineCapacity: ''
      });
      setInspectionDate('');
      setSelectedTimeSlot('');
      setCantFindSlot(false);
      setPaymentReceiptImages([]);

      setTimeout(() => {
        setSuccess(false);
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('❌ Error submitting inspection request:', err);
      setError(err.message || 'Failed to submit inspection request. Please try again.');
      // toast.error(err.message || 'Failed to submit inspection request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Car Inspection Service - Autofinder</title>
        <meta name="description" content="Request a professional car inspection service. Our expert inspectors will thoroughly check your vehicle." />
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
        <div className="container mx-auto px-4 max-w-4xl">

          <div className="text-center mb-8 relative">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center justify-center gap-3">
              <FaCar className="text-red-600 dark:text-red-500" />
              Car Inspection Service
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              Request a professional inspection for your car. Our expert team will thoroughly check your vehicle.
            </p>

            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Try saying "Honda Civic 2022 Lahore" or "Buy Bike"</span>
                <VoiceSearch
                  onResult={(transcript) => handleVoiceResult(transcript)}
                  className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 p-2 rounded-full"
                  silent={true}
                />
              </div>
            </div>


          </div>

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6 mb-6 text-center">
              <FaCheckCircle className="text-green-600 dark:text-green-400 text-4xl mx-auto mb-2" />
              <p className="text-green-800 dark:text-green-400 font-semibold text-lg mb-2">✅ Request Submitted Successfully!</p>
              <p className="text-green-700 dark:text-green-500">Your inspection request has been submitted. Our team will contact you soon.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 mb-6 text-center">
              <p className="text-red-800 dark:text-red-400 font-semibold mb-2">Error</p>
              <p className="text-red-700 dark:text-red-500">{error}</p>
            </div>
          )}

          {/* Package Selection */}
          {showPackageSelection && (
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Select Premium Package</h2>
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
                        className={`relative bg-white dark:bg-gray-700 rounded-lg border-2 p-4 transition-all cursor-pointer hover:shadow-xl flex flex-col h-full ${isPopular
                          ? 'border-yellow-500 dark:border-yellow-600 shadow-lg'
                          : 'border-gray-200 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-600'
                          }`}
                        onClick={() => handlePackageSelect(pkg)}
                      >
                        {(isPopular || pkg.recommended) && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-3 py-0.5 rounded-full text-xs font-bold">
                            {pkg.recommended ? 'RECOMMENDED' : 'POPULAR'}
                          </div>
                        )}
                        <div className="text-center flex flex-col flex-grow">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
                            {pkg.name || pkg.bundleName}
                          </h3>
                          {pkg.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{pkg.description}</p>
                          )}
                          <div className="mb-2">
                            <div className="flex items-baseline justify-center gap-2">
                              {originalPrice > packagePrice && (
                                <span className="text-sm text-gray-400 line-through">PKR {originalPrice.toLocaleString()}</span>
                              )}
                              <span className="text-2xl font-bold text-red-600 dark:text-red-500">
                                PKR {packagePrice.toLocaleString()}
                              </span>
                            </div>
                            {youSaved > 0 && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                                You Save: PKR {youSaved.toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1 mb-3 text-left flex-grow">
                            {pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0 ? (
                              pkg.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                                  <span className="font-semibold text-green-600">✓</span>
                                  <span>{feature}</span>
                                </div>
                              ))
                            ) : null}
                            {pkg.validityDays || pkg.noOfDays ? (
                              <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">✓</span>
                                <span>Validity: {pkg.validityDays || pkg.noOfDays} days</span>
                              </div>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            className="w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white py-2 px-4 rounded-lg font-semibold text-sm transition-colors mt-auto"
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

          {/* Inspection Form */}
          {!showPackageSelection && selectedPackage && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Request Car Inspection</h2>
                  {selectedPackage && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Selected Package: <span className="font-semibold">{selectedPackage.name || selectedPackage.bundleName}</span>
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPackageSelection(true);
                    setSelectedPackage(null);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Car Details */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <FaCar className="text-red-600 dark:text-red-500" />
                    Car Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Mileage (km)
                      </label>
                      <MileageInput
                        name="kmDriven"
                        value={formData.kmDriven}
                        onChange={handleInputChange}
                        placeholder="e.g., 50000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Engine Capacity
                      </label>
                      <EngineCapacityInput
                        name="engineCapacity"
                        value={formData.engineCapacity}
                        onChange={handleInputChange}
                        placeholder="e.g., 1300cc"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-600 dark:text-red-500" />
                    Location
                  </h2>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Inspection Location <span className="text-red-600">*</span>
                    </label>
                    <SearchableCitySelect
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="Select City"
                    />
                  </div>
                </div>

                {/* Inspection Date & Time */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-red-600 dark:text-red-500" />
                    Inspection Schedule
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Inspection Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        value={inspectionDate}
                        onChange={(e) => setInspectionDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <FaClock className="inline mr-2" />
                        Time Slot <span className="text-red-600">*</span>
                      </label>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          {availableTimeSlots.map(slot => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => {
                                setSelectedTimeSlot(slot);
                                setCantFindSlot(false);
                              }}
                              className={`px-4 py-2 border rounded-lg transition-colors ${selectedTimeSlot === slot && !cantFindSlot
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCantFindSlot(true);
                            setSelectedTimeSlot('');
                          }}
                          className={`w-full px-4 py-2 border rounded-lg transition-colors ${cantFindSlot
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                            }`}
                        >
                          Can't find suitable slot? Call to book
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes / Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Any additional information about your car or inspection requirements..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Payment Receipt */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <FaUpload className="inline mr-2" />
                    Payment Receipt (Optional, Max 3 images)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  {paymentReceiptImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {paymentReceiptImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Receipt ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
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

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {loading ? 'Submitting Request...' : 'Submit Inspection Request'}
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

export default Inspection;

