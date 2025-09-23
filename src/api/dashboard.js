import { apiFetch } from "./client";

// Cambia estos paths si en tu DRF están con otro nombre:
const paths = {
  usuarios: "/usuarios/",
  residencias: "/residencias/",
  reservas: "/reservas/",
  cuotas: "/cuotas/",
  pagos: "/pagos/",
  incidentes: "/eventos/",          // si no existe, devuelve []
  mantenimientos: "/mantenimientos/"
};

async function get(path) {
  const r = await apiFetch(path, { method: "GET" });
  if (!r.ok) throw new Error(`GET ${path} -> ${r.status}`);
  return r.json();
}

async function safeGet(path) {
  try { return await get(path); }
  catch (e) {
    console.warn(`[dashboard] GET ${path} falló:`, e?.message || e);
    return [];
  }
}

export async function loadDashboardData() {
  const [
    usuarios, residencias, reservas, cuotas, pagos, incidentes, mantenimientos
  ] = await Promise.all([
    safeGet(paths.usuarios),
    safeGet(paths.residencias),
    safeGet(paths.reservas),
    safeGet(paths.cuotas),
    safeGet(paths.pagos),
    safeGet(paths.incidentes),
    safeGet(paths.mantenimientos)
  ]);

  const today = new Date();
  const isSameDay = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d.getFullYear()===today.getFullYear() &&
           d.getMonth()===today.getMonth() &&
           d.getDate()===today.getDate();
  };
  const isSameMonth = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d.getFullYear()===today.getFullYear() &&
           d.getMonth()===today.getMonth();
  };

  const totalUnits = (residencias ?? []).length;
  const occupiedUnits = (residencias ?? []).filter(
    r => (r.estado?.toLowerCase?.() === "ocupado") || r.ocupado === true
  ).length;
  const vacantUnits = totalUnits - occupiedUnits;

  const totalResidents = (usuarios ?? []).length;

  const monthlyRevenue = (pagos ?? [])
    .filter(p => isSameMonth(p.fecha_pago || p.fecha || p.created_at))
    .reduce((acc, p) => acc + Number(p.monto || 0), 0);

  const outstandingPayments = (cuotas ?? [])
    .filter(c => !c.pagado && Number(c.monto || 0) > 0)
    .reduce((acc, c) => acc + Number(c.monto || 0), 0);

  const maintenanceRequests = (mantenimientos ?? []).length;
  const securityIncidents = (incidentes ?? []).length;

  // Recientes (placeholders por ahora)
  const accessLog = [];
  const cameras = [];

  return {
    kpis: {
      totalUnits, occupiedUnits, vacantUnits, totalResidents,
      monthlyRevenue, outstandingPayments, maintenanceRequests, securityIncidents,
      energyEfficiency: 87, waterUsage: 12540, // placeholders
      commonAreaBookings: (reservas ?? []).filter(r => isSameDay(r.fecha_inicio || r.inicio)).length,
      visitorsPending: 0,
    },
    lists: {
      accessLog,
      incidents: incidentes ?? [],
      residents: (usuarios ?? []).map(u => ({
        id: u.id,
        unit: u.unidad || u.departamento || "-",
        owner: u.nombre || u.nombre_completo || u.username,
        phone: u.telefono || "-",
        email: u.email || "-",
        status: "current",
        paymentStatus: "paid",
        balance: 0,
        lastPayment: (pagos ?? []).find(p => p.usuario?.id === u.id)?.fecha_pago || null,
        occupants: 1
      })),
      maintenance: mantenimientos ?? []
    }
  };
}
