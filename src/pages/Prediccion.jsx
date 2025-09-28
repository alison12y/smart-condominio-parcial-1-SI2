import React, { useState } from 'react';
import { Calendar, Users, DollarSign, TrendingUp, FileText, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import '../styles/prediccion.css';

const MorosidadPrediccionIA = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
    unidades: [],
    montoMinimo: '',
    frecuenciaAtraso: 'all',
    incluirMultas: false
  });
  const [resultados, setResultados] = useState([]);
  const [selectedResidents, setSelectedResidents] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);

  // Datos simulados
  const unidadesDisponibles = [
    { id: 1, nombre: 'Torre A - Apto 101', residente: 'Juan Pérez' },
    { id: 2, nombre: 'Torre A - Apto 102', residente: 'María García' },
    { id: 3, nombre: 'Torre B - Apto 201', residente: 'Carlos López' },
    { id: 4, nombre: 'Torre B - Apto 202', residente: 'Ana Martínez' },
    { id: 5, nombre: 'Torre C - Apto 301', residente: 'Luis Rodríguez' },
    { id: 6, nombre: 'Torre C - Apto 302', residente: 'Sofia Hernández' }
  ];

  const resultadosSimulados = [
    {
      id: 1,
      residente: 'Juan Pérez',
      unidad: 'Torre A - Apto 101',
      riesgo: 'Alto',
      probabilidad: 85,
      pagosAtrasados: 3,
      montoDeuda: 3150,
      ultimoPago: '2024-08-15',
      tendencia: 'Empeorando',
      detalles: {
        historialPagos: [
          { mes: 'Sep 2024', estado: 'Atrasado', dias: 15 },
          { mes: 'Ago 2024', estado: 'Atrasado', dias: 8 },
          { mes: 'Jul 2024', estado: 'Puntual', dias: 0 },
          { mes: 'Jun 2024', estado: 'Atrasado', dias: 12 }
        ]
      }
    },
    {
      id: 2,
      residente: 'María García',
      unidad: 'Torre A - Apto 102',
      riesgo: 'Medio',
      probabilidad: 65,
      pagosAtrasados: 1,
      montoDeuda: 1050,
      ultimoPago: '2024-09-20',
      tendencia: 'Estable',
      detalles: {
        historialPagos: [
          { mes: 'Sep 2024', estado: 'Puntual', dias: 0 },
          { mes: 'Ago 2024', estado: 'Atrasado', dias: 5 },
          { mes: 'Jul 2024', estado: 'Puntual', dias: 0 },
          { mes: 'Jun 2024', estado: 'Puntual', dias: 0 }
        ]
      }
    },
    {
      id: 3,
      residente: 'Carlos López',
      unidad: 'Torre B - Apto 201',
      riesgo: 'Bajo',
      probabilidad: 25,
      pagosAtrasados: 0,
      montoDeuda: 0,
      ultimoPago: '2024-09-25',
      tendencia: 'Mejorando',
      detalles: {
        historialPagos: [
          { mes: 'Sep 2024', estado: 'Puntual', dias: 0 },
          { mes: 'Ago 2024', estado: 'Puntual', dias: 0 },
          { mes: 'Jul 2024', estado: 'Puntual', dias: 0 },
          { mes: 'Jun 2024', estado: 'Puntual', dias: 0 }
        ]
      }
    },
    {
      id: 4,
      residente: 'Ana Martínez',
      unidad: 'Torre B - Apto 202',
      riesgo: 'Alto',
      probabilidad: 78,
      pagosAtrasados: 2,
      montoDeuda: 2100,
      ultimoPago: '2024-08-28',
      tendencia: 'Empeorando',
      detalles: {
        historialPagos: [
          { mes: 'Sep 2024', estado: 'Atrasado', dias: 22 },
          { mes: 'Ago 2024', estado: 'Puntual', dias: 0 },
          { mes: 'Jul 2024', estado: 'Atrasado', dias: 7 },
          { mes: 'Jun 2024', estado: 'Puntual', dias: 0 }
        ]
      }
    },
    {
      id: 5,
      residente: 'Luis Rodríguez',
      unidad: 'Torre C - Apto 301',
      riesgo: 'Medio',
      probabilidad: 45,
      pagosAtrasados: 1,
      montoDeuda: 525,
      ultimoPago: '2024-09-18',
      tendencia: 'Estable',
      detalles: {
        historialPagos: [
          { mes: 'Sep 2024', estado: 'Puntual', dias: 0 },
          { mes: 'Ago 2024', estado: 'Puntual', dias: 0 },
          { mes: 'Jul 2024', estado: 'Atrasado', dias: 3 },
          { mes: 'Jun 2024', estado: 'Puntual', dias: 0 }
        ]
      }
    },
    {
      id: 6,
      residente: 'Sofia Hernández',
      unidad: 'Torre C - Apto 302',
      riesgo: 'Bajo',
      probabilidad: 15,
      pagosAtrasados: 0,
      montoDeuda: 0,
      ultimoPago: '2024-09-26',
      tendencia: 'Excelente',
      detalles: {
        historialPagos: [
          { mes: 'Sep 2024', estado: 'Puntual', dias: 0 },
          { mes: 'Ago 2024', estado: 'Puntual', dias: 0 },
          { mes: 'Jul 2024', estado: 'Puntual', dias: 0 },
          { mes: 'Jun 2024', estado: 'Puntual', dias: 0 }
        ]
      }
    }
  ];

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleUnidadToggle = (unidadId) => {
    setFilters(prev => ({
      ...prev,
      unidades: prev.unidades.includes(unidadId)
        ? prev.unidades.filter(id => id !== unidadId)
        : [...prev.unidades, unidadId]
    }));
  };

  const validateFilters = () => {
    if (!filters.fechaInicio || !filters.fechaFin) {
      return 'Debe seleccionar un rango de fechas válido.';
    }
    if (filters.unidades.length === 0) {
      return 'Debe seleccionar al menos una unidad para el análisis.';
    }
    return '';
  };

  const ejecutarPrediccion = async () => {
    const validationError = validateFilters();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (Math.random() < 0.1) {
      setError('No hay información histórica suficiente para realizar la predicción.');
      setLoading(false);
      return;
    }

    const resultadosFiltrados = resultadosSimulados.filter(r =>
      filters.unidades.some(unidadId => {
        const unidad = unidadesDisponibles.find(u => u.id === unidadId);
        return unidad && unidad.residente === r.residente;
      })
    );

    setResultados(resultadosFiltrados);
    setLoading(false);
    setCurrentStep(2);
  };

  const getRiesgoColor = (riesgo) => {
    switch (riesgo) {
      case 'Alto': return '#dc2626';
      case 'Medio': return '#f59e0b';
      case 'Bajo': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getRiesgoIcon = (riesgo) => {
    switch (riesgo) {
      case 'Alto': return <XCircle size={20} />;
      case 'Medio': return <AlertTriangle size={20} />;
      case 'Bajo': return <CheckCircle size={20} />;
      default: return null;
    }
  };

  const handleResidentSelect = (residentId) => {
    setSelectedResidents(prev => {
      if (prev.includes(residentId)) {
        return prev.filter(id => id !== residentId);
      } else {
        return [...prev, residentId];
      }
    });
  };

  const generarAcciones = () => {
    if (selectedResidents.length === 0) {
      setError('Debe seleccionar al menos un residente para generar acciones.');
      return;
    }

    const residentesSeleccionados = resultados.filter(r => selectedResidents.includes(r.id));
    const totalDeuda = residentesSeleccionados.reduce((sum, r) => sum + r.montoDeuda, 0);

    const mensaje = `Se han creado planes de pago para ${selectedResidents.length} residente(s):
    
Detalles:
${residentesSeleccionados.map(r => 
  `• ${r.residente}: Bs${r.montoDeuda} - Plan de ${Math.ceil(r.montoDeuda / 350)} cuotas mensuales`
).join('\n')}

Total a recuperar: Bs${totalDeuda.toLocaleString()}

Los residentes recibirán:
- Notificación automática del plan de pago
- Cronograma de cuotas personalizadas  
- Recordatorios antes del vencimiento
- Opciones de pago en línea`;

    alert(mensaje);
    setError('');
  };

  const exportarResultados = (formato) => {
    if (formato === 'PDF') {
      const contenidoPDF = `
        <html>
          <head>
            <title>Reporte de Predicción de Morosidad</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f9fafb; font-weight: bold; }
              .riesgo-alto { color: #dc2626; font-weight: bold; }
              .riesgo-medio { color: #f59e0b; font-weight: bold; }
              .riesgo-bajo { color: #16a34a; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Reporte de Predicción de Morosidad</h1>
            <p><strong>Fecha del reporte:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total de residentes analizados:</strong> ${resultados.length}</p>
            <table>
              <thead>
                <tr>
                  <th>Residente</th>
                  <th>Unidad</th>
                  <th>Riesgo</th>
                  <th>Probabilidad</th>
                  <th>Deuda (Bs)</th>
                  <th>Tendencia</th>
                </tr>
              </thead>
              <tbody>
                ${resultados.map(r => `
                  <tr>
                    <td>${r.residente}</td>
                    <td>${r.unidad}</td>
                    <td class="riesgo-${r.riesgo.toLowerCase()}">${r.riesgo}</td>
                    <td>${r.probabilidad}%</td>
                    <td>Bs${r.montoDeuda.toLocaleString()}</td>
                    <td>${r.tendencia}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const blob = new Blob([contenidoPDF], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_morosidad_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } else if (formato === 'Excel') {
      const headers = ['Residente', 'Unidad', 'Riesgo', 'Probabilidad (%)', 'Deuda (Bs)', 'Pagos Atrasados', 'Ultimo Pago', 'Tendencia'];
      const csvContent = [
        headers.join(','),
        ...resultados.map(r => [
          `"${r.residente}"`,
          `"${r.unidad}"`,
          r.riesgo,
          r.probabilidad,
          r.montoDeuda,
          r.pagosAtrasados,
          r.ultimoPago,
          r.tendencia
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_morosidad_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const selectAllResidents = (checked) => {
    if (checked) {
      setSelectedResidents(resultados.map(r => r.id));
    } else {
      setSelectedResidents([]);
    }
  };

  return (
    <div className="mpi__container">
      {/* Header */}
      <div className="mpi__card mpi__card--header">
        <div className="mpi__headerRow">
          <TrendingUp size={28} className="mpi__icon--primary" />
          <h1 className="mpi__title">Predicción de Morosidad (IA)</h1>
        </div>
        <p className="mpi__subtitle">
          Analiza el historial de pagos y genera predicciones de residentes con riesgo de atraso
        </p>
      </div>

      {/* Navegación por pasos */}
      <div className="mpi__steps">
        <button
          onClick={() => setCurrentStep(1)}
          className={`mpi__btn mpi__btn--step ${currentStep === 1 ? 'mpi__btn--stepActive' : ''}`}
        >
          1. Configurar Análisis
        </button>
        <button
          onClick={() => currentStep === 2 && setCurrentStep(2)}
          className={`mpi__btn mpi__btn--step ${currentStep === 2 ? 'mpi__btn--stepActive' : 'mpi__btn--na'}`}
        >
          2. Resultados y Acciones
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mpi__alertError">
          <AlertTriangle size={20} className="mpi__alertIcon" />
          <span className="mpi__alertText">{error}</span>
        </div>
      )}

      {/* Paso 1: Configuración */}
      {currentStep === 1 && (
        <div className="mpi__card">
          <h2 className="mpi__sectionTitle">
            <Calendar size={24} className="mpi__icon--primary" />
            <span>Configurar Parámetros del Análisis</span>
          </h2>

          <div className="mpi__grid">
            {/* Rango de Fechas */}
            <div>
              <h3 className="mpi__fieldTitle">Rango de Fechas</h3>
              <div className="mpi__fieldColumn">
                <div>
                  <label className="mpi__label">Fecha Inicio</label>
                  <input
                    type="date"
                    value={filters.fechaInicio}
                    onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                    className="mpi__input"
                  />
                </div>
                <div>
                  <label className="mpi__label">Fecha Fin</label>
                  <input
                    type="date"
                    value={filters.fechaFin}
                    onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                    className="mpi__input"
                  />
                </div>
              </div>
            </div>

            {/* Selección de Unidades */}
            <div>
              <h3 className="mpi__fieldTitle mpi__fieldTitle--icon">
                <Users size={20} />
                <span>Unidades/Residentes</span>
              </h3>
              <div className="mpi__scrollList">
                {unidadesDisponibles.map(unidad => (
                  <label key={unidad.id} className="mpi__unidadLabel">
                    <input
                      type="checkbox"
                      className="mpi__checkbox"
                      checked={filters.unidades.includes(unidad.id)}
                      onChange={() => handleUnidadToggle(unidad.id)}
                    />
                    <div>
                      <div className="mpi__unidadNombre">{unidad.nombre}</div>
                      <div className="mpi__unidadResidente">{unidad.residente}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Criterios Opcionales */}
            <div>
              <h3 className="mpi__fieldTitle mpi__fieldTitle--icon">
                <DollarSign size={20} />
                <span>Criterios Adicionales</span>
              </h3>
              <div className="mpi__fieldColumn">
                <div>
                  <label className="mpi__label">Monto Mínimo (Bs)</label>
                  <input
                    type="number"
                    placeholder="Ej: 350"
                    value={filters.montoMinimo}
                    onChange={(e) => handleFilterChange('montoMinimo', e.target.value)}
                    className="mpi__input"
                  />
                </div>
                <div>
                  <label className="mpi__label">Frecuencia de Atraso</label>
                  <select
                    value={filters.frecuenciaAtraso}
                    onChange={(e) => handleFilterChange('frecuenciaAtraso', e.target.value)}
                    className="mpi__select"
                  >
                    <option value="all">Todos los casos</option>
                    <option value="occasional">Ocasional (1-2 veces)</option>
                    <option value="frequent">Frecuente (3+ veces)</option>
                  </select>
                </div>
                <label className="mpi__checkRow">
                  <input
                    type="checkbox"
                    className="mpi__checkbox"
                    checked={filters.incluirMultas}
                    onChange={(e) => handleFilterChange('incluirMultas', e.target.checked)}
                  />
                  <span className="mpi__checkText">Incluir multas en el análisis</span>
                </label>
              </div>
            </div>
          </div>

          {/* Botón Ejecutar */}
          <div className="mpi__runRow">
            <button
              onClick={ejecutarPrediccion}
              disabled={loading}
              className={`mpi__btn mpi__btn--primary ${loading ? 'mpi__btn--disabled' : ''}`}
            >
              {loading ? (
                <>
                  <div className="mpi__spinner" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <TrendingUp size={20} />
                  <span>Ejecutar Predicción</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Paso 2: Resultados */}
      {currentStep === 2 && (
        <div>
          {/* Resumen de Resultados */}
          <div className="mpi__card mpi__mb">
            <h2 className="mpi__cardTitle">Resultados de la Predicción</h2>
            <div className="mpi__summaryGrid">
              {['Alto', 'Medio', 'Bajo'].map(riesgo => {
                const count = resultados.filter(r => r.riesgo === riesgo).length;
                return (
                  <div
                    key={riesgo}
                    className="mpi__summaryCard"
                    style={{ borderLeft: `4px solid ${getRiesgoColor(riesgo)}` }}
                  >
                    <div className="mpi__summaryHead">
                      <span style={{ color: getRiesgoColor(riesgo) }}>
                        {getRiesgoIcon(riesgo)}
                      </span>
                      <span className="mpi__summaryTitle" style={{ color: getRiesgoColor(riesgo) }}>
                        Riesgo {riesgo}
                      </span>
                    </div>
                    <div className="mpi__summaryCount" style={{ color: getRiesgoColor(riesgo) }}>
                      {count}
                    </div>
                    <div className="mpi__summaryHint">
                      {count === 1 ? 'residente' : 'residentes'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lista de Resultados */}
          <div className="mpi__card">
            <div className="mpi__listHead">
              <h3 className="mpi__listTitle">Residentes Analizados</h3>
              <div className="mpi__exportBtns">
                <button onClick={() => exportarResultados('PDF')} className="mpi__btn mpi__btn--pdf">
                  <Download size={16} />
                  <span>PDF</span>
                </button>
                <button onClick={() => exportarResultados('Excel')} className="mpi__btn mpi__btn--excel">
                  <FileText size={16} />
                  <span>Excel</span>
                </button>
              </div>
            </div>

            {/* Tabla de Resultados */}
            <div className="mpi__tableWrap">
              <table className="mpi__table">
                <thead>
                  <tr className="mpi__theadRow">
                    <th className="mpi__th">
                      <input type="checkbox" onChange={(e) => selectAllResidents(e.target.checked)} className="mpi__checkbox" />
                    </th>
                    <th className="mpi__th">Residente</th>
                    <th className="mpi__th">Riesgo</th>
                    <th className="mpi__th">Probabilidad</th>
                    <th className="mpi__th">Deuda</th>
                    <th className="mpi__th">Tendencia</th>
                    <th className="mpi__th mpi__th--center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((resultado, index) => (
                    <tr
                      key={resultado.id}
                      className={`mpi__tr ${index % 2 !== 0 ? 'mpi__tr--alt' : ''}`}
                    >
                      <td className="mpi__td">
                        <input
                          type="checkbox"
                          className="mpi__checkbox"
                          checked={selectedResidents.includes(resultado.id)}
                          onChange={() => handleResidentSelect(resultado.id)}
                        />
                      </td>
                      <td className="mpi__td">
                        <div>
                          <div className="mpi__name">{resultado.residente}</div>
                          <div className="mpi__sub">{resultado.unidad}</div>
                        </div>
                      </td>
                      <td className="mpi__td">
                        <div className="mpi__risk">
                          <span style={{ color: getRiesgoColor(resultado.riesgo) }}>
                            {getRiesgoIcon(resultado.riesgo)}
                          </span>
                          <span className="mpi__riskText" style={{ color: getRiesgoColor(resultado.riesgo) }}>
                            {resultado.riesgo}
                          </span>
                        </div>
                      </td>
                      <td className="mpi__td">
                        <div className="mpi__prob">
                          <div className="mpi__bar">
                            <div
                              className="mpi__barInner"
                              style={{
                                width: `${resultado.probabilidad}%`,
                                backgroundColor: getRiesgoColor(resultado.riesgo)
                              }}
                            />
                          </div>
                          <span className="mpi__probText">{resultado.probabilidad}%</span>
                        </div>
                      </td>
                      <td className="mpi__td">
                        <span className={`mpi__amount ${resultado.montoDeuda > 0 ? 'mpi__amount--danger' : 'mpi__amount--success'}`}>
                          Bs{resultado.montoDeuda.toLocaleString()}
                        </span>
                      </td>
                      <td className="mpi__td">
                        <span className={
                          `mpi__chip ${
                            resultado.tendencia === 'Empeorando' ? 'mpi__chip--danger' :
                            resultado.tendencia === 'Estable' ? 'mpi__chip--warning' :
                            resultado.tendencia === 'Mejorando' ? 'mpi__chip--success' : 'mpi__chip--great'
                          }`
                        }>
                          {resultado.tendencia}
                        </span>
                      </td>
                      <td className="mpi__td mpi__td--center">
                        <button
                          onClick={() => setSelectedResident(resultado)}
                          className="mpi__btn mpi__btn--primarySmall"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Acciones sobre Resultados */}
            <div className="mpi__actions">
              <h4 className="mpi__actionsTitle">Acciones sobre Residentes Seleccionados</h4>
              <div className="mpi__actionsRow">
                <button onClick={generarAcciones} className="mpi__btn mpi__btn--actionGreen">
                  <FileText size={16} />
                  <span>Generar Recordatorios</span>
                </button>
                <button onClick={generarAcciones} className="mpi__btn mpi__btn--actionPurple">
                  <DollarSign size={16} />
                  <span>Crear Planes de Pago</span>
                </button>
              </div>
              <p className="mpi__actionsHint">
                {selectedResidents.length} residente(s) seleccionado(s)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle del Residente */}
      {selectedResident && (
        <div className="mpi__modalOverlay">
          <div className="mpi__modal">
            {/* Header del Modal */}
            <div className="mpi__modalHeader">
              <div className="mpi__modalHeaderRow">
                <h3 className="mpi__modalTitle">Detalle - {selectedResident.residente}</h3>
                <button onClick={() => setSelectedResident(null)} className="mpi__closeBtn">×</button>
              </div>
              <p className="mpi__modalSub">{selectedResident.unidad}</p>
            </div>

            {/* Contenido del Modal */}
            <div className="mpi__modalBody">
              {/* Resumen del Riesgo */}
              <div
                className="mpi__riskCard"
                style={{ borderLeft: `4px solid ${getRiesgoColor(selectedResident.riesgo)}` }}
              >
                <div className="mpi__riskCardHead">
                  <div className="mpi__risk">
                    <span style={{ color: getRiesgoColor(selectedResident.riesgo) }}>
                      {getRiesgoIcon(selectedResident.riesgo)}
                    </span>
                    <span className="mpi__riskTitle" style={{ color: getRiesgoColor(selectedResident.riesgo) }}>
                      Riesgo {selectedResident.riesgo}
                    </span>
                  </div>
                  <span className="mpi__riskPct" style={{ color: getRiesgoColor(selectedResident.riesgo) }}>
                    {selectedResident.probabilidad}%
                  </span>
                </div>

                <div className="mpi__riskStats">
                  <div>
                    <div className="mpi__statLabel">Pagos Atrasados</div>
                    <div className="mpi__statValue">{selectedResident.pagosAtrasados}</div>
                  </div>
                  <div>
                    <div className="mpi__statLabel">Monto Deuda</div>
                    <div className="mpi__statValue mpi__statValue--danger">Bs{selectedResident.montoDeuda.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="mpi__statLabel">Último Pago</div>
                    <div className="mpi__statValue">
                      {new Date(selectedResident.ultimoPago).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Historial de Pagos */}
              <div>
                <h4 className="mpi__historyTitle">Historial de Pagos (Últimos 4 Meses)</h4>
                <div className="mpi__historyList">
                  {selectedResident.detalles.historialPagos.map((pago, index) => (
                    <div
                      key={index}
                      className={`mpi__historyItem ${pago.estado === 'Puntual' ? 'mpi__historyItem--ok' : 'mpi__historyItem--bad'}`}
                    >
                      <div>
                        <div className="mpi__historyMes">{pago.mes}</div>
                        <div className="mpi__historyHint">
                          {pago.estado === 'Atrasado' ? `${pago.dias} días de atraso` : 'A tiempo'}
                        </div>
                      </div>
                      <span className={`mpi__badge ${pago.estado === 'Puntual' ? 'mpi__badge--ok' : 'mpi__badge--bad'}`}>
                        {pago.estado}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MorosidadPrediccionIA;