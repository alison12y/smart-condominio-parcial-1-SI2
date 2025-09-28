import React, { useEffect, useState } from "react";
import {
  Eye, Database, Download, CheckCircle, XCircle, Home,
} from "lucide-react";
import "../styles/bitacora.css";

const USERS = [
  "Administrador - Juan Pérez",
  "Residente - Apt 301 María García",
  "Residente - Apt 205 Carlos López",
  "Personal Seguridad - Roberto Silva",
  "Personal Mantenimiento - Ana Ruiz",
];
const ACTIONS = ["CREAR","CONSULTAR","MODIFICAR","ELIMINAR","INICIAR_SESION","CERRAR_SESION","PAGAR","RESERVAR"];
const RESOURCES = [
  "Usuarios residentes","Cuotas de mantenimiento","Reservas área común","Reportes mantenimiento",
  "Registro de visitantes","Control de acceso","Configuración sistema","Reportes financieros",
];
const USER_TYPES = ["Administrador","Residente","Personal Seguridad","Personal Mantenimiento"];

const SEVERITY_LEVELS = ["INFO","ADVERTENCIA","ERROR","CRÍTICO"];
const MODULES = ["AUTENTICACION","BASE_DATOS","API_MOVIL","API_WEB","SEGURIDAD","RESPALDO","REPORTES","PAGOS"];

