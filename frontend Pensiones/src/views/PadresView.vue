<script setup lang="ts">
import { ref, computed } from 'vue';
import api from '../api/axios';
import SkeletonLoader from '../components/SkeletonLoader.vue';

const logoUrl = `${import.meta.env.BASE_URL}logo-colegio.svg`;
const studentCode = ref('');

// Estados de la simulación
const isSearching = ref(false);
const showResults = ref(false);
const searchError = ref('');

// Datos reactivos
const studentInfo = ref<any>(null);
const pensiones = ref<any[]>([]);

// Modales
const showReceiptModal = ref(false);
const showQRModal = ref(false);
const selectedPension = ref<any>(null); // Todavía útil para ver recibo de una pensión
const selectedDebts = ref<any[]>([]); // Para el pago múltiple
const isProcessingPayment = ref(false);
const paymentSuccess = ref(false);
const paymentStep = ref<'confirm' | 'generating' | 'qr'>('confirm');
const secondsLeft = ref(3);

// Datos del Recibo
const receiptData = ref<any>(null);
const isLoadingReceipt = ref(false);

// Datos del Pago QR
const qrData = ref<any>(null);
let pollingInterval: any = null;
let modalTimeout: any = null;
let countdownInterval: any = null;

const searchStudent = async () => {
  if (!studentCode.value.trim()) return;
  
  isSearching.value = true;
  showResults.value = false;
  searchError.value = '';
  
  try {
    const response = await api.get(`/portal/students/${studentCode.value.trim()}`);
    studentInfo.value = response.data.estudiante;
    pensiones.value = response.data.pensiones.map((p: any) => ({
      id: p.id,
      mes: p.mes,
      vencimiento: p.vencimiento,
      monto: parseFloat(p.monto),
      estado: p.estado,
      recibo: p.payment_id || p.recibo
    }));
    selectedDebts.value = []; // Resetear selección
    showResults.value = true;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      searchError.value = 'Código no encontrado, verifique e intente de nuevo.';
    } else {
      searchError.value = 'Ocurrió un error al buscar al estudiante.';
    }
  } finally {
    isSearching.value = false;
  }
};

// HU13: Verificar si es la cuota más antigua pendiente/vencida (Ya no se usa individualmente, manejado por checkbox)
// La función isPayable fue removida para evitar errores de linting.

// Lógica de selección de cuotas para pago múltiple
const toggleDebtSelection = (pension: any) => {
  if (pension.estado === 'pagado' || pension.estado === 'proximo') return;
  
  const isCurrentlySelected = selectedDebts.value.some(p => p.id === pension.id);
  const pensionIndex = pensiones.value.findIndex(p => p.id === pension.id);
  
  if (!isCurrentlySelected) {
    // Si se selecciona, DEBEN seleccionarse todas las cuotas pendientes/vencidas anteriores
    for (let i = 0; i <= pensionIndex; i++) {
      const p = pensiones.value[i];
      if ((p.estado === 'vencido' || p.estado === 'pendiente') && !selectedDebts.value.some(sel => sel.id === p.id)) {
        selectedDebts.value.push(p);
      }
    }
  } else {
    // Si se deselecciona, DEBEN deseleccionarse todas las cuotas posteriores
    selectedDebts.value = selectedDebts.value.filter(sel => {
      const selIndex = pensiones.value.findIndex(p => p.id === sel.id);
      return selIndex < pensionIndex;
    });
  }
};

const totalSelectedAmount = computed(() => {
  return selectedDebts.value.reduce((total, p) => total + p.monto, 0);
});

// HU15: Gestionar Historial (Comprobante)
const openReceipt = async (pension: any) => {
  selectedPension.value = pension;
  showReceiptModal.value = true;
  isLoadingReceipt.value = true;
  receiptData.value = null;

  try {
    const response = await api.get(`/portal/payments/${pension.recibo}/receipt`);
    receiptData.value = response.data;
  } catch (error) {
    console.error("Error cargando recibo", error);
  } finally {
    isLoadingReceipt.value = false;
  }
};

const openQR = () => {
  if (selectedDebts.value.length === 0) return;
  
  if (modalTimeout) clearTimeout(modalTimeout);
  if (pollingInterval) clearInterval(pollingInterval);
  if (countdownInterval) clearInterval(countdownInterval);
  
  showQRModal.value = true;
  paymentSuccess.value = false;
  isProcessingPayment.value = false;
  qrData.value = null;
  paymentStep.value = 'confirm';
};

