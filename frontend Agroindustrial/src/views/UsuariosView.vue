<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
    
    <!-- Toast Notification -->
    <transition name="fade">
      <div v-if="toast.show" class="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg border text-sm font-semibold transition-all"
           :class="toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'">
        <span>{{ toast.message }}</span>
      </div>
    </transition>

    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <h1 class="text-3xl font-bold text-agro-900 tracking-tight">Gestión de Usuarios</h1>
        <p class="text-sm text-slate-500 mt-1">Módulo de Configuración y Seguridad</p>
      </div>
      <div>
        <button @click="openCreateModal" class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-agro-600 hover:bg-agro-500 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-agro-600/10 active:scale-98">
          <UserPlus class="w-4 h-4" />
          <span>Registrar Usuario</span>
        </button>
      </div>
    </div>

    <!-- Search & Filters Bar -->
    <div class="bg-white rounded-2xl border border-agro-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="relative w-full md:max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search class="w-4 h-4" />
        </span>
        <input type="text" v-model="searchQuery" placeholder="Buscar por nombre o correo..." class="pl-10 pr-4 py-2 w-full border border-slate-200 bg-slate-50/50 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all" />
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <!-- Rol Filter -->
        <div class="relative min-w-[140px] flex-1 md:flex-none">
          <select v-model="filterRole" class="appearance-none w-full pl-3 pr-8 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
            <option value="">Todos los Roles</option>
            <option v-for="r in availableRoles" :key="r.id" :value="r.name">
              {{ r.name }}
            </option>
          </select>
          <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown class="w-4 h-4" />
          </span>
        </div>

        <!-- Estado Filter -->
        <div class="relative min-w-[140px] flex-1 md:flex-none">
          <select v-model="filterStatus" class="appearance-none w-full pl-3 pr-8 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
            <option value="">Todos los Estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown class="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>

    <!-- Users Table Card -->
    <div class="bg-white rounded-2xl border border-agro-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-left">
          <thead class="bg-slate-50/75 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4">Usuario</th>
              <th class="px-6 py-4">Correo</th>
              <th class="px-6 py-4">Rol</th>
              <th class="px-6 py-4">Estado</th>
              <th class="px-6 py-4">F. Registro</th>
              <th class="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-50/50 transition-colors">
              
              <!-- User Info Column -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                       :class="user.active ? 'bg-agro-100 text-agro-700' : 'bg-slate-100 text-slate-500'">
                    {{ getInitials(user.name) }}
                  </div>
                  <div>
                    <p class="font-semibold text-slate-800" :class="{'line-through text-slate-400': !user.active}">{{ user.name }}</p>
                    <p class="text-[10px] text-slate-400">ID: USR-00{{ user.id }}</p>
                  </div>
                </div>
              </td>
              
              <!-- Email Column -->
              <td class="px-6 py-4 whitespace-nowrap text-slate-600">
                {{ user.email }}
              </td>
              
              <!-- Role Column -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold border"
                      :class="getRoleStyles(user.role)">
                  {{ user.role }}
                </span>
              </td>
              
              <!-- Status Column -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                      :class="user.active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'">
                  <span class="w-1.5 h-1.5 rounded-full" :class="user.active ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                  {{ user.active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              
              <!-- Registered Date Column -->
              <td class="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                {{ user.createdAt }}
              </td>
              
              <!-- Actions Column -->
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex items-center justify-center gap-2">
                  <button @click="openEditModal(user)" class="p-2 text-slate-500 hover:text-agro-600 hover:bg-agro-50 rounded-xl transition-all cursor-pointer" title="Editar Usuario">
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button @click="toggleUserStatus(user)" class="p-2 rounded-xl transition-all cursor-pointer"
                          :class="user.active ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'"
                          :title="user.active ? 'Dar de Baja (Inhabilitar)' : 'Dar de Alta (Habilitar)'">
                    <Power class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            
            <!-- Empty State -->
            <tr v-if="filteredUsers.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                <div class="flex flex-col items-center gap-2">
                  <Search class="w-8 h-8 text-slate-300" />
                  <p class="font-medium text-slate-500">No se encontraron usuarios</p>
                  <p class="text-xs">Prueba ajustando los filtros o el término de búsqueda.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form (Create / Edit) -->
    <transition name="modal">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" @click="closeModal"></div>
        
        <!-- Modal Card -->
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 class="font-bold text-slate-800 text-lg">
              {{ isEditing ? 'Editar Usuario' : 'Registrar Usuario' }}
            </h3>
            <button @click="closeModal" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <form @submit.prevent="saveUser" class="p-6 space-y-4">
            
            <!-- Nombre input -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nombre Completo</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User class="w-4 h-4" />
                </span>
                <input type="text" required v-model="form.name" class="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all" placeholder="Ej. Juan Pérez" />
              </div>
            </div>

            <!-- Correo input -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail class="w-4 h-4" />
                </span>
                <input type="email" required v-model="form.email" class="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all" placeholder="correo@agroflota.com" />
              </div>
            </div>

            <!-- Rol input -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Rol Operativo</label>
              <div class="relative">
                <select required v-model="form.role" class="appearance-none w-full pl-4 pr-10 py-2.5 border border-slate-200 bg-white rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
                  <option value="" disabled>Seleccione un Rol</option>
                  <option v-for="r in availableRoles" :key="r.id" :value="r.name">
                    {{ r.name }}
                  </option>
                </select>
                <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown class="w-4 h-4" />
                </span>
              </div>
            </div>

            <!-- Contraseña input -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Contraseña {{ isEditing ? '(Opcional)' : '' }}
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock class="w-4 h-4" />
                </span>
                <input type="password" :required="!isEditing" v-model="form.password" class="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all" :placeholder="isEditing ? 'Dejar en blanco si no se cambia' : '••••••••'" />
              </div>
            </div>

            <!-- Estado switch (only editing or optional) -->
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p class="text-sm font-semibold text-slate-700">Estado de Cuenta</p>
                <p class="text-[10px] text-slate-400">El usuario puede o no iniciar sesión</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.active" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-agro-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-agro-500"></div>
              </label>
            </div>

            <!-- Inline Error Message -->
            <div v-if="modalError" class="bg-rose-50 text-rose-600 p-3 rounded-xl border border-rose-100 text-xs font-semibold flex items-center gap-2 mb-2">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{{ modalError }}</span>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button type="button" @click="closeModal" class="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-center">
                Cancelar
              </button>
              <button type="submit" class="flex-1 py-2.5 text-sm font-semibold text-white bg-agro-600 hover:bg-agro-500 rounded-xl transition-all cursor-pointer text-center shadow-md shadow-agro-600/10">
                Guardar
              </button>
            </div>

          </form>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { 
  Search, 
  UserPlus, 
  Edit3, 
  Power, 
  ChevronDown, 
  X, 
  User, 
  Mail, 
  Lock 
} from '@lucide/vue'
import api from '../services/api'

