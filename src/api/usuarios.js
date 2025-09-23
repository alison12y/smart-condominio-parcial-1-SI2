import { apiFetch } from "./client";

// Mapea entre la forma del backend y la UI
function fromApi(u) {
  return {
    id: u.id,
    nombre: u.nombre || u.nombre_completo || "",  // ajusta según tu serializer
    ci: u.ci || u.documento || "",
    unidad: u.unidad || u.departamento || "",
    // Si tu backend devuelve rol como string o como objeto:
    rol: u.rol?.value || u.rol?.codigo || u.rol || "resi",
    activo: u.activo ?? true,
  };
}

function toApi(u) {
  return {
    // Ajusta estos nombres a tu serializer real
    nombre: u.nombre,
    nombre_completo: u.nombre,   // por si tu backend usa nombre_completo
    ci: u.ci,
    unidad: u.unidad,
    rol: u.rol,                  // si es string; si es FK usa rol_id (ver nota abajo)
    activo: u.activo,
  };
}

export async function listarUsuarios() {
  const res = await apiFetch("/usuarios/", { method: "GET" });
  if (!res.ok) throw new Error("No se pudo cargar usuarios");
  const data = await res.json();
  return data.map(fromApi);
}

export async function crearUsuario(payload) {
  const res = await apiFetch("/usuarios/", {
    method: "POST",
    body: JSON.stringify(toApi(payload)),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "No se pudo crear usuario");
  }
  return fromApi(await res.json());
}

export async function actualizarUsuario(id, payload) {
  const res = await apiFetch(`/usuarios/${id}/`, {
    method: "PUT",
    body: JSON.stringify(toApi(payload)),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "No se pudo actualizar usuario");
  }
  return fromApi(await res.json());
}

export async function activarUsuario(id, activo) {
  // Si tu backend tiene un endpoint de activar/desactivar:
  // const res = await apiFetch(`/usuarios/${id}/activar/`, { method: "POST", body: JSON.stringify({ activo }) });
  // Alternativa genérica: PUT parcial (PATCH) cambiando solo "activo"
  const res = await apiFetch(`/usuarios/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ activo }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "No se pudo cambiar estado");
  }
  return fromApi(await res.json());
}