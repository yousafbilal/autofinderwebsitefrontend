import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaCog, FaBolt, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import PriceRangeDropdown from '../Components/PriceRangeDropdown';
import MileageRangeDropdown from '../Components/MileageRangeDropdown';
import VoiceSearchComp from '../Components/VoiceSearch';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';
import { useLanguage } from '../contexts/LanguageContext';

function LatestCars() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [selectedMakes, setSelectedMakes] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Price Range filters
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');

  // Year filters
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  // Mileage filters
  const [mileageFrom, setMileageFrom] = useState('');
  const [mileageTo, setMileageTo] = useState('');

  // Registered In filters
  const [selectedRegisteredIn, setSelectedRegisteredIn] = useState([]);

  // Trusted Cars filters
  const [selectedTrustedCars, setSelectedTrustedCars] = useState([]);

  // Transmission filters
  const [selectedTransmissions, setSelectedTransmissions] = useState([]);

  // Color filters
  const [selectedColors, setSelectedColors] = useState([]);

  // Engine Type filters
  const [selectedEngineTypes, setSelectedEngineTypes] = useState([]);

  // Engine Capacity filters
  const [engineCapacityFrom, setEngineCapacityFrom] = useState('');
  const [engineCapacityTo, setEngineCapacityTo] = useState('');

  // Assembly filters
  const [selectedAssemblies, setSelectedAssemblies] = useState([]);

  // Body Type filters
  const [selectedBodyTypes, setSelectedBodyTypes] = useState([]);

  // Number of Doors filters
  const [selectedDoors, setSelectedDoors] = useState([]);

  // Seating Capacity filters
  const [selectedSeatingCapacities, setSelectedSeatingCapacities] = useState([]);

  // Collapsible sections state
  const [isCityOpen, setIsCityOpen] = useState(false);
  const cityScrollRef = useRef(null);
  const [cityPage, setCityPage] = useState(0);
  const citiesPerPage = 12;
  const [isProvinceOpen, setIsProvinceOpen] = useState(false);
  const [isMakeOpen, setIsMakeOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isPriceRangeOpen, setIsPriceRangeOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMileageOpen, setIsMileageOpen] = useState(false);
  const [isRegisteredInOpen, setIsRegisteredInOpen] = useState(false);
  const [isTrustedCarsOpen, setIsTrustedCarsOpen] = useState(false);
  const [isTransmissionOpen, setIsTransmissionOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isEngineTypeOpen, setIsEngineTypeOpen] = useState(false);
  const [isEngineCapacityOpen, setIsEngineCapacityOpen] = useState(false);
  const [isAssemblyOpen, setIsAssemblyOpen] = useState(false);
  const [isBodyTypeOpen, setIsBodyTypeOpen] = useState(false);
  const [isDoorsOpen, setIsDoorsOpen] = useState(false);
  const [isSeatingCapacityOpen, setIsSeatingCapacityOpen] = useState(false);

  // Price suggestions for cars
  const carPriceSuggestions = [
    200000, 400000, 600000, 800000, 1000000, 1200000, 1400000, 1600000, 1800000, 2000000,
    2500000, 3000000, 3500000, 4000000, 4500000, 5000000, 6000000, 7000000, 8000000, 9000000,
    10000000, 15000000, 20000000, 25000000, 30000000, 40000000, 50000000
  ];

  // Mileage suggestions for cars
  const carMileageSuggestions = [
    5000, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000,
    125000, 150000, 175000, 200000, 250000
  ];

  // Pakistani cities
  const cities = [
    'All',
    'Karachi',
    'Lahore',
    'Islamabad',
    'Rawalpindi',
    'Peshawar',
    'Faisalabad',
    'Multan',
    'Gujranwala',
    'Sialkot',
    'Sargodha',
    'Abbottabad',
    'Hyderabad'
  ];

  // Read URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const budget = searchParams.get('budget');
    const make = searchParams.get('make');
    const city = searchParams.get('city');

    // Set or clear state based on URL params
    setSelectedBudget(budget || '');
    setSelectedMake(make || '');
    setSelectedCity(city || '');
  }, [location.search]);

  // Price ranges mapping - memoized to prevent unnecessary re-renders
  const priceRanges = useMemo(() => ({
    'Under 5 Lakh': { min: 0, max: 500000 },
    '5-10 Lakh': { min: 500000, max: 1000000 },
    '10-15 Lakh': { min: 1000000, max: 1500000 },
    '15-20 Lakh': { min: 1500000, max: 2000000 },
    '20-30 Lakh': { min: 2000000, max: 3000000 },
    '30-50 Lakh': { min: 3000000, max: 5000000 },
    '50-75 Lakh': { min: 5000000, max: 7500000 },
    '75 Lakh - 1 Crore': { min: 7500000, max: 10000000 },
    'Above 1 Crore': { min: 10000000, max: Infinity }
  }), []);

  // Helper function to get city counts
  const getCityCounts = () => {
    const counts = {};
    cities.forEach(city => {
      if (city === 'All') return;
      counts[city] = cars.filter(car => {
        const carLocation = (car.location || '').toString().toLowerCase().trim();
        return carLocation === city.toLowerCase() || carLocation.includes(city.toLowerCase());
      }).length;
    });
    return counts;
  };

  // Helper function to get province counts
  const getProvinceCounts = () => {
    const provinceMap = {
      'Punjab': ['Lahore', 'Rawalpindi', 'Faisalabad', 'Multan', 'Sialkot', 'Gujranwala', 'Sargodha'],
      'Sindh': ['Karachi', 'Hyderabad'],
      'KPK': ['Peshawar'],
      'Balochistan': ['Quetta'],
      'Azad Kashmir': [],
      'Federally Administered Tribal Areas': []
    };

    const counts = {};
    Object.keys(provinceMap).forEach(province => {
      const citiesInProvince = provinceMap[province];
      counts[province] = cars.filter(car => {
        const carLocation = (car.location || '').toString().toLowerCase().trim();
        return citiesInProvince.some(city =>
          carLocation === city.toLowerCase() || carLocation.includes(city.toLowerCase())
        );
      }).length;
    });
    return counts;
  };

  // Helper function to get make counts
  const getMakeCounts = () => {
    const counts = {};
    const allMakes = [...new Set(cars.map(car => car.make).filter(Boolean))];
    allMakes.forEach(make => {
      counts[make] = cars.filter(car => car.make === make).length;
    });
    return Object.fromEntries(
      Object.entries(counts).sort((a, b) => b[1] - a[1])
    );
  };

  // Helper function to get registered in counts
  const getRegisteredInCounts = () => {
    const registeredInOptions = ['Punjab', 'Sindh', 'Islamabad', 'Lahore', 'Karachi'];
    const counts = {};
    registeredInOptions.forEach(reg => {
      counts[reg] = cars.filter(car => {
        const registrationCity = (car.registrationCity || car.location || '').toString().toLowerCase().trim();
        return registrationCity === reg.toLowerCase() || registrationCity.includes(reg.toLowerCase());
      }).length;
    });
    return counts;
  };

  // Helper function to get trusted cars counts
  const getTrustedCarsCounts = () => {
    return {
      'Managed by AutoFinder': cars.filter(c => c.sourceType === 'Managed by AutoFinder').length,
      'Premium Cars': cars.filter(c => c.sourceType === 'Premium Cars' || c.isFeatured === 'Approved').length,
      'AutoFinder Inspected': cars.filter(c => c.inspected === true).length,
      'AutoFinder Certified': cars.filter(c => c.certified === true).length
    };
  };

  // Helper function to get transmission counts
  const getTransmissionCounts = () => {
    const automatic = cars.filter(car => {
      const trans = (car.transmission || '').toString().toLowerCase().trim();
      return trans.includes('automatic') || trans === 'auto';
    }).length;
    const manual = cars.filter(car => {
      const trans = (car.transmission || '').toString().toLowerCase().trim();
      return trans.includes('manual') || trans === 'manual';
    }).length;
    return { 'Automatic': automatic, 'Manual': manual };
  };

  // Helper function to get color counts
  const getColorCounts = () => {
    const colors = ['White', 'Silver', 'Black', 'Grey'];
    const counts = {};
    colors.forEach(color => {
      counts[color] = cars.filter(car => {
        const carColor = (car.color || car.bodyColor || '').toString().toLowerCase().trim();
        return carColor === color.toLowerCase() || carColor.includes(color.toLowerCase());
      }).length;
    });
    const allListedColors = colors.map(c => c.toLowerCase());
    counts['Unlisted'] = cars.filter(car => {
      const carColor = (car.color || car.bodyColor || '').toString().toLowerCase().trim();
      return !carColor || (carColor && !allListedColors.some(c => carColor.includes(c)));
    }).length;
    return counts;
  };

  // Helper function to get engine type counts
  const getEngineTypeCounts = () => {
    const types = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG'];
    const counts = {};
    types.forEach(type => {
      counts[type] = cars.filter(car => {
        const engineType = ((car.engineType || car.fuelType) || '').toString().toLowerCase().trim();
        return engineType === type.toLowerCase() || engineType.includes(type.toLowerCase());
      }).length;
    });
    return counts;
  };

  // Helper function to get assembly counts
  const getAssemblyCounts = () => {
    return {
      'Local': cars.filter(car => {
        const assembly = (car.assembly || '').toString().toLowerCase().trim();
        return assembly.includes('local') || assembly.includes('pakistan');
      }).length,
      'Imported': cars.filter(car => {
        const assembly = (car.assembly || '').toString().toLowerCase().trim();
        return assembly.includes('imported') || assembly.includes('import');
      }).length
    };
  };

  // Helper function to get body type counts
  const getBodyTypeCounts = () => {
    const bodyTypes = ['Sedan', 'Hatchback', 'SUV', 'Coupe', 'Convertible', 'Wagon', 'Pickup', 'Van', 'Minivan'];
    const counts = {};
    bodyTypes.forEach(type => {
      counts[type] = cars.filter(car => {
        const bodyType = (car.bodyType || '').toString().toLowerCase().trim();
        return bodyType === type.toLowerCase() || bodyType.includes(type.toLowerCase());
      }).length;
    });
    return counts;
  };

  // Helper function to get number of doors counts
  const getDoorsCounts = () => {
    const doors = ['2', '3', '4', '5'];
    const counts = {};
    doors.forEach(door => {
      counts[door] = cars.filter(car => {
        const carDoors = (car.doors || car.numberOfDoors || '').toString();
        return carDoors === door;
      }).length;
    });
    return counts;
  };

  // Helper function to get seating capacity counts
  const getSeatingCapacityCounts = () => {
    const capacities = ['2', '4', '5', '7', '8'];
    const counts = {};
    capacities.forEach(cap => {
      counts[cap] = cars.filter(car => {
        const seating = (car.seatingCapacity || car.seats || '').toString();
        return seating === cap;
      }).length;
    });
    return counts;
  };

  const cityCounts = getCityCounts();
  const provinceCounts = getProvinceCounts();
  const makeCounts = getMakeCounts();
  const registeredInCounts = getRegisteredInCounts();
  const trustedCarsCounts = getTrustedCarsCounts();
  const transmissionCounts = getTransmissionCounts();
  const colorCounts = getColorCounts();
  const engineTypeCounts = getEngineTypeCounts();
  const assemblyCounts = getAssemblyCounts();
  const bodyTypeCounts = getBodyTypeCounts();
  const doorsCounts = getDoorsCounts();
  const seatingCapacityCounts = getSeatingCapacityCounts();

  const provinces = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Azad Kashmir', 'Federally Administered Tribal Areas'];
  const popularMakes = Object.keys(makeCounts).slice(0, 10);

  // Toggle functions
  const toggleCity = (city) => {
    setSelectedCities(prev =>
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  const toggleProvince = (province) => {
    setSelectedProvinces(prev =>
      prev.includes(province)
        ? prev.filter(p => p !== province)
        : [...prev, province]
    );
  };

  const toggleMake = (make) => {
    setSelectedMakes(prev =>
      prev.includes(make)
        ? prev.filter(m => m !== make)
        : [...prev, make]
    );
  };

  const toggleRegisteredIn = (reg) => {
    setSelectedRegisteredIn(prev =>
      prev.includes(reg)
        ? prev.filter(r => r !== reg)
        : [...prev, reg]
    );
  };

  const toggleTrustedCars = (trusted) => {
    setSelectedTrustedCars(prev =>
      prev.includes(trusted)
        ? prev.filter(t => t !== trusted)
        : [...prev, trusted]
    );
  };

  const toggleTransmission = (trans) => {
    setSelectedTransmissions(prev =>
      prev.includes(trans)
        ? prev.filter(t => t !== trans)
        : [...prev, trans]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const toggleEngineType = (type) => {
    setSelectedEngineTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleAssembly = (assembly) => {
    setSelectedAssemblies(prev =>
      prev.includes(assembly)
        ? prev.filter(a => a !== assembly)
        : [...prev, assembly]
    );
  };

  const toggleBodyType = (type) => {
    setSelectedBodyTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleDoors = (doors) => {
    setSelectedDoors(prev =>
      prev.includes(doors)
        ? prev.filter(d => d !== doors)
        : [...prev, doors]
    );
  };

  const toggleSeatingCapacity = (capacity) => {
    setSelectedSeatingCapacities(prev =>
      prev.includes(capacity)
        ? prev.filter(c => c !== capacity)
        : [...prev, capacity]
    );
  };

  // Filter cars based on all filters
  useEffect(() => {
    if (cars.length === 0) {
      setFilteredCars([]);
      return;
    }

    let filtered = [...cars];

    // Filter by keyword search
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      filtered = filtered.filter((car) => {
        const searchText = `${car.make || ''} ${car.model || ''} ${car.variant || ''} ${car.location || ''}`.toLowerCase();
        return searchText.includes(keyword);
      });
    }

    // Filter by selected cities (multiple)
    if (selectedCities.length > 0) {
      filtered = filtered.filter((car) => {
        const carLocation = (car.location || '').toString().toLowerCase().trim();
        return selectedCities.some(city =>
          carLocation === city.toLowerCase() || carLocation.includes(city.toLowerCase())
        );
      });
    } else if (selectedCity && selectedCity !== 'All') {
      const selectedCityLower = selectedCity.toLowerCase().trim();
      filtered = filtered.filter((car) => {
        const carLocation = (car.location || '').toString().toLowerCase().trim();
        return carLocation === selectedCityLower || carLocation.includes(selectedCityLower);
      });
    }

    // Filter by selected provinces
    if (selectedProvinces.length > 0) {
      const provinceMap = {
        'Punjab': ['Lahore', 'Rawalpindi', 'Faisalabad', 'Multan', 'Sialkot', 'Gujranwala', 'Sargodha'],
        'Sindh': ['Karachi', 'Hyderabad'],
        'KPK': ['Peshawar'],
        'Balochistan': ['Quetta'],
        'Azad Kashmir': [],
        'Federally Administered Tribal Areas': []
      };

      filtered = filtered.filter((car) => {
        const carLocation = (car.location || '').toString().toLowerCase().trim();
        return selectedProvinces.some(province => {
          const citiesInProvince = provinceMap[province] || [];
          return citiesInProvince.some(city =>
            carLocation === city.toLowerCase() || carLocation.includes(city.toLowerCase())
          );
        });
      });
    }

    // Filter by selected makes
    if (selectedMakes.length > 0) {
      filtered = filtered.filter((car) => selectedMakes.includes(car.make));
    } else if (selectedMake) {
      filtered = filtered.filter((car) => {
        return car.make && car.make.toLowerCase() === selectedMake.toLowerCase();
      });
    }

    // Filter by budget
    if (selectedBudget && priceRanges[selectedBudget]) {
      const range = priceRanges[selectedBudget];
      filtered = filtered.filter((car) => {
        const price = parseFloat(car.price) || 0;
        return price >= range.min && (range.max === Infinity ? true : price < range.max);
      });
    }

    // Filter by Price Range (From/To)
    if (priceFrom) {
      const fromPrice = parseFloat(priceFrom) || 0;
      filtered = filtered.filter((car) => {
        const price = parseFloat(car.price) || 0;
        return price >= fromPrice;
      });
    }
    if (priceTo) {
      const toPrice = parseFloat(priceTo) || 0;
      filtered = filtered.filter((car) => {
        const price = parseFloat(car.price) || 0;
        return price <= toPrice;
      });
    }

    // Filter by Year (From/To)
    if (yearFrom) {
      const fromYear = parseInt(yearFrom) || 0;
      filtered = filtered.filter((car) => {
        const year = parseInt(car.year) || 0;
        return year >= fromYear;
      });
    }
    if (yearTo) {
      const toYear = parseInt(yearTo) || 0;
      filtered = filtered.filter((car) => {
        const year = parseInt(car.year) || 0;
        return year <= toYear;
      });
    }

    // Filter by Mileage (From/To)
    if (mileageFrom) {
      const fromMileage = parseFloat(mileageFrom) || 0;
      filtered = filtered.filter((car) => {
        const mileage = parseFloat(car.kmDriven) || 0;
        return mileage >= fromMileage;
      });
    }
    if (mileageTo) {
      const toMileage = parseFloat(mileageTo) || 0;
      filtered = filtered.filter((car) => {
        const mileage = parseFloat(car.kmDriven) || 0;
        return mileage <= toMileage;
      });
    }

    // Filter by Registered In
    if (selectedRegisteredIn.length > 0) {
      filtered = filtered.filter((car) => {
        const registrationCity = (car.registrationCity || car.location || '').toString().toLowerCase().trim();
        return selectedRegisteredIn.some(reg => {
          const regLower = reg.toLowerCase().trim();
          return registrationCity === regLower || registrationCity.includes(regLower);
        });
      });
    }

    // Filter by Trusted Cars
    if (selectedTrustedCars.length > 0) {
      filtered = filtered.filter((car) => {
        if (selectedTrustedCars.includes('Managed by AutoFinder')) {
          return car.sourceType === 'Managed by AutoFinder';
        }
        if (selectedTrustedCars.includes('Premium Cars')) {
          return car.sourceType === 'Premium Cars' || car.isFeatured === 'Approved';
        }
        if (selectedTrustedCars.includes('AutoFinder Inspected')) {
          return car.inspected === true;
        }
        if (selectedTrustedCars.includes('AutoFinder Certified')) {
          return car.certified === true;
        }
        return true;
      });
    }

    // Filter by Transmission
    if (selectedTransmissions.length > 0) {
      filtered = filtered.filter((car) => {
        const transmission = (car.transmission || '').toString().toLowerCase().trim();
        return selectedTransmissions.some(trans => {
          const transLower = trans.toLowerCase().trim();
          return transmission === transLower || transmission.includes(transLower);
        });
      });
    }

    // Filter by Color
    if (selectedColors.length > 0) {
      filtered = filtered.filter((car) => {
        const color = (car.color || car.bodyColor || '').toString().toLowerCase().trim();
        return selectedColors.some(col => {
          const colLower = col.toLowerCase().trim();
          return color === colLower || color.includes(colLower);
        });
      });
    }

    // Filter by Engine Type
    if (selectedEngineTypes.length > 0) {
      filtered = filtered.filter((car) => {
        const engineType = (car.engineType || car.fuelType || '').toString().toLowerCase().trim();
        return selectedEngineTypes.some(type => {
          const typeLower = type.toLowerCase().trim();
          return engineType === typeLower || engineType.includes(typeLower);
        });
      });
    }

    // Filter by Engine Capacity
    if (engineCapacityFrom) {
      const fromCapacity = parseFloat(engineCapacityFrom) || 0;
      filtered = filtered.filter((car) => {
        const capacity = parseFloat(car.engineCapacity) || 0;
        return capacity >= fromCapacity;
      });
    }
    if (engineCapacityTo) {
      const toCapacity = parseFloat(engineCapacityTo) || 0;
      filtered = filtered.filter((car) => {
        const capacity = parseFloat(car.engineCapacity) || 0;
        return capacity <= toCapacity;
      });
    }

    // Filter by Assembly
    if (selectedAssemblies.length > 0) {
      filtered = filtered.filter((car) => {
        const assembly = (car.assembly || '').toString().toLowerCase().trim();
        return selectedAssemblies.some(ass => {
          const assLower = ass.toLowerCase().trim();
          return assembly === assLower || assembly.includes(assLower);
        });
      });
    }

    // Filter by Body Type
    if (selectedBodyTypes.length > 0) {
      filtered = filtered.filter((car) => {
        const bodyType = (car.bodyType || '').toString().toLowerCase().trim();
        return selectedBodyTypes.some(type => {
          const typeLower = type.toLowerCase().trim();
          return bodyType === typeLower || bodyType.includes(typeLower);
        });
      });
    }

    // Filter by Number of Doors
    if (selectedDoors.length > 0) {
      filtered = filtered.filter((car) => {
        const doors = (car.doors || car.numberOfDoors || '').toString();
        return selectedDoors.includes(doors);
      });
    }

    // Filter by Seating Capacity
    if (selectedSeatingCapacities.length > 0) {
      filtered = filtered.filter((car) => {
        const seating = (car.seatingCapacity || car.seats || '').toString();
        return selectedSeatingCapacities.includes(seating);
      });
    }

    setFilteredCars(filtered);
  }, [cars, searchKeyword, selectedCities, selectedProvinces, selectedMakes, selectedCity, selectedMake, selectedBudget, priceFrom, priceTo, yearFrom, yearTo, mileageFrom, mileageTo, selectedRegisteredIn, selectedTrustedCars, selectedTransmissions, selectedColors, selectedEngineTypes, engineCapacityFrom, engineCapacityTo, selectedAssemblies, selectedBodyTypes, selectedDoors, selectedSeatingCapacities, priceRanges]);

  useEffect(() => {
    const fetchLatestCars = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL = server_ip || 'http://localhost:8001';
        const endpoint = `${API_URL}/all_ads`;

        console.log('🔄 Fetching latest cars from:', endpoint);

        const response = await fetchWithRetry(endpoint, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Latest cars received:', data.length);

        if (Array.isArray(data) && data.length > 0) {
          // Sort by dateAdded (newest first) and take latest 12
          const latestCars = data
            .filter(car => car.make && car.model)
            .map(car => ({
              ...car,
              sourceType: car.sourceType || 'Latest Cars'
            }))
            .sort((a, b) => {
              const dateA = new Date(a.dateAdded || a.createdAt || 0);
              const dateB = new Date(b.dateAdded || b.createdAt || 0);
              return dateB - dateA;
            })
            .slice(0, 12);

          setCars(latestCars);
          console.log('✅ Latest cars set:', latestCars.length);
        } else {
          setCars([]);
        }
      } catch (err) {
        console.error('❌ Error fetching latest cars:', err);
        setError(err.message || 'Failed to fetch latest cars');
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestCars();
  }, []);

  const buildImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ECar Image%3C/text%3E%3C/svg%3E';
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

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Latest Cars - Auto Finder</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8">Latest Cars</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden animate-pulse transition-colors">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Latest Cars - Auto Finder</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
          <div className="container mx-auto px-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center transition-colors">
              <p className="text-yellow-800 dark:text-yellow-400 font-semibold mb-2">Unable to load latest cars</p>
              <p className="text-yellow-700 dark:text-yellow-500 text-sm mb-2">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Latest Cars - Auto Finder</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-2 transition-colors">
        <div className="container mx-auto px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {t('latestCars')}
            {(selectedBudget || selectedMake || selectedCity) && (
              <span className="text-lg text-gray-600 dark:text-gray-400 font-normal ml-2">
                ({filteredCars.length} {filteredCars.length === 1 ? t('carBadge') : t('carsBadge')})
              </span>
            )}
          </h1>

          {/* Show active filters */}
          {(selectedBudget || selectedMake || selectedCity) && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              {selectedBudget && (
                <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm">
                  {t('budget')}: {t({
                    'Under 5 Lakh': 'under5Lakh',
                    '5-10 Lakh': '5_10Lakh',
                    '10-15 Lakh': '10_15Lakh',
                    '15-20 Lakh': '15_20Lakh',
                    '20-30 Lakh': '20_30Lakh',
                    '30-50 Lakh': '30_50Lakh',
                    '50-75 Lakh': '50_75Lakh',
                    '75 Lakh - 1 Crore': '75Lakh_1Crore',
                    'Above 1 Crore': 'above1Crore'
                  }[selectedBudget]) || selectedBudget}
                </span>
              )}
              {selectedMake && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                  {t('make')}: {t(selectedMake.toLowerCase().replace(/[\s\-\/]/g, '')) || selectedMake}
                </span>
              )}
              {selectedCity && (
                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                  {t('city')}: {t(selectedCity.toLowerCase().replace(/[\s\-\/]/g, '')) || selectedCity}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchKeyword('');
                  setSelectedCities([]);
                  setSelectedProvinces([]);
                  setSelectedMakes([]);
                  setSelectedBudget('');
                  setSelectedMake('');
                  setSelectedCity('');
                  setPriceFrom('');
                  setPriceTo('');
                  setYearFrom('');
                  setYearTo('');
                  setMileageFrom('');
                  setMileageTo('');
                  setSelectedRegisteredIn([]);
                  setSelectedTrustedCars([]);
                  setSelectedTransmissions([]);
                  setSelectedColors([]);
                  setSelectedEngineTypes([]);
                  setEngineCapacityFrom('');
                  setEngineCapacityTo('');
                  setSelectedAssemblies([]);
                  setSelectedBodyTypes([]);
                  setSelectedDoors([]);
                  setSelectedSeatingCapacities([]);
                  navigate('/latest-cars');
                }}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium transition-colors"
              >
                {t('clearFilters')}
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Sidebar - Filters */}
            <div className="w-full lg:w-64 xl:w-72 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                {/* SHOW RESULTS BY Header */}
                <div className="bg-red-600 dark:bg-red-700 text-white px-2.5 py-2 font-semibold text-xs text-center border-b border-white/10">
                  {t('showResultsBy')}
                </div>

                {/* SEARCH BY KEYWORD */}
                <div className="p-2.5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={t('searchByMakeModelCity')}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="w-full px-2 py-1.5 pr-8 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <div className="absolute right-0 top-0 h-full flex items-center pr-1">
                        <VoiceSearchComp
                          onResult={(text) => {
                            setSearchKeyword(text);
                          }}
                          className="scale-90"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => { }}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 rounded text-xs font-semibold transition whitespace-nowrap"
                    >
                      {t('go')}
                    </button>
                  </div>
                </div>

                {/* CITY Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setIsCityOpen(!isCityOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{t('city')}</span>
                    {isCityOpen ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </button>
                  {isCityOpen && (() => {
                    const cityList = cities.filter(c => c !== 'All');
                    const totalPages = Math.ceil(cityList.length / citiesPerPage);
                    const startIndex = cityPage * citiesPerPage;
                    const endIndex = startIndex + citiesPerPage;
                    const currentCities = cityList.slice(startIndex, endIndex);

                    return (
                      <div className="px-4 pb-4 relative">
                        {/* Navigation Arrows */}
                        {cityPage > 0 && (
                          <button
                            onClick={() => setCityPage(cityPage - 1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
                            aria-label="Previous cities"
                          >
                            <FaChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                          </button>
                        )}

                        {cityPage < totalPages - 1 && (
                          <button
                            onClick={() => setCityPage(cityPage + 1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
                            aria-label="Next cities"
                          >
                            <FaChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                          </button>
                        )}

                        {/* Cities Grid */}
                        <div className="grid grid-cols-1 gap-2 min-h-[120px] sm:min-h-[140px]">
                          {currentCities.map((city) => {
                            const count = cityCounts[city] || 0;
                            const isChecked = selectedCities.includes(city);
                            return (
                              <label
                                key={city}
                                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded transition-colors"
                              >
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleCity(city)}
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 flex-shrink-0"
                                  />
                                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">{t(city.toLowerCase().replace(/[\s\-\/]/g, '')) || city}</span>
                                </div>
                                <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                                  {count.toLocaleString()}
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Pagination Dots */}
                        {totalPages > 1 && (
                          <div className="flex justify-center gap-1.5 mt-3">
                            {Array.from({ length: totalPages }).map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCityPage(index)}
                                className={`w-2 h-2 rounded-full transition-all ${cityPage === index
                                  ? 'bg-red-600 dark:bg-red-500 w-6'
                                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                  }`}
                                aria-label={`Go to page ${index + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* PROVINCE Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setIsProvinceOpen(!isProvinceOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{t('province')}</span>
                    {isProvinceOpen ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </button>
                  {isProvinceOpen && (
                    <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
                      {provinces.map((province) => {
                        const count = provinceCounts[province] || 0;
                        const isChecked = selectedProvinces.includes(province);
                        return (
                          <label
                            key={province}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleProvince(province)}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 flex-shrink-0"
                              />
                              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">{t(province.toLowerCase().replace(/[\s\-\/]/g, '')) || province}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* MAKE Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setIsMakeOpen(!isMakeOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{t('make')}</span>
                    {isMakeOpen ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </button>
                  {isMakeOpen && (
                    <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
                      {popularMakes.map((make) => {
                        const count = makeCounts[make] || 0;
                        const isChecked = selectedMakes.includes(make);
                        return (
                          <label
                            key={make}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleMake(make)}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 flex-shrink-0"
                              />
                              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">{t(make.toLowerCase().replace(/[\s\-\/]/g, '')) || make}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* BUDGET Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsBudgetOpen(!isBudgetOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{t('byBudget')}</span>
                    {isBudgetOpen ? (
                      <FaChevronUp className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <FaChevronDown className="text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                  {isBudgetOpen && (
                    <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
                      {Object.keys(priceRanges).map((budget) => {
                        const isSelected = selectedBudget === budget;
                        return (
                          <label
                            key={budget}
                            className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded transition-colors"
                          >
                            <input
                              type="radio"
                              name="budget"
                              checked={isSelected}
                              onChange={() => {
                                const newBudget = isSelected ? '' : budget;
                                setSelectedBudget(newBudget);
                              }}
                              className="w-4 h-4 text-red-600 dark:text-red-500 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 dark:bg-gray-700"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t({
                              'Under 5 Lakh': 'under5Lakh',
                              '5-10 Lakh': '5_10Lakh',
                              '10-15 Lakh': '10_15Lakh',
                              '15-20 Lakh': '15_20Lakh',
                              '20-30 Lakh': '20_30Lakh',
                              '30-50 Lakh': '30_50Lakh',
                              '50-75 Lakh': '50_75Lakh',
                              '75 Lakh - 1 Crore': '75Lakh_1Crore',
                              'Above 1 Crore': 'above1Crore'
                            }[budget]) || budget}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* PRICE RANGE Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setIsPriceRangeOpen(!isPriceRangeOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{t('priceRange')}</span>
                    {isPriceRangeOpen ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </button>
                  {isPriceRangeOpen && (
                    <div className="px-4 pb-4">
                      <PriceRangeDropdown
                        priceFrom={priceFrom}
                        priceTo={priceTo}
                        onFromChange={setPriceFrom}
                        onToChange={setPriceTo}
                        suggestions={carPriceSuggestions}
                        onGoClick={() => { }}
                      />
                    </div>
                  )}
                </div>

                {/* YEAR Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsYearOpen(!isYearOpen)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm uppercase">{t('year')}</span>
                    {isYearOpen ? (
                      <FaChevronUp className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <FaChevronDown className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                  {isYearOpen && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="flex gap-1 sm:gap-1.5 items-center w-full">
                        <input
                          type="number"
                          placeholder="From"
                          value={yearFrom}
                          onChange={(e) => setYearFrom(e.target.value)}
                          className="flex-1 min-w-0 px-1.5 sm:px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-[10px] sm:text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <input
                          type="number"
                          placeholder={t('to')}
                          value={yearTo}
                          onChange={(e) => setYearTo(e.target.value)}
                          className="flex-1 min-w-0 px-1.5 sm:px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-[10px] sm:text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <button
                          onClick={() => { }}
                          className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-xs font-semibold transition whitespace-nowrap flex-shrink-0"
                        >
                          {t('go')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* MILEAGE (KM) Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setIsMileageOpen(!isMileageOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 uppercase">{t('mileage')} ({t('km')})</span>
                    {isMileageOpen ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </button>
                  {isMileageOpen && (
                    <div className="px-4 pb-4">
                      <MileageRangeDropdown
                        mileageFrom={mileageFrom}
                        mileageTo={mileageTo}
                        onFromChange={setMileageFrom}
                        onToChange={setMileageTo}
                        suggestions={carMileageSuggestions}
                        onGoClick={() => { }}
                      />
                    </div>
                  )}
                </div>

                {/* REGISTERED IN Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsRegisteredInOpen(!isRegisteredInOpen)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm uppercase">{t('registeredIn')}</span>
                    {isRegisteredInOpen ? (
                      <FaChevronUp className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <FaChevronDown className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                  {isRegisteredInOpen && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                      {Object.entries(registeredInCounts).map(([reg, count]) => {
                        const isChecked = selectedRegisteredIn.includes(reg);
                        return (
                          <label
                            key={reg}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleRegisteredIn(reg)}
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{t(reg.toLowerCase().replace(/[\s\-\/]/g, '')) || reg}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                      <div className="text-xs text-red-600 mt-2 cursor-pointer hover:underline">
                        {t('moreChoices')}
                      </div>
                    </div>
                  )}
                </div>

                {/* TRUSTED CARS Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsTrustedCarsOpen(!isTrustedCarsOpen)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm uppercase">{t('trustedCars')}</span>
                    {isTrustedCarsOpen ? (
                      <FaChevronUp className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <FaChevronDown className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                  {isTrustedCarsOpen && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                      {Object.entries(trustedCarsCounts).map(([trusted, count]) => {
                        const isChecked = selectedTrustedCars.includes(trusted);
                        return (
                          <label
                            key={trusted}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleTrustedCars(trusted)}
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{t(trusted.toLowerCase().replace(/[\s\-\/]/g, '')) || trusted}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* TRANSMISSION Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsTransmissionOpen(!isTransmissionOpen)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm uppercase">{t('transmission')}</span>
                    {isTransmissionOpen ? (
                      <FaChevronUp className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <FaChevronDown className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                  {isTransmissionOpen && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                      {Object.entries(transmissionCounts).map(([trans, count]) => {
                        const isChecked = selectedTransmissions.includes(trans);
                        return (
                          <label
                            key={trans}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleTransmission(trans)}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 flex-shrink-0"
                              />
                              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">{t(trans.toLowerCase().replace(/[\s\-\/]/g, '')) || trans}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* COLOR Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setIsColorOpen(!isColorOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 uppercase">{t('color')}</span>
                    {isColorOpen ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </button>
                  {isColorOpen && (
                    <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
                      {Object.entries(colorCounts).map(([color, count]) => {
                        const isChecked = selectedColors.includes(color);
                        return (
                          <label
                            key={color}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleColor(color)}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 flex-shrink-0"
                              />
                              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">{t(color.toLowerCase().replace(/[\s\-\/]/g, '')) || color}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                      <div className="text-[10px] sm:text-xs text-red-600 mt-1.5 sm:mt-2 cursor-pointer hover:underline">
                        {t('moreChoices')}
                      </div>
                    </div>
                  )}
                </div>

                {/* ENGINE TYPE Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsEngineTypeOpen(!isEngineTypeOpen)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm uppercase">{t('engineType')}</span>
                    {isEngineTypeOpen ? (
                      <FaChevronUp className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <FaChevronDown className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                  {isEngineTypeOpen && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                      {Object.entries(engineTypeCounts).map(([type, count]) => {
                        const isChecked = selectedEngineTypes.includes(type);
                        return (
                          <label
                            key={type}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleEngineType(type)}
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{t(type.toLowerCase().replace(/[\s\-\/]/g, '')) || type}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ENGINE CAPACITY (CC) Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsEngineCapacityOpen(!isEngineCapacityOpen)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm uppercase">{t('engineCapacity')} (CC)</span>
                    {isEngineCapacityOpen ? (
                      <FaChevronUp className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <FaChevronDown className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                  {isEngineCapacityOpen && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="flex gap-1 sm:gap-1.5 items-center w-full">
                        <input
                          type="number"
                          placeholder={t('from')}
                          value={engineCapacityFrom}
                          onChange={(e) => setEngineCapacityFrom(e.target.value)}
                          className="flex-1 min-w-0 px-1.5 sm:px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-[10px] sm:text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <input
                          type="number"
                          placeholder={t('to')}
                          value={engineCapacityTo}
                          onChange={(e) => setEngineCapacityTo(e.target.value)}
                          className="flex-1 min-w-0 px-1.5 sm:px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-[10px] sm:text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <button
                          onClick={() => { }}
                          className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-xs font-semibold transition whitespace-nowrap flex-shrink-0"
                        >
                          {t('go')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ASSEMBLY Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsAssemblyOpen(!isAssemblyOpen)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm uppercase">{t('assembly')}</span>
                    {isAssemblyOpen ? (
                      <FaChevronUp className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <FaChevronDown className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                  {isAssemblyOpen && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                      {Object.entries(assemblyCounts).map(([assembly, count]) => {
                        const isChecked = selectedAssemblies.includes(assembly);
                        return (
                          <label
                            key={assembly}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleAssembly(assembly)}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 flex-shrink-0"
                              />
                              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">{t(assembly.toLowerCase().replace(/[\s\-\/]/g, '')) || assembly}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* BODY TYPE Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsBodyTypeOpen(!isBodyTypeOpen)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm uppercase">{t('bodyType')}</span>
                    {isBodyTypeOpen ? (
                      <FaChevronUp className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <FaChevronDown className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                  {isBodyTypeOpen && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                      {Object.entries(bodyTypeCounts).map(([type, count]) => {
                        const isChecked = selectedBodyTypes.includes(type);
                        return (
                          <label
                            key={type}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleBodyType(type)}
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{t(type.toLowerCase().replace(/[\s\-\/]/g, '')) || type}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* NUMBER OF DOORS Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsDoorsOpen(!isDoorsOpen)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm uppercase">{t('doors')}</span>
                    {isDoorsOpen ? (
                      <FaChevronUp className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <FaChevronDown className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                  {isDoorsOpen && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                      {Object.entries(doorsCounts).map(([doors, count]) => {
                        const isChecked = selectedDoors.includes(doors);
                        return (
                          <label
                            key={doors}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleDoors(doors)}
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{t(doors.toLowerCase().replace(/[\s\-\/]/g, '')) || doors}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* SEATING CAPACITY Section */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsSeatingCapacityOpen(!isSeatingCapacityOpen)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm uppercase">{t('seatingCapacity')}</span>
                    {isSeatingCapacityOpen ? (
                      <FaChevronUp className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <FaChevronDown className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                  {isSeatingCapacityOpen && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                      {Object.entries(seatingCapacityCounts).map(([capacity, count]) => {
                        const isChecked = selectedSeatingCapacities.includes(capacity);
                        return (
                          <label
                            key={capacity}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSeatingCapacity(capacity)}
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{t(capacity.toLowerCase().replace(/[\s\-\/]/g, '')) || capacity}</span>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                              {count.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Clear Filters Button */}
                <div className="p-4">
                  <button
                    onClick={() => {
                      setSearchKeyword('');
                      setSelectedCities([]);
                      setSelectedProvinces([]);
                      setSelectedMakes([]);
                      setSelectedBudget('');
                      setSelectedMake('');
                      setSelectedCity('');
                      setPriceFrom('');
                      setPriceTo('');
                      setYearFrom('');
                      setYearTo('');
                      setMileageFrom('');
                      setMileageTo('');
                      setSelectedRegisteredIn([]);
                      setSelectedTrustedCars([]);
                      setSelectedTransmissions([]);
                      setSelectedColors([]);
                      setSelectedEngineTypes([]);
                      setEngineCapacityFrom('');
                      setEngineCapacityTo('');
                      setSelectedAssemblies([]);
                      setSelectedBodyTypes([]);
                      setSelectedDoors([]);
                      setSelectedSeatingCapacities([]);
                      navigate('/latest-cars');
                    }}
                    className="w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white py-2 px-4 rounded text-sm font-semibold transition"
                  >
                    {t('clearFilters')}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Car Listings */}
            <div className="flex-1 min-w-0 w-full">
              {filteredCars.length === 0 && cars.length > 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center transition-colors">
                  <p className="text-gray-600 dark:text-gray-400 mb-2 font-semibold">{t('noCarsFound')}</p>
                  <button
                    onClick={() => {
                      setSearchKeyword('');
                      setSelectedCities([]);
                      setSelectedProvinces([]);
                      setSelectedMakes([]);
                      setSelectedBudget('');
                      setSelectedMake('');
                      setSelectedCity('');
                      setPriceFrom('');
                      setPriceTo('');
                      setYearFrom('');
                      setYearTo('');
                      setMileageFrom('');
                      setMileageTo('');
                      setSelectedRegisteredIn([]);
                      setSelectedTrustedCars([]);
                      setSelectedTransmissions([]);
                      setSelectedColors([]);
                      setSelectedEngineTypes([]);
                      setEngineCapacityFrom('');
                      setEngineCapacityTo('');
                      setSelectedAssemblies([]);
                      setSelectedBodyTypes([]);
                      setSelectedDoors([]);
                      setSelectedSeatingCapacities([]);
                      navigate('/latest-cars');
                    }}
                    className="text-red-600 dark:text-red-400 hover:underline font-medium"
                  >
                    {t('clearFilters')}
                  </button>
                </div>
              ) : cars.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center transition-colors">
                  <p className="text-gray-600 dark:text-gray-400 mb-2 font-semibold">{t('noLatestCarsAvailable')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredCars.map((car) => {
                    const imageUrl = buildImageUrl(car.image1);
                    const carName = `${car.make || ''} ${car.model || ''} ${car.variant || ''} ${car.year || ''}`.trim();
                    return (
                      <div key={car._id || car.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden hover:shadow-xl transition-colors h-full flex flex-col">
                        <div className="h-40 bg-gray-200 dark:bg-gray-700 relative overflow-hidden flex-shrink-0">
                          <img
                            src={imageUrl}
                            alt={carName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ECar Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <span className="absolute top-2 right-2 bg-red-600 dark:bg-red-700 text-white px-2 py-1 rounded text-xs font-semibold uppercase">{t('new')}</span>
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{carName}</h3>
                          <div className="mb-2">
                            <span className="text-red-600 dark:text-red-500 font-bold text-lg">{formatPrice(car.price)}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {car.year && (
                              <span className="flex items-center gap-1">
                                <FaCalendarAlt className="text-red-600 dark:text-red-500" />
                                <strong>{t('yearLabelField')}</strong> {car.year}
                              </span>
                            )}
                            {car.transmission && (
                              <span className="flex items-center gap-1">
                                <FaCog className="text-red-600 dark:text-red-500" />
                                <strong>{t('transLabelField')}</strong> {t(car.transmission.toLowerCase())}
                              </span>
                            )}
                            {car.engineCapacity && (
                              <span className="flex items-center gap-1">
                                <FaBolt className="text-red-600 dark:text-red-500" />
                                <strong>{t('engineLabelField')}</strong> {car.engineCapacity}
                              </span>
                            )}
                          </div>
                          {/* Spacer to push button to bottom */}
                          <div className="flex-grow"></div>
                          <Link
                            to={car.adType === 'new_car' ? `/car-detail/${car._id}` : `/used-car-detail/${car._id}`}
                            className="block w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white text-center py-2 rounded-md transition mt-auto"
                          >
                            {t('viewDetails')}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LatestCars;

