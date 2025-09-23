import api from "./api";

// Acepta username/password o usuario/contrasena
export async function login({ usuario, contrasena, username, password }) {
  const body = {
    username: username ?? usuario,
    password: password ?? contrasena,
  };
  const { data } = await api.post("/login/", body);
  // guarda tokens para siguientes requests
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  return data;
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}