const confirmAndGenerateQR = async () => {
  paymentStep.value = 'generating';
  isProcessingPayment.value = true;

  try {
    const debtIds = selectedDebts.value.map(p => p.id);
    const response = await api.post('/portal/payments/qr', {
      codigo: studentCode.value,
      debt_ids: debtIds
    });
    qrData.value = response.data;
    isProcessingPayment.value = false;
    paymentStep.value = 'qr';
    
    // Iniciar el sondeo (polling) para saber cuando pague
    startPolling(qrData.value.payment_id);
    
    // Iniciar la cuenta regresiva para el pago automático
    startAutoPayCountdown();
  } catch (error) {
    console.error("Error generando QR", error);
    showQRModal.value = false;
  }
};

const startAutoPayCountdown = () => {
  secondsLeft.value = 3;
  if (countdownInterval) clearInterval(countdownInterval);
  
  countdownInterval = setInterval(() => {
    secondsLeft.value -= 1;
    if (secondsLeft.value <= 0) {
      clearInterval(countdownInterval);
      simulateQRPayment();
    }
  }, 1000);
};

const startPolling = (paymentId: number) => {
  if (pollingInterval) clearInterval(pollingInterval);
  
  pollingInterval = setInterval(async () => {
    try {
      const response = await api.get(`/portal/payments/${paymentId}/status`);
      if (response.data.status === 'Completado' || response.data.status === 'Pagado') {
        clearInterval(pollingInterval);
        if (countdownInterval) clearInterval(countdownInterval);
        paymentSuccess.value = true;
        
        // Actualizar la tabla localmente para todas las deudas seleccionadas
        selectedDebts.value.forEach(selDebt => {
          const tablePension = pensiones.value.find(p => p.id === selDebt.id);
          if (tablePension) {
            tablePension.estado = 'pagado';
            tablePension.recibo = paymentId;
          }
        });
        
        selectedDebts.value = []; // Limpiar selección

        if (modalTimeout) clearTimeout(modalTimeout);
        modalTimeout = setTimeout(() => {
          showQRModal.value = false;
          paymentSuccess.value = false;
        }, 2000);
      }
    } catch (error) {
      console.error("Error en polling", error);
    }
  }, 3000);
};

const simulateQRPayment = async () => {
  if (!qrData.value) return;
  isProcessingPayment.value = true;
  try {
    // Simulamos que el banco manda el webhook
    await api.post('/banco/webhook', {
      transaction_id: qrData.value.transaction_id,
      status: 'Pagado'
    });
    // El polling lo detectará en un par de segundos
  } catch (error) {
    console.error("Error al simular pago", error);
    isProcessingPayment.value = false;
  }
};

// Limpiar intervalo si cierran el modal antes de pagar
const closeQRModal = () => {
  if (pollingInterval) clearInterval(pollingInterval);
  if (modalTimeout) clearTimeout(modalTimeout);
  if (countdownInterval) clearInterval(countdownInterval);
  showQRModal.value = false;
};

