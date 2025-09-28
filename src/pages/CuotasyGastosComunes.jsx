import { useState } from 'react';
import '../styles/cuotas.css';

const CuotasGastosInterface = () => {
  const [activeTab, setActiveTab] = useState('cuotas');
  const [cuotas, setCuotas] = useState([
    { id: 1, nombre: 'Mantenimiento General', monto: 200, periodicidad: 'mensual', vencimiento: '2024-01-15', estado: 'activa' },
    { id: 2, nombre: 'Limpieza Común', monto: 100, periodicidad: 'mensual', vencimiento: '2024-01-15', estado: 'activa' }
  ]);
  const [multasServicios, setMultasServicios] = useState([
    { id: 1, concepto: 'Multa por ruido excesivo', monto: 120, fecha: '2024-01-10', tipo: 'multa', residente: 'Apt 101' },
    { id: 2, concepto: 'Servicio de plomería', monto: 180, fecha: '2024-01-12', tipo: 'servicio', residente: 'Apt 205' }
  ]);

  // Formularios / edición
  const [showCuotaForm, setShowCuotaForm] = useState(false);
  const [showMultaForm, setShowMultaForm] = useState(false);
  const [editingCuota, setEditingCuota] = useState(null);
  const [editingMulta, setEditingMulta] = useState(null);

  // Nuevos registros
  const [nuevaCuota, setNuevaCuota] = useState({ nombre: '', monto: '', periodicidad: 'mensual', vencimiento: '' });
  const [nuevaMulta, setNuevaMulta] = useState({ concepto: '', monto: '', tipo: 'multa', residente: '' });

  // Cálculo
  const [calculoUnidad, setCalculoUnidad] = useState('');
  const [resultadoCalculo, setResultadoCalculo] = useState(null);

  // Errores
  const [errores, setErrores] = useState({});

  // Validaciones
  const validarCuota = () => {
    const errs = {};
    if (!nuevaCuota.nombre.trim()) errs.nombre = 'Debe completar todos los campos requeridos';
    if (!nuevaCuota.monto || isNaN(nuevaCuota.monto) || Number(nuevaCuota.monto) <= 0) errs.monto = 'El monto ingresado no es válido';
    if (!nuevaCuota.vencimiento) errs.vencimiento = 'Debe completar todos los campos requeridos';
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };
  const validarMulta = () => {
    const errs = {};
    if (!nuevaMulta.concepto.trim()) errs.concepto = 'Debe completar todos los campos requeridos';
    if (!nuevaMulta.monto || isNaN(nuevaMulta.monto) || Number(nuevaMulta.monto) <= 0) errs.monto = 'El monto ingresado no es válido';
    if (!nuevaMulta.residente.trim()) errs.residente = 'Debe completar todos los campos requeridos';
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  // Handlers cuotas
  const handleAgregarCuota = () => {
    if (!validarCuota()) return;
    if (editingCuota) {
      setCuotas(cuotas.map(c => (c.id === editingCuota.id ? { ...c, ...nuevaCuota, monto: Number(nuevaCuota.monto) } : c)));
      setEditingCuota(null);
    } else {
      setCuotas([...cuotas, { id: cuotas.length + 1, ...nuevaCuota, monto: Number(nuevaCuota.monto), estado: 'activa' }]);
    }
    setNuevaCuota({ nombre: '', monto: '', periodicidad: 'mensual', vencimiento: '' });
    setShowCuotaForm(false);
    setErrores({});
  };
  const handleEditarCuota = (cuota) => {
    setEditingCuota(cuota);
    setNuevaCuota({ nombre: cuota.nombre, monto: cuota.monto.toString(), periodicidad: cuota.periodicidad, vencimiento: cuota.vencimiento });
    setShowCuotaForm(true);
  };
  const handleEliminarCuota = (id) => {
    if (confirm('¿Está seguro de que desea eliminar esta cuota?')) {
      setCuotas(cuotas.filter(c => c.id !== id));
    }
  };

  // Handlers multas
  const handleAgregarMulta = () => {
    if (!validarMulta()) return;
    if (editingMulta) {
      setMultasServicios(multasServicios.map(m => (m.id === editingMulta.id ? { ...m, ...nuevaMulta, monto: Number(nuevaMulta.monto) } : m)));
      setEditingMulta(null);
    } else {
      setMultasServicios([
        ...multasServicios,
        { id: multasServicios.length + 1, ...nuevaMulta, monto: Number(nuevaMulta.monto), fecha: new Date().toISOString().split('T')[0] }
      ]);
    }
    setNuevaMulta({ concepto: '', monto: '', tipo: 'multa', residente: '' });
    setShowMultaForm(false);
    setErrores({});
  };
  const handleEditarMulta = (multa) => {
    setEditingMulta(multa);
    setNuevaMulta({ concepto: multa.concepto, monto: multa.monto.toString(), tipo: multa.tipo, residente: multa.residente });
    setShowMultaForm(true);
  };
  const handleEliminarMulta = (id) => {
    if (confirm('¿Está seguro de que desea eliminar este registro?')) {
      setMultasServicios(multasServicios.filter(m => m.id !== id));
    }
  };

  // Cálculo
  const calcularCuota = () => {
    if (!calculoUnidad) { setErrores({ unidad: 'Debe seleccionar una unidad' }); return; }
    const cuotaBase = cuotas.reduce((t, c) => t + c.monto, 0);
    const multasUnidad = multasServicios.filter(i => i.residente === calculoUnidad).reduce((t, i) => t + i.monto, 0);
    setResultadoCalculo({ unidad: calculoUnidad, cuotaBase, multasServicios: multasUnidad, total: cuotaBase + multasUnidad });
    setErrores({});
  };

  return (
    <div className="cg__wrap">
      {/* Header */}
      <div className="cg__header">
        <h1 className="cg__h1">Sistema de Finanzas - Condominio</h1>
        <p className="cg__subtitle">Gestión de Cuotas y Gastos Comunes</p>
      </div>

      {/* Tabs */}
      <div className="cg__tabs">
        <div className="cg__tabs-row">
          {['cuotas','multas','calculo'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cg__tab ${activeTab === tab ? 'is-active' : ''}`}
            >
              {tab === 'cuotas' ? 'Gestionar Cuotas' : tab === 'multas' ? 'Multas y Servicios' : 'Calcular Cuotas'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="cg__card">
        {/* Cuotas */}
        {activeTab === 'cuotas' && (
          <div>
            <div className="cg__section-head">
              <h2 className="cg__h2">Gestionar Cuotas</h2>
              <button onClick={() => setShowCuotaForm(true)} className="btn btn--success">+ Agregar Cuota</button>
            </div>

            <div className="table__wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Monto (Bs)</th>
                    <th>Periodicidad</th>
                    <th>Vencimiento</th>
                    <th>Estado</th>
                    <th className="t-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cuotas.map(c => (
                    <tr key={c.id}>
                      <td>{c.nombre}</td>
                      <td>Bs {c.monto.toFixed(2)}</td>
                      <td className="tt-capitalize">{c.periodicidad}</td>
                      <td>{c.vencimiento}</td>
                      <td><span className={`badge ${c.estado === 'activa' ? 'badge--ok' : 'badge--bad'}`}>{c.estado}</span></td>
                      <td className="t-center">
                        <div className="btn-group">
                          <button onClick={() => handleEditarCuota(c)} className="btn btn--info btn--sm">Editar</button>
                          <button onClick={() => handleEliminarCuota(c.id)} className="btn btn--danger btn--sm">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showCuotaForm && (
              <div className="modal">
                <div className="modal__content">
                  <h3 className="cg__h3">{editingCuota ? 'Editar Cuota' : 'Agregar Nueva Cuota'}</h3>

                  <div className="form__group">
                    <label className="form__label">Nombre de la cuota *</label>
                    <input
                      type="text"
                      value={nuevaCuota.nombre}
                      onChange={(e) => setNuevaCuota({ ...nuevaCuota, nombre: e.target.value })}
                      className={`form__input ${errores.nombre ? 'is-error' : ''}`}
                      placeholder="Ej: Mantenimiento, Limpieza"
                    />
                    {errores.nombre && <span className="form__error">{errores.nombre}</span>}
                  </div>

                  <div className="form__group">
                    <label className="form__label">Monto (Bs) *</label>
                    <input
                      type="number" step="0.01"
                      value={nuevaCuota.monto}
                      onChange={(e) => setNuevaCuota({ ...nuevaCuota, monto: e.target.value })}
                      className={`form__input ${errores.monto ? 'is-error' : ''}`}
                      placeholder="0.00"
                    />
                    {errores.monto && <span className="form__error">{errores.monto}</span>}
                  </div>

                  <div className="form__group">
                    <label className="form__label">Periodicidad</label>
                    <select
                      value={nuevaCuota.periodicidad}
                      onChange={(e) => setNuevaCuota({ ...nuevaCuota, periodicidad: e.target.value })}
                      className="form__input"
                    >
                      <option value="mensual">Mensual</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="semestral">Semestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>

                  <div className="form__group">
                    <label className="form__label">Fecha de vencimiento *</label>
                    <input
                      type="date"
                      value={nuevaCuota.vencimiento}
                      onChange={(e) => setNuevaCuota({ ...nuevaCuota, vencimiento: e.target.value })}
                      className={`form__input ${errores.vencimiento ? 'is-error' : ''}`}
                    />
                    {errores.vencimiento && <span className="form__error">{errores.vencimiento}</span>}
                  </div>

                  <div className="form__actions">
                    <button
                      onClick={() => {
                        setShowCuotaForm(false);
                        setEditingCuota(null);
                        setErrores({});
                        setNuevaCuota({ nombre: '', monto: '', periodicidad: 'mensual', vencimiento: '' });
                      }}
                      className="btn btn--muted"
                    >
                      Cancelar
                    </button>
                    <button onClick={handleAgregarCuota} className="btn btn--success">
                      {editingCuota ? 'Actualizar' : 'Guardar'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Multas/Servicios */}
        {activeTab === 'multas' && (
          <div>
            <div className="cg__section-head">
              <h2 className="cg__h2">Multas y Servicios Adicionales</h2>
              <button onClick={() => setShowMultaForm(true)} className="btn btn--warn">+ Agregar Multa/Servicio</button>
            </div>

            <div className="table__wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Tipo</th>
                    <th>Monto (Bs)</th>
                    <th>Residente</th>
                    <th>Fecha</th>
                    <th className="t-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {multasServicios.map(m => (
                    <tr key={m.id}>
                      <td>{m.concepto}</td>
                      <td><span className={`badge ${m.tipo === 'multa' ? 'badge--bad' : 'badge--info'}`}>{m.tipo}</span></td>
                      <td>Bs {m.monto.toFixed(2)}</td>
                      <td>{m.residente}</td>
                      <td>{m.fecha}</td>
                      <td className="t-center">
                        <div className="btn-group">
                          <button onClick={() => handleEditarMulta(m)} className="btn btn--info btn--sm">Editar</button>
                          <button onClick={() => handleEliminarMulta(m.id)} className="btn btn--danger btn--sm">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showMultaForm && (
              <div className="modal">
                <div className="modal__content">
                  <h3 className="cg__h3">{editingMulta ? 'Editar Multa/Servicio' : 'Agregar Multa/Servicio'}</h3>

                  <div className="form__group">
                    <label className="form__label">Concepto *</label>
                    <input
                      type="text"
                      value={nuevaMulta.concepto}
                      onChange={(e) => setNuevaMulta({ ...nuevaMulta, concepto: e.target.value })}
                      className={`form__input ${errores.concepto ? 'is-error' : ''}`}
                      placeholder="Descripción del concepto"
                    />
                    {errores.concepto && <span className="form__error">{errores.concepto}</span>}
                  </div>

                  <div className="form__group">
                    <label className="form__label">Tipo</label>
                    <select
                      value={nuevaMulta.tipo}
                      onChange={(e) => setNuevaMulta({ ...nuevaMulta, tipo: e.target.value })}
                      className="form__input"
                    >
                      <option value="multa">Multa</option>
                      <option value="servicio">Servicio Adicional</option>
                    </select>
                  </div>

                  <div className="form__group">
                    <label className="form__label">Monto (Bs) *</label>
                    <input
                      type="number" step="0.01"
                      value={nuevaMulta.monto}
                      onChange={(e) => setNuevaMulta({ ...nuevaMulta, monto: e.target.value })}
                      className={`form__input ${errores.monto ? 'is-error' : ''}`}
                      placeholder="0.00"
                    />
                    {errores.monto && <span className="form__error">{errores.monto}</span>}
                  </div>

                  <div className="form__group">
                    <label className="form__label">Residente *</label>
                    <input
                      type="text"
                      value={nuevaMulta.residente}
                      onChange={(e) => setNuevaMulta({ ...nuevaMulta, residente: e.target.value })}
                      className={`form__input ${errores.residente ? 'is-error' : ''}`}
                      placeholder="Ej: Apt 101, Torre A"
                    />
                    {errores.residente && <span className="form__error">{errores.residente}</span>}
                  </div>

                  <div className="form__actions">
                    <button
                      onClick={() => {
                        setShowMultaForm(false);
                        setEditingMulta(null);
                        setErrores({});
                        setNuevaMulta({ concepto: '', monto: '', tipo: 'multa', residente: '' });
                      }}
                      className="btn btn--muted"
                    >
                      Cancelar
                    </button>
                    <button onClick={handleAgregarMulta} className="btn btn--warn">
                      {editingMulta ? 'Actualizar' : 'Guardar'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cálculo */}
        {activeTab === 'calculo' && (
          <div>
            <h2 className="cg__h2">Calcular Cuotas por Unidad</h2>

            <div className="panel">
              <div className="form__group">
                <label className="form__label">Seleccionar Unidad *</label>
                <select
                  value={calculoUnidad}
                  onChange={(e) => setCalculoUnidad(e.target.value)}
                  className={`form__input form__input--narrow ${errores.unidad ? 'is-error' : ''}`}
                >
                  <option value="">Seleccione una unidad</option>
                  <option value="Apt 101">Apartamento 101</option>
                  <option value="Apt 102">Apartamento 102</option>
                  <option value="Apt 201">Apartamento 201</option>
                  <option value="Apt 202">Apartamento 202</option>
                  <option value="Apt 205">Apartamento 205</option>
                </select>
                {errores.unidad && <span className="form__error">{errores.unidad}</span>}
              </div>

              <button onClick={calcularCuota} className="btn btn--info btn--lg">Calcular Cuota</button>
            </div>

            {resultadoCalculo && (
              <div className="result">
                <h3 className="cg__h3">Detalle de Cuota - {resultadoCalculo.unidad}</h3>
                <div className="result__grid">
                  <div className="result__row">
                    <span className="fw-bold">Cuotas Base:</span>
                    <span>Bs {resultadoCalculo.cuotaBase.toFixed(2)}</span>
                  </div>
                  <div className="result__row">
                    <span className="fw-bold">Multas y Servicios:</span>
                    <span>Bs {resultadoCalculo.multasServicios.toFixed(2)}</span>
                  </div>
                  <div className="result__total">
                    <span>TOTAL A PAGAR:</span>
                    <span>Bs {resultadoCalculo.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CuotasGastosInterface;