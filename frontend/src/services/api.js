import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust in production
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'An error occurred';
      
      if (status === 401) {
        // Handle unauthorized (e.g., clear token, redirect to login)
        console.error('Unauthorized:', message);
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        console.error('Forbidden:', message);
        // Maybe show a toast notification here
      }
    }
    return Promise.reject(error);
  }
);

export default api;