// Usuarios reactivos obtenidos desde el backend
const users = ref([])

// Variables reactivas de búsqueda y filtros
const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')

// Variables del Modal
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingUserId = ref(null)
const modalError = ref('')

// Formulario reactivo
const form = reactive({
  name: '',
  email: '',
  role: 'Encargado',
  password: '',
  active: true
})

// Sistema de Toast/Notificaciones
const toast = reactive({
  show: false,
  message: '',
  type: 'success'
})

const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

// Lista de Roles disponibles en el sistema
const availableRoles = ref([])

// Cargar usuarios y roles al montar el componente
const loadData = async () => {
  try {
    users.value = await api.get('/users')
    availableRoles.value = await api.get('/roles')
  } catch (error) {
    showToast(error.message || 'Error al cargar los datos', 'error')
  }
}

onMounted(loadData)

// Iniciales para Avatar
const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Estilos de rol
const getRoleStyles = (role) => {
  if (!role) return 'bg-slate-50 text-slate-700 border-slate-100'
  if (role === 'Administrador') return 'bg-agro-50 text-agro-700 border-agro-100'
  if (role.includes('Encargado') || role.includes('Mantenimiento')) return 'bg-amber-50 text-amber-700 border-amber-100'
  return 'bg-blue-50 text-blue-700 border-blue-100' // Gerente General u otros
}

// Filtrado de usuarios en frontend para búsqueda y filtros rápidos
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const nameMatch = user.name ? user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) : false
    const emailMatch = user.email ? user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) : false
    const matchesSearch = searchQuery.value === '' || nameMatch || emailMatch
    const matchesRole = filterRole.value === '' || user.role === filterRole.value
    const matchesStatus = filterStatus.value === '' || 
                          (filterStatus.value === 'active' && user.active) || 
                          (filterStatus.value === 'inactive' && !user.active)
    return matchesSearch && matchesRole && matchesStatus
  })
})

// Abrir Modales
const openCreateModal = () => {
  isEditing.value = false
  editingUserId.value = null
  form.name = ''
  form.email = ''
  form.role = 'Encargado'
  form.password = ''
  form.active = true
  modalError.value = ''
  isModalOpen.value = true
}

const openEditModal = (user) => {
  isEditing.value = true
  editingUserId.value = user.id
  form.name = user.name
  form.email = user.email
  form.role = user.role
  form.password = '' // No mostramos la contraseña por seguridad
  form.active = user.active
  modalError.value = ''
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  modalError.value = ''
}

// Guardar Usuario (Creación o Edición vía API)
const saveUser = async () => {
  modalError.value = ''
  try {
    if (isEditing.value) {
      // Editar usuario existente
      const updatedUser = await api.put(`/users/${editingUserId.value}`, {
        name: form.name,
        email: form.email,
        role: form.role,
        password: form.password || undefined,
        active: form.active
      })
      const userIndex = users.value.findIndex(u => u.id === editingUserId.value)
      if (userIndex !== -1) {
        users.value[userIndex] = updatedUser
      }
      showToast('Usuario actualizado correctamente', 'success')
    } else {
      // Crear nuevo usuario
      const newUser = await api.post('/users', {
        name: form.name,
        email: form.email,
        role: form.role,
        password: form.password,
        active: form.active
      })
      users.value.unshift(newUser)
      showToast('Usuario registrado con éxito', 'success')
    }
    closeModal()
  } catch (error) {
    if (error.errors) {
      const firstErrorKey = Object.keys(error.errors)[0]
      const firstErrorMessage = error.errors[firstErrorKey][0]
      modalError.value = firstErrorMessage
    } else {
      modalError.value = error.message || 'Error al guardar el usuario'
    }
  }
}

// Baja Lógica (Activar / Inactivar vía API)
const toggleUserStatus = async (user) => {
  try {
    const response = await api.patch(`/users/${user.id}/toggle`)
    user.active = response.active
    const actionText = user.active ? 'habilitado' : 'inhabilitado (baja lógica)'
    showToast(`Usuario ${user.name} ${actionText} con éxito`, 'success')
  } catch (error) {
    showToast(error.message || 'Error al cambiar estado del usuario', 'error')
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
