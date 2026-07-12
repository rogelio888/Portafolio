<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
    
    <!-- Toast Notification -->
    <transition name="fade">
      <div v-if="toast.show" class="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg border text-sm font-semibold transition-all"
           :class="toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'">
        <span>{{ toast.message }}</span>
      </div>
    </transition>

    <!-- Error/Warning Modal for Deletion Block -->
    <transition name="modal">
      <div v-if="isAlertOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" @click="closeAlert"></div>
        <div class="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 text-center shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-150">
          <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertOctagon class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-slate-800">Operación No Permitida</h3>
          <p class="text-sm text-slate-500 mt-2 leading-relaxed">
            No es posible eliminar la categoría <span class="font-semibold text-slate-800">"{{ alertData.name }}"</span> porque tiene <span class="font-bold text-rose-600">{{ alertData.count }}</span> equipos vinculados en el inventario.
          </p>
          <div class="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-400 text-left border border-slate-100">
            <strong>Criterio de Seguridad (HU5):</strong> Para proteger la integridad histórica, solo puede eliminar clasificaciones que no estén en uso por maquinaria de la zafra.
          </div>
          <button @click="closeAlert" class="mt-6 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer">
            Entendido
          </button>
        </div>
      </div>
    </transition>

    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <h1 class="text-3xl font-bold text-agro-900 tracking-tight">Clasificación de Equipos</h1>
        <p class="text-sm text-slate-500 mt-1">Gestión de familias y categorías de maquinaria pesada</p>
      </div>
      <div>
        <button @click="openCreateModal" class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-agro-600 hover:bg-agro-500 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-agro-600/10 active:scale-98">
          <FolderPlus class="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-white rounded-2xl border border-agro-100 p-4 shadow-sm">
      <div class="relative w-full md:max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search class="w-4 h-4" />
        </span>
        <input type="text" v-model="searchQuery" placeholder="Buscar por nombre de categoría o prefijo..." class="pl-10 pr-4 py-2 w-full border border-slate-200 bg-slate-50/50 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all" />
      </div>
    </div>

    <!-- Classifications Table Card -->
    <div class="bg-white rounded-2xl border border-agro-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-left">
          <thead class="bg-slate-50/75 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4">Categoría</th>
              <th class="px-6 py-4">Prefijo Código</th>
              <th class="px-6 py-4">Descripción</th>
              <th class="px-6 py-4 text-center">Equipos Asociados</th>
              <th class="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
            <tr v-for="cat in filteredCategories" :key="cat.id" class="hover:bg-slate-50/50 transition-colors">
              
              <!-- Category Name -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-agro-50 text-agro-700 flex items-center justify-center font-bold text-sm">
                    <Folder class="w-4 h-4" />
                  </div>
                  <div>
                    <p class="font-bold text-slate-800">{{ cat.name }}</p>
                    <p class="text-[10px] text-slate-400">ID: CAT-0{{ cat.id }}</p>
                  </div>
                </div>
              </td>
              
              <!-- Prefix Code -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 border border-slate-200 text-slate-700">
                  {{ cat.prefix }}
                </span>
              </td>
              
              <!-- Description -->
              <td class="px-6 py-4 text-slate-500 max-w-sm truncate">
                {{ cat.description }}
              </td>
              
              <!-- Associated count -->
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                      :class="cat.machinesCount > 0 ? 'bg-agro-50 text-agro-800 border border-agro-100' : 'bg-slate-50 text-slate-400 border border-slate-100'">
                  {{ cat.machinesCount }} Equipos
                </span>
              </td>
              
              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex items-center justify-center gap-2">
                  <button @click="openEditModal(cat)" class="p-2 text-slate-500 hover:text-agro-600 hover:bg-agro-50 rounded-xl transition-all cursor-pointer" title="Editar Categoría">
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button @click="deleteCategory(cat)" class="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer" title="Eliminar Categoría">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredCategories.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                <div class="flex flex-col items-center gap-2">
                  <Search class="w-8 h-8 text-slate-300" />
                  <p class="font-medium text-slate-500">No se encontraron categorías</p>
                  <p class="text-xs">Prueba escribiendo otro término de búsqueda.</p>
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
              {{ isEditing ? 'Editar Categoría' : 'Nueva Categoría' }}
            </h3>
            <button @click="closeModal" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <form @submit.prevent="saveCategory" class="p-6 space-y-4 text-left">
            
            <!-- Category Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nombre de Categoría</label>
              <input type="text" required v-model="form.name" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all" placeholder="Ej. Tractores" />
            </div>

            <!-- Prefix Code -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Prefijo del Código (Max 4 letras)</label>
              <input type="text" required v-model="form.prefix" maxlength="4" @input="formatPrefix" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all" placeholder="Ej. TRAC" />
              <p class="text-[10px] text-slate-400 mt-1">Se usará como base para el código de inventario (ej. TRAC-001).</p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Descripción</label>
              <textarea rows="3" required v-model="form.description" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all resize-none" placeholder="Describa el tipo de maquinaria..."></textarea>
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
      title="Eliminar Categoría"
      :message="deleteModal.message"
      @confirm="executeDeleteCategory"
      @cancel="deleteModal.show = false"
    />

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, FolderPlus, Folder, Edit3, Trash2, X, AlertOctagon } from '@lucide/vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { getClasificaciones, createClasificacion, updateClasificacion, deleteClasificacion as deleteClasificacionApi } from '../data/db'

