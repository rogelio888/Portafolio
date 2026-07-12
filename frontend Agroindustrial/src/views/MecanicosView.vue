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
        <h1 class="text-3xl font-bold text-agro-900 tracking-tight">Directorio de Mecánicos Externos</h1>
        <p class="text-sm text-slate-500 mt-1">Talleres y técnicos especializados tercerizados autorizados para AgroFlota</p>
      </div>
      <div>
        <button @click="openCreateModal" class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-agro-600 hover:bg-agro-500 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-agro-600/10 active:scale-98">
          <UserCheck class="w-4 h-4" />
          <span>Registrar Mecánico / Taller</span>
        </button>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white rounded-2xl border border-agro-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="relative w-full md:max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search class="w-4 h-4" />
        </span>
        <input type="text" v-model="searchQuery" placeholder="Buscar por nombre, especialidad o teléfono..." class="pl-10 pr-4 py-2 w-full border border-slate-200 bg-slate-50/50 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all" />
      </div>

      <div class="relative min-w-[190px] w-full md:w-auto">
        <select v-model="filterSpecialty" class="appearance-none w-full pl-3 pr-8 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
          <option value="">Todas las Especialidades</option>
          <option value="Transmisión e Hidráulica">Transmisión e Hidráulica</option>
          <option value="Sistemas de Combustible">Sistemas de Combustible</option>
          <option value="Electricidad y Sensores">Electricidad y Sensores</option>
          <option value="Tornería y Soldadura">Tornería y Soldadura</option>
          <option value="Mecánica General">Mecánica General</option>
        </select>
        <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown class="w-4 h-4" />
        </span>
      </div>
    </div>

    <!-- Directory Directory Card/Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="mecanico in filteredMecanicos" :key="mecanico.id"
           class="bg-white rounded-3xl border border-agro-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:border-agro-200 transition-all text-left">
        
        <!-- Top Box -->
        <div class="space-y-4">
          <div class="flex items-start justify-between gap-2">
            <div class="w-10 h-10 rounded-xl bg-agro-50 text-agro-700 flex items-center justify-center font-bold">
              <Wrench class="w-5 h-5" />
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                  :class="mecanico.available ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-amber-50 text-amber-800 border-amber-100'">
              {{ mecanico.available ? 'Disponible' : 'En Servicio' }}
            </span>
          </div>

          <div>
            <h3 class="font-bold text-slate-800 text-lg leading-tight">{{ mecanico.name }}</h3>
            <p class="text-xs text-slate-400 mt-0.5">ID: TEC-0{{ mecanico.id }}</p>
          </div>

          <div>
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700">
              {{ mecanico.specialty }}
            </span>
          </div>

          <!-- Contact items -->
          <div class="space-y-2.5 pt-2 border-t border-slate-50 text-xs">
            <div class="flex items-center gap-2 text-slate-600">
              <Phone class="w-4 h-4 text-slate-400 shrink-0" />
              <a :href="'tel:' + mecanico.phone" class="font-semibold text-agro-600 hover:text-agro-500 hover:underline">
                {{ mecanico.phone }}
              </a>
            </div>
            <div class="flex items-center gap-2 text-slate-500">
              <MapPin class="w-4 h-4 text-slate-400 shrink-0" />
              <span class="truncate">{{ mecanico.address }}</span>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center justify-end gap-2 pt-5 mt-5 border-t border-slate-100">
          <button @click="openEditModal(mecanico)" class="p-2 text-slate-500 hover:text-agro-600 hover:bg-agro-50 rounded-xl transition-all cursor-pointer" title="Editar Ficha">
            <Edit3 class="w-4 h-4" />
          </button>
          <button @click="deleteMecanico(mecanico)" class="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer" title="Eliminar Ficha">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>

      </div>

      <!-- Empty State -->
      <div v-if="filteredMecanicos.length === 0" class="col-span-full bg-white rounded-3xl border border-agro-100 p-12 text-center text-slate-400 shadow-sm">
        <div class="flex flex-col items-center gap-2 max-w-sm mx-auto">
          <Search class="w-8 h-8 text-slate-300" />
          <p class="font-medium text-slate-500">No se encontraron técnicos externos</p>
          <p class="text-xs">Intenta modificando el filtro de búsqueda o el tipo de especialidad.</p>
        </div>
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
              {{ isEditing ? 'Editar Registro' : 'Registrar Técnico / Taller' }}
            </h3>
            <button @click="closeModal" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <form @submit.prevent="saveMecanico" class="p-6 space-y-4 text-left">
            
            <!-- Nombre / Taller -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nombre del Técnico o Taller</label>
              <input type="text" required v-model="form.name" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" placeholder="Ej. Taller Central Montero" />
            </div>

            <!-- Especialidad select -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Especialidad Técnica</label>
              <div class="relative">
                <select required v-model="form.specialty" class="appearance-none w-full pl-4 pr-10 py-2.5 border border-slate-200 bg-white rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
                  <option value="Mecánica General">Mecánica General</option>
                  <option value="Transmisión e Hidráulica">Transmisión e Hidráulica</option>
                  <option value="Sistemas de Combustible">Sistemas de Combustible</option>
                  <option value="Electricidad y Sensores">Electricidad y Sensores</option>
                  <option value="Tornería y Soldadura">Tornería y Soldadura</option>
                </select>
                <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown class="w-4 h-4" />
                </span>
              </div>
            </div>

            <!-- Teléfono input -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Número de Teléfono / WhatsApp</label>
              <input type="text" required v-model="form.phone" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" placeholder="Ej. +591 78012457" />
            </div>

            <!-- Dirección input -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Dirección / Ubicación</label>
              <input type="text" required v-model="form.address" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" placeholder="Ej. Calle 24 de Septiembre, Montero" />
            </div>

            <!-- Disponibilidad toggle -->
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p class="text-sm font-semibold text-slate-700">Estado de Disponibilidad</p>
                <p class="text-[10px] text-slate-400">¿El técnico está disponible para recibir órdenes?</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.available" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-agro-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-agro-500"></div>
              </label>
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
      title="Eliminar Registro de Técnico"
      :message="deleteModal.message"
      @confirm="executeDeleteMecanico"
      @cancel="deleteModal.show = false"
    />

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, UserCheck, Wrench, Edit3, Trash2, X, ChevronDown, Phone, MapPin } from '@lucide/vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { getMecanicos, createMecanico, updateMecanico, deleteMecanico as deleteMecanicoApi } from '../data/db'

