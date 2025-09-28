import React, { useState, useEffect } from 'react';
import '../styles/Correspondencia.css';

const CorrespondenceManagement = () => {
  const [correspondences, setCorrespondences] = useState([]);
  const [residents, setResidents] = useState([
    { id: 1, name: 'Juan Pérez', apartment: '101', phone: '555-0001' },
    { id: 2, name: 'María García', apartment: '102', phone: '555-0002' },
    { id: 3, name: 'Carlos López', apartment: '201', phone: '555-0003' },
    { id: 4, name: 'Ana Martínez', apartment: '202', phone: '555-0004' },
    { id: 5, name: 'Luis Rodríguez', apartment: '301', phone: '555-0005' }
  ]);
  
  const [currentView, setCurrentView] = useState('list');
  const [notification, setNotification] = useState(null);
  const [selectedCorrespondence, setSelectedCorrespondence] = useState(null);
  const [editingCorrespondence, setEditingCorrespondence] = useState(null);
  
  // Formulario para nuevo registro
  const [formData, setFormData] = useState({
    destinatario: '',
    tipo: 'carta',
    observaciones: ''
  });
  
  // Formulario para entrega
  const [deliveryData, setDeliveryData] = useState({
    correspondenceId: '',
    residentId: ''
  });

  // Mostrar notificación temporal
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Registrar nueva correspondencia
  const handleSubmitNew = () => {
    if (!formData.destinatario || !formData.tipo) {
      showNotification('Complete los campos requeridos', 'error');
      return;
    }
    const searchTerm = formData.destinatario.toLowerCase().trim();
    const resident = residents.find(r => 
      r.name.toLowerCase().includes(searchTerm) ||
      r.apartment === formData.destinatario.trim() ||
      r.name.toLowerCase().split(' ').some(part => part.includes(searchTerm))
    );
    if (!resident) {
      showNotification('Destinatario no registrado', 'error');
      return;
    }
    const newCorrespondence = {
      id: Date.now(),
      destinatario: resident.name,
      apartamento: resident.apartment,
      tipo: formData.tipo,
      observaciones: formData.observaciones,
      estado: 'Pendiente de retiro',
      fechaLlegada: new Date().toLocaleDateString('es-ES'),
      fechaEntrega: null,
      residentId: resident.id
    };
    setCorrespondences([...correspondences, newCorrespondence]);
    showNotification(`Correspondencia registrada. Notificación enviada a ${resident.name}`, 'success');
    setFormData({ destinatario: '', tipo: 'carta', observaciones: '' });
    setCurrentView('list');
  };

  // Eliminar correspondencia
  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este registro?')) {
      setCorrespondences(correspondences.filter(c => c.id !== id));
      showNotification('Registro eliminado correctamente', 'success');
    }
  };

  // Editar correspondencia
  const handleEdit = (correspondence) => {
    setEditingCorrespondence(correspondence);
    setFormData({
      destinatario: correspondence.destinatario,
      tipo: correspondence.tipo,
      observaciones: correspondence.observaciones
    });
    setCurrentView('edit');
  };

  // Actualizar correspondencia
  const handleUpdate = () => {
    if (!formData.destinatario || !formData.tipo) {
      showNotification('Complete los campos requeridos', 'error');
      return;
    }
    const searchTerm = formData.destinatario.toLowerCase().trim();
    const resident = residents.find(r => 
      r.name.toLowerCase().includes(searchTerm) ||
      r.apartment === formData.destinatario.trim() ||
      r.name.toLowerCase().split(' ').some(part => part.includes(searchTerm))
    );
    if (!resident) {
      showNotification('Destinatario no registrado', 'error');
      return;
    }
    setCorrespondences(correspondences.map(c => 
      c.id === editingCorrespondence.id 
        ? { 
            ...c, 
            destinatario: resident.name,
            apartamento: resident.apartment,
            tipo: formData.tipo,
            observaciones: formData.observaciones,
            residentId: resident.id
          }
        : c
    ));
    showNotification('Correspondencia actualizada correctamente', 'success');
    setFormData({ destinatario: '', tipo: 'carta', observaciones: '' });
    setEditingCorrespondence(null);
    setCurrentView('list');
  };

  // Ver detalles
  const handleViewDetails = (correspondence) => {
    setSelectedCorrespondence(correspondence);
    setCurrentView('details');
  };

  // Entregar correspondencia
  const handleDelivery = () => {
    if (!deliveryData.correspondenceId || !deliveryData.residentId) {
      showNotification('Seleccione la correspondencia y verifique la identidad', 'error');
      return;
    }
    const correspondence = correspondences.find(c => c.id === parseInt(deliveryData.correspondenceId));
    const resident = residents.find(r => r.id === parseInt(deliveryData.residentId));
    if (!correspondence) {
      showNotification('Correspondencia no encontrada', 'error');
      return;
    }
    if (correspondence.residentId !== resident.id) {
      showNotification('La identidad no coincide con el destinatario', 'error');
      return;
    }
    setCorrespondences(correspondences.map(c => 
      c.id === correspondence.id 
        ? { ...c, estado: 'Entregado', fechaEntrega: new Date().toLocaleDateString('es-ES') }
        : c
    ));
    showNotification(`Correspondencia entregada exitosamente a ${resident.name}`, 'success');
    setDeliveryData({ correspondenceId: '', residentId: '' });
    setCurrentView('list');
  };

  const pendingCorrespondences = correspondences.filter(c => c.estado === 'Pendiente de retiro');

  return (
    <div className="cm-container">
      <header className="cm-header">
        <h1 className="cm-title">Sistema de Gestión de Correspondencia</h1>
        <p className="cm-subtitle">Portal de Seguridad</p>
      </header>

      {/* Notificaciones */}
      {notification && (
        <div className={`cm-notif ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Navegación */}
      <nav className="cm-nav">
        <button 
          className={`cm-nav-btn ${currentView === 'list' ? 'active' : ''}`}
          onClick={() => setCurrentView('list')}
        >
          📋 Lista de Correspondencia
        </button>
        <button 
          className={`cm-nav-btn ${currentView === 'new' ? 'active' : ''}`}
          onClick={() => setCurrentView('new')}
        >
          ➕ Nuevo Registro
        </button>
        <button 
          className={`cm-nav-btn ${currentView === 'deliver' ? 'active' : ''}`}
          onClick={() => setCurrentView('deliver')}
        >
          📦 Entregar Correspondencia
        </button>
      </nav>

      {/* Vista Lista */}
      {currentView === 'list' && (
        <div className="cm-content">
          <h2 className="cm-section-title">Registro de Correspondencia</h2>
          
          <div className="cm-stats">
            <div className="cm-stat-card">
              <h3>Total</h3>
              <span className="cm-stat-number">{correspondences.length}</span>
            </div>
            <div className="cm-stat-card pending">
              <h3>Pendientes</h3>
              <span className="cm-stat-number">{pendingCorrespondences.length}</span>
            </div>
            <div className="cm-stat-card delivered">
              <h3>Entregadas</h3>
              <span className="cm-stat-number">{correspondences.filter(c => c.estado === 'Entregado').length}</span>
            </div>
          </div>

          {correspondences.length === 0 ? (
            <div className="cm-empty">
              <p>No hay correspondencia registrada</p>
              <button 
                className="cm-btn primary"
                onClick={() => setCurrentView('new')}
              >
                ➕ Registrar Primera Correspondencia
              </button>
            </div>
          ) : (
            <div className="cm-table">
              <div className="cm-table-header">
                <div className="cm-cell">Fecha Llegada</div>
                <div className="cm-cell">Destinatario</div>
                <div className="cm-cell">Apto</div>
                <div className="cm-cell">Tipo</div>
                <div className="cm-cell">Estado</div>
                <div className="cm-cell">Acciones</div>
              </div>
              {correspondences.map((item) => (
                <div key={item.id} className="cm-table-row">
                  <div className="cm-cell">{item.fechaLlegada}</div>
                  <div className="cm-cell">{item.destinatario}</div>
                  <div className="cm-cell">{item.apartamento}</div>
                  <div className="cm-cell">
                    <span className={`cm-type ${item.tipo === 'paquete' ? 'paquete' : 'carta'}`}>
                      {item.tipo}
                    </span>
                  </div>
                  <div className="cm-cell">
                    <span className={`cm-status ${item.estado === 'Entregado' ? 'delivered' : 'pending'}`}>
                      {item.estado}
                    </span>
                  </div>
                  <div className="cm-cell">
                    <button 
                      className="cm-action view"
                      onClick={() => handleViewDetails(item)}
                      title="Ver detalles"
                    >
                      👁️ Ver
                    </button>
                    <button 
                      className="cm-action edit"
                      onClick={() => handleEdit(item)}
                      title="Editar"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className="cm-action delete"
                      onClick={() => handleDelete(item.id)}
                      title="Eliminar"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vista Detalles */}
      {currentView === 'details' && selectedCorrespondence && (
        <div className="cm-content">
          <h2 className="cm-section-title">📄 Detalles de Correspondencia</h2>
          
          <div className="cm-details">
            <div className="cm-details-grid">
              <div className="cm-detail-card">
                <div className="cm-detail-label">ID de Registro</div>
                <div className="cm-detail-value">{selectedCorrespondence.id}</div>
              </div>
              <div className="cm-detail-card">
                <div className="cm-detail-label">Destinatario</div>
                <div className="cm-detail-value">{selectedCorrespondence.destinatario}</div>
              </div>
              <div className="cm-detail-card">
                <div className="cm-detail-label">Apartamento</div>
                <div className="cm-detail-value">{selectedCorrespondence.apartamento}</div>
              </div>
              <div className="cm-detail-card">
                <div className="cm-detail-label">Tipo</div>
                <div className="cm-detail-value">
                  <span className={`cm-type ${selectedCorrespondence.tipo === 'paquete' ? 'paquete' : 'carta'}`}>
                    {selectedCorrespondence.tipo.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="cm-detail-card">
                <div className="cm-detail-label">Estado</div>
                <div className="cm-detail-value">
                  <span className={`cm-status ${selectedCorrespondence.estado === 'Entregado' ? 'delivered' : 'pending'}`}>
                    {selectedCorrespondence.estado}
                  </span>
                </div>
              </div>
              <div className="cm-detail-card">
                <div className="cm-detail-label">Fecha de Llegada</div>
                <div className="cm-detail-value">{selectedCorrespondence.fechaLlegada}</div>
              </div>
              <div className="cm-detail-card">
                <div className="cm-detail-label">Fecha de Entrega</div>
                <div className="cm-detail-value">{selectedCorrespondence.fechaEntrega || 'Pendiente'}</div>
              </div>
              <div className="cm-detail-card">
                <div className="cm-detail-label">Residente ID</div>
                <div className="cm-detail-value">{selectedCorrespondence.residentId}</div>
              </div>
            </div>

            {selectedCorrespondence.observaciones && (
              <div className="cm-detail-card">
                <div className="cm-detail-label">Observaciones</div>
                <div className="cm-detail-value">{selectedCorrespondence.observaciones}</div>
              </div>
            )}

            <div className="cm-form-actions">
              <button 
                className="cm-action edit lg"
                onClick={() => handleEdit(selectedCorrespondence)}
              >
                ✏️ Editar Correspondencia
              </button>
              <button 
                className="cm-btn secondary"
                onClick={() => setCurrentView('list')}
              >
                ⬅️ Volver a la Lista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista Editar */}
      {currentView === 'edit' && (
        <div className="cm-content">
          <h2 className="cm-section-title">✏️ Editar Correspondencia</h2>
          
          <div className="cm-form">
            <div className="cm-edit-banner">
              <h4>⚠️ Editando Registro ID: {editingCorrespondence?.id}</h4>
              <div>Modifique los campos necesarios y guarde los cambios.</div>
            </div>

            <div className="cm-form-group">
              <label className="cm-label">Destinatario (Nombre o Apartamento) *</label>
              <input
                type="text"
                className="cm-input"
                value={formData.destinatario}
                onChange={(e) => setFormData({...formData, destinatario: e.target.value})}
                placeholder="Ej: Juan, Pérez, Juan Pérez, 101, etc."
              />
            </div>

            <div className="cm-form-group">
              <label className="cm-label">Tipo de Correspondencia *</label>
              <select
                className="cm-select"
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              >
                <option value="carta">Carta</option>
                <option value="paquete">Paquete</option>
              </select>
            </div>

            <div className="cm-form-group">
              <label className="cm-label">Observaciones</label>
              <textarea
                className="cm-textarea"
                value={formData.observaciones}
                onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                placeholder="Observaciones adicionales (opcional)"
                rows="3"
              />
            </div>

            <div className="cm-form-actions">
              <button onClick={handleUpdate} className="cm-btn primary">
                💾 Guardar Cambios
              </button>
              <button 
                className="cm-btn secondary"
                onClick={() => {
                  setCurrentView('list');
                  setEditingCorrespondence(null);
                  setFormData({ destinatario: '', tipo: 'carta', observaciones: '' });
                }}
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista Nuevo Registro */}
      {currentView === 'new' && (
        <div className="cm-content">
          <h2 className="cm-section-title">➕ Registrar Nueva Correspondencia</h2>
          
          <div className="cm-form">
            <div className="cm-hint">
              <h4>📋 Residentes Registrados:</h4>
              <div>
                <strong>Por nombre:</strong> Juan Pérez, María García, Carlos López, Ana Martínez, Luis Rodríguez<br/>
                <strong>Por apartamento:</strong> 101, 102, 201, 202, 301<br/>
                <strong>Búsqueda flexible:</strong> Puedes escribir solo el nombre "Juan" o apellido "Pérez"
              </div>
            </div>

            <div className="cm-form-group">
              <label className="cm-label">Destinatario (Nombre o Apartamento) *</label>
              <input
                type="text"
                className="cm-input"
                value={formData.destinatario}
                onChange={(e) => setFormData({...formData, destinatario: e.target.value})}
                placeholder="Ej: Juan, Pérez, Juan Pérez, 101, etc."
              />
            </div>

            <div className="cm-form-group">
              <label className="cm-label">Tipo de Correspondencia *</label>
              <select
                className="cm-select"
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              >
                <option value="carta">Carta</option>
                <option value="paquete">Paquete</option>
              </select>
            </div>

            <div className="cm-form-group">
              <label className="cm-label">Observaciones</label>
              <textarea
                className="cm-textarea"
                value={formData.observaciones}
                onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                placeholder="Observaciones adicionales (opcional)"
                rows="3"
              />
            </div>

            <div className="cm-form-actions">
              <button onClick={handleSubmitNew} className="cm-btn primary">
                ✅ Registrar Correspondencia
              </button>
              <button 
                className="cm-btn secondary"
                onClick={() => setCurrentView('list')}
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista Entregar Correspondencia */}
      {currentView === 'deliver' && (
        <div className="cm-content">
          <h2 className="cm-section-title">📦 Entregar Correspondencia</h2>
          
          {pendingCorrespondences.length === 0 ? (
            <div className="cm-empty">
              <p>📭 No hay correspondencia pendiente de entrega</p>
              <button 
                className="cm-btn primary"
                onClick={() => setCurrentView('new')}
              >
                ➕ Registrar Nueva Correspondencia
              </button>
            </div>
          ) : (
            <div className="cm-form">
              <div className="cm-deliver-banner">
                <h4>📋 Correspondencia Pendiente: {pendingCorrespondences.length} elementos</h4>
                <div>Seleccione la correspondencia a entregar y verifique la identidad del residente.</div>
              </div>

              <div className="cm-form-group">
                <label className="cm-label">Seleccionar Correspondencia *</label>
                <select
                  className="cm-select"
                  value={deliveryData.correspondenceId}
                  onChange={(e) => setDeliveryData({...deliveryData, correspondenceId: e.target.value})}
                >
                  <option value="">-- Seleccione una correspondencia --</option>
                  {pendingCorrespondences.map((item) => (
                    <option key={item.id} value={item.id}>
                      📧 {item.destinatario} - Apto {item.apartamento} ({item.tipo}) - {item.fechaLlegada}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cm-form-group">
                <label className="cm-label">Verificar Identidad del Residente *</label>
                <select
                  className="cm-select"
                  value={deliveryData.residentId}
                  onChange={(e) => setDeliveryData({...deliveryData, residentId: e.target.value})}
                >
                  <option value="">-- Seleccione al residente --</option>
                  {residents.map((resident) => (
                    <option key={resident.id} value={resident.id}>
                      👤 {resident.name} - Apto {resident.apartment} - Tel: {resident.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cm-form-actions">
                <button onClick={handleDelivery} className="cm-btn primary">
                  ✅ Confirmar Entrega
                </button>
                <button 
                  className="cm-btn secondary"
                  onClick={() => setCurrentView('list')}
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CorrespondenceManagement;