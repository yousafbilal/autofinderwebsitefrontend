import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaCalculator, FaCar, FaCalendarAlt, FaTachometerAlt, FaMapMarkerAlt, FaDollarSign, FaInfoCircle } from 'react-icons/fa';
import { carData } from '../Utils/carData';

function PriceCalculator() {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    variant: '',
    year: '',
    mileage: '',
    condition: 'excellent',
    city: ''
  });

  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [priceBreakdown, setPriceBreakdown] = useState(null);

  // Get all makes
  const makes = carData ? Object.keys(carData) : [];

  // Get models for selected make
  const models = formData.make && carData && carData[formData.make] 
    ? Object.keys(carData[formData.make].models || {}) 
    : [];

  // Get variants for selected model
  const variants = formData.make && formData.model && carData && carData[formData.make]?.models?.[formData.model]
    ? Object.keys(carData[formData.make].models[formData.model].variants || {})
    : [];

  // Get years for selected variant
  const years = formData.make && formData.model && formData.variant && carData &&
    carData[formData.make]?.models?.[formData.model]?.variants?.[formData.variant]
    ? carData[formData.make].models[formData.model].variants[formData.variant]
    : [];

  // Pakistani cities
  const cities = [
    "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan",
    "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Sargodha",
    "Bahawalpur", "Sukkur", "Abbottabad", "Mardan", "Swat", "Kasur"
  ].sort();

  const conditions = [
    { value: 'excellent', label: 'Excellent', depreciation: 0.05 },
    { value: 'very-good', label: 'Very Good', depreciation: 0.10 },
    { value: 'good', label: 'Good', depreciation: 0.15 },
    { value: 'fair', label: 'Fair', depreciation: 0.25 },
    { value: 'poor', label: 'Poor', depreciation: 0.40 }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Reset dependent fields when parent changes
      if (name === 'make') {
        newData.model = '';
        newData.variant = '';
        newData.year = '';
      } else if (name === 'model') {
        newData.variant = '';
        newData.year = '';
      } else if (name === 'variant') {
        newData.year = '';
      }
      
      return newData;
    });
    setCalculatedPrice(null);
    setPriceBreakdown(null);
  };

  const calculatePrice = () => {
    if (!formData.make || !formData.model || !formData.year || !formData.mileage || !formData.condition || !formData.city) {
      alert('Please fill in all required fields');
      return;
    }

    // Base price estimation
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(formData.year);
    
    // Base prices (in PKR) - simplified estimates
    const basePrices = {
      'Suzuki': {
        'Alto': 1500000,
        'Cultus': 2000000,
        'Wagon R': 1800000,
        'Swift': 3500000,
        'Mehran': 800000
      },
      'Honda': {
        'Civic': 4500000,
        'City': 3500000,
        'Accord': 6000000,
        'BR-V': 5000000
      },
      'Toyota': {
        'Corolla': 4000000,
        'Yaris': 3000000,
        'Camry': 7000000,
        'Fortuner': 10000000
      }
    };

    let basePrice = basePrices[formData.make]?.[formData.model] || 2000000;

    // Adjust for year (newer cars = higher base)
    if (age <= 1) {
      basePrice = basePrice * 1.1;
    } else if (age <= 3) {
      basePrice = basePrice * 1.0;
    } else if (age <= 5) {
      basePrice = basePrice * 0.9;
    } else if (age <= 10) {
      basePrice = basePrice * 0.7;
    } else {
      basePrice = basePrice * 0.5;
    }

    // Age-based depreciation (5% per year after first year)
    const ageDepreciation = Math.max(0, (age - 1) * 0.05);
    let price = basePrice * (1 - ageDepreciation);

    // Mileage depreciation
    const mileage = parseInt(formData.mileage) || 0;
    const mileageDepreciation = Math.min(0.3, mileage / 200000 * 0.3);
    price = price * (1 - mileageDepreciation);

    // Condition depreciation
    const conditionData = conditions.find(c => c.value === formData.condition);
    const conditionDepreciation = conditionData ? conditionData.depreciation : 0.15;
    price = price * (1 - conditionDepreciation);

    // City adjustment (major cities have higher demand)
    const majorCities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'];
    const cityMultiplier = majorCities.includes(formData.city) ? 1.05 : 1.0;
    price = price * cityMultiplier;

    // Round to nearest 10,000
    price = Math.round(price / 10000) * 10000;

    // Calculate breakdown
    const breakdown = {
      basePrice: Math.round(basePrice),
      ageDepreciation: Math.round(basePrice * ageDepreciation),
      mileageDepreciation: Math.round(basePrice * (1 - ageDepreciation) * mileageDepreciation),
      conditionDepreciation: Math.round(basePrice * (1 - ageDepreciation) * (1 - mileageDepreciation) * conditionDepreciation),
      cityAdjustment: Math.round((cityMultiplier - 1) * price),
      finalPrice: price
    };

    setCalculatedPrice(price);
    setPriceBreakdown(breakdown);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      <Helmet>
        <title>Price Calculator - Autofinder</title>
        <meta name="description" content="Calculate the estimated market price of your car based on make, model, year, mileage, and condition." />
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center justify-center gap-3">
              <FaCalculator className="text-red-600 dark:text-red-500" />
              Car Price Calculator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Get an estimated market price for your car based on various factors
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                <FaCar className="text-red-600 dark:text-red-500" />
                Car Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Make <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Select Make</option>
                    {makes.map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    disabled={!formData.make}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select Model</option>
                    {models.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                {variants.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Variant
                    </label>
                    <select
                      name="variant"
                      value={formData.variant}
                      onChange={handleChange}
                      disabled={!formData.model}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Variant (Optional)</option>
                      {variants.map(variant => (
                        <option key={variant} value={variant}>{variant}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-500" />
                    Year <span className="text-red-500">*</span>
                  </label>
                  {years.length > 0 ? (
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      disabled={!formData.model}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">Select Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      placeholder="e.g., 2020"
                      min="1980"
                      max={new Date().getFullYear() + 1}
                      disabled={!formData.model}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaTachometerAlt className="text-gray-500" />
                    Mileage (km) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleChange}
                    placeholder="e.g., 50000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Condition <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    {conditions.map(cond => (
                      <option key={cond.value} value={cond.value}>{cond.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-500" />
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={calculatePrice}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
                >
                  <FaCalculator />
                  Calculate Price
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                <FaDollarSign className="text-red-600 dark:text-red-500" />
                Estimated Price
              </h2>

              {calculatedPrice ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-center">
                    <p className="text-white text-sm mb-2">Estimated Market Price</p>
                    <p className="text-white text-4xl font-bold">{formatPrice(calculatedPrice)}</p>
                  </div>

                  {priceBreakdown && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Price Breakdown</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Base Price:</span>
                          <span className="font-medium">{formatPrice(priceBreakdown.basePrice)}</span>
                        </div>
                        <div className="flex justify-between text-red-600 dark:text-red-400">
                          <span>Age Depreciation:</span>
                          <span>-{formatPrice(priceBreakdown.ageDepreciation)}</span>
                        </div>
                        <div className="flex justify-between text-red-600 dark:text-red-400">
                          <span>Mileage Depreciation:</span>
                          <span>-{formatPrice(priceBreakdown.mileageDepreciation)}</span>
                        </div>
                        <div className="flex justify-between text-red-600 dark:text-red-400">
                          <span>Condition Depreciation:</span>
                          <span>-{formatPrice(priceBreakdown.conditionDepreciation)}</span>
                        </div>
                        {priceBreakdown.cityAdjustment > 0 && (
                          <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span>City Adjustment:</span>
                            <span>+{formatPrice(priceBreakdown.cityAdjustment)}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2 flex justify-between text-gray-800 dark:text-gray-200 font-semibold">
                          <span>Final Price:</span>
                          <span>{formatPrice(priceBreakdown.finalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FaInfoCircle className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                      <div className="text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-semibold mb-1">Note:</p>
                        <p>This is an estimated price based on market trends. Actual selling price may vary based on specific features, maintenance history, and market conditions. For a more accurate valuation, consider getting a professional inspection.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <FaCalculator className="text-6xl mx-auto mb-4 opacity-50" />
                  <p>Fill in the car details and click "Calculate Price" to get an estimated market value.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PriceCalculator;
