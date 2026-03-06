import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { server_ip } from '../Utils/Data';
import { useLanguage } from '../contexts/LanguageContext';

function Blog() {
  const { t, language } = useLanguage();
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL = server_ip || 'http://localhost:8001';
        const endpoint = `${API_URL}/blogs`;

        console.log('🔄 Fetching blogs from:', endpoint);

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('📦 Blogs received:', data.length);

        if (Array.isArray(data) && data.length > 0) {
          // Filter only published blogs for website
          const publishedBlogs = data.filter(blog =>
            blog.status === 'published' || !blog.status
          );
          setBlogPosts(publishedBlogs);
          console.log('✅ Published blogs:', publishedBlogs.length);
        } else {
          setBlogPosts([]);
        }
      } catch (err) {
        console.error('❌ Error fetching blogs:', err);
        setError(err.message || 'Failed to fetch blogs');
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const buildImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250"%3E%3Crect fill="%23ddd" width="400" height="250"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EBlog Image%3C/text%3E%3C/svg%3E';
    }
    if (imagePath.startsWith('http')) return imagePath;

    const API_URL = server_ip || 'http://localhost:8001';
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_URL}/uploads/${cleanPath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('dateNotAvailable');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>{t('blogTitleSuffixUrdu') ? `Blog ${t('blogTitleSuffixUrdu')}` : 'Blog - Auto Finder'}</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-6 transition-colors">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('latestNewsHeader')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{t('loadingUsedCars')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
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
          <title>{t('blogTitleSuffixUrdu') ? `Blog ${t('blogTitleSuffixUrdu')}` : 'Blog - Auto Finder'}</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-6 transition-colors">
          <div className="container mx-auto px-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
              <p className="text-yellow-800 dark:text-yellow-400 font-semibold mb-2">{t('unableToLoadUsedCars')}</p>
              <p className="text-yellow-700 dark:text-yellow-500 text-sm mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-800"
              >
                {t('retry')}
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
        <title>{t('blogTitleSuffixUrdu') ? `Blog ${t('blogTitleSuffixUrdu')}` : 'Blog - Auto Finder'}</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-2 transition-colors">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-2 uppercase tracking-wide border-b-2 border-red-600 inline-block pb-1">
            {t('latestNewsHeader')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium italic">
            {t('readLatestNews')}
          </p>

          {blogPosts.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 mb-2 font-bold text-xl">{t('noBlogsAvailable')}</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">{t('checkBackLater')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPosts.map((post) => {
                  const imageUrl = buildImageUrl(post.image1);
                  return (
                    <div key={post._id || post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden hover:shadow-xl transition">
                      <div className="h-40 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={post.title || 'Blog post'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250"%3E%3Crect fill="%23ddd" width="400" height="250"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EBlog Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-bold">
                          {post.author || t('adminAuthor')} • {formatDate(post.dateAdded || post.date)}
                        </div>
                        <h3 className="text-lg font-bold mb-1 text-gray-800 dark:text-gray-100 line-clamp-1 group-hover:text-red-600 transition-colors uppercase">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">
                          {post.excerpt || (post.content ? post.content.substring(0, 150) + '...' : 'No excerpt available')}
                        </p>
                        <Link
                          to={`/blog/${post._id || post.id}`}
                          className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-600 font-extrabold flex items-center gap-1 group/btn"
                        >
                          {t('readMoreBtn')}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md font-bold transition-all ${currentPage === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-600 hover:text-white dark:hover:bg-red-700'}`}
                  >
                    {language === 'ur' ? 'پچھلا' : 'Previous'}
                  </button>
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-md font-bold transition-all ${currentPage === page ? 'bg-red-600 dark:bg-red-700 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white'}`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-gray-600 dark:text-gray-400">...</span>;
                    }
                    return null;
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md font-bold transition-all ${currentPage === totalPages ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-600 hover:text-white dark:hover:bg-red-700'}`}
                  >
                    {language === 'ur' ? 'اگلا' : 'Next'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Blog;

