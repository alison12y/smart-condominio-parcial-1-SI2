import React, { useState } from 'react';
import '../styles/Mantenimiento.css';

const MaintenanceManagement = () => {
  const [currentUser, setCurrentUser] = useState('residente'); // residente, administrador, personal
  const [currentView, setCurrentView] = useState('dashboard');
  const [requests, setRequests] = useState([
    {
      id: 1,
      description: 'Ascensor no funciona en el piso 5',
      resident: 'Juan Pérez',
      date: '2025-09-25',
      status: 'pendiente',
      assignedTo: '',
      category: 'Ascensor'
    },
    {
      id: 2,
      description: 'Filtración en el baño principal',
      resident: 'María García',
      date: '2025-09-24',
      status: 'en-proceso',
      assignedTo: 'Carlos Martínez',
      category: 'Plomería'
    },
    {
      id: 3,
      description: 'Luz del pasillo no enciende',
      resident: 'Pedro López',
      date: '2025-09-23',
      status: 'finalizado',
      assignedTo: 'Luis Rodríguez',
      category: 'Electricidad'
    }
  ]);

  const [newRequest, setNewRequest] = useState({ description: '', category: 'Ascensor' });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [assignee, setAssignee] = useState('');
  const [notification, setNotification] = useState('');

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 2500);
  };

  // ----- Crear, asignar, completar, finalizar -----
  const handleCreateRequest = () => {
    if (!newRequest.description.trim()) {
      showNotification('Debe completar la descripción del problema.');
      return;
    }
    const request = {
      id: requests.length + 1,
      description: newRequest.description,
      resident: 'Usuario Actual',
      date: new Date().toISOString().split('T')[0],
      status: 'pendiente',
      assignedTo: '',
      category: newRequest.category
    };
    setRequests((prev) => [...prev, request]);
    setNewRequest({ description: '', category: 'Ascensor' });
    showNotification('Solicitud creada exitosamente.');
    setCurrentView('dashboard');
  };

  const handleAssignTask = (requestId) => {
    if (!assignee.trim()) {
      showNotification('No se pudo asignar la tarea, intente otra vez');
      return;
    }
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: 'en-proceso', assignedTo: assignee } : req
      )
    );
    showNotification('Tarea asignada exitosamente');
    setSelectedRequest(null);
    setAssignee('');
  };

  const handleCompleteTask = (requestId) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'completada' } : req))
    );
    showNotification('Tarea marcada como completada');
  };

  const handleCloseRequest = (requestId) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'finalizado' } : req))
    );
    showNotification('Solicitud finalizada');
    setSelectedRequest(null);
  };

  // ----- Helpers de UI -----
  const getStatusClass = (status) => {
    switch (status) {
      case 'pendiente': return 'badge--warning';
      case 'en-proceso': return 'badge--info';
      case 'completada': return 'badge--success';
      case 'finalizado': return 'badge--muted';
      default: return 'badge--default';
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'en-proceso': return 'En Proceso';
      case 'completada': return 'Completada';
      case 'finalizado': return 'Finalizado';
      default: return status;
    }
  };
  const filteredRequests = () => {
    if (currentUser === 'personal') {
      return requests.filter((r) => r.assignedTo === 'Usuario Personal' || r.status === 'en-proceso');
    }
    return requests;
  };

  return (
    <div className="mm">
      {notification && <div className="toast">{notification}</div>}

      {/* Header */}
      <div className="card card--header">
        <h1 className="title">Sistema de Gestión de Mantenimiento</h1>

        <div className="segmented">
          <button
            className={`segmented__btn ${currentUser === 'residente' ? 'is-active' : ''}`}
            onClick={() => setCurrentUser('residente')}
          >
            Residente
          </button>
          <button
            className={`segmented__btn ${currentUser === 'administrador' ? 'is-active' : ''}`}
            onClick={() => setCurrentUser('administrador')}
          >
            Administrador
          </button>
          <button
            className={`segmented__btn ${currentUser === 'personal' ? 'is-active' : ''}`}
            onClick={() => setCurrentUser('personal')}
          >
            Personal Mantenimiento
          </button>
        </div>

        <div className="tabs">
          <button
            className={`tab ${currentView === 'dashboard' ? 'is-active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </button>
          {currentUser === 'residente' && (
            <button
              className={`tab ${currentView === 'new-request' ? 'is-active' : ''}`}
              onClick={() => setCurrentView('new-request')}
            >
              Nueva Solicitud
            </button>
          )}
        </div>
      </div>

      {/* Dashboard */}
      {currentView === 'dashboard' && (
        <div className="card">
          <h2 className="subtitle">
            {currentUser === 'residente' && 'Mis Solicitudes de Mantenimiento'}
            {currentUser === 'administrador' && 'Gestión de Solicitudes'}
            {currentUser === 'personal' && 'Tareas Asignadas'}
          </h2>

          <div className="list">
            {filteredRequests().map((request) => (
              <div key={request.id} className="ticket">
                <div className="ticket__body">
                  <div className="ticket__left">
                    <h3 className="ticket__title">
                      {request.category} - Solicitud #{request.id}
                    </h3>
                    <p className="ticket__text"><strong>Descripción:</strong> {request.description}</p>
                    <p className="ticket__text"><strong>Solicitante:</strong> {request.resident}</p>
                    <p className="ticket__text"><strong>Fecha:</strong> {request.date}</p>
                    {request.assignedTo && (
                      <p className="ticket__text"><strong>Asignado a:</strong> {request.assignedTo}</p>
                    )}
                  </div>

                  <div className="ticket__right">
                    <span className={`badge ${getStatusClass(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>

                    <div className="actions">
                      {currentUser === 'administrador' && request.status === 'pendiente' && (
                        <button
                          className="btn btn--success"
                          onClick={() => { setSelectedRequest(request); setAssignee(''); }}
                        >
                          Asignar
                        </button>
                      )}
                      {currentUser === 'administrador' && request.status === 'completada' && (
                        <button
                          className="btn btn--muted"
                          onClick={() => handleCloseRequest(request.id)}
                        >
                          Finalizar
                        </button>
                      )}
                      {currentUser === 'personal' && request.status === 'en-proceso' && (
                        <button
                          className="btn btn--warning"
                          onClick={() => handleCompleteTask(request.id)}
                        >
                          Completar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredRequests().length === 0 && (
              <div className="empty">No hay solicitudes para mostrar.</div>
            )}
          </div>
        </div>
      )}

      {/* Nueva Solicitud (como tu segunda imagen) */}
      {currentView === 'new-request' && currentUser === 'residente' && (
        <div className="card card--form stacked">
          <h2 className="subtitle">Nueva Solicitud de Mantenimiento</h2>

          <form
            className="form form--stack"
            onSubmit={(e) => { e.preventDefault(); handleCreateRequest(); }}
          >
            <div className="field">
              <label className="label" htmlFor="categoria">Categoría:</label>
              <select
                id="categoria"
                className="input"
                value={newRequest.category}
                onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
              >
                <option value="Ascensor">Ascensor</option>
                <option value="Electricidad">Electricidad</option>
                <option value="Plomería">Plomería</option>
                <option value="Limpieza">Limpieza</option>
                <option value="Seguridad">Seguridad</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="field">
              <label className="label" htmlFor="descripcion">Descripción del problema:</label>
              <textarea
                id="descripcion"
                className="textarea"
                rows={6}
                placeholder="Describa detalladamente el problema que requiere mantenimiento..."
                value={newRequest.description}
                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
              />
            </div>

            <div className="actions form__actions-left">
              <button type="submit" className="btn btn--success">Enviar Solicitud</button>
              <button
                type="button"
                className="btn btn--muted"
                onClick={() => setNewRequest({ description: '', category: 'Ascensor' })}
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Asignación */}
      {selectedRequest && (
        <div className="modal">
          <div className="modal__backdrop" onClick={() => setSelectedRequest(null)} />
          <div className="modal__content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <h3 id="modal-title" className="modal__title">
              Asignar Tarea - Solicitud #{selectedRequest.id}
            </h3>
            <p className="modal__desc"><strong>Problema:</strong> {selectedRequest.description}</p>

            <div className="field">
              <label className="label" htmlFor="asignarA">Asignar a:</label>
              <select
                id="asignarA"
                className="input"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Seleccionar personal...</option>
                <option value="Carlos Martínez">Carlos Martínez (Plomero)</option>
                <option value="Luis Rodríguez">Luis Rodríguez (Electricista)</option>
                <option value="Ana López">Ana López (Mantenimiento General)</option>
                <option value="Externo">Personal Externo</option>
              </select>
            </div>

            <div className="actions actions--end">
              <button className="btn btn--success" onClick={() => handleAssignTask(selectedRequest.id)}>
                Asignar
              </button>
              <button className="btn btn--muted" onClick={() => setSelectedRequest(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceManagement;