<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import { useAuthStore } from '../stores/auth';
import SkeletonLoader from '../components/SkeletonLoader.vue';

const authStore = useAuthStore();
const isLoading = ref(true);

const usuarios = ref<any[]>([]);
const roles = ref<any[]>([]);
const permisosDisponibles = ref<any[]>([]);

const showUserModal = ref(false);
const editingUser = ref(false);
const showRolesModal = ref(false);
const selectedRole = ref<any>(null);
const formData = ref({ id: 0, nombre: '', correo: '', rol: '', password: '' });
const isSavingUser = ref(false);
const isSavingPermissions = ref(false);
const processingEstadoId = ref<number | null>(null);

const showCreateRoleModal = ref(false);
const newRoleName = ref('');
const isCreatingRole = ref(false);

// Toast Notification
const toast = ref({ show: false, message: '', type: 'success' });
const showToast = (message: string, type: string = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
};

const fetchUsuarios = async () => {
  try {
    const res = await api.get('/users');
    usuarios.value = res.data;
  } catch (error) {
    showToast('Error cargando usuarios', 'error');
  }
};

const fetchRoles = async () => {
  try {
    const res = await api.get('/roles');
    roles.value = res.data.roles;
    permisosDisponibles.value = res.data.permisosDisponibles;
    if (roles.value.length > 0) {
      formData.value.rol = roles.value[0].nombre;
    }
  } catch (error) {
    showToast('Error cargando roles', 'error');
  }
};

onMounted(async () => {
  isLoading.value = true;
  await Promise.all([fetchUsuarios(), fetchRoles()]);
  isLoading.value = false;
});

const openNewUserModal = () => {
  editingUser.value = false;
  formData.value = { id: 0, nombre: '', correo: '', rol: roles.value[0]?.nombre || '', password: '' };
  showUserModal.value = true;
};

const editUser = (user: any) => {
  editingUser.value = true;
  formData.value = { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol, password: '' };
  showUserModal.value = true;
};

const toggleEstado = async (user: any) => {
  const nuevoEstado = user.estado === 'Activo' ? 'Suspendido' : 'Activo';
  processingEstadoId.value = user.id;
  try {
    const res = await api.put(`/users/${user.id}`, { estado: nuevoEstado });
    const index = usuarios.value.findIndex(u => u.id === user.id);
    if (index !== -1) usuarios.value[index] = res.data;
    showToast(`Usuario ${user.nombre} ha sido ${nuevoEstado === 'Activo' ? 'reactivado' : 'suspendido'} exitosamente.`);
  } catch (error) {
    showToast('Error al cambiar el estado del usuario', 'error');
  } finally {
    processingEstadoId.value = null;
  }
};

const saveUser = async () => {
  if (!formData.value.nombre || !formData.value.correo) return;
  
  isSavingUser.value = true;
  try {
    if (editingUser.value) {
      const res = await api.put(`/users/${formData.value.id}`, formData.value);
      const index = usuarios.value.findIndex(u => u.id === formData.value.id);
      if (index !== -1) usuarios.value[index] = res.data;
      showToast(`Usuario modificado correctamente.`);
    } else {
      const res = await api.post('/users', formData.value);
      usuarios.value.push(res.data);
      showToast(`Nuevo usuario registrado correctamente.`);
    }
    showUserModal.value = false;
  } catch (error: any) {
    let errorMsg = error.response?.data?.message || 'Error al guardar usuario';
    if (error.response?.data?.errors) {
      const firstError = Object.values(error.response.data.errors)[0] as string[];
      errorMsg = firstError[0];
    }
    showToast(errorMsg, 'error');
  } finally {
    isSavingUser.value = false;
  }
};

const openRolesModal = () => {
  selectedRole.value = roles.value[0];
  showRolesModal.value = true;
};

const selectRole = (role: any) => {
  selectedRole.value = role;
};

const savePermissions = async () => {
  isSavingPermissions.value = true;
  try {
    const res = await api.put(`/roles/${selectedRole.value.id}/permissions`, { permisos: selectedRole.value.permisos });
    const index = roles.value.findIndex(r => r.id === res.data.id);
    if (index !== -1) roles.value[index] = res.data;
    showToast(`Permisos del rol ${res.data.nombre} actualizados.`);
    showRolesModal.value = false;
  } catch (error) {
    showToast('Error al actualizar permisos', 'error');
  } finally {
    isSavingPermissions.value = false;
  }
};

