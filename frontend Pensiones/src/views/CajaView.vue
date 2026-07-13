<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../api/axios';
import SkeletonLoader from '../components/SkeletonLoader.vue';

const logoUrl = `${import.meta.env.BASE_URL}logo-colegio.svg`;

// Toast Notification ref
const showToast = ref(false);
const toastMessage = ref('');

const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const showResultsDropdown = ref(false);
const selectedEstudiante = ref<any>(null);
const isLoading = ref(false);
const searchError = ref('');

const cuotas = ref<any[]>([]);

const cuotasSeleccionadas = ref<number[]>([]);
const isProcessing = ref(false);
const showPaymentModal = ref(false);
const showReciboModal = ref(false);
const isQRGenerated = ref(false);
const qrTransactionId = ref<string | null>(null);
const currentPaymentId = ref<number | null>(null);
const isCheckingPayment = ref(false);
const qrStatusInterval = ref<any>(null);
const isSimulatingWebhook = ref(false);

const metodoPago = ref('Efectivo');
const lastPaymentInfo = ref<any>(null);

const isSearching = ref(false);

const searchEstudiante = async () => {
  if (searchQuery.value.length < 3) {
    showResultsDropdown.value = false;
    searchError.value = '';
    return;
  }
  
  isSearching.value = true;
  searchError.value = '';
  
  try {
    const response = await api.get(`/students?q=${searchQuery.value}`);
    searchResults.value = response.data;
    
    if (searchResults.value.length > 0) {
      // Buscar coincidencia exacta por código o CI
      const exactMatch = searchResults.value.find(s => 
        s.codigo.toLowerCase() === searchQuery.value.toLowerCase() || 
        s.ci === searchQuery.value
      );
      
      // Si hay coincidencia exacta o solo un resultado, seleccionarlo. Si hay varios, mostrar dropdown.
      if (exactMatch) {
        selectEstudiante(exactMatch);
      } else if (searchResults.value.length === 1) {
        selectEstudiante(searchResults.value[0]);
      } else {
        showResultsDropdown.value = true;
      }
    } else {
      showResultsDropdown.value = false;
      searchError.value = 'No se encontró ningún estudiante con ese criterio.';
    }
  } catch (error) {
    console.error('Error al buscar estudiantes', error);
  } finally {
    isSearching.value = false;
  }
};

const selectEstudiante = async (estudiante: any) => {
  isLoading.value = true;
  selectedEstudiante.value = estudiante;
  searchQuery.value = estudiante.nombre;
  showResultsDropdown.value = false;
  cuotasSeleccionadas.value = [];
  
  await fetchDebts(estudiante.id);
  isLoading.value = false;
};

const fetchDebts = async (studentId: number) => {
  try {
    const response = await api.get(`/students/${studentId}/debts`);
    cuotas.value = response.data;
  } catch (error) {
    console.error('Error al cargar cuotas', error);
  }
};

const limpiarBusqueda = () => {
  searchQuery.value = '';
  searchError.value = '';
  selectedEstudiante.value = null;
  cuotasSeleccionadas.value = [];
};

const toggleCuota = (id: number, estado: string) => {
  if (estado === 'Pagado') return;
  const index = cuotasSeleccionadas.value.indexOf(id);
  if (index === -1) {
    cuotasSeleccionadas.value.push(id);
  } else {
    cuotasSeleccionadas.value.splice(index, 1);
  }
};

const montoTotalPagar = computed(() => {
  return cuotasSeleccionadas.value.reduce((total, id) => {
    const cuota = cuotas.value.find(c => c.id === id);
    return total + (cuota ? Number(cuota.monto) : 0);
  }, 0);
});

const montoRecibido = ref<number | null>(null);
const cambioDevolver = computed(() => {
  if (!montoRecibido.value) return 0;
  const cambio = montoRecibido.value - montoTotalPagar.value;
  return cambio > 0 ? cambio : 0;
});

