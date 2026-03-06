import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { server_ip } from '../Utils/Data';
import { toast } from 'react-toastify';

function PaymentReceipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [packageData, setPackageData] = useState(location.state?.packageData || null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!packageData);

  // Payment account details
  const easypaisaNumber = '03348400943';
  const easypaisaName = 'Muhammad Asif Khan';
  const jazzcashNumber = '03348400943';
  const jazzcashName = 'Muhammad Asif Khan';

  useEffect(() => {
    if (!packageData) {
      fetchPackageData();
    }
  }, [id]);

  const fetchPackageData = async () => {
    try {
      setLoading(true);
      const API_URL = server_ip || 'http://localhost:8001';
      const endpoints = [
        `${API_URL}/mobile/dealer_packages/car`,
        `${API_URL}/mobile/dealer_packages/bike`,
        `${API_URL}/mobile/dealer_packages/booster`,
      ];

      let foundPackage = null;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            const packages = data.success && Array.isArray(data.packages) ? data.packages : Array.isArray(data) ? data : [];
            const pkg = packages.find(p => (p.id || p._id) === id);
            if (pkg) {
              foundPackage = pkg;
              break;
            }
          }
        } catch (err) {
          console.error(`Error fetching from ${endpoint}:`, err);
        }
      }

      if (foundPackage) {
        setPackageData(foundPackage);
      } else {
        toast.error('Package not found');
        navigate('/dealer-packages');
      }
    } catch (err) {
      console.error('Error fetching package:', err);
      toast.error('Failed to load package');
      navigate('/dealer-packages');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setPaymentReceipt(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (!paymentReceipt) {
      toast.error('Please upload payment receipt');
      return;
    }

    try {
      setSubmitting(true);
      const API_URL = server_ip || 'http://localhost:8001';

      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.userId || userData._id;

      if (!userId) {
        toast.error('Please login to purchase package');
        navigate('/signin');
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append('receipt', paymentReceipt);
      formData.append('packageId', packageData.id || packageData._id);
      formData.append('packageName', packageData.name || packageData.bundleName);
      formData.append('amount', (packageData.discountedPrice || packageData.discountedRate || packageData.price || 0).toString());
      formData.append('packageType', packageData.type || 'car');
      formData.append('userId', userId);
      formData.append('customerName', userData.name || 'Unknown User');
      formData.append('customerEmail', userData.email || 'No email');
      formData.append('customerPhone', userData.phone || 'No phone');
      formData.append('paymentMethod', paymentMethod || 'easypaisa');
      formData.append('requestDate', new Date().toISOString());
      formData.append('liveAdDays', (packageData.validityDays || packageData.noOfDays || packageData.liveAdDays || 0).toString());
      formData.append('validityDays', (packageData.validityDays || packageData.noOfDays || packageData.liveAdDays || 0).toString());
      formData.append('freeBoosters', (packageData.freeBoosters || packageData.noOfBoosts || packageData.featuredListings || 0).toString());
      formData.append('totalAds', (packageData.totalAds || 0).toString());

      const response = await fetch(`${API_URL}/payment/submit-receipt`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Payment receipt submitted successfully! We will verify it and activate your package within 24 hours.');
        navigate('/my-ads');
      } else {
        // Try JSON endpoint as fallback
        const jsonData = {
          packageId: packageData.id || packageData._id,
          packageName: packageData.name || packageData.bundleName,
          amount: packageData.discountedPrice || packageData.discountedRate || packageData.price || 0,
          packageType: packageData.type || 'car',
          userId: userId,
          customerName: userData.name || 'Unknown User',
          customerEmail: userData.email || 'No email',
          customerPhone: userData.phone || 'No phone',
          paymentMethod: paymentMethod,
          requestDate: new Date().toISOString(),
          liveAdDays: packageData.validityDays || packageData.noOfDays || packageData.liveAdDays || 0,
          validityDays: packageData.validityDays || packageData.noOfDays || packageData.liveAdDays || 0,
          freeBoosters: packageData.freeBoosters || packageData.noOfBoosts || packageData.featuredListings || 0,
          totalAds: packageData.totalAds || 0,
          receiptImage: preview,
        };

        const jsonResponse = await fetch(`${API_URL}/payment/submit-receipt-json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonData),
        });

        const jsonResult = await jsonResponse.json();

        if (jsonResponse.ok && jsonResult.success) {
          toast.success('Payment receipt submitted successfully! We will verify it and activate your package within 24 hours.');
          navigate('/my-ads');
        } else {
          throw new Error(jsonResult.message || 'Failed to submit payment receipt');
        }
      }
    } catch (error) {
      console.error('Error submitting payment receipt:', error);
      toast.error(error.message || 'Failed to submit payment receipt. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading - Auto Finder</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (!packageData) {
    return (
      <>
        <Helmet>
          <title>Package Not Found - Auto Finder</title>
        </Helmet>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">Package not found</p>
            <button
              onClick={() => navigate('/dealer-packages')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  const packagePrice = packageData.discountedPrice || packageData.discountedRate || packageData.price || 0;

  return (
    <>
      <Helmet>
        <title>Payment Receipt - Auto Finder</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8 transition-colors">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Package Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              {packageData.name || packageData.bundleName}
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
              <span className="text-2xl font-bold text-red-600 dark:text-red-500">
                PKR {packagePrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Choose Payment Method</h3>
            <div className="space-y-3">
              {/* EasyPaisa */}
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'easypaisa' 
                  ? 'border-red-600 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="easypaisa"
                  checked={paymentMethod === 'easypaisa'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-red-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-700 p-2 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                      <img 
                        src="/assets/easypaisa.png" 
                        alt="EasyPaisa" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center hidden">
                        <span className="text-green-600 dark:text-green-400 font-bold text-xs">EP</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 block">EasyPaisa</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {easypaisaNumber} - {easypaisaName}
                      </p>
                    </div>
                  </div>
                </div>
              </label>

              {/* JazzCash */}
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'jazzcash' 
                  ? 'border-red-600 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="jazzcash"
                  checked={paymentMethod === 'jazzcash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-red-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-white dark:bg-gray-700 p-2 flex items-center justify-center border border-gray-200 dark:border-gray-600 relative">
                      <img 
                        src="/assets/jazzcash.png" 
                        alt="JazzCash" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement.querySelector('.jazzcash-fallback');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="jazzcash-fallback w-full h-full rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center hidden">
                        <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">JC</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 block mb-1">JazzCash</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {jazzcashNumber} - {jazzcashName}
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Receipt Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Upload Payment Receipt</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="receipt-upload"
                />
                <label
                  htmlFor="receipt-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-400">
                    {paymentReceipt ? paymentReceipt.name : 'Click to upload payment receipt'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-500">PNG, JPG up to 5MB</span>
                </label>
              </div>

              {preview && (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    onClick={() => {
                      setPaymentReceipt(null);
                      setPreview(null);
                    }}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Payment Instructions</h4>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Make payment to the selected payment method account</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Take a clear photo of your payment receipt</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Upload the receipt and submit for verification</span>
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !paymentReceipt || !paymentMethod}
            className="w-full bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Submit Payment Receipt</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Your payment will be verified within 24 hours. You will be notified once your package is activated.
          </p>
        </div>
      </div>
    </>
  );
}

export default PaymentReceipt;