const createNewRole = async () => {
  const nombre = newRoleName.value;
  if (!nombre || nombre.trim() === '') return;
  
  isCreatingRole.value = true;
  try {
    const res = await api.post('/roles', { nombre: nombre.trim() });
    roles.value.push(res.data);
    selectRole(res.data);
    showToast(`Rol ${res.data.nombre} creado exitosamente.`);
    showCreateRoleModal.value = false;
    newRoleName.value = '';
  } catch (error: any) {
    let errorMsg = 'Error al crear el rol';
    if (error.response?.data?.errors?.nombre) {
      errorMsg = error.response.data.errors.nombre[0];
    } else if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    }
    showToast(errorMsg, 'error');
  } finally {
    isCreatingRole.value = false;
  }
};
</script>

<template>
  <div class="relative animate-fade-in max-w-6xl mx-auto space-y-6">
    
    <!-- Toast Notification -->
    <div v-if="toast.show" class="fixed top-20 right-8 px-5 py-3 rounded-sm shadow-xl flex items-center gap-3 z-50 animate-fade-in bg-slate-800 border-l-4 border-slate-500 text-white">
      <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-700 text-white">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <div>
        <p class="font-bold text-sm">Notificación del Sistema</p>
        <p class="text-xs text-slate-300">{{ toast.message }}</p>
      </div>
    </div>
    <!-- Barra de acciones -->
    <div class="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-sm shadow-sm">
      <div class="flex items-center gap-2 w-1/3">
        <div class="relative w-full">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input type="text" placeholder="Buscar usuario por nombre o correo..." class="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
        </div>
      </div>
      <div class="flex gap-3">
        <button @click="openRolesModal" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-sm transition-colors text-sm border border-slate-300 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
          Gestionar Roles y Permisos
        </button>
        <button @click="openNewUserModal" class="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-sm transition-colors text-sm flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Nuevo Usuario
        </button>
      </div>
    </div>

    <!-- Tabla de Usuarios -->
    <SkeletonLoader v-if="isLoading" :rows="4" />
    <div v-else class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm text-slate-600">
        <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-700">
          <tr>
            <th class="px-6 py-4">Usuario</th>
            <th class="px-6 py-4">Rol Asignado</th>
            <th class="px-6 py-4">Estado</th>
            <th class="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="user in usuarios" :key="user.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                  {{ user.nombre.substring(0, 2) }}
                </div>
                <div>
                  <p class="font-bold text-slate-800">{{ user.nombre }}</p>
                  <p class="text-xs text-slate-500">{{ user.correo }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                {{ user.rol }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span v-if="user.estado === 'Activo'" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Activo
              </span>
              <span v-else class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Suspendido
              </span>
            </td>
            <td class="px-6 py-4 text-right flex justify-end items-center gap-3">
              <button @click="editUser(user)" class="text-secondary hover:text-primary transition-colors text-xs font-bold uppercase">Editar</button>
              
              <button v-if="user.estado === 'Activo'" @click="toggleEstado(user)" :disabled="processingEstadoId === user.id || user.id === authStore.user?.id" :title="user.id === authStore.user?.id ? 'No puedes suspender tu propia cuenta' : ''" class="text-rose-600 hover:text-rose-800 transition-colors text-xs font-bold uppercase flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg v-if="processingEstadoId === user.id" class="animate-spin h-3 w-3 text-rose-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Suspender
              </button>
              
              <button v-else @click="toggleEstado(user)" :disabled="processingEstadoId === user.id" class="text-emerald-600 hover:text-emerald-800 transition-colors text-xs font-bold uppercase flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg v-if="processingEstadoId === user.id" class="animate-spin h-3 w-3 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Reactivar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Nuevo Usuario -->
    <div v-if="showUserModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div class="bg-secondary p-4 flex justify-between items-center text-white border-b-4 border-primary">
          <h3 class="font-bold">{{ editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario' }}</h3>
          <button @click="showUserModal = false" class="text-white/70 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        <div class="p-6 space-y-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-600 uppercase">Nombre Completo</label>
            <input v-model="formData.nombre" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" placeholder="Ej. Juan Pérez">
          </div>
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-600 uppercase">Correo Electrónico</label>
            <input v-model="formData.correo" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" placeholder="ejemplo@feyalegria.edu.bo">
          </div>
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-600 uppercase">
              Contraseña <span v-if="editingUser" class="text-slate-400 font-normal lowercase">(opcional, dejar en blanco para mantener)</span>
            </label>
            <input v-model="formData.password" type="password" class="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" placeholder="••••••••">
          </div>
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-600 uppercase">Rol / Cargo</label>
            <select v-model="formData.rol" :disabled="editingUser && formData.id === authStore.user?.id" class="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary disabled:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed">
              <option v-for="rol in roles" :key="rol.id" :value="rol.nombre">{{ rol.nombre }}</option>
            </select>
            <p v-if="editingUser && formData.id === authStore.user?.id" class="text-[10px] text-rose-500 font-bold mt-1">Por razones de seguridad, no puedes modificar tu propio rol.</p>
          </div>
          <div class="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button @click="showUserModal = false" class="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800">Cancelar</button>
            <button @click="saveUser" :disabled="isSavingUser" class="px-4 py-2 text-sm font-bold bg-primary text-white hover:bg-primary-dark rounded-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              <svg v-if="isSavingUser" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ editingUser ? 'Actualizar Cambios' : 'Guardar Usuario' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Roles y Permisos (HU3 y HU4) -->
    <div v-if="showRolesModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-sm shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[80vh] animate-fade-in-up">
        
        <div class="bg-slate-800 p-4 flex justify-between items-center text-white border-b-4 border-slate-600">
          <h3 class="font-bold flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            Gestor de Roles y Permisos Institucionales
          </h3>
          <button @click="showRolesModal = false" class="text-slate-400 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        
        <div class="flex flex-1 overflow-hidden">
          <!-- Sidebar Roles -->
          <div class="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
            <div class="p-4 border-b border-slate-200 bg-white">
              <button @click="showCreateRoleModal = true" class="w-full text-xs font-bold text-primary border border-primary hover:bg-primary hover:text-white py-2 rounded-sm transition-colors uppercase">
                + Crear Nuevo Rol
              </button>
            </div>
            <div class="flex-1 overflow-y-auto">
              <ul class="divide-y divide-slate-100">
                <li v-for="rol in roles" :key="rol.id">
                  <button 
                    @click="selectRole(rol)"
                    :class="[selectedRole?.id === rol.id ? 'bg-white border-l-4 border-primary text-primary shadow-sm' : 'hover:bg-slate-100 border-l-4 border-transparent text-slate-600', 'w-full text-left px-5 py-4 font-medium text-sm transition-all']"
                  >
                    {{ rol.nombre }}
                    <p class="text-[10px] font-normal text-slate-400 uppercase mt-0.5">{{ rol.permisos.length }} permisos asignados</p>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Matriz de Permisos -->
          <div class="flex-1 bg-white flex flex-col">
            <div class="p-6 border-b border-slate-100 bg-slate-50/50">
              <h4 class="text-lg font-bold text-slate-800">Permisos: {{ selectedRole?.nombre }}</h4>
              <p class="text-xs text-slate-500">Activa o desactiva las casillas para modificar los privilegios de este rol de forma inmediata.</p>
            </div>
            
            <div class="flex-1 p-6 overflow-y-auto">
              <div class="grid grid-cols-2 gap-4">
                <label 
                  v-for="permiso in permisosDisponibles" 
                  :key="permiso.id" 
                  class="flex items-start gap-3 p-4 border rounded-sm cursor-pointer transition-colors"
                  :class="selectedRole?.permisos.includes(permiso.id) ? 'bg-primary/5 border-primary/20' : 'bg-white border-slate-200 hover:border-slate-300'"
                >
                  <div class="relative flex items-center pt-0.5">
                    <input 
                      type="checkbox" 
                      :value="permiso.id"
                      v-model="selectedRole.permisos"
                      class="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                    >
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">{{ permiso.label }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">Permite al usuario acceder al módulo correspondiente.</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div class="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button @click="showRolesModal = false" class="px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-800">Descartar</button>
              <button @click="savePermissions" :disabled="isSavingPermissions" class="px-5 py-2 text-sm font-bold bg-primary text-white hover:bg-primary-dark rounded-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                <svg v-if="isSavingPermissions" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Guardar Permisos
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Modal Crear Nuevo Rol -->
    <div v-if="showCreateRoleModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-sm shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
        <div class="bg-primary p-4 flex justify-between items-center text-white border-b-4 border-primary-dark">
          <h3 class="font-bold">Crear Nuevo Rol</h3>
          <button @click="showCreateRoleModal = false" class="text-white/70 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        <div class="p-6 space-y-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-600 uppercase">Nombre del Rol</label>
            <input v-model="newRoleName" @keyup.enter="createNewRole" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" placeholder="Ej. Secretaria, Auxiliar">
          </div>
          <div class="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button @click="showCreateRoleModal = false" class="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800">Cancelar</button>
            <button @click="createNewRole" :disabled="isCreatingRole || !newRoleName.trim()" class="px-4 py-2 text-sm font-bold bg-primary text-white hover:bg-primary-dark rounded-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              <svg v-if="isCreatingRole" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Crear Rol
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
