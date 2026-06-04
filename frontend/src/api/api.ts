import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@iires:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Controla se já há um refresh em andamento para evitar loop
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  failedQueue = [];
}

function clearSession() {
  localStorage.removeItem('@iires:token');
  localStorage.removeItem('@iires:user');
  localStorage.removeItem('@iires:refreshToken');
  window.location.href = '/login';
}

// Rotas de autenticação própria — nunca disparam refresh ou redirect
const AUTH_ROUTES = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/auth/refresh'];
const isAuthRoute = (url?: string) => AUTH_ROUTES.some((r) => url?.includes(r));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !isAuthRoute(originalRequest?.url) && !originalRequest?._retry) {
      const refreshToken = localStorage.getItem('@iires:refreshToken');

      if (!refreshToken) {
        clearSession();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken },
        );

        const newToken: string = data.token;
        const newRefreshToken: string = data.refreshToken;

        localStorage.setItem('@iires:token', newToken);
        localStorage.setItem('@iires:refreshToken', newRefreshToken);
        if (data.user) localStorage.setItem('@iires:user', JSON.stringify(data.user));

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
