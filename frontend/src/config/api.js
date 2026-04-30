const rawApiUrl = import.meta.env.VITE_API_URL || 'https://backend-ulf8.onrender.com/api';

export const API_URL = rawApiUrl.replace(/\/+$/, '');

export const apiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
};

export const authHeaders = (token) =>
  token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
