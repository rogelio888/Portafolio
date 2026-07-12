<template>
  <transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <!-- Modal Container -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100 p-6 space-y-6">
        
        <!-- Icon and Header -->
        <div class="flex flex-col items-center text-center space-y-4">
          <div class="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm">
            <AlertTriangle class="w-6 h-6" />
          </div>
          <div class="space-y-1.5">
            <h3 class="text-lg font-bold text-slate-800">{{ title }}</h3>
            <p class="text-sm text-slate-500 leading-relaxed">{{ message }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3">
          <button @click="onCancel" class="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-center">
            Cancelar
          </button>
          <button @click="onConfirm" class="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all cursor-pointer shadow-md shadow-rose-600/10 active:scale-98 text-center">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { AlertTriangle } from '@lucide/vue'

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Confirmar Acción'
  },
  message: {
    type: String,
    default: '¿Está seguro de realizar esta acción?'
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const onConfirm = () => {
  emit('confirm')
}

const onCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-from .transform, .modal-leave-to .transform {
  transform: scale(0.95);
}
</style>
