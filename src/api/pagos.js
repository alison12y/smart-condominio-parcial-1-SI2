// Datos iniciales (mock)
export const initialRecordatorios = [
  { id: 1, nombre: "Aviso 7 días antes", diasAntes: 7, activo: true, tipo: "preventivo", fechaCreacion: "2024-01-15" },
  { id: 2, nombre: "Aviso día vencimiento", diasAntes: 0, activo: true, tipo: "vencimiento", fechaCreacion: "2024-01-15" },
];

export const initialResidentes = [
  { id: 1, nombre: "Juan Pérez",  email: "juan.perez@email.com",  telefono: "+1234567890",
    apartamento: "101A", cuotasPendientes: 2, montoTotal: 850000, ultimoPago: "2024-01-10", estado: "moroso" },
  { id: 2, nombre: "María González", email: "maria.gonzalez@email.com", telefono: "+1234567891",
    apartamento: "202B", cuotasPendientes: 1, montoTotal: 425000, ultimoPago: "2024-02-05", estado: "pendiente" },
  { id: 3, nombre: "Carlos Rodríguez", email: "carlos.rodriguez@email.com", telefono: "+1234567892",
    apartamento: "303C", cuotasPendientes: 0, montoTotal: 0, ultimoPago: "2024-02-15", estado: "al_dia" },
];

export const initialNotificaciones = [
  { id: 1, residenteId: 1, recordatorioId: 1, fechaEnvio: "2024-02-08", estado: "enviado", tipo: "email",
    mensaje: "Recordatorio: Su cuota vence en 7 días" },
  { id: 2, residenteId: 2, recordatorioId: 2, fechaEnvio: "2024-02-15", estado: "pendiente", tipo: "push",
    mensaje: "Su cuota vence hoy" },
];

// Helpers
export function estadoFromCuotas(cuotasPendientes) {
  if (cuotasPendientes > 1) return "moroso";
  if (cuotasPendientes === 1) return "pendiente";
  return "al_dia";
}

// Devuelve SOLO clases (no texto)
export function badgeClassByEstado(estado) {
  switch (estado) {
    case "al_dia":   return "badge-green";
    case "pendiente":return "badge-yellow";
    case "moroso":   return "badge-red";
    default:         return "badge-gray";
  }
}