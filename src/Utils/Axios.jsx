import axios from 'axios';

// const authToken = 'your_auth_token'; 

// Create a new instance of Axios
const api = axios.create({
  baseURL: 'http://127.0.0.1:8001', // FORCE 8001 - Standardize for connectivity
  timeout: 5000, // Set the request timeout if needed
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': `Bearer ${authToken}`,
  },
});

export default api;
