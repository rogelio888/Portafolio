<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../api/axios';
import SkeletonLoader from '../components/SkeletonLoader.vue';

interface Moroso {
  id: number;
  codigo: string;
  nombre: string;
  curso: string;
  tutor: string;
  celular: string;
  cuotasMora: number;
  montoDeuda: number;
}

interface Cuota {
  id: number;
  mes: string;
  nombre: string;
  monto: number;
  vencimiento: string | null;
  estado: string;
  recibo: string | null;
}

const morosos = ref<Moroso[]>([]);
const filterCurso = ref('');
const isRefreshing = ref(false);
const isLoading = ref(true);

const showDetailsModal = ref(false);
const selectedStudent = ref<Moroso | null>(null);
const selectedStudentDebts = ref<Cuota[]>([]);
const isLoadingDebts = ref(false);

// Toast Notification
const toast = ref({ show: false, message: '', type: 'success' });
const showToast = (message: string, type: string = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
};

const filteredMorosos = computed(() => {
  if (!filterCurso.value) return morosos.value;
  return morosos.value.filter(m => m.curso.includes(filterCurso.value));
});

const fetchMorosos = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/morosos');
    morosos.value = response.data;
  } catch (error) {
    console.error('Error fetching morosos:', error);
    showToast('Error al cargar la lista de morosos.', 'error');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchMorosos();
});

const forzarVerificacion = async () => {
  isRefreshing.value = true;
  try {
    const response = await api.post('/morosos/force-check');
    showToast(response.data.message || 'Verificación completada.');
    await fetchMorosos();
  } catch (error) {
    console.error('Error forcing check:', error);
    showToast('Error al verificar morosos.', 'error');
  } finally {
    isRefreshing.value = false;
  }
};

const openDetails = async (student: Moroso) => {
  selectedStudent.value = student;
  showDetailsModal.value = true;
  isLoadingDebts.value = true;
  try {
    const response = await api.get(`/students/${student.id}/debts`);
    selectedStudentDebts.value = response.data;
  } catch (error) {
    console.error('Error fetching student debts:', error);
    showToast('Error al cargar detalle de deudas.', 'error');
  } finally {
    isLoadingDebts.value = false;
  }
};

const closeDetails = () => {
  showDetailsModal.value = false;
  selectedStudent.value = null;
  selectedStudentDebts.value = [];
};

