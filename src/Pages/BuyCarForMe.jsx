import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { server_ip } from '../Utils/Data';
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

// Searchable dropdowns for Make / Model / Variant
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

function BuyCarForMe() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Multiple cars support
  const [carChoices, setCarChoices] = useState([]);
  const [showAddCar, setShowAddCar] = useState(false);
  const [newCar, setNewCar] = useState({
    make: '',
    model: '',
    variant: '',
    year: '',
  });

  const [form, setForm] = useState({
    location: '',
    registrationCity: '',
    make: '',
    model: '',
    variant: '',
    year: '',
    priceFrom: '',
    priceTo: '',
    transmission: '',
    preferredContact: 'phone',
    description: '',
  });

  const [paymentReceipt, setPaymentReceipt] = useState(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.info('Please login to use this service');
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

  const handleAddCar = () => {
    if (!newCar.make || !newCar.model) {
      toast.error('Please select Make and Model');
      return;
    }
    const car = {
      make: newCar.make,
      model: newCar.model,
      variant: newCar.variant || undefined,
      year: newCar.year || form.year || undefined,
    };
    setCarChoices((prev) => {
      const exists = prev.some(
        (c) => c.make === car.make && c.model === car.model && c.variant === car.variant
      );
      if (exists) {
        toast.error('This car is already added');
        return prev;
      }
      return [...prev, car];
    });
    // Update form with all cars
    updateFormFromCars([...carChoices, car]);
    setNewCar({ make: '', model: '', variant: '', year: '' });
    setShowAddCar(false);
  };

  const handleRemoveCar = (index) => {
    const updated = carChoices.filter((_, i) => i !== index);
    setCarChoices(updated);
    updateFormFromCars(updated);
  };

  const updateFormFromCars = (cars) => {
    if (cars.length === 0) {
      setForm((prev) => ({ ...prev, make: '', model: '', variant: '' }));
      return;
    }
    const makes = Array.from(new Set(cars.map((c) => c.make))).join(',');
    const models = cars
      .map((c) => `${c.make} ${c.model}${c.variant ? ' ' + c.variant : ''}`)
      .join(',');
    setForm((prev) => ({ ...prev, make: makes, model: models }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.info('Please login to use this service');
      navigate('/signin');
      return;
    }

    if (!form.location || !form.priceFrom || !form.priceTo) {
      setError('Please fill in all required fields.');
      return;
    }
    if (carChoices.length === 0 && (!form.make || !form.model)) {
      setError('Please add at least one car or fill in Make and Model.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const API_URL = server_ip || 'http://localhost:8001';
      const formData = new FormData();

      formData.append('userId', userId);
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      // Add carChoices as JSON
      if (carChoices.length > 0) {
        formData.append('carChoices', JSON.stringify(carChoices));
      }

      if (paymentReceipt) {
        formData.append('paymentReceipt', paymentReceipt);
      }

      const response = await fetch(`${API_URL}/buy_car-for_me`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to submit request');
      }

      setSuccess('Your Buy Car For Me request has been submitted successfully. Our team will contact you soon.');
      setForm({
        location: '',
        registrationCity: '',
        make: '',
        model: '',
        variant: '',
        year: '',
        priceFrom: '',
        priceTo: '',
        transmission: '',
        preferredContact: 'phone',
        description: '',
      });
      setCarChoices([]);
      setNewCar({ make: '', model: '', variant: '', year: '' });
      setPaymentReceipt(null);

      // Show toast and redirect to home after short delay
      toast.success('Your Buy Car For Me request has been submitted successfully. Our team will contact you soon.');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Buy Car For Me error:', err);
      const message = err.message || 'Failed to submit request';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Autofinder Buy Car For Me Service</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
            Autofinder BUY CAR FOR ME
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Fill this form and our expert team will find the best car for you based on your budget and requirements.
            Your request will automatically appear in the admin dashboard just like the mobile app.
          </p>

          {/* Service Fee Information */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">
              Service Fee Structure
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <span className="text-red-600 dark:text-red-400 font-bold">₹</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Initial Payment</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">One-time upfront fee</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">PKR 5,000</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">%</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Commission</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Of final sale price</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">1%</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                <span className="font-semibold">Example:</span> For a car sold at PKR 1,000,000, commission would be PKR 10,000
              </p>
            </div>
          </div>

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

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 space-y-6">
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

            {/* Multiple Cars Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Car(s) <span className="text-red-600">*</span>
              </label>

              {/* Display selected cars as chips */}
              {carChoices.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {carChoices.map((car, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800"
                    >
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        {car.make} {car.model}
                        {car.variant && ` ${car.variant}`}
                        {car.year && ` (${car.year})`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCar(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 ml-1"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Car Button */}
              <button
                type="button"
                onClick={() => setShowAddCar(!showAddCar)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-red-500 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors mb-4"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add Car</span>
              </button>

              {/* Add Car Form */}
              {showAddCar && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Make <span className="text-red-600">*</span>
                      </label>
                      <SearchableMakeSelect
                        name="newCarMake"
                        value={newCar.make}
                        onChange={(e) => setNewCar((prev) => ({ ...prev, make: e.target.value, model: '', variant: '' }))}
                        required
                        placeholder="Select Make"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Model <span className="text-red-600">*</span>
                      </label>
                      <SearchableModelSelect
                        name="newCarModel"
                        value={newCar.model}
                        onChange={(e) => setNewCar((prev) => ({ ...prev, model: e.target.value, variant: '' }))}
                        selectedMake={newCar.make}
                        required
                        placeholder="Select Model"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Variant</label>
                      <SearchableVariantSelect
                        name="newCarVariant"
                        value={newCar.variant}
                        onChange={(e) => setNewCar((prev) => ({ ...prev, variant: e.target.value }))}
                        selectedMake={newCar.make}
                        selectedModel={newCar.model}
                        placeholder="Select Variant"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Year</label>
                      <input
                        type="number"
                        value={newCar.year}
                        onChange={(e) => setNewCar((prev) => ({ ...prev, year: e.target.value }))}
                        placeholder={form.year || "e.g., 2018"}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddCar}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Add Car
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCar(false);
                        setNewCar({ make: '', model: '', variant: '', year: '' });
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Legacy single car form (if no cars added yet) */}
              {carChoices.length === 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Transmission</label>
                      <select
                        name="transmission"
                        value={form.transmission}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Any</option>
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Year and Transmission (if cars are added) */}
              {carChoices.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Transmission</label>
                    <select
                      name="transmission"
                      value={form.transmission}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Any</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Budget From (PKR) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="priceFrom"
                  value={form.priceFrom}
                  onChange={handleChange}
                  placeholder="e.g., 1500000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Budget To (PKR) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="priceTo"
                  value={form.priceTo}
                  onChange={handleChange}
                  placeholder="e.g., 2500000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preferred Contact</label>
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
                  Payment Receipt (optional)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setPaymentReceipt(e.target.files[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Additional Requirements
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us more about what kind of car you are looking for..."
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
                {loading ? 'Submitting Request...' : 'Submit Buy Car For Me Request'}
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
    </>
  );
}

export default BuyCarForMe;