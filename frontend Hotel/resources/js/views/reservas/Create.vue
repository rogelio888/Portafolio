<!-- resources/js/views/reservas/Create.vue - TEMPLATE -->

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <button @click="$router.back()" class="text-blue-600 hover:text-blue-800 mb-4">
        ← Volver
      </button>
      <h1 class="text-3xl font-bold text-gray-800">Nueva Reserva</h1>
      <p class="text-gray-600 mt-1">Crea una nueva reserva paso a paso</p>
    </div>

    <!-- Progress Steps -->
    <div class="mb-8">
      <div class="flex items-center justify-between max-w-4xl mx-auto">
        <div v-for="(step, index) in steps" :key="index" class="flex items-center">
          <div :class="[
            'w-10 h-10 rounded-full flex items-center justify-center font-bold',
            currentStep >= index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
          ]">
            {{ index + 1 }}
          </div>
          <span class="ml-2 text-sm font-medium" :class="currentStep >= index + 1 ? 'text-blue-600' : 'text-gray-500'">
            {{ step }}
          </span>
          <div v-if="index < steps.length - 1" class="w-24 h-1 mx-4 bg-gray-300"></div>
        </div>
      </div>
    </div>

    <!-- Formulario por pasos -->
    <div class="bg-white rounded-lg shadow p-6 max-w-5xl mx-auto">
      <!-- PASO 1: Información básica -->
      <div v-show="currentStep === 1">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Paso 1: Información Básica</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Hotel -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Hotel <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.id_hotel"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un hotel</option>
              <option v-for="hotel in hotelesStore.hotelesActivos" :key="hotel.id" :value="hotel.id">
                {{ hotel.nombre }}
              </option>
            </select>
          </div>

          <!-- Buscar Huésped por CI -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Buscar Huésped por CI
            </label>
            <div class="flex space-x-2">
              <input
                v-model="buscarCI"
                type="text"
                placeholder="Ingresa CI"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Button @click="buscarHuespedPorCI" :loading="buscandoCI">
                🔍
              </Button>
            </div>
          </div>

          <!-- Huésped Principal -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Huésped Principal <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.id_huesped"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un huésped</option>
              <option v-for="huesped in huespedesStore.huespedesActivos" :key="huesped.id" :value="huesped.id">
                {{ huesped.nombre }} {{ huesped.apellido }} - {{ huesped.ci }}
              </option>
            </select>
            <button
              type="button"
              @click="modalNuevoHuesped = true"
              class="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              + Registrar nuevo huésped
            </button>
          </div>

          <!-- Fecha Entrada -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Entrada <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.fecha_entrada"
              type="date"
              required
              :min="today"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Fecha Salida -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Salida <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.fecha_salida"
              type="date"
              required
              :min="form.fecha_entrada || today"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Adultos -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Adultos <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.adultos"
              type="number"
              min="1"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Niños -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Niños
            </label>
            <input
              v-model.number="form.ninos"
              type="number"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div v-if="noches > 0" class="mt-4 p-4 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            📅 Total de noches: <strong>{{ noches }}</strong>
          </p>
        </div>
      </div>

      <!-- PASO 2: Seleccionar Habitaciones -->
      <div v-show="currentStep === 2">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Paso 2: Seleccionar Habitaciones</h2>

        <Button @click="cargarHabitacionesDisponibles" :loading="cargandoHabitaciones" class="mb-4">
          🔄 Cargar Habitaciones Disponibles
        </Button>

        <div v-if="!busquedaRealizada" class="text-center py-8 text-gray-500">
          Haz clic en el botón para cargar habitaciones disponibles
        </div>
        <div v-else-if="habitacionesDisponibles.length === 0" class="text-center py-8 text-red-500 bg-red-50 rounded-lg border border-red-100">
          ❌ No hay habitaciones disponibles en este hotel para las fechas seleccionadas.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="habitacion in habitacionesDisponibles"
            :key="habitacion.id"
            @click="toggleHabitacion(habitacion)"
            :class="[
              'border-2 rounded-lg p-4 cursor-pointer transition-all',
              habitacionSeleccionada(habitacion.id) 
                ? 'border-blue-600 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400'
            ]"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-lg">🚪 {{ habitacion.numero }}</h3>
              <span v-if="habitacionSeleccionada(habitacion.id)" class="text-blue-600 text-2xl">✓</span>
            </div>
            <p class="text-sm text-gray-600">{{ habitacion.tipo?.nombre }}</p>
            <p class="text-sm text-gray-500">Capacidad: {{ habitacion.tipo?.capacidad }} personas</p>
            <p class="text-lg font-bold text-blue-600 mt-2">
              {{ formatCurrency(habitacion.tipo?.precio_base) }}/noche
            </p>
          </div>
        </div>

        <div v-if="form.habitaciones.length > 0" class="mt-6 p-4 bg-green-50 rounded-lg">
          <p class="text-sm text-green-800">
            ✓ <strong>{{ form.habitaciones.length }}</strong> habitación(es) seleccionada(s)
          </p>
        </div>
      </div>

      <!-- PASO 3: Huéspedes Adicionales -->
      <div v-show="currentStep === 3">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Paso 3: Huéspedes Adicionales (Opcional)</h2>

        <p class="text-gray-600 mb-4">Agrega otros huéspedes que se alojarán en esta reserva</p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar huésped
          </label>
          <div class="flex space-x-2">
            <select
              v-model="huespedAdicionalTemp"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un huésped</option>
              <option 
                v-for="huesped in huespedesDisponibles" 
                :key="huesped.id" 
                :value="huesped.id"
              >
                {{ huesped.nombre }} {{ huesped.apellido }} - {{ huesped.ci }}
              </option>
            </select>
            <Button @click="agregarHuespedAdicional">
              + Agregar
            </Button>
          </div>
        </div>

        <div v-if="form.huespedes_adicionales.length > 0" class="space-y-2">
          <h3 class="font-medium text-gray-700 mb-3">Huéspedes agregados:</h3>
          <div
            v-for="(idHuesped, index) in form.huespedes_adicionales"
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span>👤 {{ getNombreHuesped(idHuesped) }}</span>
            <button
              @click="removerHuespedAdicional(index)"
              class="text-red-600 hover:text-red-800"
              title="Remover"
            >
              ❌
            </button>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-400">
          <p class="text-lg mb-2">👥</p>
          <p>No hay huéspedes adicionales agregados</p>
          <p class="text-sm mt-2">Puedes continuar sin agregar más huéspedes</p>
        </div>
      </div>

      <!-- PASO 4: Resumen -->
      <div v-show="currentStep === 4">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Paso 4: Resumen de la Reserva</h2>

        <div class="space-y-6">
          <!-- Info básica -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="font-bold text-lg mb-3">📋 Información Básica</h3>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-gray-600">Hotel:</span>
                <span class="ml-2 font-medium">{{ getHotelNombre() }}</span>
              </div>
              <div>
                <span class="text-gray-600">Huésped:</span>
                <span class="ml-2 font-medium">{{ getHuespedNombre() }}</span>
              </div>
              <div>
                <span class="text-gray-600">Entrada:</span>
                <span class="ml-2 font-medium">{{ formatDate(form.fecha_entrada) }}</span>
              </div>
              <div>
                <span class="text-gray-600">Salida:</span>
                <span class="ml-2 font-medium">{{ formatDate(form.fecha_salida) }}</span>
              </div>
              <div>
                <span class="text-gray-600">Noches:</span>
                <span class="ml-2 font-medium">{{ noches }}</span>
              </div>
              <div>
                <span class="text-gray-600">Personas:</span>
                <span class="ml-2 font-medium">{{ form.adultos + form.ninos }} ({{ form.adultos }} adultos, {{ form.ninos }} niños)</span>
              </div>
            </div>
          </div>

          <!-- Habitaciones -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="font-bold text-lg mb-3">🏨 Habitaciones Seleccionadas ({{ form.habitaciones.length }})</h3>
            <div class="space-y-2">
              <div
                v-for="hab in form.habitaciones"
                :key="hab.id_habitacion"
                class="flex justify-between items-center text-sm bg-white p-3 rounded"
              >
                <span>{{ getHabitacionInfo(hab.id_habitacion) }}</span>
                <span class="font-bold text-blue-600">{{ formatCurrency(calcularTotalHabitacion(hab.id_habitacion)) }}</span>
              </div>
            </div>
          </div>

          <!-- Huéspedes adicionales -->
          <div v-if="form.huespedes_adicionales.length > 0" class="p-4 bg-gray-50 rounded-lg">
            <h3 class="font-bold text-lg mb-3">👥 Huéspedes Adicionales ({{ form.huespedes_adicionales.length }})</h3>
            <ul class="space-y-1">
              <li v-for="id in form.huespedes_adicionales" :key="id" class="text-sm">
                • {{ getNombreHuesped(id) }}
              </li>
            </ul>
          </div>

          <!-- Total -->
          <div class="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm opacity-90">Total Estimado de la Reserva</p>
                <p class="text-xs opacity-75 mt-1">(Solo habitaciones, sin servicios adicionales)</p>
              </div>
              <p class="text-4xl font-bold">{{ formatCurrency(totalEstimado) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        ⚠️ {{ error }}
      </div>

      <!-- Botones de navegación -->
      <div class="mt-8 flex items-center justify-between">
        <Button
          v-if="currentStep > 1"
          type="button"
          variant="secondary"
          @click="currentStep--"
        >
          ← Anterior
        </Button>
        <div v-else></div>

        <div class="flex space-x-3">
          <Button
            type="button"
            variant="secondary"
            @click="$router.back()"
          >
            Cancelar
          </Button>
          
          <Button
            v-if="currentStep < 4"
            type="button"
            @click="siguientePaso"
            :disabled="!puedeAvanzar"
          >
            Siguiente →
          </Button>

          <Button
            v-else
            type="button"
            @click="crearReserva"
            :loading="loading"
          >
            ✓ Crear Reserva
          </Button>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Huésped -->
    <Modal :show="modalNuevoHuesped" @close="modalNuevoHuesped = false" title="Registrar Nuevo Huésped" size="lg">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
          <input
            v-model="nuevoHuesped.nombre"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Apellido *</label>
          <input
            v-model="nuevoHuesped.apellido"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Apellido"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">CI *</label>
          <input
            v-model="nuevoHuesped.ci"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Cédula de Identidad"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
          <input
            v-model="nuevoHuesped.telefono"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Teléfono"
          />
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            v-model="nuevoHuesped.email"
            type="email"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="correo@ejemplo.com"
          />
        </div>
      </div>

      <template #footer>
        <Button variant="secondary" @click="modalNuevoHuesped = false">Cancelar</Button>
        <Button @click="guardarNuevoHuesped" :loading="guardandoHuesped">Guardar Huésped</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
// resources/js/views/reservas/Create.vue - SCRIPT SETUP

import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useReservasStore } from '../../stores/reservas';
import { useHotelesStore } from '../../stores/hoteles';
import { useHuespedesStore } from '../../stores/huespedes';
import { useHabitacionesStore } from '../../stores/habitaciones';
import Button from '../../components/Button.vue';
import Modal from '../../components/Modal.vue';

const router = useRouter();
const reservasStore = useReservasStore();
const hotelesStore = useHotelesStore();
const huespedesStore = useHuespedesStore();
const habitacionesStore = useHabitacionesStore();

// Estados
const currentStep = ref(1);
const steps = ['Información', 'Habitaciones', 'Huéspedes', 'Resumen'];
const loading = ref(false);
const error = ref(null);

// Formulario principal
const form = ref({
  id_hotel: '',
  id_huesped: '',
  fecha_entrada: '',
  fecha_salida: '',
  adultos: 1,
  ninos: 0,
  habitaciones: [],
  huespedes_adicionales: []
});

// Búsqueda de huésped
const buscarCI = ref('');
const buscandoCI = ref(false);

// Habitaciones
const habitacionesDisponibles = ref([]);
const cargandoHabitaciones = ref(false);
const busquedaRealizada = ref(false); // Nuevo estado

// Huéspedes adicionales
const huespedAdicionalTemp = ref('');

// Modal nuevo huésped
const modalNuevoHuesped = ref(false);
const guardandoHuesped = ref(false);
const nuevoHuesped = ref({
  nombre: '',
  apellido: '',
  ci: '',
  telefono: '',
  email: ''
});

// Computed
const today = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const noches = computed(() => {
  if (!form.value.fecha_entrada || !form.value.fecha_salida) return 0;
  const entrada = new Date(form.value.fecha_entrada);
  const salida = new Date(form.value.fecha_salida);
  return Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
});

const huespedesDisponibles = computed(() => {
  return huespedesStore.huespedesActivos.filter(
    h => h.id !== form.value.id_huesped && !form.value.huespedes_adicionales.includes(h.id)
  );
});

const puedeAvanzar = computed(() => {
  switch (currentStep.value) {
    case 1:
      return form.value.id_hotel && form.value.id_huesped && 
             form.value.fecha_entrada && form.value.fecha_salida && 
             noches.value > 0;
    case 2:
      return form.value.habitaciones.length > 0;
    case 3:
      return true; // Huéspedes adicionales es opcional
    default:
      return true;
  }
});

const totalEstimado = computed(() => {
  let total = 0;
  form.value.habitaciones.forEach(hab => {
    const habitacion = habitacionesDisponibles.value.find(h => h.id === hab.id_habitacion);
    if (habitacion) {
      total += habitacion.tipo.precio_base * noches.value;
    }
  });
  return total;
});

// Métodos
const buscarHuespedPorCI = async () => {
  if (!buscarCI.value) return;
  
  buscandoCI.value = true;
  try {
    const huesped = await huespedesStore.buscarPorCi(buscarCI.value);
    form.value.id_huesped = huesped.id;
    buscarCI.value = '';
  } catch (error) {
    alert('Huésped no encontrado');
  } finally {
    buscandoCI.value = false;
  }
};

const cargarHabitacionesDisponibles = async () => {
  if (!form.value.id_hotel) {
    alert('Selecciona un hotel primero');
    return;
  }

  cargandoHabitaciones.value = true;
  busquedaRealizada.value = false; // Resetear estado
  try {
    habitacionesDisponibles.value = await habitacionesStore.fetchHabitacionesDisponibles(form.value.id_hotel);
    busquedaRealizada.value = true; // Marcar como realizada
  } catch (error) {
    console.error(error);
    alert('Error al cargar habitaciones');
  } finally {
    cargandoHabitaciones.value = false;
  }
};

const habitacionSeleccionada = (id) => {
  return form.value.habitaciones.some(h => h.id_habitacion === id);
};

const toggleHabitacion = (habitacion) => {
  const index = form.value.habitaciones.findIndex(h => h.id_habitacion === habitacion.id);
  
  if (index !== -1) {
    form.value.habitaciones.splice(index, 1);
  } else {
    form.value.habitaciones.push({
      id_habitacion: habitacion.id
    });
  }
};

const agregarHuespedAdicional = () => {
  if (!huespedAdicionalTemp.value) return;
  
  if (!form.value.huespedes_adicionales.includes(huespedAdicionalTemp.value)) {
    form.value.huespedes_adicionales.push(huespedAdicionalTemp.value);
  }
  
  huespedAdicionalTemp.value = '';
};

const removerHuespedAdicional = (index) => {
  form.value.huespedes_adicionales.splice(index, 1);
};

const guardarNuevoHuesped = async () => {
  if (!nuevoHuesped.value.nombre || !nuevoHuesped.value.apellido || !nuevoHuesped.value.ci) {
    alert('Completa los campos obligatorios');
    return;
  }

  guardandoHuesped.value = true;
  try {
    const response = await huespedesStore.createHuesped(nuevoHuesped.value);
    form.value.id_huesped = response.data.id;
    modalNuevoHuesped.value = false;
    nuevoHuesped.value = { nombre: '', apellido: '', ci: '', telefono: '', email: '' };
  } catch (error) {
    alert('Error al crear huésped');
  } finally {
    guardandoHuesped.value = false;
  }
};

const siguientePaso = () => {
  if (puedeAvanzar.value) {
    if (currentStep.value === 2 && form.value.habitaciones.length === 0) {
      alert('Debes seleccionar al menos una habitación');
      return;
    }
    currentStep.value++;
  }
};

const crearReserva = async () => {
  loading.value = true;
  error.value = null;

  try {
    await reservasStore.createReserva(form.value);
    router.push('/reservas');
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al crear reserva';
  } finally {
    loading.value = false;
  }
};

// Helpers
const getHotelNombre = () => {
  const hotel = hotelesStore.hoteles.find(h => h.id === form.value.id_hotel);
  return hotel?.nombre || '';
};

const getHuespedNombre = () => {
  const huesped = huespedesStore.huespedes.find(h => h.id === form.value.id_huesped);
  return huesped ? `${huesped.nombre} ${huesped.apellido}` : '';
};

const getNombreHuesped = (id) => {
  const huesped = huespedesStore.huespedes.find(h => h.id === id);
  return huesped ? `${huesped.nombre} ${huesped.apellido}` : '';
};

const getHabitacionInfo = (id) => {
  const habitacion = habitacionesDisponibles.value.find(h => h.id === id);
  return habitacion ? `Habitación ${habitacion.numero} - ${habitacion.tipo?.nombre}` : '';
};

const calcularTotalHabitacion = (id) => {
  const habitacion = habitacionesDisponibles.value.find(h => h.id === id);
  return habitacion ? habitacion.tipo.precio_base * noches.value : 0;
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(value);
};

// Lifecycle
onMounted(() => {
  hotelesStore.fetchHoteles();
  huespedesStore.fetchHuespedes();
});
</script>