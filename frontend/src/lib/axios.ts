import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081', // เปลี่ยนเป็น baseURL ของ backend จริงถ้ามี
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    // If login response contains token and user data
    if (response.config.url === '/auth/login' && response.data.token) {
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response;
  },
  (error) => {
    // Only handle 401 if it's not an intentional logout
    if (error.response?.status === 401 && error.config.url !== '/auth/logout') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 