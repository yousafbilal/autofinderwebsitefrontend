import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { server_ip } from '../Utils/Data';

function BlogSingle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) {
        setError('Blog ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const API_URL = server_ip || 'http://localhost:8001';
        
        // First try to fetch all blogs and find the one with matching ID
        const endpoint = `${API_URL}/blogs`;
        
        console.log('🔄 Fetching blog with ID:', id);
        console.log('🔗 Endpoint:', endpoint);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        });

        console.log('📡 Response status:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const blogsData = await response.json();
        
        // Find the blog with matching ID
        const foundBlog = Array.isArray(blogsData) 
          ? blogsData.find(b => (b._id === id || b.id === id))
          : null;

        if (!foundBlog) {
          setError('Blog not found');
          console.error('❌ Blog not found with ID:', id);
          return;
        }

        // Only show published blogs
        if (foundBlog.status && foundBlog.status !== 'published') {
          setError('This blog is not available');
          console.error('❌ Blog is not published:', foundBlog.status);
          return;
        }

        console.log('✅ Blog found:', foundBlog.title);
        setBlog(foundBlog);
      } catch (err) {
        console.error('❌ Error fetching blog:', err);
        setError(err.message || 'Failed to fetch blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const buildImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23ddd" width="800" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EBlog Image%3C/text%3E%3C/svg%3E';
    }
    if (imagePath.startsWith('http')) return imagePath;
    
    const API_URL = server_ip || 'http://localhost:8001';
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_URL}/uploads/${cleanPath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = blog?.title || 'Blog Post';
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(shareTitle);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Blog - Auto Finder</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden animate-pulse">
              <div className="h-96 bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-8">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
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
          <title>Error - Auto Finder</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
              <p className="text-yellow-800 dark:text-yellow-400 font-semibold mb-2">{error}</p>
              <div className="flex gap-4 justify-center mt-4">
                <button 
                  onClick={() => navigate('/blog')} 
                  className="bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-800"
                >
                  Back to Blog
                </button>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-800"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!blog) {
    return null;
  }

  const imageUrl = buildImageUrl(blog.image1);

  return (
    <>
      <Helmet>
        <title>{blog.title} - Auto Finder</title>
        <meta name="description" content={blog.excerpt || blog.title} />
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Link 
            to="/blog" 
            className="inline-flex items-center text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-600 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>

          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden transition-colors">
            {/* Blog Image */}
            <div className="h-96 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
              <img
                src={imageUrl}
                alt={blog.title || 'Blog post'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23ddd" width="800" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EBlog Image%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            <div className="p-8">
              {/* Author and Date */}
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {blog.author || 'Admin'} • {formatDate(blog.dateAdded || blog.date || blog.createdAt)}
              </div>

              {/* Category */}
              {blog.category && (
                <div className="mb-4">
                  <span className="inline-block bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                    {blog.category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                {blog.title}
              </h1>

              {/* Excerpt */}
              {blog.excerpt && (
                <div className="text-lg text-gray-600 dark:text-gray-400 mb-6 italic border-l-4 border-red-600 dark:border-red-500 pl-4">
                  {blog.excerpt}
                </div>
              )}

              {/* Content */}
              <div className="prose max-w-none mb-8">
                {blog.content ? (
                  <div 
                    className="text-gray-600 dark:text-gray-400 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    No content available for this blog post.
                  </p>
                )}
              </div>

              {/* Tags */}
              {blog.tags && Array.isArray(blog.tags) && blog.tags.length > 0 && (
                <div className="mb-8">
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">Share:</span>
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-600 transition-colors"
                  >
                    Facebook
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-600 transition-colors"
                  >
                    Twitter
                  </a>
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-600 transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}

export default BlogSingle;