function exportCSV(headers, rows, filename, addBom = false) {
  const headerLine = headers.join(",");
  const bodyLines = rows.map((row) =>
    row.map((cell) => {
      const s = cell == null ? "" : String(cell);
      const needsQuotes = /[",\n]/.test(s);
      const safe = s.replace(/"/g, '""');
      return needsQuotes ? `"${safe}"` : safe;
    }).join(",")
  );
  const csv = [headerLine, ...bodyLines].join("\n");
  const content = (addBom ? "\ufeff" : "") + csv;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ====== Generadores ====== */
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
function generateAuditLog() {
  const user = USERS[Math.floor(Math.random() * USERS.length)];
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const resource = RESOURCES[Math.floor(Math.random() * RESOURCES.length)];
  return {
    id: Date.now() + Math.random(),
    timestamp: new Date(),
    user, action, resource,
    details: detailByAction(action, resource, user),
    ipAddress: `192.168.${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 255)}`,
    success: Math.random() > 0.15,
    sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`,
    platform: user.includes("Residente") ? "Móvil" : "Web",
  };
}
function getActionBadge(action) {
  const map = {
    CREAR: "ad-badge-soft ad-green",
    CONSULTAR: "ad-badge-soft ad-blue",
    MODIFICAR: "ad-badge-soft ad-amber",
    ELIMINAR: "ad-badge-soft ad-red",
    INICIAR_SESION: "ad-badge-soft ad-purple",
    CERRAR_SESION: "ad-badge-soft ad-gray",
    PAGAR: "ad-badge-soft ad-emerald",
    RESERVAR: "ad-badge-soft ad-cyan",
  };
  return map[action] || "ad-badge-soft ad-gray";
}

function generateTechnicalLog() {
  const level = SEVERITY_LEVELS[Math.floor(Math.random() * SEVERITY_LEVELS.length)];
  const module = MODULES[Math.floor(Math.random() * MODULES.length)];
  const activities = {
    AUTENTICACION: ["Autenticación JWT exitosa","Token expirado renovado","Intento de login fallido","Sesión cerrada por timeout"],
    BASE_DATOS: ["Consulta de residentes ejecutada","Backup de cuotas completado","Conexión a BD perdida","Optimización de índices finalizada"],
    API_MOVIL: ["Endpoint /cuotas consultado","Push notification enviada","Rate limit aplicado","Sincronización completada"],
    API_WEB: ["Dashboard de admin cargado","Reporte generado exitosamente","Timeout en consulta","Cache actualizado"],
    SEGURIDAD: ["Acceso bloqueado por IP","Certificado SSL verificado","Intento de acceso no autorizado","Firewall regla aplicada"],
    RESPALDO: ["Backup automático iniciado","Backup de imágenes fallido","Restore de configuración","Verificación de integridad OK"],
    REPORTES: ["Reporte financiero generado","Export de residentes a Excel","Dashboard actualizado","Métricas de ocupación calculadas"],
    PAGOS: ["Pago procesado exitosamente","Gateway de pago no responde","Comisión calculada","Notificación de pago enviada"],
  };
  const message = activities[module][Math.floor(Math.random() * activities[module].length)];
  return {
    id: Date.now() + Math.random(),
    timestamp: new Date(),
    level, module, message,
    details: `${module}: ${message} - ${new Date().toISOString()}`,
    server: `server-${Math.floor(Math.random() * 3) + 1}`,
    responseTime: Math.floor(Math.random() * 1000) + "ms",
  };
}
function sevColor(level) {
  if (level === "INFO") return "ad-blue";
  if (level === "ADVERTENCIA") return "ad-amber";
  if (level === "ERROR") return "ad-red";
  if (level === "CRÍTICO") return "ad-purple";
  return "ad-gray";
}
function SevIcon({ level }) {
  if (level === "INFO") return <CheckCircle className="ad-ico-14" />;
  if (level === "ADVERTENCIA") return <span className="ad-ico-14">!</span>;
  if (level === "ERROR") return <XCircle className="ad-ico-14" />;
  if (level === "CRÍTICO") return <span className="ad-ico-14">⚠</span>;
  return <span className="ad-ico-14">•</span>;
}

/* ====== Vistas ====== */
function AuditoriaResidencial() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filterUser, setFilterUser] = useState("todos");
  const [filterAction, setFilterAction] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setAuditLogs((prev) => [generateAuditLog(), ...prev].slice(0, 50));
    }, 4000);
    setAuditLogs([
      {
        id: 1, timestamp: new Date(), user: "Administrador - Juan Pérez",
        action: "INICIAR_SESION", resource: "Sistema de gestión",
        details: "Administrador inició sesión en plataforma web",
        ipAddress: "192.168.1.100", success: true, sessionId: "sess_admin001", platform: "Web",
      },
      {
        id: 2, timestamp: new Date(Date.now() - 30000), user: "Residente - Apt 301 María García",
        action: "PAGAR", resource: "Cuotas de mantenimiento",
        details: "Residente procesó pago de cuota mensual",
        ipAddress: "192.168.1.45", success: true, sessionId: "sess_res301", platform: "Móvil",
      },
    ]);
    return () => clearInterval(interval);
  }, []);

  const filtered = auditLogs.filter((log) => {
    if (filterUser !== "todos" && !log.user.includes(filterUser)) return false;
    if (filterAction !== "todos" && log.action !== filterAction) return false;
    if (searchTerm && !log.details.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleExport = () => {
    const headers = ["Fecha y Hora","Usuario","Tipo Usuario","Acción","Recurso","Estado","Plataforma","IP","ID Sesión","Detalles"];
    const rows = filtered.map((log) => [
      log.timestamp.toLocaleString("es-ES"),
      log.user.split(" - ")[1] || log.user.split(" - ")[0],
      log.user.split(" - ")[0],
      log.action,
      log.resource,
      log.success ? "Éxito" : "Fallo",
      log.platform,
      log.ipAddress,
      log.sessionId,
      log.details,
    ]);
    exportCSV(headers, rows, `auditoria-residencial-${new Date().toISOString().split("T")[0]}.csv`, true);
  };

  return (
    <div className="ad-stack-24">
      <div className="ad-card">
        <div className="ad-row-between ad-mb-12">
          <div className="ad-row-8">
            <Eye className="ad-ico-20 ad-purple" />
            <div>
              <h2 className="ad-h2">Bitácora de Auditoría - Sistema Residencial</h2>
            </div>
          </div>
          <button className="ad-btn ad-btn-primary" onClick={handleExport}>
            <Download className="ad-ico-14" /> Exportar Auditoría
          </button>
        </div>

        <div className="ad-row-8 ad-wrap ad-mb-12">
          <div className="ad-input-icon">
            <input
              placeholder="Buscar en detalles de actividad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="bta-select" value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
            <option value="todos">Todos los usuarios</option>
            {USER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="bta-select" value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
            <option value="todos">Todas las acciones</option>
            {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Recurso</th>
                <th>Estado</th>
                <th>Plataforma</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="ad-row-hover">
                  <td>{log.timestamp.toLocaleString("es-ES")}</td>
                  <td>
                    <div className="ad-text-strong">
                      {log.user.split(" - ")[1] || log.user.split(" - ")[0]}
                    </div>
                    <div className="ad-text-xs ad-text-dim">{log.user.split(" - ")[0]}</div>
                  </td>
                  <td>
                    <span className={getActionBadge(log.action)}>{log.action}</span>
                  </td>
                  <td>{log.resource}</td>
                  <td>
                    <span className={`ad-badge ${log.success ? "ad-badge-success" : "ad-badge-danger"}`}>
                      {log.success ? "Éxito" : "Fallo"}
                    </span>
                  </td>
                  <td>
                    <div className="ad-row-4">
                      <span className={`bta-dot ${log.platform === "Móvil" ? "ad-green" : "ad-blue"}`} />
                      <span className="ad-text-dim">{log.platform}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan="6" className="ad-text-dim">Sin registros.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ad-text-dim ad-mt-8">
          Mostrando {filtered.length} de {auditLogs.length} registros de auditoría
        </div>
      </div>
    </div>
  );
}

function LogsTecnicos() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("todos");
  const [severity, setSeverity] = useState("todos");

  useEffect(() => {
    const i = setInterval(() => {
      setLogs((prev) => [generateTechnicalLog(), ...prev].slice(0, 100));
    }, 3000);
    setLogs([{
      id: 1, timestamp: new Date(), level: "INFO", module: "AUTENTICACION",
      message: "Sistema de gestión residencial iniciado",
      details: "AUTENTICACION: Sistema de gestión residencial iniciado - " + new Date().toISOString(),
      server: "server-1", responseTime: "45ms",
    }]);
    return () => clearInterval(i);
  }, []);

  const filtered = logs.filter((l) => {
    if (filter !== "todos" && l.module !== filter) return false;
    if (severity !== "todos" && l.level !== severity) return false;
    return true;
  });

  const handleExportTech = () => {
    const headers = ["Timestamp","Nivel","Módulo","Mensaje","Servidor","Tiempo Respuesta","Detalles Completos"];
    const rows = filtered.map((l) => [
      l.timestamp.toISOString(), l.level, l.module.replace("_"," "), l.message, l.server, l.responseTime, l.details,
    ]);
    exportCSV(headers, rows, `logs-tecnicos-${new Date().toISOString().split("T")[0]}.csv`, true);
  };

  return (
    <div className="ad-stack-24">
      <div className="ad-card">
        <div className="ad-row-between ad-mb-12">
          <div className="ad-row-8">
            <Database className="ad-ico-20 ad-blue" />
            <div>
              <h2 className="ad-h2">Logs Técnicos del Sistema</h2>
              <p className="ad-text-dim">Monitoreo técnico para debugging y mantenimiento</p>
            </div>
          </div>
          <div className="ad-row-8">
            <div className="ad-text-dim ad-text-sm">{filtered.length} registros técnicos</div>
            <button className="ad-btn ad-btn-primary" onClick={handleExportTech}>
              <Download className="ad-ico-14" /> Exportar Logs
            </button>
          </div>
        </div>

        <div className="ad-row-8 ad-wrap ad-mb-12">
          <select className="bta-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="todos">Todos los módulos</option>
            {MODULES.map((m) => <option key={m} value={m}>{m.replace("_"," ")}</option>)}
          </select>
          <select className="bta-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="todos">Todos los niveles</option>
            {SEVERITY_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="bta-logbox">
          {filtered.map((log) => (
            <div key={log.id} className="bta-logline">
              <span className="bta-time">{log.timestamp.toISOString().substring(11, 23)}</span>
              <span className={`bta-pill ${sevColor(log.level)}`}><SevIcon level={log.level} /> {log.level}</span>
              <span className="bta-module">[{log.module}]</span>
              <span className="bta-msg">{log.message}</span>
              <span className="bta-rt">{log.responseTime}</span>
              <span className="bta-srv">({log.server})</span>
            </div>
          ))}
          {!filtered.length && <div className="ad-text-dim">Sin registros.</div>}
        </div>
      </div>
    </div>
  );
}

export default function BitacoraPractica() {
  const [activeSystem, setActiveSystem] = useState(1);
  return (
    <div className="ad-stack-24">
      <div className="ad-card">
        <div className="ad-row-8 ad-mb-12">
          <Home className="ad-ico-24 ad-indigo" />
          <div>
            <h1 className="ad-h1">Sistemas de Bitácora - Gestión Residencial</h1>
          </div>
        </div>

        <div className="ad-row-8 ad-wrap">
          <button
            className={`ad-btn ${activeSystem === 1 ? "ad-btn-purple" : "ad-btn-ghost"}`}
            onClick={() => setActiveSystem(1)}
          >
            <Eye className="ad-ico-14" /> Auditoría (Caso de Uso)
          </button>
          <button
            className={`ad-btn ${activeSystem === 2 ? "ad-btn-primary" : "ad-btn-ghost"}`}
            onClick={() => setActiveSystem(2)}
          >
            <Database className="ad-ico-14" /> Logs Técnicos
          </button>
        </div>
      </div>

      {activeSystem === 1 ? <AuditoriaResidencial /> : <LogsTecnicos />}

      <div className="ad-card">
        <div className="ad-grid-2 ad-gap-12">
          <div></div>
        </div>
      </div>
    </div>
  );
}