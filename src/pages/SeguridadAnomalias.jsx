import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertTriangle, FileText, Download, X, Eye, Clock, MapPin, Shield, Bell } from 'lucide-react';
import '../styles/Anomalias.css';

const SecurityAISystem = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [alerts, setAlerts] = useState([]);
  const [securityLog, setSecurityLog] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [aiStatus, setAiStatus] = useState('active');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [reportFilters, setReportFilters] = useState({ dateFrom: '', dateTo: '', type: 'all' });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    const initialCameras = [
      { id: 1, name: 'Entrada Principal', status: 'active', location: 'Lobby' },
      { id: 2, name: 'Área Restringida A', status: 'active', location: 'Zona A' },
      { id: 3, name: 'Pasillo Norte', status: 'maintenance', location: 'Edificio Norte' },
      { id: 4, name: 'Estacionamiento', status: 'active', location: 'Exterior' }
    ];
    setCameras(initialCameras);

    const sampleEvents = [
      { id: 1, type: 'unauthorized_access', description: 'Ingreso no autorizado detectado', location: 'Área Restringida A', timestamp: new Date(Date.now() - 3600000).toISOString(), severity: 'high', status: 'pending', cameraId: 2, image: '/api/placeholder/300/200' },
      { id: 2, type: 'loitering', description: 'Merodeo detectado en zona no permitida', location: 'Entrada Principal', timestamp: new Date(Date.now() - 7200000).toISOString(), severity: 'medium', status: 'reviewed', cameraId: 1, image: '/api/placeholder/300/200' },
      { id: 3, type: 'suspicious_behavior', description: 'Perro agresivo sin supervisión detectado', location: 'Patio Principal', timestamp: new Date(Date.now() - 1800000).toISOString(), severity: 'high', status: 'pending', cameraId: 4, image: '/api/placeholder/300/200' },
      { id: 4, type: 'suspicious_behavior', description: 'Animal doméstico mostrando comportamiento territorial', location: 'Área de Huéspedes', timestamp: new Date(Date.now() - 5400000).toISOString(), severity: 'medium', status: 'pending', cameraId: 1, image: '/api/placeholder/300/200' },
      { id: 5, type: 'unauthorized_access', description: 'Persona no identificada en zona restringida', location: 'Área Restringida B', timestamp: new Date(Date.now() - 10800000).toISOString(), severity: 'high', status: 'reviewed', cameraId: 2, image: '/api/placeholder/300/200' }
    ];

    setSecurityLog(sampleEvents);
    setAlerts(sampleEvents.filter(e => e.status === 'pending'));

    const interval = setInterval(() => {
      if (Math.random() < 0.1) generateNewAnomaly();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const generateNewAnomaly = () => {
    const anomalyTypes = [
      { type: 'unauthorized_access', desc: 'Ingreso no autorizado detectado', severity: 'high' },
      { type: 'loitering', desc: 'Merodeo detectado en zona no permitida', severity: 'medium' },
      { type: 'suspicious_behavior', desc: 'Comportamiento sospechoso detectado', severity: 'low' },
      { type: 'suspicious_behavior', desc: 'Perro agresivo sin supervisión detectado', severity: 'high' },
      { type: 'suspicious_behavior', desc: 'Animal doméstico mostrando comportamiento territorial', severity: 'medium' },
      { type: 'suspicious_behavior', desc: 'Perro suelto intentando morder a huésped', severity: 'high' },
      { type: 'suspicious_behavior', desc: 'Mascota sin correa en área pública', severity: 'medium' }
    ];
    const locations = ['Entrada Principal', 'Área Restringida A', 'Patio Principal', 'Área de Huéspedes', 'Estacionamiento', 'Jardines'];
    const activeCameras = cameras.filter(cam => cam.status === 'active');

    if (activeCameras.length === 0) {
      showError('No se pudo analizar la imagen, verifique el dispositivo');
      return;
    }
    const selectedAnomaly = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
    const selectedCamera = activeCameras[Math.floor(Math.random() * activeCameras.length)];
    const selectedLocation = locations[Math.floor(Math.random() * locations.length)];

    const newEvent = {
      id: Date.now(),
      type: selectedAnomaly.type,
      description: selectedAnomaly.desc,
      location: selectedLocation,
      timestamp: new Date().toISOString(),
      severity: selectedAnomaly.severity,
      status: 'pending',
      cameraId: selectedCamera.id,
      image: '/api/placeholder/300/200'
    };

    setAlerts(prev => [newEvent, ...prev]);
    setSecurityLog(prev => [newEvent, ...prev]);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const markAsNotRelevant = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    setSecurityLog(prev => prev.map(event => event.id === alertId ? { ...event, status: 'not_relevant' } : event));
    setSelectedAlert(null);
  };

  const markAsReviewed = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    setSecurityLog(prev => prev.map(event => event.id === alertId ? { ...event, status: 'reviewed' } : event));
    setSelectedAlert(null);
  };

  const exportReport = (format) => {
    try {
      const filteredEvents = securityLog.filter(event => {
        if (reportFilters.type !== 'all' && event.type !== reportFilters.type) return false;
        if (reportFilters.dateFrom && new Date(event.timestamp) < new Date(reportFilters.dateFrom)) return false;
        if (reportFilters.dateTo && new Date(event.timestamp) > new Date(reportFilters.dateTo)) return false;
        return true;
      });

      let content = '';
      let mimeType = '';
      let fileExtension = '';

      if (format === 'pdf' || format === 'html') {
        content = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Reporte de Anomalías - Sistema de Seguridad IA</title><style>
          body{font-family:Arial,sans-serif;margin:20px;line-height:1.6;color:#333}
          .header{text-align:center;border-bottom:2px solid #1e293b;padding-bottom:20px;margin-bottom:30px}
          .header h1{color:#1e293b;margin:0}
          .header p{color:#64748b;margin:5px 0}
          .summary{background:#f8fafc;padding:20px;border-radius:8px;margin-bottom:30px;border-left:4px solid #3b82f6}
          .summary h2{color:#1e293b;margin-top:0}
          .summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-top:15px}
          .summary-item{background:#fff;padding:15px;border-radius:6px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.1)}
          .summary-number{font-size:2em;font-weight:bold;color:#3b82f6}
          .summary-label{color:#64748b;font-size:.9em}
          table{width:100%;border-collapse:collapse;margin-top:20px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.1)}
          th{background:#1e293b;color:#fff;padding:12px;text-align:left;font-weight:600}
          td{padding:12px;border-bottom:1px solid #e5e7eb}
          tr:nth-child(even){background:#f9fafb}
          .severity-high{background:#fef2f2;color:#dc2626;padding:4px 8px;border-radius:12px;font-size:.8em;font-weight:600;text-transform:uppercase}
          .severity-medium{background:#fffbeb;color:#d97706;padding:4px 8px;border-radius:12px;font-size:.8em;font-weight:600;text-transform:uppercase}
          .severity-low{background:#f0fdf4;color:#16a34a;padding:4px 8px;border-radius:12px;font-size:.8em;font-weight:600;text-transform:uppercase}
          .status-pending{background:#fef3c7;color:#d97706;padding:4px 8px;border-radius:12px;font-size:.8em;font-weight:600}
          .status-reviewed{background:#dcfce7;color:#16a34a;padding:4px 8px;border-radius:12px;font-size:.8em;font-weight:600}
          .status-not-relevant{background:#f3f4f6;color:#6b7280;padding:4px 8px;border-radius:12px;font-size:.8em;font-weight:600}
          .footer{margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;color:#6b7280;font-size:.9em}
          .incident-details{margin-bottom:30px}
          .incident-card{border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:20px;background:#fff}
          .incident-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;border-bottom:1px solid #f3f4f6;padding-bottom:10px}
          .incident-title{font-weight:bold;color:#1e293b;font-size:1.1em}
          .incident-meta{color:#64748b;font-size:.9em;margin-top:5px}
        </style></head><body>
          <div class="header">
            <h1>🛡️ REPORTE DE ANOMALÍAS</h1>
            <h2>Sistema de Seguridad con Inteligencia Artificial</h2>
            <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
            <p><strong>Período de reporte:</strong> ${reportFilters.dateFrom || 'Inicio'} - ${reportFilters.dateTo || 'Fin'}</p>
          </div>
          <div class="summary">
            <h2>📊 Resumen Ejecutivo</h2>
            <div class="summary-grid">
              <div class="summary-item"><div class="summary-number">${filteredEvents.length}</div><div class="summary-label">Total de Eventos</div></div>
              <div class="summary-item"><div class="summary-number" style="color:#dc2626">${filteredEvents.filter(e=>e.severity==='high').length}</div><div class="summary-label">Severidad Alta</div></div>
              <div class="summary-item"><div class="summary-number" style="color:#d97706">${filteredEvents.filter(e=>e.severity==='medium').length}</div><div class="summary-label">Severidad Media</div></div>
              <div class="summary-item"><div class="summary-number" style="color:#16a34a">${filteredEvents.filter(e=>e.severity==='low').length}</div><div class="summary-label">Severidad Baja</div></div>
            </div>
          </div>
          <div class="incident-details">
            <h2>🚨 Detalles de Incidentes</h2>
            ${filteredEvents.map(event=>`
              <div class="incident-card">
                <div class="incident-header">
                  <div>
                    <div class="incident-title">${event.description}</div>
                    <div class="incident-meta">📍 <strong>Ubicación:</strong> ${event.location} | 🕒 <strong>Fecha:</strong> ${formatTimestamp(event.timestamp)}</div>
                  </div>
                  <div><span class="severity-${event.severity}">${event.severity==='high'?'ALTA':event.severity==='medium'?'MEDIA':'BAJA'}</span></div>
                </div>
                <div style="margin-top:15px">
                  <p><strong>📋 Descripción detallada:</strong></p>
                  <p style="background:#f8fafc;padding:15px;border-radius:6px;margin:10px 0;">
                    ${event.type==='unauthorized_access'
                      ? `Se detectó un intento de acceso no autorizado en ${event.location}. El sistema de IA identificó a una persona intentando ingresar sin las credenciales apropiadas.`
                      : event.type==='loitering'
                      ? `Comportamiento de merodeo detectado en ${event.location}. Una persona permaneció en el área por un tiempo prolongado sin propósito aparente.`
                      : event.type==='suspicious_behavior'
                      ? `El sistema detectó un comportamiento anómalo en ${event.location}. Ejemplo: perro suelto agresivo sin supervisión.`
                      : event.description}
                  </p>
                  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-top:15px;">
                    <div><strong>🎥 Cámara:</strong><br/>Cámara ID: ${event.cameraId}</div>
                    <div><strong>⚠️ Nivel de Riesgo:</strong><br/><span class="severity-${event.severity}">${event.severity==='high'?'CRÍTICO':event.severity==='medium'?'MODERADO':'BAJO'}</span></div>
                    <div><strong>📊 Estado:</strong><br/><span class="status-${event.status==='not_relevant'?'not-relevant':event.status}">${event.status==='pending'?'PENDIENTE DE REVISIÓN':event.status==='reviewed'?'REVISADO':event.status==='not_relevant'?'NO RELEVANTE':event.status}</span></div>
                  </div>
                  ${event.severity==='high'?`<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:15px;margin-top:15px;border-radius:0 6px 6px 0;"><strong style="color:#dc2626">⚠️ RECOMENDACIONES URGENTES:</strong><br/>• Revisar inmediatamente el área afectada<br/>• Verificar protocolos de seguridad<br/>• Contactar al personal de seguridad de turno<br/>• Documentar medidas correctivas aplicadas</div>`:''}
                </div>
              </div>
            `).join('')}
          </div>
          <table><thead><tr><th>📅 Fecha/Hora</th><th>🏷️ Tipo</th><th>📍 Ubicación</th><th>⚠️ Severidad</th><th>📊 Estado</th></tr></thead><tbody>
            ${filteredEvents.map(event=>`
              <tr>
                <td>${formatTimestamp(event.timestamp)}</td>
                <td>${event.type==='unauthorized_access'?'Acceso No Autorizado':event.type==='loitering'?'Merodeo':event.type==='suspicious_behavior'?'Comportamiento Sospechoso':event.type}</td>
                <td>${event.location}</td>
                <td><span class="severity-${event.severity}">${event.severity==='high'?'ALTA':event.severity==='medium'?'MEDIA':'BAJA'}</span></td>
                <td><span class="status-${event.status==='not_relevant'?'not-relevant':event.status}">${event.status==='pending'?'Pendiente':event.status==='reviewed'?'Revisado':event.status==='not_relevant'?'No Relevante':event.status}</span></td>
              </tr>`).join('')}
          </tbody></table>
          <div class="footer"><p><strong>Sistema de Seguridad con IA</strong> - Reporte generado automáticamente</p><p>📧 Para consultas contactar al administrador del sistema</p><p><em>Este documento contiene información confidencial de seguridad</em></p></div>
        </body></html>`;
        mimeType = 'text/html'; fileExtension = 'html';
      } else {
        content = `REPORTE DE ANOMALÍAS - SISTEMA DE SEGURIDAD IA
=================================================
Fecha de generación: ${new Date().toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}
Período: ${reportFilters.dateFrom || 'Inicio'} - ${reportFilters.dateTo || 'Fin'}

RESUMEN EJECUTIVO:
- Total de eventos: ${filteredEvents.length}
- Severidad Alta: ${filteredEvents.filter(e=>e.severity==='high').length}
- Severidad Media: ${filteredEvents.filter(e=>e.severity==='medium').length}
- Severidad Baja: ${filteredEvents.filter(e=>e.severity==='low').length}

DETALLE DE INCIDENTES:
=====================

${filteredEvents.map((event,index)=>`
INCIDENTE #${index+1}
----------------------
Fecha/Hora: ${formatTimestamp(event.timestamp)}
Tipo: ${event.type==='unauthorized_access'?'Acceso No Autorizado':event.type==='loitering'?'Merodeo':event.type==='suspicious_behavior'?'Comportamiento Sospechoso':event.type}
Descripción: ${event.description}
Ubicación: ${event.location}
Severidad: ${event.severity==='high'?'ALTA':event.severity==='medium'?'MEDIA':'BAJA'}
Estado: ${event.status==='pending'?'Pendiente':event.status==='reviewed'?'Revisado':event.status==='not_relevant'?'No Relevante':event.status}
Cámara ID: ${event.cameraId}

Descripción Detallada:
${event.type==='unauthorized_access'
  ? `Se detectó un intento de acceso no autorizado en ${event.location}.`
  : event.type==='loitering'
  ? `Comportamiento de merodeo detectado en ${event.location}.`
  : event.type==='suspicious_behavior'
  ? `Comportamiento anómalo detectado en ${event.location}.`
  : event.description}

${event.severity==='high'?`RECOMENDACIONES URGENTES:
- Revisar inmediatamente el área afectada
- Verificar protocolos de seguridad
- Contactar personal de seguridad de turno
- Documentar medidas correctivas aplicadas`:''}
`).join('\n')}

TABLA RESUMEN:
==============
${'Fecha/Hora'.padEnd(20)} | ${'Tipo'.padEnd(25)} | ${'Ubicación'.padEnd(20)} | ${'Severidad'.padEnd(10)} | ${'Estado'.padEnd(15)}
${'-'.repeat(95)}
${filteredEvents.map(event=>`${formatTimestamp(event.timestamp).padEnd(20)} | ${(event.type==='unauthorized_access'?'Acceso No Autorizado':event.type==='loitering'?'Merodeo':event.type==='suspicious_behavior'?'Comportamiento Sospechoso':event.type).padEnd(25)} | ${event.location.padEnd(20)} | ${(event.severity==='high'?'ALTA':event.severity==='medium'?'MEDIA':'BAJA').padEnd(10)} | ${(event.status==='pending'?'Pendiente':event.status==='reviewed'?'Revisado':event.status==='not_relevant'?'No Relevante':event.status).padEnd(15)}`).join('\n')}

---
Sistema de Seguridad con IA - Reporte generado automáticamente
Para consultas contactar al administrador del sistema
Este documento contiene información confidencial de seguridad`;
        mimeType = 'text/plain'; fileExtension = 'txt';
      }

      const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-anomalias-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      showError('No se pudo generar el reporte, intente nuevamente');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'var(--c-red)';
      case 'medium': return 'var(--c-amber)';
      case 'low': return 'var(--c-green)';
      default: return 'var(--c-gray)';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="sas-root">
      {/* Header */}
      <header className="sas-header">
        <div className="sas-header-row">
          <div className="sas-header-brand">
            <Shield size={32} />
            <h1 className="sas-header-title">Sistema de Seguridad IA</h1>
          </div>
          <div className="sas-header-right">
            <div className="sas-ai-status">
              <span className={`sas-dot ${aiStatus === 'active' ? 'on' : 'off'}`} />
              <span>IA {aiStatus === 'active' ? 'Activa' : 'Inactiva'}</span>
            </div>
            <div className={`sas-alert-pill ${alerts.length > 0 ? 'has' : ''}`}>
              <Bell size={16} />
              {alerts.length} Alertas
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sas-nav">
        <div className="sas-nav-row">
          {[
            { key: 'dashboard', label: 'Panel Principal', icon: Shield },
            { key: 'monitoring', label: 'Monitoreo', icon: Camera },
            { key: 'alerts', label: 'Alertas', icon: AlertTriangle },
            { key: 'reports', label: 'Reportes', icon: FileText }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setCurrentView(key)}
              className={`sas-tab ${currentView === key ? 'active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main className="sas-main">
        {/* Dashboard */}
        {currentView === 'dashboard' && (
          <div>
            <h2 className="sas-h2">Panel Principal</h2>

            <div className="sas-cards">
              <div className="sas-card">
                <div className="sas-card-row">
                  <div>
                    <p className="sas-card-label">Alertas Activas</p>
                    <p className="sas-card-number red">{alerts.length}</p>
                  </div>
                  <AlertTriangle size={32} color="var(--c-red)" />
                </div>
              </div>

              <div className="sas-card">
                <div className="sas-card-row">
                  <div>
                    <p className="sas-card-label">Cámaras Activas</p>
                    <p className="sas-card-number green">
                      {cameras.filter(cam => cam.status === 'active').length}
                    </p>
                  </div>
                  <Camera size={32} color="var(--c-green)" />
                </div>
              </div>

              <div className="sas-card">
                <div className="sas-card-row">
                  <div>
                    <p className="sas-card-label">Eventos Hoy</p>
                    <p className="sas-card-number blue">
                      {securityLog.filter(event =>
                        new Date(event.timestamp).toDateString() === new Date().toDateString()
                      ).length}
                    </p>
                  </div>
                  <FileText size={32} color="var(--c-blue)" />
                </div>
              </div>
            </div>

            <div className="sas-panel">
              <div className="sas-panel-header">
                <h3 className="sas-h3">Alertas Recientes</h3>
              </div>
              <div className="sas-list">
                {alerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className="sas-list-item">
                    <div className="sas-list-left">
                      <span className="sas-bullet" style={{ backgroundColor: getSeverityColor(alert.severity) }} />
                      <div>
                        <p className="sas-item-title">{alert.description}</p>
                        <p className="sas-item-sub">{alert.location} - {formatTimestamp(alert.timestamp)}</p>
                      </div>
                    </div>
                    <button className="sas-btn primary" onClick={() => setSelectedAlert(alert)}>
                      Ver Detalles
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Monitoring */}
        {currentView === 'monitoring' && (
          <div>
            <h2 className="sas-h2">Monitoreo en Tiempo Real</h2>
            <div className="sas-grid">
              {cameras.map(camera => (
                <div key={camera.id} className="sas-cam">
                  <div className="sas-cam-header">
                    <div>
                      <h4 className="sas-cam-title">{camera.name}</h4>
                      <p className="sas-cam-sub">{camera.location}</p>
                    </div>
                    <div className={`sas-badge ${camera.status === 'active' ? 'ok' : 'warn'}`}>
                      {camera.status === 'active' ? 'Activa' : 'Mantenimiento'}
                    </div>
                  </div>
                  <div className="sas-cam-body">
                    {camera.status === 'active' ? (
                      <>
                        <Camera size={48} color="var(--c-gray-500)" />
                        <div className="sas-live">LIVE</div>
                      </>
                    ) : (
                      <div className="sas-cam-maint">
                        <Camera size={48} />
                        <p className="sas-cam-maint-text">Cámara en mantenimiento</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {currentView === 'alerts' && (
          <div>
            <h2 className="sas-h2">Gestión de Alertas</h2>

            {alerts.length === 0 ? (
              <div className="sas-empty">
                <Shield size={64} color="var(--c-gray-500)" />
                <h3 className="sas-empty-title">No hay alertas pendientes</h3>
                <p className="sas-empty-sub">El sistema está monitoreando continuamente</p>
              </div>
            ) : (
              <div className="sas-alerts">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`sas-alert-card border-${alert.severity}`}
                  >
                    <div className="sas-alert-row">
                      <div className="sas-alert-left">
                        <div className="sas-alert-head">
                          <h4 className="sas-item-title">{alert.description}</h4>
                          <span className={`sas-chip sev-${alert.severity}`}>
                            {alert.severity === 'high' ? 'Alta' : alert.severity === 'medium' ? 'Media' : 'Baja'}
                          </span>
                        </div>
                        <div className="sas-alert-meta">
                          <span className="sas-meta"><MapPin size={16} />{alert.location}</span>
                          <span className="sas-meta"><Clock size={16} />{formatTimestamp(alert.timestamp)}</span>
                        </div>
                      </div>
                      <div className="sas-actions">
                        <button className="sas-btn primary ghost" onClick={() => setSelectedAlert(alert)}>
                          <Eye size={16} /> Ver
                        </button>
                        <button className="sas-btn gray" onClick={() => markAsNotRelevant(alert.id)}>
                          No Relevante
                        </button>
                        <button className="sas-btn success" onClick={() => markAsReviewed(alert.id)}>
                          Revisar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reports */}
        {currentView === 'reports' && (
          <div>
            <h2 className="sas-h2">Reporte de Anomalías</h2>

            <div className="sas-panel">
              <h3 className="sas-h3">Filtros</h3>
              <div className="sas-filter-grid">
                <div className="sas-field">
                  <label className="sas-label">Fecha desde</label>
                  <input
                    type="date"
                    value={reportFilters.dateFrom}
                    onChange={(e) => setReportFilters({ ...reportFilters, dateFrom: e.target.value })}
                    className="sas-input"
                  />
                </div>
                <div className="sas-field">
                  <label className="sas-label">Fecha hasta</label>
                  <input
                    type="date"
                    value={reportFilters.dateTo}
                    onChange={(e) => setReportFilters({ ...reportFilters, dateTo: e.target.value })}
                    className="sas-input"
                  />
                </div>
                <div className="sas-field">
                  <label className="sas-label">Tipo de evento</label>
                  <select
                    value={reportFilters.type}
                    onChange={(e) => setReportFilters({ ...reportFilters, type: e.target.value })}
                    className="sas-input"
                  >
                    <option value="all">Todos los eventos</option>
                    <option value="unauthorized_access">Acceso no autorizado</option>
                    <option value="loitering">Merodeo</option>
                    <option value="suspicious_behavior">Comportamiento sospechoso</option>
                  </select>
                </div>
                <div className="sas-export">
                  <button className="sas-btn danger" onClick={() => exportReport('pdf')}>
                    <Download size={16} /> PDF
                  </button>
                  <button className="sas-btn success" onClick={() => exportReport('excel')}>
                    <Download size={16} /> Excel
                  </button>
                </div>
              </div>
            </div>

            <div className="sas-table-wrap">
              <div className="sas-panel-header">
                <h3 className="sas-h3">Incidentes Registrados</h3>
              </div>
              <div className="sas-table-scroll">
                <table className="sas-table">
                  <thead>
                    <tr>
                      <th>Fecha/Hora</th>
                      <th>Tipo</th>
                      <th>Descripción</th>
                      <th>Ubicación</th>
                      <th>Severidad</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityLog
                      .filter(event => {
                        if (reportFilters.type !== 'all' && event.type !== reportFilters.type) return false;
                        if (reportFilters.dateFrom && new Date(event.timestamp) < new Date(reportFilters.dateFrom)) return false;
                        if (reportFilters.dateTo && new Date(event.timestamp) > new Date(reportFilters.dateTo)) return false;
                        return true;
                      })
                      .map(event => (
                        <tr key={event.id}>
                          <td>{formatTimestamp(event.timestamp)}</td>
                          <td>
                            {event.type === 'unauthorized_access' ? 'Acceso no autorizado'
                              : event.type === 'loitering' ? 'Merodeo'
                              : event.type === 'suspicious_behavior' ? 'Comportamiento sospechoso'
                              : event.type}
                          </td>
                          <td>{event.description}</td>
                          <td>{event.location}</td>
                          <td>
                            <span className={`sas-chip sev-${event.severity}`}>
                              {event.severity === 'high' ? 'Alta' : event.severity === 'medium' ? 'Media' : 'Baja'}
                            </span>
                          </td>
                          <td>
                            <span className={`sas-chip st-${event.status === 'not_relevant' ? 'not-relevant' : event.status}`}>
                              {event.status === 'pending' ? 'Pendiente'
                                : event.status === 'reviewed' ? 'Revisado'
                                : event.status === 'not_relevant' ? 'No relevante' : event.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="sas-modal-backdrop">
          <div className="sas-modal">
            <div className="sas-modal-head">
              <h3 className="sas-h3">Detalle de Alerta</h3>
              <button className="sas-icon-btn" onClick={() => setSelectedAlert(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="sas-modal-body">
              <div className="sas-video-placeholder">
                <Camera size={64} color="var(--c-gray-500)" />
              </div>

              <div className="sas-detail-grid">
                <div>
                  <p className="sas-small-label">Descripción:</p>
                  <p className="sas-detail">{selectedAlert.description}</p>
                </div>
                <div>
                  <p className="sas-small-label">Ubicación:</p>
                  <p className="sas-detail">{selectedAlert.location}</p>
                </div>
                <div>
                  <p className="sas-small-label">Fecha y Hora:</p>
                  <p className="sas-detail">{formatTimestamp(selectedAlert.timestamp)}</p>
                </div>
                <div>
                  <p className="sas-small-label">Severidad:</p>
                  <span className={`sas-chip sev-${selectedAlert.severity}`}>
                    {selectedAlert.severity === 'high' ? 'Alta' : selectedAlert.severity === 'medium' ? 'Media' : 'Baja'}
                  </span>
                </div>
              </div>
            </div>

            <div className="sas-modal-actions">
              <button className="sas-btn gray" onClick={() => markAsNotRelevant(selectedAlert.id)}>
                Marcar como No Relevante
              </button>
              <button className="sas-btn success" onClick={() => markAsReviewed(selectedAlert.id)}>
                Marcar como Revisado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="sas-modal-backdrop">
          <div className="sas-modal small">
            <div className="sas-modal-title">
              <AlertTriangle size={24} color="var(--c-red)" />
              <h3 className="sas-h3">Error</h3>
            </div>
            <p className="sas-error-text">{errorMessage}</p>
            <div className="sas-modal-foot">
              <button className="sas-btn primary" onClick={() => setShowErrorModal(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityAISystem;