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
        <h1 class="text-3xl font-bold text-agro-900 tracking-tight">Inventario de Maquinaria</h1>
        <p class="text-sm text-slate-500 mt-1">Control físico, número de chasis y estado operativo de la flota</p>
      </div>
      <div>
        <button @click="openCreateModal" class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-agro-600 hover:bg-agro-500 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-agro-600/10 active:scale-98">
          <Tractor class="w-4 h-4" />
          <span>Registrar Maquinaria</span>
        </button>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white rounded-2xl border border-agro-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="relative w-full md:max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search class="w-4 h-4" />
        </span>
        <input type="text" v-model="searchQuery" placeholder="Buscar por código, marca, modelo o chasis..." class="pl-10 pr-4 py-2 w-full border border-slate-200 bg-slate-50/50 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all" />
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <!-- Category Filter -->
        <div class="relative min-w-[150px] flex-1 md:flex-none">
          <select v-model="filterCategory" class="appearance-none w-full pl-3 pr-8 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
            <option value="">Todas las Categorías</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
          </select>
          <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown class="w-4 h-4" />
          </span>
        </div>

        <!-- Status Filter -->
        <div class="relative min-w-[155px] flex-1 md:flex-none">
          <select v-model="filterStatus" class="appearance-none w-full pl-3 pr-8 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
            <option value="">Todos los Estados</option>
            <option value="Operativo">Operativo</option>
            <option value="En Mantenimiento">En Mantenimiento</option>
          </select>
          <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown class="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>

    <!-- Inventory Table -->
    <div class="bg-white rounded-2xl border border-agro-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-left">
          <thead class="bg-slate-50/75 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4">Código Activo</th>
              <th class="px-6 py-4">Maquinaria</th>
              <th class="px-6 py-4">Categoría</th>
              <th class="px-6 py-4">Nro. Chasis (VIN)</th>
              <th class="px-6 py-4 text-center">Horómetro Actual</th>
              <th class="px-6 py-4">Estado Operativo</th>
              <th class="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
            <tr v-for="machine in filteredMachines" :key="machine.id" class="hover:bg-slate-50/50 transition-colors">
              
              <!-- Unique Code -->
              <td class="px-6 py-4 whitespace-nowrap font-mono font-bold text-slate-800">
                {{ machine.code }}
              </td>
              
              <!-- Brand & Model -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-agro-50 text-agro-700 flex items-center justify-center">
                    <Tractor class="w-4 h-4" />
                  </div>
                  <span class="font-bold text-slate-800">{{ machine.brand }} {{ machine.model }}</span>
                </div>
              </td>
              
              <!-- Category -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-slate-50 text-slate-600 border-slate-200">
                  {{ machine.category }}
                </span>
              </td>
              
              <!-- VIN / Chassis -->
              <td class="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-500">
                {{ machine.vin }}
              </td>
              
              <!-- Horometer Hours -->
              <td class="px-6 py-4 whitespace-nowrap text-center font-bold text-slate-800">
                {{ machine.hours }} hrs
              </td>
              
              <!-- Status Pill -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                      :class="machine.status === 'Operativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'">
                  <span class="w-1.5 h-1.5 rounded-full" :class="machine.status === 'Operativo' ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                  {{ machine.status }}
                </span>
              </td>
              
              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex items-center justify-center gap-2">
                  <button @click="openEditModal(machine)" class="p-2 text-slate-500 hover:text-agro-600 hover:bg-agro-50 rounded-xl transition-all cursor-pointer" title="Editar Equipo">
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button @click="deleteMachine(machine)" class="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer" title="Eliminar Equipo">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredMachines.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                <div class="flex flex-col items-center gap-2">
                  <Search class="w-8 h-8 text-slate-300" />
                  <p class="font-medium text-slate-500">No se encontraron maquinarias en el inventario</p>
                  <p class="text-xs">Prueba ajustando los filtros de búsqueda o categoría.</p>
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
              {{ isEditing ? 'Editar Maquinaria' : 'Registrar Maquinaria' }}
            </h3>
            <button @click="closeModal" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <form @submit.prevent="saveMachine" class="p-6 space-y-4 text-left">
            
            <!-- Category Dropdown selector -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Categoría / Familia</label>
              <div class="relative">
                <select required v-model="form.category" :disabled="isEditing" class="appearance-none w-full pl-4 pr-10 py-2.5 border border-slate-200 bg-white rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400">
                  <option v-for="cat in categories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
                </select>
                <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown class="w-4 h-4" />
                </span>
              </div>
            </div>

            <!-- Brand and Model Inputs -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Marca</label>
                <input type="text" required v-model="form.brand" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" placeholder="Ej. John Deere" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Modelo</label>
                <input type="text" required v-model="form.model" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" placeholder="Ej. 6125J" />
              </div>
            </div>

            <!-- Chassis Number VIN -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Número de Chasis (VIN - 17 caracteres)</label>
              <input type="text" required v-model="form.vin" maxlength="17" @input="formatVin" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl font-mono text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" placeholder="Ej. 9GHDD1100XXXXXX" />
            </div>

            <!-- Horometer inputs -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Horómetro Inicial</label>
                <input type="number" required v-model="form.initialHours" min="0" :disabled="isEditing" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all disabled:bg-slate-100 disabled:text-slate-400" placeholder="Ej. 0" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Horómetro Actual</label>
                <input type="number" required v-model="form.hours" min="0" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" placeholder="Ej. 265" />
              </div>
            </div>

            <!-- Operational Status Dropdown -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Estado de Operatividad</label>
              <div class="relative">
                <select required v-model="form.status" class="appearance-none w-full pl-4 pr-10 py-2.5 border border-slate-200 bg-white rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
                  <option value="Operativo">Operativo</option>
                  <option value="En Mantenimiento">En Mantenimiento</option>
                </select>
                <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown class="w-4 h-4" />
                </span>
              </div>
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

    <!-- Custom Confirmation Modal -->
    <ConfirmModal 
      :show="deleteModal.show"
      title="Eliminar Maquinaria"
      :message="deleteModal.message"
      @confirm="executeDeleteMachine"
      @cancel="deleteModal.show = false"
    />

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Tractor, Edit3, Trash2, X, ChevronDown } from '@lucide/vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { getMaquinarias, getClasificaciones, createMaquinaria, updateMaquinaria, deleteMaquinaria as deleteMaquinariaApi } from '../data/db'

