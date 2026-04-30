import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-ulf8.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token && token !== 'null' && token !== 'undefined') {
    // Standard way to set headers in newer Axios versions
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
