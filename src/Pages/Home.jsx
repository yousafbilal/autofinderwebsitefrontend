import CinematicView from "../Components/Cinematic/CinematicView";
import React, { useState, useEffect } from "react";
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from "react-toastify";
import { analyzeVoiceCommand } from "../Utils/VoiceNavigationLogic";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCar,
  FaStar,
  FaPhone,
  FaEnvelope,
  FaGift,
  FaSearch,
  FaClipboardList,
  FaClipboardCheck,
  FaCarSide,
  FaRocket,
  FaCrown,
  FaRobot,
  FaTasks,
  FaMicroscope,
  FaKey,
  FaArrowRight,
  FaBullhorn,
  FaGem,
  FaBrain,
  FaLayerGroup,
  FaShieldAlt,
  FaRoute
} from "react-icons/fa";
import ManagedByAutofinder from "../Components/ManagedByAutofinder";
import PopularNewCars from "../Components/PopularNewCars";
import YoutubeShortsSection from "../Components/YoutubeShortsSection";
import PremiumCars from "../Components/PremiumCars";
import PremiumBikes from "../Components/PremiumBikes";
import RentCars from "../Components/RentCars";
import AutoStoreItems from "../Components/AutoStoreItems";
import LatestNewsSection from "../Components/LatestNewsSection";

import BlogPreviewSection from "../Components/BlogPreviewSection";


import { server_ip, cities, budgetRanges } from "../Utils/Data";
import { fetchWithRetry } from "../Utils/ApiUtils";
import CustomSelect from "../Components/CustomSelect";
import VoiceSearchComp from "../Components/VoiceSearch";



// Car makes list
const carMakes = [
  "Suzuki",
  "Toyota",
  "Honda",
  "Hyundai",
  "Kia",
  "MG",
  "Changan",
  "FAW",
  "Peugeot",
  "Nissan",
  "Mitsubishi",
  "Daihatsu",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volkswagen",
  "Ford",
  "Chevrolet",
  "Jeep",
  "Land Rover",
  "Range Rover",
  "Porsche",
  "Lexus",
  "Infiniti",
  "Mazda",
  "Subaru",
  "Volvo",
  "Jaguar",
  "Mini",
  "Fiat",
  "Renault",
  "Proton",
  "Chery",
  "Great Wall",
  "BYD",
  "GAC",
  "Haval",
  "Isuzu",
  "SsangYong",
].sort();

// Brand Logo Component with fallback
const BrandLogo = ({
  src,
  alt,
  fallback,
  className = "w-12 h-12 object-contain mx-auto",
}) => {
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImgError(true)}
    />
  );
};

