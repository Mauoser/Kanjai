import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for CORS
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Log all responses for debugging
api.interceptors.response.use(
  (response) => {
    if (response.config.url.includes("recommendations")) {
      console.log("API Response for recommendations:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      });
    }
    return response;
  },
  (error) => {
    if (error.config?.url?.includes("recommendations")) {
      console.log("API Error for recommendations:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    if (error.response?.status === 401) {
      // Don't auto-logout for DELETE /auth/account (wrong password)
      // Only logout for actual token/session issues
      const isDeleteAccountError =
        error.config?.url?.includes("/auth/account") &&
        error.config?.method === "delete";

      if (!isDeleteAccountError && window.location.pathname !== "/login") {
        localStorage.removeItem("token");
        localStorage.removeItem("kanjai-storage");
        // Use replace to prevent adding to history
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post("/api/auth/register", data),
  login: (data) => api.post("/api/auth/login", data),
  getMe: () => api.get("/api/auth/me"),
  logout: () => api.post("/api/auth/logout"),
  deleteAccount: (password) =>
    api.delete("/api/auth/account", { data: { password } }),
};

// Kanji endpoints
export const kanjiAPI = {
  getKanji: (params) => api.get("/kanji", { params }),
  getKanjiById: (id) => api.get(`/kanji/${id}`),
  getRadicals: (params) => api.get("/radicals", { params }),
  getVocabulary: (params) => api.get("/vocabulary", { params }),
};

// Progress endpoints
export const progressAPI = {
  getLessons: (params) => api.get("/progress/lessons", { params }),
  getReviews: () => api.get("/progress/reviews"),
  submitAnswer: (data) => api.post("/progress/submit", data),
  getStats: () => api.get("/progress/stats"),
};

export default api;
