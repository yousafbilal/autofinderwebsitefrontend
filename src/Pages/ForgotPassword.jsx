import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import Header from './include/Header';
import Footer from './include/Footer';
import { server_ip } from '../Utils/Data';

function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email/Phone, 2: OTP & New Password
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [userId, setUserId] = useState(null);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!emailOrPhone) {
            toast.error("Please enter your email or phone number");
            return;
        }

        setLoading(true);
        try {
            const API_URL = server_ip || 'http://localhost:8001';
            const response = await fetch(`${API_URL}/api/send-otp-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailOrPhone }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                setUserId(data.userId); // Store userId for next step
                setStep(2);
            } else {
                toast.error(data.message || "Failed to send OTP");
            }
        } catch (error) {
            console.error("Forgot Password Error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otp || !newPassword) {
            toast.error("Please fill in all fields");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            const API_URL = server_ip || 'http://localhost:8001';
            const response = await fetch(`${API_URL}/api/reset-password-with-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, otp, newPassword }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                setTimeout(() => navigate('/signin'), 2000);
            } else {
                toast.error(data.message || "Failed to reset password");
            }
        } catch (error) {
            console.error("Reset Password Error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Forgot Password - Autofinder</title>
            </Helmet>
            <Header />

            <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                            {step === 1 ? 'Reset your password' : 'Enter OTP & New Password'}
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            {step === 1
                                ? 'Enter your email or phone number and we will send you an OTP.'
                                : 'Check your WhatsApp for the OTP.'}
                        </p>
                    </div>

                    {step === 1 ? (
                        <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
                            <div className="rounded-md shadow-sm -space-y-px">
                                <div>
                                    <label htmlFor="email-address" className="sr-only">Email or Phone</label>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="text"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                                        placeholder="Email or Phone Number"
                                        value={emailOrPhone}
                                        onChange={(e) => setEmailOrPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                            <div className="rounded-md shadow-sm -space-y-px">
                                <div className="mb-4">
                                    <label htmlFor="otp" className="sr-only">OTP</label>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        required
                                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm dark:bg-gray-700 text-center tracking-widest text-xl"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="new-password" className="sr-only">New Password</label>
                                    <input
                                        id="new-password"
                                        name="password"
                                        type="password"
                                        required
                                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                                        placeholder="New Password (min 8 chars)"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full text-center mt-3 text-sm text-gray-600 dark:text-gray-400 hover:text-red-500"
                                >
                                    Back
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="text-center mt-4">
                        <Link to="/signin" className="font-medium text-red-600 hover:text-red-500">
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ForgotPassword;
