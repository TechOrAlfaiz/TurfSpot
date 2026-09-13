import axios from "axios";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:1234").replace(/\/+$/, "");

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    let token = null;
    try {
      const persistedUser = localStorage.getItem("persist:user");
      if (persistedUser) {
        const parsedUser = JSON.parse(persistedUser);
        if (parsedUser.auth) {
          const parsedAuth = JSON.parse(parsedUser.auth);
          token = parsedAuth.token;
        }
      }
    } catch (error) {
      console.error("Error parsing persisted user data:", error);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.customMessage = "Unable to connect to TurfSpot server. Please try again.";
    } else if (error.response?.data?.message) {
      const msg = error.response.data.message;
      error.customMessage = Array.isArray(msg)
        ? msg.map((m) => m.msg || m.message || JSON.stringify(m)).join(", ")
        : typeof msg === "object"
        ? JSON.stringify(msg)
        : msg;
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

