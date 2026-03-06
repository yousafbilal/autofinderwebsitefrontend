import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';
import { FaPlayCircle, FaClock, FaArrowLeft } from 'react-icons/fa';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL = server_ip || 'http://localhost:8001';
        const endpoint = `${API_URL}/videos`;

        const response = await fetchWithRetry(endpoint, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          // Filter only published videos and sort by date
          const publishedVideos = data
            .filter(video => video.status === 'published' || !video.status)
            .sort((a, b) => {
              const dateA = new Date(a.dateAdded || a.createdAt || 0);
              const dateB = new Date(b.dateAdded || b.createdAt || 0);
              return dateB - dateA;
            });

          setVideos(publishedVideos);
        } else {
          setVideos([]);
        }
      } catch (err) {
        console.error('❌ Error fetching videos:', err);
        setError('Failed to load videos. Please try again later.');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllVideos();
  }, []);

  const buildImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23ddd" width="400" height="225"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EVideo Thumbnail%3C/text%3E%3C/svg%3E';
    }
    if (imagePath.startsWith('http')) return imagePath;

    const API_URL = server_ip || 'http://localhost:8001';
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_URL}/uploads/${cleanPath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <Helmet>
        <title>Videos - Autofinder</title>
        <meta name="description" content="Browse all our automotive videos" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 mb-4 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Browse Our Videos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Watch the latest automotive content and reviews
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Videos Grid */}
          {!loading && !error && (
            <>
              {videos.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
                  <FaPlayCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Videos Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Check back later for new video content.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-600 font-semibold transition-colors"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                    Go Back Home
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-400">
                      Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{videos.length}</span> video{videos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-start">
                    {videos.map((video) => {
                      const imageUrl = buildImageUrl(video.image1);
                      const videoUrl = video.videoUrl || '';

                      return (
                        <div
                          key={video._id || video.id}
                          className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg"
                          onClick={() => {
                            if (videoUrl) {
                              window.open(videoUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          {/* Video Thumbnail Container */}
                          <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={video.title || 'Video'}
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23ddd" width="400" height="225"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EVideo Thumbnail%3C/text%3E%3C/svg%3E';
                              }}
                            />

                            {/* Play Button - Centered */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white/90 dark:bg-white/80 rounded-full p-3 transform group-hover:scale-110 transition-all duration-300 shadow-lg">
                                <FaPlayCircle className="w-8 h-8 text-gray-900 dark:text-gray-900" />
                              </div>
                            </div>

                            {/* Duration Badge - Bottom Right */}
                            {video.duration && (
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                <FaClock className="w-3 h-3" />
                                <span>{video.duration}</span>
                              </div>
                            )}

                            {/* Category Badge - Top Left */}
                            {video.category && (
                              <div className="absolute top-2 left-2 bg-red-600 dark:bg-red-700 text-white px-2 py-1 rounded text-xs font-semibold uppercase">
                                {video.category}
                              </div>
                            )}
                          </div>

                          {/* Video Info */}
                          <div className="p-4">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors leading-snug mb-2">
                              {video.title}
                            </h3>

                            {/* Meta Info */}
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                              <span className="font-medium">{video.author || 'Admin'}</span>
                              {formatDate(video.dateAdded || video.date) && (
                                <span>{formatDate(video.dateAdded || video.date)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Videos;

