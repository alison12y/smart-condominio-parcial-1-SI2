import React, { useMemo, useState } from "react";
import "../styles/Preventivo.css";

/**
 * Interfaz: Mantenimiento Preventivo (IA)
 * - React puro + CSS puro (sin librerías)
 * - Flujo: Historial → Análisis (IA) → Sugerencias → Plan → Ejecución
 * - Maneja excepciones:
 *   • Sin historial: “No hay datos suficientes para generar recomendaciones”.
 *   • Error IA: “No se pudo procesar la predicción, intente otra vez”.
 *   • Fallo al asignar: “No se pudo programar el mantenimiento”.
 */

// Datos demo
const initialHistory = [
  { id: 1, equipo: "Ascensor A", categoria: "Ascensores", fecha: "2025-07-12", tipo: "Reparación", descripcion: "Cambio de cable de tracción" },
  { id: 2, equipo: "Bomba de agua 1", categoria: "Hidraulico", fecha: "2025-06-03", tipo: "Mantenimiento", descripcion: "Cambio de sello mecánico" },
  { id: 3, equipo: "Generador", categoria: "Electrico", fecha: "2025-05-20", tipo: "Reparación", descripcion: "Reparación de AVR" },
  { id: 4, equipo: "Ascensor B", categoria: "Ascensores", fecha: "2025-04-14", tipo: "Mantenimiento", descripcion: "Lubricación de guías" },
  { id: 5, equipo: "Portón Vehicular", categoria: "Accesos", fecha: "2025-04-01", tipo: "Reparación", descripcion: "Cambio de motor" },
];

const personal = [
  { id: 1, nombre: "Carlos López", especialidad: "Electrico" },
  { id: 2, nombre: "Ana Rivas", especialidad: "Hidraulico" },
  { id: 3, nombre: "Luis Pérez", especialidad: "Ascensores" },
  { id: 4, nombre: "Marta Díaz", especialidad: "Accesos" },
];

const pasos = ["Historial", "Análisis (IA)", "Sugerencias", "Plan", "Ejecución"];

