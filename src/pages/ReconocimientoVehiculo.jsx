import React, { useState } from 'react';
import '../styles/vehiculo.css';

const VehicleRecognitionSystem = () => {
  const [currentView, setCurrentView] = useState('access'); // access, admin, security
  const [vehicleAtGate, setVehicleAtGate] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [accessResult, setAccessResult] = useState(null);
  const [detectedPlate, setDetectedPlate] = useState('');
  const [gateOpen, setGateOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Base de datos simulada de vehículos autorizados
  const [authorizedVehicles, setAuthorizedVehicles] = useState([
    { plate: 'ABC123', owner: 'Juan Pérez', apartment: '101', status: 'active' },
    { plate: 'DEF456', owner: 'María García', apartment: '205', status: 'active' },
    { plate: 'GHI789', owner: 'Carlos López', apartment: '312', status: 'blocked' },
    { plate: 'JKL012', owner: 'Ana Rodríguez', apartment: '148', status: 'active' }
  ]);

  // Registro de accesos
  const [accessLog, setAccessLog] = useState([
    { id: 1, plate: 'ABC123', type: 'entrada', datetime: '2024-01-15 08:30:45', status: 'aprobado' },
    { id: 2, plate: 'DEF456', type: 'salida', datetime: '2024-01-15 09:15:20', status: 'aprobado' },
    { id: 3, plate: 'XYZ999', type: 'entrada', datetime: '2024-01-15 10:20:15', status: 'denegado' }
  ]);

  const [newPlate, setNewPlate] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newApartment, setNewApartment] = useState('');

  // Simular detección de vehículo
  const simulateVehicleDetection = () => {
    if (!vehicleAtGate) {
      setVehicleAtGate(true);
      // Simular placas aleatorias para demo
      const plates = ['ABC123', 'DEF456', 'GHI789', 'XYZ999', 'JKL012', 'MNO345'];
      const randomPlate = plates[Math.floor(Math.random() * plates.length)];

      setTimeout(() => {
        processPlate(randomPlate);
      }, 2000);
    }
  };

  const processPlate = (plate) => {
    setIsProcessing(true);
    setDetectedPlate(plate);

    setTimeout(() => {
      const vehicle = authorizedVehicles.find(v => v.plate === plate);

      if (!vehicle) {
        setAccessResult({
          type: 'error',
          message: 'Acceso denegado, vehículo no autorizado',
          plate: plate
        });
      } else if (vehicle.status === 'blocked') {
        setAccessResult({
          type: 'warning',
          message: 'El vehículo tiene restricciones de acceso',
          plate: plate,
          owner: vehicle.owner
        });
      } else {
        setAccessResult({
          type: 'success',
          message: 'Acceso aprobado',
          plate: plate,
          owner: vehicle.owner,
          apartment: vehicle.apartment
        });
        setGateOpen(true);

        // Registrar el acceso
        const newLog = {
          id: accessLog.length + 1,
          plate: plate,
          type: 'entrada',
          datetime: new Date().toLocaleString('es-ES'),
          status: 'aprobado'
        };
        setAccessLog(prev => [newLog, ...prev]);

        // Cerrar portón después de 5 segundos
        setTimeout(() => {
          setGateOpen(false);
        }, 5000);
      }

      setIsProcessing(false);

      // Resetear después de mostrar resultado
      setTimeout(() => {
        setVehicleAtGate(false);
        setAccessResult(null);
        setDetectedPlate('');
      }, 4000);
    }, 3000);
  };

  const simulateCameraError = () => {
    setVehicleAtGate(true);
    setIsProcessing(true);

    setTimeout(() => {
      setAccessResult({
        type: 'error',
        message: 'No se pudo leer la placa, intente nuevamente'
      });
      setIsProcessing(false);

      setTimeout(() => {
        setVehicleAtGate(false);
        setAccessResult(null);
      }, 3000);
    }, 2000);
  };

  const addVehicle = () => {
    if (newPlate && newOwner && newApartment) {
      const newVehicle = {
        plate: newPlate.toUpperCase(),
        owner: newOwner,
        apartment: newApartment,
        status: 'active'
      };
      setAuthorizedVehicles(prev => [...prev, newVehicle]);
      setNewPlate('');
      setNewOwner('');
      setNewApartment('');
    }
  };

  const toggleVehicleStatus = (plate) => {
    setAuthorizedVehicles(prev =>
      prev.map(vehicle =>
        vehicle.plate === plate
          ? { ...vehicle, status: vehicle.status === 'active' ? 'blocked' : 'active' }
          : vehicle
      )
    );
  };

  const AccessControlView = () => (
    <div className="vrs__accessView">
      <div className="vrs__header">
        <h1 className="vrs__title">🚗 Control de Acceso Vehicular</h1>
        <div className="vrs__status">
          <span className="vrs__statusIndicator">🟢 Sistema Activo</span>
        </div>
      </div>

      <div className="vrs__cameraSection">
        <div className="vrs__cameraContainer">
          <div className="vrs__camera">
            {vehicleAtGate ? (
              <div className="vrs__vehicleDetected">
                🚙 VEHÍCULO DETECTADO
                {isProcessing && (
                  <div className="vrs__processing">
                    <div className="vrs__spinner"></div>
                    <p>Procesando placa con IA...</p>
                  </div>
                )}
                {detectedPlate && (
                  <div className="vrs__plateReading">
                    <strong>Placa detectada: {detectedPlate}</strong>
                  </div>
                )}
              </div>
            ) : (
              <div className="vrs__noVehicle">
                📷 Cámara de Reconocimiento
                <p>Esperando vehículo...</p>
              </div>
            )}
          </div>
        </div>

        <div className="vrs__gateSection">
          <div className={`vrs__gate ${gateOpen ? 'vrs__gate--open' : ''}`}>
            {gateOpen ? '🚪 PORTÓN ABIERTO' : '🚧 PORTÓN CERRADO'}
          </div>
        </div>
      </div>

      {accessResult && (
        <div
          className={`vrs__result ${
            accessResult.type === 'success'
              ? 'vrs__result--success'
              : accessResult.type === 'warning'
              ? 'vrs__result--warning'
              : 'vrs__result--error'
          }`}
        >
          <h3>{accessResult.message}</h3>
          {accessResult.owner && <p><strong>Propietario:</strong> {accessResult.owner}</p>}
          {accessResult.apartment && <p><strong>Apartamento:</strong> {accessResult.apartment}</p>}
          <p><strong>Placa:</strong> {accessResult.plate || 'No detectada'}</p>
          <p><strong>Hora:</strong> {new Date().toLocaleString('es-ES')}</p>
        </div>
      )}

      <div className="vrs__simulationButtons">
        <button
          className="vrs__btn"
          onClick={simulateVehicleDetection}
          disabled={vehicleAtGate}
        >
          🚗 Simular Vehículo
        </button>
        <button
          className="vrs__btn vrs__btn--secondary"
          onClick={simulateCameraError}
          disabled={vehicleAtGate}
        >
          📷 Simular Error de Cámara
        </button>
      </div>
    </div>
  );

  const AdminView = () => (
    <div className="vrs__adminView">
      <h2 className="vrs__sectionTitle">👨‍💼 Panel de Administración</h2>

      <div className="vrs__addVehicleSection">
        <h3>Registrar Nuevo Vehículo</h3>
        <div className="vrs__form">
          <input
            className="vrs__input"
            type="text"
            placeholder="Placa (ej: ABC123)"
            value={newPlate}
            onChange={(e) => setNewPlate(e.target.value)}
          />
          <input
            className="vrs__input"
            type="text"
            placeholder="Nombre del propietario"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
          />
          <input
            className="vrs__input"
            type="text"
            placeholder="Apartamento"
            value={newApartment}
            onChange={(e) => setNewApartment(e.target.value)}
          />
          <button className="vrs__btn" onClick={addVehicle}>
            ➕ Agregar Vehículo
          </button>
        </div>
      </div>

      <div className="vrs__vehicleList">
        <h3>Vehículos Autorizados</h3>
        <div className="vrs__gridTable">
          <div className="vrs__tableHeader">
            <span>Placa</span>
            <span>Propietario</span>
            <span>Apartamento</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>
          {authorizedVehicles.map(vehicle => (
            <div key={vehicle.plate} className="vrs__tableRow">
              <span className="vrs__plate">{vehicle.plate}</span>
              <span>{vehicle.owner}</span>
              <span>{vehicle.apartment}</span>
              <span
                className={`vrs__statusText ${
                  vehicle.status === 'active' ? 'vrs__statusText--active' : 'vrs__statusText--blocked'
                }`}
              >
                {vehicle.status === 'active' ? '✅ Activo' : '❌ Bloqueado'}
              </span>
              <button
                className="vrs__btn vrs__btn--small"
                onClick={() => toggleVehicleStatus(vehicle.plate)}
              >
                {vehicle.status === 'active' ? '🚫 Bloquear' : '✅ Activar'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SecurityView = () => (
    <div className="vrs__securityView">
      <h2 className="vrs__sectionTitle">🛡️ Bitácora de Seguridad</h2>

      <div className="vrs__logSection">
        <h3>Registro de Accesos Recientes</h3>
        <div className="vrs__gridTable">
          <div className="vrs__tableHeader">
            <span>Fecha/Hora</span>
            <span>Placa</span>
            <span>Tipo</span>
            <span>Estado</span>
          </div>
          {accessLog.map(log => (
            <div key={log.id} className="vrs__tableRow">
              <span>{log.datetime}</span>
              <span className="vrs__plate">{log.plate}</span>
              <span>{log.type === 'entrada' ? '↗️ Entrada' : '↙️ Salida'}</span>
              <span
                className={`vrs__statusText ${
                  log.status === 'aprobado' ? 'vrs__statusText--approved' : 'vrs__statusText--denied'
                }`}
              >
                {log.status === 'aprobado' ? '✅ Aprobado' : '❌ Denegado'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="vrs__container">
      <nav className="vrs__navigation">
        <button
          className={`vrs__navButton ${currentView === 'access' ? 'vrs__navButton--active' : 'vrs__navButton--inactive'}`}
          onClick={() => setCurrentView('access')}
        >
          🚗 Control de Acceso
        </button>
        <button
          className={`vrs__navButton ${currentView === 'admin' ? 'vrs__navButton--active' : 'vrs__navButton--inactive'}`}
          onClick={() => setCurrentView('admin')}
        >
          👨‍💼 Administración
        </button>
        <button
          className={`vrs__navButton ${currentView === 'security' ? 'vrs__navButton--active' : 'vrs__navButton--inactive'}`}
          onClick={() => setCurrentView('security')}
        >
          🛡️ Seguridad
        </button>
      </nav>

      {currentView === 'access' && <AccessControlView />}
      {currentView === 'admin' && <AdminView />}
      {currentView === 'security' && <SecurityView />}
    </div>
  );
};

export default VehicleRecognitionSystem;