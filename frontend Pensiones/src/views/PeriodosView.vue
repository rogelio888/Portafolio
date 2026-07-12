<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../api/axios';

const anioGestion = ref(new Date().getFullYear());
const montoBaseGlobal = ref(500); // Para aplicar a todos
const cursos = ref<any[]>([]);
const courseAmounts = ref<{course_id: number, amount: number, course_name: string}[]>([]);

const cuotas = ref([
  { id: 1, mes: 'Febrero', nombre: '1ra Cuota (Matrícula)', vencimiento: `${anioGestion.value}-02-15`, mora: false },
  { id: 2, mes: 'Marzo', nombre: '2da Cuota', vencimiento: `${anioGestion.value}-03-10`, mora: false },
  { id: 3, mes: 'Abril', nombre: '3ra Cuota', vencimiento: `${anioGestion.value}-04-10`, mora: false },
  { id: 4, mes: 'Mayo', nombre: '4ta Cuota', vencimiento: `${anioGestion.value}-05-10`, mora: false },
  { id: 5, mes: 'Junio', nombre: '5ta Cuota', vencimiento: `${anioGestion.value}-06-10`, mora: false },
  { id: 6, mes: 'Julio', nombre: '6ta Cuota', vencimiento: `${anioGestion.value}-07-10`, mora: false },
  { id: 7, mes: 'Agosto', nombre: '7ma Cuota', vencimiento: `${anioGestion.value}-08-10`, mora: false },
  { id: 8, mes: 'Septiembre', nombre: '8va Cuota', vencimiento: `${anioGestion.value}-09-10`, mora: false },
  { id: 9, mes: 'Octubre', nombre: '9na Cuota', vencimiento: `${anioGestion.value}-10-10`, mora: false },
  { id: 10, mes: 'Noviembre', nombre: '10ma Cuota', vencimiento: `${anioGestion.value}-11-10`, mora: false }
]);

const isLoading = ref(true);
const isSaving = ref(false);
const savingCourseId = ref<number | null>(null);
const showSuccess = ref(false);
const serverError = ref('');
const activeTab = ref('cronograma');

const gestionesDisponibles = ref<any[]>([]);

const fetchAllPeriods = async () => {
  try {
    const response = await api.get('/periods');
    gestionesDisponibles.value = response.data.sort((a: any, b: any) => b.year - a.year);
  } catch (error) {
    console.error('Error al cargar gestiones', error);
  }
};

const fetchCourses = async () => {
  try {
    const response = await api.get('/courses');
    cursos.value = response.data;
    // Si no hay configuración previa, llenamos con el valor global
    if (courseAmounts.value.length === 0) {
      courseAmounts.value = cursos.value.map((c: any) => ({
        course_id: c.id,
        amount: montoBaseGlobal.value,
        course_name: `${c.grado} ${c.nivel} - ${c.paralelo}`
      }));
    }
  } catch (error) {
    console.error('Error al cargar cursos', error);
  }
};

const cargarConfiguracion = (period: any, fees_template: any[], course_amounts: any[]) => {
  anioGestion.value = period.year;
  if (fees_template && fees_template.length === 10) {
    cuotas.value.forEach((c, index) => {
      c.vencimiento = fees_template[index].due_date;
    });
  }
  
  if (course_amounts && course_amounts.length > 0) {
    courseAmounts.value = course_amounts.map((ca: any) => ({
      course_id: ca.course_id,
      amount: Number(ca.amount),
      course_name: ca.course_name
    }));
  }
  
  checkMora();
};

const fetchActivePeriod = async () => {
  try {
    const response = await api.get('/periods/active');
    if (response.data && response.data.period) {
      cargarConfiguracion(response.data.period, response.data.fees_template, response.data.course_amounts);
    }
  } catch (error) {
    console.error('Error al cargar el periodo activo', error);
  } finally {
    isLoading.value = false;
  }
};

const fetchPeriodByYear = async (year: number) => {
  isLoading.value = true;
  try {
    const response = await api.get(`/periods/by-year/${year}`);
    if (response.data && response.data.period) {
      cargarConfiguracion(response.data.period, response.data.fees_template, response.data.course_amounts);
    }
  } catch (error) {
    console.error('Error al cargar la gestión seleccionada', error);
  } finally {
    isLoading.value = false;
  }
};

const actualizarAnioCuotas = () => {
  const nuevoAnio = String(anioGestion.value);
  if (nuevoAnio.length === 4) {
    cuotas.value.forEach(c => {
      if (c.vencimiento) {
        c.vencimiento = `${nuevoAnio}${c.vencimiento.substring(4)}`;
      }
    });
    checkMora();
  }
};

