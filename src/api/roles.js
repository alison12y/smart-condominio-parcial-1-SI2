// Permisos disponibles (igual que en tu componente original)
export const AVAILABLE_PERMISSIONS = [
  // Administración General
  { id: "gestionar_usuarios", name: "Gestionar Usuarios", category: "Administración" },
  { id: "gestionar_roles", name: "Gestionar Roles", category: "Administración" },
  { id: "supervisar_sistema", name: "Supervisar Sistema", category: "Administración" },
  { id: "configurar_parametros", name: "Configurar Parámetros", category: "Administración" },

  // Módulos del Sistema
  { id: "modulo_finanzas", name: "Módulo Finanzas", category: "Módulos" },
  { id: "modulo_seguridad", name: "Módulo Seguridad", category: "Módulos" },
  { id: "modulo_mantenimiento", name: "Módulo Mantenimiento", category: "Módulos" },
  { id: "comunicacion_interna", name: "Comunicación Interna", category: "Módulos" },

  // Finanzas y Pagos
  { id: "consultar_cuotas", name: "Consultar Cuotas", category: "Finanzas" },
  { id: "pagar_cuotas", name: "Pagar Cuotas", category: "Finanzas" },
  { id: "generar_reportes_analiticos", name: "Generar Reportes Analíticos", category: "Finanzas" },

  // Áreas Comunes y Notificaciones
  { id: "reservar_areas_comunes", name: "Reservar Áreas Comunes", category: "Servicios" },
  { id: "recibir_notificaciones", name: "Recibir Notificaciones", category: "Servicios" },
  { id: "usar_app_movil", name: "Usar Aplicación Móvil", category: "Servicios" },

  // Seguridad
  { id: "monitorear_accesos", name: "Monitorear Accesos", category: "Seguridad" },
  { id: "controlar_accesos", name: "Controlar Accesos", category: "Seguridad" },
  { id: "usar_camaras_inteligentes", name: "Usar Cámaras Inteligentes", category: "Seguridad" },
  { id: "registrar_visitantes", name: "Registrar Visitantes", category: "Seguridad" },
  { id: "registrar_vehiculos", name: "Registrar Vehículos", category: "Seguridad" },
  { id: "vision_artificial", name: "Visión Artificial", category: "Seguridad" },
  { id: "alertas_seguridad", name: "Alertas de Seguridad", category: "Seguridad" },

  // Mantenimiento
  { id: "reportar_mantenimiento", name: "Reportar Mantenimiento", category: "Mantenimiento" },
  { id: "recibir_solicitudes_reparacion", name: "Recibir Solicitudes de Reparación", category: "Mantenimiento" },
  { id: "ejecutar_tareas_mantenimiento", name: "Ejecutar Tareas de Mantenimiento", category: "Mantenimiento" },
  { id: "planificacion_mantenimiento_preventivo", name: "Planificación Mantenimiento Preventivo", category: "Mantenimiento" },
  { id: "usar_ia_mantenimiento", name: "Usar IA para Mantenimiento", category: "Mantenimiento" },
  { id: "actualizar_estado_tareas", name: "Actualizar Estado de Tareas", category: "Mantenimiento" },
  { id: "gestionar_inventario_herramientas", name: "Gestionar Inventario de Herramientas", category: "Mantenimiento" },
];

// Datos iniciales (semilla) — los mismos que tenías
export const SEED_ROLES = [
  {
    id: 1,
    name: "Administrador",
    permissions: [
      "gestionar_usuarios",
      "gestionar_roles",
      "modulo_finanzas",
      "modulo_seguridad",
      "modulo_mantenimiento",
      "comunicacion_interna",
      "generar_reportes_analiticos",
      "supervisar_sistema",
      "configurar_parametros",
    ],
  },
  {
    id: 2,
    name: "Residente",
    permissions: [
      "consultar_cuotas",
      "pagar_cuotas",
      "reservar_areas_comunes",
      "recibir_notificaciones",
      "reportar_mantenimiento",
      "usar_app_movil",
    ],
  },
  {
    id: 3,
    name: "Personal de Seguridad",
    permissions: [
      "monitorear_accesos",
      "controlar_accesos",
      "usar_camaras_inteligentes",
      "registrar_visitantes",
      "registrar_vehiculos",
      "vision_artificial",
      "alertas_seguridad",
    ],
  },
  {
    id: 4,
    name: "Personal de Mantenimiento",
    permissions: [
      "recibir_solicitudes_reparacion",
      "ejecutar_tareas_mantenimiento",
      "planificacion_mantenimiento_preventivo",
      "usar_ia_mantenimiento",
      "actualizar_estado_tareas",
      "gestionar_inventario_herramientas",
    ],
  },
];

// Helpers de formulario / permisos
export function validateRoleForm(formData) {
  const newErrors = {};
  if (!formData.name?.trim()) newErrors.name = "Este campo no puede estar vacío";
  if (!Array.isArray(formData.permissions) || formData.permissions.length === 0) {
    newErrors.permissions = "Debe seleccionar al menos un permiso";
  }
  return newErrors;
}

export function addPermission(list, permissionId) {
  return list.includes(permissionId) ? list : [...list, permissionId];
}

export function removePermission(list, permissionId) {
  return list.filter((p) => p !== permissionId);
}