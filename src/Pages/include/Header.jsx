import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaSun, FaMoon, FaGlobe } from 'react-icons/fa';
import { server_ip } from '../../Utils/Data';
// Autofinder Logo
const logoPath = process.env.PUBLIC_URL + '/assets/images/autofinderlogo.png';

function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isBikesOpen, setIsBikesOpen] = useState(false);
  const [isPostAdOpen, setIsPostAdOpen] = useState(false);
  const [isUsedCarsOpen, setIsUsedCarsOpen] = useState(false);
  const [isNewCarsOpen, setIsNewCarsOpen] = useState(false);
  const [isAutoStoreOpen, setIsAutoStoreOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [user, setUser] = useState(null);
  const location = useLocation();
  const moreDropdownRef = useRef(null);
  const bikesDropdownRef = useRef(null);
  const postAdDropdownRef = useRef(null);
  const usedCarsDropdownRef = useRef(null);
  const newCarsDropdownRef = useRef(null);
  const autoStoreDropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Handle smart header scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(prev => prev === true ? prev : true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setIsVisible(prev => prev === false ? prev : false);
      } else {
        // Scrolling up
        setIsVisible(prev => prev === true ? prev : true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      }
    };

    checkUser();
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkUser);
    // Also check on location change (when user navigates after login)
    const interval = setInterval(checkUser, 1000);

    return () => {
      window.removeEventListener('storage', checkUser);
      clearInterval(interval);
    };
  }, [location]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsUserMenuOpen(false);
    navigate('/');
    window.location.reload();
  };

  // Handle click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && isUserMenuOpen) {
        // Check if click is outside the dropdown container
        if (!userMenuRef.current.contains(event.target)) {
          setIsUserMenuOpen(false);
        }
      }
    };

    if (isUserMenuOpen) {
      // Use setTimeout to avoid immediate closing when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isUserMenuOpen]);

  // Toggle user menu on click
  const toggleUserMenu = () => {
    if (!isUserMenuOpen && userButtonRef.current) {
      // Calculate dropdown position
      const rect = userButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Get user profile image URL
  const getProfileImageUrl = () => {
    if (!user?.profileImage) return null;
    const API_URL = server_ip || 'http://localhost:8001';
    if (user.profileImage.startsWith('http')) {
      return user.profileImage;
    }
    return `${API_URL}/uploads/${user.profileImage}`;
  };


  return (
    <>
      <Helmet>
        <title>Auto Finder - Car Dealership</title>
      </Helmet>

      {/* Spacer to prevent content from jumping up due to fixed header - Hidden on Home page for seamless video */}
      {/* Spacer to prevent content from jumping up due to fixed header - Hidden on Home page for seamless video */}
      {location.pathname !== '/' && (
        <div className="h-[40px] sm:h-[50px]"></div>
      )}

      {/* Fixed Wrapper for Smart Header */}
      <div className={`fixed top-0 left-0 right-0 z-[100] transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>


        {/* Main Header - PakWheels Style */}
        <header className="bg-white dark:bg-gray-900 shadow-sm relative w-full transition-all duration-300">
          <div className="container mx-auto px-2 sm:px-4">
            <nav className="flex items-center justify-between py-0" style={{ minHeight: '30px', maxHeight: '45px' }}>
              {/* Logo Section */}
              <Link to="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0" style={{ backgroundColor: 'transparent' }}>
                <div className="relative flex items-center" style={{ backgroundColor: 'transparent', background: 'transparent' }}>
                  <img
                    src={logoPath}
                    alt="Autofinder Logo"
                    className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain"
                    style={{
                      backgroundColor: 'transparent !important',
                      background: 'transparent !important',
                      mixBlendMode: 'normal',
                      imageRendering: 'auto',
                      display: 'block',
                      maxHeight: '50px'
                    }}
                    onError={(e) => {
                      // Fallback if image doesn't load
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-red-600 rounded-lg flex items-center justify-center hidden">
                    <span className="text-white font-bold text-sm sm:text-lg md:text-xl">AF</span>
                  </div>
                </div>
                <div className="flex flex-col leading-tight">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-red-600 dark:text-red-500 whitespace-nowrap">AUTOFINDER</span>
                    <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-red-600 dark:text-red-500 whitespace-nowrap">.PK</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-black dark:text-white leading-tight whitespace-nowrap">PAKISTAN'S #1 AUTOMOBILE MARKETPLACE</span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
                <div
                  className="relative"
                  ref={usedCarsDropdownRef}
                  onMouseEnter={() => setIsUsedCarsOpen(true)}
                  onMouseLeave={() => setIsUsedCarsOpen(false)}
                >
                  <Link
                    to="/used-cars"
                    className={`px-2 sm:px-3 py-2 text-sm sm:text-base font-medium transition-colors relative flex items-center ${location.pathname === '/used-cars' || isUsedCarsOpen ? 'text-brandRed dark:text-red-500' : 'text-gray-700 dark:text-gray-300 hover:text-brandRed dark:hover:text-red-500'
                      }`}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    {t('usedCars')}
                    {location.pathname === '/used-cars' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brandRed"></span>
                    )}
                  </Link>

                  {/* Used Cars Dropdown Menu - Multi Column */}
                  {isUsedCarsOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 bg-transparent z-50 w-max max-w-[calc(100vw-2rem)]">
                      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg border border-gray-200 dark:border-gray-700 py-3">
                        <div className="flex flex-col md:flex-row gap-4 px-4">
                          {/* Column 1 - Services */}
                          <div>
                            <div className="space-y-2">
                              <Link
                                to="/used-cars"
                                className="block group"
                                onClick={() => {
                                  setIsUsedCarsOpen(false);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              >
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-brandRed dark:text-red-500 mt-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-brandRed dark:group-hover:text-red-500 transition-colors">{t('findUsedCars')}</h4>
                                  </div>
                                </div>
                              </Link>
                              <Link to="/featured-cars" className="block group" onClick={() => setIsUsedCarsOpen(false)}>
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-yellow-500 dark:text-yellow-400 mt-0.5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-brandRed dark:group-hover:text-red-500 transition-colors">{t('premiumCars')}</h4>
                                  </div>
                                </div>
                              </Link>
                              <Link
                                to="/sell-car"
                                className="block group"
                                onClick={() => {
                                  setIsUsedCarsOpen(false);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              >
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-brandRed dark:group-hover:text-red-500 transition-colors">{t('sellCar')}</h4>
                                  </div>
                                </div>
                              </Link>
                              <Link
                                to="/price-calculator"
                                className="block group"
                                onClick={() => {
                                  setIsUsedCarsOpen(false);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              >
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-500 mt-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-brandRed dark:group-hover:text-red-500 transition-colors">{t('priceCalculator')}</h4>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </div>

                          {/* Column 2 - Autofinder Services */}
                          <div>
                            <div className="space-y-2">
                              <Link to="/certified-cars" className="block group" onClick={() => setIsUsedCarsOpen(false)}>
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-500 mt-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                  </svg>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-brandRed dark:group-hover:text-red-500 transition-colors">{t('certifiedCars')}</h4>
                                  </div>
                                </div>
                              </Link>
                              <Link to="/inspection" className="block group" onClick={() => setIsUsedCarsOpen(false)}>
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-500 mt-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-brandRed dark:group-hover:text-red-500 transition-colors">{t('inspection')}</h4>
                                  </div>
                                </div>
                              </Link>
                              <Link to="/list-it-for-you" className="block group" onClick={() => setIsUsedCarsOpen(false)}>
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-orange-600 dark:text-orange-500 mt-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-brandRed dark:group-hover:text-red-500 transition-colors">{t('listIt')}</h4>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className="relative"
                  ref={newCarsDropdownRef}
                  onMouseEnter={() => setIsNewCarsOpen(true)}
                  onMouseLeave={() => setIsNewCarsOpen(false)}
                >
                  <Link
                    to="/search-cars"
                    className={`px-2 sm:px-3 py-2 text-sm sm:text-base font-medium transition-colors relative flex items-center ${location.pathname === '/search-cars' || isNewCarsOpen
                      ? 'text-brandRed dark:text-red-500'
                      : 'text-gray-700 dark:text-gray-300 hover:text-brandRed dark:hover:text-red-500'
                      }`}
                  >
                    {t('newCars')}
                  </Link>

                  {/* New Cars Dropdown Menu - Multi Column */}
                  {isNewCarsOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 bg-transparent z-50 w-max max-w-[calc(100vw-2rem)]">
                      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg border border-gray-200 dark:border-gray-700 py-3">
                        <div className="flex flex-col md:flex-row gap-4 px-4">
                          {/* Column 1 - Actions/Categories */}
                          <div>
                            <div className="space-y-2">
                              <Link to="/search-cars" className="block group" onClick={() => setIsNewCarsOpen(false)}>
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-brandRed dark:text-red-500 mt-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-brandRed dark:group-hover:text-red-500 transition-colors">{t('findNewCars')}</h4>
                                  </div>
                                </div>
                              </Link>
                              <Link to="/compare-cars" className="block group" onClick={() => setIsNewCarsOpen(false)}>
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-500 mt-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-brandRed dark:group-hover:text-red-500 transition-colors">{t('carComparisons')}</h4>
                                  </div>
                                </div>
                              </Link>
                              <Link to="/prices" className="block group" onClick={() => setIsNewCarsOpen(false)}>
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-brandRed dark:group-hover:text-red-500 transition-colors">{t('prices')}</h4>
                                  </div>
                                </div>
                              </Link>
                              <Link to="/on-road-price" className="block group" onClick={() => setIsNewCarsOpen(false)}>
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-500 mt-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-brandRed dark:group-hover:text-red-500 transition-colors">{t('onRoadPrice')}</h4>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className="relative"
                  ref={bikesDropdownRef}
                  onMouseEnter={() => setIsBikesOpen(true)}
                  onMouseLeave={() => setIsBikesOpen(false)}
                >
                  <Link
                    to="/bikes"
                    className={`px-2 sm:px-3 py-2 text-sm sm:text-base font-medium transition-colors flex items-center ${location.pathname === '/bikes'
                      ? 'text-brandRed dark:text-red-500'
                      : 'text-gray-700 dark:text-gray-300 hover:text-brandRed dark:hover:text-red-500'
                      }`}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    {t('bikes')}
                  </Link>

                  {/* Bikes Dropdown Menu - Multi Column */}
                  {isBikesOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 bg-transparent z-50 w-max max-w-[calc(100vw-2rem)]">
                      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg border border-gray-200 dark:border-gray-700 py-3">
                        <div className="flex flex-col md:flex-row gap-4 px-4">
                          {/* Column 1 - Used Bikes */}
                          <div>
                            <div className="space-y-2">
                              <Link
                                to="/bikes"
                                className="flex items-start gap-2 text-sm text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-colors group"
                                onClick={() => {
                                  setIsBikesOpen(false);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              >
                                <svg className="w-4 h-4 mt-0.5 text-red-600 dark:text-red-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                <div>
                                  <div className="font-medium text-sm text-gray-800 dark:text-white">{t('findUsedBikes')}</div>
                                </div>
                              </Link>
                              <Link
                                to="/bikes"
                                className="flex items-start gap-2 text-sm text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-colors group"
                                onClick={() => {
                                  setIsBikesOpen(false);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              >
                                <svg className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                <div>
                                  <div className="font-medium text-sm text-gray-800 dark:text-white">{t('usedBikesListings')}</div>
                                </div>
                              </Link>
                              <Link
                                to="/bikes"
                                className="flex items-start gap-2 text-sm text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-colors group"
                                onClick={() => {
                                  setIsBikesOpen(false);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              >
                                <svg className="w-4 h-4 mt-0.5 text-yellow-500 dark:text-yellow-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <div>
                                  <div className="font-medium text-sm text-gray-800 dark:text-white">{t('premiumBikes')}</div>
                                </div>
                              </Link>
                              <Link
                                to="/sell-car"
                                className="flex items-start gap-2 text-sm text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-colors group"
                                onClick={() => setIsBikesOpen(false)}
                              >
                                <svg className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <div>
                                  <div className="font-medium text-sm text-gray-800 dark:text-white">{t('sellBike')}</div>
                                </div>
                              </Link>
                            </div>
                          </div>

                          {/* Column 2 - New Bikes & Comparisons */}
                          <div>
                            <div className="space-y-2">
                              <Link
                                to="/new-bikes"
                                className="flex items-start gap-2 text-sm text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-colors group"
                                onClick={() => setIsBikesOpen(false)}
                              >
                                <svg className="w-4 h-4 mt-0.5 text-purple-600 dark:text-purple-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                <div>
                                  <div className="font-medium text-sm text-gray-800 dark:text-white">{t('findNewBikes')}</div>
                                </div>
                              </Link>
                              <Link
                                to="/bikes"
                                className="flex items-start gap-2 text-sm text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-colors group"
                                onClick={() => {
                                  setIsBikesOpen(false);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              >
                                <svg className="w-4 h-4 mt-0.5 text-indigo-600 dark:text-indigo-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                  <div className="font-medium text-sm text-gray-800 dark:text-white">{t('newBikesPrices')}</div>
                                </div>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className="relative"
                  ref={autoStoreDropdownRef}
                  onMouseEnter={() => setIsAutoStoreOpen(true)}
                  onMouseLeave={() => setIsAutoStoreOpen(false)}
                >
                  <Link
                    to="/auto-store"
                    className={`px-2 sm:px-3 py-2 text-sm sm:text-base font-medium transition-colors relative flex items-center ${location.pathname === '/auto-store' || isAutoStoreOpen
                      ? 'text-red-600 dark:text-red-500'
                      : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500'
                      }`}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    {t('autoStore')}
                  </Link>

                  {/* Auto Store Dropdown Menu - Multi Column */}
                  {isAutoStoreOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 bg-transparent z-50 w-max max-w-[calc(100vw-2rem)]">
                      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg border border-gray-200 dark:border-gray-700 py-3">
                        <div className="flex flex-col md:flex-row gap-4 px-4">
                          {/* Column 1 - Autofinder Autostore */}
                          <div>
                            <Link
                              to="/auto-store"
                              className="block group"
                              onClick={() => {
                                setIsAutoStoreOpen(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              <div className="flex flex-col items-start gap-3">
                                <svg className="w-8 h-8 text-orange-600 dark:text-orange-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                                    {t('autofinderStore')}
                                  </h4>
                                </div>
                              </div>
                            </Link>
                          </div>

                          {/* Column 2 - Find Auto Parts */}
                          <div>
                            <Link
                              to="/find-auto-parts"
                              className="block group"
                              onClick={() => {
                                setIsAutoStoreOpen(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              <div className="flex flex-col items-start gap-3">
                                <svg className="w-8 h-8 text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                                    {t('findAutoParts')}
                                  </h4>
                                </div>
                              </div>
                            </Link>
                          </div>

                          {/* Column 3 - Sell Car Parts */}
                          <div>
                            <Link to="/sell-car-parts" className="block group" onClick={() => setIsAutoStoreOpen(false)}>
                              <div className="flex flex-col items-start gap-3">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                                    {t('sellCarParts')}
                                  </h4>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  to="/blog"
                  className="px-2 sm:px-3 py-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  {t('blog')}
                </Link>
                <div
                  className="relative"
                  ref={moreDropdownRef}
                  onMouseEnter={() => setIsMoreOpen(true)}
                  onMouseLeave={() => setIsMoreOpen(false)}
                >
                  <div className="px-2 sm:px-3 py-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors flex items-center cursor-pointer">
                    {t('more')}
                  </div>

                  {/* Dropdown Menu - Multi Column */}
                  {isMoreOpen && (
                    <div className="absolute top-full right-0 pt-2 bg-transparent z-50 w-[calc(100vw-2rem)] sm:w-[320px] md:w-[350px] max-w-[350px]">
                      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg border border-gray-200 dark:border-gray-700 py-3">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-4">
                          <Link
                            to="/dealer-packages"
                            className="flex items-center gap-2 text-sm text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-colors group"
                            onClick={() => setIsMoreOpen(false)}
                          >
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            {t('dealerPackages')}
                          </Link>
                          <Link
                            to="/faq"
                            className="flex items-center gap-2 text-sm text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-colors group"
                            onClick={() => setIsMoreOpen(false)}
                          >
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('faqs')}
                          </Link>
                          <Link
                            to="/sell-car"
                            className="flex items-center gap-2 text-sm text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-colors group"
                            onClick={() => setIsMoreOpen(false)}
                          >
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t('sellCar')}
                          </Link>
                          <Link
                            to="/help"
                            className="flex items-center gap-2 text-sm text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-colors group"
                            onClick={() => {
                              setIsMoreOpen(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            {t('help')}
                          </Link>
                          <Link
                            to="/about"
                            className="flex items-center gap-2 text-sm text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-colors group"
                            onClick={() => {
                              setIsMoreOpen(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('aboutUs')}
                          </Link>
                          <Link
                            to="/privacy"
                            className="flex items-center gap-2 text-sm text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-colors group"
                            onClick={() => setIsMoreOpen(false)}
                          >
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            {t('privacyPolicy')}
                          </Link>
                          <Link
                            to="/contact"
                            className="flex items-center gap-2 text-sm text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-all transform hover:scale-105 duration-200 group"
                            onClick={() => setIsMoreOpen(false)}
                          >
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {t('contactUs')}
                          </Link>
                          <Link
                            to="/blog"
                            className="flex items-center gap-2 text-sm text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-colors group"
                            onClick={() => setIsMoreOpen(false)}
                          >
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            {t('blog')}
                          </Link>
                          <Link
                            to="/compare-cars"
                            className="flex items-center gap-2 text-sm text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-colors group"
                            onClick={() => {
                              setIsMoreOpen(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            {t('compare')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Post an Ad Button & Dark Mode Toggle */}
              <div className="hidden md:flex items-center gap-2 ml-auto">
                {/* Language Switcher */}
                <button
                  onClick={toggleLanguage}
                  className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors px-1 py-1 text-xs font-semibold flex items-center gap-1 border-r border-gray-300 dark:border-gray-600"
                >
                  <FaGlobe className="text-xs" />
                  {language === 'en' ? 'اردو' : 'English'}
                </button>

                {/* Dark Mode Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-1 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <FaSun className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <FaMoon className="w-4 h-4" />
                  )}
                </button>

                {/* User Section (Moved from Top Bar) */}

                <div
                  className="relative"
                  ref={postAdDropdownRef}
                  onMouseEnter={() => setIsPostAdOpen(true)}
                  onMouseLeave={() => setIsPostAdOpen(false)}
                >
                  <button className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md font-semibold text-xs sm:text-sm transition-colors shadow-sm whitespace-nowrap">
                    {t('postAd')}
                  </button>

                  {/* Post an Ad Dropdown Menu */}
                  {isPostAdOpen && (
                    <div className="absolute top-full right-0 pt-2 bg-transparent z-50">
                      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-md border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]">
                        <Link
                          to="/sell-car"
                          className="block px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                          onClick={() => {
                            setIsPostAdOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          {t('sellCar')}
                        </Link>
                        <Link
                          to="/sell-bike"
                          className="block px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                          onClick={() => {
                            setIsPostAdOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          {t('sellBike')}
                        </Link>
                        <Link
                          to="/list-it-for-you"
                          className="block px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                          onClick={() => {
                            setIsPostAdOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          {t('listIt')}
                        </Link>
                        <Link
                          to="/post-rent-car"
                          className="block px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                          onClick={() => {
                            setIsPostAdOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          {t('carOnRent')}
                        </Link>
                        <Link
                          to="/buy-car-for-me"
                          className="block px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                          onClick={() => {
                            setIsPostAdOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          {t('buyCarForMe')}
                        </Link>
                        <Link
                          to="/sell-car-parts"
                          className="block px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                          onClick={() => {
                            setIsPostAdOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          {t('autoStore')}
                        </Link>
                        <Link
                          to="/inspection"
                          className="block px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                          onClick={() => {
                            setIsPostAdOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          {t('inspection')}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Section (Moved to the end for right corner placement) */}
                {user ? (
                  <div
                    className="relative"
                    ref={userMenuRef}
                    onMouseEnter={() => {
                      setIsUserMenuOpen(true);
                      // Trigger position update for dropdown if needed by the component logic
                      if (userButtonRef.current) {
                        const rect = userButtonRef.current.getBoundingClientRect();
                        setDropdownPosition({
                          top: rect.bottom,
                          right: window.innerWidth - rect.right
                        });
                      }
                    }}
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <button
                      ref={userButtonRef}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Still allow clicking to toggle for mobile/touch
                        toggleUserMenu();
                      }}
                      className="flex items-center hover:opacity-80 transition-opacity py-1"
                    >
                      {getProfileImageUrl() ? (
                        <img
                          src={getProfileImageUrl()}
                          alt={user.name || 'User'}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border-2 border-red-600 dark:border-red-500"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-600 dark:bg-red-700 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </button>

                    {/* User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div
                        className="user-dropdown-menu fixed bg-white dark:bg-gray-800 shadow-xl rounded-md border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]"
                        style={{
                          top: `${dropdownPosition.top}px`,
                          right: `${dropdownPosition.right}px`,
                          zIndex: 99999
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-3 py-1.5 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{user.name || 'User'}</p>
                            {user.emailVerified && (
                              <svg className="w-3 H-3 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" title="Verified Account">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          {user.email ? (
                            <a
                              href={`https://mail.google.com/mail/u/0/?view=cm&to=${user.email}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-gray-500 dark:text-gray-400 truncate hover:text-red-600 transition-colors block cursor-pointer pointer-events-auto"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {user.email}
                            </a>
                          ) : (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user.phone || ''}</p>
                          )}
                        </div>
                        <Link
                          to="/profile"
                          className="block px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsUserMenuOpen(false);
                          }}
                        >
                          Profile
                        </Link>
                        <Link
                          to="/my-ads"
                          className="block px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsUserMenuOpen(false);
                          }}
                        >
                          My Ads
                        </Link>
                        <Link
                          to="/my-packages"
                          className="block px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsUserMenuOpen(false);
                          }}
                        >
                          My Packages
                        </Link>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-0.5"></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogout();
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 border-l border-gray-300 dark:border-gray-600 pl-2">
                    <Link
                      to="/signup"
                      className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 text-xs font-semibold"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      {language === 'en' ? 'Sign Up' : 'رجسٹر'}
                    </Link>
                    <span className="text-gray-400">|</span>
                    <Link
                      to="/signin"
                      className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 text-xs font-semibold"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      {language === 'en' ? 'Sign In' : 'لاگ ان'}
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center gap-2">
                <button
                  className="text-gray-700 dark:text-gray-300 p-1"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="md:hidden pb-4 border-t border-gray-200 dark:border-gray-700 max-h-[calc(100vh-120px)] overflow-y-auto">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                      {getProfileImageUrl() ? (
                        <img
                          src={getProfileImageUrl()}
                          alt={user.name || 'User'}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-red-600 dark:bg-red-700 flex items-center justify-center text-white font-semibold">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || user.phone || ''}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="block py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        setIsMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {t('profile')}
                    </Link>
                    <Link
                      to="/my-ads"
                      className="block py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        setIsMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {t('myAds')}
                    </Link>
                    <Link
                      to="/my-packages"
                      className="block py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        setIsMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {t('myPackages')}
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="block py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        setIsMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {t('signUp')}
                    </Link>
                    <Link
                      to="/signin"
                      className="block py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        setIsMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {t('signIn')}
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  </>
                )}
                <Link
                  to="/used-cars"
                  className="block py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {t('usedCars')}
                </Link>
                <Link
                  to="/search-cars"
                  className="block py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {t('newCars')}
                </Link>
                <Link
                  to="/bikes"
                  className="block py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {t('bikes')}
                </Link>
                <Link
                  to="/auto-store"
                  className="block py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {t('autoStore')}
                </Link>
                <Link
                  to="/blog"
                  className="block py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {t('blog')}
                </Link>
                <Link
                  to="/dealer-packages"
                  className="block py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {t('dealerPackages')}
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 px-4 py-1">{t('more')}</div>
                <Link
                  to="/about"
                  className="block py-2 px-4 pl-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {t('aboutUs')}
                </Link>
                <Link
                  to="/contact"
                  className="block py-2 px-4 pl-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all transform hover:scale-105 duration-200"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {t('contactUs')}
                </Link>
                <Link
                  to="/compare-cars"
                  className="block py-2 px-4 pl-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {t('compare')}
                </Link>

                {/* Dark Mode Toggle Button - Mobile */}
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 w-full py-2 px-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md"
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {theme === 'dark' ? (
                      <>
                        <FaSun className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm font-medium">{t('lightMode')}</span>
                      </>
                    ) : (
                      <>
                        <FaMoon className="w-5 h-5" />
                        <span className="text-sm font-medium">{t('darkMode')}</span>
                      </>
                    )}
                  </button>
                </div>

                <Link
                  to="/sell-car"
                  className="block mt-2 mx-4 bg-red-600 text-white px-4 py-2 rounded-md text-center font-semibold"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {t('postAd')}
                </Link>
                {user && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block mt-2 mx-4 w-auto bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-center font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('logout')}
                  </button>
                )}
              </div>
            )}
          </div>
        </header >
      </div >
    </>
  );
};

export default Header;