const categories = ref([])

const reload = () => {
  categories.value = getClasificaciones()
}

onMounted(reload)

const searchQuery = ref('')

// Control de alertas y modales
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingCategoryId = ref(null)

const isAlertOpen = ref(false)
const alertData = reactive({
  name: '',
  count: 0
})

// Control del Modal de Confirmación personalizado
const deleteModal = reactive({
  show: false,
  category: null,
  message: ''
})

const form = reactive({
  name: '',
  prefix: '',
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

// Convertir prefijo a mayúsculas automáticamente
const formatPrefix = () => {
  form.prefix = form.prefix.toUpperCase().replace(/[^A-Z]/g, '')
}

// Filtrado reactivo de categorías
const filteredCategories = computed(() => {
  return categories.value.filter(cat => {
    return cat.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
           cat.prefix.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

const openCreateModal = () => {
  isEditing.value = false
  editingCategoryId.value = null
  form.name = ''
  form.prefix = ''
  form.description = ''
  isModalOpen.value = true
}

const openEditModal = (cat) => {
  isEditing.value = true
  editingCategoryId.value = cat.id
  form.name = cat.name
  form.prefix = cat.prefix
  form.description = cat.description
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const closeAlert = () => {
  isAlertOpen.value = false
}

// Registrar o actualizar categoría
const saveCategory = () => {
  if (isEditing.value) {
    updateClasificacion(editingCategoryId.value, {
      name: form.name,
      prefix: form.prefix,
      description: form.description
    })
    reload()
    showToast('Categoría actualizada con éxito', 'success')
  } else {
    createClasificacion({
      name: form.name,
      prefix: form.prefix,
      description: form.description
    })
    reload()
    showToast('Nueva categoría registrada con éxito', 'success')
  }
  closeModal()
}

// Validar regla de negocio antes de eliminar (Criterio de Aceptación HU5)
const deleteCategory = (cat) => {
  if (cat.machinesCount > 0) {
    // Bloquear acción
    alertData.name = cat.name
    alertData.count = cat.machinesCount
    isAlertOpen.value = true
  } else {
    // Permitir eliminación
    deleteModal.category = cat
    deleteModal.message = `¿Está seguro de eliminar la categoría "${cat.name}"? Esta acción no se puede deshacer.`
    deleteModal.show = true
  }
}

const executeDeleteCategory = () => {
  if (!deleteModal.category) return
  const cat = deleteModal.category
  deleteModal.show = false
  try {
    deleteClasificacionApi(cat.id)
    reload()
    showToast(`Categoría "${cat.name}" eliminada correctamente`, 'success')
  } catch (error) {
    showToast(error.message, 'error')
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
