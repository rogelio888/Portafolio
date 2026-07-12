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
        <h1 class="text-3xl font-bold text-agro-900 tracking-tight">Fichas Técnicas de Fábrica</h1>
        <p class="text-sm text-slate-500 mt-1">Especificaciones originales e intervalos de mantenimiento recomendados</p>
      </div>
      <div>
        <button @click="openCreateModal" class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-agro-600 hover:bg-agro-500 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-agro-600/10 active:scale-98">
          <FilePlus2 class="w-4 h-4" />
          <span>Registrar Ficha</span>
        </button>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white rounded-2xl border border-agro-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="relative w-full md:max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search class="w-4 h-4" />
        </span>
        <input type="text" v-model="searchQuery" placeholder="Buscar por marca o modelo..." class="pl-10 pr-4 py-2 w-full border border-slate-200 bg-slate-50/50 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all" />
      </div>

      <div class="relative min-w-[180px] w-full md:w-auto">
        <select v-model="filterCategory" class="appearance-none w-full pl-3 pr-8 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
          <option value="">Todas las Categorías</option>
          <option value="Tractores">Tractores</option>
          <option value="Cosechadoras">Cosechadoras</option>
          <option value="Fumigadoras">Fumigadoras</option>
          <option value="Sembradoras">Sembradoras</option>
        </select>
        <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown class="w-4 h-4" />
        </span>
      </div>
    </div>

    <!-- Cards Grid Catalogue -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="ficha in filteredFichas" :key="ficha.id"
           class="bg-white rounded-3xl border border-agro-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-agro-200 transition-all text-left">
        
        <!-- Card Header Info -->
        <div class="p-6 pb-4 border-b border-slate-50">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10px] font-bold uppercase tracking-widest text-agro-600 bg-agro-50 px-2.5 py-1 rounded-full">
              {{ ficha.category }}
            </span>
            <span class="text-xs font-mono text-slate-400">REF: FT-{{ ficha.year }}-0{{ ficha.id }}</span>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mt-3">{{ ficha.brand }} {{ ficha.model }}</h3>
          <p class="text-xs text-slate-400 mt-1">Año de Fabricación: {{ ficha.year }}</p>
        </div>

        <!-- Spec Specs list -->
        <div class="p-6 py-4 bg-slate-50/50 space-y-3">
          <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Especificaciones Técnicas</h4>
          <div class="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
            <div>
              <span class="text-slate-400 block">Potencia de Motor:</span>
              <span class="font-semibold text-slate-700">{{ ficha.powerHp }} HP</span>
            </div>
            <div>
              <span class="text-slate-400 block">Modelo Motor:</span>
              <span class="font-semibold text-slate-700 truncate block">{{ ficha.motorType }}</span>
            </div>
            <div class="col-span-2">
              <span class="text-slate-400 block">Capacidad Combustible:</span>
              <span class="font-semibold text-slate-700">{{ ficha.tankCapacity }} Litros</span>
            </div>
          </div>
        </div>

        <!-- Recommended Intervals List -->
        <div class="p-6 py-4 flex-1 space-y-3">
          <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock class="w-3.5 h-3.5 text-agro-500" />
            <span>Intervalos de Fábrica Recomendados</span>
          </h4>
          <ul class="space-y-2 text-xs">
            <li v-for="(interval, idx) in ficha.intervals" :key="idx" class="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
              <span class="text-slate-600 font-medium truncate pr-2">{{ interval.taskName }}</span>
              <span class="px-2 py-0.5 bg-agro-100 text-agro-800 rounded-md font-bold shrink-0">
                {{ interval.hours }}h
              </span>
            </li>
            <li v-if="ficha.intervals.length === 0" class="text-slate-400 text-center py-2 italic text-[11px]">
              Sin intervalos de rutina asociados.
            </li>
          </ul>
        </div>

        <!-- Actions Footer -->
        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-end gap-2">
          <button @click="openEditModal(ficha)" class="p-2 text-slate-500 hover:text-agro-600 hover:bg-agro-50 rounded-xl transition-all cursor-pointer" title="Editar Ficha">
            <Edit3 class="w-4 h-4" />
          </button>
          <button @click="deleteFicha(ficha)" class="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer" title="Eliminar Ficha">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>

      </div>

      <!-- Empty State -->
      <div v-if="filteredFichas.length === 0" class="col-span-full bg-white rounded-3xl border border-agro-100 p-12 text-center text-slate-400 shadow-sm">
        <div class="flex flex-col items-center gap-2 max-w-sm mx-auto">
          <Search class="w-8 h-8 text-slate-300" />
          <p class="font-medium text-slate-500">No se encontraron fichas técnicas</p>
          <p class="text-xs">Intenta modificando el filtro de búsqueda o el tipo de categoría.</p>
        </div>
      </div>
    </div>

    <!-- Modal Form (Create / Edit) -->
    <transition name="modal">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" @click="closeModal"></div>
        
        <!-- Modal Card -->
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full h-[90vh] flex flex-col justify-between overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-150">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 class="font-bold text-slate-800 text-lg">
              {{ isEditing ? 'Editar Ficha Técnica' : 'Registrar Ficha Técnica' }}
            </h3>
            <button @click="closeModal" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <!-- Form Body -->
          <form @submit.prevent="saveFicha" class="flex-1 overflow-y-auto p-6 space-y-6 text-left scrollbar-light">
            
            <!-- Basic Data Grid -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Marca</label>
                <input type="text" required v-model="form.brand" class="px-4 py-2 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" placeholder="Ej. John Deere" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Modelo</label>
                <input type="text" required v-model="form.model" class="px-4 py-2 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" placeholder="Ej. 6125J" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Categoría</label>
                <div class="relative">
                  <select required v-model="form.category" class="appearance-none w-full pl-4 pr-10 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
                    <option value="" disabled>Seleccione</option>
                    <option value="Tractores">Tractores</option>
                    <option value="Cosechadoras">Cosechadoras</option>
                    <option value="Fumigadoras">Fumigadoras</option>
                    <option value="Sembradoras">Sembradoras</option>
                  </select>
                  <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown class="w-4 h-4" />
                  </span>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Año Fáb.</label>
                <input type="number" required v-model="form.year" min="1990" max="2030" class="px-4 py-2 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" placeholder="Ej. 2024" />
              </div>
            </div>

            <!-- Specs Grid -->
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Detalles de Fábrica</h4>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Potencia (HP)</label>
                  <input type="number" required v-model="form.powerHp" min="1" class="px-3 py-1.5 w-full border border-slate-200 bg-white rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" placeholder="Ej. 125" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Motor</label>
                  <input type="text" required v-model="form.motorType" class="px-3 py-1.5 w-full border border-slate-200 bg-white rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" placeholder="Ej. John Deere 4.5L" />
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Capacidad Combustible (Litros)</label>
                <input type="number" required v-model="form.tankCapacity" min="1" class="px-3 py-1.5 w-full border border-slate-200 bg-white rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" placeholder="Ej. 250" />
              </div>
            </div>

            <!-- Dynamic Intervals Manager -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Intervalos de Mantenimiento</h4>
                <button type="button" @click="addInterval" class="flex items-center gap-1 text-[11px] font-bold text-agro-600 hover:text-agro-500 transition-colors cursor-pointer">
                  + Agregar Tarea
                </button>
              </div>

              <div class="space-y-2">
                <div v-for="(interval, index) in form.intervals" :key="index" class="flex items-center gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                  <div class="flex-1">
                    <input type="text" required v-model="interval.taskName" class="px-3 py-1.5 w-full border border-slate-200 bg-white rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" placeholder="Ej. Cambio de Aceite" />
                  </div>
                  <div class="w-24 flex items-center gap-1.5">
                    <input type="number" required v-model="interval.hours" min="1" class="px-3 py-1.5 w-full border border-slate-200 bg-white rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all text-center" placeholder="Horas" />
                    <span class="text-xs text-slate-400 font-semibold">h</span>
                  </div>
                  <button type="button" @click="removeInterval(index)" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer">
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>

                <div v-if="form.intervals.length === 0" class="text-center py-6 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 bg-slate-50/20">
                  No ha registrado ninguna tarea de rutina. Haga clic en "+ Agregar Tarea" para configurar las horas del fabricante.
                </div>
              </div>
            </div>

          </form>

          <!-- Footer Buttons -->
          <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <button type="button" @click="closeModal" class="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-center">
              Cancelar
            </button>
            <button type="button" @click="saveFicha" class="flex-1 py-2.5 text-sm font-semibold text-white bg-agro-600 hover:bg-agro-500 rounded-xl transition-all cursor-pointer text-center shadow-md shadow-agro-600/10">
              Guardar Ficha
            </button>
          </div>

        </div>
      </div>
    </transition>

    <!-- Custom Confirmation Modal -->
    <ConfirmModal 
      :show="deleteModal.show"
      title="Eliminar Ficha Técnica"
      :message="deleteModal.message"
      @confirm="executeDeleteFicha"
      @cancel="deleteModal.show = false"
    />

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, FilePlus2, Edit3, Trash2, X, ChevronDown, Clock } from '@lucide/vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { getFichas, createFicha, updateFicha, deleteFicha as deleteFichaApi } from '../data/db'

