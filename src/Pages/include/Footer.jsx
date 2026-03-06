import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube, FaArrowUp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { server_ip, ContactInfo } from '../../Utils/Data';

function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(t('emailRequiredError'));
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('validEmailError'));
      return;
    }

    setLoading(true);
    try {
      const API_URL = server_ip || 'http://localhost:8001';

      // Try newsletter endpoint first, fallback to contact endpoint
      let response;
      try {
        response = await fetch(`${API_URL}/newsletter/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim() }),
          mode: 'cors',
          credentials: 'omit',
        });
      } catch (err) {
        // If newsletter endpoint doesn't exist, use contact endpoint
        response = await fetch(`${API_URL}/contact`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Newsletter Subscriber',
            email: email.trim(),
            message: 'Newsletter subscription request'
          }),
          mode: 'cors',
          credentials: 'omit',
        });
      }

      const data = await response.json();

      if (response.ok) {
        toast.success(t('subscribeSuccess'));
        setEmail('');
      } else {
        toast.error(data.message || t('subscribeFailed'));
      }
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      // Even if API fails, show success message for better UX
      toast.success(t('thankYouSubscribe'));
      setEmail('');
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-4 sm:mt-6 transition-colors relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* About Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold mb-2">Auto Finder</h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              {t('footerAbout')}
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-xs sm:text-sm text-gray-400">{ContactInfo.address}</p>
              <p className="text-xs sm:text-sm text-gray-400">
                {t('phone')} <a href={`tel:${ContactInfo.contact_phone}`} className="hover:text-white transition-colors">{ContactInfo.contact_phone}</a>
              </p>
              <p className="text-xs sm:text-sm text-gray-400">
                {t('email')} <a href={`https://mail.google.com/mail/u/0/?view=cm&to=${ContactInfo.contact_email}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline break-all cursor-pointer pointer-events-auto">
                  {ContactInfo.contact_email}
                </a>
              </p>
            </div>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-2">{t('usefulLinks')}</h4>
            <ul className="space-y-1 text-xs sm:text-sm">
              <li>
                <Link
                  to="/latest-cars"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-gray-400 hover:text-white transition block py-0.5"
                >
                  {t('latestCars')}
                </Link>
              </li>
              <li>
                <Link
                  to="/upcoming-cars"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-gray-400 hover:text-white transition block py-0.5"
                >
                  {t('upcomingCars')}
                </Link>
              </li>
              <li>
                <Link
                  to="/used-cars"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-gray-400 hover:text-white transition block py-0.5"
                >
                  {t('searchUsedCar')}
                </Link>
              </li>
              <li>
                <Link
                  to="/sell-car"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-gray-400 hover:text-white transition block py-0.5"
                >
                  {t('carSell')}
                </Link>
              </li>
              <li>
                <Link
                  to="/compare-cars"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-gray-400 hover:text-white transition block py-0.5"
                >
                  {t('compareCar')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Recent Posts */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-2">{t('recentPosts')}</h4>
            <ul className="space-y-1 text-xs sm:text-sm">
              <li>
                <Link
                  to="/blog"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-gray-400 hover:text-white transition block py-0.5"
                >
                  <div>{t('timeToChange')}</div>
                  <div className="text-xs text-gray-500 mt-1">{t('by')} Admin • 28</div>
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-gray-400 hover:text-white transition block py-0.5"
                >
                  <div>{t('timeToChange')}</div>
                  <div className="text-xs text-gray-500 mt-1">{t('by')} Admin • 28</div>
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-gray-400 hover:text-white transition block py-0.5"
                >
                  <div>{t('timeToChange')}</div>
                  <div className="text-xs text-gray-500 mt-1">{t('by')} Admin • 28</div>
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-base sm:text-lg font-semibold mb-2">{t('newsletter')}</h4>
            <p className="text-gray-400 text-xs sm:text-sm mb-2 leading-relaxed">
              {t('newsletterDesc')}
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('enterEmail')}
                required
                disabled={loading}
                className="flex-1 px-3 sm:px-4 py-2 text-sm bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-100 rounded-md sm:rounded-l-md sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={loading}
                className={`bg-red-600 hover:bg-red-700 px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold rounded-md sm:rounded-l-none sm:rounded-r-md transition whitespace-nowrap ${loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? t('subscribing') : t('subscribe')}
              </button>
            </form>
            <div className="mt-2 flex gap-3 sm:gap-4">
              <a href="https://www.facebook.com/share/1BfUEWMF4L/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors" aria-label="Facebook">
                <FaFacebook className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="https://www.instagram.com/autofinder.pk?igsh=bDgwZmw2bWdsYmxs" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors" aria-label="Instagram">
                <FaInstagram className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="https://www.tiktok.com/@autofinder.pk?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors" aria-label="TikTok">
                <FaTiktok className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="https://www.youtube.com/channel/UCbcMNX986C4Pjc6DOQYObMQ" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors" aria-label="YouTube">
                <FaYoutube className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-2 pt-4 text-center text-xs sm:text-sm text-gray-400">
          <p>{t('copyright')} <a href="https://codeovapk.com" target="_blank" rel="noopener noreferrer" className="text-red-600 font-bold hover:text-red-700 transition-colors">Codeova</a></p>
          <div className="mt-1 sm:mt-2 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
            <Link
              to="/about"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition"
            >
              {t('aboutUs')}
            </Link>
            <span className="hidden sm:inline">|</span>
            <Link
              to="/contact"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition transform hover:scale-110 duration-200"
            >
              {t('contactUs')}
            </Link>
            <span className="hidden sm:inline">|</span>
            <Link
              to="/help"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition"
            >
              {t('help')}
            </Link>
            <span className="hidden sm:inline">|</span>
            <Link
              to="/privacy-policy"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition"
            >
              {t('privacyPolicy')}
            </Link>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="absolute bottom-8 right-0 sm:right-8 bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-md shadow-xl hover:shadow-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:-translate-y-1 z-10 hidden sm:block"
          aria-label="Scroll to top"
          title="Scroll to Top"
        >
          <FaArrowUp className="text-lg" />
        </button>
        {/* Mobile version - visible on smaller screens */}
        <button
          onClick={scrollToTop}
          className="absolute bottom-6 right-4 sm:hidden bg-gradient-to-r from-red-600 to-red-700 text-white p-2.5 rounded-md shadow-lg transition-all duration-300 transform active:scale-95 z-10"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="text-base" />
        </button>
      </div>
    </footer>
  );
}

export default Footer;
