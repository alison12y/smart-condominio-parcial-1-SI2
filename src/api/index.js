import axios from "axios";

const BASE_URL = (process.env.REACT_APP_API_URL || "http://127.0.0.1:8010/api").replace(/\/+$/, "");

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, // ponlo true si usas cookies/CSRF
});

// JWT opcional
const getAccess = () => localStorage.getItem("access") || sessionStorage.getItem("access");
api.interceptors.request.use((config) => {
  const token = getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===== Roles =====
// Ajusta los slashes finales según tu backend (DRF suele usar '/')
const ROLES = "/roles";

export async function Roles_list() {
  const { data } = await api.get(ROLES);
  const list = Array.isArray(data) ? data : data?.results || [];
  return list.map((r) => ({
    id: r.id ?? r.pk ?? r.uuid ?? r._id,
    name: r.name ?? r.nombre ?? "Sin nombre",
    permissions: r.permissions ?? r.permisos ?? [],
  }));
}

export async function Roles_create(payload) {
  const { data } = await api.post(ROLES + "/", payload);
  return {
    id: data.id ?? data.pk ?? data.uuid ?? data._id,
    name: data.name ?? data.nombre,
    permissions: data.permissions ?? data.permisos ?? [],
  };
}

export async function Roles_update(id, payload) {
  const { data } = await api.put(`${ROLES}/${id}/`, payload);
  return {
    id: data.id ?? id,
    name: data.name ?? data.nombre,
    permissions: data.permissions ?? data.permisos ?? payload.permissions ?? [],
  };
}

export async function Roles_remove(id) {
  await api.delete(`${ROLES}/${id}/`);
  return true;
}