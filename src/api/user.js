const API_BASE =
  (process.env.REACT_APP_API_BASE?.replace(/\/$/, "")) || "http://127.0.0.1:8000/api";

// --- Helpers de auth ---
function getCsrfToken() {
  const m = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return m ? m[1] : "";
}
function getJwt() {
  return localStorage.getItem("access_token") || "";
}

/**
 * useJWT=false -> usa cookies/CSRF (credentials: include)
 * useJWT=true  -> usa Authorization: Bearer (sin credentials)
 */
async function http(path, { method = "GET", body, headers = {}, useJWT = false } = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const token = useJWT ? getJwt() : null;
  const isWrite = !["GET", "HEAD", "OPTIONS"].includes(method);

  const opts = {
    method,
    credentials: useJWT ? "same-origin" : "include",
    headers: {
      Accept: "application/json",
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(isWrite && !useJWT ? { "X-CSRFToken": getCsrfToken() } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
  };

  const res = await fetch(url, opts);
  const text = await res.text().catch(() => "");

  if (!res.ok) {
    try {
      const json = text ? JSON.parse(text) : null;
      const msg =
        json?.detail ||
        json?.non_field_errors?.join(", ") ||
        Object.entries(json || {})
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ") ||
        text ||
        `HTTP ${res.status}`;
      throw new Error(msg);
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }

  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

// === APIs ===
// DRF suele usar trailing slash en detail (/usuarios/:id/)
export const UsersApi = {
  list: (params = {}, opts = {}) => {
    const qs = new URLSearchParams(params).toString();
    return http(`/usuarios/${qs ? "?" + qs : ""}`, { ...opts });
  },
  create: (data, opts = {}) => http(`/usuarios/`, { method: "POST", body: data, ...opts }),
  update: (id, data, opts = {}) => http(`/usuarios/${id}/`, { method: "PUT", body: data, ...opts }),
  remove: (id, opts = {}) => http(`/usuarios/${id}/`, { method: "DELETE", ...opts }),
};

export const RolesApi = {
  list: (opts = {}) => http(`/roles/`, { ...opts }),
};