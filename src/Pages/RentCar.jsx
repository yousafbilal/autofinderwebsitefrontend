import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaChevronDown, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';
import { carData } from '../Utils/carData';
import { pakistaniCities } from '../Utils/pakistaniCities';

// Searchable city dropdown
const SearchableCitySelect = ({ value, onChange, name, required = false, placeholder = "Select City" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const allCities = pakistaniCities.map(c => c.city || c.name || c).filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => a.localeCompare(b));

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
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">
                No city found
              </div>
            )}
          </div>
        </div>
      )}
      {required && !value && <input type="hidden" required />}
    </div>
  );
};

// Searchable dropdowns for Make / Model / Variant (same behaviour as app)
const SearchableMakeSelect = ({ value, onChange, name, required = false, placeholder = "Select Make" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const makes = Object.keys(carData).sort((a, b) => a.localeCompare(b));
  const filteredMakes = makes.filter((make) =>
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
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">
                No make found
              </div>
            )}
          </div>
        </div>
      )}
      {required && !value && <input type="hidden" required />}
    </div>
  );
};

const SearchableModelSelect = ({
  value,
  onChange,
  name,
  selectedMake,
  required = false,
  placeholder = "Select Model",
}) => {
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
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">
                No model found
              </div>
            )}
          </div>
        </div>
      )}
      {required && !value && <input type="hidden" required />}
    </div>
  );
};

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
  const dropdownRef = useRef(null);

  const variants =
    selectedMake &&
      selectedModel &&
      carData[selectedMake]?.models[selectedModel]
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
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">
                No variant found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function RentCar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if coming from dealer package (My Packages page)
  const dealerPackageId = location.state?.dealerPackageId || null;
  const purchaseId = location.state?.purchaseId || null;
  const skipPayment = location.state?.skipPayment || false;
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: '',
    category: '',
    location: '',
    make: '',
    model: '',
    variant: '',
    year: '',
    registrationCity: '',
    price: '',
    bodyType: '',
    bodyColor: '',
    kmDriven: '',
    preferredContact: 'phone',
    fuelType: '',
    engineCapacity: '',
    availabilityType: 'day',
    availabilityDates: '',
    description: '',
    transmission: 'Automatic',
    assembly: 'Local',
    paymenttype: '',
    documents: '',
    drivingtype: '',
  });

  const [features, setFeatures] = useState({
    AirConditioning: false,
    PowerSteering: false,
    PowerWindows: false,
    ABS: false,
    Airbags: false,
    GPS: false,
  });

  const [images, setImages] = useState([]);
  const [paymentReceipt, setPaymentReceipt] = useState(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.info('Please login to post an ad');
      navigate('/signin');
      return;
    }
    try {
      const userData = JSON.parse(userStr);
      setUserId(userData._id || userData.userId || null);
    } catch {
      navigate('/signin');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (e) => {
    const { name, checked } = e.target;
    setFeatures((prev) => ({ ...prev, [name]: checked }));
  };

  // Image compression function - very aggressive compression to prevent timeout
  const compressImage = (file, maxWidth = 500, maxHeight = 500, quality = 0.4) => {
    return new Promise((resolve) => {
      // Check file size first - if already small, skip compression
      if (file.size < 100 * 1024) { // Less than 100KB
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                console.log(`📸 Compressed ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(blob.size / 1024).toFixed(0)}KB`);
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    const filesToProcess = files.slice(0, 3); // Limit to 3 images max to prevent timeout

    // Compress images before setting state
    try {
      console.log(`🔄 Compressing ${filesToProcess.length} images...`);
      const compressedFiles = await Promise.all(
        filesToProcess.map(file => compressImage(file, 500, 500, 0.4))
      );
      setImages(compressedFiles);
      const totalSize = compressedFiles.reduce((sum, file) => sum + (file.size || 0), 0);
      console.log(`✅ Compression complete. Total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    } catch (error) {
      console.error('Error compressing images:', error);
      setImages(filesToProcess);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.info('Please login to post an ad');
      navigate('/signin');
      return;
    }

    if (!form.title || !form.location || !form.make || !form.model || !form.year || !form.price) {
      setError('Please fill in all required fields.');
      return;
    }

    if (images.length === 0) {
      setError('Please upload at least one image of the car.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Re-compress images one more time before upload to ensure they're very small
      console.log('🔄 Final compression before upload...');
      const finalCompressedImages = await Promise.all(
        images.slice(0, 2).map(file => compressImage(file, 500, 500, 0.4))
      );
      const finalTotalSize = finalCompressedImages.reduce((sum, file) => sum + (file.size || 0), 0);
      console.log(`📦 Final compressed size: ${(finalTotalSize / 1024 / 1024).toFixed(2)}MB`);

      if (finalTotalSize > 2 * 1024 * 1024) { // More than 2MB
        setError('Images are still too large after compression. Please use smaller images or fewer images.');
        setLoading(false);
        return;
      }

      const API_URL = server_ip || 'http://localhost:8001';
      const formData = new FormData();

      formData.append('userId', userId);
      formData.append('location', form.location || '');
      formData.append('title', form.title || '');
      formData.append('make', form.make || '');
      formData.append('model', form.model || '');
      formData.append('variant', form.variant || '');
      formData.append('bodyType', form.bodyType || '');
      formData.append('category', form.category || '');
      formData.append('preferredContact', form.preferredContact || 'phone');
      formData.append('year', form.year || '');
      formData.append('registrationCity', form.registrationCity || '');
      formData.append('price', form.price || '');
      formData.append('bodyColor', form.bodyColor || '');
      formData.append('kmDriven', form.kmDriven || '');
      formData.append('fuelType', form.fuelType || '');
      formData.append('engineCapacity', form.engineCapacity || '');
      formData.append('description', form.description || '');
      formData.append('transmission', form.transmission || 'Automatic');
      formData.append('assembly', form.assembly || 'Local');
      formData.append('paymenttype', form.paymenttype || '');
      formData.append('documents', form.documents || '');
      formData.append('drivingtype', form.drivingtype || '');

      // Add availabilityType and availabilityDates (same as mobile app)
      if (form.availabilityType) {
        formData.append('availabilityType', form.availabilityType);
      }
      if (form.availabilityDates && form.availabilityDates.trim()) {
        // Send as JSON string because backend expects array
        formData.append('availabilityDates', JSON.stringify([form.availabilityDates.trim()]));
      }

      // Send features as comma-separated string (backend expects string that it splits)
      const selectedFeatures = Object.keys(features).filter((key) => features[key]);
      if (selectedFeatures.length > 0) {
        formData.append('features', selectedFeatures.join(','));
      }

      // Use final compressed images - limit to 2 images max
      const maxImages = 2;
      const imagesToUpload = finalCompressedImages.slice(0, maxImages);

      // Calculate total size
      let totalSize = 0;
      imagesToUpload.forEach((image, index) => {
        formData.append(`image${index + 1}`, image);
        totalSize += image.size || 0;
      });

      console.log(`📸 Uploading ${imagesToUpload.length} images (max ${maxImages}), total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);

      if (totalSize > 1.5 * 1024 * 1024) { // More than 1.5MB
        setError('Total image size is too large. Please reduce the number of images or use smaller files.');
        setLoading(false);
        return;
      }

      if (imagesToUpload.length === 0) {
        setError('Please upload at least one image of the car.');
        setLoading(false);
        return;
      }

      if (paymentReceipt) {
        formData.append('paymentReceipt', paymentReceipt);
      }

      console.log('📤 Sending rent car request to:', `${API_URL}/rent_car`);
      console.log('📋 Form data keys:', Array.from(formData.keys()));

      // Create AbortController for timeout - 90 seconds for image uploads
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏱️ Request timeout after 90 seconds');
        controller.abort();
      }, 90000); // 90 seconds

      let response;
      try {
        response = await fetchWithRetry(`${API_URL}/rent_car`, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please try again with 1-2 smaller images (under 500KB each).');
        }
        throw fetchError;
      }

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = 'Failed to submit rent car ad';
        let errorDetails = null;
        try {
          const errorData = await response.json();
          console.error('❌ Error response:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorDetails = errorData.details || errorData.errors || null;
        } catch (e) {
          const text = await response.text();
          console.error('❌ Error response text:', text);
          errorMessage = text || errorMessage;
        }
        const fullError = errorDetails ? `${errorMessage} - ${JSON.stringify(errorDetails)}` : errorMessage;
        throw new Error(fullError);
      }

      const result = await response.json();

      const successMessage = result.message || 'Your Car On Rent ad has been created successfully. It will appear in admin dashboard like the app.';
      setSuccess(successMessage);
      toast.success(successMessage);
      setForm({
        title: '',
        category: '',
        location: '',
        make: '',
        model: '',
        variant: '',
        year: '',
        registrationCity: '',
        price: '',
        bodyType: '',
        bodyColor: '',
        kmDriven: '',
        preferredContact: 'phone',
        fuelType: '',
        engineCapacity: '',
        availabilityType: 'day',
        availabilityDates: '',
        description: '',
        transmission: 'Automatic',
        assembly: 'Local',
        paymenttype: '',
        documents: '',
        drivingtype: '',
      });
      setFeatures({
        AirConditioning: false,
        PowerSteering: false,
        PowerWindows: false,
        ABS: false,
        Airbags: false,
        GPS: false,
      });
      setImages([]);
      setPaymentReceipt(null);
    } catch (err) {
      console.error('Rent Car error:', err);
      let message = err.message || 'Failed to submit rent car ad';

      // Handle specific error types
      if (err.name === 'AbortError') {
        message = 'Request timed out. Please try again with fewer images or smaller file sizes.';
      } else if (err.message && err.message.includes('Failed to fetch')) {
        message = 'Network error. Please check your connection and try again.';
      } else if (err.message && err.message.includes('504')) {
        message = 'Server timeout. Please try again with fewer images.';
      }

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Autofinder Car On Rent Service</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-6 transition-colors">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">
            Autofinder CAR ON RENT
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Post your car for rent with Autofinder. Fill the details below and your rental ad will appear in the admin
            dashboard, exactly like in the mobile app.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Rent Car Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Post Car for Rent</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g., Toyota Corolla for Rent"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g., Self Drive / With Driver"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Location <span className="text-red-600">*</span>
                  </label>
                  <SearchableCitySelect
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="Select City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Registration City
                  </label>
                  <SearchableCitySelect
                    name="registrationCity"
                    value={form.registrationCity}
                    onChange={handleChange}
                    placeholder="Select Registration City"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Make <span className="text-red-600">*</span>
                  </label>
                  <SearchableMakeSelect
                    name="make"
                    value={form.make}
                    onChange={handleChange}
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
                    value={form.model}
                    onChange={handleChange}
                    selectedMake={form.make}
                    required
                    placeholder="Select Model"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Variant</label>
                  <SearchableVariantSelect
                    name="variant"
                    value={form.variant}
                    onChange={handleChange}
                    selectedMake={form.make}
                    selectedModel={form.model}
                    placeholder="Select Variant"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Year <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    placeholder="e.g., 2018"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Price per day / week / month (PKR) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="e.g., 5000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Availability Type</label>
                  <select
                    name="availabilityType"
                    value={form.availabilityType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="day">Per Day</option>
                    <option value="week">Per Week</option>
                    <option value="month">Per Month</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Body Type</label>
                  <input
                    type="text"
                    name="bodyType"
                    value={form.bodyType}
                    onChange={handleChange}
                    placeholder="e.g., Sedan / SUV"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Body Color</label>
                  <input
                    type="text"
                    name="bodyColor"
                    value={form.bodyColor}
                    onChange={handleChange}
                    placeholder="e.g., White"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">KM Driven</label>
                  <input
                    type="number"
                    name="kmDriven"
                    value={form.kmDriven}
                    onChange={handleChange}
                    placeholder="e.g., 45000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fuel Type</label>
                  <input
                    type="text"
                    name="fuelType"
                    value={form.fuelType}
                    onChange={handleChange}
                    placeholder="e.g., Petrol / Diesel / Hybrid"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Engine Capacity</label>
                  <input
                    type="text"
                    name="engineCapacity"
                    value={form.engineCapacity}
                    onChange={handleChange}
                    placeholder="e.g., 1300"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Transmission</label>
                  <select
                    name="transmission"
                    value={form.transmission}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Assembly</label>
                  <select
                    name="assembly"
                    value={form.assembly}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Local">Local</option>
                    <option value="Imported">Imported</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Contact
                  </label>
                  <select
                    name="preferredContact"
                    value={form.preferredContact}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="phone">Phone</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Availability Dates
                  </label>
                  <input
                    type="text"
                    name="availabilityDates"
                    value={form.availabilityDates}
                    onChange={handleChange}
                    placeholder="e.g., 1-15 Jan, Weekends only"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Features</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700 dark:text-gray-300">
                  {Object.keys(features).map((key) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name={key}
                        checked={features[key]}
                        onChange={handleFeatureChange}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span>{key}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Images (Recommended: 1-2 images, max 3)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ⚠️ For faster upload, use 1-2 small images (under 500KB each). Images will be automatically compressed.
                </p>
                {images.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Selected: {images.length} image(s)</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Payment Type (optional)
                  </label>
                  <input
                    type="text"
                    name="paymenttype"
                    value={form.paymenttype}
                    onChange={handleChange}
                    placeholder="e.g., Cash / Bank Transfer"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                {/* Payment Receipt - Hide if using dealer package */}
                {!skipPayment && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Payment Receipt (optional for paid ads)
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setPaymentReceipt(e.target.files[0] || null)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                )}
              </div>

              {/* Dealer Package Info */}
              {skipPayment && dealerPackageId && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    ✓ Using your active dealer package. Payment receipt not required.
                  </p>
                </div>
              )}

              {/* Hide Payment Receipt if using dealer package */}
              {skipPayment && dealerPackageId && (
                <div className="hidden">
                  {/* Payment receipt hidden when using dealer package */}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Documents (optional)
                  </label>
                  <input
                    type="text"
                    name="documents"
                    value={form.documents}
                    onChange={handleChange}
                    placeholder="e.g., CNIC + License copy required"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Driving Type</label>
                  <input
                    type="text"
                    name="drivingtype"
                    value={form.drivingtype}
                    onChange={handleChange}
                    placeholder="e.g., Self Drive / With Driver"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Additional Details
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Write additional details, terms and conditions, etc."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white py-3 rounded-lg font-semibold transition-colors ${loading ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                >
                  {loading ? 'Posting Ad...' : 'Post Car On Rent Ad'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/my-ads')}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default RentCar;