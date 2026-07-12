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
        <h1 class="text-3xl font-bold text-agro-900 tracking-tight">Órdenes de Trabajo (OT)</h1>
        <p class="text-sm text-slate-500 mt-1">Gestión técnica y financiera de intervenciones de mantenimiento de la flota</p>
      </div>
      <div>
        <button @click="openCreateModal" class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-agro-600 hover:bg-agro-500 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-agro-600/10 active:scale-98">
          <FileSignature class="w-4 h-4" />
          <span>Nueva Orden de Trabajo</span>
        </button>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white rounded-2xl border border-agro-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="relative w-full md:max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search class="w-4 h-4" />
        </span>
        <input type="text" v-model="searchQuery" placeholder="Buscar por OT, maquinaria, mecánico o tarea..." class="pl-10 pr-4 py-2 w-full border border-slate-200 bg-slate-50/50 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all" />
      </div>

      <div class="relative min-w-[170px] w-full md:w-auto">
        <select v-model="filterStatus" class="appearance-none w-full pl-3 pr-8 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
          <option value="">Todos los Estados</option>
          <option value="Abierta">Órdenes Abiertas</option>
          <option value="Cerrada">Órdenes Cerradas</option>
        </select>
        <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown class="w-4 h-4" />
        </span>
      </div>
    </div>

    <!-- Work Orders Table -->
    <div class="bg-white rounded-2xl border border-agro-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-left">
          <thead class="bg-slate-50/75 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4">Código OT</th>
              <th class="px-6 py-4">Maquinaria</th>
              <th class="px-6 py-4">Mecánico Externo</th>
              <th class="px-6 py-4">Detalle Intervención</th>
              <th class="px-6 py-4 text-right">Mano Obra</th>
              <th class="px-6 py-4 text-right">Repuestos</th>
              <th class="px-6 py-4 text-right bg-slate-50/50 font-bold">Costo Total</th>
              <th class="px-6 py-4">Estado</th>
              <th class="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
            <tr v-for="ot in filteredOts" :key="ot.id" class="hover:bg-slate-50/50 transition-colors">
              
              <!-- OT Code -->
              <td class="px-6 py-4 whitespace-nowrap font-mono font-bold text-slate-850">
                {{ ot.code }}
              </td>
              
              <!-- Machinery -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="font-bold text-slate-800">{{ ot.brand }} {{ ot.model }}</span>
                  <span class="text-[10px] font-mono text-slate-400">COD: {{ ot.machineCode }}</span>
                </div>
              </td>
              
              <!-- Mechanic -->
              <td class="px-6 py-4 whitespace-nowrap text-slate-600">
                {{ ot.mechanicName }}
              </td>
              
              <!-- Detail / Symptoms -->
              <td class="px-6 py-4 text-slate-500 max-w-xs truncate" :title="ot.taskDescription">
                {{ ot.taskDescription }}
              </td>
              
              <!-- Labor Cost -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-slate-600">
                Bs {{ ot.laborCost }}
              </td>
              
              <!-- Parts Cost -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-slate-600">
                Bs {{ ot.partsCost }}
              </td>
              
              <!-- Total Cost -->
              <td class="px-6 py-4 whitespace-nowrap text-right font-extrabold text-slate-800 bg-slate-50/30">
                Bs {{ ot.totalCost }}
              </td>
              
              <!-- Status Pill -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                      :class="ot.status === 'Abierta' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'">
                  <span class="w-1.5 h-1.5 rounded-full" :class="ot.status === 'Abierta' ? 'bg-blue-500' : 'bg-emerald-500'"></span>
                  {{ ot.status }}
                </span>
              </td>
              
              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <!-- Close Order Action -->
                  <button v-if="ot.status === 'Abierta'" @click="openCloseOtModal(ot)" class="flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer" title="Cerrar Orden de Trabajo">
                    <Check class="w-3.5 h-3.5" />
                    <span>Cerrar OT</span>
                  </button>
                  <button v-if="ot.status === 'Abierta'" @click="openEditModal(ot)" class="p-2 text-slate-400 hover:text-agro-600 hover:bg-agro-50 rounded-xl transition-all cursor-pointer" title="Editar Orden">
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button @click="deleteOt(ot)" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer" title="Eliminar Registro">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredOts.length === 0">
              <td colspan="9" class="px-6 py-12 text-center text-slate-400">
                <div class="flex flex-col items-center gap-2">
                  <Search class="w-8 h-8 text-slate-300" />
                  <p class="font-medium text-slate-500">No se encontraron órdenes de trabajo</p>
                  <p class="text-xs">Prueba ajustando los filtros o realizando otra búsqueda.</p>
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
              {{ isEditing ? 'Editar Orden de Trabajo' : 'Crear Orden de Trabajo' }}
            </h3>
            <button @click="closeModal" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <form @submit.prevent="saveOt" class="p-6 space-y-4 text-left">
            
            <!-- Target Machine -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Maquinaria Asociada</label>
              <div class="relative">
                <select required v-model="form.machineCode" @change="onMachineChange" class="appearance-none w-full pl-4 pr-10 py-2.5 border border-slate-200 bg-white rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
                  <option value="" disabled>Seleccione una máquina</option>
                  <option v-for="m in mockMachines" :key="m.code" :value="m.code">
                    {{ m.code }} - {{ m.brand }} {{ m.model }} ({{ m.hours }} hrs)
                  </option>
                </select>
                <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown class="w-4 h-4" />
                </span>
              </div>
            </div>

            <!-- Assigned Mechanic -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mecánico o Taller Externo</label>
              <div class="relative">
                <select required v-model="form.mechanicId" class="appearance-none w-full pl-4 pr-10 py-2.5 border border-slate-200 bg-white rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
                  <option value="" disabled>Seleccione un responsable</option>
                  <option v-for="mech in mockMechanics" :key="mech.id" :value="mech.id">
                    {{ mech.name }} ({{ mech.specialty }})
                  </option>
                </select>
                <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown class="w-4 h-4" />
                </span>
              </div>
            </div>

            <!-- Task Detail / Symptoms -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Síntomas / Tareas a Realizar</label>
              <textarea rows="3" required v-model="form.taskDescription" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all resize-none" placeholder="Detalle la falla reportada o la tarea preventiva de fábrica..."></textarea>
            </div>

            <!-- Horometer & Cost Breakdown Grid -->
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Control de Horómetro y Costos</h4>
              
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Horómetro Apertura (Horas)</label>
                <input type="number" required v-model="form.openHours" min="0" class="px-3 py-1.5 w-full border border-slate-200 bg-white rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all font-semibold" placeholder="Ej. 265" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Costo Mano Obra (Bs)</label>
                  <input type="number" required v-model="form.laborCost" min="0" class="px-3 py-1.5 w-full border border-slate-200 bg-white rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all text-right" placeholder="0" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Costo Repuestos (Bs)</label>
                  <input type="number" required v-model="form.partsCost" min="0" class="px-3 py-1.5 w-full border border-slate-200 bg-white rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all text-right" placeholder="0" />
                </div>
              </div>

              <!-- Reactive Total Cost display -->
              <div class="flex items-center justify-between border-t border-slate-200 pt-3">
                <span class="text-xs font-bold text-slate-500">COSTO TOTAL CONSOLIDADO:</span>
                <span class="text-base font-extrabold text-slate-800">Bs {{ totalConsolidatedCost }}</span>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button type="button" @click="closeModal" class="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-center">
                Cancelar
              </button>
              <button type="submit" class="flex-1 py-2.5 text-sm font-semibold text-white bg-agro-600 hover:bg-agro-500 rounded-xl transition-all cursor-pointer text-center shadow-md shadow-agro-600/10">
                Emitir Orden
              </button>
            </div>

          </form>
        </div>
      </div>
    </transition>

    <!-- Close OT Modal Dialog -->
    <transition name="modal">
      <div v-if="isCloseModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" @click="closeCloseModal"></div>
        
        <!-- Modal Card -->
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 class="font-bold text-slate-800 text-lg">Cierre de Orden: {{ closeForm.code }}</h3>
            <button @click="closeCloseModal" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <form @submit.prevent="saveCloseOt" class="p-6 space-y-4 text-left">
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs text-slate-600">
              <p><span class="font-bold text-slate-700">Maquinaria:</span> {{ closeForm.brand }} {{ closeForm.model }}</p>
              <p><span class="font-bold text-slate-700">Horómetro de Apertura:</span> {{ closeForm.openHours }} hrs</p>
              <p><span class="font-bold text-slate-700">Costo Final Consolidado:</span> Bs {{ closeForm.totalCost }}</p>
            </div>

            <!-- Closing Horometer reading input -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Lectura de Horómetro de Cierre (Horas)</label>
              <input type="number" required v-model="closeForm.closeHours" min="0" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500 font-bold" placeholder="Ej. 280" />
              <p class="text-[10px] text-slate-400 mt-1">Al guardar, este valor actualizará el horómetro actual de la máquina en el inventario.</p>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button type="button" @click="closeCloseModal" class="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-center">
                Cancelar
              </button>
              <button type="submit" class="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all cursor-pointer text-center shadow-md shadow-emerald-600/10">
                Confirmar Cierre
              </button>
            </div>

          </form>
        </div>
      </div>
    </transition>

    <!-- Custom Confirmation Modal -->
    <ConfirmModal 
      :show="deleteModal.show"
      title="Eliminar Orden de Trabajo"
      :message="deleteModal.message"
      @confirm="executeDeleteOt"
      @cancel="deleteModal.show = false"
    />

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, ChevronDown, X, Edit3, Trash2, Check, FileSignature, Tractor } from '@lucide/vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { getOrdenesTrabajo, getMaquinarias, getMecanicos, crearOrdenTrabajo, updateOrdenTrabajo, cerrarOrdenTrabajo, deleteOrdenTrabajo as deleteOrdenTrabajoApi } from '../data/db'

