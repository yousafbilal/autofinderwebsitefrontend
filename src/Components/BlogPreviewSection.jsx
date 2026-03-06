import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';

const BlogPreviewSection = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestBlogs = async () => {
            try {
                setLoading(true);

                const API_URL = server_ip || 'http://localhost:8001';
                const endpoint = `${API_URL}/blogs`;

                // Mock data
                const mockBlogs = [
                    {
                        _id: 'mock-1',
                        title: 'Autofinder Launches New Premium Service',
                        dateAdded: new Date().toISOString(),
                        author: 'Autofinder Team',
                        image1: '',
                        excerpt: 'Experience the best car selling service in Pakistan with our new premium package offering verified buyers and quick sales.',
                        status: 'published'
                    },
                    {
                        _id: 'mock-2',
                        title: 'Top 10 Used Cars to Buy in 2024',
                        dateAdded: new Date(Date.now() - 86400000).toISOString(),
                        author: 'Expert Reviewer',
                        image1: '',
                        excerpt: 'Check out our curated list of the best value-for-money used cars available this year, featuring reliability and fuel efficiency.',
                        status: 'published'
                    },
                    {
                        _id: 'mock-3',
                        title: 'Car Inspection Guide: What to Look For',
                        dateAdded: new Date(Date.now() - 172800000).toISOString(),
                        author: 'Tech Guru',
                        image1: '',
                        excerpt: 'Learn the essential checklist points before buying a used car to avoid scams and mechanical issues. A must-read for first-time buyers.',
                        status: 'published'
                    }
                ];

                try {
                    const response = await fetchWithRetry(endpoint, {
                        method: 'GET',
                    });

                    if (!response.ok) {
                        console.log("Using mock data due to API error");
                        setBlogs(mockBlogs);
                        return;
                    }

                    const data = await response.json();

                    if (Array.isArray(data) && data.length > 0) {
                        // Filter only published blogs and take latest 3
                        const publishedBlogs = data
                            .filter(blog => blog.status === 'published' || !blog.status)
                            .sort((a, b) => {
                                const dateA = new Date(a.dateAdded || a.createdAt || 0);
                                const dateB = new Date(b.dateAdded || b.createdAt || 0);
                                return dateB - dateA;
                            })
                            .slice(0, 3);

                        setBlogs(publishedBlogs.length > 0 ? publishedBlogs : mockBlogs);
                    } else {
                        setBlogs(mockBlogs);
                    }
                } catch (fetchError) {
                    console.warn("Fetch failed, using mock data:", fetchError);
                    setBlogs(mockBlogs);
                }
            } catch (err) {
                console.error('❌ Error in blog fetch flow:', err);
                setBlogs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestBlogs();
    }, []);

    const buildImageUrl = (imagePath) => {
        if (!imagePath) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EBlog Image%3C/text%3E%3C/svg%3E';
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
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-wider"
                        style={{ textShadow: "1px 1px 0 #ccc, 2px 2px 0 #ccc, 3px 3px 0 #ccc, 4px 4px 0 #ccc, 6px 6px 20px rgba(0,0,0,0.1)" }}>
                        Latest From Our Blog
                    </h2>
                </div>
                <div className="flex justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900 overflow-hidden animate-pulse max-w-[320px] mx-auto w-full">
                                <div className="h-32 md:h-40 bg-gray-200 dark:bg-gray-700"></div>
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
        );
    }

    if (blogs.length === 0) {
        return null;
    }

    return (
        <section className="snap-start flex flex-col justify-center py-8 bg-white dark:bg-gray-800 transition-colors">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-wider transition-all duration-300 hover:scale-110 cursor-default inline-block"
                        style={{ textShadow: "1px 1px 0 #ccc, 2px 2px 0 #ccc, 3px 3px 0 #ccc, 4px 4px 0 #ccc, 6px 6px 20px rgba(0,0,0,0.1)" }}>
                        Latest From Our Blog
                    </h2>
                </div>

                <div className="flex justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
                        {blogs.map((blog) => {
                            const imageUrl = buildImageUrl(blog.image1);
                            return (
                                <div key={blog._id || blog.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900 overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group h-full flex flex-col max-w-[320px] mx-auto w-full">
                                    <div className="h-32 md:h-40 bg-gray-200 dark:bg-gray-700 relative overflow-hidden flex-shrink-0">
                                        <img
                                            src={imageUrl}
                                            alt={blog.title || 'News'}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENews Image%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow">
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                                            <span className="font-medium">{blog.author || 'Admin'}</span>
                                            <span>•</span>
                                            <span>{formatDate(blog.dateAdded || blog.date)}</span>
                                        </div>
                                        <h3 className="text-lg md:text-xl font-bold mb-1 text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-1">
                                            {blog.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-3 line-clamp-2 leading-relaxed flex-grow">
                                            {blog.excerpt || (blog.content ? blog.content.substring(0, 150) + '...' : 'No excerpt available')}
                                        </p>
                                        <Link
                                            to={`/blog/${blog._id || blog.id}`}
                                            className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-600 font-semibold text-sm md:text-base inline-flex items-center gap-2 transition-colors group/link mt-auto"
                                        >
                                            Read More <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BlogPreviewSection;
