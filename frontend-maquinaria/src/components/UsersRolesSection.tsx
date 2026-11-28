import { useState, type FormEvent } from 'react';
import { Check, KeyRound, Pencil, Plus, Shield, Trash2, UserCheck, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../state/StoreContext';
import { MAX_CONCURRENT_USERS, type PermissionKey, type RoleDefinition, type SystemUser } from '../types/store';
import { formatDateShort } from '../utils/formatters';
import { Drawer } from './Drawer';

const PERMISSION_CATALOG: { key: PermissionKey; label: string; group: string }[] = [
  { key: 'view_overview', label: 'Ver resumen de sucursal', group: 'General' },
  { key: 'process_sales', label: 'Registrar ventas, proformas y Caja', group: 'Operación' },
  { key: 'manage_customers', label: 'Ver y registrar clientes', group: 'Operación' },
  { key: 'manage_inventory', label: 'Crear y editar máquinas y categorías', group: 'Almacén' },
  { key: 'manage_suppliers', label: 'Proveedores y órdenes de compra', group: 'Almacén' },
  { key: 'view_costs', label: 'Ver costos USD/Bs, márgenes y Kardex', group: 'Finanzas' },
  { key: 'manage_expenses', label: 'Registrar gastos y categorías de gasto', group: 'Finanzas' },
  { key: 'view_reports', label: 'Ver reportes gerenciales y utilidades', group: 'Finanzas' },
  { key: 'manage_exchange_rate', label: 'Modificar TC Dólar / sincronizar BCB', group: 'Control' },
  { key: 'manage_users', label: 'Administrar usuarios, roles y permisos', group: 'Control' },
];

export function UsersRolesSection() {
  const {
    users,
    roles,
    currentUser,
    addUser,
    updateUser,
    deleteUser,
    addRole,
    updateRole,
    deleteRole,
    loginAsUser,
  } = useStore();

  const [tab, setTab] = useState<'users' | 'roles'>('users');

  // User drawer state
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userFullName, setUserFullName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('1234');
  const [userRoleId, setUserRoleId] = useState(roles[1]?.id ?? roles[0]?.id ?? '');
  const [userError, setUserError] = useState<string | null>(null);

  // Role drawer state
  const [roleDrawerOpen, setRoleDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [rolePerms, setRolePerms] = useState<PermissionKey[]>(['view_overview', 'process_sales']);
  const [roleError, setRoleError] = useState<string | null>(null);

  const roleById = new Map(roles.map((r) => [r.id, r]));
  const activeUsersCount = users.filter((u) => u.active).length;

  const openNewUserDrawer = () => {
    setEditingUser(null);
    setUserFullName('');
    setUserUsername('');
    setUserPassword('1234');
    setUserRoleId(roles[1]?.id ?? roles[0]?.id ?? '');
    setUserError(null);
    setUserDrawerOpen(true);
  };

  const openEditUserDrawer = (usr: SystemUser) => {
    setEditingUser(usr);
    setUserFullName(usr.fullName);
    setUserUsername(usr.username);
    setUserPassword(usr.password);
    setUserRoleId(usr.roleId);
    setUserError(null);
    setUserDrawerOpen(true);
  };

  const handleSaveUser = (e: FormEvent) => {
    e.preventDefault();
    setUserError(null);
    if (editingUser) {
      const res = updateUser(editingUser.id, {
        fullName: userFullName.trim(),
        username: userUsername.trim(),
        password: userPassword.trim(),
        roleId: userRoleId,
      });
      if (!res.ok) {
        setUserError(res.error);
        return;
      }
      toast.success(`Usuario "${userFullName.trim()}" actualizado`);
    } else {
      const res = addUser({
        fullName: userFullName,
        username: userUsername,
        password: userPassword,
        roleId: userRoleId,
      });
      if (!res.ok) {
        setUserError(res.error);
        return;
      }
      toast.success(`Usuario "${res.user.fullName}" creado`, {
        description: `Acceso listo con usuario @${res.user.username}`,
      });
    }
    setUserDrawerOpen(false);
  };

  const openNewRoleDrawer = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDescription('');
    setRolePerms(['view_overview', 'process_sales']);
    setRoleError(null);
    setRoleDrawerOpen(true);
  };

  const openEditRoleDrawer = (roleDef: RoleDefinition) => {
    setEditingRole(roleDef);
    setRoleName(roleDef.name);
    setRoleDescription(roleDef.description);
    setRolePerms([...roleDef.permissions]);
    setRoleError(null);
    setRoleDrawerOpen(true);
  };

  const togglePermission = (key: PermissionKey) => {
    setRolePerms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSaveRole = (e: FormEvent) => {
    e.preventDefault();
    setRoleError(null);
    if (editingRole) {
      const res = updateRole(editingRole.id, {
        name: roleName.trim(),
        description: roleDescription.trim(),
        permissions: rolePerms,
      });
      if (!res.ok) {
        setRoleError(res.error);
        return;
      }
      toast.success(`Permisos del rol "${roleName.trim()}" guardados`);
    } else {
      const res = addRole({
        name: roleName,
        description: roleDescription,
        permissions: rolePerms,
      });
      if (!res.ok) {
        setRoleError(res.error);
        return;
      }
      toast.success(`Rol "${res.role.name}" creado`);
    }
    setRoleDrawerOpen(false);
  };

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#D6D6CD] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#14171A] sm:text-3xl">
            Usuarios, Roles y Permisos
          </h1>
          <p className="mt-1 text-sm text-[#5B636B]">
            Crea cuentas para vendedores o almacén y controla exactamente qué módulos y costos puede ver cada rol.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            role="tablist"
            aria-label="Vistas de seguridad y acceso"
            className="inline-flex rounded-lg border border-[#D6D6CD] bg-[#EAEAE3] p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'users'}
              onClick={() => setTab('users')}
              className={`btn-press rounded-md px-3 py-2 text-xs font-semibold ${
                tab === 'users' ? 'bg-[#14171A] text-white' : 'text-[#434B53]'
              }`}
            >
              Usuarios ({users.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'roles'}
              onClick={() => setTab('roles')}
              className={`btn-press rounded-md px-3 py-2 text-xs font-semibold ${
                tab === 'roles' ? 'bg-[#14171A] text-white' : 'text-[#434B53]'
              }`}
            >
              Roles y permisos ({roles.length})
            </button>
          </div>

          {tab === 'users' ? (
            <button
              type="button"
              onClick={openNewUserDrawer}
              className="btn-press inline-flex h-10 items-center gap-2 rounded-lg bg-[#14171A] px-4 text-sm font-semibold text-white hover:bg-[#272C32]"
            >
              <UserPlus className="h-4 w-4 text-[#F59E0B]" />
              Nuevo usuario
            </button>
          ) : (
            <button
              type="button"
              onClick={openNewRoleDrawer}
              className="btn-press inline-flex h-10 items-center gap-2 rounded-lg bg-[#14171A] px-4 text-sm font-semibold text-white hover:bg-[#272C32]"
            >
              <Plus className="h-4 w-4 text-[#F59E0B]" />
              Crear rol
            </button>
          )}
        </div>
      </div>

      {tab === 'users' ? (
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs text-[#5B636B]">
            <span>
              Cuentas activas: <strong className="tabular-nums text-[#14171A]">{activeUsersCount}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D6D6CD] bg-[#F8F8F5] px-2.5 py-0.5 text-[11px] font-medium text-[#434B53]">
              Capacidad operativa: hasta {MAX_CONCURRENT_USERS} usuarios en simultáneo
            </span>
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-[#D6D6CD] bg-white md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#D6D6CD] bg-[#F8F8F5] text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Rol asignado</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Alta</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAE3]">
                {users.map((usr) => {
                  const roleDef = roleById.get(usr.roleId);
                  const isCurrent = usr.id === currentUser?.id;
                  return (
                    <tr key={usr.id} className="hover:bg-[#F8F8F5]">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 font-semibold text-[#14171A]">
                          <span>{usr.fullName}</span>
                          {isCurrent ? (
                            <span className="rounded bg-[#FEF2E4] px-2 py-0.5 text-[11px] font-semibold text-[#8A3A00]">
                              En sesión
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[#434B53]">
                        @{usr.username}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded bg-[#EAEAE3] px-2.5 py-0.5 text-xs font-semibold text-[#14171A]">
                          <Shield className="h-3 w-3 text-[#C95B06]" />
                          {roleDef?.name ?? 'Sin rol'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          disabled={isCurrent}
                          onClick={() => {
                            const res = updateUser(usr.id, { active: !usr.active });
                            if (!res.ok) toast.error(res.error);
                            else
                              toast.info(
                                `${usr.fullName} ${!usr.active ? 'activado' : 'desactivado'}`
                              );
                          }}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            usr.active
                              ? 'bg-[#DCFCE7] text-[#166534]'
                              : 'bg-[#FEE2E2] text-[#991B1B]'
                          } disabled:cursor-default`}
                        >
                          {usr.active ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="tabular-nums whitespace-nowrap px-4 py-3.5 text-xs text-[#5B636B]">
                        {formatDateShort(usr.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {!isCurrent && usr.active ? (
                            <button
                              type="button"
                              onClick={() => {
                                const res = loginAsUser(usr.id);
                                if (res.ok) {
                                  toast.success(`Ahora navegando como ${usr.fullName}`);
                                }
                              }}
                              className="btn-press inline-flex h-8 items-center gap-1 rounded-md border border-[#D6D6CD] bg-white px-2.5 text-xs font-semibold text-[#14171A] hover:border-[#14171A]"
                            >
                              <UserCheck className="h-3.5 w-3.5 text-[#C95B06]" />
                              Probar vista
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => openEditUserDrawer(usr)}
                            aria-label={`Editar usuario ${usr.fullName}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#D6D6CD] bg-white text-[#434B53] hover:border-[#14171A] hover:text-[#14171A]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isCurrent}
                            onClick={() => {
                              const res = deleteUser(usr.id);
                              if (!res.ok) toast.error(res.error);
                              else toast.info(`Usuario "${usr.fullName}" eliminado`);
                            }}
                            aria-label={`Eliminar usuario ${usr.fullName}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#D6D6CD] bg-white text-[#5B636B] hover:border-[#FCA5A5] hover:bg-[#FEE2E2] hover:text-[#991B1B] disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {users.map((usr) => {
              const roleDef = roleById.get(usr.roleId);
              const isCurrent = usr.id === currentUser?.id;
              return (
                <li key={usr.id} className="rounded-xl border border-[#D6D6CD] bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-[#14171A]">{usr.fullName}</div>
                      <div className="font-mono text-xs text-[#5B636B]">@{usr.username}</div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        usr.active
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : 'bg-[#FEE2E2] text-[#991B1B]'
                      }`}
                    >
                      {usr.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-[#434B53]">
                    Rol: {roleDef?.name ?? 'Sin rol'}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-[#EAEAE3] pt-3">
                    {!isCurrent && usr.active ? (
                      <button
                        type="button"
                        onClick={() => loginAsUser(usr.id)}
                        className="btn-press inline-flex h-9 items-center gap-1 rounded-lg bg-[#14171A] px-3 text-xs font-semibold text-white"
                      >
                        Probar vista
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => openEditUserDrawer(usr)}
                      className="btn-press inline-flex h-9 items-center gap-1 rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-3 text-xs font-semibold text-[#14171A]"
                    >
                      Editar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {roles.map((roleDef) => {
            const assignedCount = users.filter((u) => u.roleId === roleDef.id).length;
            return (
              <article
                key={roleDef.id}
                className="flex flex-col justify-between rounded-xl border border-[#D6D6CD] bg-white p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg font-bold text-[#14171A]">
                          {roleDef.name}
                        </h2>
                        <span className="tabular-nums rounded bg-[#EAEAE3] px-2 py-0.5 text-[11px] font-semibold text-[#434B53]">
                          {assignedCount} usuario(s)
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#5B636B]">{roleDef.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditRoleDrawer(roleDef)}
                        className="btn-press inline-flex h-8 items-center gap-1 rounded-md border border-[#D6D6CD] bg-[#F8F8F5] px-2.5 text-xs font-semibold text-[#14171A] hover:border-[#14171A]"
                      >
                        <Pencil className="h-3 w-3" />
                        Permisos
                      </button>
                      {!roleDef.isSystem ? (
                        <button
                          type="button"
                          onClick={() => {
                            const res = deleteRole(roleDef.id);
                            if (!res.ok) toast.error(res.error);
                            else toast.info(`Rol "${roleDef.name}" eliminado`);
                          }}
                          aria-label={`Eliminar rol ${roleDef.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#D6D6CD] bg-white text-[#5B636B] hover:border-[#FCA5A5] hover:bg-[#FEE2E2] hover:text-[#991B1B]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <ul className="mt-4 grid grid-cols-1 gap-1.5 border-t border-[#EAEAE3] pt-3 sm:grid-cols-2">
                    {PERMISSION_CATALOG.map((perm) => {
                      const enabled = roleDef.permissions.includes(perm.key);
                      return (
                        <li
                          key={perm.key}
                          className={`flex items-center gap-2 text-xs ${
                            enabled ? 'font-medium text-[#14171A]' : 'text-[#5B636B]/55 line-through'
                          }`}
                        >
                          <span
                            className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                              enabled
                                ? 'bg-[#DCFCE7] text-[#166534]'
                                : 'bg-[#EAEAE3] text-[#5B636B]'
                            }`}
                          >
                            {enabled ? <Check className="h-3 w-3" /> : '–'}
                          </span>
                          <span className="truncate">{perm.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Create / Edit User Drawer */}
      <Drawer
        open={userDrawerOpen}
        onClose={() => setUserDrawerOpen(false)}
        title={editingUser ? `Editar usuario (${editingUser.fullName})` : 'Nuevo usuario del sistema'}
        subtitle="Define credenciales de acceso y el rol que determina sus permisos."
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          {userError ? (
            <div
              role="alert"
              className="rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-3.5 py-2.5 text-xs font-semibold text-[#991B1B]"
            >
              {userError}
            </div>
          ) : null}

          <label className="block text-xs font-semibold text-[#434B53]">
            Nombre completo *
            <input
              type="text"
              required
              value={userFullName}
              onChange={(e) => setUserFullName(e.target.value)}
              placeholder="Ej. Roberto Mamani"
              className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-[#434B53]">
              Nombre de usuario *
              <input
                type="text"
                required
                value={userUsername}
                onChange={(e) => setUserUsername(e.target.value)}
                placeholder="Ej. roberto"
                className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 font-mono text-sm lowercase text-[#14171A]"
              />
            </label>
            <label className="block text-xs font-semibold text-[#434B53]">
              Contraseña / PIN *
              <div className="relative mt-1">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5B636B]" />
                <input
                  type="text"
                  required
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#D6D6CD] bg-white pl-8 pr-3 font-mono text-sm text-[#14171A]"
                />
              </div>
            </label>
          </div>

          <label className="block text-xs font-semibold text-[#434B53]">
            Rol asignado
            <select
              value={userRoleId}
              onChange={(e) => setUserRoleId(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          <p className="rounded-lg border border-[#EAEAE3] bg-[#F8F8F5] px-3 py-2 text-[11px] text-[#5B636B]">
            {activeUsersCount >= MAX_CONCURRENT_USERS
              ? `Actualmente hay ${activeUsersCount} cuentas activas. El servidor permite hasta ${MAX_CONCURRENT_USERS} sesiones conectadas en simultáneo.`
              : `El servidor de 1 sucursal admite hasta ${MAX_CONCURRENT_USERS} usuarios conectados en simultáneo sin afectar el rendimiento.`}
          </p>

          <button
            type="submit"
            className="btn-press inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#14171A] text-sm font-semibold text-white hover:bg-[#272C32]"
          >
            {editingUser ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </form>
      </Drawer>

      {/* Create / Edit Role Drawer */}
      <Drawer
        open={roleDrawerOpen}
        onClose={() => setRoleDrawerOpen(false)}
        title={editingRole ? `Configurar rol: ${editingRole.name}` : 'Crear nuevo rol personalizado'}
        subtitle="Marca exactamente qué pantallas y acciones puede realizar este rol."
      >
        <form onSubmit={handleSaveRole} className="space-y-4">
          {roleError ? (
            <div
              role="alert"
              className="rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-3.5 py-2.5 text-xs font-semibold text-[#991B1B]"
            >
              {roleError}
            </div>
          ) : null}

          <label className="block text-xs font-semibold text-[#434B53]">
            Nombre del rol *
            <input
              type="text"
              required
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Ej. Cajero Supervisor"
              className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
            />
          </label>

          <label className="block text-xs font-semibold text-[#434B53]">
            Descripción
            <input
              type="text"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Ej. Cobra ventas, abre caja y consulta stock"
              className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
            />
          </label>

          <div>
            <div className="mb-2 text-xs font-semibold text-[#434B53]">
              Permisos habilitados ({rolePerms.length})
            </div>
            <div className="space-y-2 rounded-xl border border-[#D6D6CD] bg-[#F8F8F5] p-3">
              {PERMISSION_CATALOG.map((perm) => {
                const checked = rolePerms.includes(perm.key);
                return (
                  <label
                    key={perm.key}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-white px-3 py-2.5 text-xs font-medium text-[#14171A] hover:bg-[#F3F3EF]"
                  >
                    <span className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermission(perm.key)}
                        className="h-4 w-4 accent-[#14171A]"
                      />
                      <span>{perm.label}</span>
                    </span>
                    <span className="rounded bg-[#EAEAE3] px-1.5 py-0.5 text-[10px] font-semibold text-[#5B636B]">
                      {perm.group}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="btn-press inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#14171A] text-sm font-semibold text-white hover:bg-[#272C32]"
          >
            {editingRole ? 'Guardar permisos del rol' : 'Crear rol'}
          </button>
        </form>
      </Drawer>
    </div>
  );
}
