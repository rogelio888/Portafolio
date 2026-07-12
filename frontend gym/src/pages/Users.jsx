import { useState, useEffect } from 'react';
import { UserPlus, Edit2, Shield, Mail, User, Search, Power, CheckCircle, XCircle } from 'lucide-react';
import { getUsuarios, getRoles, createUsuario, updateUsuario, toggleUsuarioStatus } from '../data/db';
import '../styles/Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', roleId: '', email: '', password: '' });
  const [emailError, setEmailError] = useState('');

  const reload = () => {
    setUsers(getUsuarios());
    setRoles(getRoles());
  };

  useEffect(() => {
    reload();
  }, []);

  const handleOpenModal = (user = null) => {
    const defaultRoleId = roles[0]?.id ?? '';
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, roleId: user.roleId, email: user.email, password: '' });
    } else {
      setEditingUser(null);
      setFormData({ name: '', roleId: defaultRoleId, email: '', password: '' });
    }
    setEmailError('');
    setShowModal(true);
  };

  const handleToggleStatus = (id) => {
    const result = toggleUsuarioStatus(id);
    if (!result.success) {
      alert(result.message);
      return;
    }
    reload();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEmailError('');

    const payload = { name: formData.name, email: formData.email, roleId: Number(formData.roleId) };
    const result = editingUser
      ? updateUsuario(editingUser.id, payload)
      : createUsuario({ ...payload, password: formData.password });

    if (!result.success) {
      setEmailError(result.message);
      return;
    }

    reload();
    setShowModal(false);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Usuarios</h1>
          <p className="page-subtitle">Administra los accesos y credenciales del personal del gimnasio</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <UserPlus size={18} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="filters-section" style={{marginBottom: '1.5rem', display: 'flex', gap: '1rem'}}>
        <div className="input-group" style={{maxWidth: '300px', flex: 1}}>
          <Search className="input-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-panel table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-info-cell">
                    <div className="avatar-circle">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="user-name">{user.name}</p>
                      <p className="user-email"><Mail size={12}/> {user.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.roleName === 'Administrador' ? 'admin' : 'recep'}`}>
                    {user.roleName === 'Administrador' && <Shield size={12} />}
                    {user.roleName}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status === 'Activo' ? 'activo' : 'inactivo'}`}>
                    {user.status === 'Activo' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon edit" onClick={() => handleOpenModal(user)} title="Editar">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon toggle" onClick={() => handleToggleStatus(user.id)} title={user.status === 'Activo' ? 'Dar de Baja' : 'Activar'}>
                      <Power size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-state">No se encontraron usuarios.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            <form onSubmit={handleSubmit} className="crud-form">
              <div className="form-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    setEmailError('');
                  }}
                  required
                />
                {emailError && <p className="form-error">{emailError}</p>}
              </div>
              {!editingUser && (
                <div className="form-group">
                  <label>Contraseña</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Contraseña de acceso"
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>Rol del Sistema</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
