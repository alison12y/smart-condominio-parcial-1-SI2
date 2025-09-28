import { useEffect, useMemo, useState } from "react";

/* ===== Config ===== */
const API_URL = (process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");
const USE_BACKEND = (process.env.REACT_APP_USE_BACKEND ?? "true") === "true";

/* ===== Cliente API con refresh ===== */
const getStored = (k) => localStorage.getItem(k) || sessionStorage.getItem(k);
const setStored = (k, v) =>
  (localStorage.getItem("refresh") ? localStorage : sessionStorage).setItem(k, v);

async function apiFetch(path, { auth = true, method = "GET", headers = {}, body } = {}) {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const h = { "Content-Type": "application/json", ...headers };
  if (auth) {
    const t = getStored("access");
    if (t) h.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(url, { method, headers: h, body });

  if (res.status !== 401 || !auth) return res;

  // refresh
  const refresh = getStored("refresh");
  if (!refresh) return res;
  const rr = await fetch(`${API_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!rr.ok) return res;
  const { access } = await rr.json();
  if (!access) return res;
  setStored("access", access);
  return fetch(url, { method, headers: { ...h, Authorization: `Bearer ${access}` }, body });
}
async function apiJson(path, opts) {
  const r = await apiFetch(path, opts);
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(t || `HTTP ${r.status}`);
  }
  return r.status === 204 ? null : r.json();
}

/* ===== Endpoints (ajústalos a tu backend) ===== */
const EP = {
  cuotas: "/finanzas/cuotas/",
  cuotaById: (id) => `/finanzas/cuotas/${id}/`,
  multas: "/finanzas/multas-servicios/",
  multaById: (id) => `/finanzas/multas-servicios/${id}/`,
  residentes: "/finanzas/residentes/",
  calcular: (id) => `/finanzas/calculo/${id}/`,
};

/* ===== Datos demo (fallback) ===== */
const DEMO_CUOTAS = [
  { id: 1, nombre: "Mantenimiento General", monto: 150, periodicidad: "mensual", fechaVencimiento: "2024-10-15", activa: true },
  { id: 2, nombre: "Limpieza Áreas Comunes", monto: 75, periodicidad: "mensual", fechaVencimiento: "2024-10-15", activa: true },
];
const DEMO_MULTAS = [
  { id: 1, concepto: "Multa por ruido nocturno", monto: 45, tipo: "multa", fecha: "2024-09-20", residenteId: "1" },
];
const DEMO_RESIDENTES = [
  { id: 1, nombre: "Juan Pérez", unidad: "Apto 101" },
  { id: 2, nombre: "María García", unidad: "Apto 102" },
  { id: 3, nombre: "Carlos López", unidad: "Apto 201" },
];

/* ===== Hook ===== */
export function useCuotasGastosComunes() {
  const [currentSection, setCurrentSection] = useState("cuotas");

  // Estado con DEMO por defecto; si el backend responde, se sobreescribe
  const [cuotas, setCuotas] = useState(DEMO_CUOTAS);
  const [multasServicios, setMultasServicios] = useState(DEMO_MULTAS);
  const [residentes, setResidentes] = useState(DEMO_RESIDENTES);

  // Formularios (idénticos a tu UI)
  const [nuevaCuota, setNuevaCuota] = useState({
    nombre: "",
    monto: "",
    periodicidad: "mensual",
    fechaVencimiento: "",
    activa: true,
  });
  const [nuevoMultaServicio, setNuevoMultaServicio] = useState({
    concepto: "",
    monto: "",
    tipo: "multa",
    residenteId: "",
  });
  const [calculoCuotas, setCalculoCuotas] = useState({
    residenteId: "",
    serviciosAdicionales: [],
    total: 0,
  });

  // UI
  const [showModalCuota, setShowModalCuota] = useState(false);
  const [showModalMulta, setShowModalMulta] = useState(false);
  const [showModalCalculo, setShowModalCalculo] = useState(false);
  const [editingCuota, setEditingCuota] = useState(null);
  const [editingMulta, setEditingMulta] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  /* Carga del backend (si está activo) */
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!USE_BACKEND) return; // fuerza demo
      try {
        const [c, m, r] = await Promise.all([
          apiJson(EP.cuotas),
          apiJson(EP.multas),
          apiJson(EP.residentes),
        ]);
        if (!alive) return;
        if (Array.isArray(c) && c.length) setCuotas(c);
        if (Array.isArray(m) && m.length) setMultasServicios(m);
        if (Array.isArray(r) && r.length) setResidentes(r);
      } catch (e) {
        // si falla, seguimos con DEMO sin romper la UI
        console.warn("Backend no disponible; usando datos demo:", e.message);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* Validaciones (igual que tu componente) */
  const validateCuotaForm = () => {
    const e = {};
    if (!nuevaCuota.nombre.trim()) e.nombre = "Debe completar todos los campos requeridos";
    if (!nuevaCuota.monto || isNaN(nuevaCuota.monto) || parseFloat(nuevaCuota.monto) <= 0)
      e.monto = "El monto ingresado no es válido";
    if (!nuevaCuota.fechaVencimiento) e.fechaVencimiento = "Debe completar todos los campos requeridos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const validateMultaForm = () => {
    const e = {};
    if (!nuevoMultaServicio.concepto.trim()) e.concepto = "Debe completar todos los campos requeridos";
    if (!nuevoMultaServicio.monto || isNaN(nuevoMultaServicio.monto) || parseFloat(nuevoMultaServicio.monto) <= 0)
      e.monto = "El monto ingresado no es válido";
    if (!nuevoMultaServicio.residenteId) e.residenteId = "Debe completar todos los campos requeridos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* Acciones — CUOTAS */
  const handleAgregarCuota = async () => {
    if (!validateCuotaForm()) return;

    const payload = {
      nombre: nuevaCuota.nombre.trim(),
      monto: parseFloat(nuevaCuota.monto),
      periodicidad: nuevaCuota.periodicidad,
      fechaVencimiento: nuevaCuota.fechaVencimiento,
      activa: nuevaCuota.activa ?? true,
    };

    // Si hay edición
    if (editingCuota) {
      try {
        if (USE_BACKEND) {
          const updated = await apiJson(EP.cuotaById(editingCuota.id), {
            method: "PUT",
            body: JSON.stringify(payload),
          });
          setCuotas((prev) => prev.map((c) => (c.id === editingCuota.id ? updated : c)));
        } else {
          setCuotas((prev) =>
            prev.map((c) => (c.id === editingCuota.id ? { ...editingCuota, ...payload } : c))
          );
        }
        setSuccessMessage("Cuota actualizada exitosamente");
        setEditingCuota(null);
      } catch (e) {
        // Fallback local si falla el backend
        setCuotas((prev) =>
          prev.map((c) => (c.id === editingCuota.id ? { ...editingCuota, ...payload } : c))
        );
        setSuccessMessage("Cuota actualizada (local)");
      }
    } else {
      // Creación
      try {
        if (USE_BACKEND) {
          const created = await apiJson(EP.cuotas, { method: "POST", body: JSON.stringify(payload) });
          setCuotas((prev) => [...prev, created]);
        } else {
          const created = { id: Math.max(0, ...cuotas.map((x) => x.id)) + 1, ...payload };
          setCuotas((prev) => [...prev, created]);
        }
        setSuccessMessage("Cuota agregada exitosamente");
      } catch (e) {
        const created = { id: Math.max(0, ...cuotas.map((x) => x.id)) + 1, ...payload };
        setCuotas((prev) => [...prev, created]);
        setSuccessMessage("Cuota agregada (local)");
      }
    }

    setNuevaCuota({ nombre: "", monto: "", periodicidad: "mensual", fechaVencimiento: "", activa: true });
    setShowModalCuota(false);
    setErrors({});
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleEditarCuota = (cuota) => {
    setEditingCuota(cuota);
    setNuevaCuota({
      nombre: cuota.nombre,
      monto: cuota.monto.toString(),
      periodicidad: cuota.periodicidad,
      fechaVencimiento: cuota.fechaVencimiento,
      activa: cuota.activa ?? true,
    });
    setShowModalCuota(true);
  };

  /* Acciones — MULTAS / SERVICIOS */
  const handleAgregarMultaServicio = async () => {
    if (!validateMultaForm()) return;

    const payload = {
      concepto: nuevoMultaServicio.concepto.trim(),
      monto: parseFloat(nuevoMultaServicio.monto),
      tipo: nuevoMultaServicio.tipo,
      residenteId: String(nuevoMultaServicio.residenteId),
      fecha: new Date().toISOString().split("T")[0],
    };

    if (editingMulta) {
      try {
        if (USE_BACKEND) {
          const updated = await apiJson(EP.multaById(editingMulta.id), {
            method: "PUT",
            body: JSON.stringify(payload),
          });
          setMultasServicios((prev) => prev.map((m) => (m.id === editingMulta.id ? updated : m)));
        } else {
          setMultasServicios((prev) =>
            prev.map((m) => (m.id === editingMulta.id ? { ...editingMulta, ...payload } : m))
          );
        }
        setSuccessMessage("Multa/Servicio actualizado exitosamente");
        setEditingMulta(null);
      } catch (e) {
        setMultasServicios((prev) =>
          prev.map((m) => (m.id === editingMulta.id ? { ...editingMulta, ...payload } : m))
        );
        setSuccessMessage("Multa/Servicio actualizado (local)");
      }
    } else {
      try {
        if (USE_BACKEND) {
          const created = await apiJson(EP.multas, { method: "POST", body: JSON.stringify(payload) });
          setMultasServicios((prev) => [...prev, created]);
        } else {
          const created = { id: Math.max(0, ...multasServicios.map((x) => x.id)) + 1, ...payload };
          setMultasServicios((prev) => [...prev, created]);
        }
        setSuccessMessage("Multa/Servicio agregado exitosamente");
      } catch (e) {
        const created = { id: Math.max(0, ...multasServicios.map((x) => x.id)) + 1, ...payload };
        setMultasServicios((prev) => [...prev, created]);
        setSuccessMessage("Multa/Servicio agregado (local)");
      }
    }

    setNuevoMultaServicio({ concepto: "", monto: "", tipo: "multa", residenteId: "" });
    setShowModalMulta(false);
    setErrors({});
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleEditarMultaServicio = (item) => {
    setEditingMulta(item);
    setNuevoMultaServicio({
      concepto: item.concepto,
      monto: item.monto.toString(),
      tipo: item.tipo,
      residenteId: item.residenteId,
    });
    setShowModalMulta(true);
  };

  /* Cálculo */
  const calcularCuotaLocal = (residenteId) => {
    const cuotasActivas = cuotas.filter((c) => c.activa);
    const totalCuotas = cuotasActivas.reduce((sum, c) => sum + Number(c.monto || 0), 0);
    const servicios = multasServicios.filter((m) => String(m.residenteId) === String(residenteId));
    const totalServicios = servicios.reduce((sum, s) => sum + Number(s.monto || 0), 0);
    setCalculoCuotas({
      residenteId: String(residenteId),
      serviciosAdicionales: servicios,
      total: totalCuotas + totalServicios,
    });
    setShowModalCalculo(true);
  };
  const calcularCuotaTotal = async (residenteId) => {
    if (!USE_BACKEND) return calcularCuotaLocal(residenteId);
    try {
      const r = await apiJson(EP.calcular(String(residenteId)));
      if (r && typeof r.total !== "undefined") {
        setCalculoCuotas({
          residenteId: String(residenteId),
          serviciosAdicionales: r.itemsAdicionales ?? [],
          total: r.total,
        });
        setShowModalCalculo(true);
      } else {
        calcularCuotaLocal(residenteId);
      }
    } catch {
      calcularCuotaLocal(residenteId);
    }
  };

  /* Helpers iguales a tu UI */
  const formatCurrency = (amount) =>
    `Bs ${parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
  const resetModalStates = () => {
    setErrors({});
    setEditingCuota(null);
    setEditingMulta(null);
    setNuevaCuota({ nombre: "", monto: "", periodicidad: "mensual", fechaVencimiento: "", activa: true });
    setNuevoMultaServicio({ concepto: "", monto: "", tipo: "multa", residenteId: "" });
  };
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  return {
    // estado expuesto al JSX (igual que antes)
    currentSection, setCurrentSection,
    cuotas, multasServicios, residentes,
    nuevaCuota, setNuevaCuota,
    nuevoMultaServicio, setNuevoMultaServicio,
    calculoCuotas,
    showModalCuota, setShowModalCuota,
    showModalMulta, setShowModalMulta,
    showModalCalculo, setShowModalCalculo,
    editingCuota, editingMulta,
    errors, hasErrors, successMessage,

    // acciones
    handleAgregarCuota, handleEditarCuota,
    handleAgregarMultaServicio, handleEditarMultaServicio,
    calcularCuotaTotal, resetModalStates, formatCurrency,
  };
}