const machines = ref([])
const categories = ref([])

const reload = () => {
  machines.value = getMaquinarias()
  categories.value = getClasificaciones()
}

onMounted(reload)

const searchQuery = ref('')
const filterCategory = ref('')
const filterStatus = ref('')

// Control de modales
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingMachineId = ref(null)

// Control del Modal de Confirmación personalizado
const deleteModal = reactive({
  show: false,
  machine: null,
  message: ''
})

const form = reactive({
  brand: '',
  model: '',
  category: 'Tractores',
  vin: '',
  initialHours: '',
  hours: '',
  status: 'Operativo'
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

// Formatear Nro de Chasis a Mayúsculas y Letras/Números
const formatVin = () => {
  form.vin = form.vin.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

// Filtrado del inventario
const filteredMachines = computed(() => {
  return machines.value.filter(m => {
    const matchesSearch = m.code.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          m.brand.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          m.model.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          m.vin.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = filterCategory.value === '' || m.category === filterCategory.value
    const matchesStatus = filterStatus.value === '' || m.status === filterStatus.value
    return matchesSearch && matchesCategory && matchesStatus
  })
})

const openCreateModal = () => {
  isEditing.value = false
  editingMachineId.value = null
  form.brand = ''
  form.model = ''
  form.category = 'Tractores'
  form.vin = ''
  form.initialHours = 0
  form.hours = 0
  form.status = 'Operativo'
  isModalOpen.value = true
}

const openEditModal = (machine) => {
  isEditing.value = true
  editingMachineId.value = machine.id
  form.brand = machine.brand
  form.model = machine.model
  form.category = machine.category
  form.vin = machine.vin
  form.initialHours = machine.initialHours
  form.hours = machine.hours
  form.status = machine.status
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// Guardar registro de maquinaria (CRUD)
const saveMachine = () => {
  // Validaciones
  if (!form.brand || !form.model || !form.vin || form.initialHours === '' || form.hours === '') {
    showToast('Por favor, complete todos los campos obligatorios', 'error')
    return
  }

  if (form.vin.length !== 17) {
    showToast('El Número de Chasis (VIN) debe tener exactamente 17 caracteres', 'error')
    return
  }

  if (parseFloat(form.hours) < parseFloat(form.initialHours)) {
    showToast('El horómetro actual no puede ser menor que el inicial', 'error')
    return
  }

  if (isEditing.value) {
    updateMaquinaria(editingMachineId.value, {
      brand: form.brand,
      model: form.model,
      vin: form.vin,
      status: form.status,
      hours: parseFloat(form.hours)
    })
    reload()
    showToast('Maquinaria actualizada con éxito', 'success')
  } else {
    const created = createMaquinaria({
      brand: form.brand,
      model: form.model,
      category: form.category,
      vin: form.vin,
      initialHours: parseFloat(form.initialHours),
      status: form.status
    })
    reload()
    showToast(`Maquinaria registrada correctamente con código ${created.code}`, 'success')
  }
  closeModal()
}

const deleteMachine = (machine) => {
  deleteModal.machine = machine
  deleteModal.message = `¿Está seguro de dar de baja y eliminar permanentemente el activo ${machine.code} (${machine.brand} ${machine.model}) del inventario?`
  deleteModal.show = true
}

const executeDeleteMachine = () => {
  if (!deleteModal.machine) return
  const machine = deleteModal.machine
  deleteModal.show = false
  deleteMaquinariaApi(machine.id)
  reload()
  showToast(`Activo ${machine.code} eliminado correctamente`, 'success')
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
