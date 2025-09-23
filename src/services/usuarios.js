
import api from "./api";

// Crear usuario
export async function crearUsuario(payload) {
  const { data } = await api.post("/usuarios/", payload); // Ajusta campos según tu serializer
  return data;
}

// Listar
export async function listarUsuarios(params = {}) {
  const { data } = await api.get("/usuarios/", { params });
  return data;
}

// Obtener por id
export async function obtenerUsuario(id) {
  const { data } = await api.get(`/usuarios/${id}/`);
  return data;
}

// Actualizar
export async function actualizarUsuario(id, payload) {
  const { data } = await api.put(`/usuarios/${id}/`, payload);
  return data;
}

// Eliminar
export async function eliminarUsuario(id) {
  await api.delete(`/usuarios/${id}/`);
  return true;
}