const checkMora = () => {
  const hoy = new Date();
  cuotas.value.forEach(c => {
    c.mora = new Date(c.vencimiento) < hoy;
  });
};

onMounted(async () => {
  await fetchAllPeriods();
  await fetchCourses();
  fetchActivePeriod();
});

const isExistingPeriod = computed(() => {
  return gestionesDisponibles.value.some(g => g.year === Number(anioGestion.value));
});

const guardarCambios = async () => {
  isSaving.value = true;
  serverError.value = '';
  try {
    const dueDates = cuotas.value.map(c => c.vencimiento);
    
    if (isExistingPeriod.value) {
      await api.put(`/periods/${anioGestion.value}`, {
        course_amounts: courseAmounts.value,
        due_dates: dueDates
      });
    } else {
      await api.post('/periods', {
        year: anioGestion.value,
        course_amounts: courseAmounts.value,
        due_dates: dueDates
      });
    }
    
    showSuccess.value = true;
    checkMora();
    fetchAllPeriods();
    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);
  } catch (error: any) {
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0] as string[];
      serverError.value = firstError[0];
    } else {
      serverError.value = error.response?.data?.message || 'Error al guardar la gestión.';
    }
    console.error(error);
  } finally {
    isSaving.value = false;
  }
};

const guardarMontoCurso = async (ca: any) => {
  if (!isExistingPeriod.value) {
    alert('Primero debes Aperturar la Gestión Escolar para poder guardar montos individuales.');
    return;
  }
  
  savingCourseId.value = ca.course_id;
  try {
    await api.put(`/periods/${anioGestion.value}/courses/${ca.course_id}/fees`, {
      amount: ca.amount
    });
    // Mostrar pequeño indicador visual de éxito temporalmente (opcional)
  } catch (error) {
    console.error('Error al guardar monto del curso', error);
    alert('Ocurrió un error al guardar el monto del curso.');
  } finally {
    savingCourseId.value = null;
  }
};
</script>

