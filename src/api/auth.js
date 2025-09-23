// src/api/auth.js
import { API_URL } from "./client";

export async function loginApi(username, password) {
  const res = await fetch(`${API_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Credenciales inválidas");
  }
  return res.json(); // { access, refresh }
}