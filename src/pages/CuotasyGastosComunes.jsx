import React from "react";
import "../styles/CuotasyGastos.css";
import { useCuotasGastosComunes } from "../api/CuotasyGastos"; // JS del backend

const CuotasGastosComunes = () => {
  const {
    currentSection, setCurrentSection,
    cuotas, multasServicios, residentes,
    nuevaCuota, setNuevaCuota,
    nuevoMultaServicio, setNuevoMultaServicio,
    calculoCuotas,
    showModalCuota, setShowModalCuota,
    showModalMulta, setShowModalMulta,
    showModalCalculo, setShowModalCalculo,
    editingCuota, editingMulta,
    errors, successMessage,
    handleAgregarCuota, handleEditarCuota,
    handleAgregarMultaServicio, handleEditarMultaServicio,
    calcularCuotaTotal, resetModalStates, formatCurrency
  } = useCuotasGastosComunes(); // mismo comportamiento

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1 className="title">Cuotas y Gastos Comunes</h1>
      </div>

      {/* Success */}
      {successMessage && <div className="successMessage">{successMessage}</div>}

      {/* Tabs */}
      <div className="tabs" role="tablist" aria-label="Secciones">
        <button
          className={`tab ${currentSection === 'cuotas' ? 'activeTab' : ''}`}
          role="tab" aria-selected={currentSection === 'cuotas'}
          onClick={() => setCurrentSection('cuotas')}
        >Gestionar Cuotas</button>
        <button
          className={`tab ${currentSection === 'multas' ? 'activeTab' : ''}`}
          role="tab" aria-selected={currentSection === 'multas'}
          onClick={() => setCurrentSection('multas')}
        >Multas y Servicios</button>
        <button
          className={`tab ${currentSection === 'calculo' ? 'activeTab' : ''}`}
          role="tab" aria-selected={currentSection === 'calculo'}
          onClick={() => setCurrentSection('calculo')}
        >Calcular Cuotas</button>
      </div>

      {/* Cuotas */}
      {currentSection === 'cuotas' && (
        <div className="section">
          <div className="sectionHeader">
            <h2 className="sectionTitle">Definir Cuotas</h2>
            <button
              className="primaryButton"
              onClick={() => { resetModalStates(); setShowModalCuota(true); }}
            >Agregar Cuota</button>
          </div>

          <div className="table" role="table">
            <div className="tableHeader" role="row">
              <div className="tableCell" role="columnheader">Nombre</div>
              <div className="tableCell" role="columnheader">Monto</div>
              <div className="tableCell" role="columnheader">Periodicidad</div>
              <div className="tableCell" role="columnheader">Vencimiento</div>
              <div className="tableCell" role="columnheader">Estado</div>
              <div className="tableCell" role="columnheader">Acciones</div>
            </div>

            {cuotas.map(cuota => (
              <div key={cuota.id} className="tableRow" role="row">
                <div className="tableCell">{cuota.nombre}</div>
                <div className="tableCell">{formatCurrency(cuota.monto)}</div>
                <div className="tableCell">{cuota.periodicidad}</div>
                <div className="tableCell">{cuota.fechaVencimiento}</div>
                <div className="tableCell">
                  <span className={`badge ${cuota.activa ? 'badgeActiva' : 'badgeInactiva'}`}>
                    {cuota.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <div className="tableCell">
                  <button className="editButton" onClick={() => handleEditarCuota(cuota)}>Editar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multas */}
      {currentSection === 'multas' && (
        <div className="section">
          <div className="sectionHeader">
            <h2 className="sectionTitle">Gestionar Multas y Servicios Adicionales</h2>
            <button
              className="primaryButton"
              onClick={() => { resetModalStates(); setShowModalMulta(true); }}
            >Agregar Multa/Servicio</button>
          </div>

          <div className="table" role="table">
            <div className="tableHeader" role="row">
              <div className="tableCell" role="columnheader">Concepto</div>
              <div className="tableCell" role="columnheader">Tipo</div>
              <div className="tableCell" role="columnheader">Monto</div>
              <div className="tableCell" role="columnheader">Fecha</div>
              <div className="tableCell" role="columnheader">Residente</div>
              <div className="tableCell" role="columnheader">Acciones</div>
            </div>

            {multasServicios.map(item => (
              <div key={item.id} className="tableRow" role="row">
                <div className="tableCell">{item.concepto}</div>
                <div className="tableCell">
                  <span className={`badge ${item.tipo === 'multa' ? 'badgeMulta' : 'badgeServicio'}`}>
                    {item.tipo === 'multa' ? 'Multa' : 'Servicio'}
                  </span>
                </div>
                <div className="tableCell">{formatCurrency(item.monto)}</div>
                <div className="tableCell">{item.fecha}</div>
                <div className="tableCell">
                  {residentes.find(r => r.id.toString() === item.residenteId)?.nombre || 'N/A'}
                </div>
                <div className="tableCell">
                  <button className="editButton" onClick={() => handleEditarMultaServicio(item)}>Editar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cálculo */}
      {currentSection === 'calculo' && (
        <div className="section">
          <h2 className="sectionTitle">Calcular Cuotas por Residente</h2>
          <div className="calculoGrid">
            {residentes.map(residente => (
              <div key={residente.id} className="residenteCard">
                <h3 className="residenteNombre">{residente.nombre}</h3>
                <p className="residenteUnidad">{residente.unidad}</p>
                <button className="primaryButton" onClick={() => calcularCuotaTotal(residente.id.toString())}>
                  Calcular Cuota
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Cuota */}
      {showModalCuota && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Cuota">
          <div className="modalContent">
            <div className="modalHeader">
              <h3>{editingCuota ? 'Editar Cuota' : 'Agregar Nueva Cuota'}</h3>
              <button className="closeButton" aria-label="Cerrar"
                onClick={() => { setShowModalCuota(false); resetModalStates(); }}>×</button>
            </div>

            <div className="modalBody">
              <div className="formGroup">
                <label className="label">Nombre de la cuota *</label>
                <input
                  type="text"
                  className={`input ${errors.nombre ? 'inputError' : ''}`}
                  value={nuevaCuota.nombre}
                  onChange={(e) => setNuevaCuota({ ...nuevaCuota, nombre: e.target.value })}
                  placeholder="Ej: Mantenimiento, Limpieza"
                />
                {errors.nombre && <div className="errorMessage">{errors.nombre}</div>}
              </div>

              <div className="formGroup">
                <label className="label">Monto (Bs) *</label>
                <input
                  type="number" step="0.01"
                  className={`input ${errors.monto ? 'inputError' : ''}`}
                  value={nuevaCuota.monto}
                  onChange={(e) => setNuevaCuota({ ...nuevaCuota, monto: e.target.value })}
                  placeholder="0.00"
                />
                {errors.monto && <div className="errorMessage">{errors.monto}</div>}
              </div>

              <div className="formGroup">
                <label className="label">Periodicidad</label>
                <select
                  className="select"
                  value={nuevaCuota.periodicidad}
                  onChange={(e) => setNuevaCuota({ ...nuevaCuota, periodicidad: e.target.value })}
                >
                  <option value="mensual">Mensual</option>
                  <option value="bimestral">Bimestral</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              <div className="formGroup">
                <label className="label">Fecha de vencimiento *</label>
                <input
                  type="date"
                  className={`input ${errors.fechaVencimiento ? 'inputError' : ''}`}
                  value={nuevaCuota.fechaVencimiento}
                  onChange={(e) => setNuevaCuota({ ...nuevaCuota, fechaVencimiento: e.target.value })}
                />
                {errors.fechaVencimiento && <div className="errorMessage">{errors.fechaVencimiento}</div>}
              </div>
            </div>

            <div className="modalFooter">
              <button className="secondaryButton" onClick={() => { setShowModalCuota(false); resetModalStates(); }}>
                Cancelar
              </button>
              <button className="primaryButton" onClick={handleAgregarCuota}>
                {editingCuota ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Multa/Servicio */}
      {showModalMulta && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Multa o servicio">
          <div className="modalContent">
            <div className="modalHeader">
              <h3>{editingMulta ? 'Editar Multa/Servicio' : 'Agregar Multa/Servicio'}</h3>
              <button className="closeButton" aria-label="Cerrar"
                onClick={() => { setShowModalMulta(false); resetModalStates(); }}>×</button>
            </div>

            <div className="modalBody">
              <div className="formGroup">
                <label className="label">Concepto *</label>
                <input
                  type="text"
                  className={`input ${errors.concepto ? 'inputError' : ''}`}
                  value={nuevoMultaServicio.concepto}
                  onChange={(e) => setNuevoMultaServicio({ ...nuevoMultaServicio, concepto: e.target.value })}
                  placeholder="Describa el concepto"
                />
                {errors.concepto && <div className="errorMessage">{errors.concepto}</div>}
              </div>

              <div className="formGroup">
                <label className="label">Tipo</label>
                <select
                  className="select"
                  value={nuevoMultaServicio.tipo}
                  onChange={(e) => setNuevoMultaServicio({ ...nuevoMultaServicio, tipo: e.target.value })}
                >
                  <option value="multa">Multa</option>
                  <option value="servicio">Servicio Adicional</option>
                </select>
              </div>

              <div className="formGroup">
                <label className="label">Monto (Bs) *</label>
                <input
                  type="number" step="0.01"
                  className={`input ${errors.monto ? 'inputError' : ''}`}
                  value={nuevoMultaServicio.monto}
                  onChange={(e) => setNuevoMultaServicio({ ...nuevoMultaServicio, monto: e.target.value })}
                  placeholder="0.00"
                />
                {errors.monto && <div className="errorMessage">{errors.monto}</div>}
              </div>

              <div className="formGroup">
                <label className="label">Residente *</label>
                <select
                  className={`select ${errors.residenteId ? 'inputError' : ''}`}
                  value={nuevoMultaServicio.residenteId}
                  onChange={(e) => setNuevoMultaServicio({ ...nuevoMultaServicio, residenteId: e.target.value })}
                >
                  <option value="">Seleccione un residente</option>
                  {residentes.map(residente => (
                    <option key={residente.id} value={residente.id}>
                      {residente.nombre} - {residente.unidad}
                    </option>
                  ))}
                </select>
                {errors.residenteId && <div className="errorMessage">{errors.residenteId}</div>}
              </div>
            </div>

            <div className="modalFooter">
              <button className="secondaryButton" onClick={() => { setShowModalMulta(false); resetModalStates(); }}>
                Cancelar
              </button>
              <button className="primaryButton" onClick={handleAgregarMultaServicio}>
                {editingMulta ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cálculo */}
      {showModalCalculo && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Detalle de cuota">
          <div className="modalContent">
            <div className="modalHeader">
              <h3>Detalle de Cuota</h3>
              <button className="closeButton" aria-label="Cerrar" onClick={() => setShowModalCalculo(false)}>×</button>
            </div>

            <div className="modalBody">
              <div className="calculoDetalle">
                <h4 className="calculoTitle">
                  Residente: {residentes.find(r => r.id.toString() === calculoCuotas.residenteId)?.nombre}
                </h4>
                <h4 className="calculoTitle">
                  Unidad: {residentes.find(r => r.id.toString() === calculoCuotas.residenteId)?.unidad}
                </h4>

                <div className="calculoSection">
                  <h5 className="calculoSubtitle">Cuotas Base:</h5>
                  {cuotas.filter(c => c.activa).map(cuota => (
                    <div key={cuota.id} className="calculoItem">
                      <span>{cuota.nombre}</span>
                      <span>{formatCurrency(cuota.monto)}</span>
                    </div>
                  ))}
                </div>

                {calculoCuotas.serviciosAdicionales.length > 0 && (
                  <div className="calculoSection">
                    <h5 className="calculoSubtitle">Multas y Servicios Adicionales:</h5>
                    {calculoCuotas.serviciosAdicionales.map(item => (
                      <div key={item.id} className="calculoItem">
                        <span>{item.concepto}</span>
                        <span>{formatCurrency(item.monto)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="calculoTotal">
                  <strong>Total a pagar: {formatCurrency(calculoCuotas.total)}</strong>
                </div>
              </div>
            </div>

            <div className="modalFooter">
              <button className="primaryButton" onClick={() => setShowModalCalculo(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuotasGastosComunes;