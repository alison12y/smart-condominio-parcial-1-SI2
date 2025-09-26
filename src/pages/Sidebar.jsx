
import React, { useEffect, useMemo, useState } from "react";
import "../styles/Sidebar.css";
import {
  Home,
  Users,
  CreditCard,
  Wrench,
  Settings,
  UserPlus,
  DollarSign,
  Receipt,
  ClipboardList,
  Notebook,    
  Key,
  Bell,
  BarChart3,
  Brain,
  PieChart,
  Shield,
  Eye,
  Car,
  AlertTriangle,
  MessageSquare,
  Megaphone,
  Mail,
  AlertCircle,
  Server,
  Cog,
  ShieldCheck,
} from "lucide-react";

/* ===== Menú con TUS IDS (incluyendo espacios) ===== */
const menu = [
  { id: "dashboard", label: "Panel", icon: Home },

  {
  id: "AdminUsers",
  label: "Administración de Usuarios",
  icon: Users, // 👥
  submenu: [
    { id: "AdminUsers-GestionarUsuarios", label: "Gestionar Usuarios", icon: UserPlus }, // ➕ Usuario
    { id: "AdminUsers-RolesYPermisos", label: "Roles y Permisos", icon: Key }, // 🔑
    { id: "AdminUsers-GestionarBitacora", label: "Gestionar Bitácora", icon: Notebook }, // 📓
  ],
},

{
  id: "FinanceAnalytics",
  label: "Finanzas y Analíticas",
  icon: CreditCard, // 💳
  submenu: [
    { id: "FinanceAnalytics-RegistrarPago", label: "Recordatorios de Pago", icon: Bell }, // 🔔
    { id: "FinanceAnalytics-Cuotas", label: "Gestionar cuotas y gastos comunes", icon: Receipt }, // 🧾
    { id: "FinanceAnalytics-Reportes", label: "Reportes Financieros", icon: BarChart3 }, // 📊
    { id: "FinanceAnalytics-Prediccion", label: "Predicción de morosidad (IA)", icon: Brain }, // 🧠
    { id: "FinanceAnalytics-ReportesUso", label: "Reportes de Uso de Áreas", icon: PieChart }, // 🥧
  ],
},

{
  id: "SecurityAI",
  label: "Seguridad de Accesos (IA)",
  icon: Shield, // 🛡️
  submenu: [
    { id: "SecurityAI-Acceso", label: "Acceso con reconocimiento facial", icon: Eye }, // 👁️
    { id: "SecurityAI-ReconocimientoVehiculos", label: "Reconocimiento de vehículos (IA)", icon: Car }, // 🚗
    { id: "SecurityAI-SeguridadAnomalias", label: "Seguridad y reportes de anomalías (IA)", icon: AlertTriangle }, // ⚠️
  ],
},

{
  id: "CommsServices",
  label: "Comunicación y Servicios",
  icon: MessageSquare, // 💬
  submenu: [
    { id: "CommsServices-AvisosYComunicados", label: "Avisos y Comunicados", icon: Megaphone }, // 📢
    { id: "CommsServices-Correspondencia", label: "Gestión de Correspondencia", icon: Mail }, // 📧
    { id: "CommsServices-ReportarIncidencias", label: "Reportar incidencias comunitarias", icon: AlertCircle }, // 🚨
  ],
},

{
  id: "PlatformOps",
  label: "Plataforma y Operaciones",
  icon: Server, // 🖥️
  submenu: [
    { id: "PlatformOps-Mantenimiento", label: "Gestionar Mantenimiento", icon: Wrench }, // 🔧
    { id: "PlatformOps-MantenimientoPreventivo", label: "Mantenimiento preventivo (IA)", icon: Cog }, // ⚙️
    { id: "PlatformOps-SeguridadInformatica", label: "Seguridad informática (IA)", icon: ShieldCheck }, // 🛡️✅
  ],
},

{ id: "settings", label: "Configuración", icon: Settings }, // ⚙️
];

/* ======  SIDEBAR ====== */
const Sidebar = ({ isOpen, activeSection, setActiveSection, logoSrc }) => {
  /* Construimos un mapa hijo->padre para saber qué menú abrir */
  const parentOf = useMemo(() => {
    const map = {};
    menu.forEach((m) => {
      if (m.submenu) m.submenu.forEach((s) => (map[s.id] = m.id));
    });
    return map;
  }, []);

  /* Estado de menús abiertos. Se inicializa según activeSection */
  const [open, setOpen] = useState({});

  useEffect(() => {
    const parent = parentOf[activeSection];
    if (parent) {
      setOpen((prev) => ({ ...prev, [parent]: true }));
    }
  }, [activeSection, parentOf]);

  /* Un padre se considera “activo” si alguno de sus hijos coincide */
  const isParentActive = (m) =>
    Array.isArray(m.submenu) && m.submenu.some((s) => s.id === activeSection);

  return (
    <aside className={`side ${isOpen ? "open" : "hidden"}`}>
      <div className="side-head">
        <div className="logo-wrap">
          {logoSrc ? (
            <img src={logoSrc} alt="Logo" className="logo-img" />
          ) : (
            <div className="logo-fallback">SC</div>
          )}
        </div>
        <div className="brand-wrap">
          <div className="brand">Smart Condominio</div>
          <div className="sub">Panel de Administración</div>
        </div>
      </div>

      <ul className="list">
        {menu.map((m) => {
          const Icon = m.icon;
          const hasSub = !!m.submenu;
          const expanded = !!open[m.id];
          const parentActive = isParentActive(m);

          return (
            <li key={m.id}>
              <button
                type="button"
                className={`item ${activeSection === m.id || parentActive ? "active" : ""}`}
                onClick={() =>
                  hasSub
                    ? setOpen((prev) => ({ ...prev, [m.id]: !expanded }))
                    : setActiveSection(m.id)
                }
              >
                <Icon size={16} className="i" />
                <span>{m.label}</span>
              </button>

              {hasSub && expanded && (
                <ul className="sub">
                  {m.submenu.map((s) => {
                    const SIcon = s.icon;
                    const isActive = activeSection === s.id;
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          className={`sub-item ${isActive ? "active" : ""}`}
                          onClick={() => setActiveSection(s.id)}
                        >
                          <SIcon size={14} className="i" />
                          <span>{s.label}</span>
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
    </aside>
  );
};

export default Sidebar;