const ots = ref([])
const mockMachines = ref([])
const mockMechanics = ref([])

const reload = () => {
  ots.value = getOrdenesTrabajo()
  mockMachines.value = getMaquinarias()
  mockMechanics.value = getMecanicos()
}

onMounted(reload)

const searchQuery = ref('')
const filterStatus = ref('')

// Control del Modal de Confirmación personalizado
const deleteModal = reactive({
  show: false,
  ot: null,
  message: ''
})

// Modales
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingOtId = ref(null)

const isCloseModalOpen = ref(false)

const form = reactive({
  machineCode: '',
  mechanicId: '',
  taskDescription: '',
  openHours: 0,
  laborCost: 0,
  partsCost: 0
})

const closeForm = reactive({
  id: null,
  code: '',
  brand: '',
  model: '',
  openHours: 0,
  closeHours: 0,
  totalCost: 0
})

// Costo reactivo consolidado en tiempo real (Criterio de Aceptación)
const totalConsolidatedCost = computed(() => {
  const labor = parseFloat(form.laborCost) || 0
  const parts = parseFloat(form.partsCost) || 0
  return labor + parts
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

// Filtrado de la tabla
const filteredOts = computed(() => {
  return ots.value.filter(ot => {
    const matchesSearch = ot.code.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          ot.brand.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          ot.model.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          ot.mechanicName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          ot.taskDescription.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = filterStatus.value === '' || ot.status === filterStatus.value
    
    return matchesSearch && matchesStatus
  })
})

const openCreateModal = () => {
  isEditing.value = false
  editingOtId.value = null
  form.machineCode = ''
  form.mechanicId = ''
  form.taskDescription = ''
  form.openHours = 0
  form.laborCost = 0
  form.partsCost = 0
  isModalOpen.value = true
}

const openEditModal = (ot) => {
  isEditing.value = true
  editingOtId.value = ot.id
  form.machineCode = ot.machineCode
  form.mechanicId = ot.mechanicId
  form.taskDescription = ot.taskDescription
  form.openHours = ot.openHours
  form.laborCost = ot.laborCost
  form.partsCost = ot.partsCost
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// Auto-cargar horómetro de la máquina seleccionada al abrir OT
const onMachineChange = () => {
  const mac = mockMachines.value.find(m => m.code === form.machineCode)
  if (mac) {
    form.openHours = mac.hours
  }
}

// Guardar Orden (Apertura o Edición)
const saveOt = () => {
  if (!form.machineCode || !form.mechanicId || !form.taskDescription || form.openHours === '' || form.laborCost === '' || form.partsCost === '') {
    showToast('Por favor, complete todos los campos obligatorios', 'error')
    return
  }

  const payload = {
    machineCode: form.machineCode,
    mechanicId: Number(form.mechanicId),
    taskDescription: form.taskDescription,
    openHours: parseFloat(form.openHours),
    laborCost: parseFloat(form.laborCost),
    partsCost: parseFloat(form.partsCost)
  }

  if (isEditing.value) {
    updateOrdenTrabajo(editingOtId.value, payload)
    reload()
    showToast('Orden de trabajo actualizada correctamente', 'success')
  } else {
    const created = crearOrdenTrabajo(payload)
    reload()
    showToast(`Orden ${created.code} emitida exitosamente`, 'success')
  }
  closeModal()
}

// Abrir Modal de Cierre de OT
const openCloseOtModal = (ot) => {
  closeForm.id = ot.id
  closeForm.code = ot.code
  closeForm.brand = ot.brand
  closeForm.model = ot.model
  closeForm.openHours = ot.openHours
  closeForm.totalCost = ot.totalCost
  closeForm.closeHours = ot.openHours // Inicializamos con el de apertura
  isCloseModalOpen.value = true
}

const closeCloseModal = () => {
  isCloseModalOpen.value = false
}

// Procesar Cierre con Actualización de Horómetro en Inventario
const saveCloseOt = () => {
  if (closeForm.closeHours === '') {
    showToast('Debe ingresar el horómetro de cierre', 'error')
    return
  }

  if (parseFloat(closeForm.closeHours) < parseFloat(closeForm.openHours)) {
    showToast('El horómetro de cierre no puede ser menor al de apertura', 'error')
    return
  }

  const machineCode = ots.value.find(o => o.id === closeForm.id)?.machineCode
  const oldHours = mockMachines.value.find(m => m.code === machineCode)?.hours

  cerrarOrdenTrabajo(closeForm.id, { closeHours: parseFloat(closeForm.closeHours) })
  reload()
  showToast(`Orden ${closeForm.code} cerrada. Horómetro de ${machineCode} actualizado de ${oldHours}h a ${closeForm.closeHours}h en inventario.`, 'success')

  closeCloseModal()
}

const deleteOt = (ot) => {
  deleteModal.ot = ot
  deleteModal.message = `¿Está seguro de eliminar permanentemente el registro de la orden ${ot.code}?`
  deleteModal.show = true
}

const executeDeleteOt = () => {
  if (!deleteModal.ot) return
  const ot = deleteModal.ot
  deleteModal.show = false
  deleteOrdenTrabajoApi(ot.id)
  reload()
  showToast(`Registro de orden ${ot.code} eliminado`, 'success')
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
