// ===== Datos base =====
export const USERS = [
  "Administrador - Juan Pérez",
  "Residente - Apt 301 María García",
  "Residente - Apt 205 Carlos López",
  "Personal Seguridad - Roberto Silva",
  "Personal Mantenimiento - Ana Ruiz",
];

export const ACTIONS = ["CREAR", "CONSULTAR", "MODIFICAR", "ELIMINAR", "INICIAR_SESION", "CERRAR_SESION", "PAGAR", "RESERVAR"];

export const RESOURCES = [
  "Usuarios residentes",
  "Cuotas de mantenimiento",
  "Reservas área común",
  "Reportes mantenimiento",
  "Registro de visitantes",
  "Control de acceso",
  "Configuración sistema",
  "Reportes financieros",
];

export const USER_TYPES = ["Administrador", "Residente", "Personal Seguridad", "Personal Mantenimiento"];

export const SEVERITY_LEVELS = ["INFO", "ADVERTENCIA", "ERROR", "CRÍTICO"];
export const MODULES = ["AUTENTICACION", "BASE_DATOS", "API_MOVIL", "API_WEB", "SEGURIDAD", "RESPALDO", "REPORTES", "PAGOS"];

// ===== Utilidades generales =====
export function exportCSV(headers, rows, filename, addBom = false) {
  const headerLine = headers.join(",");
  const bodyLines = rows.map((row) =>
    row
      .map((cell) => {
        const s = cell == null ? "" : String(cell);
        const needsQuotes = /[",\n]/.test(s);
        const safe = s.replace(/"/g, '""');
        return needsQuotes ? `"${safe}"` : safe;
      })
      .join(",")
  );
  const csv = [headerLine, ...bodyLines].join("\n");
  const content = (addBom ? "\ufeff" : "") + csv;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ===== Auditoría: generación y estilos =====
const detailByAction = (action, resource, user) => {
  const userType = user.split(" - ")[0];
  switch (action) {
    case "CREAR": return `${userType} creó nuevo registro en ${resource}`;
    case "CONSULTAR": return `${userType} consultó información de ${resource}`;
    case "MODIFICAR": return `${userType} modificó datos en ${resource}`;
    case "ELIMINAR": return `${userType} eliminó registro de ${resource}`;
    case "PAGAR": return `${userType} procesó pago de ${resource}`;
    case "RESERVAR": return `${userType} realizó reserva de ${resource}`;
    case "INICIAR_SESION": return `${userType} inició sesión en el sistema`;
    case "CERRAR_SESION": return `${userType} cerró sesión del sistema`;
    default: return `${userType} realizó ${action} en ${resource}`;
  }
};

export function generateAuditLog(USERS, ACTIONS, RESOURCES) {
  const user = USERS[Math.floor(Math.random() * USERS.length)];
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const resource = RESOURCES[Math.floor(Math.random() * RESOURCES.length)];
  return {
    id: Date.now() + Math.random(),
    timestamp: new Date(),
    user,
    action,
    resource,
    details: detailByAction(action, resource, user),
    ipAddress: `192.168.${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 255)}`,
    success: Math.random() > 0.15,
    sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`,
    platform: user.includes("Residente") ? "Móvil" : "Web",
  };
}

export function getActionColor(action) {
  switch (action) {
    case "CREAR": return "text-green-600 bg-green-50";
    case "CONSULTAR": return "text-blue-600 bg-blue-50";
    case "MODIFICAR": return "text-yellow-600 bg-yellow-50";
    case "ELIMINAR": return "text-red-600 bg-red-50";
    case "INICIAR_SESION": return "text-purple-600 bg-purple-50";
    case "CERRAR_SESION": return "text-gray-600 bg-gray-50";
    case "PAGAR": return "text-emerald-600 bg-emerald-50";
    case "RESERVAR": return "text-cyan-600 bg-cyan-50";
    default: return "text-gray-600 bg-gray-50";
  }
}

// ===== Logs técnicos: generación y estilos =====
export function generateTechnicalLog(SEVERITY_LEVELS, MODULES) {
  const level = SEVERITY_LEVELS[Math.floor(Math.random() * SEVERITY_LEVELS.length)];
  const module = MODULES[Math.floor(Math.random() * MODULES.length)];
  const activities = {
    AUTENTICACION: ["Autenticación JWT exitosa", "Token expirado renovado", "Intento de login fallido", "Sesión cerrada por timeout"],
    BASE_DATOS: ["Consulta de residentes ejecutada", "Backup de cuotas completado", "Conexión a BD perdida", "Optimización de índices finalizada"],
    API_MOVIL: ["Endpoint /cuotas consultado", "Push notification enviada", "Rate limit aplicado", "Sincronización completada"],
    API_WEB: ["Dashboard de admin cargado", "Reporte generado exitosamente", "Timeout en consulta", "Cache actualizado"],
    SEGURIDAD: ["Acceso bloqueado por IP", "Certificado SSL verificado", "Intento de acceso no autorizado", "Firewall regla aplicada"],
    RESPALDO: ["Backup automático iniciado", "Backup de imágenes fallido", "Restore de configuración", "Verificación de integridad OK"],
    REPORTES: ["Reporte financiero generado", "Export de residentes a Excel", "Dashboard actualizado", "Métricas de ocupación calculadas"],
    PAGOS: ["Pago procesado exitosamente", "Gateway de pago no responde", "Comisión calculada", "Notificación de pago enviada"],
  };
  const message = activities[module][Math.floor(Math.random() * activities[module].length)];
  return {
    id: Date.now() + Math.random(),
    timestamp: new Date(),
    level,
    module,
    message,
    details: `${module}: ${message} - ${new Date().toISOString()}`,
    server: `server-${Math.floor(Math.random() * 3) + 1}`,
    responseTime: Math.floor(Math.random() * 1000) + "ms",
  };
}

export function getSeverityColor(level) {
  switch (level) {
    case "INFO": return "text-blue-400";
    case "ADVERTENCIA": return "text-yellow-400";
    case "ERROR": return "text-red-400";
    case "CRÍTICO": return "text-purple-400";
    default: return "text-gray-400";
  }
}

import React from "react";
import { CheckCircle, AlertTriangle, XCircle, Shield, Activity } from "lucide-react";

export function getSeverityIcon(level) {
  switch (level) {
    case "INFO": return <CheckCircle className="h-4 w-4" />;
    case "ADVERTENCIA": return <AlertTriangle className="h-4 w-4" />;
    case "ERROR": return <XCircle className="h-4 w-4" />;
    case "CRÍTICO": return <Shield className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
}