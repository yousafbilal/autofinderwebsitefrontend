import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { fetchWithRetry } from '../Utils/ApiUtils';
import Header from './include/Header';
import Footer from './include/Footer';
import { server_ip } from '../Utils/Data';
import './Auth.css';

// ⚠️ Component InputWithAsterisk removed to fix focus loss issues.
// Inputs are now inlined directly to prevent unmount on keystrokes.

function Auth() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSignUp, setIsSignUp] = useState(false);

    // Sign In State
    const [signInData, setSignInData] = useState({ emailOrPhone: '', password: '' });
    const [signInLoading, setSignInLoading] = useState(false);
    const [signInError, setSignInError] = useState(null);
    const [showSignInPassword, setShowSignInPassword] = useState(false);

    // Phone Formatting Helper
    const formatPhone = (phone) => {
        let formatted = phone.trim().replace(/\D/g, '');
        if (formatted.startsWith('03')) {
            formatted = '92' + formatted.substring(1);
        }
        // If it's 10 digits and starts with 3, prepend 92
        if (formatted.length === 10 && formatted.startsWith('3')) {
            formatted = '92' + formatted;
        }
        return formatted.startsWith('+') ? formatted : '+' + formatted;
    };

    // Sign Up State
    const [signUpData, setSignUpData] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: ''
    });
    const [signUpLoading, setSignUpLoading] = useState(false);
    const [signUpError, setSignUpError] = useState(null);

    // OTP State
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpUserId, setOtpUserId] = useState(null);
    const [otpPhone, setOtpPhone] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState(null);

    // Login OTP State
    const [loginOtpStep, setLoginOtpStep] = useState(false);
    const [loginOtp, setLoginOtp] = useState('');
    const [loginOtpUserId, setLoginOtpUserId] = useState(null);
    const [loginOtpPhone, setLoginOtpPhone] = useState('');
    const [loginOtpLoading, setLoginOtpLoading] = useState(false);
    const [loginOtpError, setLoginOtpError] = useState(null);

    useEffect(() => {
        if (location.pathname === '/signup') {
            setIsSignUp(true);
        } else {
            setIsSignUp(false);
        }

        // 🔬 Connectivity Diagnostics
        const checkConnectivity = async () => {
            // FORCE 8001 for diagnostics too
            const API_URL = server_ip;
            console.log(`📡 [DIAGNOSTIC] Testing connection to: ${API_URL}/health`);
            try {
                const res = await fetch(`${API_URL}/health`);
                const data = await res.json();
                console.log('✅ [DIAGNOSTIC] Backend reachable:', data);
            } catch (err) {
                console.error('❌ [DIAGNOSTIC] Backend UNREACHABLE:', err.message);
                // No retry needed here, just log it
            }
        };
        checkConnectivity();
    }, [location.pathname]);

    const handlePanelSwitch = (status) => {
        setIsSignUp(status);
        setOtpStep(false);
        setLoginOtpStep(false);
        const newPath = status ? '/signup' : '/signin';
        window.history.replaceState(null, '', newPath);
    };

    // ----- Sign In Handlers -----
    const handleSignInChange = useCallback((e) => {
        const { name, value } = e.target;
        setSignInData(prev => ({ ...prev, [name]: value }));
        setSignInError(null);
    }, []);

    const handleSignInSubmit = async (e) => {
        e.preventDefault();
        setSignInError(null);
        setSignInLoading(true);

        if (!signInData.emailOrPhone || !signInData.password) {
            setSignInError('Please enter both email/phone and password');
            setSignInLoading(false);
            return;
        }

        try {
            const API_URL = server_ip;
            // Format phone if the input looks like a phone number
            const submissionData = { ...signInData };
            if (/^\d+$/.test(submissionData.emailOrPhone.replace(/\D/g, '')) || submissionData.emailOrPhone.startsWith('+')) {
                submissionData.emailOrPhone = formatPhone(submissionData.emailOrPhone);
                console.log('📱 Formatted Login Phone:', submissionData.emailOrPhone);
            }

            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
                mode: 'cors',
                credentials: 'omit',
            });

            const data = await response.json();

            if (data.success && data.requireOtp) {
                // User needs OTP verification
                setLoginOtpUserId(data.userId);
                setLoginOtpPhone(data.phone);
                setLoginOtpStep(true);
                toast.info('OTP sent to your WhatsApp/SMS. Please verify.');
            } else if (data.success && data.token) {
                // Logged in directly
                const userData = {
                    token: data.token,
                    userId: data.userId,
                    _id: data.userId,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    dateAdded: data.dateAdded,
                    profileImage: data.profileImage,
                    userType: data.userType,
                };
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', data.token); // Explicit token for simpler retrieval
                toast.success('Login successful!');
                setTimeout(() => { navigate('/'); window.location.reload(); }, 800);
            } else {
                setSignInError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setSignInError('An error occurred during login. Please try again.');
        } finally {
            setSignInLoading(false);
        }
    };

    const handleLoginOtpVerify = async (e) => {
        e.preventDefault();
        if (!loginOtp || loginOtp.length < 4) {
            setLoginOtpError('Please enter a valid OTP.');
            return;
        }
        setLoginOtpLoading(true);
        setLoginOtpError(null);
        try {
            const API_URL = server_ip;
            const response = await fetch(`${API_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: loginOtpUserId, otp: loginOtp }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                const userData = {
                    token: data.token,
                    userId: data.userId,
                    _id: data.userId,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    profileImage: data.profileImage,
                    userType: data.userType,
                };
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', data.token);
                toast.success('Verified! Logging you in...');
                setTimeout(() => { navigate('/'); window.location.reload(); }, 800);
            } else {
                setLoginOtpError(data.message || 'OTP verification failed.');
            }
        } catch (err) {
            setLoginOtpError('Error verifying OTP. Please try again.');
        } finally {
            setLoginOtpLoading(false);
        }
    };

    // ----- Sign Up Handlers -----
    const handleSignUpChange = useCallback((e) => {
        const { name, value } = e.target;
        setSignUpData(prev => ({ ...prev, [name]: value }));
        setSignUpError(null);
    }, []);

    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        setSignUpError(null);
        setSignUpLoading(true);

        if (!signUpData.name || !signUpData.email || !signUpData.phone || !signUpData.password) {
            setSignUpError('Please fill in all required fields');
            setSignUpLoading(false);
            return;
        }
        if (signUpData.password.length < 8) {
            setSignUpError('Password must be at least 8 characters long');
            setSignUpLoading(false);
            return;
        }
        if (signUpData.password !== signUpData.confirmPassword) {
            setSignUpError('Passwords do not match');
            setSignUpLoading(false);
            return;
        }

        try {
            // FORCE 8001 - Some environment variables are truncating the port to 800
            const API_URL = server_ip;
            console.log(`📡 [FORCED FIX] Sending request to: ${API_URL}/signup`);
            const formDataToSend = new FormData();
            formDataToSend.append('name', signUpData.name);
            formDataToSend.append('email', signUpData.email);
            formDataToSend.append('phone', signUpData.phone);
            formDataToSend.append('password', signUpData.password);
            formDataToSend.append('confirmPassword', signUpData.confirmPassword);
            formDataToSend.append('userType', 'User');

            let response;
            try {
                const formattedPhone = formatPhone(signUpData.phone);
                console.log('📱 Formatted Signup Phone:', formattedPhone);

                const payload = {
                    name: signUpData.name,
                    email: signUpData.email,
                    phone: formattedPhone,
                    password: signUpData.password,
                    confirmPassword: signUpData.confirmPassword,
                    userType: 'User'
                };

                console.log(`📡 [FETCH] Attempting POST to: ${API_URL}/signup`);
                response = await fetchWithRetry(`${API_URL}/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (fetchErr) {
                console.error('❌ Signup failed:', fetchErr.message);
                throw fetchErr;
            }

            console.log(`📥 [SIGNUP] Response status: ${response.status}`);

            const data = await response.json();

            if (response.ok && data.success) {
                if (data.requireOtp && data.userId) {
                    // Show OTP step
                    setOtpUserId(data.userId);
                    setOtpPhone(signUpData.phone);
                    setOtpStep(true);
                    toast.info('OTP sent to your WhatsApp/SMS!');
                } else if (!data.requireOtp && data.token) {
                    // Direct login (OTP not available — auto-verified)
                    const userData = {
                        token: data.token,
                        userId: data.userId,
                        _id: data.userId,
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        profileImage: data.profileImage,
                        userType: data.userType,
                    };
                    localStorage.setItem('user', JSON.stringify(userData));
                    localStorage.setItem('token', data.token);
                    toast.success('Account created! Welcome to AutoFinder!');
                    setTimeout(() => { navigate('/'); window.location.reload(); }, 800);
                } else {
                    toast.success('Account created successfully! Please login.');
                    handlePanelSwitch(false);
                    setSignUpData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
                }
            } else {
                setSignUpError(data.error ? `${data.message}: ${data.error}` : (data.message || 'Signup failed. Please try again.'));
            }
        } catch (err) {
            console.error('Signup error details:', err);
            setSignUpError(`Signup failed: ${err.message || 'Check your internet or server'}`);
        } finally {
            setSignUpLoading(false);
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 4) {
            setOtpError('Please enter a valid OTP.');
            return;
        }
        setOtpLoading(true);
        setOtpError(null);
        try {
            const API_URL = server_ip;
            const response = await fetch(`${API_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: otpUserId, otp }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                const userData = {
                    token: data.token,
                    userId: data.userId,
                    _id: data.userId,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    profileImage: data.profileImage,
                    userType: data.userType,
                };
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', data.token);
                toast.success('Account verified! Welcome to AutoFinder!');
                setTimeout(() => { navigate('/'); window.location.reload(); }, 800);
            } else {
                setOtpError(data.message || 'OTP verification failed.');
            }
        } catch (err) {
            setOtpError('Error verifying OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    // ----- Mobile Toggle -----
    const MobileToggle = () => (
        <div className="md:hidden text-center mt-4 pb-4">
            {isSignUp ? (
                <p className="text-gray-600">
                    Already have an account?{' '}
                    <button onClick={() => handlePanelSwitch(false)} className="text-red-600 font-bold hover:underline">Sign In</button>
                </p>
            ) : (
                <p className="text-gray-600">
                    Don't have an account?{' '}
                    <button onClick={() => handlePanelSwitch(true)} className="text-red-600 font-bold hover:underline">Sign Up</button>
                </p>
            )}
        </div>
    );

    return (
        <>
            <Helmet>
                <title>{isSignUp ? 'Sign Up' : 'Sign In'} - Autofinder</title>
            </Helmet>
            <Header />

            <div className="auth-container-wrapper relative overflow-hidden bg-gray-100 dark:bg-gray-900 py-4 min-h-screen flex items-center justify-center">
                {/* Background Image */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <img
                        src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&h=1080&fit=crop"
                        alt="Car Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70"></div>
                </div>

                <div className={`auth-container container z-10 ${isSignUp ? 'right-panel-active' : ''}`} id="container">

                    {/* ===== Sign Up Container ===== */}
                    <div className="form-container sign-up-container">
                        <form onSubmit={otpStep ? handleOtpVerify : handleSignUpSubmit} className="dark:bg-gray-800">
                            {otpStep ? (
                                <div className="flex flex-col items-center justify-center w-full px-2">
                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-md w-full border border-gray-100 dark:border-gray-600 animate-in fade-in zoom-in duration-300">
                                        <div className="text-center mb-3">
                                            <div className="inline-flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 20c4.478 0 8.268-2.943 9.543-7a9.97 9.97 0 00.457-3.042M10.477 20.211a10.002 10.002 0 01-8.22-6.203" />
                                                </svg>
                                            </div>
                                            <h1 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Verify Account</h1>
                                            <p className="text-gray-500 dark:text-gray-400 text-[10px] leading-tight">
                                                Sent to <span className="font-bold text-red-600">{otpPhone}</span>
                                            </p>
                                        </div>

                                        {otpError && (
                                            <div className="bg-red-50 dark:bg-red-900/20 border-l-2 border-red-500 p-1 mb-3 rounded text-center">
                                                <p className="text-red-700 dark:text-red-400 text-[9px] font-semibold">{otpError}</p>
                                            </div>
                                        )}

                                        <div className="flex justify-between mb-4 gap-1">
                                            {Array(6).fill(0).map((_, i) => (
                                                <input
                                                    key={i}
                                                    type="text"
                                                    maxLength={1}
                                                    value={otp[i] || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                                        if (val) {
                                                            const newOtp = otp.split('');
                                                            newOtp[i] = val;
                                                            setOtp(newOtp.join(''));
                                                            if (i < 5) e.target.nextSibling?.focus();
                                                        } else {
                                                            const newOtp = otp.split('');
                                                            newOtp[i] = '';
                                                            setOtp(newOtp.join(''));
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Backspace' && !otp[i] && i > 0) e.target.previousSibling?.focus();
                                                    }}
                                                    className="w-7 h-9 text-center text-sm font-bold border border-gray-200 dark:border-gray-600 rounded focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:bg-gray-800 dark:text-white outline-none"
                                                />
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleOtpVerify}
                                            disabled={otpLoading || otp.length < 6}
                                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-1.5 rounded-lg text-xs shadow transition-transform active:scale-95 flex items-center justify-center gap-1"
                                        >
                                            {otpLoading && (
                                                <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {otpLoading ? '...' : 'Complete Signup'}
                                        </button>

                                        <div className="mt-4 text-center">
                                            <p className="text-gray-400 text-[9px] mb-1">Didn't receive the code?</p>
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => { toast.info("Resending OTP..."); handleSignUpSubmit({ preventDefault: () => { } }); }}
                                                    className="text-red-600 font-bold text-[10px] hover:underline"
                                                >
                                                    Resend via WhatsApp
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setOtpStep(false); setOtp(''); setOtpError(null); }}
                                                    className="text-gray-400 hover:text-gray-500 text-[9px] underline"
                                                >
                                                    Back
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="font-bold text-xl mb-0 text-gray-800 dark:text-white">Create Account</h1>
                                    <div className="social-container text-gray-500 dark:text-gray-300 mb-0 scale-75 origin-center -mt-1">
                                        <span>Use your email for registration</span>
                                    </div>

                                    {signUpError ? (
                                        <div className="flex items-center justify-center min-h-[18px] mb-0.5">
                                            <p className="text-red-500 text-[10px] leading-none text-center px-1">{signUpError}</p>
                                        </div>
                                    ) : (
                                        <div className="min-h-[18px] mb-0.5"></div>
                                    )}

                                    <div className="relative w-full my-0.5">
                                        <input
                                            type="text" name="name" value={signUpData.name} onChange={handleSignUpChange}
                                            className="bg-gray-100 dark:bg-gray-700 border-none px-3 py-1.5 w-full rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                            required placeholder="Name"
                                        />
                                    </div>
                                    <div className="relative w-full my-0.5">
                                        <input
                                            type="email" name="email" value={signUpData.email} onChange={handleSignUpChange}
                                            className="bg-gray-100 dark:bg-gray-700 border-none px-3 py-1.5 w-full rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                            required placeholder="Email"
                                        />
                                    </div>
                                    <div className="relative w-full my-0.5">
                                        <input
                                            type="tel" name="phone" value={signUpData.phone} onChange={handleSignUpChange}
                                            className="bg-gray-100 dark:bg-gray-700 border-none px-3 py-1.5 w-full rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                            required placeholder="Phone (03xxxxxxxxx)"
                                        />
                                    </div>
                                    <div className="relative w-full my-0.5">
                                        <input
                                            type="password" name="password" value={signUpData.password} onChange={handleSignUpChange}
                                            className="bg-gray-100 dark:bg-gray-700 border-none px-3 py-1.5 w-full rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                            required placeholder="Password"
                                        />
                                    </div>
                                    <div className="relative w-full my-0.5">
                                        <input
                                            type="password" name="confirmPassword" value={signUpData.confirmPassword} onChange={handleSignUpChange}
                                            className="bg-gray-100 dark:bg-gray-700 border-none px-3 py-1.5 w-full rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                            required placeholder="Confirm Password"
                                        />
                                    </div>

                                    <button type="submit" disabled={signUpLoading} className="mt-1 text-xs py-1.5 px-6">
                                        {signUpLoading ? 'Creating...' : 'Sign Up'}
                                    </button>
                                    <MobileToggle />
                                </>
                            )}
                        </form>
                    </div>

                    {/* ===== Sign In Container ===== */}
                    <div className="form-container sign-in-container">
                        <form onSubmit={loginOtpStep ? handleLoginOtpVerify : handleSignInSubmit} className="dark:bg-gray-800">
                            {loginOtpStep ? (
                                <div className="flex flex-col items-center justify-center w-full px-2">
                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-md w-full border border-gray-100 dark:border-gray-600 animate-in fade-in zoom-in duration-300">
                                        <div className="text-center mb-3">
                                            <div className="inline-flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 20c4.478 0 8.268-2.943 9.543-7a9.97 9.97 0 00.457-3.042M10.477 20.211a10.002 10.002 0 01-8.22-6.203" />
                                                </svg>
                                            </div>
                                            <h1 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Verify Login</h1>
                                            <p className="text-gray-500 dark:text-gray-400 text-[10px] leading-tight">
                                                Sent to <span className="font-bold text-red-600">{loginOtpPhone}</span>
                                            </p>
                                        </div>

                                        {loginOtpError && (
                                            <div className="bg-red-50 dark:bg-red-900/20 border-l-2 border-red-500 p-1 mb-3 rounded text-center text-[9px] text-red-700 dark:text-red-400 font-semibold">{loginOtpError}</div>
                                        )}

                                        <div className="flex justify-between mb-4 gap-1">
                                            {Array(6).fill(0).map((_, i) => (
                                                <input
                                                    key={i}
                                                    type="text"
                                                    maxLength={1}
                                                    value={loginOtp[i] || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                                        if (val) {
                                                            const newOtp = loginOtp.split('');
                                                            newOtp[i] = val;
                                                            setLoginOtp(newOtp.join(''));
                                                            if (i < 5) e.target.nextSibling?.focus();
                                                        } else {
                                                            const newOtp = loginOtp.split('');
                                                            newOtp[i] = '';
                                                            setLoginOtp(newOtp.join(''));
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Backspace' && !loginOtp[i] && i > 0) e.target.previousSibling?.focus();
                                                    }}
                                                    className="w-7 h-9 text-center text-sm font-bold border border-gray-200 dark:border-gray-600 rounded focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:bg-gray-800 dark:text-white outline-none"
                                                />
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleLoginOtpVerify}
                                            disabled={loginOtpLoading || loginOtp.length < 6}
                                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-1.5 rounded-lg text-xs shadow transition-transform active:scale-95"
                                        >
                                            {loginOtpLoading ? 'Verifying...' : 'Verify & Sign In'}
                                        </button>

                                        <div className="mt-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => { setLoginOtpStep(false); setLoginOtp(''); setLoginOtpError(null); }}
                                                className="text-gray-400 hover:text-gray-500 text-[9px] underline"
                                            >
                                                ← Back
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="font-bold text-xl mt-4 mb-0 text-gray-800 dark:text-white">Sign in</h1>
                                    <div className="social-container text-gray-500 dark:text-gray-300 mb-0 scale-75 origin-center">
                                        <span>or use your account</span>
                                    </div>

                                    {signInError ? (
                                        <div className="flex items-center justify-center min-h-[24px] mb-1">
                                            <p className="text-red-500 text-[11px] leading-tight text-center px-2">{signInError}</p>
                                        </div>
                                    ) : (
                                        <div className="min-h-[24px] mb-1"></div>
                                    )}

                                    <input
                                        type="text" name="emailOrPhone" placeholder="Email or Phone"
                                        value={signInData.emailOrPhone} onChange={handleSignInChange}
                                        className="bg-gray-100 dark:bg-gray-700 border-none px-3 py-1.5 my-0.5 w-full rounded text-sm" required
                                    />
                                    <div className="relative w-full">
                                        <input
                                            type={showSignInPassword ? 'text' : 'password'} name="password" placeholder="Password"
                                            value={signInData.password} onChange={handleSignInChange}
                                            className="bg-gray-100 dark:bg-gray-700 border-none px-3 py-1.5 my-0.5 w-full rounded text-sm" required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSignInPassword(p => !p)}
                                            style={{ background: 'none', border: 'none', padding: 0, position: 'absolute', right: '15px', top: '10px', width: 'auto' }}
                                            className="text-gray-400 hover:text-gray-600 text-xs"
                                        >
                                            {showSignInPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>

                                    <a href="/forgot-password" onClick={(e) => { e.preventDefault(); toast.info("Forgot Password feature coming soon!"); }}
                                        className="text-xs my-2 text-gray-600 dark:text-gray-400 hover:text-black">
                                        Forgot your password?
                                    </a>

                                    <button type="submit" disabled={signInLoading} className="mt-2 text-xs py-2 px-6">
                                        {signInLoading ? 'Signing In...' : 'Sign In'}
                                    </button>
                                    <MobileToggle />
                                </>
                            )}
                        </form>
                    </div>

                    {/* Overlay Container (Sliding Panel) */}
                    <div className="overlay-container">
                        <div className="overlay">
                            <div className="overlay-panel overlay-left">
                                <h1 className="font-bold text-3xl text-white mb-4">Welcome Back!</h1>
                                <p className="text-white mb-8">To keep connected with us please login with your personal info</p>
                                <button className="ghost" id="signIn" onClick={() => handlePanelSwitch(false)}>Sign In</button>
                            </div>
                            <div className="overlay-panel overlay-right">
                                <h1 className="font-bold text-3xl text-white mb-4">AUTOFINDERS</h1>
                                <p className="text-white mb-8">Enter your personal details and start your journey with us</p>
                                <button className="ghost" id="signUp" onClick={() => handlePanelSwitch(true)}>Sign Up</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}

export default Auth;
