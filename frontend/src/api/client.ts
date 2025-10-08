import axios from 'axios';

const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.REACT_APP_BACKEND_URL) || 'http://localhost:4000',
});

// Attach access token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// On 401, try refreshing once
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (v?: any) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return api.request(originalRequest);
          })
          .catch(Promise.reject);
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = (data?.token || data?.accessToken || data?.data?.accessToken) as string | undefined;
        if (newToken) {
          localStorage.setItem('token', newToken);
        }
        processQueue(null, newToken || null);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api.request(originalRequest);
      } catch (e) {
        processQueue(e, null);
        localStorage.removeItem('token');
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
