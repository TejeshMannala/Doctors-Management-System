import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
const baseURL = rawApiUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL,
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
