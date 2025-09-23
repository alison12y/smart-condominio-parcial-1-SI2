import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://backend-parcialsi2.onrender.com/api",
});

// 🔹 Normaliza credenciales antes de enviarlas
export async function login(credentials) {
  const payload = {
    username: credentials.username || credentials.usuario,
    password: credentials.password || credentials.contrasena,
  };

  return api.post("/login/", payload);
}
