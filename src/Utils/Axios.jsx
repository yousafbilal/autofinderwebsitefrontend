import axios from 'axios';

// Create a new instance of Axios
const api = axios.create({
  baseURL: 'http://127.0.0.1:8001', // FORCE 8001 - Standardize for connectivity
  timeout: 5000, // Set the request timeout if needed
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request automatically
api.interceptors.request.use((config) => {
  let token = localStorage.getItem('token');
  if (!token) {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        token = user?.token;
      }
    } catch (e) {
      console.warn('⚠️ Axios: Failed to parse user object:', e.message);
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
