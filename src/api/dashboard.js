import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

export const getStats = async () => {
  const headers = { Authorization: `Bearer ${localStorage.getItem("access")}` };
  try {
    const r = await axios.get(`${API_URL}/stats/`, { headers });
    return r.data;
  } catch (e) {
    // fallback para que veas algo mientras conectas
    return [
      { title: "Total Apartamentos", value: "120", change: "+2%" },
      { title: "Pagos al Día", value: "85%", change: "+5%" },
      { title: "Incidencias Abiertas", value: "8", change: "-12%" },
      { title: "Ingresos Mensuales", value: "Bs. 169,575", change: "+8%" },
    ];
  }
};