const iniciarPollingQR = () => {
    isCheckingPayment.value = true;
    qrStatusInterval.value = setInterval(async () => {
        if (!currentPaymentId.value) return;
        try {
            const res = await api.get(`/payments/${currentPaymentId.value}/status`);
            if (res.data.status === 'Pagado') {
                detenerPollingQR();
                
                // Fetch complete payment details for receipt
                const pRes = await api.get(`/payments/${currentPaymentId.value}`);
                lastPaymentInfo.value = pRes.data;

                await fetchDebts(selectedEstudiante.value.id);
                showPaymentModal.value = false;
                isQRGenerated.value = false;
                showReciboModal.value = true;
            }
        } catch (e) {
            console.error('Error verificando pago QR', e);
        }
    }, 2000);
};

const detenerPollingQR = () => {
    isCheckingPayment.value = false;
    if (qrStatusInterval.value) {
        clearInterval(qrStatusInterval.value);
        qrStatusInterval.value = null;
    }
};



const simularEscaneoWebhook = async () => {
    if (!qrTransactionId.value) return;
    isSimulatingWebhook.value = true;
    try {
        await api.post('/banco/webhook', {
            transaction_id: qrTransactionId.value,
            status: 'Pagado'
        });
    } catch (e) {
        console.error('Error simulando webhook', e);
        alert('Error conectando con el banco simulado.');
    } finally {
        isSimulatingWebhook.value = false;
    }
};

const procesarPago = async () => {
  isProcessing.value = true;
  
  try {
    const response = await api.post('/payments', {
      student_id: selectedEstudiante.value.id,
      debt_ids: cuotasSeleccionadas.value,
      payment_method: metodoPago.value,
      total_amount: montoTotalPagar.value
    });
    
    if (metodoPago.value === 'QR') {
      currentPaymentId.value = response.data.id;
      qrTransactionId.value = response.data.transaction_id;
      isQRGenerated.value = true;
      iniciarPollingQR();
      
      // Auto-simular pago después de 3 segundos
      setTimeout(async () => {
          try {
              console.log('Simulando escaneo de webhook...');
              await simularEscaneoWebhook();
              console.log('Simulación completada.');
          } catch (e) {
              console.error('Simulación falló:', e);
          }
      }, 3000);
    } else {
      lastPaymentInfo.value = {
        recibo: String(response.data.id).padStart(6, '0'),
        fecha: new Date().toLocaleDateString('es-BO'),
        metodo: metodoPago.value,
        estudiante: selectedEstudiante.value,
        cuotasPagadas: cuotas.value.filter(c => cuotasSeleccionadas.value.includes(c.id)),
        total: montoTotalPagar.value
      };

      await fetchDebts(selectedEstudiante.value.id);
      showPaymentModal.value = false;
      montoRecibido.value = null; // Limpiar al cerrar
      showReciboModal.value = true;
    }
  } catch (error) {
    console.error('Error al procesar el pago', error);
    alert('Ocurrió un error al procesar el pago. Por favor intente de nuevo.');
  } finally {
    isProcessing.value = false;
  }
};

const loadingReciboId = ref<string | null>(null);

const verRecibo = async (paymentIdStr: string) => {
  const paymentId = parseInt(paymentIdStr, 10);
  loadingReciboId.value = paymentIdStr;
  try {
    const response = await api.get(`/payments/${paymentId}`);
    lastPaymentInfo.value = response.data;
    showReciboModal.value = true;
  } catch (error) {
    console.error('Error al cargar recibo', error);
  } finally {
    loadingReciboId.value = null;
  }
};

const cerrarRecibo = () => {
  showReciboModal.value = false;
  cuotasSeleccionadas.value = [];
};
const imprimirRecibo = () => {
  window.print();
};