const fichas = ref([])

const reload = () => {
  fichas.value = getFichas()
}

onMounted(reload)

const searchQuery = ref('')
const filterCategory = ref('')

// Control de modales
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingFichaId = ref(null)

// Control del Modal de Confirmación personalizado
const deleteModal = reactive({
  show: false,
  ficha: null,
  message: ''
})

const form = reactive({
  brand: '',
  model: '',
  category: 'Tractores',
  year: 2024,
  powerHp: '',
  motorType: '',
  tankCapacity: '',
  intervals: []
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

// Filtrado del catálogo
const filteredFichas = computed(() => {
  return fichas.value.filter(f => {
    const matchesSearch = f.brand.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          f.model.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = filterCategory.value === '' || f.category === filterCategory.value
    return matchesSearch && matchesCategory
  })
})

const openCreateModal = () => {
  isEditing.value = false
  editingFichaId.value = null
  form.brand = ''
  form.model = ''
  form.category = 'Tractores'
  form.year = new Date().getFullYear()
  form.powerHp = ''
  form.motorType = ''
  form.tankCapacity = ''
  form.intervals = [
    { taskName: 'Cambio de Aceite de Motor', hours: 250 }
  ]
  isModalOpen.value = true
}

const openEditModal = (ficha) => {
  isEditing.value = true
  editingFichaId.value = ficha.id
  form.brand = ficha.brand
  form.model = ficha.model
  form.category = ficha.category
  form.year = ficha.year
  form.powerHp = ficha.powerHp
  form.motorType = ficha.motorType
  form.tankCapacity = ficha.tankCapacity
  // Deep clone intervals list
  form.intervals = JSON.parse(JSON.stringify(ficha.intervals))
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// Agregar o quitar intervalos de manera dinámica
const addInterval = () => {
  form.intervals.push({ taskName: '', hours: 250 })
}

const removeInterval = (index) => {
  form.intervals.splice(index, 1)
}

// Registrar o actualizar
const saveFicha = () => {
  // Validar campos
  if (!form.brand || !form.model || !form.year || !form.powerHp || !form.motorType || !form.tankCapacity) {
    showToast('Por favor, complete todos los campos obligatorios', 'error')
    return
  }

  const payload = {
    brand: form.brand,
    model: form.model,
    category: form.category,
    year: parseInt(form.year),
    powerHp: parseInt(form.powerHp),
    motorType: form.motorType,
    tankCapacity: parseInt(form.tankCapacity),
    intervals: JSON.parse(JSON.stringify(form.intervals))
  }

  if (isEditing.value) {
    updateFicha(editingFichaId.value, payload)
    reload()
    showToast('Ficha técnica actualizada correctamente', 'success')
  } else {
    createFicha(payload)
    reload()
    showToast('Ficha técnica registrada con éxito', 'success')
  }
  closeModal()
}

const deleteFicha = (ficha) => {
  deleteModal.ficha = ficha
  deleteModal.message = `¿Está seguro de eliminar la ficha técnica para "${ficha.brand} ${ficha.model}"?`
  deleteModal.show = true
}

const executeDeleteFicha = () => {
  if (!deleteModal.ficha) return
  const ficha = deleteModal.ficha
  deleteModal.show = false
  deleteFichaApi(ficha.id)
  reload()
  showToast('Ficha técnica eliminada con éxito', 'success')
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
