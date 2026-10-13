import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true, //🚀 CRITICAL: Forces browser to include cookies automatically
  headers: {
    'Content-Type': 'application/json'
  },
});

// 🔄 AUTOMATIC TOKEN INTERCEPTOR RESCUE MATRIX
// Inside your apiClient.js response interceptor:
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Post request automatically passes the hidden refresh token cookie
        await axios.post('/api/refresh', {}, { withCredentials: true });
        return apiClient(originalRequest); // Retry original endpoint request
      } catch (refreshError) {
        // 🚀 IF REFRESH FAILS: Broadcast an event to let AuthContext know the session died
        window.dispatchEvent(new Event('auth:session_expired'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;