import { create } from 'zustand';
import type { AuthUser } from '../types/auth.types';
import { api } from '../../../services/api';

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['*'],
  manager: [
    'dashboard.view',
    'attendance.view',
    'attendance.scan',
    'clients.view',
    'clients.create',
    'clients.edit',
    'clients.delete',
    'memberships.view',
    'memberships.create',
    'payments.view',
    'payments.create',
    'reports.view',
    'renewal-requests.view',
  ],
  receptionist: [
    'dashboard.view',
    'attendance.view',
    'attendance.scan',
    'clients.view',
    'clients.create',
    'memberships.view',
    'payments.create',
  ],
};

export const getStoredRolePermissions = (): Record<string, string[]> => {
  const saved = localStorage.getItem('fitscan_role_permissions');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return DEFAULT_ROLE_PERMISSIONS;
};

export const DEMO_USERS: Record<string, AuthUser> = {
  admin: {
    id: 'usr-3',
    name: 'Administrador FitScan',
    email: 'admin@fitscan.com',
    role: 'Administrador General',
    branch: 'Sucursal Central Equipetrol',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    roles: ['admin'],
    permissions: ['*'],
  },
  reception: {
    id: 'usr-1',
    name: 'Ana Sofía (Recepcionista)',
    email: 'recepcion@fitscan.com',
    role: 'Recepcionista',
    branch: 'Sucursal Central Equipetrol',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    roles: ['receptionist'],
    permissions: DEFAULT_ROLE_PERMISSIONS.receptionist,
  },
};

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsDemo: (type: 'admin' | 'reception') => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  updateRolePermissions: (role: string, permissions: string[]) => void;
}

const savedToken = localStorage.getItem('fitscan_token');
const savedUser = localStorage.getItem('fitscan_user');

let initialUser: AuthUser | null = null;
let hasSession = false;

if (savedToken && savedUser) {
  try {
    initialUser = JSON.parse(savedUser);
    hasSession = true;
  } catch {
    localStorage.removeItem('fitscan_token');
    localStorage.removeItem('fitscan_user');
  }
}

let checkAuthPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: hasSession,
  user: initialUser,
  token: savedToken || null,
  isLoading: false,
  error: null,

  hasPermission: (permission: string) => {
    const user = get().user;
    if (!user) return false;

    const rawRole = user.roles?.[0];
    const userRole = (typeof rawRole === 'object' ? (rawRole as any)?.name : rawRole) || 'receptionist';

    if (user.permissions?.includes('*') || userRole === 'admin') return true;

    // 1. Direct check in API permissions
    if (Array.isArray(user.permissions) && user.permissions.includes(permission)) {
      return true;
    }

    // 2. Check default system role permissions
    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[userRole] || [];
    if (defaultPerms.includes(permission)) {
      return true;
    }

    // 3. Check local matrix overrides
    const rolePermissionsStore = getStoredRolePermissions();
    const activePermissions = rolePermissionsStore[userRole];
    if (Array.isArray(activePermissions) && activePermissions.includes(permission)) {
      return true;
    }

    return false;
  },

  updateRolePermissions: (role: string, permissions: string[]) => {
    const currentStore = getStoredRolePermissions();
    const updatedStore = { ...currentStore, [role]: permissions };
    localStorage.setItem('fitscan_role_permissions', JSON.stringify(updatedStore));

    const currentUser = get().user;
    if (currentUser && (currentUser.roles?.includes(role) || (role === 'receptionist' && currentUser.role === 'Recepcionista'))) {
      const updatedUser = { ...currentUser, permissions };
      localStorage.setItem('fitscan_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post('/auth/login', {
        email,
        password: password || 'password',
      });

      const { token, user: apiUser } = response.data;
      const rawRole = apiUser.roles?.[0];
      const userRole = (typeof rawRole === 'object' ? rawRole?.name : rawRole) || (apiUser.email.includes('admin') ? 'admin' : 'receptionist');
      const displayRoleName = userRole === 'admin' ? 'Administrador General' : userRole === 'manager' ? 'Gerente' : 'Recepcionista';

      const persistentPermissions = getStoredRolePermissions()[userRole] || (Array.isArray(apiUser.permissions) ? apiUser.permissions.map((p: any) => typeof p === 'object' ? p.name : p) : []);

      const formattedUser: AuthUser = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: displayRoleName,
        branch: apiUser.branch?.name || 'Todas las Sucursales',
        avatarUrl: apiUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        phone: apiUser.phone,
        tenant_id: apiUser.tenant_id,
        branch_id: apiUser.branch_id,
        roles: [userRole],
        permissions: persistentPermissions,
      };

      localStorage.setItem('fitscan_token', token);
      localStorage.setItem('fitscan_user', JSON.stringify(formattedUser));

      set({
        isAuthenticated: true,
        user: formattedUser,
        token,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error de autenticación en la API de Laravel';
      set({ isLoading: false, error: errorMsg });
      return false;
    }
  },

  loginAsDemo: async (type) => {
    const targetEmail = type === 'admin' ? 'admin@fitscan.com' : 'recepcion@fitscan.com';
    return await get().login(targetEmail, 'demo2026');
  },

  logout: async () => {
    localStorage.removeItem('fitscan_token');
    localStorage.removeItem('fitscan_user');

    set({
      isAuthenticated: false,
      user: null,
      token: null,
      error: null,
    });

    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors
    }
  },

  checkAuth: async () => {
    if (checkAuthPromise) return checkAuthPromise;

    checkAuthPromise = (async () => {
      const token = localStorage.getItem('fitscan_token');
      if (!token) {
        set({ isAuthenticated: false, user: null, token: null });
        return;
      }

      try {
        const response = await api.get('/auth/me');
        const apiUser = response.data.user;

        const rawRole = apiUser.roles?.[0];
        const userRole = (typeof rawRole === 'object' ? rawRole?.name : rawRole) || (apiUser.email.includes('admin') ? 'admin' : 'receptionist');
        const displayRoleName = userRole === 'admin' ? 'Administrador General' : userRole === 'manager' ? 'Gerente' : 'Recepcionista';

        const activePermissions = getStoredRolePermissions()[userRole] || (Array.isArray(apiUser.permissions) ? apiUser.permissions.map((p: any) => typeof p === 'object' ? p.name : p) : []);

        const formattedUser: AuthUser = {
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          role: displayRoleName,
          branch: apiUser.branch?.name || 'Todas las Sucursales',
          avatarUrl: apiUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          phone: apiUser.phone,
          tenant_id: apiUser.tenant_id,
          branch_id: apiUser.branch_id,
          roles: [userRole],
          permissions: activePermissions,
        };

        set({
          isAuthenticated: true,
          user: formattedUser,
          token,
        });
      } catch {
        localStorage.removeItem('fitscan_token');
        localStorage.removeItem('fitscan_user');
        set({ isAuthenticated: false, user: null, token: null });
      } finally {
        checkAuthPromise = null;
      }
    })();

    return checkAuthPromise;
  },
}));
