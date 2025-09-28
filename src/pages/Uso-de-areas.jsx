import React, { useState } from 'react';
import { Download, Calendar, BarChart3, FileText, AlertCircle } from 'lucide-react';
import '../styles/reportesDeareasComunes.css';

// Datos de ejemplo para simular la funcionalidad
const areasComunes = [
  { id: 1, nombre: 'Piscina' },
  { id: 2, nombre: 'Gimnasio' },
  { id: 3, nombre: 'Salón de Eventos' },
  { id: 4, nombre: 'Cancha de Tenis' },
  { id: 5, nombre: 'BBQ Area' }
];

// Componente para el gráfico circular
const GraficoCircular = ({ datos }) => {
  const total = datos.reduce((sum, item) => sum + item.usos, 0);
  let acumulado = 0;

  const colores = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ];

  return (
    <div className="rac__pieWrap">
      {/* Gráfico SVG */}
      <div className="rac__pieSvgBox">
        <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
          {datos.map((item, index) => {
            const porcentaje = (item.usos / total) * 100;
            const angulo = (porcentaje / 100) * 360;
            const inicioAngulo = (acumulado / total) * 360;
            acumulado += item.usos;

            const radio = 80;
            const centroX = 100;
            const centroY = 100;

            const inicioX = centroX + radio * Math.cos((inicioAngulo * Math.PI) / 180);
            const inicioY = centroY + radio * Math.sin((inicioAngulo * Math.PI) / 180);
            const finX = centroX + radio * Math.cos(((inicioAngulo + angulo) * Math.PI) / 180);
            const finY = centroY + radio * Math.sin(((inicioAngulo + angulo) * Math.PI) / 180);

            const banderaArcoGrande = angulo > 180 ? 1 : 0;

            const pathData = [
              `M ${centroX} ${centroY}`,
              `L ${inicioX} ${inicioY}`,
              `A ${radio} ${radio} 0 ${banderaArcoGrande} 1 ${finX} ${finY}`,
              'Z'
            ].join(' ');

            return (
              <path
                key={index}
                d={pathData}
                className="rac__pieSlice"
                fill={colores[index % colores.length]}
                onMouseOver={(e) => e.target.style.opacity = '0.8'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
              />
            );
          })}
        </svg>

        {/* Texto central */}
        <div className="rac__pieCenter">
          <div className="rac__pieCenterNum">{total}</div>
          <div className="rac__pieCenterHint">Total Usos</div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="rac__legend">
        <h4 className="rac__legendTitle">Distribución por Mes</h4>
        {datos.map((item, index) => {
          const porcentaje = ((item.usos / total) * 100).toFixed(1);
          return (
            <div
              key={index}
              className="rac__legendItem"
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div
                className="rac__legendSwatch"
                style={{ backgroundColor: colores[index % colores.length] }}
              />
              <span className="rac__legendLabel">{item.mes}</span>
              <span className="rac__legendValue">
                {item.usos} ({porcentaje}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ReportesAreasComunes = () => {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    areaComun: ''
  });

  const [reporteGenerado, setReporteGenerado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const manejarCambioFiltro = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
    setError('');
  };

  const validarFiltros = () => {
    if (!filtros.fechaInicio && !filtros.fechaFin && !filtros.areaComun) {
      setError('Debe elegir al menos un criterio de búsqueda');
      return false;
    }
    return true;
  };

  const generarReporte = () => {
    if (!validarFiltros()) return;

    setCargando(true);
    setError('');

    // Simular procesamiento de datos
    setTimeout(() => {
      // Simular casos de excepción
      if (filtros.fechaInicio === '2023-01-01' && filtros.fechaFin === '2023-01-31') {
        setError('No hay registros en el rango seleccionado');
        setCargando(false);
        return;
      }

      // Generar datos de ejemplo
      const areaSeleccionada = areasComunes.find(area => area.id.toString() === filtros.areaComun);
      const nombreArea = areaSeleccionada ? areaSeleccionada.nombre : 'Todas las áreas';
      const totalUsos = Math.floor(Math.random() * 100) + 50;
      const promedioDiario = Math.floor(Math.random() * 20) + 5;

      const estadisticas = {
        area: nombreArea,
        periodo: `${filtros.fechaInicio || 'Inicio'} - ${filtros.fechaFin || 'Fin'}`,
        totalUsos: totalUsos,
        promedioDiario: promedioDiario,
        diaMaxUso: 'Sábado',
        maxUsos: Math.floor(Math.random() * 30) + 20,
        datos: [
          { dia: 'Lunes', usos: Math.floor(Math.random() * 20) + 10 },
          { dia: 'Martes', usos: Math.floor(Math.random() * 20) + 10 },
          { dia: 'Miércoles', usos: Math.floor(Math.random() * 20) + 10 },
          { dia: 'Jueves', usos: Math.floor(Math.random() * 20) + 10 },
          { dia: 'Viernes', usos: Math.floor(Math.random() * 25) + 15 },
          { dia: 'Sábado', usos: Math.floor(Math.random() * 30) + 20 },
          { dia: 'Domingo', usos: Math.floor(Math.random() * 25) + 15 }
        ],
        detalleEjemplo: `En este período, ${nombreArea} registró un total de ${totalUsos} usos, siendo el día de mayor actividad Sábado. Por ejemplo, la piscina fue usada ${Math.floor(Math.random() * 30) + 15} veces en el último mes, con un promedio diario de ${promedioDiario} personas.`,
        datosPorMes: [
          { mes: 'Enero', usos: Math.floor(Math.random() * 50) + 30 },
          { mes: 'Febrero', usos: Math.floor(Math.random() * 45) + 25 },
          { mes: 'Marzo', usos: Math.floor(Math.random() * 60) + 35 },
          { mes: 'Abril', usos: Math.floor(Math.random() * 55) + 30 },
          { mes: 'Mayo', usos: Math.floor(Math.random() * 65) + 40 },
          { mes: 'Junio', usos: Math.floor(Math.random() * 70) + 45 }
        ]
      };

      setReporteGenerado(estadisticas);
      setCargando(false);
    }, 2000);
  };

  const exportarReporte = (formato) => {
    if (!reporteGenerado) return;

    // Simular error de exportación ocasional
    if (Math.random() < 0.1) {
      setError('No se pudo generar el archivo, intente otra vez');
      return;
    }

    // Simular descarga
    const extension = formato === 'TXT' ? 'txt' : 'xlsx';
    const nombreArchivo = `reporte_uso_areas_${Date.now()}.${extension}`;

    // Crear contenido detallado para descarga
    let contenido = '';

    if (formato === 'TXT') {
      contenido = `
===========================================
    REPORTE DE USO DE ÁREAS COMUNES
===========================================

Área: ${reporteGenerado.area}
Período: ${reporteGenerado.periodo}
Fecha de generación: ${new Date().toLocaleString('es-ES')}

RESUMEN ESTADÍSTICO:
-------------------
• Total de usos: ${reporteGenerado.totalUsos}
• Promedio diario: ${reporteGenerado.promedioDiario}
• Día con mayor uso: ${reporteGenerado.diaMaxUso} (${reporteGenerado.maxUsos} usos)

DETALLE POR DÍAS:
----------------
${reporteGenerado.datos.map(item => 
  `${item.dia.padEnd(10)} | ${item.usos.toString().padStart(3)} usos`
).join('\n')}

DISTRIBUCIÓN MENSUAL:
--------------------
${reporteGenerado.datosPorMes.map(item => 
  `${item.mes.padEnd(10)} | ${item.usos.toString().padStart(3)} usos`
).join('\n')}

ANÁLISIS:
--------
• El área ${reporteGenerado.area} tuvo un uso total de ${reporteGenerado.totalUsos} reservas/visitas
• El día de mayor actividad fue ${reporteGenerado.diaMaxUso}
• El promedio de uso diario es de ${reporteGenerado.promedioDiario} personas

OBSERVACIONES:
-------------
- Este reporte incluye todas las reservas confirmadas y asistencias registradas
- Los datos están basados en registros del sistema de reservas del condominio
- Para consultas adicionales, contacte al administrador

Generado por: Sistema de Reportes del Condominio
===========================================
      `.trim();
    } else {
      // Formato Excel (CSV simulado)
      contenido = `Area,Dia,Usos,Porcentaje\n`;
      contenido += reporteGenerado.datos.map(item => 
        `${reporteGenerado.area},${item.dia},${item.usos},${((item.usos/reporteGenerado.totalUsos)*100).toFixed(1)}%`
      ).join('\n');
      contenido += `\n\nDistribucion Mensual,,,\n`;
      contenido += reporteGenerado.datosPorMes.map(item => 
        `${reporteGenerado.area},${item.mes},${item.usos},${((item.usos/reporteGenerado.datosPorMes.reduce((s,i)=>s+i.usos,0))*100).toFixed(1)}%`
      ).join('\n');
      contenido += `\n\nResumen,,,\n`;
      contenido += `Total Usos,${reporteGenerado.totalUsos},,\n`;
      contenido += `Promedio Diario,${reporteGenerado.promedioDiario},,\n`;
      contenido += `Dia Max Uso,${reporteGenerado.diaMaxUso},${reporteGenerado.maxUsos},\n`;
    }

    const mimeType = formato === 'TXT' ? 'text/plain' : 'text/csv';
    const blob = new Blob([contenido], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`Archivo ${nombreArchivo} descargado exitosamente`);
  };

  return (
    <div className="rac__app">
      {/* Header */}
      <div className="rac__header">
        <h1 className="rac__headerTitle">
          <BarChart3 size={24} />
          Sistema de Reportes - Uso de Áreas Comunes
        </h1>
        <p className="rac__headerSub">Módulo de Reportes • Administrador</p>
      </div>

      <div className="rac__content">
        {/* Panel de Filtros */}
        <div className="rac__panel">
          <h2 className="rac__panelTitle">
            <Calendar size={20} />
            Configurar Parámetros de Reporte
          </h2>

          <div className="rac__grid">
            {/* Fecha Inicio */}
            <div>
              <label className="rac__label">Fecha Inicio</label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => manejarCambioFiltro('fechaInicio', e.target.value)}
                className="rac__input"
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="rac__label">Fecha Fin</label>
              <input
                type="date"
                value={filtros.fechaFin}
                className="rac__input"
                onChange={(e) => manejarCambioFiltro('fechaFin', e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Área Común */}
            <div>
              <label className="rac__label">Área Común Específica</label>
              <select
                value={filtros.areaComun}
                onChange={(e) => manejarCambioFiltro('areaComun', e.target.value)}
                className="rac__input rac__select"
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                <option value="">Todas las áreas</option>
                {areasComunes.map(area => (
                  <option key={area.id} value={area.id}>{area.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="rac__alert">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Botón Generar */}
          <button
            onClick={generarReporte}
            disabled={cargando}
            className={`rac__btn rac__btn--primary ${cargando ? 'rac__btn--disabled' : ''}`}
            onMouseOver={(e) => { if (!cargando) e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
            onMouseOut={(e) => { if (!cargando) e.currentTarget.style.backgroundColor = '#2563eb'; }}
          >
            <BarChart3 size={16} />
            {cargando ? 'Generando...' : 'Generar Reporte'}
          </button>
        </div>

        {/* Panel de Resultados */}
        {reporteGenerado && (
          <div className="rac__panel">
            <div className="rac__resultsHead">
              <h2 className="rac__resultsTitle">
                <FileText size={20} />
                Estadísticas de Uso - {reporteGenerado.area}
              </h2>

              <div className="rac__exportGroup">
                <button
                  onClick={() => exportarReporte('TXT')}
                  className="rac__btn rac__btn--txt"
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                >
                  <Download size={14} />
                  TXT
                </button>
                <button
                  onClick={() => exportarReporte('Excel')}
                  className="rac__btn rac__btn--excel"
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                >
                  <Download size={14} />
                  Excel
                </button>
              </div>
            </div>

            <div className="rac__period">
              <strong>Período:</strong> {reporteGenerado.periodo}
            </div>

            {/* Métricas Resumen */}
            <div className="rac__kpis">
              <div className="rac__kpi rac__kpi--blue">
                <div className="rac__kpiNum rac__kpiNum--blue">{reporteGenerado.totalUsos}</div>
                <div className="rac__kpiHint">Total de Usos</div>
              </div>
              <div className="rac__kpi rac__kpi--green">
                <div className="rac__kpiNum rac__kpiNum--green">{reporteGenerado.promedioDiario}</div>
                <div className="rac__kpiHint">Promedio Diario</div>
              </div>
              <div className="rac__kpi rac__kpi--amber">
                <div className="rac__kpiNum rac__kpiNum--amber">{reporteGenerado.diaMaxUso}</div>
                <div className="rac__kpiHint">Día con más uso ({reporteGenerado.maxUsos} usos)</div>
              </div>
            </div>

            {/* Gráfico Circular - Distribución Mensual */}
            <div className="rac__box">
              <h3 className="rac__boxTitle">📊 Distribución de Uso por Mes</h3>
              <GraficoCircular datos={reporteGenerado.datosPorMes} />
            </div>

            {/* Análisis Textual */}
            <div className="rac__box rac__box--soft">
              <h3 className="rac__analysisTitle">📈 Análisis del Período</h3>
              <p className="rac__analysisText">{reporteGenerado.detalleEjemplo}</p>
            </div>

            {/* Tabla de Datos */}
            <div className="rac__tableWrap">
              <table className="rac__table">
                <thead>
                  <tr className="rac__theadRow">
                    <th className="rac__th rac__th--left">Día de la Semana</th>
                    <th className="rac__th rac__th--right">Número de Usos</th>
                    <th className="rac__th rac__th--center">Gráfico</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteGenerado.datos.map((item, index) => (
                    <tr key={index} className="rac__tr">
                      <td className="rac__td rac__td--left rac__td--name">{item.dia}</td>
                      <td className="rac__td rac__td--right">{item.usos}</td>
                      <td className="rac__td rac__td--center">
                        <div
                          style={{
                            width: `${(item.usos / Math.max(...reporteGenerado.datos.map(d => d.usos))) * 100}%`,
                            height: '20px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '10px',
                            minWidth: '20px',
                            margin: '0 auto'
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Estado de Carga */}
        {cargando && (
          <div className="rac__loadingCard">
            <div className="rac__spinner" />
            <p className="rac__loadingText">Procesando datos de reservas y asistencias...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportesAreasComunes;