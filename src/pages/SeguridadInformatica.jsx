import React, { useState, useEffect } from 'react';
import '../styles/SeguridadInformatica.css';

const SecurityDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [loginAttempts, setLoginAttempts] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [blockedAccounts, setBlockedAccounts] = useState([]);

  // Usuario simulado como administrador
  const user = { username: 'admin', role: 'Administrador' };

  useEffect(() => {
    // Simular datos iniciales
    setLoginAttempts([
      {
        id: 1,
        username: 'residente1',
        timestamp: new Date(Date.now() - 120000),
        success: true,
        reason: 'Acceso exitoso',
        ip: '192.168.1.45'
      },
      {
        id: 2,
        username: 'usuario_sospechoso',
        timestamp: new Date(Date.now() - 300000),
        success: false,
        reason: 'Contraseña incorrecta',
        ip: '192.168.1.99'
      },
      {
        id: 3,
        username: 'mantenimiento1',
        timestamp: new Date(Date.now() - 600000),
        success: true,
        reason: 'Acceso exitoso',
        ip: '192.168.1.33'
      },
      {
        id: 4,
        username: 'hacker123',
        timestamp: new Date(Date.now() - 900000),
        success: false,
        reason: 'Usuario inexistente',
        ip: '203.45.67.89'
      },
      {
        id: 5,
        username: 'seguridad1',
        timestamp: new Date(Date.now() - 1200000),
        success: true,
        reason: 'Acceso exitoso',
        ip: '192.168.1.12'
      }
    ]);

    setSecurityAlerts([
      {
        id: 1,
        type: 'danger',
        message: 'Múltiples intentos de acceso fallidos desde IP externa',
        timestamp: new Date(Date.now() - 300000),
        user: 'sistema',
        status: 'pending'
      },
      {
        id: 2,
        type: 'warning',
        message: 'Acceso desde ubicación inusual detectado',
        timestamp: new Date(Date.now() - 600000),
        user: 'residente1',
        status: 'pending'
      },
      {
        id: 3,
        type: 'info',
        message: 'Actualización de sistema de seguridad completada',
        timestamp: new Date(Date.now() - 1800000),
        user: 'sistema',
        status: 'resolved'
      },
      {
        id: 4,
        type: 'success',
        message: 'Cifrado de datos verificado correctamente',
        timestamp: new Date(Date.now() - 3600000),
        user: 'sistema',
        status: 'resolved'
      }
    ]);

    setBlockedAccounts(['usuario_sospechoso', 'hacker123']);
  }, []);

  const resolveAlert = (alertId) => {
    setSecurityAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'resolved' } : alert
      )
    );
  };

  const unblockAccount = (username) => {
    setBlockedAccounts(prev => prev.filter(u => u !== username));
    addSecurityAlert('success', `Cuenta ${username} desbloqueada por administrador`);
  };

  const addSecurityAlert = (type, message) => {
    const alert = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date(),
      user: user.username,
      status: 'pending'
    };
    setSecurityAlerts(prev => [alert, ...prev]);
  };

  const renderDashboardView = () => (
    <div>
      <div className="sd-grid">
        <div className="sd-card">
          <div className="sd-card-title">📈 Estado del Sistema</div>
          <div className="sd-system-ok">✅ SEGURO</div>
          <div className="sd-system-list">
            🔐 Cifrado activo<br/>
            🛡️ Firewall habilitado<br/>
            ✨ Autenticación 2FA activa
          </div>
        </div>

        <div className="sd-card">
          <div className="sd-card-title">🔐 Intentos de Acceso</div>
          <div className="sd-kpi sd-kpi-blue">{loginAttempts.length}</div>
          <div className="sd-system-list">
            ✅ {loginAttempts.filter(a => a.success).length} exitosos<br/>
            ❌ {loginAttempts.filter(a => !a.success).length} fallidos<br/>
            ⏱️ Última hora
          </div>
        </div>

        <div className="sd-card">
          <div className="sd-card-title">⚠️ Alertas Activas</div>
          <div className="sd-kpi sd-kpi-warn">
            {securityAlerts.filter(a => a.status === 'pending').length}
          </div>
          <div className="sd-system-list">
            🚨 Requieren atención<br/>
            📊 {securityAlerts.filter(a => a.status === 'resolved').length} resueltas<br/>
            🔍 Monitoreo activo
          </div>
        </div>

        <div className="sd-card">
          <div className="sd-card-title">🚫 Cuentas Bloqueadas</div>
          <div className="sd-kpi sd-kpi-warn">{blockedAccounts.length}</div>
          <div className="sd-system-list">
            🔒 Por seguridad<br/>
            ⚡ Bloqueo automático<br/>
            👨‍💼 Revisión pendiente
          </div>
        </div>
      </div>

      <div className="sd-card">
        <div className="sd-card-title">📊 Actividad del Sistema</div>
        <div className="sd-activity-grid">
          <div>
            <h4 className="sd-activity-title">🔥 Tráfico de Red</h4>
            <div className="sd-progress-wrap sd-progress-blue">
              <div className="sd-progress-fill" style={{ width: '78%' }} />
            </div>
            <span className="sd-progress-value sd-progress-blue-text">78%</span>
          </div>
          <div>
            <h4 className="sd-activity-title">🛡️ Nivel de Seguridad</h4>
            <div className="sd-progress-wrap sd-progress-green">
              <div className="sd-progress-fill" style={{ width: '95%' }} />
            </div>
            <span className="sd-progress-value sd-progress-green-text">ALTO</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonitoringView = () => (
    <div>
      <div className="sd-card">
        <div className="sd-card-title">👁️ Monitoreo en Tiempo Real</div>
        <p className="sd-muted">Análisis continuo de patrones de acceso y detección de anomalías</p>
        
        <table className="sd-table">
          <thead>
            <tr>
              <th className="sd-th">👤 Usuario</th>
              <th className="sd-th">🌐 IP</th>
              <th className="sd-th">📊 Estado</th>
              <th className="sd-th">⏰ Hora</th>
              <th className="sd-th">📝 Detalle</th>
            </tr>
          </thead>
          <tbody>
            {loginAttempts.map(attempt => (
              <tr key={attempt.id}>
                <td className="sd-td">
                  <strong>{attempt.username}</strong>
                </td>
                <td className="sd-td">
                  <code className="sd-code">{attempt.ip}</code>
                </td>
                <td className="sd-td">
                  <span className={`sd-chip ${attempt.success ? 'success' : 'error'}`}>
                    {attempt.success ? '✅ Exitoso' : '❌ Fallido'}
                  </span>
                </td>
                <td className="sd-td">{attempt.timestamp.toLocaleTimeString()}</td>
                <td className="sd-td">
                  <em className="sd-muted">{attempt.reason}</em>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAlertsView = () => (
    <div>
      <div className="sd-card">
        <div className="sd-card-title">🚨 Centro de Alertas de Seguridad</div>
        <p className="sd-muted">Gestión centralizada de eventos de seguridad y respuesta a incidentes</p>
        
        {securityAlerts.map(alert => (
          <div
            key={alert.id}
            className={`sd-alert-item ${
              alert.type === 'danger' ? 'sd-alert-danger' :
              alert.type === 'warning' ? 'sd-alert-warning' :
              alert.type === 'info' ? 'sd-alert-info' : 'sd-alert-success'
            }`}
          >
            <div className="sd-alert-body">
              <div className="sd-alert-title">
                {alert.type === 'danger' && '🚨'} 
                {alert.type === 'warning' && '⚠️'} 
                {alert.type === 'info' && 'ℹ️'} 
                {alert.type === 'success' && '✅'} 
                {alert.message}
              </div>
              <div className="sd-alert-meta">
                📅 {alert.timestamp.toLocaleString()} • 👤 {alert.user} • 
                <span className={`sd-chip ${alert.status === 'pending' ? 'pending' : 'resolved'} ml`}>
                  {alert.status === 'pending' ? '⏳ Pendiente' : '✅ Resuelto'}
                </span>
              </div>
            </div>
            {alert.status === 'pending' && (
              <button
                className="sd-btn sd-btn-primary"
                onClick={() => resolveAlert(alert.id)}
              >
                ✅ Resolver
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderIncidentsView = () => (
    <div>
      <div className="sd-card">
        <div className="sd-card-title">📋 Gestión de Incidentes de Seguridad</div>
        
        <div className="sd-block">
          <h3 className="sd-block-title">🚫 Cuentas Bloqueadas</h3>
          {blockedAccounts.length > 0 ? (
            <div>
              <p className="sd-muted mb-15">
                Las siguientes cuentas han sido bloqueadas por actividad sospechosa:
              </p>
              {blockedAccounts.map(account => (
                <div key={account} className="sd-alert-item sd-alert-warning">
                  <div className="sd-alert-body">
                    <div className="sd-alert-title">
                      🚫 Cuenta bloqueada: <strong>{account}</strong>
                    </div>
                    <div className="sd-alert-meta">
                      🔍 Motivo: Múltiples intentos de acceso fallidos detectados<br/>
                      ⏰ Bloqueo automático por sistema de seguridad
                    </div>
                  </div>
                  <button
                    className="sd-btn sd-btn-primary"
                    onClick={() => unblockAccount(account)}
                  >
                    🔓 Desbloquear
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="sd-empty-ok">
              ✅ <strong>No hay cuentas bloqueadas</strong><br/>
              <span className="sd-empty-ok-sub">Todas las cuentas están activas</span>
            </div>
          )}
        </div>

        <div>
          <h3 className="sd-block-title">🔍 Registro Detallado de Actividad</h3>
          <div className="sd-log-list">
            {loginAttempts.map(attempt => (
              <div
                key={attempt.id}
                className={`sd-log-item ${attempt.success ? 'ok' : 'fail'}`}
              >
                <div className="sd-log-head">
                  <span>
                    {attempt.success ? '✅' : '❌'} 
                    <strong>{attempt.username}</strong> - {attempt.reason}
                  </span>
                  <span className={`sd-chip ${attempt.success ? 'success' : 'error'}`}>
                    {attempt.success ? 'ÉXITO' : 'FALLO'}
                  </span>
                </div>
                <div className="sd-log-meta">
                  🕒 {attempt.timestamp.toLocaleString()} • 
                  🌐 IP: <code className="sd-code">{attempt.ip}</code> • 
                  📍 Origen: {attempt.ip.startsWith('192.168') ? 'Red interna' : 'Red externa'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="sd-container">
      <div className="sd-dashboard">
        <div className="sd-header">
          <div>
            <h1 className="sd-h1">🛡️ Sistema de Seguridad Informática</h1>
            <p className="sd-h1-sub">
              Panel de Control - {user.username} ({user.role})
            </p>
          </div>
          <div className="sd-status-pill">🟢 Sistema Operativo</div>
        </div>

        <nav className="sd-nav">
          {[
            { key: 'dashboard', label: '📊 Panel Principal' },
            { key: 'monitoring', label: '👁️ Monitoreo' },
            { key: 'alerts', label: '🚨 Alertas' },
            { key: 'incidents', label: '📋 Incidentes' }
          ].map(nav => (
            <button
              key={nav.key}
              className={`sd-nav-btn ${currentView === nav.key ? 'active' : ''}`}
              onClick={() => setCurrentView(nav.key)}
            >
              {nav.label}
            </button>
          ))}
        </nav>

        <div className="sd-content">
          {currentView === 'dashboard' && renderDashboardView()}
          {currentView === 'monitoring' && renderMonitoringView()}
          {currentView === 'alerts' && renderAlertsView()}
          {currentView === 'incidents' && renderIncidentsView()}
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;