// 3D Flip Card Component for Autofinder Services
const ServiceFlipCard = React.memo(({ front, back, onClick }) => {
  const [rotate, setRotate] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = React.useCallback((e) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
    const centerX = card.width / 2;
    const centerY = card.height / 2;
    const rotateX = (centerY - y) / 8;
    const rotateY = (x - centerX) / 8;

    setRotate({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  return (
    <div
      className="group relative h-30 sm:h-36 w-full cursor-pointer transition-transform active:scale-95"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1500px" }}
    >
      <div
        className="relative w-full h-full transition-all duration-[300ms]"
        style={{
          transformStyle: "preserve-3d",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isHovered
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y + 180}deg)`
            : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        <div
          className="absolute inset-0 bg-white border border-gray-100 flex flex-col items-center justify-center p-1.5 gap-1 shadow-sm"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "translateZ(15px)",
            borderRadius: "0.75rem",
            zIndex: isHovered ? 0 : 2
          }}
        >
          {front}
        </div>

        <div
          className="absolute inset-0 bg-[#b91c1c] text-white flex flex-col items-center justify-center p-3 text-center shadow-2xl"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg) translateZ(16px)",
            borderRadius: "0.75rem",
            zIndex: isHovered ? 2 : 0
          }}
        >
          {back}
        </div>
      </div>
    </div>
  );
});

function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState("NEW CAR");
  const [activeTab, setActiveTab] = useState("MANAGED BY AUTOFINDER");
  const [searchBy, setSearchBy] = useState("BUDGET");
  const [activeFilter, setActiveFilter] = useState("Category");
  const [categoryPage, setCategoryPage] = useState(0);
  const [makePage, setMakePage] = useState(0);
  const [selectedFilterValue, setSelectedFilterValue] = useState(null);
  const [showNoCarsMessage, setShowNoCarsMessage] = useState(false);
  const [usedCarFilter, setUsedCarFilter] = useState("CITY"); // 'CITY' or 'PRICE'

  // Statistics for dynamic CTA section
  const [totalCars, setTotalCars] = useState(0);
  const [verifiedSellers, setVerifiedSellers] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Navigation helpers for offerings section
  const handleFreeAdClick = () => {
    navigate("/sell-car?service=free");
  };



  const handleBuyCarForMeClick = () => {
    navigate("/buy-car-for-me");
  };

  const handleListItForMeClick = () => {
    navigate("/list-it-for-you");
  };

  const handleCarInspectionClick = () => {
    navigate("/inspection"); // assumes inspection listing/booking route (as in mobile app)
  };

  const handleCarOnRentClick = () => {
    navigate("/post-rent-car"); // Navigate directly to rent car form
  };

  // Fetch statistics for CTA section
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoadingStats(true);
        const API_URL = server_ip || "http://localhost:8001";

        // Fetch all car ads and users in parallel using robust fetch
        const [carsResponse, usersResponse] = await Promise.all([
          fetchWithRetry(`${API_URL}/all_ads`),
          fetchWithRetry(`${API_URL}/users`),
        ]);

        if (carsResponse.ok && usersResponse.ok) {
          const carsData = await carsResponse.json();
          const usersData = await usersResponse.json();

          // Count active cars (filter out deleted and inactive)
          const activeCars = Array.isArray(carsData)
            ? carsData.filter((car) => {
              const isActive =
                car.isActive === true || car.isActive === undefined;
              const isNotDeleted = !car.isDeleted;
              const isNotRejected =
                car.isFeatured !== "Rejected" &&
                car.isApproved !== "Rejected";
              return isActive && isNotDeleted && isNotRejected;
            }).length
            : 0;

          // Count verified sellers (users with emailVerified: true)
          const verifiedCount = Array.isArray(usersData)
            ? usersData.filter((user) => user.emailVerified === true).length
            : 0;

          setTotalCars(activeCars);
          setVerifiedSellers(verifiedCount);
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
        // Set default values on error
        setTotalCars(0);
        setVerifiedSellers(0);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStatistics();
  }, []);

  // Search form states
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Mock function to check if cars are available (replace with actual API call)
  const checkCarsAvailability = (filterType, filterValue) => {
    // Simulate checking - randomly return true/false for demo
    // In real app, this would be an API call
    const hasCars = Math.random() > 0.3; // 70% chance of having cars
    return hasCars;
  };

  const handleFilterClick = (filterType, filterValue) => {
    setSelectedFilterValue({ type: filterType, value: filterValue });
    const hasCars = checkCarsAvailability(filterType, filterValue);
    setShowNoCarsMessage(!hasCars);

    // If cars are available, navigate to used-cars page
    if (hasCars) {
      const queryParam = filterValue.toLowerCase().replace(/\s+/g, "-");
      window.location.href = `/used-cars?${filterType.toLowerCase()}=${queryParam}`;
    }
  };

  // Handle search form submission
  const handleSearch = () => {
    if (searchBy === "BUDGET" && !selectedBudget) {
      alert("Please select a budget range");
      return;
    }
    if (searchBy === "MODEL" && !selectedModel) {
      alert("Please select a car model");
      return;
    }
    // City is now optional

    // Build query parameters
    const params = new URLSearchParams();

    if (searchBy === "BUDGET") {
      params.append("budget", selectedBudget);
    } else {
      params.append("make", selectedModel);
    }

    if (selectedCity) {
      params.append("city", selectedCity);
    }

    // Navigate based on search type
    if (searchType === "NEW CAR") {
      navigate(`/latest-cars?${params.toString()}`);
    } else {
      navigate(`/used-cars?${params.toString()}`);
    }
  };


  // Auto-search when budget is selected (similar to model)


  // Auto-search when budget is selected (similar to model)

  useEffect(() => {
    if (searchBy === "BUDGET" && selectedBudget && selectedCity) {
      const params = new URLSearchParams();
      params.append("budget", selectedBudget);
      params.append("city", selectedCity);

      if (searchType === "NEW CAR") {
        navigate(`/latest-cars?${params.toString()}`);
      } else {
        navigate(`/used-cars?${params.toString()}`);
      }
    }
  }, [selectedBudget, selectedCity, searchBy, searchType, navigate]);

  // Removed static cars array - all tabs now use dynamic components

  return (
    <>
      <Helmet>
        <title>Auto Finder - Car Dealership | Home</title>
      </Helmet>

      {/* Hero Search Section */}
      <section className="relative h-screen snap-start flex items-center justify-center overflow-hidden">
        {/* 3D Animated Car Video Background */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover scale-110 transition-transform duration-700 hover:scale-100"
            style={{ zIndex: 0 }}
          >
            <source
              src="/assets/videos/original-9c94a27b019688ee5cc12e7fdee8f02d.mp4"
              type="video/mp4"
            />
            {/* Fallback if video doesn't load */}
            Your browser does not support the video tag.
          </video>
          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        </div>

        {/* Content Container - Adjusted Padding for Transparent Header */}
        <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10 w-full h-full flex items-center justify-center pt-[120px] sm:pt-[110px]">
          <div className="flex items-center justify-center w-full">
            {/* Search Form - Compact Beautiful Design */}
            <div className={`rounded-lg sm:rounded-xl shadow-2xl dark:shadow-gray-900 w-full max-w-[270px] sm:max-w-[300px] md:max-w-[320px] mx-auto transform transition-all duration-300 hover:shadow-3xl border border-gray-200 dark:border-gray-700 
              ${searchType === "USED CAR"
                ? "bg-gradient-to-br from-red-600 to-red-800 text-white"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              }`}>
              {/* Header Section */}
              <div className={`py-1 sm:py-1 px-2 sm:px-3 rounded-t-lg sm:rounded-t-xl transition-colors duration-300 
                ${searchType === "USED CAR"
                  ? "bg-black/20 text-white"
                  : "bg-gradient-to-r from-red-600 to-red-700 text-white"
                }`}>
                <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                  <FaCar className="text-xs sm:text-sm" />
                  <h2 className="text-[10px] xs:text-xs sm:text-sm font-bold tracking-wide">
                    {t('heroTitle')}
                  </h2>
                </div>
              </div>

              <div className="p-1 sm:p-1.5 md:p-2">
                {/* Tabs */}
                <div className="flex justify-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
                  <button
                    onClick={() => setSearchType("NEW CAR")}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-[9px] xs:text-[10px] sm:text-xs font-semibold transition-all duration-200 
                      ${searchType === "NEW CAR"
                        ? "bg-red-600 text-white shadow-md shadow-red-500/30"
                        : searchType === "USED CAR"
                          ? "bg-white/20 text-white hover:bg-white/30"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                  >
                    {t('newCar')}
                  </button>
                  <button
                    onClick={() => setSearchType("USED CAR")}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-[9px] xs:text-[10px] sm:text-xs font-semibold transition-all duration-200 
                      ${searchType === "USED CAR"
                        ? "bg-white text-red-700 shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                  >
                    {t('usedCar')}
                  </button>
                </div>

                {/* Radio Buttons */}
                <div className="flex justify-center gap-2 sm:gap-3 mb-1 sm:mb-1.5">
                  <label className="flex items-center justify-start gap-1.5 sm:gap-2 cursor-pointer group w-24 sm:w-28">
                    <input
                      id="search-by-budget"
                      type="radio"
                      name="searchBy"
                      value="BUDGET"
                      checked={searchBy === "BUDGET"}
                      onChange={(e) => setSearchBy(e.target.value)}
                      className={`w-3 h-3 sm:w-4 sm:h-4 cursor-pointer focus:ring-offset-1 
                        ${searchType === "USED CAR"
                          ? "accent-red-900 bg-white/20 border-white/50 focus:ring-red-900"
                          : "text-red-600 accent-red-600 focus:ring-red-500"}`}
                    />
                    <span
                      className={`text-[10px] xs:text-xs sm:text-sm font-medium transition-colors 
                        ${searchType === "USED CAR"
                          ? "text-white/90"
                          : searchBy === "BUDGET" ? "text-red-600 dark:text-red-500" : "text-gray-700 dark:text-gray-300 group-hover:text-red-500"
                        }`}
                    >
                      {t('byBudget')}
                    </span>
                  </label>
                  <label className="flex items-center justify-start gap-1.5 sm:gap-2 cursor-pointer group w-28 sm:w-32 -ml-2">
                    <input
                      id="search-by-model"
                      type="radio"
                      name="searchBy"
                      value="MODEL"
                      checked={searchBy === "MODEL"}
                      onChange={(e) => setSearchBy(e.target.value)}
                      className={`w-3 h-3 sm:w-4 sm:h-4 cursor-pointer focus:ring-offset-1 
                        ${searchType === "USED CAR"
                          ? "accent-red-900 bg-white/20 border-white/50 focus:ring-red-900"
                          : "text-red-600 accent-red-600 focus:ring-red-500"}`}
                    />
                    <span
                      className={`text-[10px] xs:text-xs sm:text-sm font-medium transition-colors 
                        ${searchType === "USED CAR"
                          ? "text-white/90"
                          : searchBy === "MODEL" ? "text-red-600 dark:text-red-500" : "text-gray-700 dark:text-gray-300 group-hover:text-red-500"
                        }`}
                    >
                      {t('byModel')}
                    </span>
                  </label>
                </div>

                {/* Third Row - Dropdowns and Buttons */}
                <div className="space-y-1">
                  {searchBy === "BUDGET" ? (
                    <>
                      {/* First Row - SELECT BUDGET and SELECT CITY */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-1">
                        <CustomSelect
                          options={budgetRanges}
                          value={selectedBudget}
                          onChange={setSelectedBudget}
                          placeholder={t('selectBudget')}
                          className="w-full sm:w-32"
                        />
                        <div className="relative flex items-center gap-2">
                          <CustomSelect
                            options={cities}
                            value={selectedCity}
                            onChange={setSelectedCity}
                            placeholder={t('selectCity')}
                            searchable={true}
                            className="w-full sm:w-28"
                          />
                          <VoiceSearchComp
                            onResult={(text) => {
                              console.log('Home Search Voice:', text);

                              // 1. Analyze for global navigation
                              const { action, path } = analyzeVoiceCommand(text, { silent: true });
                              if (action === 'NAVIGATE' && path) {
                                navigate(path);
                                return;
                              }

                              // 2. Fallback to Filter Filling (if no navigation)
                              const textLower = text.toLowerCase();

                              // Try to find a city match
                              const foundCity = cities.find(c => textLower.includes(c.toLowerCase()));
                              if (foundCity) setSelectedCity(foundCity);

                              // Try to find a budget match
                              const foundBudget = budgetRanges.find(b => textLower.includes(b.toString().toLowerCase()));
                              if (foundBudget) setSelectedBudget(foundBudget);
                            }}
                            className={`p-1.5 rounded-lg border ${searchType === "USED CAR" ? "bg-white/10 border-white/30 text-white" : "bg-gray-100 border-gray-200 text-gray-600"}`}
                            silent={true}
                          />
                        </div>
                      </div>
                      {/* Second Row - SEARCH and ADVANCED SEARCH */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-1">
                        <button
                          onClick={handleSearch}
                          className={`py-1.5 sm:py-2 px-3 sm:px-4 rounded-md font-semibold text-[9px] xs:text-[10px] sm:text-xs transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap flex-1 sm:flex-none 
                            ${searchType === "USED CAR"
                              ? "bg-white text-red-700 hover:bg-gray-100"
                              : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"}`}
                        >
                          <svg
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          {t('search')}
                        </button>
                        <Link
                          to="/used-cars"
                          className={`font-medium text-[9px] xs:text-[10px] sm:text-xs transition-colors duration-200 flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md whitespace-nowrap flex-1 sm:flex-none 
                            ${searchType === "USED CAR"
                              ? "text-white/80 hover:text-white hover:bg-white/10"
                              : "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                        >
                          {t('advancedSearch')}
                          <svg
                            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${searchType === "USED CAR" ? "text-white" : "text-red-600"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* First Row - SELECT MODEL and SELECT CITY */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-1">
                        <CustomSelect
                          options={carMakes}
                          value={selectedModel}
                          onChange={setSelectedModel}
                          placeholder={t('selectModel')}
                          searchable={true}
                          className="w-full sm:w-32"
                        />
                        <div
                          className="relative flex items-center gap-2"
                          style={{ zIndex: 1 }}
                        >
                          <CustomSelect
                            options={cities}
                            value={selectedCity}
                            onChange={setSelectedCity}
                            placeholder={t('selectCity')}
                            searchable={true}
                            className="w-full sm:w-32"
                          />
                          <VoiceSearchComp
                            onResult={(text) => {
                              console.log('Model Search Voice:', text);

                              // 1. Analyze for global navigation
                              const { action, path } = analyzeVoiceCommand(text, { silent: true });
                              if (action === 'NAVIGATE' && path) {
                                navigate(path);
                                return;
                              }

                              // 2. Fallback to Filter Filling
                              const textLower = text.toLowerCase();

                              // Match Model
                              const foundModel = carMakes.find(m => textLower.includes(m.toLowerCase()));
                              if (foundModel) setSelectedModel(foundModel);

                              // Match City
                              const foundCity = cities.find(c => textLower.includes(c.toLowerCase()));
                              if (foundCity) setSelectedCity(foundCity);
                            }}
                            className={`p-1.5 rounded-lg border ${searchType === "USED CAR" ? "bg-white/10 border-white/30 text-white" : "bg-gray-100 border-gray-200 text-gray-600"}`}
                            silent={true}
                          />
                        </div>
                      </div>
                      {/* Second Row - SEARCH and ADVANCED SEARCH */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-1.5 sm:gap-2">
                        <button
                          onClick={handleSearch}
                          className={`py-1.5 sm:py-2 px-3 sm:px-4 rounded-md font-semibold text-[9px] xs:text-[10px] sm:text-xs transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap flex-1 sm:flex-none 
                            ${searchType === "USED CAR"
                              ? "bg-white text-red-700 hover:bg-gray-100"
                              : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"}`}
                        >
                          <svg
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          {t('search')}
                        </button>
                        <Link
                          to="/used-cars"
                          className={`font-medium text-[9px] xs:text-[10px] sm:text-xs transition-colors duration-200 flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md whitespace-nowrap flex-1 sm:flex-none 
                            ${searchType === "USED CAR"
                              ? "text-white/80 hover:text-white hover:bg-white/10"
                              : "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                        >
                          {t('advancedSearch')}
                          <svg
                            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${searchType === "USED CAR" ? "text-white" : "text-red-600"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >









      {/* Sell Your Car Section */}
      < section className="min-h-screen snap-start flex items-center justify-center py-8 sm:py-12 md:py-16 bg-white dark:bg-gray-800 transition-colors" >



        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Content */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-4 uppercase leading-none tracking-tighter text-center"
              style={{ textShadow: "1px 1px 0 #ccc, 2px 2px 0 #ccc, 3px 3px 0 #ccc, 4px 4px 0 #ccc, 6px 6px 20px rgba(0,0,0,0.1)" }}>
              {t('sellCarDataTitle')}
            </h2>
          </div>

          {/* Two Column Layout */}
          <div className="relative max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {/* Left Column - Sell It Myself */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl border border-gray-800/70 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-transform duration-200 flex flex-col">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,0,0,0.18),transparent_30%)]" />
                <div className="relative p-4 sm:p-5 md:p-6 flex flex-col flex-1 min-h-full">
                  <div className="flex flex-col flex-1">
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-[10px] xs:text-xs font-semibold text-green-200 mb-2 sm:mb-3">
                      {t('diySeller')}
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                      {t('sellItMyself')}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4">
                      {t('diyDesc')}
                    </p>
                    <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                      {[
                        t('postAdTime'),
                        t('userCount'),
                        t('connectBuyers'),
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 sm:gap-3"
                        >
                          <span className="flex h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-green-500/15 border border-green-500/40 text-green-200 flex-shrink-0">
                            ✓
                          </span>
                          <span className="text-xs sm:text-sm md:text-base text-gray-100">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Link
                    to="/sell-car"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="block w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base md:text-lg text-center transition-all shadow-lg hover:shadow-red-900/40 mt-auto"
                  >
                    {t('postYourAd')}
                  </Link>
                </div>
              </div>

              {/* Right Column - Car Inspection */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-700 via-red-600 to-red-700 text-white shadow-2xl border border-red-500/50 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(185,28,28,0.45)] transition-transform duration-200 flex flex-col">
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.15),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.2),transparent_25%)]"></div>
                <div className="relative p-4 sm:p-5 md:p-6 flex flex-col flex-1 min-h-full">
                  <div className="flex flex-col flex-1">
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-white/15 border border-white/25 text-[10px] xs:text-xs font-semibold mb-2 sm:mb-3">
                      {t('professionalService')}
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                      {t('carInspection')}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4">
                      {t('inspectionDesc')}
                    </p>
                    <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                      {[
                        t('expertInspection'),
                        t('report'),
                        t('guarantee'),
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 sm:gap-3"
                        >
                          <span className="flex h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-white/15 border border-white/25 text-xs sm:text-sm flex-shrink-0">
                            ✓
                          </span>
                          <span className="text-xs sm:text-sm md:text-base text-white">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Link
                    to="/inspection"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="block w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base md:text-lg text-center transition-all shadow-lg hover:shadow-red-900/40 mt-auto"
                  >
                    {t('carInspection')}
                  </Link>
                </div>
              </div>
            </div>

            {/* OR Separator */}
            <div className="hidden md:flex items-center justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-white dark:bg-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg border-2 border-gray-200 dark:border-gray-700">
                <span className="text-xl sm:text-2xl font-bold text-gray-500 dark:text-gray-400">
                  {t('or')}
                </span>
              </div>
            </div>
            {/* Mobile OR Separator */}
            <div className="md:hidden flex items-center justify-center my-4">
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg border-2 border-gray-200 dark:border-gray-700">
                <span className="text-lg font-bold text-gray-500 dark:text-gray-400">
                  {t('or')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Browse Used Cars Section */}
      {/* Browse Used Cars Section */}
      <section className="min-h-screen snap-start flex flex-col justify-center py-8 sm:py-12 md:py-16 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-6 sm:mb-8 text-center px-2 uppercase tracking-wider"
            style={{ textShadow: "1px 1px 0 #ccc, 2px 2px 0 #ccc, 3px 3px 0 #ccc, 4px 4px 0 #ccc, 6px 6px 20px rgba(0,0,0,0.1)" }}>
            {t('browseUsedCars')}
          </h2>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 border-b-2 border-gray-200 dark:border-gray-700 pb-3 sm:pb-4 overflow-x-auto">
            {[
              { key: "Category", label: t('category') },
              { key: "City", label: t('city') },
              { key: "Make", label: t('make') },
              { key: "Model", label: t('model') },
              { key: "Budget", label: t('budget') },
              { key: "Body Type", label: t('bodyType') }
            ].map(
              (filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 font-normal text-xs sm:text-sm md:text-base transition-colors relative whitespace-nowrap ${activeFilter === filter.key
                    ? "text-blue-600 dark:text-blue-500"
                    : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"
                    }`}
                >
                  {filter.label}
                  {activeFilter === filter.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                  )}
                </button>
              )
            )}
          </div>

          {/* Category Grid */}
          {activeFilter === "Category" && (
            <div className="relative">
              {/* Navigation Arrows */}
              <button
                onClick={() => setCategoryPage(Math.max(0, categoryPage - 1))}
                disabled={categoryPage === 0}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 sm:-translate-x-4 bg-white dark:bg-gray-800 rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() => setCategoryPage(Math.min(1, categoryPage + 1))}
                disabled={categoryPage === 1}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 sm:translate-x-4 bg-white dark:bg-gray-800 rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Categories Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 max-w-6xl mx-auto">
                {[
                  {
                    name: "Automatic cars",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/sedan.png"
                        alt="Automatic Cars"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "Family Cars",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/familycar.png"
                        alt="Family Cars"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "5 Seater",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/fiveseater.png"
                        alt="5 Seater"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "Small cars",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/smallcar.png"
                        alt="Small Cars"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "Big cars",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/Bigcar.png"
                        alt="Big Cars"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "Old Cars",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/oldcar.png"
                        alt="Old Cars"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "Imported cars",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/imported.png"
                        alt="Imported Cars"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "5 Door",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/fivedoor.png"
                        alt="5 Door"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "4 Door",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/fourdoor.png"
                        alt="4 Door"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "1000cc cars",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/cc1000.png"
                        alt="1000cc Cars"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "1300cc cars",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/cc1300.png"
                        alt="1300cc Cars"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "Japanese cars",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/japanese.png"
                        alt="Japanese Cars"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "660cc cars",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/cc660.png"
                        alt="660cc Cars"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "Low Priced cars",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/lowprice.png"
                        alt="Low Priced Cars"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "Jeep",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/jeep.png"
                        alt="Jeep"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "Cheap cars",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/cheapcar.png"
                        alt="Cheap Cars"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "Low Mileage Cars",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/lowmileage.png"
                        alt="Low Mileage Cars"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "Hybrid cars",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/hybrid.png"
                        alt="Hybrid Cars"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "4 Seater",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/fourseater.png"
                        alt="4 Seater"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "Diesel cars",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/sedan.png"
                        alt="Diesel Cars"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "Commercial",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/truck.png"
                        alt="Commercial"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "7 Seater",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/mpv.png"
                        alt="7 Seater"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "Carry Daba",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/bolan.png"
                        alt="Carry Daba"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                  {
                    name: "Electric cars",
                    icon: (
                      <img
                        src="/assets/Browse Used Cars/hybrid.png"
                        alt="Electric Cars"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ),
                  },
                ]
                  .slice(categoryPage * 12, (categoryPage + 1) * 12)
                  .map((category, index) => (
                    <div
                      key={index}
                      onClick={() =>
                        handleFilterClick("category", category.name)
                      }
                      className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center hover:shadow-[0_10px_20px_rgba(220,38,38,0.2)] hover:scale-105 transition-all duration-300 cursor-pointer group border border-gray-100 dark:border-gray-700"
                    >
                      <div className="mb-1 text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors flex items-center justify-center">
                        <div className="scale-100 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                      </div>
                      <div className="text-[10px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors leading-tight">
                        {category.name}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-1.5 mt-6">
                {[0, 1].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCategoryPage(page)}
                    className={`w-2 h-2 rounded-full transition-colors ${categoryPage === page ? "bg-blue-600" : "bg-blue-300"
                      }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* City Filter */}
          {activeFilter === "City" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 max-w-6xl mx-auto">
              {[
                { name: "Karachi", icon: "/assets/Cities/karachi.png" },
                { name: "Lahore", icon: "/assets/Cities/lahore.png" },
                { name: "Islamabad", icon: "/assets/Cities/islamabad.png" },
                { name: "Rawalpindi", icon: "/assets/Cities/rawalpindi.png" },
                { name: "Peshawar", icon: "/assets/Cities/peshawar.png" },
                { name: "Faisalabad", icon: "/assets/Cities/faisalabad.png" },
                { name: "Multan", icon: "/assets/Cities/multan.png" },
                { name: "Gujranwala", icon: "/assets/Cities/gujranwala.png" },
                { name: "Sialkot", icon: "/assets/Cities/sialkot.png" },
                { name: "Sargodha", icon: "/assets/Cities/sargodha.png" },
                { name: "Abbottabad", icon: "/assets/Cities/abbottabad.png" },
                { name: "Hyderabad", icon: "/assets/Cities/hyderabad.png" },
              ].map((city) => (
                <div
                  key={city.name}
                  onClick={() => handleFilterClick("city", city.name)}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:shadow-[0_10px_20px_rgba(220,38,38,0.2)] hover:scale-105 transition-all duration-300 cursor-pointer group border border-gray-100 dark:border-gray-700"
                >
                  {city.icon && (
                    <img
                      src={city.icon}
                      alt={city.name}
                      className={`${city.name === "Abbottabad" ||
                        city.name === "Rawalpindi"
                        ? "w-14 h-14 scale-150 object-contain z-10"
                        : "w-10 h-10 object-contain"
                        } group-hover:scale-110 transition-transform duration-300`}
                    />
                  )}
                  <div className={`text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors whitespace-nowrap ${city.name === "Abbottabad" || city.name === "Rawalpindi" ? "-mt-2" : ""}`}>
                    {city.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Make Filter */}
          {activeFilter === "Make" && (
            <div className="relative">
              {/* Navigation Arrows */}
              <button
                onClick={() => setMakePage(Math.max(0, makePage - 1))}
                disabled={makePage === 0}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 sm:-translate-x-4 bg-white dark:bg-gray-800 rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() => setMakePage(Math.min(1, makePage + 1))}
                disabled={makePage === 1}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 sm:translate-x-4 bg-white dark:bg-gray-800 rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Makes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 max-w-6xl mx-auto">
                {[
                  {
                    name: "Suzuki",
                    logoUrl: "/assets/Make/suzuki.png",
                    fallback: (
                      <span className="text-xl font-bold text-red-600">S</span>
                    ),
                  },
                  {
                    name: "Toyota",
                    logoUrl: "/assets/Make/toyota.png",
                    fallback: (
                      <svg
                        className="w-10 h-10 mx-auto"
                        viewBox="0 0 100 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <ellipse
                          cx="50"
                          cy="30"
                          rx="35"
                          ry="20"
                          stroke="#808080"
                          strokeWidth="2"
                          fill="none"
                        />
                        <ellipse
                          cx="50"
                          cy="30"
                          rx="25"
                          ry="15"
                          stroke="#808080"
                          strokeWidth="1.5"
                          fill="none"
                        />
                      </svg>
                    ),
                  },
                  {
                    name: "Honda",
                    logoUrl: "/assets/Make/honda.png",
                    fallback: (
                      <span className="text-2xl font-bold text-gray-600">
                        H
                      </span>
                    ),
                  },
                  {
                    name: "Daihatsu",
                    logoUrl: "/assets/Make/daihatsu  logo.webp",
                    fallback: (
                      <span
                        className="text-xl font-bold text-red-600"
                        style={{ fontFamily: "serif" }}
                      >
                        D
                      </span>
                    ),
                  },
                  {
                    name: "Nissan",
                    logoUrl: "/assets/Make/nisan.png",
                    fallback: (
                      <svg
                        className="w-10 h-10 mx-auto"
                        viewBox="0 0 100 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="50"
                          cy="30"
                          r="20"
                          stroke="#808080"
                          strokeWidth="2"
                          fill="none"
                        />
                        <text
                          x="50"
                          y="35"
                          fontSize="8"
                          fill="#808080"
                          textAnchor="middle"
                          fontFamily="Arial"
                          fontWeight="bold"
                        >
                          NISSAN
                        </text>
                      </svg>
                    ),
                  },
                  {
                    name: "Hyundai",
                    logoUrl: "/assets/Make/hyundai.png",
                    fallback: (
                      <span
                        className="text-2xl font-bold text-gray-600"
                        style={{ fontStyle: "italic" }}
                      >
                        H
                      </span>
                    ),
                  },
                  {
                    name: "KIA",
                    logoUrl: "/assets/Make/kia.png",
                    fallback: (
                      <span
                        className="text-xl font-bold text-black"
                        style={{ letterSpacing: "2px" }}
                      >
                        KI
                      </span>
                    ),
                  },
                  {
                    name: "Mitsubishi",
                    logoUrl: "/assets/Make/mitsubishi.png",
                    fallback: (
                      <svg
                        className="w-10 h-10 mx-auto"
                        viewBox="0 0 100 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M50 15 L60 35 L40 35 Z" fill="#DC143C" />
                        <path d="M40 35 L50 45 L30 45 Z" fill="#DC143C" />
                        <path d="M60 35 L70 45 L50 45 Z" fill="#DC143C" />
                      </svg>
                    ),
                  },
                  {
                    name: "Changan",
                    logoUrl:
                      "https://logos-world.net/wp-content/uploads/2021/03/Changan-Logo.png",
                    fallback: (
                      <span
                        className="text-xl font-bold text-black"
                        style={{ fontFamily: "serif" }}
                      >
                        V
                      </span>
                    ),
                  },
                  {
                    name: "Haval",
                    logoUrl: "/assets/Make/haval logo.jfif",
                    fallback: (
                      <span className="text-lg font-bold text-gray-600">
                        HAVAL
                      </span>
                    ),
                  },
                  {
                    name: "Mercedes Benz",
                    logoUrl: "/assets/Make/mercedes.png",
                    fallback: (
                      <svg
                        className="w-10 h-10 mx-auto"
                        viewBox="0 0 100 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="50"
                          cy="30"
                          r="18"
                          stroke="#808080"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M50 12 L55 30 L50 48 L45 30 Z"
                          fill="#808080"
                        />
                      </svg>
                    ),
                  },
                  {
                    name: "MG",
                    logoUrl: "/assets/Make/mg  Logo  1.png",
                    fallback: (
                      <svg
                        className="w-10 h-10 mx-auto"
                        viewBox="0 0 100 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="30"
                          y="15"
                          width="40"
                          height="30"
                          rx="5"
                          stroke="#DC143C"
                          strokeWidth="2"
                          fill="none"
                        />
                        <text
                          x="50"
                          y="38"
                          fontSize="12"
                          fill="#DC143C"
                          textAnchor="middle"
                          fontFamily="Arial"
                          fontWeight="bold"
                        >
                          MG
                        </text>
                      </svg>
                    ),
                  },
                  {
                    name: "Audi",
                    logoUrl: "/assets/Make/audi.png",
                    fallback: (
                      <svg
                        className="w-10 h-10 mx-auto"
                        viewBox="0 0 100 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="25"
                          cy="30"
                          r="8"
                          stroke="#808080"
                          strokeWidth="2"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="30"
                          r="8"
                          stroke="#808080"
                          strokeWidth="2"
                          fill="none"
                        />
                        <circle
                          cx="55"
                          cy="30"
                          r="8"
                          stroke="#808080"
                          strokeWidth="2"
                          fill="none"
                        />
                        <circle
                          cx="70"
                          cy="30"
                          r="8"
                          stroke="#808080"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    ),
                  },
                  {
                    name: "FAW",
                    logoUrl:
                      "https://www.carlogos.org/logo/FAW-logo-1920x1080.png",
                    fallback: (
                      <svg
                        className="w-10 h-10 mx-auto"
                        viewBox="0 0 100 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="30"
                          y="15"
                          width="40"
                          height="30"
                          rx="3"
                          stroke="#0066CC"
                          strokeWidth="2"
                          fill="none"
                        />
                        <text
                          x="50"
                          y="35"
                          fontSize="10"
                          fill="#0066CC"
                          textAnchor="middle"
                          fontFamily="Arial"
                          fontWeight="bold"
                        >
                          FAW
                        </text>
                      </svg>
                    ),
                  },
                  {
                    name: "BMW",
                    logoUrl: "/assets/Make/bmw.png",
                    fallback: (
                      <svg
                        className="w-10 h-10 mx-auto"
                        viewBox="0 0 100 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="50"
                          cy="30"
                          r="20"
                          stroke="#0066CC"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M50 10 L50 50 M30 30 L70 30"
                          stroke="#0066CC"
                          strokeWidth="2"
                        />
                        <path d="M35 20 L50 30 L35 40" fill="#0066CC" />
                      </svg>
                    ),
                  },
                  {
                    name: "Mazda",
                    logoUrl: "/assets/Make/mazda.png",
                    fallback: (
                      <svg
                        className="w-10 h-10 mx-auto"
                        viewBox="0 0 100 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <ellipse
                          cx="50"
                          cy="30"
                          rx="25"
                          ry="15"
                          stroke="#808080"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M40 25 L50 30 L40 35"
                          stroke="#808080"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    ),
                  },
                  {
                    name: "Lexus",
                    logoUrl: "/assets/Make/lexus.png",
                    fallback: (
                      <svg
                        className="w-10 h-10 mx-auto"
                        viewBox="0 0 100 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <ellipse
                          cx="50"
                          cy="30"
                          rx="25"
                          ry="15"
                          stroke="#808080"
                          strokeWidth="2"
                          fill="none"
                        />
                        <text
                          x="50"
                          y="35"
                          fontSize="12"
                          fill="#808080"
                          textAnchor="middle"
                          fontFamily="Arial"
                          fontWeight="bold"
                        >
                          L
                        </text>
                      </svg>
                    ),
                  },
                  {
                    name: "Chevrolet",
                    logoUrl: "/assets/Make/chevrolet.png",
                    fallback: (
                      <svg
                        className="w-10 h-10 mx-auto"
                        viewBox="0 0 100 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M50 15 L60 30 L50 45 L40 30 Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1"
                        />
                      </svg>
                    ),
                  },
                  {
                    name: "DFSK",
                    logoUrl: "/assets/Make/DFSK  logo.png",
                    fallback: (
                      <svg
                        className="w-10 h-10 mx-auto"
                        viewBox="0 0 100 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <ellipse
                          cx="50"
                          cy="30"
                          rx="25"
                          ry="15"
                          stroke="#808080"
                          strokeWidth="2"
                          fill="none"
                        />
                        <text
                          x="50"
                          y="35"
                          fontSize="8"
                          fill="#808080"
                          textAnchor="middle"
                          fontFamily="Arial"
                          fontWeight="bold"
                        >
                          DS
                        </text>
                      </svg>
                    ),
                  },
                  {
                    name: "Peugeot",
                    logoUrl: "/assets/Make/Peugeot-Logo.png",
                    fallback: (
                      <svg
                        className="w-10 h-10 mx-auto"
                        viewBox="0 0 100 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M35 20 L50 15 L65 20 L65 40 L50 45 L35 40 Z"
                          stroke="#000000"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M45 25 L55 25 L55 35 L45 35 Z"
                          fill="#808080"
                        />
                      </svg>
                    ),
                  },
                  {
                    name: "Proton",
                    logoUrl: "/assets/Make/Proton-Logo-2008.png",
                    fallback: (
                      <svg
                        className="w-10 h-10 mx-auto"
                        viewBox="0 0 100 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M35 20 L50 15 L65 20 L65 40 L50 45 L35 40 Z"
                          stroke="#808080"
                          strokeWidth="2"
                          fill="none"
                        />
                        <circle cx="50" cy="30" r="8" fill="#808080" />
                      </svg>
                    ),
                  },
                  {
                    name: "Prince",
                    logoUrl:
                      "https://www.carlogos.org/logo/Prince-logo-1920x1080.png",
                    fallback: (
                      <svg
                        className="w-10 h-10 mx-auto"
                        viewBox="0 0 100 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M35 20 L50 15 L65 20 L65 40 L50 45 L35 40 Z"
                          fill="#DC143C"
                          stroke="#DC143C"
                          strokeWidth="2"
                        />
                        <text
                          x="50"
                          y="35"
                          fontSize="12"
                          fill="white"
                          textAnchor="middle"
                          fontFamily="Arial"
                          fontWeight="bold"
                        >
                          P
                        </text>
                      </svg>
                    ),
                  },
                  {
                    name: "Jeep",
                    logoUrl: "/assets/Make/jeep.png",
                    fallback: (
                      <span
                        className="text-xl font-bold text-gray-600"
                        style={{ letterSpacing: "1px" }}
                      >
                        JEEP
                      </span>
                    ),
                  },
                  {
                    name: "Subaru",
                    logoUrl:
                      "https://www.carlogos.org/logo/Subaru-logo-1920x1080.png",
                    fallback: (
                      <svg
                        className="w-10 h-10 mx-auto"
                        viewBox="0 0 100 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <ellipse
                          cx="50"
                          cy="30"
                          rx="25"
                          ry="15"
                          stroke="#0066CC"
                          strokeWidth="2"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="30"
                          r="12"
                          fill="#0066CC"
                          opacity="0.3"
                        />
                        <circle cx="45" cy="25" r="2" fill="white" />
                        <circle cx="55" cy="25" r="2" fill="white" />
                        <circle cx="45" cy="35" r="2" fill="white" />
                        <circle cx="55" cy="35" r="2" fill="white" />
                      </svg>
                    ),
                  },
                ]
                  .slice(makePage * 12, (makePage + 1) * 12)
                  .map((make) => (
                    <div
                      key={make.name}
                      onClick={() => handleFilterClick("make", make.name)}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center hover:shadow-[0_10px_20px_rgba(220,38,38,0.2)] hover:scale-105 transition-all duration-300 cursor-pointer group border border-gray-200 dark:border-gray-700"
                    >
                      <div className="mb-2 flex items-center justify-center h-12">
                        <BrandLogo
                          src={make.logoUrl}
                          alt={make.name}
                          fallback={make.fallback}
                        />
                      </div>
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                        {make.name}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-1.5 mt-6">
                {[0, 1].map((page) => (
                  <button
                    key={page}
                    onClick={() => setMakePage(page)}
                    className={`w-2 h-2 rounded-full transition-colors ${makePage === page ? "bg-blue-600" : "bg-blue-300"
                      }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Model Filter */}
          {activeFilter === "Model" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 max-w-6xl mx-auto">
              {[
                "Corolla",
                "Civic",
                "City",
                "Cultus",
                "Mehran",
                "Alto",
                "Vitz",
                "Prado",
                "Land Cruiser",
                "Camry",
                "Accord",
                "Sportage",
              ].map((model) => (
                <div
                  key={model}
                  onClick={() => handleFilterClick("model", model)}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 text-center hover:shadow-[0_10px_20px_rgba(220,38,38,0.2)] hover:scale-105 transition-all duration-300 cursor-pointer group border border-gray-100 dark:border-gray-700"
                >
                  <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                    {model}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Budget Filter */}
          {activeFilter === "Budget" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 max-w-6xl mx-auto">
              {[
                "Under 5 Lakh",
                "5-10 Lakh",
                "10-15 Lakh",
                "15-20 Lakh",
                "20-30 Lakh",
                "30-50 Lakh",
                "50-75 Lakh",
                "75 Lakh - 1 Crore",
                "Above 1 Crore",
              ].map((budget) => (
                <div
                  key={budget}
                  onClick={() => handleFilterClick("budget", budget)}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 text-center hover:shadow-[0_10px_20px_rgba(220,38,38,0.2)] hover:scale-105 transition-all duration-300 cursor-pointer group border border-gray-100 dark:border-gray-700"
                >
                  <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                    {budget}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Body Type Filter */}
          {activeFilter === "Body Type" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 max-w-6xl mx-auto">
              {[
                { name: "Sedan", icon: "/assets/Browse Used Cars/sedan.png" },
                {
                  name: "Hatchback",
                  icon: "/assets/Browse Used Cars/smallcar.png",
                },
                {
                  name: "SUV",
                  icon: "/assets/Browse Used Cars/compactsuv.png",
                },
                { name: "Coupe", icon: "/assets/Browse Used Cars/coupe.png" },
                {
                  name: "Convertible",
                  icon: "/assets/Browse Used Cars/convertible.png",
                },
                { name: "Wagon", icon: "/assets/Browse Used Cars/wagonr.png" },
                { name: "Pickup", icon: "/assets/Browse Used Cars/pickup.png" },
                { name: "Van", icon: "/assets/Browse Used Cars/van.png" },
                {
                  name: "Minivan",
                  icon: "/assets/Browse Used Cars/minivan.png",
                },
              ].map((bodyType) => (
                <div
                  key={bodyType.name}
                  onClick={() => handleFilterClick("bodyType", bodyType.name)}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 text-center hover:shadow-[0_10px_20px_rgba(220,38,38,0.2)] hover:scale-105 transition-all duration-300 cursor-pointer group border border-gray-100 dark:border-gray-700"
                >
                  <div className="mb-2 flex items-center justify-center">
                    <img
                      src={bodyType.icon}
                      alt={bodyType.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                    />
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                    {bodyType.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Cars Available Message */}
          {showNoCarsMessage && selectedFilterValue && (
            <div className="mt-6 sm:mt-8 max-w-2xl mx-auto px-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4 sm:p-6 text-center">
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 dark:text-yellow-400 mx-auto mb-3 sm:mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {t('noCarsAvailable')}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                  {t('sorryNoCarsFor')} {" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {selectedFilterValue.value}
                  </span>{" "}
                  {t('in')} {" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {selectedFilterValue.type}
                  </span>{" "}
                  {t('atTheMoment')}
                </p>
                <button
                  onClick={() => {
                    setShowNoCarsMessage(false);
                    setSelectedFilterValue(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors"
                >
                  {t('tryAnotherFilter')}
                </button>
              </div>
            </div>
          )}
        </div>
      </section >

      {/* Autofinder Services Section - REFINED 3D FLIP GRID */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-slate-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-red-600 mb-2 uppercase tracking-tight"
              style={{ filter: "drop-shadow(0 0 10px rgba(220, 38, 38, 0.1))" }}>
              {t('autofinderServices')}
            </h2>
            <p className="text-gray-500 font-medium tracking-widest uppercase text-xs sm:text-sm">
              {t('premiumSolutions')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {/* 1. Free Ad Service */}
            <ServiceFlipCard
              onClick={handleFreeAdClick}
              front={
                <>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                    <FaBullhorn className="w-8 h-8 drop-shadow-md" />
                  </div>
                  <h3 className="text-base font-black text-black uppercase tracking-tighter mt-0.5">{t('freeAd')}</h3>
                </>
              }
              back={
                <>
                  <p className="text-xs font-semibold leading-relaxed mb-3 px-1 text-white">
                    {t('freeAdDesc')}
                  </p>
                  <button className="px-4 py-1.5 bg-white text-[#b91c1c] rounded-lg text-xs font-black shadow-lg hover:bg-gray-100 transition-all uppercase">
                    {t('exploreMore')}
                  </button>
                </>
              }
            />

            {/* 2. Premium Ad Service */}
            <ServiceFlipCard
              onClick={() => navigate("/sell-car?service=premium")}
              front={
                <>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                    <FaGem className="w-8 h-8 drop-shadow-md" />
                  </div>
                  <h3 className="text-base font-black text-black uppercase tracking-tighter mt-0.5">{t('premiumAd')}</h3>
                </>
              }
              back={
                <>
                  <p className="text-[11px] font-semibold leading-relaxed mb-3 px-1 text-white">
                    {t('premiumAdDesc')}
                  </p>
                  <button className="px-4 py-1.5 bg-white text-[#b91c1c] rounded-lg text-[10px] font-black shadow-lg hover:bg-gray-100 transition-all uppercase">
                    {t('exploreMore')}
                  </button>
                </>
              }
            />

            {/* 3. Buy Car For Me */}
            <ServiceFlipCard
              onClick={handleBuyCarForMeClick}
              front={
                <>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                    <FaSearch className="w-8 h-8 drop-shadow-md" />
                  </div>
                  <h3 className="text-base font-black text-black uppercase tracking-tighter mt-0.5">{t('buyForMe')}</h3>
                </>
              }
              back={
                <>
                  <p className="text-[11px] font-semibold leading-relaxed mb-3 px-1 text-white">
                    {t('buyForMeDesc')}
                  </p>
                  <button className="px-4 py-1.5 bg-white text-[#b91c1c] rounded-lg text-[10px] font-black shadow-lg hover:bg-gray-100 transition-all uppercase">
                    {t('exploreMore')}
                  </button>
                </>
              }
            />

            {/* 4. List It For You */}
            <ServiceFlipCard
              onClick={handleListItForMeClick}
              front={
                <>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
                    <FaLayerGroup className="w-8 h-8 drop-shadow-md" />
                  </div>
                  <h3 className="text-base font-black text-black uppercase tracking-tighter mt-0.5">{t('listForYou')}</h3>
                </>
              }
              back={
                <>
                  <p className="text-[11px] font-semibold leading-relaxed mb-3 px-1 text-white">
                    {t('listForYouDesc')}
                  </p>
                  <button className="px-4 py-1.5 bg-white text-[#b91c1c] rounded-lg text-[10px] font-black shadow-lg hover:bg-gray-100 transition-all uppercase">
                    {t('exploreMore')}
                  </button>
                </>
              }
            />

            {/* 5. Car Inspection */}
            <ServiceFlipCard
              onClick={handleCarInspectionClick}
              front={
                <>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-300 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                    <FaShieldAlt className="w-8 h-8 drop-shadow-md" />
                  </div>
                  <h3 className="text-base font-black text-black uppercase tracking-tighter mt-0.5">{t('inspection')}</h3>
                </>
              }
              back={
                <>
                  <p className="text-[11px] font-semibold leading-relaxed mb-3 px-1 text-white">
                    {t('inspectionDesc')}
                  </p>
                  <button className="px-4 py-1.5 bg-white text-[#b91c1c] rounded-lg text-[10px] font-black shadow-lg hover:bg-gray-100 transition-all uppercase">
                    {t('exploreMore')}
                  </button>
                </>
              }
            />

            {/* 6. Car On Rent */}
            <ServiceFlipCard
              onClick={handleCarOnRentClick}
              front={
                <>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                    <FaRoute className="w-8 h-8 drop-shadow-md" />
                  </div>
                  <h3 className="text-base font-black text-black uppercase tracking-tighter mt-0.5">{t('carOnRent')}</h3>
                </>
              }
              back={
                <>
                  <p className="text-[11px] font-semibold leading-relaxed mb-3 px-1 text-white">
                    {t('carOnRentDesc')}
                  </p>
                  <button className="px-4 py-1.5 bg-white text-[#b91c1c] rounded-lg text-[10px] font-black shadow-lg hover:bg-gray-100 transition-all uppercase">
                    {t('exploreMore')}
                  </button>
                </>
              }
            />
          </div>
        </div>
      </section>


      {/* Car Listings Section - For your quick look */}
      {/* Car Listings Section - For your quick look */}
      <section className="min-h-screen snap-start flex flex-col justify-center py-8 sm:py-12 md:py-16 bg-white dark:bg-gray-800 transition-colors">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-4 sm:mb-6 px-2 uppercase tracking-wider"
              style={{ textShadow: "1px 1px 0 #ccc, 2px 2px 0 #ccc, 3px 3px 0 #ccc, 4px 4px 0 #ccc, 6px 6px 20px rgba(0,0,0,0.1)" }}>
              {t('forYourQuickLook')}
            </h2>
            <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 flex-wrap px-2">
              <button
                onClick={() => setActiveTab("MANAGED BY AUTOFINDER")}
                className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm md:text-base font-semibold transition whitespace-nowrap ${activeTab === "MANAGED BY AUTOFINDER"
                  ? "bg-red-600 dark:bg-red-700 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
              >
                {t('managedByAutofinder').toUpperCase()}
              </button>
              <button
                onClick={() => setActiveTab("POPULAR NEW CARS")}
                className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm md:text-base font-semibold transition whitespace-nowrap ${activeTab === "POPULAR NEW CARS"
                  ? "bg-red-600 dark:bg-red-700 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
              >
                {t('popularNewCars').toUpperCase()}
              </button>
              <button
                onClick={() => setActiveTab("PREMIUM CARS")}
                className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm md:text-base font-semibold transition whitespace-nowrap ${activeTab === "PREMIUM CARS"
                  ? "bg-red-600 dark:bg-red-700 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
              >
                {t('premiumCars').toUpperCase()}
              </button>
              <button
                onClick={() => setActiveTab("PREMIUM BIKES")}
                className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm md:text-base font-semibold transition whitespace-nowrap ${activeTab === "PREMIUM BIKES"
                  ? "bg-red-600 dark:bg-red-700 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
              >
                {t('premiumBikes').toUpperCase()}
              </button>
              <button
                onClick={() => setActiveTab("RENT CAR")}
                className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm md:text-base font-semibold transition whitespace-nowrap ${activeTab === "RENT CAR"
                  ? "bg-red-600 dark:bg-red-700 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
              >
                {t('rentCar').toUpperCase()}
              </button>
              <button
                onClick={() => setActiveTab("AUTOFINDER AUTO STORE")}
                className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm md:text-base font-semibold transition whitespace-nowrap ${activeTab === "AUTOFINDER AUTO STORE"
                  ? "bg-red-600 dark:bg-red-700 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
              >
                {t('autoStore').toUpperCase()}
              </button>
            </div>
          </div>

          {/* Conditional Rendering based on activeTab */}
          {(() => {
            if (activeTab === "MANAGED BY AUTOFINDER") {
              return <ManagedByAutofinder />;
            }

            if (activeTab === "POPULAR NEW CARS") {
              return <PopularNewCars />;
            }

            if (activeTab === "PREMIUM CARS") {
              return <PremiumCars />;
            }

            if (activeTab === "PREMIUM BIKES") {
              return <PremiumBikes />;
            }

            if (activeTab === "RENT CAR") {
              return <RentCars />;
            }

            if (activeTab === "AUTOFINDER AUTO STORE") {
              return <AutoStoreItems />;
            }

            return (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-2 font-semibold">
                  Please select a tab above to view items.
                </p>
              </div>
            );
          })()}
        </div>
      </section >

      {/* Combined Section: CTA and Used Cars */}
      <section className="min-h-screen snap-start flex flex-col justify-center py-8 transition-colors">
        {/* Call to Action - More Compact */}
        <div className="py-6 bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white relative overflow-hidden rounded-xl mx-4 sm:mx-6 md:mx-8 shadow-xl">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '20px 20px'
              }}
            ></div>
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-1 uppercase tracking-tight">
              {t('areYouLookingToBuyACar')}
            </h2>
            <p className="text-sm sm:text-base mb-4 max-w-xl mx-auto opacity-90 leading-tight">
              {loadingStats ? (
                t('loadingStats')
              ) : (
                <>
                  {t('ctaDesc1')}{" "}
                  <span className="font-bold underline">
                    {totalCars > 0
                      ? totalCars.toLocaleString() + "+"
                      : t('thousandsOf')} {t('options')}
                  </span>
                  {t('ctaDesc2')}
                </>
              )}
            </p>
            <button
              onClick={() => navigate("/used-cars")}
              className="bg-white text-red-600 px-5 py-2 rounded-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-md text-sm"
            >
              {t('searchYourCar')}
            </button>
          </div>
        </div>

        {/* Used Cars Grid (Further Shrinked) */}
        <div className="container mx-auto px-4 mt-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-2 uppercase leading-none tracking-tighter"
              style={{ textShadow: "1px 1px 0 #ccc, 2px 2px 0 #ccc, 3px 3px 0 #ccc, 4px 4px 0 #ccc, 6px 6px 20px rgba(0,0,0,0.1)" }}>
              {t('usedCars')}
            </h2>
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => setUsedCarFilter("CITY")}
                className={`px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-colors ${usedCarFilter === "CITY"
                  ? "bg-red-600 dark:bg-red-700 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm"
                  }`}
              >
                {t('byCity')}
              </button>
              <button
                onClick={() => setUsedCarFilter("PRICE")}
                className={`px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-colors ${usedCarFilter === "PRICE"
                  ? "bg-red-600 dark:bg-red-700 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm"
                  }`}
              >
                {t('byPrice')}
              </button>
            </div>
          </div>

          {/* City Filter Content - Minimalist */}
          {usedCarFilter === "CITY" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
              {[
                { name: "Karachi", icon: "/assets/Cities/karachi.png" },
                { name: "Lahore", icon: "/assets/Cities/lahore.png" },
                { name: "Islamabad", icon: "/assets/Cities/islamabad.png" },
                { name: "Rawalpindi", icon: "/assets/Cities/rawalpindi.png" },
                { name: "Peshawar", icon: "/assets/Cities/peshawar.png" },
                { name: "Faisalabad", icon: "/assets/Cities/faisalabad.png" },
                { name: "Multan", icon: "/assets/Cities/multan.png" },
                { name: "Gujranwala", icon: "/assets/Cities/gujranwala.png" },
                { name: "Sialkot", icon: "/assets/Cities/sialkot.png" },
                { name: "Sargodha", icon: "/assets/Cities/sargodha.png" },
                { name: "Abbottabad", icon: "/assets/Cities/abbottabad.png" },
                { name: "Hyderabad", icon: "/assets/Cities/hyderabad.png" },
              ].map((city) => (
                <div
                  key={city.name}
                  onClick={() => navigate(`/used-cars?city=${city.name}`)}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-2"
                >
                  {city.icon && (
                    <img
                      src={city.icon}
                      alt={city.name}
                      className={`${city.name === "Abbottabad" ||
                        city.name === "Rawalpindi"
                        ? "w-16 h-16 scale-110 object-contain z-10"
                        : "w-12 h-12 object-contain"
                        } group-hover:scale-110 transition-transform duration-300`}
                    />
                  )}
                  <h4 className={`text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors whitespace-nowrap`}>
                    {city.name}
                  </h4>
                </div>
              ))}
            </div>
          )}

          {/* Price Filter Content - Minimalist */}
          {usedCarFilter === "PRICE" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
              {[
                { label: "Under 5 Lakh", value: "Under 5 Lakh" },
                { label: "5-10 Lakh", value: "5-10 Lakh" },
                { label: "10-15 Lakh", value: "10-15 Lakh" },
                { label: "15-20 Lakh", value: "15-20 Lakh" },
                { label: "20-30 Lakh", value: "20-30 Lakh" },
                { label: "30-50 Lakh", value: "30-50 Lakh" },
                { label: "50-75 Lakh", value: "50-75 Lakh" },
                { label: "75 Lakh - 1 Crore", value: "75 Lakh - 1 Crore" },
                { label: "Above 1 Crore", value: "Above 1 Crore" },
              ].map((price) => (
                <div
                  key={price.value}
                  onClick={() =>
                    navigate(
                      `/used-cars?budget=${encodeURIComponent(price.value)}`
                    )
                  }
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer group"
                >
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                    {price.label}
                  </h4>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blog Preview Section */}
      <BlogPreviewSection />


      <LatestNewsSection />

      {/* About Us Section */}
      {/* About Us Section */}
      <section className="snap-start flex flex-col justify-center py-8 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-2 uppercase leading-none tracking-tighter transition-all duration-300 hover:scale-110 cursor-default inline-block"
              style={{ textShadow: "1px 1px 0 #ccc, 2px 2px 0 #ccc, 3px 3px 0 #ccc, 4px 4px 0 #ccc, 6px 6px 20px rgba(0,0,0,0.1)" }}>
              {t('aboutUsTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-5xl mx-auto">
            <div className="flex flex-col justify-center h-full">
              <div>
                <p className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 leading-snug">
                  {t('aboutDesc1')}
                </p>
                <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1 leading-snug">
                  {t('aboutDesc2')}
                </p>
                <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 mb-2 leading-snug">
                  {t('aboutDesc3')}
                </p>
              </div>
              <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 text-white p-3 rounded-lg shadow-md dark:shadow-gray-900 transform transition-all duration-300 hover:shadow-lg mt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-semibold mb-0.5 flex items-center gap-1.5">
                      <FaPhone className="text-sm" />
                      {t('haveAnyQuestion')}
                    </h4>
                    <p className="text-lg font-bold mb-0.5 flex items-center gap-1.5">
                      <span>+923348400943</span>
                    </p>
                    <p className="text-[10px] sm:text-xs flex items-center gap-1.5 opacity-90">
                      <FaEnvelope className="text-[10px]" />
                      <a
                        href="mailto:autofinder786@gmail.com"
                        className="hover:text-red-200 transition-colors underline"
                      >
                        autofinder786@gmail.com
                      </a>
                    </p>
                  </div>
                  <Link
                    to="/contact"
                    className="bg-white dark:bg-gray-800 text-red-600 dark:text-red-500 px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all transform hover:scale-105 shadow-sm flex-shrink-0"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative h-full max-h-[320px] rounded-lg overflow-hidden shadow-xl group md:mt-2">
              <img
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop&q=80"
                alt="3D Car - Autofinder"
                className="w-full h-full object-cover rounded-lg transform group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback image if main image fails to load
                  e.target.src =
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>
      {/* YouTube Shorts Preview Section - Placed before footer at user's request */}
      <YoutubeShortsSection />
    </>
  );
}

export default Home;
