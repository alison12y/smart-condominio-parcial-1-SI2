import React, { useMemo, useState } from "react";
import { Bell, Calendar, User, Edit, Plus, Search } from "lucide-react";
import "../styles/pago.css"; 

export default function PaymentRemindersAdmin() {
  const [activeTab, setActiveTab] = useState("recordatorios");

  const [recordatorios, setRecordatorios] = useState([
    { id: 1, nombre: "Aviso 7 días antes", diasAntes: 7, activo: true, tipo: "preventivo", fechaCreacion: "2024-01-15" },
    { id: 2, nombre: "Aviso día vencimiento", diasAntes: 0, activo: true, tipo: "vencimiento", fechaCreacion: "2024-01-15" },
  ]);

  const [residentes, setResidentes] = useState([
    { id: 1, nombre: "Juan Pérez",  email: "juan.perez@email.com",  telefono: "+1234567890",
      apartamento: "101A", cuotasPendientes: 2, montoTotal: 850000, ultimoPago: "2024-01-10", estado: "moroso" },
    { id: 2, nombre: "María González", email: "maria.gonzalez@email.com", telefono: "+1234567891",
      apartamento: "202B", cuotasPendientes: 1, montoTotal: 425000, ultimoPago: "2024-02-05", estado: "pendiente" },
    { id: 3, nombre: "Carlos Rodríguez", email: "carlos.rodriguez@email.com", telefono: "+1234567892",
      apartamento: "303C", cuotasPendientes: 0, montoTotal: 0, ultimoPago: "2024-02-15", estado: "al_dia" },
  ]);

  const [notificaciones, setNotificaciones] = useState([
    { id: 1, residenteId: 1, recordatorioId: 1, fechaEnvio: "2024-02-08", estado: "enviado", tipo: "email", mensaje: "Recordatorio: Su cuota vence en 7 días" },
    { id: 2, residenteId: 2, recordatorioId: 2, fechaEnvio: "2024-02-15", estado: "pendiente", tipo: "push",  mensaje: "Su cuota vence hoy" },
  ]);

  // formularios
  const [showRecordatorioForm, setShowRecordatorioForm] = useState(false);
  const [showResidenteForm, setShowResidenteForm] = useState(false);
  const [editingRecordatorio, setEditingRecordatorio] = useState(null);
  const [editingResidente, setEditingResidente] = useState(null);

  const [recordatorioForm, setRecordatorioForm] = useState({ nombre: "", diasAntes: "", activo: true, tipo: "preventivo" });
  const [residenteForm, setResidenteForm] = useState({ nombre: "", email: "", telefono: "", apartamento: "", cuotasPendientes: 0, montoTotal: 0 });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");

  const estadoFromCuotas = (n) => (n > 1 ? "moroso" : n === 1 ? "pendiente" : "al_dia");
  const badgeClassByEstado = (e) =>
    e === "al_dia" ? "ad-badge-success" : e === "pendiente" ? "ad-badge-warn" : "ad-badge-danger";

  // ---- CRUD recordatorios
  const handleSaveRecordatorio = () => {
    if (!recordatorioForm.nombre || recordatorioForm.diasAntes === "") {
      alert("Debe establecer al menos un nombre y días de aviso");
      return;
    }
    if (editingRecordatorio) {
      setRecordatorios((p) =>
        p.map((r) =>
          r.id === editingRecordatorio.id
            ? { ...recordatorioForm, id: r.id, fechaCreacion: editingRecordatorio.fechaCreacion }
            : r
        )
      );
    } else {
      setRecordatorios((p) => [
        ...p,
        { ...recordatorioForm, id: Date.now(), fechaCreacion: new Date().toISOString().split("T")[0] },
      ]);
    }
    setRecordatorioForm({ nombre: "", diasAntes: "", activo: true, tipo: "preventivo" });
    setEditingRecordatorio(null);
    setShowRecordatorioForm(false);
  };
  const handleEditRecordatorio = (r) => { setEditingRecordatorio(r); setRecordatorioForm(r); setShowRecordatorioForm(true); };

  // ---- CRUD residentes
  const handleSaveResidente = () => {
    if (!residenteForm.nombre || !residenteForm.email || !residenteForm.apartamento) {
      alert("Nombre, email y apartamento son campos obligatorios");
      return;
    }
    const estado = estadoFromCuotas(residenteForm.cuotasPendientes);
    if (editingResidente) {
      setResidentes((p) =>
        p.map((r) =>
          r.id === editingResidente.id
            ? { ...residenteForm, id: r.id, estado, ultimoPago: editingResidente.ultimoPago }
            : r
        )
      );
    } else {
      setResidentes((p) => [
        ...p,
        { ...residenteForm, id: Date.now(), estado, ultimoPago: new Date().toISOString().split("T")[0] },
      ]);
    }
    setResidenteForm({ nombre: "", email: "", telefono: "", apartamento: "", cuotasPendientes: 0, montoTotal: 0 });
    setEditingResidente(null);
    setShowResidenteForm(false);
  };
  const handleEditResidente = (r) => { setEditingResidente(r); setResidenteForm(r); setShowResidenteForm(true); };

  // enviar recordatorio
  const handleEnviarRecordatorio = (residenteId, recordatorioId) => {
    const res = residentes.find((x) => x.id === residenteId);
    const rec = recordatorios.find((x) => x.id === recordatorioId);
    if (!res || !rec) return alert("Error: No se encontró el residente o recordatorio");
    if (res.cuotasPendientes === 0) return alert("Este residente no tiene cuotas pendientes");
    setNotificaciones((p) => [
      ...p,
      {
        id: Date.now(),
        residenteId,
        recordatorioId,
        fechaEnvio: new Date().toISOString().split("T")[0],
        estado: "enviado",
        tipo: "email",
        mensaje: `${rec.nombre} - Cuotas pendientes: ${res.cuotasPendientes}`,
      },
    ]);
    alert(`✅ Recordatorio "${rec.nombre}" enviado a ${res.nombre}`);
  };

  // filtros
  const residentesFiltrados = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return residentes.filter((r) => {
      const matchSearch = r.nombre.toLowerCase().includes(q) || r.apartamento.toLowerCase().includes(q);
      const matchEstado = filterEstado === "todos" || r.estado === filterEstado;
      return matchSearch && matchEstado;
    });
  }, [residentes, searchTerm, filterEstado]);

  return (
    <div className="ad-card">
      {/* Header */}
      <div className="ad-row-between ad-mb-16 ad-border-bottom">
        <div className="ad-row-8">
          <Bell className="ad-ico-20 ad-primary" />
          <div>
            <h2 className="ad-h2">Sistema de Recordatorios de Pago</h2>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="ad-tabs">
        {[
          { id: "recordatorios", label: "Recordatorios", icon: Calendar },
          { id: "residentes", label: "Residentes", icon: User },
          { id: "notificaciones", label: "Notificaciones", icon: Bell },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              className={active ? "ad-tab ad-tab-active" : "ad-tab"}
              onClick={() => setActiveTab(t.id)}
              type="button"
            >
              <Icon className="ad-ico-16" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* CONTENIDO */}
      <div className="ad-section">
        {/* Recordatorios */}
        {activeTab === "recordatorios" && (
          <>
            <div className="ad-row-between ad-mb-16">
              <h3 className="ad-h3">Gestión de Recordatorios</h3>
              <button className="ad-btn ad-btn-primary" onClick={() => setShowRecordatorioForm(true)} type="button">
                <Plus className="ad-ico-14" /> Nuevo Recordatorio
              </button>
            </div>

            {showRecordatorioForm && (
              <div className="ad-panel ad-mb-16">
                <h4 className="ad-h4 ad-mb-12">{editingRecordatorio ? "Editar Recordatorio" : "Nuevo Recordatorio"}</h4>
                <div className="ad-grid-2 ad-gap-12">
                  <input className="ad-input" placeholder="Nombre del recordatorio"
                    value={recordatorioForm.nombre} onChange={(e) => setRecordatorioForm((p) => ({ ...p, nombre: e.target.value }))} />
                  <input className="ad-input" type="number" placeholder="Días antes del vencimiento"
                    value={recordatorioForm.diasAntes} onChange={(e) => setRecordatorioForm((p) => ({ ...p, diasAntes: parseInt(e.target.value) || 0 }))} />
                  <select className="ad-input" value={recordatorioForm.tipo} onChange={(e) => setRecordatorioForm((p) => ({ ...p, tipo: e.target.value }))}>
                    <option value="preventivo">Preventivo</option>
                    <option value="vencimiento">Vencimiento</option>
                    <option value="mora">Mora</option>
                  </select>
                  <label className="ad-row-8">
                    <input type="checkbox" checked={recordatorioForm.activo}
                      onChange={(e) => setRecordatorioForm((p) => ({ ...p, activo: e.target.checked }))} />
                    Activo
                  </label>
                </div>
                <div className="ad-row-8 ad-mt-12">
                  <button className="ad-btn ad-btn-success" onClick={handleSaveRecordatorio} type="button">Guardar</button>
                  <button className="ad-btn ad-btn-secondary" onClick={() => { setShowRecordatorioForm(false); setEditingRecordatorio(null); }} type="button">Cancelar</button>
                </div>
              </div>
            )}

            <div className="ad-stack-12">
              {recordatorios.map((r) => (
                <div key={r.id} className="ad-card-row">
                  <div>
                    <div className="ad-text-strong">{r.nombre}</div>
                    <div className="ad-text-dim ad-text-sm">{r.diasAntes} días antes — Tipo: {r.tipo}</div>
                    <span className={`ad-badge ${r.activo ? "ad-badge-success" : "ad-badge-danger"} ad-mt-8`}>{r.activo ? "Activo" : "Inactivo"}</span>
                  </div>
                  <button className="ad-icon-btn ad-blue" onClick={() => handleEditRecordatorio(r)} title="Editar">
                    <Edit className="ad-ico-14" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Residentes */}
        {activeTab === "residentes" && (
          <>
            <div className="ad-row-between ad-mb-16">
              <h3 className="ad-h3">Gestión de Residentes</h3>
              <button className="ad-btn ad-btn-primary" onClick={() => setShowResidenteForm(true)} type="button">
                <Plus className="ad-ico-14" /> Nuevo Residente
              </button>
            </div>

            {/* filtros */}
            <div className="ad-row-12 ad-mb-16">
              <div className="ad-input-icon ad-flex-1">
                <Search className="ad-ico-14 ad-text-dim" />
                <input className="ad-input" placeholder="Buscar por nombre o apartamento..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <select className="ad-input" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                <option value="todos">Todos los estados</option>
                <option value="al_dia">Al día</option>
                <option value="pendiente">Pendiente</option>
                <option value="moroso">Moroso</option>
              </select>
            </div>

            {showResidenteForm && (
              <div className="ad-panel ad-mb-16">
                <h4 className="ad-h4 ad-mb-12">{editingResidente ? "Editar Residente" : "Nuevo Residente"}</h4>
                <div className="ad-grid-2 ad-gap-12">
                  <input className="ad-input" placeholder="Nombre completo" value={residenteForm.nombre}
                    onChange={(e) => setResidenteForm((p) => ({ ...p, nombre: e.target.value }))} />
                  <input className="ad-input" placeholder="Email" value={residenteForm.email}
                    onChange={(e) => setResidenteForm((p) => ({ ...p, email: e.target.value }))} />
                  <input className="ad-input" placeholder="Teléfono" value={residenteForm.telefono}
                    onChange={(e) => setResidenteForm((p) => ({ ...p, telefono: e.target.value }))} />
                  <input className="ad-input" placeholder="Apartamento" value={residenteForm.apartamento}
                    onChange={(e) => setResidenteForm((p) => ({ ...p, apartamento: e.target.value }))} />
                  <input className="ad-input" type="number" placeholder="Cuotas pendientes" value={residenteForm.cuotasPendientes}
                    onChange={(e) => setResidenteForm((p) => ({ ...p, cuotasPendientes: parseInt(e.target.value) || 0 }))} />
                  <input className="ad-input" type="number" placeholder="Monto total adeudado" value={residenteForm.montoTotal}
                    onChange={(e) => setResidenteForm((p) => ({ ...p, montoTotal: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="ad-row-8 ad-mt-12">
                  <button className="ad-btn ad-btn-success" onClick={handleSaveResidente} type="button">Guardar</button>
                  <button className="ad-btn ad-btn-secondary" onClick={() => { setShowResidenteForm(false); setEditingResidente(null); }} type="button">Cancelar</button>
                </div>
              </div>
            )}

            <div className="ad-stack-12">
              {residentesFiltrados.map((r) => (
                <div key={r.id} className="ad-card">
                  <div className="ad-row-between ad-mb-8">
                    <div>
                      <div className="ad-text-strong">{r.nombre}</div>
                      <div className="ad-text-sm ad-text-dim">Apartamento: {r.apartamento}</div>
                      <div className="ad-text-sm ad-text-dim">{r.email}</div>
                    </div>
                    <span className={`ad-badge ${badgeClassByEstado(r.estado)}`}>
                      {r.estado === "al_dia" ? "Al día" : r.estado === "pendiente" ? "Pendiente" : "Moroso"}
                    </span>
                  </div>

                  <div className="ad-row-between">
                    <div className="ad-text-sm">
                      <span className="ad-text-strong">Cuotas pendientes: </span>
                      <span className={r.cuotasPendientes > 0 ? "ad-danger" : "ad-success"}>{r.cuotasPendientes}</span>
                      {r.montoTotal > 0 && <span className="ad-text-dim ad-ml-8">Monto: ${r.montoTotal.toLocaleString()}</span>}
                    </div>

                    <div className="ad-row-8">
                      {r.cuotasPendientes > 0 && (
                        <select
                          className="ad-select-warn"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleEnviarRecordatorio(r.id, parseInt(e.target.value));
                              e.target.value = "";
                            }
                          }}
                        >
                          <option value="" disabled>📧 Enviar Recordatorio</option>
                          {recordatorios.filter((x) => x.activo).map((x) => (
                            <option key={x.id} value={x.id}>{x.nombre}</option>
                          ))}
                        </select>
                      )}
                      <button className="ad-icon-btn ad-blue" onClick={() => handleEditResidente(r)} title="Editar">
                        <Edit className="ad-ico-14" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Notificaciones */}
        {activeTab === "notificaciones" && (
          <>
            <h3 className="ad-h3 ad-mb-16">Historial de Notificaciones</h3>
            <div className="ad-stack-12">
              {notificaciones.map((n) => {
                const res = residentes.find((r) => r.id === n.residenteId);
                const rec = recordatorios.find((r) => r.id === n.recordatorioId);
                return (
                  <div key={n.id} className="ad-card">
                    <div className="ad-row-between">
                      <div>
                        <div className="ad-text-strong">{res?.nombre}</div>
                        <div className="ad-text-sm ad-text-dim">Apartamento: {res?.apartamento}</div>
                        <div className="ad-text-sm ad-text-dim">Tipo: {rec?.nombre}</div>
                        <div className="ad-text-sm ad-text-dim ad-mt-8">{n.mensaje}</div>
                      </div>
                      <div className="ad-right">
                        <span className={`ad-badge ${n.estado === "enviado" ? "ad-badge-success" : "ad-badge-warn"}`}>{n.estado}</span>
                        <div className="ad-text-sm ad-text-dim ad-mt-4">{n.fechaEnvio}</div>
                        <div className="ad-text-xs ad-text-dim">{n.tipo}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}