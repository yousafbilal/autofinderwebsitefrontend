import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import Header from './include/Header';
import Footer from './include/Footer';
import { server_ip } from '../Utils/Data';
import { useLanguage } from '../contexts/LanguageContext';

// Detect attachment once outside component to avoid re-render on every keystroke
const bgAttachment = window.innerWidth > 768 ? 'fixed' : 'scroll';

function SignUp() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('imageSizeLessThan5MB'));
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError(t('pleaseFillAllFields'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError(t('passwordMustBe8CharsLong'));
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('pleaseEnterValidEmail'));
      setLoading(false);
      return;
    }

    try {
      const API_URL = server_ip || 'http://localhost:8001';
      const formDataToSend = new FormData();

      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('password', formData.password);

      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        body: formDataToSend,
        mode: 'cors',
        credentials: 'omit',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.requireOtp) {
          // OTP was sent — show OTP input screen
          setUserId(data.data?.id);
          setOtpStep(true);
          toast.info('OTP sent to your WhatsApp. Please verify.');
        } else {
          // No OTP required (shouldn't happen now, but fallback)
          toast.success(t('accountCreatedSuccessfully'));
          setTimeout(() => navigate('/signin'), 800);
        }
      } else {
        setError(data.message || t('signupFailed'));
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(t('errorDuringSignup'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP.');
      return;
    }
    setOtpLoading(true);
    setError(null);
    try {
      const API_URL = server_ip || 'http://localhost:8001';
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Account verified! Logging you in...');
        // Save token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userType', data.userType);
        if (data.profileImage) localStorage.setItem('profileImage', data.profileImage);
        setTimeout(() => navigate('/'), 800);
      } else {
        setError(data.message || 'OTP verification failed.');
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      setError('Error verifying OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const bgStyle = {
    backgroundImage: 'url(https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&h=1080&fit=crop)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: bgAttachment
  };

  return (
    <>
      <Helmet>
        <title>{t('signUp')} - Autofinder</title>
      </Helmet>
      <Header />

      <div
        className="min-h-[calc(100vh-80px)] relative flex items-center justify-center py-8 sm:py-12 md:py-16 overflow-hidden"
        style={bgStyle}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 z-0"></div>

        <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
          <div className="max-w-md mx-auto">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-2xl dark:shadow-gray-900 p-4 sm:p-6 md:p-8 transition-colors">

              {/* ===== OTP STEP ===== */}
              {otpStep ? (
                <>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1.5 sm:mb-2 text-center">Verify WhatsApp OTP</h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mb-6 sm:mb-8">
                    Enter the 6-digit code sent to your WhatsApp number.
                  </p>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                      <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-4 sm:space-y-5">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                        OTP Code
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => { setOtp(e.target.value); setError(null); }}
                        maxLength={6}
                        required
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-center tracking-widest text-xl font-bold"
                        placeholder="------"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={otpLoading}
                      className={`w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-bold text-base sm:text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl ${otpLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {otpLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setOtpStep(false); setError(null); setOtp(''); }}
                      className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors mt-2"
                    >
                      ← Back to Signup
                    </button>
                  </form>
                </>
              ) : (
                /* ===== SIGNUP STEP ===== */
                <>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1.5 sm:mb-2 text-center">{t('createAccount')}</h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mb-6 sm:mb-8">{t('signUpToGetStarted')}</p>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                      <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    {/* Profile Image */}
                    <div className="flex justify-center mb-3 sm:mb-4">
                      <label className="cursor-pointer">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-3 sm:border-4 border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-600 transition-colors">
                          {profileImagePreview ? (
                            <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <p className="text-[10px] sm:text-xs text-center text-gray-600 dark:text-gray-400 mt-1.5 sm:mt-2 px-2">{t('clickToUploadProfile')}</p>
                      </label>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                        {t('fullName')}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        placeholder={t('enterFullName')}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                        {t('emailAddress')}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        placeholder={t('enterEmail')}
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                        {t('phoneNumber')}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        placeholder={t('enterPhoneNumber')}
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                        {t('password')}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all pr-10 sm:pr-12"
                          placeholder={t('enterPasswordMinChars')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          {showPassword ? (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {formData.password && formData.password.length < 8 && (
                        <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 mt-1">{t('passwordMustBe8Chars')}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                        {t('confirmPassword')}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all pr-10 sm:pr-12"
                          placeholder={t('confirmYourPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(p => !p)}
                          className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          {showConfirmPassword ? (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 mt-1">{t('passwordsDoNotMatch')}</p>
                      )}
                    </div>

                    {/* Sign Up Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-bold text-base sm:text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? t('creatingAccount') : t('signUp')}
                    </button>
                  </form>

                  {/* Login Link */}
                  <div className="mt-4 sm:mt-6 text-center">
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {t('alreadyHaveAccount')}{' '}
                      <Link to="/signin" className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-600 font-semibold transition-colors">
                        {t('signIn')}
                      </Link>
                    </p>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default SignUp;