const isExportingEstado = ref(false);
const exportarEstadoCuenta = async () => {
  if (!studentInfo.value || !studentInfo.value.id) return;
  isExportingEstado.value = true;
  try {
    const response = await api.get(`/portal/reports/estado-cuenta/${studentInfo.value.id}?format=pdf`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `estado_cuenta_${studentCode.value}.pdf`);
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
</script>

<template>
  <main class="min-h-screen bg-slate-50 flex flex-col font-sans">
    
    <!-- Navbar Institucional Clásico -->
    <header class="bg-secondary text-white shadow-md border-b-4 border-primary z-10">
      <div class="w-full px-4 sm:px-6 md:px-12 lg:px-20 py-4 sm:py-5">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-4 text-left">
            <!-- Emblema Clásico (Logo) -->
            <div class="w-12 h-14 sm:w-14 sm:h-16 bg-white rounded-b-xl flex items-center justify-center shadow-inner border-b-2 border-primary overflow-hidden p-1.5 shrink-0">
              <img :src="logoUrl" alt="Logo Colegio" class="w-full h-full object-contain" />
            </div>
            <div>
              <h1 class="font-serif font-bold text-xl sm:text-2xl tracking-wide uppercase leading-tight">Colegio Central</h1>
              <p class="text-slate-300 text-[10px] sm:text-xs font-semibold tracking-widest uppercase">Portal de Padres</p>
            </div>
          </div>
          <RouterLink to="/login" class="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors border border-slate-600 hover:border-slate-400 px-4 py-2 sm:px-5 sm:py-2.5 rounded-sm w-full sm:w-auto text-center">
            Ingreso Administrativo
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Contenido Principal -->
    <div class="flex-1 flex flex-col items-center px-4 sm:px-6 w-full py-12">
      
      <!-- Panel de Búsqueda -->
      <div class="w-full max-w-2xl bg-white border border-slate-200 shadow-lg rounded-sm relative overflow-hidden transition-all duration-500" :class="showResults ? 'mb-8' : 'mt-12'">
        <!-- Borde superior decorativo -->
        <div class="h-1.5 w-full bg-primary"></div>
        
        <div class="p-8 sm:p-10">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-serif font-bold text-secondary mb-2">Consulta de Pensiones</h2>
            <p class="text-slate-600 text-sm">Ingrese el código institucional del estudiante para verificar el estado de cuenta y cuotas pendientes.</p>
          </div>

          <div class="space-y-6 animate-fade-in">
            <div class="space-y-1.5">
              <label for="codigo" class="block text-sm font-bold text-slate-700 uppercase tracking-wide">Código de Estudiante</label>
              <div class="relative">
                <input 
                  id="codigo"
                  v-model="studentCode" 
                  type="text" 
                  @keyup.enter="searchStudent"
                  class="block w-full px-4 py-3 border-2 border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-secondary transition-colors font-mono text-lg rounded-sm uppercase" 
                  placeholder="Ej: CC-2026-045"
                  :disabled="isSearching"
                >
              </div>
            </div>
            
            <button 
              @click="searchStudent"
              :disabled="!studentCode || isSearching"
              class="w-full bg-secondary hover:bg-secondary-dark disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold uppercase tracking-wider py-3.5 px-6 rounded-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg v-if="isSearching" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              {{ isSearching ? 'Buscando...' : 'Consultar Historial' }}
            </button>

            <!-- Mensaje de error -->
            <div v-if="searchError" class="mt-4 p-4 bg-red-50 border-l-4 border-primary text-primary text-sm font-bold flex items-center gap-3 animate-fade-in">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              {{ searchError }}
            </div>
            
            <div v-if="!showResults" class="mt-6 pt-6 border-t border-slate-100 text-center">
              <p class="text-xs text-slate-500">Si olvidó su código, por favor consulte la libreta de calificaciones o comuníquese con secretaría.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Skeleton de Carga -->
      <div v-if="isSearching" class="w-full max-w-4xl mt-8 animate-fade-in">
        <SkeletonLoader :rows="5" />
      </div>

      <!-- Resultados de la Simulación -->
      <div v-if="showResults" class="w-full max-w-4xl bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden animate-fade-in-up">
        
        <!-- Cabecera del Estudiante -->
        <div class="bg-slate-50 p-6 sm:p-8 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 class="text-xl font-bold text-slate-800">{{ studentInfo?.nombre }}</h3>
            <p class="text-slate-500 font-medium">{{ studentInfo?.curso }}</p>
            <p class="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Tutor: <span class="text-slate-600">{{ studentInfo?.tutor }}</span></p>
          </div>
          <div class="text-left sm:text-right flex flex-col items-start sm:items-end w-full sm:w-auto">
            <p class="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Código</p>
            <p class="text-lg font-mono font-bold text-secondary mb-3">{{ studentCode.toUpperCase() }}</p>
            <button 
              @click="exportarEstadoCuenta" 
              :disabled="isExportingEstado"
              class="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold text-primary border border-primary rounded-sm hover:bg-primary hover:text-white transition-colors w-full sm:w-auto"
            >
              <svg v-if="isExportingEstado" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              {{ isExportingEstado ? 'Generando...' : 'Descargar Estado de Cuenta' }}
            </button>
          </div>
        </div>

        <!-- Tabla de Estado de Cuenta -->
        <div class="p-0 sm:p-4 overflow-x-auto scrollbar-thin">
          <table class="w-full text-left border-collapse text-sm min-w-[650px] sm:min-w-0">
            <thead>
              <tr class="bg-white">
                <th class="px-6 py-4 font-bold text-slate-700 border-b-2 border-slate-200 w-12 text-center"></th>
                <th class="px-6 py-4 font-bold text-slate-700 border-b-2 border-slate-200 uppercase tracking-wide text-xs">Concepto / Mes</th>
                <th class="px-6 py-4 font-bold text-slate-700 border-b-2 border-slate-200 uppercase tracking-wide text-xs text-right">Monto (Bs.)</th>
                <th class="px-6 py-4 font-bold text-slate-700 border-b-2 border-slate-200 uppercase tracking-wide text-xs text-center">Estado</th>
                <th class="px-6 py-4 font-bold text-slate-700 border-b-2 border-slate-200 uppercase tracking-wide text-xs text-center">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              
              <!-- Filas Dinámicas -->
              <tr v-for="pension in pensiones" :key="pension.id" :class="[
                'transition-colors',
                pension.estado === 'vencido' ? 'bg-rose-50/50 hover:bg-rose-50' : (pension.estado === 'pendiente' ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-slate-50')
              ]">
                <td class="px-6 py-5 text-center">
                  <input 
                    type="checkbox" 
                    v-if="pension.estado === 'pendiente' || pension.estado === 'vencido'"
                    :checked="selectedDebts.some(p => p.id === pension.id)"
                    @change="toggleDebtSelection(pension)"
                    class="w-5 h-5 text-secondary border-slate-300 rounded focus:ring-secondary cursor-pointer"
                  />
                </td>
                <td class="px-6 py-5">
                  <p class="font-bold text-slate-800">Pensión {{ pension.mes }}</p>
                  <p :class="pension.estado === 'vencido' ? 'text-xs text-rose-600 font-bold' : (pension.estado === 'pendiente' ? 'text-xs text-amber-600 font-bold' : 'text-xs text-slate-500')">
                    {{ pension.estado === 'vencido' ? 'Venció:' : 'Vencimiento:' }} {{ pension.vencimiento }}
                  </p>
                </td>
                <td class="px-6 py-5 font-bold text-right" :class="pension.estado === 'vencido' ? 'text-rose-600' : (pension.estado === 'pendiente' ? 'text-amber-700' : 'text-slate-800')">
                  {{ pension.monto.toFixed(2) }}
                </td>
                <td class="px-6 py-5 text-center">
                  
                  <!-- Pagado -->
                  <span v-if="pension.estado === 'pagado'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    Pagado
                  </span>
                  
                  <!-- Pendiente -->
                  <span v-if="pension.estado === 'pendiente'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Pendiente
                  </span>

                  <!-- Vencido -->
                  <span v-if="pension.estado === 'vencido'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 shadow-sm animate-pulse">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Vencido
                  </span>

                  <!-- Próximo -->
                  <span v-if="pension.estado === 'proximo'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                    Aún no vence
                  </span>

                </td>
                <td class="px-6 py-5 text-center">
                  
                  <button v-if="pension.estado === 'pagado'" @click="openReceipt(pension)" class="text-xs font-bold text-secondary hover:underline">
                    Ver Recibo
                  </button>

                  <span v-if="pension.estado === 'pendiente' || pension.estado === 'vencido'" class="text-xs text-slate-400">
                    Seleccionar
                  </span>

                  <span v-if="pension.estado === 'proximo'" class="text-xs text-slate-400 font-medium">
                    No disponible
                  </span>

                </td>
              </tr>

            </tbody>
          </table>
        </div>
        
        <!-- Pagar Cuotas Seleccionadas -->
        <div v-if="selectedDebts.length > 0" class="bg-slate-50 p-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in-up w-full">
          <div class="text-center sm:text-left w-full sm:w-auto">
            <p class="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total a Pagar ({{ selectedDebts.length }} cuotas)</p>
            <p class="text-2xl sm:text-3xl font-bold text-slate-800">Bs. {{ totalSelectedAmount.toFixed(2) }}</p>
          </div>
          <button @click="openQR()" class="bg-secondary hover:bg-secondary-dark text-white font-bold py-3.5 px-8 rounded-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm w-full sm:w-auto">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
            Generar QR de Pago
          </button>
        </div>
      </div>
    </div>
    
    <!-- Footer Institucional -->
    <footer class="bg-slate-100 border-t border-slate-200 py-6 text-center mt-auto">
      <p class="text-xs text-slate-500 font-serif">© 2026 Unidad Educativa Colegio Central. Todos los derechos reservados.</p>
    </footer>
    <!-- Modales -->
    
    <!-- Modal Recibo -->
    <div v-if="showReceiptModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-sm shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-fade-in-up">
        
        <div class="bg-slate-100 border-b border-slate-200 p-4 flex justify-between items-center">
          <h3 class="font-bold text-slate-700 flex items-center gap-2">
            <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Comprobante de Pago
          </h3>
          <button @click="showReceiptModal = false" class="text-slate-400 hover:text-slate-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
          <div v-if="isLoadingReceipt" class="p-8 text-center">
            <svg class="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p class="text-slate-500">Cargando comprobante...</p>
          </div>
          
          <div v-else-if="receiptData" class="p-8">
            <div class="text-center mb-6">
              <h4 class="font-serif font-bold text-xl uppercase tracking-widest text-secondary">Colegio Central</h4>
              <p class="text-xs text-slate-500 uppercase tracking-widest mt-1">Comprobante de Pago</p>
            </div>
            
            <div class="border-2 border-dashed border-slate-200 p-6 bg-slate-50 relative">
              <div class="absolute -top-3 -right-3 bg-emerald-100 text-emerald-700 border border-emerald-300 transform rotate-12 px-3 py-1 text-xs font-bold uppercase tracking-widest shadow-sm">
                Pagado
              </div>
              
              <div class="space-y-4 text-sm text-slate-700">
                <div class="flex justify-between border-b border-slate-200 pb-2">
                  <span class="font-bold">Nro. Recibo:</span>
                  <span class="font-mono font-bold">{{ receiptData.recibo_id }}</span>
                </div>
                <div class="flex justify-between border-b border-slate-200 pb-2">
                  <span class="font-bold">Fecha de Pago:</span>
                  <span>{{ receiptData.fecha_pago }}</span>
                </div>
                <div class="flex justify-between border-b border-slate-200 pb-2">
                  <span class="font-bold">Estudiante:</span>
                  <span class="uppercase text-right">{{ receiptData.estudiante }} <br> <span class="text-xs text-slate-500 font-normal">{{ receiptData.curso }}</span></span>
                </div>
                <div class="flex justify-between border-b border-slate-200 pb-2">
                  <span class="font-bold">Método de Pago:</span>
                  <span class="uppercase text-right">{{ receiptData.metodo }}</span>
                </div>
                
                <div class="border-b border-slate-200 pb-2">
                  <span class="font-bold block mb-2">Conceptos Abonados:</span>
                  <ul class="space-y-1">
                    <li v-for="concepto in receiptData.conceptos" :key="concepto.id" class="flex justify-between text-xs">
                      <span>Pensión {{ concepto.mes }}</span>
                      <span>Bs. {{ Number(concepto.monto).toFixed(2) }}</span>
                    </li>
                  </ul>
                </div>
                
                <div class="flex justify-between border-b border-slate-200 pb-2">
                  <span class="font-bold">Total Pagado:</span>
                  <span class="font-bold text-lg text-primary">Bs. {{ Number(receiptData.monto_total).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          
          <div class="mt-8 flex justify-center">
            <button @click="showReceiptModal = false" class="px-6 py-2 border border-slate-300 text-slate-600 font-bold uppercase text-xs hover:bg-slate-50 transition-colors">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Pagar QR -->
    <div v-if="showQRModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-sm shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden animate-fade-in-up">
        
        <div class="bg-primary border-b border-primary-dark p-4 flex justify-between items-center text-white">
          <h3 class="font-bold flex items-center gap-2">
            <svg v-if="paymentStep === 'confirm'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
            {{ paymentStep === 'confirm' ? 'Confirmación de Pago' : 'Pago Fácil con QR' }}
          </h3>
          <button @click="closeQRModal" :disabled="paymentSuccess" class="text-white/70 hover:text-white disabled:opacity-50">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <!-- Vista 1: Confirmación de Detalles -->
        <div v-if="paymentStep === 'confirm'" class="p-6 flex flex-col animate-fade-in">
          <div class="text-center mb-4">
            <h4 class="font-bold text-slate-800 text-lg">Resumen de Cuotas</h4>
            <p class="text-sm text-slate-500">Por favor confirme los detalles antes de generar el código QR.</p>
          </div>

          <div class="bg-slate-50 rounded-lg p-4 border border-slate-100 mb-6 text-left space-y-3">
            <div class="flex justify-between text-sm border-b border-slate-200/60 pb-2">
              <span class="text-slate-500 font-medium">Estudiante:</span>
              <span class="font-bold text-slate-800 uppercase">{{ studentInfo?.nombre }} {{ studentInfo?.apellidos }}</span>
            </div>
            
            <div class="max-h-36 overflow-y-auto space-y-2 pr-1">
              <div v-for="debt in selectedDebts" :key="debt.id" class="flex justify-between text-xs text-slate-600 bg-white p-2 border border-slate-100 rounded">
                <span>Pensión - <strong class="uppercase">{{ debt.mes }}</strong></span>
                <span class="font-mono font-bold text-slate-800">Bs. {{ debt.monto.toFixed(2) }}</span>
              </div>
            </div>

            <div class="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-slate-800">
              <span>Total a pagar:</span>
              <span class="text-xl text-primary font-bold">Bs. {{ totalSelectedAmount.toFixed(2) }}</span>
            </div>
          </div>

          <div class="bg-amber-50 border border-amber-200 rounded p-3 mb-6 flex gap-2.5 items-start text-left text-amber-800 text-xs">
            <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <div>
              <p class="font-bold mb-0.5">¿Estás seguro de realizar este pago?</p>
              <p class="text-amber-700 leading-normal">Al presionar el botón de confirmación se generará el código QR de pago único. Verifique los meses seleccionados.</p>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <button 
              @click="confirmAndGenerateQR"
              class="w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-3 rounded transition-colors text-sm uppercase tracking-wide flex justify-center items-center gap-2 shadow"
            >
              Sí, Confirmar y Generar QR
            </button>
            <button 
              @click="closeQRModal"
              class="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded transition-colors text-sm uppercase tracking-wide"
            >
              Cancelar
            </button>
          </div>
        </div>

        <!-- Vista 2: Generando QR -->
        <div v-else-if="paymentStep === 'generating'" class="p-8 flex flex-col items-center justify-center text-center min-h-[350px] animate-fade-in">
          <svg class="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <h4 class="font-bold text-slate-800 mb-1">Generando Código QR</h4>
          <p class="text-sm text-slate-500">Por favor espere un momento mientras se crea la orden de pago...</p>
        </div>

        <!-- Vista 3: QR Generado y Cuenta Regresiva -->
        <div v-else-if="paymentStep === 'qr'" class="p-8 flex flex-col items-center text-center animate-fade-in">
          <h4 class="font-bold text-slate-800 mb-1">Pago de {{ selectedDebts.length }} Cuotas</h4>
          <p class="text-sm text-slate-500 mb-6">Escanea el código con tu aplicación bancaria.</p>

          <!-- Simulación del QR -->
          <div class="bg-white p-4 border-2 border-slate-200 rounded-lg shadow-sm mb-4 relative">
            <div v-if="isProcessingPayment || paymentSuccess" class="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg animate-fade-in">
              <template v-if="isProcessingPayment">
                <svg class="animate-spin h-10 w-10 text-primary mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p class="text-xs font-bold text-primary uppercase tracking-wide">
                  Procesando Pago...
                </p>
              </template>

              <template v-else-if="paymentSuccess">
                <div class="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3 animate-fade-in-up">
                  <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <p class="text-xs font-bold text-emerald-700 uppercase tracking-wide">¡Pago Exitoso!</p>
              </template>
            </div>
            
            <!-- Patrón QR genérico con SVG simple -->
            <svg class="w-48 h-48" viewBox="0 0 100 100" fill="currentColor">
              <path d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10z" class="text-slate-800"/>
              <path d="M40 0h20v10H40zM50 20h10v20H50zM40 40h20v20H40zM0 40h20v10H0zM20 50h10v20H20zM70 40h30v10H70zM80 60h20v20H80zM40 70h20v10H40zM50 90h20v10H50zM80 90h20v10H80zM70 70h10v10H70z" class="text-slate-800"/>
              <rect x="42" y="42" width="16" height="16" rx="3" class="text-primary"/>
            </svg>
          </div>

          <p class="text-2xl font-bold text-slate-800 mb-4">Bs. {{ totalSelectedAmount.toFixed(2) }}</p>
          
          <div v-if="qrData" class="w-full space-y-3">
            <p class="text-xs text-slate-500">Transacción: <span class="font-mono font-bold text-slate-700">{{ qrData.transaction_id }}</span></p>
            
            <!-- Estado Autopay -->
            <div class="bg-blue-50 border border-blue-200 rounded p-2.5 text-xs text-blue-700 flex justify-center items-center gap-2">
              <svg class="animate-spin h-3.5 w-3.5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>El pago se confirmará automáticamente en <strong>{{ secondsLeft }}s</strong>...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
