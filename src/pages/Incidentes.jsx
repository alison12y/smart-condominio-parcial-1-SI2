import React, { useState } from 'react';
import { Camera, Upload, Send, Clock, CheckCircle, AlertCircle, X, Plus, FileText } from 'lucide-react';
import '../styles/Incidentes.css';

// Helper functions
const getStatusColor = (status) => {
  switch(status) {
    case 'Abierta': return '#e74c3c';
    case 'En proceso': return '#f39c12';
    case 'Resuelta': return '#27ae60';
    default: return '#95a5a6';
  }
};

const getStatusIcon = (status) => {
  switch(status) {
    case 'Abierta': return <AlertCircle size={16} />;
    case 'En proceso': return <Clock size={16} />;
    case 'Resuelta': return <CheckCircle size={16} />;
    default: return <FileText size={16} />;
  }
};

const CommunityIncidentsApp = () => {
  const [currentView, setCurrentView] = useState('resident'); // resident o admin
  const [incidents, setIncidents] = useState([
    {
      id: '#INC-2024-001',
      description: 'Ruido excesivo en el piso 5 después de las 10 PM',
      date: '2024-03-15',
      status: 'En proceso',
      photo: null,
      residentName: 'María González',
      apartment: 'Apt 5B'
    },
    {
      id: '#INC-2024-002',
      description: 'Basura acumulada en el área de piscina',
      date: '2024-03-14',
      status: 'Resuelta',
      photo: null,
      residentName: 'Carlos Ruiz',
      apartment: 'Apt 3A'
    }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ description: '', photo: null });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.description.trim()) {
      newErrors.description = 'Debe describir el problema';
    }
    if (formData.photo && !['image/jpeg', 'image/png', 'image/jpg'].includes(formData.photo.type)) {
      newErrors.photo = 'Formato de archivo no soportado';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitIncident = () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    // Simular envío con posible fallo de red
    setTimeout(() => {
      if (Math.random() > 0.2) { // 80% éxito
        const newIncident = {
          id: `#INC-2024-${String(incidents.length + 1).padStart(3, '0')}`,
          description: formData.description,
          date: new Date().toISOString().split('T')[0],
          status: 'Abierta',
          photo: formData.photo,
          residentName: 'Juan Pérez',
          apartment: 'Apt 4C'
        };
        setIncidents([newIncident, ...incidents]);
        setFormData({ description: '', photo: null });
        setShowForm(false);
        showNotification(`Incidencia registrada con número ${newIncident.id}`, 'success');
      } else {
        showNotification('No se pudo enviar la incidencia, intente otra vez', 'error');
      }
      setIsSubmitting(false);
    }, 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      setErrors({ ...errors, photo: null });
    }
  };

  const updateIncidentStatus = (incidentId, newStatus) => {
    setIncidents(incidents.map(inc => 
      inc.id === incidentId ? { ...inc, status: newStatus } : inc
    ));
    showNotification(`Estado actualizado a: ${newStatus}`, 'success');
  };

  return (
    <div className="cia-root">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="cia-main">
        {currentView === 'resident' ? (
          <ResidentView 
            incidents={incidents}
            onNewIncident={() => setShowForm(true)}
          />
        ) : (
          <AdminView 
            incidents={incidents}
            onUpdateStatus={updateIncidentStatus}
          />
        )}
      </main>

      {showForm && (
        <IncidentForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitIncident}
          onClose={() => {
            setShowForm(false);
            setFormData({ description: '', photo: null });
            setErrors({});
          }}
          onFileChange={handleFileChange}
        />
      )}

      {notification && <NotificationToast notification={notification} />}
    </div>
  );
};

const Header = ({ currentView, setCurrentView }) => (
  <header className="cia-header">
    <div className="cia-header-inner">
      <h1 className="cia-title">🏢 Incidencias Comunitarias</h1>
      <nav className="cia-nav">
        <button
          onClick={() => setCurrentView('resident')}
          className={`cia-pill ${currentView === 'resident' ? 'active' : ''}`}
        >
          👤 Vista Residente
        </button>
        <button
          onClick={() => setCurrentView('admin')}
          className={`cia-pill ${currentView === 'admin' ? 'active' : ''}`}
        >
          👨‍💼 Vista Administrador
        </button>
      </nav>
    </div>
  </header>
);

