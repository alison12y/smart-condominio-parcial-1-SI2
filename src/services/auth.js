
import api from "./api";

export async function login(username, password) {
  const { data } = await api.post("/login/", { username, password });
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  return data;
}
