import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { server_ip } from '../Utils/Data';
import { fetchWithRetry } from '../Utils/ApiUtils';

function Profile() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    country: 'Pakistan',
    city: '',
    username: '',
  });
  const [emailVerified, setEmailVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [originalFormData, setOriginalFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    country: 'Pakistan',
    city: '',
    username: '',
  });

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/signin');
      return;
    }

    const fetchUserData = async () => {
      try {
        const userData = JSON.parse(userStr);
        console.log('Loading user data from localStorage:', userData);
        console.log('Profile image in localStorage:', userData.profileImage);

        // First set user from localStorage for immediate display
        setUser(userData);

        // Fetch fresh user data from backend to get latest profile image
        if (userData._id || userData.id) {
          try {
            const API_URL = server_ip || 'http://localhost:8001';
            const userId = userData._id || userData.id;
            console.log('Fetching fresh user data from backend for userId:', userId);

            const response = await fetchWithRetry(`${API_URL}/users/${userId}`);

            if (response.ok) {
              const freshUserData = await response.json();
              console.log('Fresh user data from backend:', freshUserData);

              // Update user state with fresh data (especially profileImage)
              // Handle different response structures: { user: {...} } or direct user object
              const updatedUser = freshUserData.user || freshUserData.data || freshUserData;

              if (updatedUser && (updatedUser._id || updatedUser.id)) {
                console.log('Updated profile image from backend:', updatedUser.profileImage);

                // Merge fresh data with localStorage data, prioritizing backend data
                const mergedUserData = {
                  ...userData,
                  ...updatedUser,
                  profileImage: updatedUser.profileImage || userData.profileImage,
                  name: updatedUser.name || userData.name,
                  phone: updatedUser.phone || userData.phone,
                  gender: updatedUser.gender || userData.gender,
                  dateOfBirth: updatedUser.dateOfBirth || updatedUser.dob || userData.dateOfBirth || userData.dob,
                  country: updatedUser.country || userData.country,
                  city: updatedUser.city || userData.city,
                  username: updatedUser.username || userData.username,
                };

                setUser(mergedUserData);

                // Update localStorage with fresh data
                localStorage.setItem('user', JSON.stringify(mergedUserData));

                // Update userData reference for form initialization
                Object.assign(userData, mergedUserData);
              } else {
                console.warn('Invalid user data structure from backend:', freshUserData);
              }
            } else {
              const errorData = await response.json().catch(() => ({}));
              console.warn('Failed to fetch fresh user data:', response.status, errorData);
            }
          } catch (fetchError) {
            console.warn('Error fetching fresh user data from backend:', fetchError);
            // Continue with localStorage data if backend fetch fails
          }
        }

        // Check persistent verified emails list
        let isVerified = !!userData.emailVerified;
        try {
          const verifiedStr = localStorage.getItem('verifiedEmails');
          if (verifiedStr && userData.email) {
            const verifiedList = JSON.parse(verifiedStr);
            if (Array.isArray(verifiedList) && verifiedList.includes(userData.email)) {
              isVerified = true;
            }
          }
        } catch (e) {
          console.warn('Error reading verifiedEmails from localStorage', e);
        }

        const initialFormData = {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          gender: userData.gender || '',
          dateOfBirth: userData.dateOfBirth || userData.dob || '',
          country: userData.country || 'Pakistan',
          city: userData.city || '',
          username: userData.username || userData.email?.split('@')[0] || '',
        };
        setFormData(initialFormData);
        setEmailVerified(isVerified);
        // Store original values for comparison
        setOriginalFormData({
          name: userData.name || '',
          phone: userData.phone || '',
          gender: userData.gender || '',
          dateOfBirth: userData.dateOfBirth || userData.dob || '',
          country: userData.country || 'Pakistan',
          city: userData.city || '',
          username: userData.username || userData.email?.split('@')[0] || '',
        });

        // Set profile image preview - ALWAYS check and set if profileImage exists
        const API_URL = server_ip || 'http://localhost:8001';
        if (userData.profileImage) {
          let imageUrl;
          if (userData.profileImage.startsWith('http')) {
            imageUrl = userData.profileImage;
          } else {
            // Profile images are stored in uploads/profile_pics/ folder
            // Try both paths: /uploads/profile_pics/ and /uploads/
            imageUrl = `${API_URL}/uploads/profile_pics/${userData.profileImage}`;
          }
          console.log('Setting profile image preview:', imageUrl);
          setProfileImagePreview(imageUrl);
        } else {
          console.log('No profile image found');
          setProfileImagePreview(null);
        }
        setLoading(false);
      } catch (e) {
        console.error('Error parsing user data:', e);
        navigate('/signin');
      }
    };

    fetchUserData();
  }, [navigate, location.pathname]); // Re-run when location changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Resend verification email (send OTP)
  const handleResendVerification = async () => {
    if (!user?.email) {
      setError('Email not found');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    try {
      const API_URL = server_ip || 'http://localhost:8001';
      const response = await fetchWithRetry(`${API_URL}/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ emailOrPhone: user.email }),
      });

      const data = await response.json();
      setOtpLoading(false);

      if (data.success) {
        setOtpSent(true);
        setShowOtpModal(true);
        setSuccess('OTP sent to your email! Please check your inbox.');
      } else {
        setOtpError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      setOtpLoading(false);
      setOtpError('An error occurred while sending OTP');
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    try {
      const API_URL = server_ip || 'http://localhost:8001';
      const response = await fetchWithRetry(`${API_URL}/verify-otp`, {
        method: 'POST',
        body: JSON.stringify({
          emailOrPhone: user.email,
          otp: otp.trim()
        }),
      });

      const data = await response.json();
      setOtpLoading(false);

      if (data.success) {
        // Update user as verified locally
        const updatedUser = {
          ...user,
          emailVerified: true
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Persist verified email in a separate list so it survives logout/login
        try {
          const verifiedStr = localStorage.getItem('verifiedEmails');
          const verifiedList = verifiedStr ? JSON.parse(verifiedStr) : [];
          if (user.email && !verifiedList.includes(user.email)) {
            verifiedList.push(user.email);
            localStorage.setItem('verifiedEmails', JSON.stringify(verifiedList));
          }
        } catch (e) {
          console.warn('Error updating verifiedEmails in localStorage', e);
        }

        setUser(updatedUser);
        setEmailVerified(true);
        setShowOtpModal(false);
        setOtp('');
        setOtpSent(false);
        setSuccess('Email verified successfully!');
      } else {
        setOtpError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setOtpLoading(false);
      setOtpError('An error occurred while verifying OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const API_URL = server_ip || 'http://localhost:8001';
      const userId = user.userId || user._id;

      if (!userId) {
        setError('User ID not found. Please login again.');
        return;
      }

      // Check if any field has actually changed
      const nameChanged = formData.name.trim() !== originalFormData.name.trim();
      const phoneChanged = formData.phone.trim() !== originalFormData.phone.trim();
      const genderChanged = formData.gender !== originalFormData.gender;
      const dateOfBirthChanged = formData.dateOfBirth !== originalFormData.dateOfBirth;
      const countryChanged = formData.country !== originalFormData.country;
      const cityChanged = formData.city !== originalFormData.city;
      const usernameChanged = formData.username.trim() !== originalFormData.username.trim();
      const imageChanged = profileImage !== null;

      // If nothing has changed, show message and return
      if (!nameChanged && !phoneChanged && !genderChanged && !dateOfBirthChanged &&
        !countryChanged && !cityChanged && !usernameChanged && !imageChanged) {
        setError('No changes detected. Please modify at least one field before saving.');
        return;
      }

      // Step 1: Update profile picture if a new image is selected
      let updatedProfileImage = user.profileImage;
      if (profileImage) {
        try {
          const imageFormData = new FormData();
          imageFormData.append('profilePic', profileImage);

          const imageResponse = await fetchWithRetry(`${API_URL}/edit-profile-pic/${userId}`, {
            method: 'PUT',
            body: imageFormData,
            headers: {} // Don't set content-type for FormData
          });

          const imageData = await imageResponse.json();
          console.log('Image upload response:', imageData);

          if (!imageResponse.ok) {
            throw new Error(imageData.message || 'Failed to update profile picture');
          }

          // Update user profile image in state and preview
          if (imageData.user && imageData.user.profileImage) {
            updatedProfileImage = imageData.user.profileImage;
            console.log('Updated profile image filename from response:', updatedProfileImage);

            // Update profile image preview immediately with full URL
            let imageUrl;
            if (updatedProfileImage.startsWith('http')) {
              imageUrl = updatedProfileImage;
            } else {
              // Profile images are stored in uploads/profile_pics/ folder
              imageUrl = `${API_URL}/uploads/profile_pics/${updatedProfileImage}`;
            }

            console.log('Setting profile image preview to:', imageUrl);
            setProfileImagePreview(imageUrl);

            // Also update user state immediately
            setUser(prevUser => {
              const updated = {
                ...prevUser,
                profileImage: updatedProfileImage
              };
              console.log('Updated user state with profile image:', updated);
              return updated;
            });
          } else {
            console.error('No profile image in response:', imageData);
            console.error('Response structure:', JSON.stringify(imageData, null, 2));
          }
        } catch (imgErr) {
          console.error('Error updating profile picture:', imgErr);
          setError('Failed to update profile picture. ' + imgErr.message);
          return;
        }
      }

      // Step 2: Update profile details (name, phone, dob)
      // Use dateAdded as dob if available, otherwise use current date
      const dob = user.dateAdded || new Date().toISOString();

      const detailsResponse = await fetchWithRetry(`${API_URL}/edit-profile-details/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          dob: dob,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          country: formData.country,
          city: formData.city,
          username: formData.username,
        }),
      });

      const detailsData = await detailsResponse.json();

      if (!detailsResponse.ok) {
        throw new Error(detailsData.message || 'Failed to update profile details');
      }

      // Get the latest user state (in case it was updated during image upload)
      const currentUser = user.profileImage === updatedProfileImage ? user : { ...user, profileImage: updatedProfileImage };

      // Update localStorage with new data
      const updatedUser = {
        ...currentUser,
        name: formData.name,
        phone: formData.phone,
        email: formData.email, // Keep email as is (backend doesn't update email in this endpoint)
        profileImage: updatedProfileImage, // Updated from image upload if applicable
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        dob: formData.dateOfBirth, // Also update dob field
        country: formData.country,
        city: formData.city,
        username: formData.username,
      };

      // Ensure updatedProfileImage is set before saving to localStorage
      console.log('Saving to localStorage - updatedProfileImage:', updatedProfileImage);
      console.log('Saving to localStorage - updatedUser:', updatedUser);

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Always update profile image preview with the new image
      if (updatedProfileImage) {
        let imageUrl;
        if (updatedProfileImage.startsWith('http')) {
          imageUrl = updatedProfileImage;
        } else {
          // Profile images are stored in uploads/profile_pics/ folder
          imageUrl = `${API_URL}/uploads/profile_pics/${updatedProfileImage}`;
        }
        setProfileImagePreview(imageUrl);
        console.log('Profile image preview set to:', imageUrl);
        console.log('Updated profile image filename:', updatedProfileImage);
      }

      // Update original form data to reflect the new saved values
      setOriginalFormData({
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        country: formData.country,
        city: formData.city,
        username: formData.username,
      });

      setEditMode(false);
      setSuccess('Profile updated successfully!');

      // Reset profile image state
      setProfileImage(null);

      // Force re-render to show updated image
      // Don't reload immediately, let user see the success message
      // Image should already be visible from the preview update above
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'An error occurred while updating profile');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('profile')} - Auto Finder</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-2 transition-colors">
        <div className="container mx-auto px-3 max-w-lg">
          {/* Email Verification Banner */}
          {!emailVerified && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm">
                {t('emailVerificationDesc')}{' '}
                <button
                  onClick={() => {
                    // TODO: Implement resend verification email
                    alert('Resend verification email functionality will be implemented');
                  }}
                  className="text-red-700 dark:text-red-300 underline font-semibold hover:text-red-800 dark:hover:text-red-200"
                >
                  {t('clickingHere')}
                </button>
              </p>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
            <h1 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100">{t('myProfile')}</h1>
            <div className="flex gap-1.5">
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                {t('backToDashboard')}
              </button>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                >
                  {t('editProfile')}
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded shadow-md dark:shadow-gray-900 p-2 sm:p-2.5 transition-colors">
            {error && (
              <div className="mb-1.5 p-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-1.5 p-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                <p className="text-xs text-green-600 dark:text-green-400">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Profile Image Section */}
              <div className="mb-2 flex flex-col sm:flex-row items-center sm:items-start gap-1.5">
                <div className="flex-shrink-0">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error('Image load error:', profileImagePreview);
                        const attempts = [];
                        if (profileImagePreview.includes('/uploads/profile_pics/')) {
                          attempts.push(profileImagePreview.replace('/uploads/profile_pics/', '/uploads/'));
                        } else if (profileImagePreview.includes('/uploads/')) {
                          attempts.push(profileImagePreview.replace('/uploads/', '/uploads/profile_pics/'));
                        }
                        if (profileImagePreview && !profileImagePreview.includes('%20')) {
                          attempts.push(profileImagePreview.replace(/ /g, '%20'));
                        }
                        const currentAttempt = attempts.find(url => url !== e.target.src);
                        if (currentAttempt) {
                          e.target.src = currentAttempt;
                          return;
                        }
                        e.target.style.display = 'none';
                        setProfileImagePreview(null);
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  {editMode && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-red-50 file:text-red-700 dark:file:bg-red-900/20 dark:file:text-red-400
                          hover:file:bg-red-100 dark:hover:file:bg-red-900/30
                          cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('maxSize')} 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields in Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {/* Full Name */}
                <div className="mb-1.5">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                    {t('fullName')}
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded 
                        bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                        focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-xs text-gray-800 dark:text-gray-200">{formData.name || 'N/A'}</p>
                  )}
                </div>

                {/* Gender */}
                <div className="mb-1.5">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                    {t('gender')}
                  </label>
                  {editMode ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded 
                        bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                        focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">{t('selectGender')}</option>
                      <option value="male">{t('male')}</option>
                      <option value="female">{t('female')}</option>
                      <option value="other">{t('other')}</option>
                    </select>
                  ) : (
                    <p className="text-xs text-gray-800 dark:text-gray-200 capitalize">{formData.gender ? t(formData.gender) : 'N/A'}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="mb-1.5">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                    {t('dateOfBirth')}
                  </label>
                  {editMode ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded 
                        bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                        focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-xs text-gray-800 dark:text-gray-200">{formData.dateOfBirth || 'DD-MM-YYYY'}</p>
                  )}
                </div>

                {/* Country */}
                <div className="mb-1.5">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                    {t('country')}
                  </label>
                  {editMode ? (
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded 
                        bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                        focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="Pakistan">Pakistan</option>
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                    </select>
                  ) : (
                    <p className="text-xs text-gray-800 dark:text-gray-200">{formData.country || 'Pakistan'}</p>
                  )}
                </div>

                {/* City */}
                <div className="mb-1.5">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                    {t('city')}
                  </label>
                  {editMode ? (
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded 
                        bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                        focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">{t('selectCity')}</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Quetta">Quetta</option>
                      <option value="Sialkot">Sialkot</option>
                      <option value="Gujranwala">Gujranwala</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Sargodha">Sargodha</option>
                      <option value="Bahawalpur">Bahawalpur</option>
                      <option value="Sukkur">Sukkur</option>
                      <option value="Abbottabad">Abbottabad</option>
                      <option value="Mardan">Mardan</option>
                      <option value="Swat">Swat</option>
                      <option value="Kasur">Kasur</option>
                      <option value="Sheikhupura">Sheikhupura</option>
                      <option value="Okara">Okara</option>
                      <option value="Jhang">Jhang</option>
                      <option value="Larkana">Larkana</option>
                      <option value="Rahim Yar Khan">Rahim Yar Khan</option>
                      <option value="Gujrat">Gujrat</option>
                      <option value="Dera Ghazi Khan">Dera Ghazi Khan</option>
                      <option value="Mirpur">Mirpur</option>
                      <option value="Muzaffarabad">Muzaffarabad</option>
                      <option value="Nawabshah">Nawabshah</option>
                      <option value="Chiniot">Chiniot</option>
                      <option value="Khairpur">Khairpur</option>
                      <option value="Charsadda">Charsadda</option>
                      <option value="Nowshera">Nowshera</option>
                      <option value="Kohat">Kohat</option>
                      <option value="Karak">Karak</option>
                      <option value="Bannu">Bannu</option>
                      <option value="Dera Ismail Khan">Dera Ismail Khan</option>
                      <option value="Haripur">Haripur</option>
                      <option value="Kamoke">Kamoke</option>
                      <option value="Turbat">Turbat</option>
                      <option value="Gwadar">Gwadar</option>
                      <option value="Hub">Hub</option>
                      <option value="Jacobabad">Jacobabad</option>
                      <option value="Khuzdar">Khuzdar</option>
                      <option value="Mansehra">Mansehra</option>
                      <option value="Attock">Attock</option>
                      <option value="Hassan Abdal">Hassan Abdal</option>
                      <option value="Lodhran">Lodhran</option>
                      <option value="Toba Tek Singh">Toba Tek Singh</option>
                      <option value="Jhelum">Jhelum</option>
                      <option value="Kharian">Kharian</option>
                      <option value="Wazirabad">Wazirabad</option>
                      <option value="Pakpattan">Pakpattan</option>
                      <option value="Shikarpur">Shikarpur</option>
                      <option value="Badin">Badin</option>
                      <option value="Thatta">Thatta</option>
                      <option value="Matiari">Matiari</option>
                      <option value="Hala">Hala</option>
                      <option value="Mianwali">Mianwali</option>
                      <option value="Bhakkar">Bhakkar</option>
                      <option value="Hafizabad">Hafizabad</option>
                      <option value="Khanewal">Khanewal</option>
                      <option value="Sadiqabad">Sadiqabad</option>
                      <option value="Ghotki">Ghotki</option>
                      <option value="Kotri">Kotri</option>
                      <option value="Shahdadpur">Shahdadpur</option>
                      <option value="Umerkot">Umerkot</option>
                      <option value="Sanghar">Sanghar</option>
                      <option value="Dadu">Dadu</option>
                      <option value="Tando Adam">Tando Adam</option>
                      <option value="Tando Allahyar">Tando Allahyar</option>
                      <option value="Moro">Moro</option>
                      <option value="Khairpur Nathan Shah">Khairpur Nathan Shah</option>
                      <option value="Rohri">Rohri</option>
                      <option value="Chaman">Chaman</option>
                      <option value="Zhob">Zhob</option>
                      <option value="Loralai">Loralai</option>
                      <option value="Pishin">Pishin</option>
                      <option value="Kalat">Kalat</option>
                      <option value="Sibi">Sibi</option>
                      <option value="Vehari">Vehari</option>
                      <option value="Arifwala">Arifwala</option>
                      <option value="Khanpur">Khanpur</option>
                      <option value="Kot Addu">Kot Addu</option>
                      <option value="Muzaffargarh">Muzaffargarh</option>
                      <option value="Jatoi">Jatoi</option>
                      <option value="Chishtian">Chishtian</option>
                      <option value="Hasilpur">Hasilpur</option>
                      <option value="Muridke">Muridke</option>
                      <option value="Kaswal">Kaswal</option>
                      <option value="Mandi Bahauddin">Mandi Bahauddin</option>
                      <option value="Narowal">Narowal</option>
                      <option value="Shorkot">Shorkot</option>
                      <option value="Jaranwala">Jaranwala</option>
                      <option value="Pattoki">Pattoki</option>
                      <option value="Gilgit">Gilgit</option>
                      <option value="Skardu">Skardu</option>
                      <option value="Hunza">Hunza</option>
                      <option value="Nagar">Nagar</option>
                      <option value="Ghizer">Ghizer</option>
                      <option value="Astore">Astore</option>
                      <option value="Diamer">Diamer</option>
                      <option value="Mirpur AJK">Mirpur AJK</option>
                      <option value="Kotli AJK">Kotli AJK</option>
                      <option value="Rawalakot">Rawalakot</option>
                      <option value="Bagh AJK">Bagh AJK</option>
                      <option value="Bhimber">Bhimber</option>
                    </select>
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200">{formData.city || t('city')}</p>
                  )}
                </div>

                {/* Username */}
                <div className="mb-1.5">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                    {t('username')}
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded 
                        bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                        focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-xs text-gray-800 dark:text-gray-200">{formData.username || 'N/A'}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="mb-1.5">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  {t('email')}
                </label>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-gray-800 dark:text-gray-200">{formData.email || 'N/A'}</p>
                  {emailVerified && (
                    <div className="flex items-center gap-1" title="Verified Account">
                      <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{t('verified')}</span>
                    </div>
                  )}
                </div>
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={otpLoading}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm mt-1 underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? t('sending') : t('resendVerificationEmail')}
                  </button>
                )}
              </div>

              {/* Mobile Number */}
              <div className="mb-1.5">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  {t('phoneNumber')}
                </label>
                <div className="flex items-center gap-1.5">
                  {editMode ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="flex-1 px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded 
                        bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                        focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                    />
                  ) : (
                    <>
                      <p className="text-xs text-gray-800 dark:text-gray-200 flex-1">{formData.phone || t('noData')}</p>
                      {!formData.phone && (
                        <button
                          type="button"
                          onClick={() => setEditMode(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                        >
                          {t('addNumber')}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center mt-8">
                {editMode ? (
                  <>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors font-medium"
                    >
                      {t('saveChanges')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setError(null);
                        setSuccess(null);
                        // Reset form data to original values
                        setFormData({
                          name: originalFormData.name || user?.name || '',
                          email: user?.email || '',
                          phone: originalFormData.phone || user?.phone || '',
                          gender: user?.gender || '',
                          dateOfBirth: user?.dateOfBirth || user?.dob || '',
                          country: user?.country || 'Pakistan',
                          city: user?.city || '',
                          username: user?.username || user?.email?.split('@')[0] || '',
                        });
                        setProfileImage(null);
                        if (user?.profileImage) {
                          const API_URL = server_ip || 'http://localhost:8001';
                          if (user.profileImage.startsWith('http')) {
                            setProfileImagePreview(user.profileImage);
                          } else {
                            setProfileImagePreview(`${API_URL}/uploads/profile_pics/${user.profileImage}`);
                          }
                        } else {
                          setProfileImagePreview(null);
                        }
                      }}
                      className="px-6 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
                    >
                      {t('cancel')}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    {t('editProfile')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('verifyEmail')}</h2>
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp('');
                  setOtpError(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('otpVerificationDesc')} (<strong>{user?.email}</strong>)
            </p>

            {otpError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{otpError}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('enterOtp')}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                  setOtpError(null);
                }}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg 
                  bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otp.length !== 6}
                className="flex-1 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpLoading ? t('verifying') : t('verifyOtp')}
              </button>
              <button
                onClick={handleResendVerification}
                disabled={otpLoading}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('resend')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;