const ResidentView = ({ incidents, onNewIncident }) => {
  // Mostrar solo algunas incidencias del residente
  const userIncidents = incidents.slice(0, 1);

  return (
    <div>
      <div className="cia-row">
        <div>
          <h2 className="cia-h2">Mis Incidencias</h2>
          <p className="cia-sub">Gestiona tus reportes comunitarios</p>
        </div>
        <button className="cia-btn-primary cia-btn-lg" onClick={onNewIncident}>
          <Plus size={24} />
          Nueva Incidencia
        </button>
      </div>

      {userIncidents.length === 0 ? (
        <EmptyState 
          title="No tienes incidencias registradas"
          subtitle='Haz clic en "Nueva Incidencia" para reportar un problema'
        />
      ) : (
        <div className="cia-stack">
          {userIncidents.map(incident => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              isAdmin={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AdminView = ({ incidents, onUpdateStatus }) => {
  const stats = {
    total: incidents.length,
    abiertas: incidents.filter(i => i.status === 'Abierta').length,
    proceso: incidents.filter(i => i.status === 'En proceso').length,
    resueltas: incidents.filter(i => i.status === 'Resuelta').length
  };

  return (
    <div>
      <div className="cia-block-head">
        <h2 className="cia-h2">Panel de Administración</h2>
        <p className="cia-sub">Gestiona todas las incidencias comunitarias</p>
      </div>
      
      <div className="cia-stats-grid">
        <StatCard title="Total" value={stats.total} color="#3498db" icon="📊" />
        <StatCard title="Abiertas" value={stats.abiertas} color="#e74c3c" icon="🔴" />
        <StatCard title="En Proceso" value={stats.proceso} color="#f39c12" icon="🟡" />
        <StatCard title="Resueltas" value={stats.resueltas} color="#27ae60" icon="✅" />
      </div>

      <div className="cia-stack">
        {incidents.map(incident => (
          <IncidentCard
            key={incident.id}
            incident={incident}
            isAdmin={true}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
      </div>
    </div>
  );
};

const EmptyState = ({ title, subtitle }) => (
  <div className="cia-empty">
    <div className="cia-empty-emoji">📝</div>
    <h3 className="cia-empty-title">{title}</h3>
    <p className="cia-empty-sub">{subtitle}</p>
  </div>
);

const StatCard = ({ title, value, color, icon }) => (
  <div className="cia-stat" style={{ '--accent': color }}>
    <div className="cia-stat-emoji">{icon}</div>
    <div className="cia-stat-value">{value}</div>
    <div className="cia-stat-title">{title}</div>
  </div>
);

const IncidentCard = ({ incident, isAdmin, onUpdateStatus }) => (
  <div className="cia-card" style={{ '--status': getStatusColor(incident.status) }}>
    <div className="cia-card-top">
      <div>
        <h3 className="cia-card-id">{incident.id}</h3>
        <div className="cia-status-line" style={{ color: getStatusColor(incident.status) }}>
          {getStatusIcon(incident.status)}
          {incident.status}
        </div>
      </div>
      <div className="cia-card-meta">
        <div className="cia-card-date">{incident.date}</div>
        {isAdmin && (
          <div className="cia-card-user">
            👤 {incident.residentName} <br />
            🏠 {incident.apartment}
          </div>
        )}
      </div>
    </div>

    <div className="cia-card-desc">
      {incident.description}
    </div>

    {incident.photo && (
      <div className="cia-photo-wrap">
        <div className="cia-photo-placeholder">
          <Camera size={32} />
        </div>
        <span className="cia-photo-caption">📸 Imagen adjunta: {incident.photo.name}</span>
      </div>
    )}

    {isAdmin && incident.status !== 'Resuelta' && (
      <div className="cia-admin-actions">
        {incident.status === 'Abierta' && (
          <button
            onClick={() => onUpdateStatus(incident.id, 'En proceso')}
            className="cia-btn-warn"
          >
            🔄 Marcar en Proceso
          </button>
        )}
        {incident.status === 'En proceso' && (
          <button
            onClick={() => onUpdateStatus(incident.id, 'Resuelta')}
            className="cia-btn-success"
          >
            ✅ Marcar Resuelta
          </button>
        )}
      </div>
    )}
  </div>
);

const IncidentForm = ({ formData, setFormData, errors, isSubmitting, onSubmit, onClose, onFileChange }) => (
  <div>
    <div className="cia-modal-backdrop">
      <div className="cia-modal">
        <div className="cia-modal-head">
          <h3 className="cia-modal-title">📝 Nueva Incidencia</h3>
          <button className="cia-close" onClick={onClose}>
            <X size={28} />
          </button>
        </div>

        <div className="cia-modal-body">
          <div className="cia-field">
            <label className="cia-label">📋 Descripción del problema *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe detalladamente el problema o incidencia que quieres reportar..."
              className={`cia-textarea ${errors.description ? 'error' : ''}`}
              rows={5}
            />
            {errors.description && (
              <p className="cia-error">⚠️ {errors.description}</p>
            )}
          </div>

          <div className="cia-field">
            <label className="cia-label">📷 Foto (opcional)</label>
            <div
              className={`cia-dropzone ${errors.photo ? 'error' : ''}`}
              onClick={() => document.getElementById('photoInput').click()}
            >
              {formData.photo ? (
                <div>
                  <div className="cia-drop-emoji">✅</div>
                  <p className="cia-drop-name">{formData.photo.name}</p>
                  <p className="cia-drop-hint">Haz clic para cambiar la imagen</p>
                </div>
              ) : (
                <div>
                  <div className="cia-drop-emoji">📤</div>
                  <p className="cia-drop-cta">Haz clic para adjuntar una foto</p>
                  <p className="cia-drop-note">JPG, PNG - Máximo 5MB</p>
                </div>
              )}
            </div>
            <input
              id="photoInput"
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="cia-file-input"
            />
            {errors.photo && (
              <p className="cia-error">⚠️ {errors.photo}</p>
            )}
          </div>

          <div className="cia-actions end">
            <button className="cia-btn-outline" onClick={onClose} disabled={isSubmitting}>
              ❌ Cancelar
            </button>
            
            <button className={`cia-btn-submit ${isSubmitting ? 'disabled' : ''}`} onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="cia-spinner" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Enviar Incidencia
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NotificationToast = ({ notification }) => (
  <div className={`cia-toast ${notification.type}`}>
    <div className="cia-toast-inner">
      <span className="cia-toast-emoji">
        {notification.type === 'error' ? '❌' : 
         notification.type === 'info' ? 'ℹ️' : '✅'}
      </span>
      {notification.message}
    </div>
  </div>
);

export default CommunityIncidentsApp;