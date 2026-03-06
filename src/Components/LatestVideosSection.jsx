import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';
import { FaPlayCircle } from 'react-icons/fa';

const LatestVideosSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestVideos = async () => {
      try {
        setLoading(true);

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
          // Filter only published videos and take latest 3
          const publishedVideos = data
            .filter(video => video.status === 'published' || !video.status)
            .sort((a, b) => {
              const dateA = new Date(a.dateAdded || a.createdAt || 0);
              const dateB = new Date(b.dateAdded || b.createdAt || 0);
              return dateB - dateA;
            })
            .slice(0, 3);

          setVideos(publishedVideos);
        } else {
          setVideos([]);
        }
      } catch (err) {
        console.error('❌ Error fetching latest videos:', err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestVideos();
  }, []);

  const buildImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EVideo Thumbnail%3C/text%3E%3C/svg%3E';
    }
    if (imagePath.startsWith('http')) return imagePath;

    const API_URL = server_ip || 'http://localhost:8001';
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_URL}/uploads/${cleanPath}`;
  };


  if (loading) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Browse Our Videos</h2>
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-start">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null; // Don't show section if no videos
  }

  return (
    <section className="min-h-screen snap-start flex flex-col justify-center py-12 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4">
        {/* Header - PakWheels Style */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Browse Our Videos</h2>
          <Link
            to="/videos"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 font-semibold text-sm md:text-base transition-colors"
          >
            View All Videos →
          </Link>
        </div>

        {/* Video Grid - Left Aligned */}
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
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                      {video.duration}
                    </div>
                  )}
                </div>

                {/* Video Title - Below Thumbnail */}
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors leading-snug">
                    {video.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LatestVideosSection;