<template>
  <div class="animate-fade-in max-w-5xl mx-auto space-y-6">
    
    <!-- Notificación Flotante -->
    <div v-if="showSuccess" class="fixed top-20 right-8 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 px-5 py-3 rounded-sm shadow-xl flex items-center gap-3 z-50 animate-fade-in">
      <div class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <div>
        <p class="font-bold text-sm">Gestión Guardada</p>
        <p class="text-xs text-emerald-600">La gestión y sus cuotas se guardaron con éxito.</p>
      </div>
    </div>

    <!-- Error del servidor -->
    <div v-if="serverError" class="bg-rose-50 border-l-4 border-rose-500 text-rose-800 px-5 py-3 rounded-sm text-sm font-medium animate-fade-in">
      {{ serverError }}
    </div>

    <div v-if="isLoading" class="animate-pulse flex flex-col gap-6">
      <div class="h-24 bg-slate-200 rounded-sm"></div>
      <div class="h-40 bg-slate-200 rounded-sm"></div>
      <div class="h-96 bg-slate-200 rounded-sm"></div>
    </div>

    <template v-else>
      <!-- Cabecera de Configuración -->
    <div class="bg-white p-6 border border-slate-200 rounded-sm shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <div class="flex items-center gap-4 mb-2">
          <h2 class="text-xl font-bold text-slate-800">Gestión Escolar</h2>
          
          <div class="flex gap-2 bg-slate-100 p-1 rounded-full overflow-x-auto max-w-[300px] hide-scrollbar">
            <button 
              v-for="g in gestionesDisponibles" 
              :key="g.id" 
              @click="fetchPeriodByYear(g.year)"
              :class="[
                'px-4 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap',
                anioGestion === g.year 
                  ? (g.is_active ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-800 text-white shadow-sm')
                  : 'text-slate-500 hover:bg-slate-200'
              ]"
            >
              {{ g.year }} {{ g.is_active ? '(Activa)' : '' }}
            </button>
          </div>
        </div>
        <p class="text-sm text-slate-500">Configura las fechas límite de pago para los 10 meses de pensión.</p>
      </div>
      <div class="flex gap-4 items-center">
        <div class="text-right">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Gestión a Aperturar</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <input v-model="anioGestion" @input="actualizarAnioCuotas" type="number" class="text-2xl font-bold text-secondary bg-transparent border-b border-dashed border-slate-300 w-24 text-right focus:outline-none focus:border-secondary">
          </div>
        </div>
        <button @click="guardarCambios" :disabled="isSaving" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-sm transition-colors disabled:opacity-50 flex items-center gap-2">
          <span v-if="isSaving" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          {{ isExistingPeriod ? 'Actualizar Gestión' : 'Aperturar Gestión' }}
        </button>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="flex border-b border-slate-200">
      <button 
        @click="activeTab = 'cronograma'" 
        :class="['px-6 py-3 text-sm font-bold transition-colors border-b-2', activeTab === 'cronograma' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50']"
      >
        Cronograma de Vencimientos
      </button>
      <button 
        @click="activeTab = 'pensiones'" 
        :class="['px-6 py-3 text-sm font-bold transition-colors border-b-2', activeTab === 'pensiones' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50']"
      >
        Pensiones por Curso
      </button>
    </div>

    <!-- Tab 1: Cronograma -->
    <div v-show="activeTab === 'cronograma'" class="bg-white border border-slate-200 rounded-b-sm shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 class="font-bold text-slate-700">Cronograma de Vencimientos {{ anioGestion }}</h3>
        <span class="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-sm">10 Cuotas</span>
      </div>
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider">
            <th class="px-6 py-4 font-semibold w-16">N°</th>
            <th class="px-6 py-4 font-semibold">Concepto (Mes)</th>
            <th class="px-6 py-4 font-semibold w-64">Fecha Límite (Vencimiento)</th>
            <th class="px-6 py-4 font-semibold w-48">Estado Actual</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="(cuota, index) in cuotas" :key="cuota.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-6 py-4">
              <span class="text-slate-400 font-bold">{{ index + 1 }}</span>
            </td>
            <td class="px-6 py-4">
              <p class="font-bold text-slate-700">{{ cuota.nombre }}</p>
              <p class="text-xs text-slate-400 uppercase tracking-wider mt-0.5">Corresponde a {{ cuota.mes }}</p>
            </td>
            <td class="px-6 py-4">
              <input v-model="cuota.vencimiento" @change="checkMora" type="date" class="w-full text-sm px-3 py-2 border border-slate-200 rounded-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
            </td>
            <td class="px-6 py-4">
              <span v-if="cuota.mora" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Plazo Vencido
              </span>
              <span v-else class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> En Plazo
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tab 2: Configuración de Montos por Curso -->
    <div v-show="activeTab === 'pensiones'" class="bg-indigo-50 border border-indigo-100 p-4 rounded-b-sm flex flex-col gap-4 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="bg-indigo-100 p-2 rounded-sm text-indigo-600 shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-bold text-indigo-900">Montos Mensuales por Curso</h3>
          <p class="text-xs text-indigo-700">Define la pensión mensual que pagará cada nivel. Puedes usar el botón para aplicar un monto global rápido a todos.</p>
        </div>
        <div class="flex items-center gap-2 bg-white p-2 rounded-sm border border-indigo-200">
          <span class="text-xs font-bold text-slate-500">Monto Global: Bs.</span>
          <input v-model="montoBaseGlobal" type="number" class="w-20 text-right text-sm px-2 py-1 rounded-sm border border-slate-200 focus:outline-none focus:border-indigo-500">
          <button @click="courseAmounts.forEach(ca => ca.amount = montoBaseGlobal)" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-xs font-bold rounded-sm transition-colors">
            Aplicar a todos
          </button>
        </div>
      </div>

      <div class="bg-white border border-indigo-100 rounded-sm overflow-hidden mt-2">
        <div class="max-h-[500px] overflow-y-auto">
          <table class="w-full text-left text-sm relative">
            <thead class="bg-indigo-50 text-indigo-900 text-xs sticky top-0 z-10 shadow-sm">
              <tr>
                <th class="px-4 py-3 font-bold">Curso / Nivel</th>
                <th class="px-4 py-3 font-bold text-right w-56">Pensión Mensual (Bs.)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-indigo-50">
              <tr v-for="ca in courseAmounts" :key="ca.course_id" class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 font-medium text-slate-700">{{ ca.course_name }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <input v-model="ca.amount" type="number" class="w-24 text-right px-2 py-1.5 border border-slate-200 rounded-sm focus:outline-none focus:border-indigo-500 shadow-sm">
                    <button @click="guardarMontoCurso(ca)" :disabled="savingCourseId === ca.course_id || !isExistingPeriod" class="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-bold rounded-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                      <span v-if="savingCourseId === ca.course_id" class="w-3 h-3 border-2 border-indigo-700/20 border-t-indigo-700 rounded-full animate-spin"></span>
                      Guardar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>


    </template>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