// helper para CSS modifiers sin tildes/espacios
function slug(s) {
  return String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function badgeByProb(p) {
  if (p >= 75) return "pm-badge--danger";
  if (p >= 55) return "pm-badge--warning";
  return "pm-badge--ok";
}

export default function PreventiveMaintenance() {
  const [step, setStep] = useState(0); // 0..4
  const [historial, setHistorial] = useState(initialHistory);
  const [simularErrorIA, setSimularErrorIA] = useState(false);
  const [analisis, setAnalisis] = useState(null); // { riesgos: [...], fecha }
  const [sugerencias, setSugerencias] = useState([]); // [{ id, equipo, tarea, prioridad, categoria, probFalla }]
  const [seleccionadas, setSeleccionadas] = useState([]); // ids de sugerencias
  const [asignaciones, setAsignaciones] = useState({}); // sugerenciaId -> personalId
  const [plan, setPlan] = useState([]); // tareas programadas
  const [ejecucion, setEjecucion] = useState([]); // [{ id, estado }]
  const [mensaje, setMensaje] = useState(null); // {tipo: success|warning|error, texto}

  const noHayHistorial = historial.length === 0;

  // Métricas para tarjetas
  const stats = useMemo(() => {
    const porCategoria = historial.reduce((acc, h) => {
      acc[h.categoria] = (acc[h.categoria] || 0) + 1;
      return acc;
    }, {});
    const total = historial.length;
    const top = Object.entries(porCategoria)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([categoria, conteo]) => ({ categoria, conteo }));
    return { total, porCategoria, top };
  }, [historial]);

  // IA (mock simple): mayor frecuencia por categoría = mayor prob. de falla
  function handleAnalizar() {
    setMensaje(null);

    if (noHayHistorial) {
      setAnalisis(null);
      setMensaje({ tipo: "warning", texto: "No hay datos suficientes para generar recomendaciones." });
      return;
    }

    if (simularErrorIA) {
      setAnalisis(null);
      setMensaje({ tipo: "error", texto: "No se pudo procesar la predicción, intente otra vez." });
      return;
    }

    const freqCat = historial.reduce((acc, h) => {
      acc[h.categoria] = (acc[h.categoria] || 0) + 1;
      return acc;
    }, {});

    const riesgosMap = {};
    for (const h of historial) {
      const base = 40 + Math.min(50, (freqCat[h.categoria] - 1) * 10); // 40% + 10% por ocurrencia extra (tope 90%)
      const key = h.equipo;
      if (!riesgosMap[key]) {
        riesgosMap[key] = { equipo: h.equipo, categoria: h.categoria, probFalla: base, ultima: h.fecha };
      } else {
        riesgosMap[key].probFalla = Math.max(riesgosMap[key].probFalla, base);
        riesgosMap[key].ultima = h.fecha; // última aparición
      }
    }

    const riesgos = Object.values(riesgosMap).sort((a, b) => b.probFalla - a.probFalla);

    const sugerenciasGeneradas = riesgos.slice(0, 6).map((r, idx) => ({
      id: idx + 1,
      equipo: r.equipo,
      categoria: r.categoria,
      probFalla: Math.round(r.probFalla),
      prioridad: r.probFalla >= 75 ? "Alta" : r.probFalla >= 55 ? "Media" : "Baja",
      tarea: sugerirTarea(r.categoria),
    }));

    setAnalisis({ fecha: new Date().toISOString(), riesgos });
    setSugerencias(sugerenciasGeneradas);
    setSeleccionadas([]);
    setStep(2); // Sugerencias
  }

  function sugerirTarea(categoria) {
    const mapa = {
      Ascensores: "Inspección de cables y prueba de frenos",
      Hidraulico: "Revisión de sellos y presión de bombas",
      Electrico: "Prueba de aislamiento y limpieza de tableros",
      Accesos: "Calibración de motores y engrase de rieles",
    };
    return mapa[categoria] || "Inspección general preventiva";
  }

  function toggleSeleccion(id) {
    setSeleccionadas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function programarPlan() {
    setMensaje(null);
    try {
      if (seleccionadas.length === 0) {
        setMensaje({ tipo: "warning", texto: "Seleccione al menos una tarea recomendada." });
        return;
      }
      for (const sid of seleccionadas) {
        if (!asignaciones[sid]) {
          setMensaje({ tipo: "warning", texto: "Falta asignar personal a todas las tareas." });
          return;
        }
      }

      const nuevoPlan = seleccionadas.map((sid) => {
        const sug = sugerencias.find((s) => s.id === sid);
        const per = personal.find((p) => p.id === Number(asignaciones[sid]));
        return {
          id: `P-${sid}`,
          equipo: sug.equipo,
          tarea: sug.tarea,
          prioridad: sug.prioridad,
          asignadoA: per?.nombre,
          especialidad: per?.especialidad,
          estado: "Programado",
        };
      });

      setPlan(nuevoPlan);
      setEjecucion(nuevoPlan.map((p) => ({ id: p.id, estado: "Programado" })));
      setStep(4); // Ejecución
      setMensaje({ tipo: "success", texto: "Plan de mantenimiento programado correctamente." });
    } catch {
      setMensaje({ tipo: "error", texto: "No se pudo programar el mantenimiento." });
    }
  }

  function marcarCompletado(id) {
    setEjecucion((prev) => prev.map((t) => (t.id === id ? { ...t, estado: "Completado" } : t)));
  }

  return (
    <div className="pm-container">
      <header className="pm-header">
        <div>
          <h1>Mantenimiento preventivo (IA)</h1>
          <p className="pm-sub">Propósito: Predecir y sugerir reparaciones preventivas para evitar fallas mayores.</p>
        </div>
        <div className="pm-user">
          <span className="pm-badge pm-badge--admin">Administrador</span>
        </div>
      </header>

      <ol className="pm-steps">
        {pasos.map((p, i) => (
          <li key={p} className={`pm-step ${i === step ? "is-active" : i < step ? "is-done" : ""}`}>
            <button onClick={() => setStep(i)}>{i + 1}. {p}</button>
          </li>
        ))}
      </ol>

      {mensaje && <div className={`pm-alert pm-alert--${mensaje.tipo}`}>{mensaje.texto}</div>}

      {/* Paso 1: Historial */}
      {step === 0 && (
        <section className="pm-card">
          <div className="pm-card__header">
            <h2>Historial de mantenimientos</h2>
            <div className="pm-actions">
              <button className="pm-btn" onClick={() => setHistorial([])}>Vaciar historial (demo)</button>
              <button className="pm-btn pm-btn--ghost" onClick={() => setHistorial(initialHistory)}>Restaurar demo</button>
              <button className="pm-btn pm-btn--primary" onClick={() => setStep(1)}>Ir a Análisis (IA)</button>
            </div>
          </div>

          <div className="pm-grid">
            <div className="pm-stat">
              <span className="pm-stat__label">Registros totales</span>
              <span className="pm-stat__value">{stats.total}</span>
            </div>
            {stats.top.map((t) => (
              <div key={t.categoria} className="pm-stat">
                <span className="pm-stat__label">{t.categoria}</span>
                <span className="pm-stat__value">{t.conteo}</span>
              </div>
            ))}
          </div>

          <table className="pm-table">
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Categoría</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h) => (
                <tr key={h.id}>
                  <td>{h.equipo}</td>
                  <td><span className={`pm-chip pm-chip--${slug(h.categoria)}`}>{h.categoria}</span></td>
                  <td>{h.fecha}</td>
                  <td>{h.tipo}</td>
                  <td>{h.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Paso 2: Análisis IA */}
      {step === 1 && (
        <section className="pm-card">
          <div className="pm-card__header">
            <h2>Análisis del historial con IA</h2>
            <div className="pm-actions">
              <label className="pm-switch">
                <input type="checkbox" checked={simularErrorIA} onChange={(e) => setSimularErrorIA(e.target.checked)} />
                <span>Simular error de IA</span>
              </label>
              <button className="pm-btn pm-btn--primary" onClick={handleAnalizar}>Analizar</button>
            </div>
          </div>

          {!analisis && (
            <p className="pm-muted">
              Ejecute el análisis para generar sugerencias.
              {noHayHistorial && " (No hay historial: cargue o restaure datos)"}
            </p>
          )}

          {analisis && (
            <div className="pm-grid">
              {analisis.riesgos.map((r) => (
                <div key={r.equipo} className="pm-tile">
                  <div className="pm-tile__top">
                    <strong>{r.equipo}</strong>
                    <span className={`pm-badge ${badgeByProb(r.probFalla)}`}>{Math.round(r.probFalla)}%</span>
                  </div>
                  <div className="pm-tile__meta">
                    <span className={`pm-chip pm-chip--${slug(r.categoria)}`}>{r.categoria}</span>
                    <span className="pm-muted">Última: {r.ultima}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Paso 3: Sugerencias */}
      {step === 2 && (
        <section className="pm-card">
          <div className="pm-card__header">
            <h2>Sugerencias de mantenimiento preventivo</h2>
            <div className="pm-actions">
              <button className="pm-btn" onClick={() => setStep(1)}>Volver a Análisis</button>
              <button className="pm-btn pm-btn--primary" onClick={() => setStep(3)}>Continuar</button>
            </div>
          </div>

          {sugerencias.length === 0 ? (
            <p className="pm-muted">No hay sugerencias disponibles.</p>
          ) : (
            <table className="pm-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Equipo</th>
                  <th>Categoría</th>
                  <th>Tarea</th>
                  <th>Prob. Falla</th>
                  <th>Prioridad</th>
                </tr>
              </thead>
              <tbody>
                {sugerencias.map((s) => (
                  <tr key={s.id} className={seleccionadas.includes(s.id) ? "is-selected" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={seleccionadas.includes(s.id)}
                        onChange={() => toggleSeleccion(s.id)}
                      />
                    </td>
                    <td>{s.equipo}</td>
                    <td><span className={`pm-chip pm-chip--${slug(s.categoria)}`}>{s.categoria}</span></td>
                    <td>{s.tarea}</td>
                    <td><span className={`pm-badge ${badgeByProb(s.probFalla)}`}>{s.probFalla}%</span></td>
                    <td><span className={`pm-badge pm-badge--${s.prioridad.toLowerCase()}`}>{s.prioridad}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* Paso 4: Plan */}
      {step === 3 && (
        <section className="pm-card">
          <div className="pm-card__header">
            <h2>Generar plan de mantenimiento</h2>
            <div className="pm-actions">
              <button className="pm-btn" onClick={() => setStep(2)}>Volver a Sugerencias</button>
              <button className="pm-btn pm-btn--primary" onClick={programarPlan}>Programar</button>
            </div>
          </div>

          {seleccionadas.length === 0 && <p className="pm-muted">Seleccione tareas en la etapa anterior para programarlas.</p>}

          {seleccionadas.length > 0 && (
            <table className="pm-table">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Tarea</th>
                  <th>Prioridad</th>
                  <th>Asignar a</th>
                </tr>
              </thead>
              <tbody>
                {seleccionadas.map((sid) => {
                  const s = sugerencias.find((x) => x.id === sid);
                  return (
                    <tr key={sid}>
                      <td>{s.equipo}</td>
                      <td>{s.tarea}</td>
                      <td><span className={`pm-badge pm-badge--${s.prioridad.toLowerCase()}`}>{s.prioridad}</span></td>
                      <td>
                        <select
                          className="pm-select"
                          value={asignaciones[sid] || ""}
                          onChange={(e) => setAsignaciones({ ...asignaciones, [sid]: e.target.value })}
                        >
                          <option value="" disabled>Seleccionar personal…</option>
                          {personal.map((p) => (
                            <option key={p.id} value={p.id}>{p.nombre} — {p.especialidad}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* Paso 5: Ejecución */}
      {step === 4 && (
        <section className="pm-card">
          <div className="pm-card__header">
            <h2>Ejecución del mantenimiento</h2>
            <div className="pm-actions">
              <button className="pm-btn" onClick={() => setStep(3)}>Volver al Plan</button>
            </div>
          </div>

          {plan.length === 0 ? (
            <p className="pm-muted">Aún no hay tareas programadas.</p>
          ) : (
            <div className="pm-list">
              {plan.map((t) => {
                const estado = ejecucion.find((e) => e.id === t.id)?.estado || t.estado;
                return (
                  <div key={t.id} className="pm-item">
                    <div className="pm-item__main">
                      <strong>{t.equipo}</strong>
                      <span className="pm-muted">{t.tarea}</span>
                    </div>
                    <div className="pm-item__meta">
                      <span className={`pm-badge pm-badge--${t.prioridad.toLowerCase()}`}>{t.prioridad}</span>
                      <span className={`pm-badge ${estado === "Completado" ? "pm-badge--ok" : "pm-badge--info"}`}>{estado}</span>
                      <span className="pm-assignee">{t.asignadoA} <em>({t.especialidad})</em></span>
                      {estado !== "Completado" && (
                        <button className="pm-btn pm-btn--success" onClick={() => marcarCompletado(t.id)}>
                          Marcar completado
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      <footer className="pm-footer">
        <small>Post condición: Las tareas quedan registradas y asociadas a un plan para reducir fallas futuras.</small>
      </footer>
    </div>
  );
}