/**
 * Global API Utility for robust backend connectivity
 */

/**
 * Enhanced fetch with standardized retry logic and loopback fallback
 * @param {string} url - The URL to fetch from
 * @param {Object} options - Standard fetch options
 * @param {number} maxRetries - Maximum number of retries (default: 2)
 * @returns {Promise<Response>}
 */
export const fetchWithRetry = async (url, options = {}, maxRetries = 1) => {
    let lastError;
    // Intelligently find the token (look for 'token' OR in 'user' object)
    let token = localStorage.getItem('token');
    if (!token) {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                token = user?.token;
            }
        } catch (e) {
            console.warn('⚠️ Failed to parse user object from localStorage:', e.message);
        }
    }

    // Standardize headers
    const headers = {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    // Only add application/json if not already set and NOT FormData
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const fetchOptions = {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'omit',
    };

    for (let i = 0; i <= maxRetries; i++) {
        try {
            if (i > 0) {
                console.warn(`🔄 Retry attempt ${i} for: ${currentUrl}`);

                // On retry, try swapping between 127.0.0.1 and localhost
                if (currentUrl.includes('127.0.0.1')) {
                    currentUrl = currentUrl.replace('127.0.0.1', 'localhost');
                } else if (currentUrl.includes('localhost')) {
                    currentUrl = currentUrl.replace('localhost', '127.0.0.1');
                }
            }

            const response = await fetch(currentUrl, fetchOptions);

            // If we get a response but it's not OK, we might still want to retry on certain codes
            // But usually 404/400 shouldn't be retried with a different URL
            if (!response.ok && i < maxRetries && response.status >= 500) {
                console.warn(`⚠️ Server error ${response.status}, considering retry...`);
                continue;
            }

            return response;
        } catch (err) {
            lastError = err;
            console.warn(`❌ Fetch failed for ${currentUrl}:`, err.message);

            if (i === maxRetries) break;

            // Wait a tiny bit before retry? (Optional)
            // await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    throw lastError || new Error(`Failed to fetch from ${url} after ${maxRetries} retries`);
};

/**
 * Standardizes an API URL to use 127.0.0.1 and port 8001
 * @param {string} url - The base or relative URL
 * @returns {string} - The standardized URL
 */
export const standardizeUrl = (url) => {
    if (!url) return 'http://127.0.0.1:8001';

    // If it's already a full URL that's NOT 8001/localhost/127.0.0.1, keep it (might be external)
    if (url.startsWith('http') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
        return url;
    }

    // Replace localhost with 127.0.0.1 and ensure 8001
    let standardized = url;
    if (standardized.includes('localhost')) {
        standardized = standardized.replace('localhost', '127.0.0.1');
    }

    // If no port specified or wrong port, and it's our local server, force 8001
    if (standardized.includes('127.0.0.1') && !standardized.includes(':8001')) {
        // This is a bit complex to regex perfectly, but for this app 8001 is the standard
        standardized = standardized.replace(/127\.0\.0\.1(:\d+)?/, '127.0.0.1:8001');
    }

    return standardized;
};
