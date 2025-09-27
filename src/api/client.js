export const API_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

export function getAccessToken() {
  return localStorage.getItem("access") || sessionStorage.getItem("access");
}

export async function apiFetch(
  path,
  { auth = false, headers = {}, ...options } = {} // 👈 por defecto sin auth
) {
  const finalHeaders = { "Content-Type": "application/json", ...headers };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers: finalHeaders,
    ...options,
  });

  // Si el token venció y tenemos refresh, intentamos renovarlo 1 vez
  if (res.status === 401 && auth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const token = getAccessToken();
      const retryHeaders = {
        ...finalHeaders,
        Authorization: `Bearer ${token}`,
      };
      return fetch(`${API_URL}${path}`, {
        headers: retryHeaders,
        ...options,
      });
    }
  }

  return res;
}

export async function tryRefreshToken() {
  const refresh =
    localStorage.getItem("refresh") || sessionStorage.getItem("refresh");
  if (!refresh) return false;

  const r = await fetch(`${API_URL}/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!r.ok) return false;
  const data = await r.json();
  if (data.access) {
    // Conserva dónde estaba guardado (local o session)
    if (localStorage.getItem("refresh")) {
      localStorage.setItem("access", data.access);
    } else {
      sessionStorage.setItem("access", data.access);
    }
    return true;
  }
  return false;
}
