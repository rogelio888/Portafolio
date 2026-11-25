import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  UserCog,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  Mail,
  Phone,
  Save,
  X,
  UserCheck,
  Loader2,
  UserPlus,
  Edit,
  Trash2,
} from 'lucide-react';
import { useClientStore } from '../../clients/state/useClientStore';
import { useAuthStore } from '../../auth/state/useAuthStore';
import { useBranchStore } from '../../settings/state/useBranchStore';
import { useToast } from '../../../components/ui/ToastProvider';
import { api } from '../../../services/api';
import ConfirmModal from '../../../components/ConfirmModal';

interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  branch_id?: string | null;
  branch?: { id: string; name: string } | null;
  roles?: { id: string; name: string }[];
}

interface ApiRole {
  id: string;
  name: string;
  permissions: { id: string; name: string }[];
}

export const formatRoleLabel = (roleName: string): string => {
  switch (roleName) {
    case 'admin':
      return 'Administrador General';
    case 'manager':
      return 'Gerente';
    case 'receptionist':
      return 'Recepcionista';
    default:
      return roleName.charAt(0).toUpperCase() + roleName.slice(1);
  }
};

const PERMISSION_MODULES = [
  {
    category: 'Asistencias & Kiosco',
    permissions: [
      { key: 'attendance.view', label: 'Ver registro de asistencias' },
      { key: 'attendance.scan', label: 'Escanear códigos QR (Modo Kiosco)' },
    ],
  },
  {
    category: 'Clientes & Miembros',
    permissions: [
      { key: 'clients.view', label: 'Ver lista de clientes' },
      { key: 'clients.create', label: 'Registrar nuevos clientes' },
      { key: 'clients.edit', label: 'Editar información de clientes' },
      { key: 'clients.delete', label: 'Eliminar o suspender clientes' },
    ],
  },
  {
    category: 'Membresías & Renovaciones',
    permissions: [
      { key: 'memberships.view', label: 'Ver planes de membresía' },
      { key: 'memberships.create', label: 'Crear nuevos planes' },
      { key: 'renewal-requests.view', label: 'Ver solicitudes de renovación' },
    ],
  },
  {
    category: 'Pagos, Caja & Reportes',
    permissions: [
      { key: 'payments.view', label: 'Ver registro de pagos' },
      { key: 'payments.create', label: 'Cobrar y registrar pagos' },
      { key: 'reports.view', label: 'Ver reportes financieros e ingresos' },
    ],
  },
  {
    category: 'Administración & Sistema',
    permissions: [
      { key: 'users.manage', label: 'Gestionar usuarios del sistema' },
      { key: 'settings.manage', label: 'Modificar configuración del gimnasio' },
    ],
  },
];

