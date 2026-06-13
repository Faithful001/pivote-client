import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthenticated responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response?.status === 401 || error.response?.status === 403)) {
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/login")) {
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
