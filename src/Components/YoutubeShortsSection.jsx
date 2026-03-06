import React, { useState, useEffect } from 'react';
import { FaYoutube } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

// Channel URL for fallback
const CHANNEL_URL = 'https://www.youtube.com/@Autofinder-yf8tp';
const CHANNEL_ID = 'UCbcMNX986C4Pjc6DOQYObMQ';
// Using RSS to JSON API (stable for public channels)
const RSS_TO_JSON_API = `https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

// 4 Specific videos provided by the user as initial state / fallback
const FALLBACK_VIDEOS = [
    {
        id: 'drhBfk_nIwk',
        title: 'Toyota Camry 2025 Hybrid Review | Price | Specs | Features | Fuel Average', // Will update if search finds better
        thumbnail: 'https://img.youtube.com/vi/drhBfk_nIwk/hqdefault.jpg',
        isPlayable: true
    },
    {
        id: 'GHiOmVVW4aw',
        title: 'Tiggo 8 vs Tiggo 9 Pakistan | Complete Comparison | Which SUV Is Worth Buying?',
        thumbnail: 'https://img.youtube.com/vi/GHiOmVVW4aw/hqdefault.jpg',
        isPlayable: true
    },
    {
        id: 'UFGD5jCE5pk',
        title: 'China Now Dominates the Global Car Market (2025) | 35% Share – Is Pakistan Shifting to Chinese EVs?',
        thumbnail: 'https://img.youtube.com/vi/UFGD5jCE5pk/hqdefault.jpg',
        isPlayable: true
    },
    {
        id: 'z-FYbrn9tiY',
        title: 'Auto Finder Featured Video',
        thumbnail: 'https://img.youtube.com/vi/z-FYbrn9tiY/hqdefault.jpg',
        isPlayable: true
    }
];

const YoutubeShortsSection = () => {
    const { t } = useLanguage();
    // Start with fallback videos
    const [shorts, setShorts] = useState(FALLBACK_VIDEOS);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch(RSS_TO_JSON_API);
                const data = await response.json();

                if (data.status === 'ok' && data.items && data.items.length > 0) {
                    // Map RSS items to our format
                    const latestVideos = data.items.map(item => {
                        // Extract Video ID
                        let videoId = '';
                        const link = item.link || '';
                        if (link.includes('v=')) {
                            videoId = link.split('v=')[1].split('&')[0];
                        } else {
                            videoId = link.split('/').pop().split('?')[0];
                        }

                        return {
                            id: videoId,
                            title: item.title,
                            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                            isPlayable: true
                        };
                    });

                    // Update state with strictly the latest 4 from RSS
                    // This ensures the site always shows the "recent video" as requested
                    if (latestVideos.length > 0) {
                        setShorts(latestVideos.slice(0, 4));
                    }
                }
            } catch (error) {
                console.warn('YouTube RSS fetch failed, using fallback.', error);
                // No action needed, fallback already set
            }
        };

        fetchVideos();
    }, []);

    const handleVideoClick = (short) => {
        window.open(`https://www.youtube.com/watch?v=${short.id}`, '_blank');
    };

    return (
        <section id="youtube-shorts-section" className="min-h-[180px] snap-start py-4 bg-white dark:bg-slate-900 transition-colors border-b border-gray-100 dark:border-slate-800 relative z-30">
            <div className="container mx-auto px-4">
                {/* Section Title */}
                <div className="text-center mb-3">
                    <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter flex items-center justify-center gap-2"
                        style={{ textShadow: "1px 1px 0 #ccc, 2px 2px 0 #ccc, 4px 4px 20px rgba(0,0,0,0.1)" }}>
                        <FaYoutube className="text-red-600" />
                        {t('shortsAndVideos')}
                    </h2>
                </div>

                {/* Grid Container */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        {shorts.map((short) => (
                            <div
                                key={short.id}
                                className="flex-shrink-0 w-[90px] sm:w-[110px] md:w-[130px] aspect-[9/16] relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md border-0 bg-black transition-transform hover:scale-[1.02] group"
                                onClick={() => handleVideoClick(short)}
                            >
                                {/* Thumbnail */}
                                <img
                                    src={short.thumbnail}
                                    alt={short.title}
                                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=600&fit=crop&q=80' }}
                                />

                                {/* Authenticity Layer */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

                                {/* Play Icon */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                        <FaYoutube className="text-white text-lg" />
                                    </div>
                                </div>

                                {/* Content Overlay */}
                                <div className="absolute bottom-2 left-2 right-2">
                                    <h3 className="text-white text-[10px] sm:text-[11px] font-medium leading-tight line-clamp-2 drop-shadow-md mb-1">
                                        {short.title}
                                    </h3>
                                </div>

                                {/* Menu Icon */}
                                <div className="absolute top-2 right-2 text-white/80">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Explore Button */}
                <div className="text-center mt-3">
                    <button
                        onClick={() => window.open(CHANNEL_URL, '_blank')}
                        className="text-xs text-red-600 font-bold hover:text-red-700 hover:underline transition-all"
                    >
                        View More on YouTube
                    </button>
                </div>
            </div>
        </section>
    );
};

export default YoutubeShortsSection;
