import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaMapMarkerAlt, FaTag, FaDollarSign, FaFileAlt, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';

function SellCarParts() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    partType: '',
    description: '',
    price: '',
    location: '',
    userId: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get user from localStorage
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
  }, [navigate]);

  const partTypes = [
    'Engine Parts',
    'Body Parts',
    'Electrical',
    'Interior',
    'Exterior',
    'Accessories',
    'Tires & Wheels',
    'Brake System',
    'Suspension',
    'Transmission',
    'Other'
  ];

  const cities = [
    'Karachi',
    'Lahore',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Sialkot',
    'Gujranwala',
    'Hyderabad',
    'Sargodha'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 8);
    setImages(files);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!userId) {
      setError('Please login to create an ad');
      setLoading(false);
      return;
    }

    // Basic validation
    if (!formData.title || !formData.partType || !formData.price || !formData.location) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (images.length === 0) {
      setError('Please upload at least one image');
      setLoading(false);
      return;
    }

    try {
      const API_URL = server_ip || 'http://localhost:8001';
      const endpoint = `${API_URL}/autoparts`;

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('partType', formData.partType);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('userId', userId);

      // Append images
      images.forEach((image, index) => {
        formDataToSend.append(`image${index + 1}`, image);
      });

      console.log('🔄 Submitting auto part ad...');
      console.log('📦 Form data:', {
        title: formData.title,
        partType: formData.partType,
        price: formData.price,
        location: formData.location,
        imagesCount: images.length
      });

      const response = await fetchWithRetry(endpoint, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Auto part ad created successfully:', result);

      setSuccess(true);
      toast.success('Car parts ad posted successfully!');
      setFormData({
        title: '',
        partType: '',
        description: '',
        price: '',
        location: '',
        userId: ''
      });
      setImages([]);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/auto-store');
      }, 2000);
    } catch (err) {
      console.error('❌ Error creating auto part ad:', err);
      setError(err.message || 'Failed to create auto part ad. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sell Car Parts - Post Free Ad | Auto Finder</title>
        <meta name="description" content="Post a free ad to sell your car parts. Reach thousands of buyers on Auto Finder." />
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-2 transition-colors">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">Sell Car Parts</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Post a free ad and reach thousands of buyers</p>
          </div>

          {!userId && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6 text-center">
              <p className="text-yellow-800 dark:text-yellow-400 font-semibold text-lg mb-2">⚠️ Login Required</p>
              <p className="text-yellow-700 dark:text-yellow-500 mb-4">Please login to create an ad.</p>
              <button
                onClick={() => navigate('/signin')}
                className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Go to Login
              </button>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6 mb-6 text-center">
              <p className="text-green-800 dark:text-green-400 font-semibold text-lg mb-2">✅ Ad Posted Successfully!</p>
              <p className="text-green-700 dark:text-green-500">Your auto part ad has been created. Redirecting to Auto Store...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 mb-6 text-center">
              <p className="text-red-800 dark:text-red-400 font-semibold mb-2">Error</p>
              <p className="text-red-700 dark:text-red-500">{error}</p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-8 transition-colors">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaFileAlt className="inline mr-2 text-red-600 dark:text-red-500" />
                  Part Title <span className="text-red-600 dark:text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Toyota Corolla Engine, Honda Civic Headlights"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-600 dark:focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Part Type */}
              <div>
                <label htmlFor="partType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaTag className="inline mr-2 text-red-600 dark:text-red-500" />
                  Part Type <span className="text-red-600 dark:text-red-500">*</span>
                </label>
                <select
                  id="partType"
                  name="partType"
                  value={formData.partType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-600 dark:focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Part Type</option>
                  {partTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaMapMarkerAlt className="inline mr-2 text-red-600 dark:text-red-500" />
                  Location <span className="text-red-600 dark:text-red-500">*</span>
                </label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-600 dark:focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaDollarSign className="inline mr-2 text-red-600 dark:text-red-500" />
                  Price (PKR) <span className="text-red-600 dark:text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 5000"
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-600 dark:focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the condition, brand, model compatibility, etc."
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-600 dark:focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Images */}
              <div>
                <label htmlFor="images" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaUpload className="inline mr-2 text-red-600 dark:text-red-500" />
                  Images <span className="text-red-600 dark:text-red-500">*</span> (Up to 8 images)
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-600 dark:focus:ring-red-500 focus:border-transparent"
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

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white py-4 rounded-lg font-semibold text-lg transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {loading ? 'Posting Ad...' : 'Post Free Ad'}
                </button>
              </div>
            </form>

            {/* Info Box */}
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">📝 Tips for a Great Ad:</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>Use clear, high-quality images</li>
                <li>Provide accurate part information</li>
                <li>Mention compatible car models</li>
                <li>Describe the condition honestly</li>
                <li>Set a competitive price</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SellCarParts;