const mecanicos = ref([])

const reload = () => {
  mecanicos.value = getMecanicos()
}

onMounted(reload)

const searchQuery = ref('')
const filterSpecialty = ref('')

// Control de modales
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingMecanicoId = ref(null)

// Control del Modal de Confirmación personalizado
const deleteModal = reactive({
  show: false,
  mecanico: null,
  message: ''
})

const form = reactive({
  name: '',
  specialty: 'Mecánica General',
  phone: '',
  address: '',
  available: true
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

// Filtrado del directorio
const filteredMecanicos = computed(() => {
  return mecanicos.value.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          m.specialty.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          m.phone.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesSpecialty = filterSpecialty.value === '' || m.specialty === filterSpecialty.value
    return matchesSearch && matchesSpecialty
  })
})

const openCreateModal = () => {
  isEditing.value = false
  editingMecanicoId.value = null
  form.name = ''
  form.specialty = 'Mecánica General'
  form.phone = ''
  form.address = ''
  form.available = true
  isModalOpen.value = true
}

const openEditModal = (mecanico) => {
  isEditing.value = true
  editingMecanicoId.value = mecanico.id
  form.name = mecanico.name
  form.specialty = mecanico.specialty
  form.phone = mecanico.phone
  form.address = mecanico.address
  form.available = mecanico.available
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// Guardar registro (CRUD)
const saveMecanico = () => {
  if (!form.name || !form.phone || !form.address) {
    showToast('Por favor, complete todos los campos obligatorios', 'error')
    return
  }

  if (isEditing.value) {
    updateMecanico(editingMecanicoId.value, {
      name: form.name,
      specialty: form.specialty,
      phone: form.phone,
      address: form.address,
      available: form.available
    })
    reload()
    showToast('Registro de mecánico actualizado correctamente', 'success')
  } else {
    createMecanico({
      name: form.name,
      specialty: form.specialty,
      phone: form.phone,
      address: form.address,
      available: form.available
    })
    reload()
    showToast('Nuevo taller registrado correctamente', 'success')
  }
  closeModal()
}

const deleteMecanico = (mecanico) => {
  deleteModal.mecanico = mecanico
  deleteModal.message = `¿Está seguro de eliminar a "${mecanico.name}" del directorio técnico de AgroFlota?`
  deleteModal.show = true
}

const executeDeleteMecanico = () => {
  if (!deleteModal.mecanico) return
  const mecanico = deleteModal.mecanico
  deleteModal.show = false
  deleteMecanicoApi(mecanico.id)
  reload()
  showToast('Registro eliminado del directorio', 'success')
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
