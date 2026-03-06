import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { Link } from 'react-router-dom';
import { server_ip } from '../Utils/Data';
import { carData } from '../Utils/carData';
import { useLanguage } from '../contexts/LanguageContext';
import { FaChevronRight, FaTimes } from 'react-icons/fa';

function CompareCars() {
  const { t } = useLanguage();

  const [selectedCars, setSelectedCars] = useState([null, null, null]); // 3 cars max
  const [allCars, setAllCars] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalCarIndex, setModalCarIndex] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [hotComparisons, setHotComparisons] = useState([]);

  // Modal state
  const [selectedMake, setSelectedMake] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  // Popular makes (PakWheels style)
  const popularMakes = ['Toyota', 'Suzuki', 'Honda', 'Daihatsu'];

  // Fetch all cars from backend
  useEffect(() => {
    const fetchAllCars = async () => {
      try {
        const API_URL = server_ip || 'http://localhost:8001';

        const [newCarsRes, freeAdsRes, featuredAdsRes] = await Promise.all([
          fetch(`${API_URL}/new_cars`),
          fetch(`${API_URL}/free_ads`),
          fetch(`${API_URL}/featured_ads`)
        ]);

        const newCars = newCarsRes.ok ? await newCarsRes.json() : [];
        const freeAds = freeAdsRes.ok ? await freeAdsRes.json() : [];
        const featuredAds = featuredAdsRes.ok ? await featuredAdsRes.json() : [];

        const combinedCars = [
          ...newCars
            .filter(car => car.status === 'active' && !car.isDeleted)
            .map(car => ({
              ...car,
              type: 'new',
              id: car._id || car.id,
              displayName: `${car.make} ${car.model}${car.variant ? ' ' + car.variant : ''}`,
              displayPrice: `PKR ${(car.price / 100000).toFixed(2)} ${t('lacs')}`,
              displayYear: car.year?.toString() || t('na'),
              displayTransmission: car.transmission || car.transmissionType || t('na'),
              displayPower: car.power || car.horsepower || t('na'),
              displayFuel: car.fuelType || t('na'),
              displaySeats: car.seatingCapacity || t('na'),
              image: car.image1
            })),
          ...freeAds
            .filter(car => car.isActive && !car.isDeleted && car.adStatus === 'approved')
            .map(car => ({
              ...car,
              type: 'used',
              id: car._id || car.id,
              displayName: `${car.make} ${car.model}${car.variant ? ' ' + car.variant : ''}`,
              displayPrice: `PKR ${(car.price / 100000).toFixed(2)} ${t('lacs')}`,
              displayYear: car.year?.toString() || t('na'),
              displayTransmission: (car.transmission || car.transmissionType) ? t((car.transmission || car.transmissionType).toLowerCase().replace(/[\s\-\/]/g, '')) : t('na'),
              displayPower: (car.engineCapacity || car.power || car.horsepower) || t('na'),
              displayFuel: car.fuelType ? t(car.fuelType.toLowerCase().replace(/[\s\-\/]/g, '')) : t('na'),
              displaySeats: (car.seatingCapacity || car.seats || '5').toString(),
              image: car.image1
            })),
          ...featuredAds
            .filter(car => car.isActive && !car.isDeleted && car.isFeatured === 'Approved')
            .map(car => ({
              ...car,
              type: 'used',
              id: car._id || car.id,
              displayName: `${car.make} ${car.model}${car.variant ? ' ' + car.variant : ''}`,
              displayPrice: `PKR ${(car.price / 100000).toFixed(2)} ${t('lacs')}`,
              displayYear: car.year?.toString() || t('na'),
              displayTransmission: (car.transmission || car.transmissionType) ? t((car.transmission || car.transmissionType).toLowerCase().replace(/[\s\-\/]/g, '')) : t('na'),
              displayPower: (car.engineCapacity || car.power || car.horsepower) || t('na'),
              displayFuel: car.fuelType ? t(car.fuelType.toLowerCase().replace(/[\s\-\/]/g, '')) : t('na'),
              displaySeats: (car.seatingCapacity || car.seats || '5').toString(),
              image: car.image1
            }))
        ];

        setAllCars(combinedCars);

        // Generate hot comparisons from available cars
        if (combinedCars.length >= 2) {
          const hot = [];
          for (let i = 0; i < Math.min(6, Math.floor(combinedCars.length / 2)); i++) {
            hot.push([combinedCars[i * 2], combinedCars[i * 2 + 1]]);
          }
          setHotComparisons(hot);
        }
      } catch (err) {
        console.error('Error fetching cars:', err);
      }
    };

    fetchAllCars();
  }, []);

  // Get all makes from carData
  const getAllMakes = () => {
    const makes = Object.keys(carData);
    const popular = makes.filter(make => popularMakes.includes(make));
    const others = makes.filter(make => !popularMakes.includes(make));
    return { popular, others };
  };

  // Get models for selected make
  const getModelsForMake = (make) => {
    if (!make || !carData[make]) return { popular: [], others: [] };
    const models = Object.keys(carData[make].models);
    // For simplicity, first 5 are popular
    const popular = models.slice(0, Math.min(5, models.length));
    const others = models.slice(5);
    return { popular, others };
  };

  // Get variants for selected make and model
  const getVariantsForModel = (make, model) => {
    if (!make || !model || !carData[make] || !carData[make].models[model]) return [];
    const variants = Object.keys(carData[make].models[model].variants);
    return variants;
  };

  // Get years for selected variant
  const getYearsForVariant = (make, model, variant) => {
    if (!make || !model || !variant || !carData[make] || !carData[make].models[model]) return [];
    return carData[make].models[model].variants[variant] || [];
  };

  // Open modal for car selection
  const openCarSelectionModal = (index) => {
    setModalCarIndex(index);
    setSelectedMake(null);
    setSelectedModel(null);
    setSelectedVariant(null);
    setSelectedYear(null);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedMake(null);
    setSelectedModel(null);
    setSelectedVariant(null);
    setSelectedYear(null);
  };

  // Handle Done button
  const handleDone = () => {
    if (!selectedMake || !selectedModel) {
      alert('Please select Make and Model');
      return;
    }

    // Try to find matching car with multiple fallback strategies
    let matchingCar = null;

    // Strategy 1: Exact match (make + model + variant + year)
    if (selectedVariant && selectedYear) {
      matchingCar = allCars.find(car =>
        car.make === selectedMake &&
        car.model === selectedModel &&
        car.variant === selectedVariant &&
        car.year?.toString() === selectedYear
      );
    }

    // Strategy 2: Match make + model + variant (ignore year)
    if (!matchingCar && selectedVariant) {
      matchingCar = allCars.find(car =>
        car.make === selectedMake &&
        car.model === selectedModel &&
        car.variant === selectedVariant
      );
    }

    // Strategy 3: Match make + model + year (ignore variant)
    if (!matchingCar && selectedYear) {
      matchingCar = allCars.find(car =>
        car.make === selectedMake &&
        car.model === selectedModel &&
        car.year?.toString() === selectedYear
      );
    }

    // Strategy 4: Match make + model only (use first available)
    if (!matchingCar) {
      matchingCar = allCars.find(car =>
        car.make === selectedMake &&
        car.model === selectedModel
      );
    }

    // Strategy 5: Match make only (use first available)
    if (!matchingCar) {
      matchingCar = allCars.find(car =>
        car.make === selectedMake
      );
    }

    // If still no match, create a basic object with available data
    if (!matchingCar) {
      matchingCar = {
        make: selectedMake,
        model: selectedModel,
        variant: selectedVariant || '',
        year: selectedYear ? parseInt(selectedYear) : null,
        displayName: `${selectedMake} ${selectedModel}${selectedVariant ? ' ' + selectedVariant : ''}`,
        displayPrice: t('na'),
        displayYear: selectedYear || t('na'),
        displayTransmission: t('na'),
        displayPower: t('na'),
        displayFuel: t('na'),
        displaySeats: t('na'),
        image: null,
        id: `temp-${Date.now()}`
      };
    } else {
      // Ensure displayName is set correctly
      matchingCar.displayName = `${selectedMake} ${selectedModel}${selectedVariant ? ' ' + selectedVariant : ''}`;
      // Update year if selected
      if (selectedYear) {
        matchingCar.year = parseInt(selectedYear);
        matchingCar.displayYear = selectedYear;
      }
    }

    const newSelected = [...selectedCars];
    newSelected[modalCarIndex] = matchingCar;
    setSelectedCars(newSelected);
    closeModal();
  };

  // Clear car
  const clearCar = (index) => {
    const newSelected = [...selectedCars];
    newSelected[index] = null;
    setSelectedCars(newSelected);
  };

  // Clear all
  const clearAll = () => {
    setSelectedCars([null, null, null]);
    setShowComparison(false);
  };

  // Build image URL
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3C/svg%3E';
    if (imagePath.startsWith('http')) return imagePath;
    const API_URL = server_ip || 'http://localhost:8001';
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_URL}/uploads/${cleanPath}`;
  };

  const specifications = [

    { label: t('price'), key: 'displayPrice' },
    { label: t('yearLabelField'), key: 'displayYear' },
    { label: t('transmission'), key: 'displayTransmission' },
    { label: t('engineType'), key: 'displayFuel' },
    { label: t('seatingCapacity'), key: 'displaySeats' },
    { label: t('bodyType'), key: 'bodyType' },
    { label: t('city'), key: 'location' }
  ];

  const hasSelectedCars = selectedCars.some(car => car !== null);
  const { popular: popularMakesList, others: otherMakesList } = getAllMakes();
  const { popular: popularModels, others: otherModels } = selectedMake ? getModelsForMake(selectedMake) : { popular: [], others: [] };
  const variants = selectedMake && selectedModel ? getVariantsForModel(selectedMake, selectedModel) : [];
  const years = selectedMake && selectedModel && selectedVariant ? getYearsForVariant(selectedMake, selectedModel, selectedVariant) : [];

  return (
    <>
      <Helmet>
        <title>Compare Cars - Auto Finder</title>
      </Helmet>


      <div className="bg-white dark:bg-gray-900 min-h-screen py-8 transition-colors">
        <div className="container mx-auto px-4">

          {/* Breadcrumbs */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-red-600 dark:hover:text-red-500">{t('home')}</Link>
            <span className="mx-2">/</span>
            <Link to="/latest-cars" className="hover:text-red-600 dark:hover:text-red-500">{t('latestCars')}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-gray-100">{t('compareCarsTitle')}</span>
          </div>

          {/* Title Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t('compareCarsTitle')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('compareCarsSubtitle')}
            </p>
          </div>

          {/* Selection Box - PakWheels Style */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              {/* Car Selection Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {[0, 1, 2].map((index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t('selectCar')}-{index + 1}
                      </label>
                      {index === 0 && selectedCars[0] && (
                        <Link
                          to="#"
                          onClick={(e) => {
                            e.preventDefault();
                            clearAll();
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {t('clear')}
                        </Link>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedCars[index] ? selectedCars[index].displayName : ''}
                        readOnly
                        onClick={() => openCarSelectionModal(index)}
                        placeholder={t('searchByMakeModelVersion')}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-100 cursor-pointer"
                      />
                      {selectedCars[index] && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearCar(index);
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Compare Button */}
              <button
                onClick={() => {
                  if (hasSelectedCars) {
                    setShowComparison(true);
                  }
                }}
                disabled={!hasSelectedCars}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-8 py-2.5 rounded-lg font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {t('compare')}
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          {showComparison && hasSelectedCars && (
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-x-auto mb-8">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>

                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 sticky left-0 bg-gray-100 dark:bg-gray-700 z-10">
                      {t('specification')}
                    </th>
                    {selectedCars.map((car, index) => {
                      if (!car) return null;
                      return (
                        <th key={index} className="px-4 py-3 text-center min-w-[180px]">
                          <div className="h-24 w-full bg-gray-200 dark:bg-gray-600 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                            <img
                              src={buildImageUrl(car.image)}
                              alt={car.displayName}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="100"%3E%3Crect fill="%23ddd" width="150" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="12" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                          <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">
                            {car.displayName}
                          </div>
                          {car.displayPrice && car.displayPrice !== 'N/A' && (
                            <div className="text-xs text-red-600 dark:text-red-500 font-semibold">
                              {car.displayPrice}
                            </div>
                          )}
                        </th>

                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {specifications.map((spec, index) => (

                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                    >
                      <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 sticky left-0 bg-inherit z-10">
                        {spec.label}
                      </td>
                      {selectedCars.map((car, carIndex) => {
                        if (!car) return null;
                        return (
                          <td key={carIndex} className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                            {car[spec.key] || 'N/A'}
                          </td>

                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          )}

          {/* Hot Car Comparisons Section */}
          {hotComparisons.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {t('hotComparisons')}
              </h2>
              <div className="relative">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                    {hotComparisons.map((comparison, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 min-w-[400px] cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => {
                          setSelectedCars([comparison[0], comparison[1], null]);
                          setShowComparison(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <div className="flex items-center gap-4">
                          {/* Car 1 */}
                          <div className="flex-1 text-center">
                            <div className="h-24 bg-gray-200 dark:bg-gray-600 rounded-lg mb-2 overflow-hidden">
                              <img
                                src={buildImageUrl(comparison[0]?.image)}
                                alt={comparison[0]?.displayName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="100"%3E%3Crect fill="%23ddd" width="150" height="100"/%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                            <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                              {comparison[0]?.displayName}
                            </div>
                            <div className="text-xs text-red-600 dark:text-red-500 font-semibold mt-1">
                              {comparison[0]?.displayPrice}
                            </div>
                          </div>

                          {/* VS */}
                          <div className="text-xl font-bold text-gray-400 dark:text-gray-500">
                            {t('vs')}
                          </div>

                          {/* Car 2 */}
                          <div className="flex-1 text-center">
                            <div className="h-24 bg-gray-200 dark:bg-gray-600 rounded-lg mb-2 overflow-hidden">
                              <img
                                src={buildImageUrl(comparison[1]?.image)}
                                alt={comparison[1]?.displayName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="100"%3E%3Crect fill="%23ddd" width="150" height="100"/%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                            <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                              {comparison[1]?.displayName}
                            </div>
                            <div className="text-xs text-red-600 dark:text-red-500 font-semibold mt-1">
                              {comparison[1]?.displayPrice}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* PakWheels Style Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close modal"
            >
              <FaTimes className="w-6 h-6" />
            </button>


            {/* Modal Content - Three Columns */}
            <div className="flex flex-1 overflow-hidden">
              {/* Column 1: MAKE */}
              <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 uppercase text-sm">{t('make')}</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {/* Popular Makes */}
                  {popularMakesList.length > 0 && (
                    <div className="px-4 py-2">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('popular')}</div>
                      {popularMakesList.map((make) => (
                        <div
                          key={make}
                          onClick={() => {
                            setSelectedMake(make);
                            setSelectedModel(null);
                            setSelectedVariant(null);
                            setSelectedYear(null);
                          }}
                          className={`flex items-center justify-between px-3 py-2 mb-1 rounded cursor-pointer transition ${selectedMake === make
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                            }`}
                        >
                          <span className="text-sm">{make}</span>
                          <FaChevronRight className="w-3 h-3" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Other Makes */}
                  {otherMakesList.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('others')}</div>
                      {otherMakesList.map((make) => (
                        <div
                          key={make}
                          onClick={() => {
                            setSelectedMake(make);
                            setSelectedModel(null);
                            setSelectedVariant(null);
                            setSelectedYear(null);
                          }}
                          className={`flex items-center justify-between px-3 py-2 mb-1 rounded cursor-pointer transition ${selectedMake === make
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                            }`}
                        >
                          <span className="text-sm">{make}</span>
                          <FaChevronRight className="w-3 h-3" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: MODEL */}
              <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 uppercase text-sm">{t('model')}</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {selectedMake ? (
                    <>
                      {/* Popular Models */}
                      {popularModels.length > 0 && (
                        <div className="px-4 py-2">
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('popular')}</div>
                          {popularModels.map((model) => (
                            <div
                              key={model}
                              onClick={() => {
                                setSelectedModel(model);
                                setSelectedVariant(null);
                                setSelectedYear(null);
                              }}
                              className={`flex items-center justify-between px-3 py-2 mb-1 rounded cursor-pointer transition ${selectedModel === model
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                                }`}
                            >
                              <span className="text-sm">{model}</span>
                              <FaChevronRight className="w-3 h-3" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Other Models */}
                      {otherModels.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('others')}</div>
                          {otherModels.map((model) => (
                            <div
                              key={model}
                              onClick={() => {
                                setSelectedModel(model);
                                setSelectedVariant(null);
                                setSelectedYear(null);
                              }}
                              className={`flex items-center justify-between px-3 py-2 mb-1 rounded cursor-pointer transition ${selectedModel === model
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                                }`}
                            >
                              <span className="text-sm">{model}</span>
                              <FaChevronRight className="w-3 h-3" />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                      {t('selectMakeFirst')}
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: VERSION (OPTIONAL) */}
              <div className="w-1/3 flex flex-col">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 uppercase text-sm">
                    {t('versionOptional')}
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {selectedMake && selectedModel ? (
                    <>
                      {variants.length > 0 ? (
                        variants.map((variant) => (
                          <div
                            key={variant}
                            onClick={() => {
                              setSelectedVariant(variant);
                              setSelectedYear(null);
                            }}
                            className={`px-4 py-2 mb-1 cursor-pointer transition ${selectedVariant === variant
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                              }`}
                          >
                            <div className="text-sm">{variant}</div>
                            {selectedVariant === variant && years.length > 0 && (
                              <div className="mt-2 pl-4">
                                {years.map((year) => (
                                  <div
                                    key={year}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedYear(year);
                                    }}
                                    className={`px-2 py-1 mb-1 rounded text-xs cursor-pointer transition ${selectedYear === year
                                      ? 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100'
                                      : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                                      }`}
                                  >
                                    {year}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                          {t('noVariantsAvailable')}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                      {t('selectMakeAndModelFirst')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Done Button */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-center">
              <button
                onClick={handleDone}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-8 py-2 rounded-lg font-semibold transition"
              >
                {t('done')}
              </button>
            </div>
          </div>
        </div>

      )}
    </>
  );
}

export default CompareCars;