const isExporting = ref(false);
const exportToPDF = async () => {
  isExporting.value = true;
  try {
    const response = await api.get('/reports/morosidad?format=pdf', {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_morosidad.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    showToast('Reporte de Morosidad descargado exitosamente.');
  } catch (error) {
    console.error("Error al exportar", error);
    showToast('Error al descargar el reporte.', 'error');
  } finally {
    isExporting.value = false;
  }
};

const imprimirLista = () => {
  let html = `
    <html>
      <head>
        <title>Reporte de Morosos - Colegio Central</title>
        <style>
          @page { margin: 15mm; }
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; background: #fff; margin: 0; }
          .header-container { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; }
          .title-area h1 { color: #E3000F; margin: 0 0 5px 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px; }
          .title-area h2 { color: #64748b; font-size: 13px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
          .meta-info { text-align: right; font-size: 11px; color: #64748b; line-height: 1.5; }
          .meta-info strong { color: #334155; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #f8fafc; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; padding: 12px 10px; border-bottom: 2px solid #cbd5e1; text-align: left; }
          td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #334155; vertical-align: middle; }
          tbody tr:nth-child(even) { background-color: #f8fafc; }
          
          .student-name { font-weight: 700; color: #0f172a; font-size: 13px; margin-bottom: 2px; display: block; }
          .tutor-name { font-weight: 600; color: #334155; }
          .meta { font-size: 10px; color: #64748b; }
          .amount { color: #E3000F; font-weight: 800; font-size: 13px; text-align: right; }
          .badge { display: inline-block; background: #fee2e2; color: #991b1b; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; border: 1px solid #fecaca; }
          
          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div class="title-area">
            <h1>Colegio Central</h1>
            <h2>Reporte de Morosidad ${filterCurso.value ? '| ' + filterCurso.value : ''}</h2>
          </div>
          <div class="meta-info">
            <strong>Fecha de Emisión:</strong><br>
            ${new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
            Hora: ${new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Estudiante / Código</th>
              <th>Curso</th>
              <th>Tutor / Contacto</th>
              <th>Estado de Mora</th>
              <th style="text-align: right;">Deuda Total</th>
            </tr>
          </thead>
          <tbody>
  `;

  filteredMorosos.value.forEach(m => {
    html += `
      <tr>
        <td>
          <span class="student-name">${m.nombre}</span>
          <span class="meta">${m.codigo}</span>
        </td>
        <td><strong>${m.curso}</strong></td>
        <td>
          <span class="tutor-name">${m.tutor}</span><br>
          <span class="meta">Tel: ${m.celular}</span>
        </td>
        <td><span class="badge">${m.cuotasMora} cuota(s) vencida(s)</span></td>
        <td class="amount">${parseFloat(m.montoDeuda.toString()).toFixed(2)} Bs</td>
      </tr>
    `;
  });

  html += `
          </tbody>
        </table>
        <div class="footer">
          Documento generado por el Sistema de Administración Colegio Central. Uso exclusivo institucional.
        </div>
      </body>
    </html>
  `;

  // Crear un iframe invisible para no cambiar de pestaña ni abrir pop-ups
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  if (iframe.contentWindow) {
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(html);
    iframe.contentWindow.document.close();
    
    // Esperar un poco a que cargue el contenido y lanzar impresión
    setTimeout(() => {
      iframe.contentWindow?.print();
      
      // Limpiar el iframe después de que el diálogo de impresión se cierre
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 500);
    }, 250);
  }
};

onMounted(() => {
  fetchMorosos();
});
</script>

<template>
  <div class="animate-fade-in max-w-6xl mx-auto space-y-6">
    
    <!-- Toast Notification -->
    <div v-if="toast.show" class="fixed top-20 right-8 px-5 py-3 rounded-sm shadow-xl flex items-center gap-3 z-50 animate-fade-in" :class="toast.type === 'success' ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800' : 'bg-rose-50 border-l-4 border-rose-500 text-rose-800'">
      <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" :class="toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'">
        <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <div>
        <p class="font-bold text-sm">{{ toast.type === 'success' ? 'Éxito' : 'Atención' }}</p>
        <p class="text-xs" :class="toast.type === 'success' ? 'text-emerald-600' : 'text-rose-600'">{{ toast.message }}</p>
      </div>
    </div>

    <!-- Cabecera -->
    <div class="bg-white p-6 border border-slate-200 rounded-sm shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 border-t-4 border-t-rose-500">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-rose-50 text-rose-600 flex items-center justify-center rounded-sm">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-800">Control de Morosidad</h2>
          <p class="text-sm text-slate-500">Monitoreo de estudiantes con cuotas vencidas.</p>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto print:hidden">
        <select v-model="filterCurso" class="px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary bg-white text-slate-600">
          <option value="">Todos los cursos</option>
          <option value="1ro Primaria">1ro Primaria</option>
          <option value="2do Primaria">2do Primaria</option>
          <option value="5to Secundaria">5to Secundaria</option>
        </select>
        <button 
          @click="imprimirLista" 
          class="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-medium py-2 px-4 rounded-sm transition-colors text-sm flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Imprimir Lista
        </button>
        <button 
          @click="exportToPDF" 
          :disabled="isExporting"
          class="bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-4 rounded-sm transition-colors text-sm flex items-center gap-2 disabled:bg-rose-400"
        >
          <svg v-if="isExporting" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Descargar PDF
        </button>
        <button 
          @click="forzarVerificacion" 
          :disabled="isRefreshing"
          class="bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 px-4 rounded-sm transition-colors text-sm flex items-center gap-2 disabled:bg-slate-400"
        >
          <svg v-if="isRefreshing" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Actualizar Morosos
        </button>
      </div>
    </div>

    <!-- Skeleton de Carga -->
    <div v-if="isLoading" class="mt-8 animate-fade-in">
      <SkeletonLoader :rows="8" />
    </div>

    <!-- Contenido Principal -->
    <div v-else class="space-y-6 animate-fade-in-up">
      <!-- Indicadores -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white border border-slate-200 rounded-sm p-4 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 bg-slate-100 text-slate-500 flex items-center justify-center rounded-sm text-xl font-bold">
          {{ filteredMorosos.length }}
        </div>
        <div>
          <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">Estudiantes en Mora</p>
          <p class="text-lg font-bold text-slate-800 mt-0.5">En lista actual</p>
        </div>
      </div>
      <div class="bg-white border border-slate-200 rounded-sm p-4 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 bg-rose-50 text-rose-600 flex items-center justify-center rounded-sm text-xl font-bold">
          Bs
        </div>
        <div>
          <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">Cartera en Mora</p>
          <p class="text-lg font-bold text-slate-800 mt-0.5 font-mono">Bs. {{ filteredMorosos.reduce((acc, curr) => acc + curr.montoDeuda, 0).toFixed(2) }}</p>
        </div>
      </div>
    </div>

    <!-- Tabla de Morosos -->
    <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden print:border-none print:shadow-none">
      <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-slate-600 min-w-[720px] print:min-w-0">
        <thead class="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
          <tr>
            <th class="px-5 py-3">Estudiante (Código)</th>
            <th class="px-5 py-3">Curso</th>
            <th class="px-5 py-3 text-center">Cuotas Vencidas</th>
            <th class="px-5 py-3 text-right">Deuda Total</th>
            <th class="px-5 py-3">Contacto</th>
            <th class="px-5 py-3 text-right print:hidden">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="m in filteredMorosos" :key="m.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-5 py-4">
              <p class="font-bold text-slate-800">{{ m.nombre }}</p>
              <p class="text-[11px] text-slate-500 uppercase tracking-widest mt-0.5 font-mono">{{ m.codigo }}</p>
            </td>
            <td class="px-5 py-4 font-medium text-slate-700">
              {{ m.curso }}
            </td>
            <td class="px-5 py-4 text-center">
              <span class="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-sm whitespace-nowrap">
                {{ m.cuotasMora }} meses
              </span>
            </td>
            <td class="px-5 py-4 text-right font-mono font-bold text-rose-700 whitespace-nowrap">
              Bs. {{ Number(m.montoDeuda).toFixed(2) }}
            </td>
            <td class="px-5 py-4">
              <p class="text-xs font-bold text-slate-700">{{ m.tutor }} ({{ m.celular }})</p>
            </td>
            <td class="px-5 py-4 text-right print:hidden">
              <button 
                @click="openDetails(m)"
                class="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-sm transition-colors flex items-center justify-end gap-2 ml-auto"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                Ver Detalle
              </button>
            </td>
          </tr>
          <tr v-if="filteredMorosos.length === 0">
            <td colspan="6" class="px-5 py-8 text-center text-slate-500 text-sm">
              No se encontraron estudiantes en mora para este filtro.
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
    </div>

    <!-- Modal Detalles -->
    <div v-if="showDetailsModal && selectedStudent" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in print:hidden">
      <div class="bg-white rounded-sm shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        <!-- Header -->
        <div class="bg-slate-800 p-4 flex justify-between items-center text-white border-b-4 border-slate-900">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-slate-700 rounded-sm flex items-center justify-center">
              <svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <div>
              <h3 class="font-bold text-sm leading-tight">{{ selectedStudent.nombre }}</h3>
              <p class="text-xs text-slate-400 font-mono mt-0.5">{{ selectedStudent.codigo }} | {{ selectedStudent.curso }}</p>
            </div>
          </div>
          <button @click="closeDetails" class="text-slate-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="p-5 flex-1 overflow-y-auto bg-slate-50">
          
          <!-- Tutor Info -->
          <div class="bg-white p-4 border border-slate-200 rounded-sm mb-5 flex items-center gap-4">
            <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            </div>
            <div>
              <p class="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Tutor Responsable</p>
              <p class="text-sm font-bold text-slate-800">{{ selectedStudent.tutor }} <span class="font-normal text-slate-500">({{ selectedStudent.celular }})</span></p>
            </div>
          </div>

          <h4 class="text-sm font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">Estado de Cuenta Completo</h4>
          
          <div v-if="isLoadingDebts" class="py-8 flex justify-center">
            <svg class="animate-spin h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
          
          <div v-else class="space-y-2">
            <div 
              v-for="cuota in selectedStudentDebts" 
              :key="cuota.id" 
              class="flex items-center justify-between p-3 border rounded-sm bg-white shadow-sm"
              :class="{
                'border-rose-200': cuota.estado === 'Mora' || cuota.estado === 'Vencido',
                'border-emerald-200': cuota.estado === 'Pagado',
                'border-slate-200': cuota.estado === 'Pendiente'
              }"
            >
              <div class="flex items-center gap-3">
                <div 
                  class="w-2 h-10 rounded-full"
                  :class="{
                    'bg-rose-500': cuota.estado === 'Mora' || cuota.estado === 'Vencido',
                    'bg-emerald-500': cuota.estado === 'Pagado',
                    'bg-slate-300': cuota.estado === 'Pendiente'
                  }"
                ></div>
                <div>
                  <p class="font-bold text-sm text-slate-800">{{ cuota.nombre }} <span class="text-slate-400 font-normal">({{ cuota.mes }})</span></p>
                  <p class="text-[11px] text-slate-500" v-if="cuota.vencimiento">Vence: {{ cuota.vencimiento }}</p>
                  <p class="text-[11px] text-slate-500" v-else>Sin vencimiento</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-mono font-bold text-slate-800 text-sm">Bs. {{ cuota.monto.toFixed(2) }}</p>
                <div>
                  <span v-if="cuota.estado === 'Pagado'" class="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
                    Pagado <span v-if="cuota.recibo">(Nº {{ cuota.recibo }})</span>
                  </span>
                  <span v-else-if="cuota.estado === 'Mora' || cuota.estado === 'Vencido'" class="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-sm">
                    Vencido / En Mora
                  </span>
                  <span v-else class="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                    Pendiente
                  </span>
                </div>
              </div>
            </div>
            
            <div v-if="selectedStudentDebts.length === 0" class="text-center py-4 text-slate-500 text-sm">
              No hay cuotas registradas para este estudiante.
            </div>
          </div>

        </div>
        <div class="bg-white p-4 border-t border-slate-200 flex justify-end">
          <button @click="closeDetails" class="px-5 py-2 border border-slate-300 text-slate-700 font-bold text-sm rounded-sm hover:bg-slate-50 transition-colors">Cerrar</button>
        </div>
      </div>
    </div>

  </div>
</template>
