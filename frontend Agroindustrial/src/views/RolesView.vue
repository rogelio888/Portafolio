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
        <h1 class="text-3xl font-bold text-agro-900 tracking-tight">Roles y Permisos</h1>
        <p class="text-sm text-slate-500 mt-1">Definición de perfiles y accesos granulares de seguridad</p>
      </div>
      <div>
        <button @click="openCreateRoleModal" class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-agro-600 hover:bg-agro-500 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-agro-600/10 active:scale-98">
          <ShieldAlert class="w-4 h-4" />
          <span>Crear Nuevo Rol</span>
        </button>
      </div>
    </div>

    <!-- Main Content Split Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Left Column: Roles List (4 cols) -->
      <div class="lg:col-span-4 space-y-4">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Perfiles del Sistema</h2>
        
        <div class="space-y-3">
          <div v-for="role in roles" :key="role.id" @click="selectRole(role)"
               class="p-5 bg-white rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden group hover:shadow-md"
               :class="selectedRole.id === role.id ? 'border-agro-500 ring-2 ring-agro-500/10 shadow-sm' : 'border-agro-100 hover:border-agro-200'">
            
            <!-- Selection indicator strip -->
            <div v-if="selectedRole.id === role.id" class="absolute top-0 bottom-0 left-0 w-1.5 bg-agro-500"></div>
            
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="font-bold text-slate-800 text-base group-hover:text-agro-600 transition-colors">{{ role.name }}</h3>
                <p class="text-xs text-slate-400 mt-0.5">Asociados: {{ role.usersCount }} usuarios</p>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button 
                  v-if="!['Administrador', 'Encargado de Mantenimiento', 'Gerente General'].includes(role.name)" 
                  @click.stop="confirmDeleteRole(role)" 
                  class="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Eliminar Perfil"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
                <Shield class="w-5 h-5 text-slate-300 group-hover:text-agro-500 transition-colors"
                        :class="{'text-agro-500': selectedRole.id === role.id}" />
              </div>
            </div>
            
            <p class="text-xs text-slate-500 mt-3 leading-relaxed">
              {{ role.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Right Column: Permissions Matrix (8 cols) -->
      <div class="lg:col-span-8 bg-white border border-agro-100 rounded-3xl shadow-sm overflow-hidden">
        
        <!-- Header Matrix -->
        <div class="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span class="text-[10px] font-bold text-agro-600 uppercase tracking-widest bg-agro-100 px-2.5 py-1 rounded-full">Permisos Asignados</span>
            <h2 class="text-xl font-bold text-slate-800 mt-2">Configuración para: {{ selectedRole.name }}</h2>
          </div>
          <div>
            <button @click="savePermissions" :disabled="selectedRole.name === 'Administrador'" class="px-4 py-2 text-sm font-semibold bg-agro-600 hover:bg-agro-500 text-white rounded-xl transition-all cursor-pointer shadow-sm active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed">
              Guardar Cambios
            </button>
          </div>
        </div>

        <!-- Matrix Sections -->
        <div class="p-6 space-y-8 divide-y divide-slate-100">
          
          <!-- Loop through categorized permissions -->
          <div v-for="category in permissionCategories" :key="category.key" class="pt-6 first:pt-0">
            <h3 class="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2 mb-4">
              <span class="w-1.5 h-4 bg-agro-500 rounded-full"></span>
              <span>{{ category.title }}</span>
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="perm in category.permissions" :key="perm.key"
                   class="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                <div class="text-left">
                  <p class="text-xs font-semibold text-slate-700">{{ perm.label }}</p>
                  <p class="text-[10px] text-slate-400 mt-0.5">{{ perm.description }}</p>
                </div>
                
                <label class="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" v-model="selectedRole.permissions[perm.key]" class="sr-only peer" :disabled="selectedRole.name === 'Administrador'" />
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-agro-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-agro-500"></div>
                </label>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>

    <!-- Create Role Modal -->
    <transition name="modal">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" @click="closeModal"></div>
        
        <!-- Modal Card -->
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 class="font-bold text-slate-800 text-lg">Crear Nuevo Perfil</h3>
            <button @click="closeModal" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <form @submit.prevent="createRole" class="p-6 space-y-4">
            <!-- Name Input -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nombre del Perfil / Rol</label>
              <input type="text" required v-model="newRole.name" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all" placeholder="Ej. Supervisor de Campo" />
            </div>

            <!-- Description Input -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Descripción de Funciones</label>
              <textarea rows="3" required v-model="newRole.description" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all resize-none" placeholder="Describa el alcance de este perfil..."></textarea>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button type="button" @click="closeModal" class="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-center">
                Cancelar
              </button>
              <button type="submit" class="flex-1 py-2.5 text-sm font-semibold text-white bg-agro-600 hover:bg-agro-500 rounded-xl transition-all cursor-pointer text-center shadow-md shadow-agro-600/10">
                Crear Rol
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Custom Confirmation Modal -->
    <ConfirmModal 
      :show="deleteModal.show"
      title="Eliminar Perfil"
      :message="deleteModal.message"
      @confirm="executeDeleteRole"
      @cancel="deleteModal.show = false"
    />

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Shield, ShieldAlert, X, ChevronDown, Trash2 } from '@lucide/vue'
import api from '../services/api'
import ConfirmModal from '../components/ConfirmModal.vue'

// Categorías de permisos estructuradas según delimitación sustantiva de la tesis
const permissionCategories = [
  {
    key: 'config',
    title: 'Módulo de Configuración',
    permissions: [
      { key: 'acceso', label: 'Gestionar Acceso', description: 'Permite autenticación e inicio de sesión seguro.' },
      { key: 'usuarios', label: 'Gestionar Usuarios', description: 'Registro, edición e inhabilitación lógica de cuentas.' },
      { key: 'roles', label: 'Gestionar Roles y Permisos', description: 'Creación de perfiles y asignación de accesos granulares.' },
      { key: 'bitacora', label: 'Gestionar Bitácora', description: 'Consulta inmutable del registro de auditoría del sistema.' }
    ]
  },
  {
    key: 'flota',
    title: 'Módulo de Flota Agrícola',
    permissions: [
      { key: 'clasificaciones', label: 'Clasificación de Equipos', description: 'Agrupamiento de maquinaria por categorías.' },
      { key: 'fichas', label: 'Fichas Técnicas', description: 'Carga de manuales e intervalos de horómetros recomendados.' },
      { key: 'maquinaria', label: 'Inventario de Maquinaria', description: 'Registro individual y lectura de horómetro actual.' },
      { key: 'mecanicos', label: 'Mecánico Externo', description: 'Directorio centralizado de talleres y mecánicos tercerizados.' }
    ]
  },
  {
    key: 'mantenimiento',
    title: 'Módulo de Control de Mantenimiento',
    permissions: [
      { key: 'preventivos', label: 'Mantenimiento Preventivo', description: 'Cálculo de alertas predictivas según horómetros.' },
      { key: 'ordenes', label: 'Órdenes de Trabajo', description: 'Emisión, costos y cierre de actividades mecánicas.' },
      { key: 'historial', label: 'Historial de Intervenciones', description: 'Hoja de vida clínica y secuencial de cada activo.' }
    ]
  },
  {
    key: 'reportes',
    title: 'Módulo de Indicadores y Reportes',
    permissions: [
      { key: 'reporte_gasto', label: 'Reporte de Gasto por Equipo', description: 'Resumen gráfico de costos de mantenimiento.' },
      { key: 'reporte_vencido', label: 'Reporte de Mantenimiento Vencido', description: 'Lista consolidada de maquinaria crítica en mora.' }
    ]
  }
]

// Lista de Roles reactivos obtenidos desde el backend
const roles = ref([])

// Selección activa
const selectedRole = ref({
  id: null,
  name: 'Seleccione un perfil',
  description: 'Seleccione un rol de la lista para gestionar sus permisos.',
  permissions: {}
})

// Variables del Modal
const isModalOpen = ref(false)
const newRole = reactive({
  name: '',
  description: ''
})

// Sistema de Toasts
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

// Cargar roles al montar el componente
const loadRoles = async () => {
  try {
    roles.value = await api.get('/roles')
    if (roles.value.length > 0) {
      selectedRole.value = JSON.parse(JSON.stringify(roles.value[0]))
    }
  } catch (error) {
    showToast(error.message || 'Error al cargar los roles', 'error')
  }
}

onMounted(loadRoles)

const selectRole = (role) => {
  // Clonación profunda para evitar modificaciones directas en la referencia
  selectedRole.value = JSON.parse(JSON.stringify(role))
}

const openCreateRoleModal = () => {
  newRole.name = ''
  newRole.description = ''
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// Crear un nuevo rol vía API
const createRole = async () => {
  try {
    const roleObj = await api.post('/roles', {
      name: newRole.name,
      description: newRole.description
    })
    roles.value.push(roleObj)
    selectedRole.value = JSON.parse(JSON.stringify(roleObj))
    showToast(`Perfil "${newRole.name}" creado. Modifique sus permisos en el panel derecho.`, 'success')
    closeModal()
  } catch (error) {
    showToast(error.message || 'Error al crear el rol', 'error')
  }
}

// Guardar cambios en permisos vía API
const savePermissions = async () => {
  if (!selectedRole.value.id) return
  
  try {
    const updatedRole = await api.put(`/roles/${selectedRole.value.id}`, {
      name: selectedRole.value.name,
      description: selectedRole.value.description,
      permissions: selectedRole.value.permissions
    })
    
    const index = roles.value.findIndex(r => r.id === selectedRole.value.id)
    if (index !== -1) {
      roles.value[index] = updatedRole
      selectedRole.value = JSON.parse(JSON.stringify(updatedRole))
    }
    showToast(`Permisos del perfil "${selectedRole.value.name}" actualizados correctamente`, 'success')
  } catch (error) {
    showToast(error.message || 'Error al guardar los permisos', 'error')
  }
}

// Control del Modal de Confirmación personalizado
const deleteModal = reactive({
  show: false,
  role: null,
  message: ''
})

const confirmDeleteRole = (role) => {
  deleteModal.role = role
  deleteModal.message = `¿Está seguro que desea eliminar el perfil "${role.name}"?`
  deleteModal.show = true
}

const executeDeleteRole = async () => {
  if (!deleteModal.role) return
  const role = deleteModal.role
  deleteModal.show = false
  
  try {
    await api.delete(`/roles/${role.id}`)
    showToast(`Perfil "${role.name}" eliminado correctamente`, 'success')
    
    roles.value = roles.value.filter(r => r.id !== role.id)
    if (roles.value.length > 0) {
      selectedRole.value = JSON.parse(JSON.stringify(roles.value[0]))
    } else {
      selectedRole.value = { 
        id: null, 
        name: 'Seleccione un perfil', 
        description: 'Seleccione un rol de la lista para gestionar sus permisos.', 
        permissions: {} 
      }
    }
  } catch (error) {
    showToast(error.message || 'Error al eliminar el rol', 'error')
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
