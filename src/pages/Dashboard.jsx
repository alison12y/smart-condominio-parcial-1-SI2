import React, { useState } from "react";
import "../styles/admin-dashboard.css";
import Sidebar from "../pages/Sidebar";
import miFoto from "../logo2.png";
import {
  Menu,
  Bell,
  LogOut,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

/* ======  VISTAS ====== */

import Usuarios from "../pages/Users";                // Gestionar Usuarios
import RolesPermisos from "../pages/RolesYPermisos";  // Roles y Permisos
import Bitacora from "../pages/bitacora";             // Gestionar Bitácora
import RecordatoriosDePago from "../pages/RecordatoriosDePago";     // Recordatorios de pago
import CuotasGastosInterface from "../pages/CuotasyGastosComunes";
import ReportesFinancieros from "../pages/Reportes";
import Prediccion from "../pages/Prediccion";
import ReportesAreasComunes from "../pages/Uso-de-areas";

/* ====== DASHBOARD ====== */

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderSection = () => {
    switch (activeSection) {
      // ===== Administración de Usuarios =====
      case "AdminUsers-GestionarUsuarios":
        return <Usuarios />;
      case "AdminUsers-RolesYPermisos":
        return <RolesPermisos />;
      case "AdminUsers-GestionarBitacora":
        return <Bitacora />;
      case "FinanceAnalytics-RegistrarPago":      
      return <RecordatoriosDePago />;
      case "FinanceAnalytics-Cuotas":      
      return <CuotasGastosInterface />;
      case "FinanceAnalytics-Reportes":      
      return <ReportesFinancieros />;
      case "FinanceAnalytics-Prediccion":      
      return <Prediccion />;
      case "FinanceAnalytics-ReportesUso":      
      return <ReportesAreasComunes />;

      default:
        return null;
    }
  };

  // Datos de ejemplo
  const stats = [
    { title: "TOTAL APARTAMENTOS", value: "120", change: "+2%" },
    { title: "PAGOS AL DÍA", value: "85%", change: "+5%" },
    { title: "INCIDENCIAS ABIERTAS", value: "8", change: "-12%" },
    { title: "INGRESOS MENSUALES", value: "Bs. 169,575", change: "+8%" },
  ];

  const activity = [
    { action: "Pago recibido", user: "Apto 205", time: "10:30", status: "success" },
    { action: "Solicitud mantenimiento", user: "Apto 418", time: "09:15", status: "pending" },
    { action: "Registro visitante", user: "Torre B", time: "08:45", status: "info" },
  ];

  const notifications = [
    { id: 1, message: "Pago pendiente - Apto 301", type: "warning", time: "2h" },
    { id: 2, message: "Mantenimiento programado - Ascensor B", type: "info", time: "1d" },
    { id: 3, message: "Nueva reserva - Salón comunal", type: "success", time: "3h" },
  ];

  const handleLogout = () => {
    if (window.confirm("¿Está seguro que desea cerrar sesión?")) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      sessionStorage.clear();
      window.location.href = "/login";
    }
  };

  const wrapClass = `dash-wrap ${sidebarOpen ? "with-sidebar" : "no-sidebar"}`;

  return (
    <div className={wrapClass}>
      {/* HEADER FIJO */}
      <header className="topbar">
        <div className="left">
          <button
            className="icon-btn"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Abrir menú"
            title={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
          >
            <Menu size={20} />
          </button>
          <h1 className="brand">Sistema de Condominio</h1>
        </div>

        <div className="right">
          <div className="date">
            <Calendar size={16} />
            <span>Septiembre 2025</span>
          </div>
          <div className="notif">
            <Bell size={18} />
          </div>
          <div className="user">
            <div className="avatar">
              <img
                src={miFoto}
                alt="Usuario"
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            </div>
            <button className="logout" onClick={handleLogout} title="Cerrar sesión">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        logoSrc={miFoto}
      />

      {/* CONTENIDO */}
      <div className="main">
        <div className="content">
          {activeSection === "dashboard" ? (
            <>
              {/* TARJETAS KPI */}
              <section className="cards">
                {stats.map((s, i) => (
                  <article className="card" key={i}>
                    <div className="card-info">
                      <p className="card-title">{s.title}</p>
                      <p className="card-value">{s.value}</p>
                      <p className={`card-change ${s.change.includes("-") ? "down" : "up"}`}>
                        {s.change} vs anterior
                      </p>
                    </div>
                    <div className="card-icon">
                      <div className="icon-box">
                        <TrendingUp size={16} color="#1e40af" />
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              {/* ACTIVIDAD + NOTIFICACIONES */}
              <section className="rows-2">
                <div className="block">
                  <div className="block-head">Actividad Reciente</div>
                  <div className="block-body">
                    {activity.map((a, idx) => (
                      <div className="row" key={idx}>
                        <span
                          className={`dot ${
                            a.status === "success" ? "green" : a.status === "pending" ? "orange" : "blue"
                          }`}
                        />
                        <div>
                          <div className="row-title">{a.action}</div>
                          <div className="row-sub">
                            {a.user} • {a.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="block">
                  <div className="block-head">Notificaciones</div>
                  <div className="block-body">
                    {notifications.map((n) => (
                      <div className="row" key={n.id}>
                        {n.type === "warning" ? (
                          <AlertTriangle size={16} color="#d97706" />
                        ) : n.type === "success" ? (
                          <CheckCircle size={16} color="#059669" />
                        ) : (
                          <Bell size={16} color="#1d4ed8" />
                        )}
                        <div>
                          <div className="row-title">{n.message}</div>
                          <div className="row-sub">Hace {n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          ) : (
            renderSection()
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