const isExportingEstado = ref(false);
const exportarEstadoCuenta = async () => {
  if (!selectedEstudiante.value) return;
  isExportingEstado.value = true;
  try {
    const response = await api.get(`/reports/estado-cuenta/${selectedEstudiante.value.id}?format=pdf`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `estado_cuenta_${selectedEstudiante.value.codigo}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error exportando estado de cuenta:', error);
    alert('Error al generar el reporte PDF.');
  } finally {
    isExportingEstado.value = false;
  }
};

// --- Reporte Diario (HU16) ---
const pagosDiarios = ref<any[]>([]);
const totalDiario = computed(() => pagosDiarios.value.reduce((acc, curr) => acc + curr.monto, 0));
const isLoadingDiario = ref(false);
const isExportingDiario = ref(false);
const reportDate = ref(new Date().toISOString().split('T')[0]);

const fetchIngresosDiarios = async () => {
  isLoadingDiario.value = true;
  try {
    const res = await api.get(`/reports/daily?date=${reportDate.value}`);
    pagosDiarios.value = res.data;
  } catch (error) {
    console.error("Error al cargar reporte diario", error);
  } finally {
    isLoadingDiario.value = false;
  }
};

const exportToPDFIngresos = async () => {
  isExportingDiario.value = true;
  try {
    const response = await api.get(`/reports/daily?format=pdf&date=${reportDate.value}`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_ingresos.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toastMessage.value = `Reporte de Ingresos descargado exitosamente.`;
    showToast.value = true;
    setTimeout(() => { showToast.value = false; }, 3000);
  } catch (error) {
    console.error("Error al exportar", error);
    alert('Error al exportar el reporte.');
  } finally {
    isExportingDiario.value = false;
  }
};

onMounted(() => {
  fetchIngresosDiarios();
});

</script>

<template>
  <div>
    <!-- Toast Notification -->
    <div v-if="showToast" class="fixed top-20 right-8 px-5 py-3 rounded-sm shadow-xl flex items-center gap-3 z-50 animate-fade-in bg-slate-800 border-l-4 border-slate-500 text-white">
      <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-700 text-white">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
      </div>
      <div>
        <p class="font-bold text-sm">Descarga Completada</p>
        <p class="text-xs text-slate-300">{{ toastMessage }}</p>
      </div>
    </div>
    
    <div class="animate-fade-in max-w-6xl mx-auto space-y-6 print:hidden">
    
    <!-- Header Caja -->
    <div class="bg-white p-6 border border-slate-200 rounded-sm shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 border-t-4 border-t-primary">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-sm">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-800">Caja y Facturación</h2>
          <p class="text-sm text-slate-500">Módulo de cobro de pensiones y emisión de recibos.</p>
        </div>
      </div>
      
      <div class="w-full md:w-96 relative flex flex-col">
        <div class="flex relative w-full">
          <input 
            v-model="searchQuery" 
            @keyup.enter="searchEstudiante"
            type="text" 
            placeholder="Buscar por Nombre, CI o Código..." 
            class="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-l-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            :disabled="selectedEstudiante !== null"
          >
          <button 
            v-if="!selectedEstudiante"
            @click="searchEstudiante"
            class="px-4 bg-secondary text-white rounded-r-sm hover:bg-secondary-dark transition-colors flex items-center justify-center"
            :disabled="isSearching"
          >
            <svg v-if="!isSearching" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <svg v-else class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </button>
          <button 
            v-else
            @click="limpiarBusqueda"
            class="px-4 bg-rose-50 text-rose-600 border-y border-r border-rose-200 rounded-r-sm hover:bg-rose-100 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <!-- Error Message -->
        <p v-if="searchError" class="absolute top-full mt-1 text-xs text-rose-500 bg-white px-2 py-1 rounded shadow-sm border border-rose-200 w-full z-10">
          {{ searchError }}
        </p>
        
        <!-- Search Results Dropdown -->
        <div v-if="showResultsDropdown" class="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 shadow-lg rounded-sm z-50 max-h-64 overflow-y-auto">
          <ul>
            <li v-for="est in searchResults" :key="est.id" @click="selectEstudiante(est)" class="p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
              <div class="font-bold text-sm text-slate-800">{{ est.nombre }}</div>
              <div class="text-xs text-slate-500 flex gap-2 mt-0.5">
                <span>Cod: {{ est.codigo }}</span>
                <span v-if="est.ci">| CI: {{ est.ci }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Si no hay estudiante seleccionado: Mostrar Reporte Diario -->
    <div v-if="!selectedEstudiante && !isLoading" class="bg-white border border-slate-200 rounded-sm shadow-sm p-6 animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="font-bold text-slate-800 text-lg">Reporte de Ingresos Diarios</h3>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-sm text-slate-500">Fecha del reporte:</span>
            <input 
              type="date" 
              v-model="reportDate"
              @change="fetchIngresosDiarios"
              class="text-sm border border-slate-300 rounded-sm px-2 py-1 focus:outline-none focus:border-secondary"
            />
          </div>
        </div>
        <div class="text-right">
          <p class="text-xs uppercase tracking-widest font-bold text-slate-400">Total Recaudado Hoy</p>
          <p class="text-3xl font-mono font-bold text-emerald-600">Bs. {{ totalDiario.toFixed(2) }}</p>
        </div>
      </div>

      <div v-if="isLoadingDiario" class="py-12 flex justify-center">
        <svg class="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
      <div v-else>
        <div class="overflow-x-auto mb-6">
        <table class="w-full text-left text-sm text-slate-600 min-w-[600px]">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-700">
            <tr>
              <th class="px-4 py-3">Hora</th>
              <th class="px-4 py-3">Estudiante</th>
              <th class="px-4 py-3">Concepto</th>
              <th class="px-4 py-3">Método</th>
              <th class="px-4 py-3 text-right">Monto (Bs.)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="pago in pagosDiarios" :key="pago.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-4 py-3 text-xs text-slate-400 font-bold">{{ pago.hora }}</td>
              <td class="px-4 py-3 font-medium text-slate-800">{{ pago.estudiante }}</td>
              <td class="px-4 py-3">{{ pago.concepto }}</td>
              <td class="px-4 py-3 text-xs font-bold uppercase">{{ pago.metodo }}</td>
              <td class="px-4 py-3 text-right font-mono font-bold text-emerald-600">{{ pago.monto.toFixed(2) }}</td>
            </tr>
            <tr v-if="pagosDiarios.length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-slate-500">No se registraron pagos en el día de hoy.</td>
            </tr>
          </tbody>
        </table>
        </div>

        <div class="flex justify-end pt-4 border-t border-slate-100">
          <button @click="exportToPDFIngresos" :disabled="isExportingDiario" class="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-sm transition-colors flex items-center justify-center gap-2 disabled:bg-slate-600">
            <svg v-if="isExportingDiario" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            {{ isExportingDiario ? 'Generando...' : 'Descargar Reporte PDF' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="mt-8 animate-fade-in">
      <SkeletonLoader :rows="6" />
    </div>

    <div v-if="!isLoading && selectedEstudiante" class="grid lg:grid-cols-3 gap-8 items-start animate-fade-in-up">
      
      <!-- Lado Izquierdo: Datos y Estado de Cuenta -->
      <div class="lg:col-span-2 space-y-6">
        
        <div class="bg-white border border-slate-200 rounded-sm shadow-sm p-6 flex gap-6">
          <div class="w-16 h-16 bg-slate-100 border border-slate-200 rounded-sm flex items-center justify-center text-slate-400 shrink-0">
             <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-bold text-slate-800">{{ selectedEstudiante.nombre }}</h3>
            <div class="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p class="text-[10px] uppercase font-bold text-slate-400">Código</p>
                <p class="text-sm font-mono font-bold text-slate-700">{{ selectedEstudiante.codigo }}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase font-bold text-slate-400">Curso</p>
                <p class="text-sm font-bold text-slate-700">{{ selectedEstudiante.curso }}</p>
              </div>
            </div>
          </div>
          <div class="flex flex-col justify-center shrink-0">
            <button 
              @click="exportarEstadoCuenta" 
              :disabled="isExportingEstado"
              class="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-primary border border-primary rounded-sm hover:bg-primary hover:text-white transition-colors"
            >
              <svg v-if="isExportingEstado" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              {{ isExportingEstado ? 'Generando...' : 'Estado de Cuenta (PDF)' }}
            </button>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div class="bg-slate-50 border-b border-slate-200 p-4">
            <h4 class="font-bold text-slate-800">Estado de Cuenta</h4>
          </div>
          <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600 min-w-[560px]">
            <thead class="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
              <tr>
                <th class="px-4 py-3 w-10 text-center">Sel</th>
                <th class="px-4 py-3">Concepto (Mes)</th>
                <th class="px-4 py-3 text-right">Monto Bs.</th>
                <th class="px-4 py-3 text-center">Estado</th>
                <th class="px-4 py-3">Recibo / Ref.</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="cuota in cuotas" 
                :key="cuota.id" 
                :class="[
                  cuota.estado === 'Pagado' ? 'bg-slate-50/50 opacity-70 cursor-default' : 'hover:bg-slate-50 cursor-pointer',
                  cuotasSeleccionadas.includes(cuota.id) ? 'bg-primary/5' : '',
                  'transition-colors'
                ]"
                @click="toggleCuota(cuota.id, cuota.estado)"
              >
                <td class="px-4 py-3 text-center">
                  <input 
                    type="checkbox" 
                    :disabled="cuota.estado === 'Pagado'"
                    :checked="cuota.estado === 'Pagado' || cuotasSeleccionadas.includes(cuota.id)"
                    class="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary disabled:opacity-50"
                  >
                </td>
                <td class="px-4 py-3">
                  <p class="font-bold text-slate-800">{{ cuota.nombre }}</p>
                </td>
                <td class="px-4 py-3 text-right font-mono font-bold text-slate-700">
                  {{ Number(cuota.monto).toFixed(2) }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span v-if="cuota.estado === 'Pagado'" class="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase rounded-sm">Pagado</span>
                  <span v-if="cuota.estado === 'Pendiente'" class="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase rounded-sm">Pendiente</span>
                  <span v-if="cuota.estado === 'Mora'" class="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase rounded-sm">En Mora</span>
                </td>
                <td class="px-4 py-3 font-mono text-slate-500">
                  <div class="flex items-center gap-2">
                    <span v-if="!cuota.recibo">---</span>
                    <template v-else>
                      <span>{{ cuota.recibo }}</span>
                      <button @click.stop="verRecibo(cuota.recibo)" class="cursor-pointer text-primary hover:text-primary-dark p-1 rounded-full hover:bg-primary/10 transition-colors" title="Ver Recibo" :disabled="loadingReciboId === cuota.recibo">
                        <svg v-if="loadingReciboId !== cuota.recibo" class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        <svg v-else class="animate-spin w-4 h-4 text-primary pointer-events-none" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <!-- Lado Derecho: Resumen y Cobro -->
      <div class="space-y-6">
        <div class="bg-slate-800 rounded-sm shadow-xl p-6 text-white sticky top-6">
          <h4 class="font-bold text-lg mb-6 border-b border-slate-600 pb-2 flex items-center gap-2">
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            Resumen de Cobro
          </h4>
          
          <div class="space-y-3 mb-6 text-sm">
            <div class="flex justify-between text-slate-300">
              <span>Cuotas seleccionadas:</span>
              <span class="font-bold text-white">{{ cuotasSeleccionadas.length }}</span>
            </div>
            <div class="flex justify-between text-slate-300">
              <span>Subtotal:</span>
              <span class="font-mono">Bs. {{ montoTotalPagar.toFixed(2) }}</span>
            </div>
          </div>

          <div class="border-t border-slate-600 pt-4 mb-8">
            <div class="flex justify-between items-end">
              <span class="text-xs uppercase tracking-widest text-slate-400 font-bold">Total a Cobrar</span>
              <span class="text-3xl font-bold text-emerald-400 font-mono">Bs. {{ montoTotalPagar.toFixed(2) }}</span>
            </div>
          </div>

          <button 
            @click="showPaymentModal = true"
            :disabled="cuotasSeleccionadas.length === 0"
            class="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-sm transition-colors disabled:bg-slate-600 disabled:text-slate-400 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Procesar Pago
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Procesar Pago -->
    <div v-if="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div class="bg-secondary p-4 flex justify-between items-center text-white border-b-4 border-primary">
          <h3 class="font-bold">Completar Transacción</h3>
          <button @click="showPaymentModal = false" class="text-white/70 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        <div class="p-6">
          <p class="text-center text-sm text-slate-500 mb-6">Monto total a cobrar a <span class="font-bold text-slate-800">{{ selectedEstudiante.nombre }}</span></p>
          <div class="text-center mb-8">
            <span class="text-4xl font-bold font-mono text-slate-800">Bs. {{ montoTotalPagar.toFixed(2) }}</span>
          </div>

          <div class="space-y-4">
            <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Método de Pago</label>
            <div class="grid grid-cols-2 gap-4">
              <button 
                @click="metodoPago = 'Efectivo'"
                :class="[metodoPago === 'Efectivo' ? 'bg-primary/5 border-primary text-primary' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300', 'border-2 p-3 rounded-sm flex flex-col items-center gap-2 transition-colors']"
              >
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <span class="font-bold text-sm">Efectivo</span>
              </button>
              <button 
                @click="metodoPago = 'QR'; isQRGenerated = false;"
                :class="[metodoPago === 'QR' ? 'bg-primary/5 border-primary text-primary' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300', 'border-2 p-3 rounded-sm flex flex-col items-center gap-2 transition-colors']"
              >
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                <span class="font-bold text-sm">QR Simple</span>
              </button>
            </div>
          </div>

          <div v-if="metodoPago === 'Efectivo'" class="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-sm">
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-600 font-medium">Recibido (Bs):</span>
              <input v-model.number="montoRecibido" type="number" min="0" class="w-24 px-2 py-1 border border-slate-300 rounded-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-right" :placeholder="montoTotalPagar.toString()">
            </div>
            
            <div v-if="montoRecibido && montoRecibido > montoTotalPagar" class="flex justify-between items-center text-sm mt-3 pt-3 border-t border-slate-200">
              <span class="text-slate-500 font-bold uppercase text-xs">Cambio a devolver:</span>
              <span class="font-bold text-emerald-600 text-lg font-mono">Bs. {{ cambioDevolver.toFixed(2) }}</span>
            </div>
          </div>

          <div v-if="metodoPago === 'QR' && isQRGenerated" class="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-sm text-center">
            <p class="text-xs text-slate-500 mb-2">Pida al tutor que escanee este código desde su banco</p>
            <div class="w-32 h-32 bg-slate-800 mx-auto rounded-sm flex items-center justify-center p-2">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PagoTesisColegioSimulado" alt="QR Code" class="w-full h-full bg-white p-1 rounded-sm">
            </div>
          </div>

          <div v-if="!isQRGenerated" class="mt-8 flex gap-3">
            <button @click="procesarPago" :disabled="isProcessing" class="flex-1 py-3 bg-primary text-white font-bold rounded-sm hover:bg-primary-dark transition-colors disabled:bg-slate-400">
              <span v-if="!isProcessing">{{ metodoPago === 'QR' ? 'Generar QR' : 'Confirmar y Emitir Recibo' }}</span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Registrando...
              </span>
            </button>
          </div>
          
          <div v-else class="mt-8 flex justify-center items-center text-secondary font-medium text-sm">
             <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             Esperando confirmación del banco...
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Recibo Generado (ON SCREEN) -->
    <div v-if="showReciboModal && lastPaymentInfo" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in print:hidden">
      <div class="bg-white rounded-sm shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
        
        <div class="bg-emerald-500 p-6 text-center text-white">
          <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg class="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 class="text-2xl font-bold">¡Pago Exitoso!</h2>
          <p class="text-emerald-100 text-sm mt-1">Recibo N° {{ lastPaymentInfo.recibo }}</p>
          <p class="text-emerald-100 text-xs">{{ lastPaymentInfo.fecha }}</p>
        </div>

        <div class="p-6 bg-slate-50 border-t border-b border-slate-200">
          <div class="space-y-3 text-sm">
            <div class="flex justify-between border-b border-slate-200 pb-2">
              <span class="text-slate-500">Estudiante:</span>
              <span class="font-bold text-slate-800 text-right">{{ lastPaymentInfo.estudiante.nombre }}</span>
            </div>
            <div class="flex justify-between border-b border-slate-200 pb-2">
              <span class="text-slate-500">Conceptos:</span>
              <div class="text-right">
                <div v-for="c in lastPaymentInfo.cuotasPagadas" :key="c.id" class="font-bold text-slate-800 text-xs">
                  {{ c.nombre }} (Bs. {{ c.monto }})
                </div>
              </div>
            </div>
            <div class="flex justify-between border-b border-slate-200 pb-2">
              <span class="text-slate-500">Método:</span>
              <span class="font-bold text-slate-800 uppercase">{{ lastPaymentInfo.metodo }}</span>
            </div>
            <div class="flex justify-between pt-2">
              <span class="text-slate-500 font-bold uppercase">Total Pagado:</span>
              <span class="font-bold text-slate-800 font-mono text-lg">Bs. {{ lastPaymentInfo.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="p-4 flex gap-3 bg-white">
          <button @click="imprimirRecibo" class="flex-1 py-2 text-sm font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-sm flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Imprimir
          </button>
          <button @click="cerrarRecibo" class="flex-1 py-2 text-sm font-bold bg-slate-800 text-white hover:bg-slate-900 rounded-sm">
            Finalizar
          </button>
        </div>

      </div>
    </div>
    </div>

    <!-- Print Only Template -->
    <div v-if="showReciboModal && lastPaymentInfo" id="recibo-card" class="hidden print:block print:bg-white print:text-black">
      <div class="max-w-3xl mx-auto border-2 border-slate-800 p-8 rounded-lg mt-8 bg-white text-black">
        
        <div class="flex justify-between items-end border-b-2 border-slate-800 pb-6 mb-6">
          <div class="flex gap-4 items-center">
            <div class="w-20 h-20 flex items-center justify-center">
              <img :src="logoUrl" alt="Logo Colegio Central" class="w-full h-full object-contain">
            </div>
            <div>
              <h1 class="text-3xl font-black text-slate-900 uppercase tracking-tighter">Colegio Central</h1>
              <p class="text-sm font-bold text-slate-600">Sistema Administrativo Escolar</p>
              <p class="text-xs text-slate-500 mt-1">NIT: 1029384756 | Av. Principal</p>
            </div>
          </div>
          <div class="text-right">
            <h2 class="text-2xl font-bold text-slate-800">RECIBO OFICIAL</h2>
            <p class="text-lg font-mono font-bold text-rose-600 mt-1">N° {{ lastPaymentInfo.recibo }}</p>
            <p class="text-sm font-bold text-slate-600 mt-1">Fecha: {{ lastPaymentInfo.fecha }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 mb-6">
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Recibí de:</p>
            <p class="font-bold text-xl text-slate-800">{{ lastPaymentInfo.estudiante.nombre }}</p>
            <p class="text-sm text-slate-600 font-mono mt-1">CÓDIGO: {{ lastPaymentInfo.estudiante.codigo }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Método de Pago:</p>
            <p class="font-bold text-lg text-slate-800 uppercase">{{ lastPaymentInfo.metodo }}</p>
          </div>
        </div>

        <div class="mb-8">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Por concepto de:</p>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b-2 border-slate-800">
                <th class="py-2 text-left font-bold text-slate-800 uppercase">Descripción</th>
                <th class="py-2 text-right font-bold text-slate-800 uppercase">Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in lastPaymentInfo.cuotasPagadas" :key="c.id" class="border-b border-slate-200">
                <td class="py-3 font-bold text-slate-700">{{ c.nombre }}</td>
                <td class="py-3 font-mono font-bold text-slate-800 text-right">Bs. {{ Number(c.monto).toFixed(2) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-slate-800 bg-slate-50/50">
                <td class="py-4 text-right font-black text-slate-800 uppercase text-lg">Total Cancelado:</td>
                <td class="py-4 text-right font-mono font-black text-2xl text-slate-900">Bs. {{ lastPaymentInfo.total.toFixed(2) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="grid grid-cols-2 gap-8 mt-24 pt-8">
          <div class="text-center">
            <div class="border-t border-slate-800 w-48 mx-auto pt-2">
              <p class="text-xs font-bold text-slate-800 uppercase">Firma del Cajero</p>
            </div>
          </div>
          <div class="text-center">
            <div class="border-t border-slate-800 w-48 mx-auto pt-2">
              <p class="text-xs font-bold text-slate-800 uppercase">Firma del Cliente</p>
            </div>
          </div>
        </div>
        
        <div class="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          Este documento es un comprobante de pago interno. No es válido como factura fiscal.
        </div>
      </div>
    </div>

  </div>
</template>
