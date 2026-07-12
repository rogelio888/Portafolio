<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Registrar Consumo</h1>
      <router-link
        to="/consumos"
        class="text-blue-600 hover:underline"
      >
        ← Volver al listado
      </router-link>
    </div>

    <form @submit.prevent="guardar" class="space-y-6 max-w-2xl bg-white p-6 rounded-lg shadow">
      <!-- Reserva -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Reserva <span class="text-red-500">*</span></label>
        <select v-model="form.id_reserva" required class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
          <option value="" disabled>Seleccione una reserva</option>
          <option v-for="reserva in reservas" :key="reserva.id" :value="reserva.id">
            Hab. {{ reserva.habitacion?.numero }} - {{ reserva.huesped?.nombre }} {{ reserva.huesped?.apellido }} ({{ formatDate(reserva.fecha_entrada) }} - {{ formatDate(reserva.fecha_salida) }})
          </option>
        </select>
        <p v-if="reservas.length === 0 && !loadingReservas" class="text-sm text-red-500 mt-1">
          No hay reservas activas disponibles.
        </p>
      </div>

      <!-- Servicio -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Servicio <span class="text-red-500">*</span></label>
        <select v-model="form.id_servicio" required class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
          <option value="" disabled>Seleccione un servicio</option>
          <option v-for="servicio in servicios" :key="servicio.id" :value="servicio.id">
            {{ servicio.nombre }} - {{ formatCurrency(servicio.precio) }} ({{ servicio.frecuencia }})
          </option>
        </select>
      </div>

      <!-- Lógica para Servicios DIARIOS -->
      <div v-if="esServicioDiario && form.id_reserva" class="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 class="font-medium text-blue-800 mb-3">📅 Seleccionar días para el servicio diario</h3>
        
        <div class="flex justify-end mb-2 space-x-2">
          <button type="button" @click="seleccionarTodosDias" class="text-xs text-blue-600 hover:underline">Seleccionar Todos</button>
          <button type="button" @click="deseleccionarTodosDias" class="text-xs text-gray-600 hover:underline">Deseleccionar Todos</button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <label 
            v-for="fecha in fechasEstancia" 
            :key="fecha.value" 
            class="flex items-center space-x-2 p-2 bg-white rounded border cursor-pointer hover:bg-gray-50"
            :class="{'border-blue-500 ring-1 ring-blue-500': form.fechas.includes(fecha.value)}"
          >
            <input 
              type="checkbox" 
              :value="fecha.value" 
              v-model="form.fechas"
              class="rounded text-blue-600 focus:ring-blue-500"
            >
            <span class="text-sm">{{ fecha.label }}</span>
          </label>
        </div>
        <p class="text-sm text-gray-500 mt-2">
          Se registrará un consumo por cada día seleccionado.
        </p>
      </div>

      <!-- Lógica para Servicios NO DIARIOS (Cantidad y Fecha Única) -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad <span class="text-red-500">*</span></label>
          <input v-model.number="form.cantidad" type="number" min="1" required class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha <span class="text-red-500">*</span></label>
          <input v-model="form.fecha" type="date" required class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <!-- Botones -->
      <div class="flex items-center justify-end space-x-4 pt-4 border-t">
        <button type="button" @click="resetForm" class="text-gray-600 hover:text-gray-800 px-4 py-2">
          Limpiar
        </button>
        <button 
          type="submit" 
          :disabled="loading || (esServicioDiario && form.fechas.length === 0)" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? 'Guardando...' : 'Registrar Consumo' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../../axios';

const router = useRouter();
const loading = ref(false);
const loadingReservas = ref(false);
const reservas = ref([]);
const servicios = ref([]);

const form = ref({
  id_reserva: '',
  id_servicio: '',
  cantidad: 1,
  fecha: (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })(),
  fechas: [] // Array para fechas múltiples
});

// Computed
const servicioSeleccionado = computed(() => {
  return servicios.value.find(s => s.id === form.value.id_servicio);
});

const reservaSeleccionada = computed(() => {
  return reservas.value.find(r => r.id === form.value.id_reserva);
});

const esServicioDiario = computed(() => {
  return servicioSeleccionado.value?.frecuencia === 'DIARIO';
});

const fechasEstancia = computed(() => {
  if (!reservaSeleccionada.value) return [];
  
  const fechas = [];
  let actual = new Date(reservaSeleccionada.value.fecha_entrada);
  // Ajustar zona horaria para evitar problemas de "día anterior"
  actual.setMinutes(actual.getMinutes() + actual.getTimezoneOffset());
  
  const fin = new Date(reservaSeleccionada.value.fecha_salida);
  fin.setMinutes(fin.getMinutes() + fin.getTimezoneOffset());

  while (actual < fin) { // < fin porque usualmente el checkout no cuenta como noche de estadía para servicios diarios, o sí? Depende del negocio. Asumiremos < fin (noches)
    fechas.push({
      value: actual.toISOString().split('T')[0],
      label: actual.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' })
    });
    actual.setDate(actual.getDate() + 1);
  }
  return fechas;
});

// Watchers
watch(() => form.value.id_reserva, () => {
  // Resetear fechas al cambiar reserva
  form.value.fechas = [];
});

watch(esServicioDiario, (nuevoValor) => {
  if (nuevoValor) {
    // Si cambia a diario, preseleccionar todas las fechas por defecto? O dejar vacío?
    // Dejemos vacío para que el usuario elija.
    form.value.cantidad = 1; // Resetear cantidad a 1 (se ignora en backend para diarios, o se usa como 1 por día)
  }
});

// Methods
const seleccionarTodosDias = () => {
  form.value.fechas = fechasEstancia.value.map(f => f.value);
};

const deseleccionarTodosDias = () => {
  form.value.fechas = [];
};

const resetForm = () => {
  form.value = {
    id_reserva: '',
    id_servicio: '',
    cantidad: 1,
    fecha: new Date().toISOString().split('T')[0],
    fechas: []
  };
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(value);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const cargarDatos = async () => {
  loadingReservas.value = true;
  try {
    const [resReservas, resServicios] = await Promise.all([
      axios.get('/reservas'),
      axios.get('/servicios')
    ]);

    reservas.value = resReservas.data.data.filter(r => ['CONFIRMADA', 'EN_PROCESO'].includes(r.estado));
    servicios.value = resServicios.data.data.filter(s => s.estado === 'ACTIVO');

  } catch (e) {
    console.error(e);
    alert('Error al cargar datos necesarios');
  } finally {
    loadingReservas.value = false;
  }
};

const guardar = async () => {
  loading.value = true;
  try {
    const payload = { ...form.value };
    
    // Limpiar payload según tipo
    if (esServicioDiario.value) {
      delete payload.fecha;
      // payload.fechas ya está ahí
    } else {
      delete payload.fechas;
    }

    await axios.post('/consumos', payload);
    alert('Consumo(s) registrado(s) exitosamente');
    router.push('/consumos');
  } catch (e) {
    console.error(e);
    alert(e.response?.data?.message || 'Error al registrar consumo');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  cargarDatos();
});
</script>
