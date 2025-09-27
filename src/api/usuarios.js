import { apiFetch } from "./client";

// === Helpers de mapeo entre backend y frontend ===
function fromApi(u) {
  return {
    id: u.id,
    nombre: u.nombre || u.nombre_completo || "",  // alias
    ci: u.ci || "",
    email: u.email || "",
    telefono: u.telefono || "",
    direccion: u.direccion || "",
    unidad: u.unidad || "", // si tienes campo unidad/departamento
    // backend devuelve rol anidado y rol_nombre
    rol: u.rol?.id || null,        // ID del rol (para selects)
    rol_nombre: u.rol_nombre || "", // nombre del rol (para mostrar)
    activo: u.activo ?? true,
  };
}

function toApi(u) {
  return {
    ci: u.ci,
    nombre: u.nombre,             // alias de nombre_completo
    nombre_completo: u.nombre,    // el backend usa este campo
    email: u.email,
    telefono: u.telefono,
    direccion: u.direccion,
    unidad: u.unidad,
    rol_id: u.rol,                // 👈 aquí va el ID del rol
    activo: u.activo,
  };
}

// === Funciones CRUD ===

export async function listarUsuarios() {
  const res = await apiFetch("/usuarios/", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("No se pudo cargar usuarios");
  const data = await res.json();
  return data.map(fromApi);
}

export async function crearUsuario(payload) {
  const res = await apiFetch("/usuarios/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApi(payload)),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "No se pudo actualizar usuario");
  }
  return fromApi(await res.json());
}

export async function activarUsuario(id, activo) {
  const res = await apiFetch(`/usuarios/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activo }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "No se pudo cambiar estado");
  }
  return fromApi(await res.json());
}
