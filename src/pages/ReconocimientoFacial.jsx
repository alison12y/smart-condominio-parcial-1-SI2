import React, { useState, useEffect, useRef } from 'react';
import '../styles/ReconocimientoFacial.css';

const FacialAccessSystem = () => {
  const [currentStep, setCurrentStep] = useState('approaching');
  const [accessStatus, setAccessStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [accessLog, setAccessLog] = useState([]);
  const [cameraActive, setCameraActive] = useState(true);
  const [lightingCondition, setLightingCondition] = useState('good');
  const videoRef = useRef(null);

  // Base de datos simulada de residentes
  const residentsDB = [
    { id: 1, name: 'Juan Pérez', apartment: 'A-101', photo: '👨‍💼', status: 'active' },
    { id: 2, name: 'María García', apartment: 'B-205', photo: '👩‍💼', status: 'active' },
    { id: 3, name: 'Carlos López', apartment: 'C-301', photo: '👨‍🦱', status: 'blocked' },
    { id: 4, name: 'Ana Martínez', apartment: 'A-102', photo: '👩‍🦰', status: 'active' }
  ];

  const simulateFacialRecognition = () => {
    setIsProcessing(true);
    setCurrentStep('processing');

    setTimeout(() => {
      if (!cameraActive) {
        setAccessStatus('camera_error');
        setCurrentStep('error');
        setIsProcessing(false);
        return;
      }

      if (lightingCondition === 'poor') {
        setAccessStatus('lighting_error');
        setCurrentStep('error');
        setIsProcessing(false);
        return;
      }

      // Simular reconocimiento (70% probabilidad de éxito)
      const recognitionSuccess = Math.random() > 0.3;

      if (recognitionSuccess) {
        // Seleccionar un residente aleatorio
        const resident = residentsDB[Math.floor(Math.random() * residentsDB.length)];

        if (resident.status === 'blocked') {
          setAccessStatus('user_blocked');
          setUserProfile(resident);
          setCurrentStep('error');
        } else {
          setAccessStatus('access_granted');
          setUserProfile(resident);
          setCurrentStep('success');

          // Agregar al registro
          const logEntry = {
            id: Date.now(),
            resident: resident.name,
            apartment: resident.apartment,
            timestamp: new Date().toLocaleString(),
            type: 'entry'
          };
          setAccessLog(prev => [logEntry, ...prev]);
        }
      } else {
        setAccessStatus('face_not_recognized');
        setCurrentStep('error');
      }

      setIsProcessing(false);
    }, 3000);
  };

  const resetSystem = () => {
    setCurrentStep('approaching');
    setAccessStatus(null);
    setUserProfile(null);
    setIsProcessing(false);
  };

  const simulateExit = () => {
    if (userProfile) {
      const logEntry = {
        id: Date.now(),
        resident: userProfile.name,
        apartment: userProfile.apartment,
        timestamp: new Date().toLocaleString(),
        type: 'exit'
      };
      setAccessLog(prev => [logEntry, ...prev]);
    }
    resetSystem();
  };

  const getStatusMessage = () => {
    switch (accessStatus) {
      case 'access_granted':
        return 'Acceso autorizado. Bienvenido.';
      case 'face_not_recognized':
        return 'Acceso denegado, usuario no autorizado.';
      case 'lighting_error':
        return 'No se pudo validar el rostro, intente nuevamente.';
      case 'camera_error':
        return 'No se pudo validar el rostro, intente nuevamente.';
      case 'user_blocked':
        return 'El residente tiene restricciones de acceso.';
      default:
        return '';
    }
  };

  return (
    <div className="fas__app">
      

      <div className="fas__grid">
        {/* Panel Principal */}
        <div className="fas__panel fas__panel--main">
          <h2 className="fas__h2">Punto de Acceso Principal</h2>

          {/* Simulación de Cámara */}
          <div
            className="fas__cameraBox"
            style={{ backgroundColor: cameraActive ? '#ecf0f1' : '#e74c3c' }}
          >
            {cameraActive ? (
              <>
                <div className="fas__cameraEmoji">📹</div>
                {isProcessing && (
                  <div className="fas__processingOverlay">
                    Procesando con IA...
                  </div>
                )}
                {userProfile && currentStep === 'success' && (
                  <div className="fas__userPhoto">
                    {userProfile.photo}
                  </div>
                )}
              </>
            ) : (
              <div className="fas__cameraNoSignal">Cámara Sin Señal</div>
            )}
          </div>

          {/* Indicador de Estado */}
          <div
            className="fas__statusBar"
            style={{
              backgroundColor:
                currentStep === 'success'
                  ? '#2ecc71'
                  : currentStep === 'error'
                  ? '#e74c3c'
                  : currentStep === 'processing'
                  ? '#f39c12'
                  : '#3498db'
            }}
          >
            {currentStep === 'approaching' && 'Sistema listo. Acérquese al punto de acceso.'}
            {currentStep === 'processing' && 'Procesando reconocimiento facial...'}
            {currentStep === 'success' && getStatusMessage()}
            {currentStep === 'error' && getStatusMessage()}
          </div>

          {/* Información del Usuario */}
          {userProfile && (
            <div className="fas__userInfo">
              <h3>Información del Residente</h3>
              <p><strong>Nombre:</strong> {userProfile.name}</p>
              <p><strong>Apartamento:</strong> {userProfile.apartment}</p>
              <p><strong>Estado:</strong> {userProfile.status === 'active' ? 'Activo' : 'Bloqueado'}</p>
              <p><strong>Fecha/Hora:</strong> {new Date().toLocaleString()}</p>
            </div>
          )}

          {/* Controles */}
          <div className="fas__controls">
            <button
              onClick={simulateFacialRecognition}
              disabled={isProcessing || currentStep === 'success'}
              className={`fas__btn fas__btn--primary ${isProcessing ? 'fas__btn--disabled' : ''}`}
            >
              {isProcessing ? 'Procesando...' : 'Solicitar Acceso'}
            </button>

            {currentStep === 'success' && (
              <button
                onClick={simulateExit}
                className="fas__btn fas__btn--warning"
              >
                Registrar Salida
              </button>
            )}

            <button
              onClick={resetSystem}
              className="fas__btn fas__btn--secondary"
            >
              Reiniciar Sistema
            </button>
          </div>
        </div>

        {/* Panel de Control */}
        <div className="fas__panel fas__panel--side">
          <h3 className="fas__h3">Panel de Administración</h3>

          <div className="fas__section">
            <h4 className="fas__h4">Estado de Cámaras</h4>
            <label className="fas__toggleRow">
              <input
                type="checkbox"
                checked={cameraActive}
                onChange={(e) => setCameraActive(e.target.checked)}
              />
              <span>Cámara Activa</span>
            </label>
          </div>

          <div className="fas__section">
            <h4 className="fas__h4">Condiciones de Iluminación</h4>
            <select
              value={lightingCondition}
              onChange={(e) => setLightingCondition(e.target.value)}
              className="fas__select"
            >
              <option value="good">Buena iluminación</option>
              <option value="poor">Iluminación deficiente</option>
            </select>
          </div>

          <div className="fas__section">
            <h4 className="fas__h4">Residentes Registrados</h4>
            <div className="fas__residentList">
              {residentsDB.map(resident => (
                <div
                  key={resident.id}
                  className="fas__residentItem"
                  style={{
                    backgroundColor: resident.status === 'active' ? '#d5f4e6' : '#ffeaa7'
                  }}
                >
                  <div>{resident.photo} {resident.name}</div>
                  <div className="fas__residentSub">
                    {resident.apartment} - {resident.status === 'active' ? 'Activo' : 'Bloqueado'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bitácora de Seguridad */}
      <div className="fas__logCard">
        <h3 className="fas__h3">Bitácora de Seguridad</h3>
        {accessLog.length === 0 ? (
          <p className="fas__logEmpty">No hay registros de acceso</p>
        ) : (
          <div className="fas__logTableWrap">
            <table className="fas__table">
              <thead>
                <tr className="fas__theadRow">
                  <th className="fas__th fas__th--left">Fecha/Hora</th>
                  <th className="fas__th fas__th--left">Residente</th>
                  <th className="fas__th fas__th--left">Apartamento</th>
                  <th className="fas__th fas__th--left">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {accessLog.map(entry => (
                  <tr key={entry.id} className="fas__tr">
                    <td className="fas__td">{entry.timestamp}</td>
                    <td className="fas__td">{entry.resident}</td>
                    <td className="fas__td">{entry.apartment}</td>
                    <td className="fas__td">
                      <span
                        className="fas__badge"
                        style={{
                          backgroundColor: entry.type === 'entry' ? '#d4edda' : '#fff3cd',
                          color: entry.type === 'entry' ? '#155724' : '#856404'
                        }}
                      >
                        {entry.type === 'entry' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacialAccessSystem;