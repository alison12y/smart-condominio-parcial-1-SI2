import React, { useState, useEffect } from "react";
import { Search, Edit, Trash2, Plus, User, Mail, Phone, MapPin } from "lucide-react";
import { UsersApi } from "../api/users";
import "../styles/UserManagement.css";

/* === Mapa FIJO de roles (4 roles) === */
const roleMap = {
  1: "Administrador",
  2: "Residente",
  3: "Personal de Mantenimiento",
  4: "Personal de Seguridad",
};

/* Devuelve el nombre del rol venga como venga (objeto, id en rol/rol_id o string) */
function resolveRolNombre(user) {
  if (user?.rol && typeof user.rol === "object") {
    return user.rol.nombre_rol || user.rol.nombre || "—";
  }
  const id = Number(user?.rol_id ?? user?.rol);
  if (!isNaN(id) && roleMap[id]) return roleMap[id];
  if (typeof user?.rol === "string") return user.rol;
  return "—";
}

const UserManagement = () => {
  /* Mantengo tus datos iniciales para no tocar la interfaz */
  const [users, setUsers] = useState([
    {
      id: 1,
      ci: "12345678",
      nombre: "Juan Pérez",
      email: "juan.perez@email.com",
      telefono: "+591 70123456",
      direccion: "La Paz, Bolivia",
      rol: "Residente",
    },
    {
      id: 2,
      ci: "87654321",
      nombre: "María García",
      email: "maria.garcia@email.com",
      telefono: "+591 78987654",
      direccion: "Cochabamba, Bolivia",
      rol: "Personal de Mantenimiento",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'create' | 'edit' | 'delete'
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Cambia a true si usas JWT en vez de cookies/CSRF
  const useJWT = false;

  const results = (data) => (Array.isArray(data) ? data : data?.results || []);

  /* Carga inicial */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const u = await UsersApi.list({}, { useJWT });
        setUsers(results(u));
      } catch (e) {
        setErrorMessage(e.message || "No se pudo cargar la información");
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line

  /* Mensajes temporales */
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(""), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMessage]);

  /* Búsqueda server-side (si tu ViewSet la soporta) + fallback */
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await UsersApi.list(
          searchTerm.trim() ? { search: searchTerm } : {},
          { useJWT }
        );
        setUsers(results(data));
      } catch (e) {
        // si falla, dejamos la lista anterior
        console.warn("search:", e.message);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]); // eslint-disable-line

  /* Form */
  const [formData, setFormData] = useState({
    ci: "",
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    rol_id: "", // importante para enviar al backend
  });

  const resetForm = () => {
    setFormData({
      ci: "",
      nombre: "",
      email: "",
      telefono: "",
      direccion: "",
      rol_id: "",
    });
    setErrors({});
  };

  const validateForm = () => {
    const e = {};
    if (!formData.ci.trim()) e.ci = "Este campo no puede estar vacío";
    else if (modalType === "create" && users.some(u => String(u.ci) === String(formData.ci))) {
      e.ci = "CI de usuario ya registrado";
    }
    if (!formData.nombre.trim()) e.nombre = "Este campo no puede estar vacío";
    if (!formData.email.trim()) e.email = "Este campo no puede estar vacío";
    if (!formData.telefono.trim()) e.telefono = "Este campo no puede estar vacío";
    if (!formData.direccion.trim()) e.direccion = "Este campo no puede estar vacío";
    if (!formData.rol_id) e.rol_id = "Seleccione un rol";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  /* Modal */
  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    setShowModal(true);

    if (type === "edit" && user) {
      setFormData({
        ci: user.ci || "",
        nombre: user.nombre || "",
        email: user.email || "",
        telefono: user.telefono || "",
        direccion: user.direccion || "",
        // toma el id venga como objeto rol, rol_id o rol numérico/string
        rol_id:
          (user.rol && typeof user.rol === "object")
            ? String(user.rol.id)
            : String(user.rol_id ?? user.rol ?? ""),
      });
    } else if (type === "create") {
      resetForm();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setSelectedUser(null);
    resetForm();
  };

  const refreshList = async () => {
    const data = await UsersApi.list({}, { useJWT });
    setUsers(results(data));
  };

  /* Guardar/Eliminar */
  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      const payload = { ...formData, rol_id: Number(formData.rol_id) };
      if (modalType === "create") {
        await UsersApi.create(payload, { useJWT });
        setSuccessMessage("Usuario registrado correctamente");
      } else if (modalType === "edit" && selectedUser) {
        await UsersApi.update(selectedUser.id, payload, { useJWT });
        setSuccessMessage("Usuario modificado correctamente");
      }
      await refreshList();
      closeModal();
    } catch (e) {
      setErrorMessage(e.message || "Error guardando");
      alert(`Error guardando: ${e.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      await UsersApi.remove(selectedUser.id, { useJWT });
      setSuccessMessage("Usuario eliminado correctamente");
      await refreshList();
      closeModal();
    } catch (e) {
      setErrorMessage(e.message || "Error eliminando");
      alert(`Error eliminando: ${e.message}`);
    }
  };

  /* Filtro local (fallback visual) */
  const filteredUsers = users.filter(user =>
    (user.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(user.ci || "").includes(searchTerm) ||
    (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* Interfaz (intacta) */
  return (
    <div className="um-page">
      <div className="um-container">
        {/* Header */}
        <div className="um-card">
          <div className="um-header">
            <h1 className="um-title">Gestión de Usuarios</h1>
            <button className="btn btn-primary" onClick={() => openModal("create")}>
              <Plus size={18} />
              <span>Registrarse</span>
            </button>
          </div>

          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
          {loading && <div className="alert alert-info">Cargando…</div>}

          {/* Búsqueda */}
          <div className="um-search">
            <Search className="um-search-icon" size={18} />
            <input
              type="text"
              className="input"
              placeholder="Buscar usuario por nombre, CI o correo electrónico…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="um-card">
          <div className="um-table-wrap">
            <table className="um-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>CI</th>
                  <th>Contacto</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="um-user">
                        <div className="um-avatar"><User /></div>
                        <div className="um-user-meta">
                          <div className="um-name">{user.nombre}</div>
                          <div className="um-sub">
                            <Mail /><span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="um-strong">{user.ci}</td>
                    <td>
                      <div className="um-row">
                        <Phone /><span>{user.telefono}</span>
                      </div>
                      <div className="um-row um-muted">
                        <MapPin /><span>{user.direccion}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue">
                        {resolveRolNombre(user)}
                      </span>
                    </td>
                    <td className="um-actions">
                      <button
                        className="icon-btn icon-blue"
                        title="Editar"
                        onClick={() => openModal("edit", user)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="icon-btn icon-red"
                        title="Eliminar"
                        onClick={() => openModal("delete", user)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="um-empty">No hay usuarios para mostrar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="um-modal-overlay">
          <div className="um-modal">
            <div className="um-modal-body">
              <h3 className="um-modal-title">
                {modalType === "create" && "Registrar Usuario"}
                {modalType === "edit" && "Modificar Usuario"}
                {modalType === "delete" && "Confirmar Eliminación"}
              </h3>

              {(modalType === "create" || modalType === "edit") && (
                <div className="form">
                  <div className="field">
                    <label>CI *</label>
                    <input
                      type="text"
                      name="ci"
                      value={formData.ci}
                      onChange={handleInputChange}
                      disabled={modalType === "edit"}
                      className={errors.ci ? "input error" : "input"}
                    />
                    {errors.ci && <p className="help error">{errors.ci}</p>}
                  </div>

                  <div className="field">
                    <label>Nombre Completo *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className={errors.nombre ? "input error" : "input"}
                    />
                    {errors.nombre && <p className="help error">{errors.nombre}</p>}
                  </div>

                  <div className="field">
                    <label>Correo electrónico *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? "input error" : "input"}
                    />
                    {errors.email && <p className="help error">{errors.email}</p>}
                  </div>

                  <div className="field">
                    <label>Teléfono *</label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className={errors.telefono ? "input error" : "input"}
                    />
                    {errors.telefono && <p className="help error">{errors.telefono}</p>}
                  </div>

                  <div className="field">
                    <label>Dirección *</label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      className={errors.direccion ? "input error" : "input"}
                    />
                    {errors.direccion && <p className="help error">{errors.direccion}</p>}
                  </div>

                  <div className="field">
                    <label>Rol *</label>
                    <select
                      name="rol_id"
                      value={formData.rol_id}
                      onChange={handleInputChange}
                      className={errors.rol_id ? "input error" : "input"}
                    >
                      <option value="">Seleccione…</option>
                      {Object.entries(roleMap).map(([id, nombre]) => (
                        <option key={id} value={id}>{nombre}</option>
                      ))}
                    </select>
                    {errors.rol_id && <p className="help error">{errors.rol_id}</p>}
                  </div>
                </div>
              )}

              {modalType === "delete" && (
                <p className="um-confirm">
                  ¿Está seguro que desea eliminar al usuario <strong>{selectedUser?.nombre}</strong>? Esta acción no se puede deshacer.
                </p>
              )}

              <div className="um-modal-actions">
                <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
                {modalType === "create" && (
                  <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
                )}
                {modalType === "edit" && (
                  <button className="btn btn-primary" onClick={handleSave}>Editar</button>
                )}
                {modalType === "delete" && (
                  <button className="btn btn-danger" onClick={handleDelete}>Sí, elimínalo</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;