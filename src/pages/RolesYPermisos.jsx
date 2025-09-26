import React, { useState } from "react";
import { Edit, Plus, Save, X } from "lucide-react";
import "../styles/roles.css";
import {
  SEED_ROLES,
  AVAILABLE_PERMISSIONS,
  validateRoleForm,
  addPermission,
  removePermission,
} from "../api/roles";

const RolesManager = () => {
  const [roles, setRoles] = useState(SEED_ROLES);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: "", permissions: [] });
  const [errors, setErrors] = useState({});

  const categories = [...new Set(AVAILABLE_PERMISSIONS.map((p) => p.category))];

  const validateForm = () => {
    const nextErrors = validateRoleForm(formData);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreateRole = () => {
    if (!validateForm()) return;
    const newRole = {
      id: Date.now(),
      name: formData.name,
      permissions: formData.permissions,
    };
    setRoles([...roles, newRole]);
    resetForm();
  };

  const handleUpdateRole = () => {
    if (!validateForm()) return;
    setRoles(
      roles.map((role) =>
        role.id === editingRole.id
          ? { ...role, name: formData.name, permissions: formData.permissions }
          : role
      )
    );
    resetForm();
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      permissions: [...role.permissions],
    });
    setShowForm(true);
    setErrors({});
  };

  const resetForm = () => {
    setFormData({ name: "", permissions: [] });
    setShowForm(false);
    setEditingRole(null);
    setErrors({});
  };

  const handlePermissionChange = (permissionId, checked) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? addPermission(prev.permissions, permissionId)
        : removePermission(prev.permissions, permissionId),
    }));
  };

  return (
    <div className="roles-page container">
      <div className="header">
        <h1 className="title">Gestión de Roles y Permisos</h1>
      </div>

      {!showForm && (
        <div className="actions">
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus size={20} />
            Agregar
          </button>
        </div>
      )}

      {showForm && (
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">
              {editingRole ? "Editar Rol" : "Crear Nuevo Rol"}
            </h2>
            <button onClick={resetForm} className="icon-btn">
              <X size={20} />
            </button>
          </div>

          <div className="form">
            <div className="form-field">
              <label className="label">Nombre del Rol</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`input ${errors.name ? "input-error" : ""}`}
                placeholder="Ingrese el nombre del rol"
              />
              {errors.name && <p className="error">{errors.name}</p>}
            </div>

            <div className="form-field">
              <label className="label">Permisos por Categoría</label>

              {categories.map((category) => (
                <div key={category} className="perm-section">
                  <h4 className="perm-title">{category}</h4>
                  <div className="perm-grid">
                    {AVAILABLE_PERMISSIONS.filter(
                      (p) => p.category === category
                    ).map((permission) => (
                      <label key={permission.id} className="perm-item">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={(e) =>
                            handlePermissionChange(
                              permission.id,
                              e.target.checked
                            )
                          }
                          className="checkbox"
                        />
                        <span className="perm-name">{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {errors.permissions && (
                <p className="error">{errors.permissions}</p>
              )}
            </div>

            <div className="form-actions">
              <button
                onClick={editingRole ? handleUpdateRole : handleCreateRole}
                className="btn btn-success"
              >
                <Save size={16} />
                {editingRole ? "Guardar cambios" : "Crear"}
              </button>
              <button onClick={resetForm} className="btn btn-muted">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-head">
          <h2 className="table-title">Roles Registrados</h2>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre del Rol</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="row">
                  <td>
                    <div className="role-name">{role.name}</div>
                  </td>
                  <td>
                    <div className="chips">
                      {role.permissions.slice(0, 2).map((permissionId) => {
                        const permission = AVAILABLE_PERMISSIONS.find(
                          (p) => p.id === permissionId
                        );
                        return (
                          <span key={permissionId} className="chip">
                            {permission?.name}
                          </span>
                        );
                      })}
                      {role.permissions.length > 2 && (
                        <span className="chip chip-more">
                          +{role.permissions.length - 2} más
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="right">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="icon-btn icon-primary"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!roles.length && (
                <tr>
                  <td colSpan={3} className="empty">
                    No hay roles registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RolesManager;