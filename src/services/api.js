import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://backend-parcialsi2.onrender.com/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// Adjunta el access token en cada request si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
