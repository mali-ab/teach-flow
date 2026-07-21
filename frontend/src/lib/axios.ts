import axios from "axios";
import type { AxiosInstance } from "axios";

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || "/api";
const normalizedBaseURL = rawBaseURL.endsWith("/api")
  ? rawBaseURL
  : `${rawBaseURL.replace(/\/$/, "")}/api`;

const api: AxiosInstance = axios.create({
  baseURL: normalizedBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Inject Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch Global Errors (401, 404, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        // Token expired or invalid -> Clear local auth cache
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login"; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;