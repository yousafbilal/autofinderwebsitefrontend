import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import Header from './include/Header';
import Footer from './include/Footer';
import { server_ip } from '../Utils/Data';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchWithRetry } from '../Utils/ApiUtils';

function SignIn() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.emailOrPhone || !formData.password) {
      setError(t('pleaseEnterEmailAndPassword'));
      setLoading(false);
      return;
    }

    try {
      const API_URL = server_ip || 'http://localhost:8001';
      const response = await fetchWithRetry(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrPhone: formData.emailOrPhone,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user data in localStorage (same as mobile app)
        const userData = {
          token: data.token,
          userId: data.userId,
          _id: data.userId, // Also store as _id for compatibility
          name: data.name,
          email: data.email,
          phone: data.phone,
          dateAdded: data.dateAdded,
          profileImage: data.profileImage,
          userType: data.userType,
        };

        // If this email was verified earlier, restore verification flag
        try {
          const verifiedStr = localStorage.getItem('verifiedEmails');
          if (verifiedStr && data.email) {
            const verifiedList = JSON.parse(verifiedStr);
            if (Array.isArray(verifiedList) && verifiedList.includes(data.email)) {
              userData.emailVerified = true;
            }
          }
        } catch (e) {
          console.warn('Error reading verifiedEmails from localStorage', e);
        }

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);

        // Show success toast
        toast.success(t('loginSuccessful'));

        // Redirect to home page and refresh header after short delay
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 800);
      } else {
        setError(data.message || t('loginFailedCheckCredentials'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t('errorDuringLogin'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('signIn')} - Autofinder</title>
      </Helmet>
      <Header />

      <div className="min-h-[calc(100vh-80px)] relative flex items-center justify-center py-16 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&h=1080&fit=crop"
            alt="Car Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-md mx-auto">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl dark:shadow-gray-900 p-8 transition-colors">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">{t('welcomeBack')}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">{t('signInToAccount')}</p>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email/Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('emailOrPhone')}
                  </label>
                  <input
                    type="text"
                    name="emailOrPhone"
                    value={formData.emailOrPhone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    placeholder={t('enterEmailOrPhone')}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all pr-12"
                      placeholder={t('enterPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-600 transition-colors">
                    {t('forgotPassword')}
                  </Link>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-6 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl ${loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {loading ? t('signingIn') : t('signIn')}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {t('dontHaveAccount')}{' '}
                  <Link to="/signup" className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-600 font-semibold transition-colors">
                    {t('signUp')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default SignIn;
