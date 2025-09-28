import React, { useState } from "react";
import {
  AlertTriangle,
  Users,
  TrendingUp,
  FileText,
  Download,
  Send,
  Calendar,
  Clock,
} from "lucide-react";
import "../styles/Predicion-Morosidad.css"; // <-- CSS separado

const PrediccionMorosidad = () => {
  const [currentStep, setCurrentStep] = useState("config");
  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    unidades: "todas",
    monto: "",
    frecuenciaAtraso: "",
    multas: false,
  });
  const [loading, setLoading] = useState(false);
  const [selectedResidents, setSelectedResidents] = useState([]);
  const [showDetail, setShowDetail] = useState(null);

  // Datos simulados
  const residentesPredicion = [
    {
      id: 1,
      nombre: "María González",
      unidad: "Torre A - Apt 301",
      riesgo: "Alto",
      probabilidad: 85,
      pagosAtrasados: 3,
      montoDeuda: 2500,
      ultimoPago: "2024-08-15",
      tendencia: "Empeorando",
      historial: [
        { mes: "Ene", estado: "Puntual" },
        { mes: "Feb", estado: "Atrasado" },
        { mes: "Mar", estado: "Atrasado" },
        { mes: "Abr", estado: "Atrasado" },
      ],
    },
    {
      id: 2,
      nombre: "Carlos Mendoza",
      unidad: "Torre B - Apt 205",
      riesgo: "Alto",
      probabilidad: 78,
      pagosAtrasados: 2,
      montoDeuda: 1800,
      ultimoPago: "2024-09-05",
      tendencia: "Estable",
      historial: [
        { mes: "Ene", estado: "Puntual" },
        { mes: "Feb", estado: "Puntual" },
        { mes: "Mar", estado: "Atrasado" },
        { mes: "Abr", estado: "Atrasado" },
      ],
    },
    {
      id: 3,
      nombre: "Ana Rodríguez",
      unidad: "Torre A - Apt 105",
      riesgo: "Medio",
      probabilidad: 45,
      pagosAtrasados: 1,
      montoDeuda: 850,
      ultimoPago: "2024-09-20",
      tendencia: "Mejorando",
      historial: [
        { mes: "Ene", estado: "Atrasado" },
        { mes: "Feb", estado: "Puntual" },
        { mes: "Mar", estado: "Puntual" },
        { mes: "Abr", estado: "Puntual" },
      ],
    },
    {
      id: 4,
      nombre: "Roberto Silva",
      unidad: "Torre C - Apt 402",
      riesgo: "Bajo",
      probabilidad: 15,
      pagosAtrasados: 0,
      montoDeuda: 0,
      ultimoPago: "2024-09-25",
      tendencia: "Estable",
      historial: [
        { mes: "Ene", estado: "Puntual" },
        { mes: "Feb", estado: "Puntual" },
        { mes: "Mar", estado: "Puntual" },
        { mes: "Abr", estado: "Puntual" },
      ],
    },
  ];

  const handleFilterChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const ejecutarPrediccion = () => {
    if (!filters.fechaInicio || !filters.fechaFin) {
      alert("Debe seleccionar al menos un criterio para ejecutar la predicción.");
      return;
    }
    if (new Date(filters.fechaInicio) >= new Date(filters.fechaFin)) {
      alert("La fecha de inicio debe ser anterior a la fecha de fin.");
      return;
    }
    setLoading(true);
    setCurrentStep("processing");
    setTimeout(() => {
      setLoading(false);
      setCurrentStep("results");
    }, 3000);
  };

  const toggleResidentSelection = (id) =>
    setSelectedResidents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const generarAcciones = () => {
    if (selectedResidents.length === 0) {
      alert("Seleccione al menos un residente para generar acciones.");
      return;
    }
    const elegidos = residentesPredicion.filter((r) =>
      selectedResidents.includes(r.id)
    );
    const acciones = elegidos.map((r) => {
      const tipo =
        r.riesgo === "Alto"
          ? "Plan de Pago Urgente"
          : r.riesgo === "Medio"
          ? "Recordatorio de Pago"
          : "Notificación Preventiva";
      return { residente: r.nombre, accion: tipo };
    });
    const mensaje =
      `✅ ACCIONES GENERADAS:\n\n` +
      acciones.map((a) => `• ${a.residente}: ${a.accion}`).join("\n") +
      `\n\n📧 Se han programado ${acciones.length} notificaciones automáticas\n` +
      `📅 Fecha de registro: ${new Date().toLocaleDateString()}`;
    alert(mensaje);
    setSelectedResidents([]);
  };

  const exportarResultados = (formato) => {
    const datos = residentesPredicion.map((r) => ({
      Residente: r.nombre,
      Unidad: r.unidad,
      "Nivel de Riesgo": r.riesgo,
      "Probabilidad (%)": r.probabilidad,
      "Pagos Atrasados": r.pagosAtrasados,
      "Deuda Actual": `${r.montoDeuda.toLocaleString()}`,
      "Último Pago": r.ultimoPago,
      Tendencia: r.tendencia,
    }));

    if (formato === "PDF") {
      const txt =
        `REPORTE DE PREDICCIÓN DE MOROSIDAD\n` +
        `Fecha: ${new Date().toLocaleDateString()}\n\n` +
        `RESUMEN:\n` +
        `• Riesgo Alto: ${residentesPredicion.filter((r) => r.riesgo === "Alto").length}\n` +
        `• Riesgo Medio: ${residentesPredicion.filter((r) => r.riesgo === "Medio").length}\n` +
        `• Riesgo Bajo: ${residentesPredicion.filter((r) => r.riesgo === "Bajo").length}\n\n` +
        `DETALLE:\n` +
        datos
          .map(
            (d) =>
              `${d.Residente} (${d.Unidad}) - ${d["Nivel de Riesgo"]} (${d["Probabilidad (%)"]}%)`
          )
          .join("\n");
      const blob = new Blob([txt], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prediccion_morosidad_${new Date()
        .toISOString()
        .split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("📄 Reporte PDF (TXT) generado y descargado.");
    } else {
      // CSV
      const headers = Object.keys(datos[0]).join(",");
      const rows = datos
        .map((row) => Object.values(row).map((v) => `"${v}"`).join(","))
        .join("\n");
      const csv = headers + "\n" + rows;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prediccion_morosidad_${new Date()
        .toISOString()
        .split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("📊 Reporte Excel (CSV) generado y descargado.");
    }
  };

  const riesgoClass = (r) =>
    r === "Alto"
      ? "pm-badge pm-badge--alto"
      : r === "Medio"
      ? "pm-badge pm-badge--medio"
      : "pm-badge pm-badge--bajo";

  return (
    <div className="pm-page">
      {/* Header */}
      <div className="pm-card pm-header">
        <h1 className="pm-h1">
          <TrendingUp size={28} />
          <span>Predicción de Morosidad (IA)</span>
        </h1>
        <p className="pm-muted">
          Sistema de análisis predictivo para identificar residentes con riesgo
          de atraso en pagos
        </p>
      </div>

      {/* Steps */}
      <div className="pm-card pm-steps">
        <div className="pm-steps-row">
          {[
            { key: "config", label: "Configuración", icon: <Calendar size={16} /> },
            { key: "processing", label: "Procesamiento", icon: <Clock size={16} /> },
            { key: "results", label: "Resultados", icon: <FileText size={16} /> },
          ].map((s) => (
            <div
              key={s.key}
              className={`pm-step ${currentStep === s.key ? "is-active" : ""}`}
            >
              {s.icon}
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* Paso 1 */}
      {currentStep === "config" && (
        <div className="pm-card">
          <h2 className="pm-h2">Configurar Parámetros del Análisis</h2>

          <div className="pm-grid-2">
            <div>
              <h3 className="pm-h3">Rango de Fechas</h3>
              <div className="pm-row">
                <div className="pm-col">
                  <label className="pm-label">Fecha Inicio:</label>
                  <input
                    type="date"
                    className="pm-input"
                    value={filters.fechaInicio}
                    onChange={(e) =>
                      handleFilterChange("fechaInicio", e.target.value)
                    }
                  />
                </div>
                <div className="pm-col">
                  <label className="pm-label">Fecha Fin:</label>
                  <input
                    type="date"
                    className="pm-input"
                    value={filters.fechaFin}
                    onChange={(e) =>
                      handleFilterChange("fechaFin", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="pm-h3">Conjunto de Unidades</h3>
              <select
                className="pm-input"
                value={filters.unidades}
                onChange={(e) => handleFilterChange("unidades", e.target.value)}
              >
                <option value="todas">Todas las unidades</option>
                <option value="torreA">Torre A</option>
                <option value="torreB">Torre B</option>
                <option value="torreC">Torre C</option>
              </select>
            </div>
          </div>

          <div>
            <h3 className="pm-h3">Criterios Opcionales</h3>
            <div className="pm-grid-3">
              <div>
                <label className="pm-label">Monto mínimo de deuda:</label>
                <input
                  type="number"
                  className="pm-input"
                  placeholder="Ej: 1000"
                  value={filters.monto}
                  onChange={(e) => handleFilterChange("monto", e.target.value)}
                />
              </div>

              <div>
                <label className="pm-label">Frecuencia de atraso:</label>
                <select
                  className="pm-input"
                  value={filters.frecuenciaAtraso}
                  onChange={(e) =>
                    handleFilterChange("frecuenciaAtraso", e.target.value)
                  }
                >
                  <option value="">Sin filtro</option>
                  <option value="1">1+ atrasos</option>
                  <option value="2">2+ atrasos</option>
                  <option value="3">3+ atrasos</option>
                </select>
              </div>

              <div className="pm-checkbox-row">
                <input
                  id="multas"
                  type="checkbox"
                  className="pm-checkbox"
                  checked={filters.multas}
                  onChange={(e) =>
                    handleFilterChange("multas", e.target.checked)
                  }
                />
                <label htmlFor="multas" className="pm-label-inline">
                  Incluir residentes con multas
                </label>
              </div>
            </div>
          </div>

          <div className="pm-actions-center">
            <button className="pm-btn pm-btn--primary" onClick={ejecutarPrediccion}>
              <TrendingUp size={18} />
              Ejecutar Predicción
            </button>
          </div>
        </div>
      )}

      {/* Paso 2 */}
      {currentStep === "processing" && loading && (
        <div className="pm-card pm-center">
          <div className="pm-spinner" />
          <h3 className="pm-h3 mb8">Procesando Modelo de IA</h3>
          <p className="pm-muted">
            Analizando datos históricos de pagos y calculando riesgo de morosidad...
          </p>
        </div>
      )}

      {/* Paso 3 */}
      {currentStep === "results" && (
        <div>
          <div className="pm-stats">
            {[
              { label: "Riesgo Alto", count: 2, color: "alto", icon: <AlertTriangle size={20} /> },
              { label: "Riesgo Medio", count: 1, color: "medio", icon: <AlertTriangle size={20} /> },
              { label: "Riesgo Bajo", count: 1, color: "bajo", icon: <Users size={20} /> },
            ].map((s, i) => (
              <div key={i} className={`pm-stat pm-stat--${s.color}`}>
                <div className={`pm-stat__icon pm-${s.color}`}>{s.icon}</div>
                <h3 className={`pm-stat__value pm-${s.color}`}>{s.count}</h3>
                <p className="pm-muted">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="pm-card">
            <div className="pm-controls">
              <div>
                <h3 className="pm-h3">Acciones sobre Resultados</h3>
                <p className="pm-muted">
                  {selectedResidents.length} residentes seleccionados
                </p>
              </div>

              <div className="pm-control-buttons">
                <button
                  onClick={generarAcciones}
                  disabled={selectedResidents.length === 0}
                  className={`pm-btn ${
                    selectedResidents.length === 0
                      ? "pm-btn--disabled"
                      : "pm-btn--green"
                  }`}
                >
                  <Send size={16} />
                  Generar Recordatorios
                </button>

                <button
                  className="pm-btn pm-btn--purple"
                  onClick={() => exportarResultados("PDF")}
                >
                  <Download size={16} />
                  Exportar PDF
                </button>

                <button
                  className="pm-btn pm-btn--teal"
                  onClick={() => exportarResultados("Excel")}
                >
                  <Download size={16} />
                  Exportar Excel
                </button>
              </div>
            </div>
          </div>

          <div className="pm-list">
            <h3 className="pm-list__title">
              Residentes Clasificados por Riesgo de Morosidad
            </h3>

            {residentesPredicion.map((r) => (
              <div key={r.id} className="pm-item">
                <div className="pm-item__head">
                  <div className="pm-item__left">
                    <input
                      type="checkbox"
                      className="pm-checkbox"
                      checked={selectedResidents.includes(r.id)}
                      onChange={() => toggleResidentSelection(r.id)}
                    />
                    <div>
                      <h4 className="pm-item__name">{r.nombre}</h4>
                      <p className="pm-muted">{r.unidad}</p>
                    </div>
                  </div>

                  <div className="pm-item__right">
                    <div className={riesgoClass(r.riesgo)}>
                      {r.riesgo} - {r.probabilidad}%
                    </div>
                    <button
                      className="pm-btn pm-btn--outline"
                      onClick={() =>
                        setShowDetail(showDetail === r.id ? null : r.id)
                      }
                    >
                      {showDetail === r.id ? "Ocultar" : "Ver Detalle"}
                    </button>
                  </div>
                </div>

                <div className="pm-item__grid">
                  <div>
                    <span className="pm-kv__label">Pagos Atrasados:</span>
                    <p className="pm-kv__value pm-red">{r.pagosAtrasados}</p>
                  </div>
                  <div>
                    <span className="pm-kv__label">Deuda Actual:</span>
                    <p className="pm-kv__value pm-red">
                      ${r.montoDeuda.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="pm-kv__label">Último Pago:</span>
                    <p className="pm-kv__value">{r.ultimoPago}</p>
                  </div>
                  <div>
                    <span className="pm-kv__label">Tendencia:</span>
                    <p
                      className={`pm-kv__value ${
                        r.tendencia === "Empeorando"
                          ? "pm-red"
                          : r.tendencia === "Mejorando"
                          ? "pm-green"
                          : "pm-gray"
                      }`}
                    >
                      {r.tendencia}
                    </p>
                  </div>
                </div>

                {showDetail === r.id && (
                  <div className="pm-detail">
                    <h5 className="pm-h5">
                      Historial de Pagos (Últimos 4 meses)
                    </h5>
                    <div className="pm-tags">
                      {r.historial.map((h, idx) => (
                        <div
                          key={idx}
                          className={`pm-tag ${
                            h.estado === "Puntual" ? "pm-tag--ok" : "pm-tag--late"
                          }`}
                        >
                          {h.mes}: {h.estado}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrediccionMorosidad;