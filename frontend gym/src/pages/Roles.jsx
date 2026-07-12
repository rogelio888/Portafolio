import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Edit2, Trash2, Plus, AlertCircle, Key, Check } from 'lucide-react';
import { APP_MODULES, getRoles, createRole, updateRole, deleteRole, updateRolePermissions } from '../data/db';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [errorMsg, setErrorMsg] = useState('');

  // Modal de Permisos
  const [showPermsModal, setShowPermsModal] = useState(false);
  const [roleForPerms, setRoleForPerms] = useState(null);
  const [tempPerms, setTempPerms] = useState({});

  const reload = () => setRoles(getRoles());

  useEffect(() => {
    reload();
  }, []);

  // ----------------------------------------------------
  // LÓGICA DE ROLES
  // ----------------------------------------------------
  const handleOpenModal = (role = null) => {
    setErrorMsg('');
    if (role) {
      setEditingRole(role);
      setFormData({ name: role.name, description: role.description });
    } else {
      setEditingRole(null);
      setFormData({ name: '', description: '' });
    }
    setShowModal(true);
  };

  const handleDelete = (role) => {
    setErrorMsg('');
    const result = deleteRole(role.id);
    if (!result.success) {
      setErrorMsg(result.message);
      return;
    }
    reload();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRole) {
      updateRole(editingRole.id, formData);
    } else {
      createRole(formData);
    }
    reload();
    setShowModal(false);
  };

  // ----------------------------------------------------
  // LÓGICA DE PERMISOS
  // ----------------------------------------------------
  const handleOpenPermsModal = (role) => {
    setErrorMsg('');
    setRoleForPerms(role);
    setTempPerms(JSON.parse(JSON.stringify(role.permissions)));
    setShowPermsModal(true);
  };

  const handleTogglePerm = (module, action) => {
    setTempPerms(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action]
      }
    }));
  };

  const handleSavePerms = () => {
    updateRolePermissions(roleForPerms.id, tempPerms);
    reload();
    setShowPermsModal(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto p-8">
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-wider mb-1">
            Gestión de Roles y Permisos
          </h1>
          <p className="text-gray-400 font-medium">Administra los permisos de acceso y acciones del sistema</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold uppercase tracking-wide transition-all shadow-lg hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Nuevo Rol
        </button>
      </div>

      {/* Alerta de Error */}
      {errorMsg && (
        <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 p-4 rounded-md flex items-center gap-3 mb-6 animate-[fadeIn_0.3s_ease-out]">
          <AlertCircle size={20} className="shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Tabla de Roles */}
      <div className="bg-[#1e1e1e] border-t-4 border-blue-600 rounded-lg shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#181818] border-b-2 border-[#2a2a2a]">
                <th className="p-5 font-bold uppercase tracking-wider text-xs text-gray-400 w-1/3">Nombre del Rol</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs text-gray-400 w-1/2">Descripción</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs text-gray-400 w-1/6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-[#222] transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border-2 ${role.name === 'Administrador' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-500'}`}>
                        {role.name === 'Administrador' ? <ShieldAlert size={20} /> : <Shield size={20} />}
                      </div>
                      <span className="font-bold text-white uppercase text-sm tracking-wide">{role.name}</span>
                    </div>
                  </td>
                  <td className="p-5 text-gray-400 text-sm">
                    {role.description}
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenPermsModal(role)}
                        className="p-2 bg-[#1a1a1a] border border-[#333] hover:border-amber-500 hover:bg-amber-500 hover:text-white text-amber-400 rounded-md transition-colors"
                        title="Configurar Permisos"
                      >
                        <Key size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenModal(role)}
                        className="p-2 bg-[#1a1a1a] border border-[#333] hover:border-blue-500 hover:bg-blue-500 hover:text-white text-blue-400 rounded-md transition-colors"
                        title="Editar Rol"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(role)}
                        className="p-2 bg-[#1a1a1a] border border-[#333] hover:border-red-500 hover:bg-red-500 hover:text-white text-red-400 rounded-md transition-colors"
                        title="Eliminar Rol"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD de Roles */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#1e1e1e] w-full max-w-md rounded-lg border-t-4 border-blue-600 shadow-2xl animate-[modalIn_0.2s_ease-out]">
            <div className="p-6">
              <h2 className="text-2xl font-black uppercase text-white tracking-wide mb-6">
                {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                    Nombre del Rol
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-[#2a2a2a] border-2 border-transparent focus:border-blue-500 focus:bg-[#1e1e1e] text-white px-4 py-3 rounded-lg outline-none transition-all font-medium"
                    placeholder="Ej. Entrenador"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                    Descripción (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="bg-[#2a2a2a] border-2 border-transparent focus:border-blue-500 focus:bg-[#1e1e1e] text-white px-4 py-3 rounded-lg outline-none transition-all font-medium"
                    placeholder="Breve descripción del rol..."
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-[#333]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-lg font-bold text-gray-400 bg-[#2a2a2a] hover:bg-[#333] hover:text-white border-2 border-[#333] transition-colors uppercase text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors uppercase text-sm"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Permisos */}
      {showPermsModal && roleForPerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#1e1e1e] w-full max-w-4xl rounded-lg border-t-4 border-amber-500 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#333]">
              <h2 className="text-2xl font-black uppercase text-white tracking-wide">
                Permisos: <span className="text-amber-500">{roleForPerms.name}</span>
              </h2>
              <p className="text-gray-400 mt-1">Configura qué módulos y acciones puede realizar este rol en el sistema.</p>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#181818]">
                    <th className="p-4 font-bold uppercase text-xs text-gray-400 border-b-2 border-[#333]">Módulo</th>
                    <th className="p-4 font-bold uppercase text-xs text-gray-400 border-b-2 border-[#333] text-center w-24">Ver</th>
                    <th className="p-4 font-bold uppercase text-xs text-gray-400 border-b-2 border-[#333] text-center w-24">Crear</th>
                    <th className="p-4 font-bold uppercase text-xs text-gray-400 border-b-2 border-[#333] text-center w-24">Editar</th>
                    <th className="p-4 font-bold uppercase text-xs text-gray-400 border-b-2 border-[#333] text-center w-24">Eliminar</th>
                  </tr>
                </thead>
                <tbody>
                  {APP_MODULES.map((module) => (
                    <tr key={module} className="border-b border-[#2a2a2a] hover:bg-[#222]">
                      <td className="p-4 font-semibold text-white">{module}</td>

                      {['view', 'create', 'edit', 'delete'].map(action => (
                        <td key={action} className="p-4 text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={tempPerms[module]?.[action] || false}
                              onChange={() => handleTogglePerm(module, action)}
                            />
                            <div className="w-6 h-6 bg-[#2a2a2a] border-2 border-[#444] rounded peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all flex items-center justify-center">
                              {tempPerms[module]?.[action] && <Check size={16} className="text-white" strokeWidth={4} />}
                            </div>
                          </label>
                        </td>
                      ))}

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-[#333] flex justify-end gap-3 bg-[#181818] rounded-b-lg">
              <button
                onClick={() => setShowPermsModal(false)}
                className="px-6 py-3 rounded-lg font-bold text-gray-400 bg-[#2a2a2a] hover:bg-[#333] hover:text-white border-2 border-[#333] transition-colors uppercase text-sm tracking-wide"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePerms}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-black bg-amber-500 hover:bg-amber-400 transition-colors uppercase text-sm tracking-wide"
              >
                <Check size={18} />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Roles;