export const UsersManagementPage: React.FC = () => {
  const { theme } = useClientStore();
  const toast = useToast();
  const { updateRolePermissions } = useAuthStore();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; user: ApiUser | null; isLoading: boolean }>({
    isOpen: false, user: null, isLoading: false,
  });

  const { branches, fetchBranches } = useBranchStore();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'receptionist',
    branchId: 'all',
    password: '',
  });

  // Local state for role permissions matrix
  const [rolePermissionsMap, setRolePermissionsMap] = useState<Record<string, string[]>>({});
  const [selectedRoleName, setSelectedRoleName] = useState<string>('receptionist');

  // Fetch Users & Roles from Real Laravel API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles'),
      ]);

      const fetchedUsers: ApiUser[] = usersRes.data.data || usersRes.data || [];
      const fetchedRoles: ApiRole[] = rolesRes.data.data || rolesRes.data || [];

      setUsers(fetchedUsers);
      setRoles(fetchedRoles);

      // Build permissions map from API
      const permMap: Record<string, string[]> = {};
      fetchedRoles.forEach((r) => {
        permMap[r.name] = r.permissions ? r.permissions.map((p) => p.name) : [];
      });
      setRolePermissionsMap(permMap);
    } catch {
      toast.error('Error al conectar', 'No se pudieron cargar los usuarios y roles desde la API de Laravel.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchData();

    const handleBranchChanged = () => fetchData();
    window.addEventListener('branch-changed', handleBranchChanged);
    return () => window.removeEventListener('branch-changed', handleBranchChanged);
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTogglePermission = (permKey: string) => {
    setRolePermissionsMap((prev) => {
      const current = prev[selectedRoleName] || [];
      const updated = current.includes(permKey)
        ? current.filter((k) => k !== permKey)
        : [...current, permKey];
      return { ...prev, [selectedRoleName]: updated };
    });
  };

  const [isSavingPermissions, setIsSavingPermissions] = useState<boolean>(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState<boolean>(false);

  const handleSavePermissions = async () => {
    setIsSavingPermissions(true);
    const targetRole = roles.find((r) => r.name === selectedRoleName);
    const updatedPerms = rolePermissionsMap[selectedRoleName] || [];

    try {
      if (targetRole) {
        await api.put(`/roles/${targetRole.id}`, {
          permissions: updatedPerms,
        });
        updateRolePermissions(selectedRoleName, updatedPerms);
        toast.success('Permisos Sincronizados', `Los permisos del rol "${selectedRoleName}" fueron guardados en la Base de Datos de Laravel.`);
      } else {
        toast.error('Rol no encontrado', `No se encontró el id del rol "${selectedRoleName}".`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Ocurrió un fallo al sincronizar los permisos en el servidor API.';
      toast.error('Error al guardar', msg);
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'receptionist',
      branchId: branches[0]?.id || 'all',
      password: '',
    });
    setShowUserModal(true);
  };

  const handleOpenEditModal = (user: ApiUser) => {
    setEditingUser(user);
    const roleName = user.roles?.[0]?.name || 'receptionist';
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: roleName,
      branchId: user.branch_id || user.branch?.id || 'all',
      password: '',
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingUser(true);
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        role: formData.role,
        branch_id: formData.branchId === 'all' ? null : formData.branchId,
      };

      if (editingUser) {
        if (formData.password) {
          payload.password = formData.password;
        }
        await api.put(`/users/${editingUser.id}`, payload);
        toast.success('Usuario Actualizado', `Los datos de ${formData.name} fueron actualizados en PostgreSQL.`);
      } else {
        payload.password = formData.password;
        await api.post('/users', payload);
        toast.success('Usuario Creado', `El usuario ${formData.name} fue guardado en PostgreSQL.`);
      }
      setShowUserModal(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', phone: '', role: 'receptionist', branchId: 'all', password: '' });
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Verifique los datos e intente nuevamente.';
      toast.error('Error al guardar usuario', msg);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const currentUser = useAuthStore((s) => s.user);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleToggleUserStatus = async (user: ApiUser) => {
    if (user.id === currentUser?.id || user.email === currentUser?.email) {
      toast.error('Operación No Permitida', 'No puedes desactivar tu propia cuenta de usuario en sesión.');
      return;
    }
    if (updatingUserId === user.id) return;
    setUpdatingUserId(user.id);
    try {
      await api.put(`/users/${user.id}`, {
        is_active: !user.is_active,
      });
      toast.success('Estatus Actualizado', `El usuario ${user.name} ahora está ${!user.is_active ? 'Activo' : 'Desactivado'}.`);
      setUsers(users.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u)));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'No se pudo cambiar el estatus del usuario.';
      toast.error('Error al actualizar', msg);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (user: ApiUser) => {
    if (user.id === currentUser?.id || user.email === currentUser?.email) {
      toast.error('Operación No Permitida', 'No puedes eliminar tu propia cuenta de usuario en sesión.');
      return;
    }
    setConfirmModal({ isOpen: true, user, isLoading: false });
  };

  const executeDeleteUser = async () => {
    const user = confirmModal.user;
    if (!user) return;
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await api.delete(`/users/${user.id}`);
      toast.success('Usuario Eliminado', `El usuario ${user.name} ha sido eliminado.`);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'No se pudo eliminar el usuario.';
      toast.error('Error al eliminar', msg);
    } finally {
      setConfirmModal({ isOpen: false, user: null, isLoading: false });
    }
  };

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black tracking-wide flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <UserCog className={`h-7 w-7 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            Usuarios & Permisos de Acceso
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Administra la lista de personal del gimnasio y configura las acciones autorizadas para cada rol.
          </p>
        </div>

        {/* Tab Selector */}
        <div className={`flex items-center p-1 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            Personal ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Matriz de Permisos ({roles.length} Perfiles)
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          <span className="ml-3 text-xs font-bold text-slate-400">Cargando Usuarios & Permisos desde la API...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: USERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar usuario por nombre o correo..."
                    className={`w-full border rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <button
                  onClick={handleOpenCreateModal}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Usuario de Personal
                </button>
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((u) => {
                  const roleName = u.roles?.[0]?.name || 'Sin Rol';
                  const isSelf = u.id === currentUser?.id || u.email === currentUser?.email;
                  return (
                    <div
                      key={u.id}
                      className={`p-5 rounded-3xl border transition-colors shadow-sm flex flex-col justify-between ${
                        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{u.name}</h3>
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                                roleName === 'admin'
                                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {formatRoleLabel(roleName)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              className="p-1.5 rounded-xl text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 transition-all cursor-pointer"
                              title="Editar datos del usuario"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              disabled={isSelf || updatingUserId === u.id}
                              className={`p-1.5 rounded-xl transition-all ${
                                isSelf
                                  ? 'opacity-40 cursor-not-allowed text-slate-500 bg-slate-800/20'
                                  : updatingUserId === u.id
                                    ? 'opacity-50 cursor-wait text-emerald-400 bg-emerald-500/10'
                                    : u.is_active
                                      ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer'
                                      : 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 cursor-pointer'
                              }`}
                              title={isSelf ? 'No puedes desactivar tu propia cuenta en sesión' : u.is_active ? 'Usuario Activo (Clic para desactivar)' : 'Usuario Desactivado (Clic para activar)'}
                            >
                              {updatingUserId === u.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                              ) : u.is_active ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </button>

                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all cursor-pointer"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 text-xs pt-3 border-t border-slate-200 dark:border-slate-800/80">
                          <p className={`flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            <Mail className="h-3.5 w-3.5 text-emerald-500" /> {u.email}
                          </p>
                          <p className={`flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            <Phone className="h-3.5 w-3.5 text-emerald-500" /> {u.phone || 'Sin teléfono'}
                          </p>
                          <p className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Building2 className="h-3.5 w-3.5 text-emerald-500" /> {u.branch?.name || 'Sucursal Central Equipetrol'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SPATIE PERMISSIONS MATRIX */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              {/* Role Selector Tabs */}
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => {
                  const isSelected = selectedRoleName === r.name;
                  const roleTitle = formatRoleLabel(r.name);
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRoleName(r.name)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all border flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                          : isDark
                            ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <ShieldCheck className={`h-4 w-4 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
                      Perfil: {roleTitle}
                    </button>
                  );
                })}
              </div>

              {/* Permissions Cards per Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PERMISSION_MODULES.map((mod) => (
                  <div
                    key={mod.category}
                    className={`p-5 rounded-3xl border ${
                      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <h3 className="font-extrabold text-sm text-emerald-400 mb-3 border-b border-slate-800 pb-2">
                      {mod.category}
                    </h3>
                    <div className="space-y-2.5">
                      {mod.permissions.map((p) => {
                        const currentRolePerms = rolePermissionsMap[selectedRoleName] || [];
                        const isChecked = currentRolePerms.includes(p.key);
                        return (
                          <label
                            key={p.key}
                            className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                              isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-100'
                            }`}
                          >
                            <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {p.label}
                            </span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(p.key)}
                              className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Permissions Footer */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSavePermissions}
                  disabled={isSavingPermissions}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSavingPermissions ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSavingPermissions ? 'Guardando...' : 'Guardar Cambios de Permisos'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {showUserModal && createPortal(
        <div className="fixed inset-0 !m-0 z-[9999] bg-slate-950/80 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-black text-base flex items-center gap-2">
                {editingUser ? <Edit className="h-5 w-5 text-sky-400" /> : <UserPlus className="h-5 w-5 text-emerald-500" />}
                {editingUser ? 'Editar Usuario de Personal' : 'Nuevo Usuario de Personal'}
              </h2>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Carlos Mendoza"
                  className={`w-full border rounded-xl p-2.5 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@fitscan.com"
                  className={`w-full border rounded-xl p-2.5 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Teléfono / Celular</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+591 70000000"
                  className={`w-full border rounded-xl p-2.5 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">
                  Rol de Acceso (Spatie) *
                  {editingUser && (editingUser.id === currentUser?.id || editingUser.email === currentUser?.email) && (
                    <span className="text-[10px] text-amber-400 font-normal ml-2">
                      (No puedes modificar tu propio rol)
                    </span>
                  )}
                </label>
                <select
                  value={formData.role}
                  disabled={Boolean(editingUser && (editingUser.id === currentUser?.id || editingUser.email === currentUser?.email))}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`w-full border rounded-xl p-2.5 font-bold disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <option value="admin">Administrador General</option>
                  <option value="manager">Gerente</option>
                  <option value="receptionist">Recepcionista</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Sucursal de Asignación / Acceso *</label>
                <select
                  value={formData.branchId || 'all'}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className={`w-full border rounded-xl p-2.5 font-bold ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <option value="all">Toda la Cadena (Todas las sucursales)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">
                  {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Acceso *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? 'Dejar en blanco para mantener la contraseña actual' : '••••••••'}
                  className={`w-full border rounded-xl p-2.5 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingUser}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl shadow-lg mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmittingUser ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{editingUser ? 'Guardando Cambios...' : 'Creando Usuario...'}</span>
                  </>
                ) : (
                  <span>{editingUser ? 'Guardar Cambios' : 'Crear Usuario'}</span>
                )}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, user: null, isLoading: false })}
        onConfirm={executeDeleteUser}
        title="Eliminar Usuario"
        message={`¿Estás seguro de eliminar el usuario "${confirmModal.user?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
};
