import { useEffect, useState } from "react";
import {
  LayoutDashboard, Shield, Users, DollarSign, MessageCircle, Settings,
  Bell, TrendingUp, Wrench, Eye, Download, Filter, Search,
  Phone, Mail, CreditCard, Building, Activity, Edit, LogOut,
  Notebook
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loadDashboardData } from "../api/dashboard";
import "../styles/admin-dashboard.css";

// ⬇️ IMPORTA TU VISTA DE USUARIOS (solo front, sin backend)
import User from "../pages/Users"; // <-- ajusta la ruta si la carpeta es distinta

// Valores por defecto para evitar null en render
const DEFAULT_KPIS = {
  totalUnits: 0,
  occupiedUnits: 0,
  vacantUnits: 0,
  totalResidents: 0,
  monthlyRevenue: 0,
  outstandingPayments: 0,
  maintenanceRequests: 0,
  securityIncidents: 0,
  energyEfficiency: 0,
  waterUsage: 0,
};

export default function AdminCondominiumDashboard() {
  const navigate = useNavigate();

  // Para arrancar directo en la vista de usuarios mientras pruebas, usa:
  // const [activeTab, setActiveTab] = useState("users.manage");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");

  const [k, setK] = useState(null);
  const [lists, setLists] = useState({ accessLog: [], incidents: [], residents: [], maintenance: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // estado para grupos (submenús) abiertos
  const [openGroups, setOpenGroups] = useState({}); // { users: true/false }

  // Cerrar sesión
  function handleLogout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    let live = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { kpis, lists } = await loadDashboardData();
        if (live) { setK(kpis); setLists(lists); }
      } catch (e) {
        console.error("Dashboard load error:", e);
        if (live) {
          setK(DEFAULT_KPIS);
          setLists({ accessLog: [], incidents: [], residents: [], maintenance: [] });
          setError("No se pudo cargar el dashboard.");
        }
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, []);

  // Si navegas directo a un subitem, abrir su grupo automáticamente
  useEffect(() => {
    const groupWithActiveChild = menuItems.find(mi => mi.children?.some(c => c.id === activeTab));
    if (groupWithActiveChild && !openGroups[groupWithActiveChild.id]) {
      setOpenGroups(g => ({ ...g, [groupWithActiveChild.id]: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // --------- MENÚ CON SUBMENÚS ---------
  const menuItems = [
    { id: "dashboard", name: "Panel general", icon: LayoutDashboard },

    {
      id: "users",
      name: "Administración de Usuarios",
      icon: Users,
      children: [
        { id: "users.manage", name: "Gestionar Usuarios", icon: Users },
        { id: "users.roles",  name: "Roles y permisos",  icon: Shield },
        { id: "users.bitacora",  name: "Gestionar Bitacora",  icon: Notebook },
      ],
    },

    { 
      id: "residents", 
      name: "Finanzas y Analítica", 
      icon: DollarSign, 
      children: [
        { id: "residents.manage", name: "Recordatorios de Pago", icon: Users },
        { id: "residents.payments", name: "Gestionar cuotas y gastos comunes", icon: CreditCard },
        { id: "residents.reports", name: "Reportes Financieros", icon: TrendingUp },
      ],  
    },
    { id: "finances", name: "Seguridad de Accesos (IA)", icon: Wrench },
    { id: "communications", name: "Comunicación y Servicios", icon: MessageCircle },
    { id: "reports", name: "Plataforma y Operaciones", icon: Activity },
    { id: "settings", name: "Configuración", icon: Settings },
  ];

  function KpiCard({ title, value, subtitle, Icon, color, trend, onClick }) {
    return (
      <div className="ad-kpi-card" style={{ borderColor: color }} onClick={onClick}>
        <div className="ad-kpi-header">
          <div>
            <p className="ad-kpi-title">{title}</p>
            <p className="ad-kpi-value">{value}</p>
            {subtitle && <p className="ad-kpi-sub">{subtitle}</p>}
            {trend && (
              <div className="ad-kpi-trend">
                <TrendingUp className="ad-ico-14 ad-success" />
                <span className="ad-success">{trend}</span>
              </div>
            )}
          </div>
          <div className="ad-kpi-icon" style={{ backgroundColor: `${color}20` }}>
            <Icon className="ad-ico-28" style={{ color }} />
          </div>
        </div>
      </div>
    );
  }

  function Metric({ title, value, color }) {
    return (
      <div className="ad-metric">
        <div className={`ad-metric-value ${color}`}>{value}</div>
        <div className="ad-metric-title">{title}</div>
      </div>
    );
  }

  function PlusIcon() { return <span className="ad-ico-plus">+</span>; }

  const kk = k ?? DEFAULT_KPIS;
  const accessLog = lists?.accessLog ?? [];
  const incidents = lists?.incidents ?? [];
  const residents = lists?.residents ?? [];
  const maintenance = lists?.maintenance ?? [];

  const DashboardContent = () => (
    <div className="ad-stack-24">
      <div className="ad-card">
        <div className="ad-row-between">
          <h2 className="ad-h2">Panel de Administración</h2>
          <div className="ad-row-8">
            {["7d", "30d", "90d", "1y"].map(r => (
              <button
                key={r}
                onClick={() => setSelectedTimeRange(r)}
                className={selectedTimeRange === r ? "ad-chip ad-chip-active" : "ad-chip"}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="ad-card" style={{ color: "#b91c1c" }}>{error}</div>}

      <div className="ad-grid-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="ad-skeleton" />)
        ) : (
          <>
            <KpiCard
              title="Ocupación Total"
              value={`${(((kk.occupiedUnits || 0) / Math.max(kk.totalUnits || 0, 1)) * 100).toFixed(1)}%`}
              subtitle={`${kk.occupiedUnits || 0}/${kk.totalUnits || 0} unidades`}
              Icon={Building}
              color="#3B82F6"
              onClick={() => setActiveTab("residents")}
            />
            <KpiCard
              title="Ingresos Mensuales"
              value={`$${Number(kk.monthlyRevenue || 0).toLocaleString()}`}
              subtitle="Proyección mes actual"
              Icon={DollarSign}
              color="#10B981"
              trend="+12% vs mes anterior"
              onClick={() => setActiveTab("finances")}
            />
            <KpiCard
              title="Solicitudes Activas"
              value={kk.maintenanceRequests || 0}
              subtitle="Mantenimiento pendiente"
              Icon={Wrench}
              color="#F59E0B"
              onClick={() => setActiveTab("maintenance")}
            />
            <KpiCard
              title="Incidentes Seguridad"
              value={kk.securityIncidents || 0}
              subtitle="Últimas 24 horas"
              Icon={Shield}
              color="#EF4444"
              onClick={() => setActiveTab("users.manage")}
            />
          </>
        )}
      </div>

      <div className="ad-grid-3">
        <div className="ad-card ad-col-span-2">
          <div className="ad-row-between ad-mb-12">
            <h3 className="ad-h3">
              <Activity className="ad-ico-20 ad-primary" /> Actividad Reciente del Sistema
            </h3>
            <button className="ad-link">Ver todo</button>
          </div>
          <div className="ad-stack-8">
            {accessLog.slice(0, 5).map(log => (
              <div key={log.id} className="ad-log-item">
                <div className="ad-row">
                  <div className={`ad-dot ${log.authorized ? "ad-bg-success" : "ad-bg-danger"}`} />
                  <div>
                    <p className="ad-text-strong">{log.person}</p>
                    <p className="ad-text-dim">{log.action} - {log.unit} ({log.method})</p>
                  </div>
                </div>
                <div className="ad-right">
                  <p className="ad-text-strong">{log.time}</p>
                  <p className="ad-text-dim">{log.date}</p>
                </div>
              </div>
            ))}
            {!accessLog.length && <div className="ad-text-dim">Sin registros recientes.</div>}
          </div>
        </div>

        <div className="ad-card">
          <h3 className="ad-h3">
            <Bell className="ad-ico-20 ad-warn" /> Alertas Administrativas
          </h3>
          <div className="ad-stack-8 ad-mt-12">
            {incidents.map(inc => (
              <div key={inc.id} className={`ad-alert ${badgeByPriority(inc.priority)}`}>
                <div className="ad-row-between">
                  <div>
                    <p className="ad-text-strong">{inc.description || inc.detalle || "Incidente"}</p>
                    <p className="ad-text-xs ad-text-dim">{(inc.time || "")} {capitalize(inc.type || "")}</p>
                  </div>
                  <span className={`ad-badge ${badgeByStatus(inc.status)}`}>
                    {labelByStatus(inc.status)}
                  </span>
                </div>
              </div>
            ))}
            {!incidents.length && <div className="ad-text-dim">Sin incidentes.</div>}
          </div>
        </div>
      </div>

      <div className="ad-grid-2">
        <div className="ad-card">
          <h3 className="ad-h3 ad-mb-12">Eficiencia Operativa</h3>
          <div className="ad-grid-2 ad-gap-12">
            <Metric title="Eficiencia Energética" value={`${kk.energyEfficiency}%`} color="ad-success" />
            <Metric title="Consumo de Agua" value={`${(kk.waterUsage).toLocaleString()} L`} color="ad-primary" />
          </div>
        </div>

        <div className="ad-card">
          <h3 className="ad-h3 ad-mb-12">Estado Financiero</h3>
          <div className="ad-grid-2 ad-gap-12">
            <Metric title="Tasa de Cobro" value="89.5%" color="ad-primary" />
            <Metric title="Pagos Pendientes" value={`$${Number(kk.outstandingPayments||0).toLocaleString()}`} color="ad-danger" />
          </div>
        </div>
      </div>
    </div>
  );

  const SecurityContent = () => (
    <div className="ad-stack-24">
      <div className="ad-card">
        <div className="ad-row-between ad-mb-16">
          <h3 className="ad-h3">Centro de Control de Seguridad</h3>
          <div className="ad-row-8">
            <button className="ad-btn ad-btn-success"><Eye className="ad-ico-14" /> Ver en Vivo</button>
            <button className="ad-btn ad-btn-primary"><Download className="ad-ico-14" /> Exportar Logs</button>
          </div>
        </div>

        <div className="ad-grid-3 ad-gap-12 ad-mb-16">
          <div className="ad-placeholder">Cámaras (pendiente de API)</div>
          <div className="ad-placeholder">Cámaras (pendiente de API)</div>
          <div className="ad-placeholder">Cámaras (pendiente de API)</div>
        </div>

        <div>
          <div className="ad-row-between ad-mb-12">
            <h4 className="ad-h4">Registro Detallado de Accesos</h4>
            <div className="ad-row-8">
              <div className="ad-input-icon">
                <Search className="ad-ico-14 ad-text-dim" />
                <input placeholder="Buscar..." />
              </div>
              <button className="ad-btn-outline"><Filter className="ad-ico-14" /></button>
            </div>
          </div>

          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Fecha/Hora</th><th>Persona</th><th>Acción</th>
                  <th>Unidad</th><th>Método</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {accessLog.map(log => (
                  <tr key={log.id}>
                    <td><div><div className="ad-text-strong">{log.date}</div><div className="ad-text-xs ad-text-dim">{log.time}</div></div></td>
                    <td className="ad-text-strong">{log.person}</td>
                    <td>{log.action}</td>
                    <td>{log.unit}</td>
                    <td>{log.method}</td>
                    <td><span className={`ad-badge ${log.authorized ? "ad-badge-success":"ad-badge-danger"}`}>{log.authorized ? "Autorizado" : "Denegado"}</span></td>
                    <td><button className="ad-link">Detalles</button></td>
                  </tr>
                ))}
                {!accessLog.length && <tr><td colSpan="7" className="ad-text-dim">Sin registros.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const ResidentsContent = () => (
    <div className="ad-stack-24">
      <div className="ad-card">
        <div className="ad-row-between ad-mb-16">
          <h3 className="ad-h3">Gestión Integral de Residentes</h3>
          <div className="ad-row-8">
            <button className="ad-btn ad-btn-success"><PlusIcon /> Nuevo Residente</button>
            <button className="ad-btn ad-btn-primary"><Download className="ad-ico-14" /> Exportar Lista</button>
          </div>
        </div>

        <div className="ad-grid-4 ad-mb-16">
          <Metric title="Total Unidades" value={kk.totalUnits} color="ad-primary" />
          <Metric title="Ocupadas" value={kk.occupiedUnits} color="ad-success" />
          <Metric title="Vacantes" value={kk.vacantUnits} color="ad-warn" />
          <Metric title="Residentes" value={kk.totalResidents} color="ad-purple" />
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Unidad</th><th>Propietario</th><th>Contacto</th>
                <th>Ocupantes</th><th>Estado Pago</th><th>Balance</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {residents.map(r => (
                <tr key={r.id}>
                  <td className="ad-text-strong">{r.unit}</td>
                  <td>
                    <div className="ad-text-strong">{r.owner}</div>
                    <div className="ad-text-xs ad-text-dim">{r.status === "current" ? "Habitado" : "Vacante"}</div>
                  </td>
                  <td>
                    <div className="ad-row-4 ad-text-xs"><Phone className="ad-ico-12" />{r.phone}</div>
                    <div className="ad-row-4 ad-text-xs"><Mail className="ad-ico-12" />{r.email}</div>
                  </td>
                  <td className="ad-center">{r.occupants}</td>
                  <td><span className={`ad-badge ${badgeByPay(r.paymentStatus)}`}>{labelByPay(r.paymentStatus)}</span></td>
                  <td className={r.balance < 0 ? "ad-danger" : "ad-success"}>${Math.abs(r.balance).toLocaleString()}</td>
                  <td>
                    <div className="ad-row-4">
                      <button className="ad-icon-btn ad-blue"><Eye className="ad-ico-14" /></button>
                      <button className="ad-icon-btn ad-green"><Edit className="ad-ico-14" /></button>
                      <button className="ad-icon-btn ad-red"><CreditCard className="ad-ico-14" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!residents.length && <tr><td colSpan="7" className="ad-text-dim">Sin residentes.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const UsersRolesContent = () => (
    <div className="ad-card">
      <h3 className="ad-h3">Roles y Permisos</h3>
      <p className="ad-text-dim">Configura roles, permisos y políticas de acceso.</p>
      {/* Tu UI de roles aquí */}
    </div>
  );

  function renderContent() {
    switch (activeTab) {
      case "dashboard":     return <DashboardContent />;
      case "users.manage":  return <User />;                // 👈 aquí mostramos tu vista de usuarios (solo front)
      case "users.roles":   return <UsersRolesContent />;
      case "security":      return <SecurityContent />;
      case "residents":     return <ResidentsContent />;
      case "maintenance":   return <div className="ad-card"><h3 className="ad-h3">Mantenimiento</h3></div>;
      case "finances":      return <div className="ad-card"><h3 className="ad-h3">Administración Financiera</h3></div>;
      case "communications":return <div className="ad-card"><h3 className="ad-h3">Comunicaciones</h3></div>;
      case "reports":       return <div className="ad-card"><h3 className="ad-h3">Reportes</h3></div>;
      case "settings":      return <div className="ad-card"><h3 className="ad-h3">Configuración</h3></div>;
      default:              return <DashboardContent />;
    }
  }

  return (
    <div className="ad-screen">
      {/* Header */}
      <header className="ad-header">
        <div>
          <h1 className="ad-title">Smart Condominio - Admin Panel</h1>
          <p className="ad-subtitle">Centro de Administración y Control</p>
        </div>

        <div className="ad-header-right">
          <div className="ad-status"><div className="ad-dot ad-bg-success ad-pulse" /><span>Sistema Operativo</span></div>

          <div className="ad-bell">
            <Bell className="ad-ico-20 ad-text-dim" />
            <span className="ad-bell-badge">{(incidents || []).filter(i => (i.status || "") !== "resolved").length}</span>
          </div>

          <div className="ad-user">
            <div className="ad-avatar">AD</div>
            <span>Administrador</span>
            <button className="ad-btn ad-btn-danger ad-ml-8" onClick={handleLogout}>
              <LogOut className="ad-ico-16" /> Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="ad-body">
        {/* Sidebar */}
        <aside className="ad-sidebar">
          <nav className="ad-nav">
            <ul className="ad-menu">
              {menuItems.map(item => {
                const Icon = item.icon;
                const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                const isChildActive = hasChildren && item.children.some(c => c.id === activeTab);
                const isActive = activeTab === item.id || isChildActive;
                const isOpen = (openGroups[item.id] ?? false) || isChildActive;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        if (hasChildren) {
                          setOpenGroups(g => ({ ...g, [item.id]: !isOpen })); // abrir/cerrar
                        } else {
                          setActiveTab(item.id);
                        }
                      }}
                      className={isActive ? "ad-menu-item ad-menu-item-active" : "ad-menu-item"}
                    >
                      <Icon className="ad-ico-18" />
                      {item.name}
                      {hasChildren && <span className="ad-flex-1" />}
                      {hasChildren && (
                        <span className={`ad-caret ${isOpen ? "ad-caret-open" : ""}`}>▸</span>
                      )}
                    </button>

                    {hasChildren && isOpen && (
                      <ul className="ad-submenu">
                        {item.children.map(child => {
                          const ChildIcon = child.icon || Icon;
                          const activeChild = activeTab === child.id;
                          return (
                            <li key={child.id}>
                              <button
                                onClick={() => setActiveTab(child.id)}
                                className={activeChild ? "ad-menu-item ad-subitem ad-menu-item-active" : "ad-menu-item ad-subitem"}
                              >
                                <ChildIcon className="ad-ico-16" />
                                {child.name}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <main className="ad-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

/* helpers */
function badgeByPriority(p) {
  const x = (p || "").toString().toLowerCase();
  if (x === "high" || x === "alta") return "ad-badge-danger";
  if (x === "medium" || x === "media") return "ad-badge-warn";
  return "ad-badge-info";
}
function badgeByStatus(s) {
  const x = (s || "").toString().toLowerCase();
  if (x === "investigating" || x === "pendiente") return "ad-badge-warn";
  if (x === "assigned" || x === "asignado") return "ad-badge-info";
  if (x === "resolved" || x === "resuelto") return "ad-badge-success";
  return "ad-badge";
}
function labelByStatus(s) {
  const x = (s || "").toString().toLowerCase();
  if (x === "assigned") return "Asignado";
  if (x === "in_progress") return "En Progreso";
  if (x === "resolved") return "Resuelto";
  return s || "Pendiente";
}
function badgeByPay(p) {
  const x = (p || "").toString().toLowerCase();
  if (x === "paid" || x === "al dia" || x === "al_dia") return "ad-badge-success";
  if (x === "pending" || x === "pendiente") return "ad-badge-warn";
  return "ad-badge-danger";
}
function labelByPay(p) {
  const x = (p || "").toString().toLowerCase();
  if (x === "paid" || x === "al dia" || x === "al_dia") return "Al día";
  if (x === "pending" || x === "pendiente") return "Pendiente";
  return "Moroso";
}
function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : ""; }