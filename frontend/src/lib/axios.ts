import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081', // เปลี่ยนเป็น baseURL ของ backend จริงถ้ามี
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api; 