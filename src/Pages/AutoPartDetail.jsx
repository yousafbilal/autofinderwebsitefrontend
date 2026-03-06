import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaCog, FaMapMarkerAlt, FaPhone, FaEnvelope, FaTag, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';

function AutoPartDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchPartDetails = async () => {
      if (!id) {
        setError('Auto part ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const API_URL = server_ip || 'http://localhost:8001';
        const endpoint = `${API_URL}/autoparts/${id}`;

        console.log('🔄 Fetching auto part details for ID:', id);
        console.log('🔗 Endpoint:', endpoint);

        const response = await fetchWithRetry(endpoint, {
          method: 'GET',
        });

        console.log('📡 Response status:', response.status, response.statusText);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Auto part not found');
            console.error('❌ Auto part not found with ID:', id);
          } else {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
          }
          return;
        }

        const partData = await response.json();

        if (partData) {
          setPart(partData);
          // Set first image as selected
          if (partData.image1 || partData.image) {
            setSelectedImage(partData.image1 || partData.image);
          }
          console.log('✅ Auto part data loaded:', partData);
          console.log('✅ Auto part images:', {
            image1: partData.image1,
            image2: partData.image2,
            image3: partData.image3,
            image4: partData.image4
          });
        } else {
          setError('Auto part not found');
          console.error('❌ Auto part data is null');
        }
      } catch (err) {
        console.error('❌ Error fetching auto part details:', err);
        setError(err.message || 'Failed to fetch auto part details');
      } finally {
        setLoading(false);
      }
    };

    fetchPartDetails();
  }, [id]);

  const buildImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
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

  // Get all available images
  const getAllImages = () => {
    if (!part) return [];
    const images = [];
    for (let i = 1; i <= 10; i++) {
      const imgKey = `image${i}`;
      if (part[imgKey]) {
        images.push(part[imgKey]);
      }
    }
    // Also check for 'image' field
    if (part.image && !images.includes(part.image)) {
      images.unshift(part.image);
    }
    return images.length > 0 ? images : [null];
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Auto Part - Auto Finder</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
          <div className="container mx-auto px-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-8 animate-pulse">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !part) {
    return (
      <>
        <Helmet>
          <title>Auto Part Not Found - Auto Finder</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
          <div className="container mx-auto px-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Auto Part Not Found</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The auto part you are looking for does not exist.'}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate(-1)}
                  className="bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition"
                >
                  Go Back
                </button>
                <Link
                  to="/auto-store"
                  className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white px-6 py-2 rounded-lg transition"
                >
                  Browse Auto Store
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const images = getAllImages();
  const sellerInfo = part.userId || part.user || {};

  return (
    <>
      <Helmet>
        <title>{part.title || 'Auto Part'} - Auto Finder</title>
        <meta name="description" content={part.description || `View details for ${part.title || 'this auto part'}`} />
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors"
          >
            <FaArrowLeft /> Back
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden transition-colors">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Images Section */}
              <div>
                <div className="mb-4">
                  <img
                    src={buildImageUrl(selectedImage || images[0])}
                    alt={part.title || 'Auto Part'}
                    className="w-full h-96 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EAuto Part%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>

                {/* Thumbnail Images */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(0, 4).map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(img)}
                        className={`border-2 rounded-lg overflow-hidden ${selectedImage === img ? 'border-red-600 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                      >
                        <img
                          src={buildImageUrl(img)}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-20 object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="80"%3E%3Crect fill="%23ddd" width="100" height="80"/%3E%3C/svg%3E';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div>
                <div className="mb-6">
                  {part.category && (
                    <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                      <FaTag className="inline mr-1" />
                      {part.category}
                    </span>
                  )}
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    {part.title || 'Auto Part'}
                  </h1>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-500 mb-6">
                    {formatPrice(part.price)}
                  </div>
                </div>

                {/* Key Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Key Details</h2>
                  <div className="space-y-3">
                    {part.brand && (
                      <div className="flex items-center gap-3">
                        <FaCog className="text-red-600 dark:text-red-500" />
                        <span className="text-gray-700 dark:text-gray-300"><strong>Brand:</strong> {part.brand}</span>
                      </div>
                    )}
                    {part.model && (
                      <div className="flex items-center gap-3">
                        <FaCog className="text-red-600 dark:text-red-500" />
                        <span className="text-gray-700 dark:text-gray-300"><strong>Model:</strong> {part.model}</span>
                      </div>
                    )}
                    {part.condition && (
                      <div className="flex items-center gap-3">
                        <FaTag className="text-red-600 dark:text-red-500" />
                        <span className="text-gray-700 dark:text-gray-300"><strong>Condition:</strong> {part.condition}</span>
                      </div>
                    )}
                    {part.location && (
                      <div className="flex items-center gap-3">
                        <FaMapMarkerAlt className="text-red-600 dark:text-red-500" />
                        <span className="text-gray-700 dark:text-gray-300"><strong>Location:</strong> {part.location}</span>
                      </div>
                    )}
                    {part.quantity && (
                      <div className="flex items-center gap-3">
                        <FaShoppingCart className="text-red-600 dark:text-red-500" />
                        <span className="text-gray-700 dark:text-gray-300"><strong>Quantity:</strong> {part.quantity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {part.description && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Description</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {part.description}
                    </p>
                  </div>
                )}

                {/* Contact Seller */}
                {sellerInfo && (sellerInfo.name || sellerInfo.phone || sellerInfo.email) && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Contact Seller</h2>
                    <div className="space-y-3">
                      {sellerInfo.name && (
                        <p className="text-gray-700 dark:text-gray-300"><strong>Name:</strong> {sellerInfo.name}</p>
                      )}
                      {sellerInfo.phone && (
                        <a
                          href={`tel:${sellerInfo.phone}`}
                          className="flex items-center gap-2 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-600 font-semibold"
                        >
                          <FaPhone /> {sellerInfo.phone}
                        </a>
                      )}
                      {sellerInfo.email && (
                        <a
                          href={`mailto:${sellerInfo.email}`}
                          className="flex items-center gap-2 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-600 font-semibold"
                        >
                          <FaEnvelope /> {sellerInfo.email}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {sellerInfo.phone && (
                    <a
                      href={`tel:${sellerInfo.phone}`}
                      className="flex-1 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white text-center py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <FaPhone /> Call Now
                    </a>
                  )}
                  {sellerInfo.email && (
                    <a
                      href={`mailto:${sellerInfo.email}`}
                      className="flex-1 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 text-white text-center py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <FaEnvelope /> Email
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(part.specifications || part.features || part.warranty) && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-8 transition-colors">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {part.specifications && (
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Specifications</h3>
                    <p className="text-gray-600 dark:text-gray-400">{part.specifications}</p>
                  </div>
                )}
                {part.features && (
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Features</h3>
                    <p className="text-gray-600 dark:text-gray-400">{part.features}</p>
                  </div>
                )}
                {part.warranty && (
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Warranty</h3>
                    <p className="text-gray-600 dark:text-gray-400">{part.warranty}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AutoPartDetail;

