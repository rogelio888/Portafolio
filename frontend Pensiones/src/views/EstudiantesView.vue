<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import api from '../api/axios';

const activeTab = ref('estudiantes');
const isLoading = ref(true);

const estudiantes = ref<any[]>([]);
const cursos = ref<any[]>([]);

const estudiantesFiltro = ref('Activos');

const estudiantesFiltrados = computed(() => {
  return estudiantes.value.filter(e => {
    return estudiantesFiltro.value === 'Activos' ? (e.estado === 'Activo' || e.estado === 'Moroso') : e.estado === 'Retirado';
  });
});

const fetchDatos = async () => {
  isLoading.value = true;
  try {
    const [resEstudiantes, resCursos] = await Promise.all([
      api.get('/students'),
      api.get('/courses')
    ]);
    estudiantes.value = resEstudiantes.data;
    cursos.value = resCursos.data;
  } catch (error) {
    console.error('Error cargando estudiantes y cursos', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDatos();
});

const showEstudianteModal = ref(false);
const showCursoModal = ref(false);
const showFichaModal = ref(false);
const showListaCursoModal = ref(false);

const selectedEstudiante = ref<any>(null);
const selectedCurso = ref<any>(null);

const newEstudiante = ref({
  first_name: '',
  last_name: '',
  ci: '',
  course_id: '',
  apoderado: '',
  ciApoderado: '',
  celular: ''
});

const editingEstudianteId = ref<number | null>(null);

const abrirEditarEstudiante = (est: any) => {
  editingEstudianteId.value = est.id;
  newEstudiante.value = {
    first_name: est.first_name,
    last_name: est.last_name,
    ci: est.ci,
    course_id: est.curso_id,
    apoderado: est.apoderado === 'Sin Asignar' ? '' : est.apoderado,
    ciApoderado: est.guardian_ci || '',
    celular: est.celular === 'Sin Número' ? '' : est.celular
  };
  errorMessage.value = '';
  showEstudianteModal.value = true;
};

const abrirNuevoEstudiante = () => {
  editingEstudianteId.value = null;
  newEstudiante.value = { first_name: '', last_name: '', ci: '', course_id: '', apoderado: '', ciApoderado: '', celular: '' };
  errorMessage.value = '';
  showEstudianteModal.value = true;
};

const errorMessage = ref('');
const errorCursoMessage = ref('');

const newCurso = ref({
  nivel: 'Primaria',
  grado: '',
  paralelo: ''
});

const isSaving = ref(false);

const inscribirAlumno = async () => {
  if (!newEstudiante.value.first_name || !newEstudiante.value.course_id) return;
  isSaving.value = true;
  try {
    const payload = {
      first_name: newEstudiante.value.first_name,
      last_name: newEstudiante.value.last_name,
      ci: newEstudiante.value.ci,
      course_id: newEstudiante.value.course_id,
      guardian_name: newEstudiante.value.apoderado,
      guardian_ci: newEstudiante.value.ciApoderado,
      phone: newEstudiante.value.celular
    };
    if (editingEstudianteId.value) {
      await api.put(`/students/${editingEstudianteId.value}`, payload);
    } else {
      await api.post('/students', payload);
    }
    await fetchDatos(); // Recargar la lista
    showEstudianteModal.value = false;
    newEstudiante.value = { first_name: '', last_name: '', ci: '', course_id: '', apoderado: '', ciApoderado: '', celular: '' };
    editingEstudianteId.value = null;
  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      errorMessage.value = error.response.data.message || 'Por favor revisa los datos ingresados.';
    } else {
      errorMessage.value = 'Ocurrió un error inesperado al guardar el estudiante.';
    }
    console.error('Error al inscribir/editar alumno', error);
  } finally {
    isSaving.value = false;
  }
};

const guardarCurso = async () => {
  if (!newCurso.value.grado || !newCurso.value.nivel) return;
  isSaving.value = true;
  try {
    const payload = {
      level: newCurso.value.nivel,
      grade: newCurso.value.grado,
      parallel: newCurso.value.paralelo.toUpperCase(),
      shift: 'Mañana'
    };
    await api.post('/courses', payload);
    await fetchDatos();
    showCursoModal.value = false;
    newCurso.value = { nivel: 'Primaria', grado: '', paralelo: '' };
    errorCursoMessage.value = '';
  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      errorCursoMessage.value = error.response.data.message || 'Error de validación.';
    } else {
      errorCursoMessage.value = 'Ocurrió un error inesperado al guardar el curso.';
    }
    console.error('Error al guardar curso', error);
  } finally {
    isSaving.value = false;
  }
};

const showDeleteCursoModal = ref(false);
const cursoParaEliminar = ref<any>(null);
const deleteCursoErrorMessage = ref('');

const confirmarEliminarCurso = (curso: any) => {
  cursoParaEliminar.value = curso;
  deleteCursoErrorMessage.value = '';
  showDeleteCursoModal.value = true;
};

const ejecutarEliminarCurso = async () => {
  if (!cursoParaEliminar.value) return;
  
  try {
    isSaving.value = true;
    await api.delete(`/courses/${cursoParaEliminar.value.id}`);
    await fetchDatos();
    showDeleteCursoModal.value = false;
    cursoParaEliminar.value = null;
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      deleteCursoErrorMessage.value = error.response.data.message;
    } else {
      deleteCursoErrorMessage.value = 'Error inesperado al eliminar el curso.';
    }
    console.error('Error al eliminar curso', error);
  } finally {
    isSaving.value = false;
  }
};

const isUpdatingStatusId = ref<number | null>(null);
const showBajaModal = ref(false);
const estudianteParaBaja = ref<any>(null);

const confirmarBaja = (est: any) => {
  estudianteParaBaja.value = est;
  showBajaModal.value = true;
};

const darDeBaja = async () => {
  if (!estudianteParaBaja.value) return;
  const est = estudianteParaBaja.value;
  isUpdatingStatusId.value = est.id;
  try {
    await api.put(`/students/${est.id}`, { status: 'Retirado' });
    est.estado = 'Retirado';
  } catch (error) {
    console.error('Error al dar de baja', error);
  } finally {
    isUpdatingStatusId.value = null;
    showBajaModal.value = false;
    estudianteParaBaja.value = null;
  }
};

const abrirFicha = (est: any) => {
  selectedEstudiante.value = est;
  showFichaModal.value = true;
};

const abrirListaCurso = (curso: any) => {
  selectedCurso.value = curso;
  showListaCursoModal.value = true;
};
const imprimirFicha = () => {
  window.print();
};
</script>



<template>
  <div>
    <div class="animate-fade-in max-w-6xl mx-auto space-y-6 print:hidden">
    
    <!-- Pestañas de Navegación -->
    <div class="border-b border-slate-200 bg-white px-2 pt-2 shadow-sm rounded-t-sm flex gap-6">
      <button 
        @click="activeTab = 'estudiantes'"
        :class="[activeTab === 'estudiantes' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300', 'pb-3 px-4 border-b-2 transition-colors uppercase tracking-wide text-xs']"
      >
        Gestor de Estudiantes
      </button>
      <button 
        @click="activeTab = 'cursos'"
        :class="[activeTab === 'cursos' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300', 'pb-3 px-4 border-b-2 transition-colors uppercase tracking-wide text-xs']"
      >
        Estructura de Cursos
      </button>
    </div>

    <!-- VISTA ESTUDIANTES -->
    <div v-if="activeTab === 'estudiantes'" class="space-y-4 animate-fade-in">
      <div class="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-sm shadow-sm">
        <div class="flex items-center gap-2 w-1/2">
          <div class="relative w-full">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder="Buscar por Nombre, CI o Código FA..." class="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
          </div>
          <select class="px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary bg-white text-slate-600">
            <option value="">Todos los cursos</option>
            <option value="1">1ro Primaria - A</option>
            <option value="2">5to Secundaria - A</option>
          </select>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex bg-slate-100 p-1 rounded-sm border border-slate-200">
            <button @click="estudiantesFiltro = 'Activos'" :class="['px-4 py-1.5 text-xs font-bold uppercase rounded-sm transition-colors', estudiantesFiltro === 'Activos' ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200' : 'text-slate-500 hover:text-slate-700']">Activos</button>
            <button @click="estudiantesFiltro = 'Retirados'" :class="['px-4 py-1.5 text-xs font-bold uppercase rounded-sm transition-colors', estudiantesFiltro === 'Retirados' ? 'bg-white text-rose-700 shadow-sm border border-rose-200' : 'text-slate-500 hover:text-slate-700']">Retirados</button>
          </div>
          <button @click="abrirNuevoEstudiante" class="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-sm transition-colors text-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Inscribir Alumno
          </button>
        </div>
      </div>

      <!-- Tabla de Estudiantes -->
      <SkeletonLoader v-if="isLoading" :rows="5" />
      <div v-else class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-700">
            <tr>
              <th class="px-5 py-3">Código FA</th>
              <th class="px-5 py-3">Estudiante (CI)</th>
              <th class="px-5 py-3">Curso</th>
              <th class="px-5 py-3">Tutor / Apoderado</th>
              <th class="px-5 py-3">Estado</th>
              <th class="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="est in estudiantesFiltrados" :key="est.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-5 py-4 font-mono text-xs font-bold text-slate-700">
                {{ est.codigo }}
              </td>
              <td class="px-5 py-4">
                <p class="font-bold text-slate-800">{{ est.nombre }}</p>
                <p class="text-[11px] text-slate-500 uppercase tracking-widest mt-0.5">CI: {{ est.ci }}</p>
              </td>
              <td class="px-5 py-4 font-medium text-slate-700">
                {{ est.curso }}
              </td>
              <td class="px-5 py-4">
                <p class="font-medium text-slate-700">{{ est.apoderado }}</p>
                <p class="text-[11px] text-slate-500 mt-0.5">Telf: {{ est.celular }}</p>
              </td>
              <td class="px-5 py-4">
                <span v-if="est.estado === 'Activo'" class="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Activo</span>
                <span v-else-if="est.estado === 'Moroso'" class="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Moroso</span>
                <span v-else class="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">Retirado</span>
              </td>
              <td class="px-5 py-4 text-right">
                <button @click="abrirEditarEstudiante(est)" class="text-indigo-600 hover:text-indigo-800 transition-colors text-xs font-bold uppercase mr-3">Editar</button>
                <button @click="abrirFicha(est)" class="text-secondary hover:text-primary transition-colors text-xs font-bold uppercase mr-3">Ficha</button>
                <button v-if="est.estado === 'Activo' || est.estado === 'Moroso'" @click="confirmarBaja(est)" :disabled="isUpdatingStatusId === est.id" :class="['transition-colors text-xs font-bold uppercase', isUpdatingStatusId === est.id ? 'text-slate-400 cursor-not-allowed' : 'text-rose-600 hover:text-rose-800']">
                  {{ isUpdatingStatusId === est.id ? 'Cargando...' : 'Dar de Baja' }}
                </button>
              </td>
            </tr>
            <tr v-if="estudiantesFiltrados.length === 0">
              <td colspan="6" class="px-5 py-12 text-center text-slate-500 font-medium">No se encontraron estudiantes en esta categoría.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- VISTA CURSOS -->
    <div v-if="activeTab === 'cursos'" class="space-y-4 animate-fade-in">
      <div class="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-sm shadow-sm">
        <h3 class="font-bold text-slate-800 flex items-center gap-2">
          <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          Estructura Académica Actual
        </h3>
        <button @click="showCursoModal = true" class="bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 px-4 rounded-sm transition-colors text-sm flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Nuevo Curso
        </button>
      </div>

      <SkeletonLoader v-if="isLoading" :rows="3" />
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="curso in cursos" :key="curso.id" class="bg-white border border-slate-200 rounded-sm p-5 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-xs text-secondary font-bold uppercase tracking-widest">{{ curso.nivel }}</p>
              <h4 class="text-xl font-bold text-slate-800 mt-1">{{ curso.grado }} - Paralelo {{ curso.paralelo }}</h4>
            </div>
            <div class="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 font-bold">
              {{ curso.alumnosCount }}
            </div>
          </div>
          <div class="border-t border-slate-100 pt-4 flex justify-between items-center">
            <p class="text-xs text-slate-500">Alumnos Inscritos</p>
            <div class="flex items-center gap-3">
              <button @click="confirmarEliminarCurso(curso)" title="Eliminar Curso" class="text-rose-400 hover:text-rose-600 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
              <button @click="abrirListaCurso(curso)" class="text-xs font-bold text-primary hover:underline uppercase">Ver Lista</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <div v-if="showEstudianteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-sm shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
        <div class="bg-secondary p-4 flex justify-between items-center text-white border-b-4 border-primary">
          <h3 class="font-bold">{{ editingEstudianteId ? 'Editar Estudiante' : 'Inscripción de Nuevo Alumno' }}</h3>
          <button @click="showEstudianteModal = false" class="text-white/70 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        <div class="p-6">
          <div v-if="errorMessage" class="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-medium rounded-r-sm">
            {{ errorMessage }}
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-4">
              <h4 class="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Datos del Estudiante</h4>
              <div class="flex gap-4">
                <div class="space-y-1.5 w-1/2">
                  <label class="block text-xs font-bold text-slate-600 uppercase">Nombres</label>
                  <input v-model="newEstudiante.first_name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
                </div>
                <div class="space-y-1.5 w-1/2">
                  <label class="block text-xs font-bold text-slate-600 uppercase">Apellidos</label>
                  <input v-model="newEstudiante.last_name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-600 uppercase">Carnet de Identidad</label>
                <input v-model="newEstudiante.ci" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-600 uppercase">Asignación de Curso</label>
                <select v-model="newEstudiante.course_id" class="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
                  <option value="" disabled>Seleccione un curso</option>
                  <option v-for="c in cursos" :key="c.id" :value="c.id">{{ c.grado }} {{ c.nivel }} - {{ c.paralelo }}</option>
                </select>
              </div>
            </div>
            <div class="space-y-4">
              <h4 class="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Datos del Apoderado (Tutor)</h4>
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-600 uppercase">Nombre del Tutor</label>
                <input v-model="newEstudiante.apoderado" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-600 uppercase">CI del Tutor</label>
                <input v-model="newEstudiante.ciApoderado" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-600 uppercase">Número Celular (WhatsApp)</label>
                <input v-model="newEstudiante.celular" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" placeholder="Obligatorio para avisos de cobro">
              </div>
            </div>
          </div>
          <div class="mt-8 pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button @click="showEstudianteModal = false" :disabled="isSaving" class="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 disabled:opacity-50">Cancelar</button>
            <button @click="inscribirAlumno" :disabled="isSaving || !newEstudiante.first_name || !newEstudiante.last_name || !newEstudiante.course_id" class="px-6 py-2 text-sm font-bold bg-primary text-white hover:bg-primary-dark rounded-sm disabled:bg-slate-400">
              {{ isSaving ? 'Procesando...' : 'Guardar Expediente' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Curso -->
    <div v-if="showCursoModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-sm shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
        <div class="bg-slate-800 p-4 flex justify-between items-center text-white border-b-4 border-slate-600">
          <h3 class="font-bold">Aperturar Nuevo Curso</h3>
          <button @click="showCursoModal = false" class="text-white/70 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        <div class="p-6 space-y-4">
          <div v-if="errorCursoMessage" class="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-medium rounded-r-sm">
            {{ errorCursoMessage }}
          </div>
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-600 uppercase">Nivel</label>
            <select v-model="newCurso.nivel" class="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
              <option value="Primaria">Primaria</option>
              <option value="Secundaria">Secundaria</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-600 uppercase">Grado</label>
              <input v-model="newCurso.grado" type="text" placeholder="Ej: 3ro" class="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-600 uppercase">Paralelo</label>
              <input v-model="newCurso.paralelo" type="text" placeholder="Ej: B" maxlength="1" class="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm uppercase focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
            </div>
          </div>
          <div class="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button @click="showCursoModal = false" :disabled="isSaving" class="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 disabled:opacity-50">Cancelar</button>
            <button @click="guardarCurso" :disabled="isSaving || !newCurso.grado || !newCurso.paralelo" class="px-6 py-2 text-sm font-bold bg-primary text-white hover:bg-primary-dark rounded-sm disabled:bg-slate-400">
              {{ isSaving ? 'Guardando...' : 'Crear Curso' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ficha del Estudiante -->
    <div v-if="showFichaModal && selectedEstudiante" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in no-print">
      <div class="bg-white rounded-sm shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        <div class="bg-secondary p-4 flex justify-between items-center text-white border-b-4 border-primary">
          <h3 class="font-bold">Vista Previa - Ficha Estudiantil</h3>
          <button @click="showFichaModal = false" class="text-white/70 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        <div class="p-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-400">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <div>
              <h4 class="text-lg font-bold text-slate-800">{{ selectedEstudiante.nombre }}</h4>
              <p class="text-sm text-slate-500">Código FA: <span class="font-bold text-slate-700">{{ selectedEstudiante.codigo }}</span></p>
            </div>
            <div class="ml-auto">
              <span v-if="selectedEstudiante.estado === 'Activo'" class="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase rounded-sm">Activo</span>
              <span v-else-if="selectedEstudiante.estado === 'Moroso'" class="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold uppercase rounded-sm">Moroso</span>
              <span v-else class="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold uppercase rounded-sm">Retirado</span>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="bg-slate-50 p-4 border border-slate-200 rounded-sm">
              <h5 class="text-xs font-bold text-secondary uppercase tracking-widest mb-3">Información Académica</h5>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-[10px] text-slate-500 uppercase">Carnet de Identidad</p>
                  <p class="text-sm font-medium text-slate-800">{{ selectedEstudiante.ci }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-slate-500 uppercase">Curso Asignado</p>
                  <p class="text-sm font-medium text-slate-800">{{ selectedEstudiante.curso }}</p>
                </div>
              </div>
            </div>

            <div class="bg-slate-50 p-4 border border-slate-200 rounded-sm">
              <h5 class="text-xs font-bold text-primary uppercase tracking-widest mb-3">Datos del Apoderado</h5>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-[10px] text-slate-500 uppercase">Nombre Completo</p>
                  <p class="text-sm font-medium text-slate-800">{{ selectedEstudiante.apoderado }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-slate-500 uppercase">Teléfono / Celular</p>
                  <p class="text-sm font-medium text-slate-800">{{ selectedEstudiante.celular }}</p>
                </div>
                <div class="col-span-2 mt-2 pt-2 border-t border-slate-200">
                  <p class="text-[10px] text-slate-500 uppercase">CI del Tutor</p>
                  <p class="text-sm font-medium text-slate-800">{{ selectedEstudiante.guardian_ci || 'No Registrado' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-4 flex justify-end gap-3 border-t border-slate-100 no-print">
            <button @click="imprimirFicha" class="px-4 py-2 text-sm font-bold border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-sm flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              Imprimir Ficha
            </button>
            <button @click="showFichaModal = false" class="px-6 py-2 text-sm font-bold bg-slate-800 text-white hover:bg-slate-900 rounded-sm">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ver Lista de Curso -->
    <div v-if="showListaCursoModal && selectedCurso" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-sm shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in-up">
        <div class="bg-slate-800 p-4 flex justify-between items-center text-white border-b-4 border-slate-600">
          <h3 class="font-bold flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Nómina: {{ selectedCurso.grado }} {{ selectedCurso.nivel }} - Paralelo {{ selectedCurso.paralelo }}
          </h3>
          <button @click="showListaCursoModal = false" class="text-white/70 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        
        <div class="p-6">
          <div class="max-h-96 overflow-y-auto border border-slate-200 rounded-sm mb-4">
            <table class="w-full text-left text-sm text-slate-600">
              <thead class="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 sticky top-0">
                <tr>
                  <th class="px-4 py-2">No.</th>
                  <th class="px-4 py-2">Código FA</th>
                  <th class="px-4 py-2">Apellidos y Nombres</th>
                  <th class="px-4 py-2">Tutor</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(est, index) in estudiantes.filter(e => e.curso_id == selectedCurso.id && e.estado !== 'Retirado')" :key="est.id" class="hover:bg-slate-50">
                  <td class="px-4 py-2 text-xs font-bold text-slate-400">{{ index + 1 }}</td>
                  <td class="px-4 py-2 font-mono text-xs font-bold">{{ est.codigo }}</td>
                  <td class="px-4 py-2 font-medium text-slate-800">{{ est.nombre }}</td>
                  <td class="px-4 py-2 text-xs text-slate-500">{{ est.apoderado }} <span v-if="est.celular && est.celular !== 'Sin Número'">({{ est.celular }})</span></td>
                </tr>
                <tr v-if="estudiantes.filter(e => e.curso_id == selectedCurso.id && e.estado !== 'Retirado').length === 0">
                  <td colspan="4" class="px-4 py-8 text-center text-slate-500 text-sm">No hay alumnos inscritos en este curso aún.</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="flex justify-between items-center pt-2">
            <p class="text-xs font-bold text-slate-500">Total inscritos: {{ estudiantes.filter(e => e.curso_id == selectedCurso.id && e.estado !== 'Retirado').length }}</p>
            <div class="flex gap-2">
              <button class="px-4 py-2 text-sm font-bold border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Exportar Excel
              </button>
              <button @click="showListaCursoModal = false" class="px-6 py-2 text-sm font-bold bg-slate-800 text-white hover:bg-slate-900 rounded-sm">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación de Baja -->
    <div v-if="showBajaModal && estudianteParaBaja" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border-t-4 border-rose-500">
        <div class="p-6 text-center">
          <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-2">¿Estás completamente seguro?</h3>
          <p class="text-sm text-slate-600 mb-6">
            Estás a punto de dar de baja al estudiante <strong class="text-slate-800">{{ estudianteParaBaja.nombre }}</strong>. Esta acción moverá su expediente al historial de alumnos retirados.
          </p>
          <div class="flex gap-3 justify-center">
            <button @click="showBajaModal = false" :disabled="isUpdatingStatusId === estudianteParaBaja.id" class="px-5 py-2.5 text-sm font-bold text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-sm disabled:opacity-50">
              Cancelar
            </button>
            <button @click="darDeBaja" :disabled="isUpdatingStatusId === estudianteParaBaja.id" class="px-5 py-2.5 text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-sm shadow-sm disabled:bg-slate-400 flex items-center gap-2">
              <svg v-if="isUpdatingStatusId === estudianteParaBaja.id" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Sí, Dar de Baja
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación de Eliminar Curso -->
    <div v-if="showDeleteCursoModal && cursoParaEliminar" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in no-print">
      <div class="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border-t-4 border-rose-500">
        <div class="p-6 text-center">
          <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-2">Eliminar Curso</h3>
          <p class="text-sm text-slate-600 mb-6">
            ¿Estás seguro de que deseas eliminar el curso <strong class="text-slate-800">{{ cursoParaEliminar.grado }} - Paralelo {{ cursoParaEliminar.paralelo }}</strong>? Esta acción no se puede deshacer.
          </p>

          <div v-if="deleteCursoErrorMessage" class="mb-6 p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-medium text-left rounded-r-sm">
            {{ deleteCursoErrorMessage }}
          </div>

          <div class="flex gap-3 justify-center">
            <button @click="showDeleteCursoModal = false" :disabled="isSaving" class="px-5 py-2.5 text-sm font-bold text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-sm disabled:opacity-50 transition-colors">
              Cancelar
            </button>
            <button @click="ejecutarEliminarCurso" :disabled="isSaving" class="px-5 py-2.5 text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-sm shadow-sm disabled:bg-slate-400 flex items-center gap-2 transition-colors">
              <svg v-if="isSaving" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Sí, Eliminar Curso
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Plantilla Exclusiva para Impresión -->
  <div v-if="selectedEstudiante" id="ficha-estudiante-impresion" class="hidden print:block font-sans bg-white">
    <!-- Encabezado Institucional -->
    <div class="flex justify-between items-end border-b-4 border-primary pb-4 mb-8">
      <div>
        <h1 class="text-2xl font-black text-slate-800 tracking-tight uppercase">Unidad Educativa<br/><span class="text-primary">Colegio Central</span></h1>
        <p class="text-sm font-medium text-slate-500 mt-1">Sistema de Gestión Académica - SIE: 40593821</p>
      </div>
      <div class="text-right">
        <h2 class="text-xl font-bold text-secondary uppercase tracking-widest">Ficha de Inscripción</h2>
        <p class="text-xs text-slate-500 font-mono mt-1">Gestión 2026 - {{ new Date().toLocaleDateString() }}</p>
      </div>
    </div>

    <!-- Datos del Estudiante -->
    <div class="mb-8">
      <h3 class="text-sm font-bold text-white bg-slate-800 inline-block px-4 py-1.5 uppercase tracking-widest mb-4 rounded-sm">1. Información del Estudiante</h3>
      <div class="grid grid-cols-12 gap-6 items-center">
        <!-- Foto Placeholder -->
        <div class="col-span-3">
          <div class="w-32 h-40 border-2 border-dashed border-slate-300 rounded-sm flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span class="text-[10px] uppercase font-bold text-slate-400">Fotografía 4x4</span>
          </div>
        </div>
        <!-- Datos -->
        <div class="col-span-9 grid grid-cols-2 gap-6">
          <div class="border-b border-slate-200 pb-2">
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Apellidos y Nombres</p>
            <p class="text-lg font-bold text-slate-900 mt-1">{{ selectedEstudiante.nombre }}</p>
          </div>
          <div class="border-b border-slate-200 pb-2">
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Código de Sistema (FA)</p>
            <p class="text-lg font-mono font-bold text-slate-900 mt-1">{{ selectedEstudiante.codigo }}</p>
          </div>
          <div class="border-b border-slate-200 pb-2">
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Carnet de Identidad</p>
            <p class="text-base font-bold text-slate-800 mt-1">{{ selectedEstudiante.ci }}</p>
          </div>
          <div class="border-b border-slate-200 pb-2">
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado Actual</p>
            <p class="text-base font-bold text-slate-800 mt-1 uppercase">{{ selectedEstudiante.estado }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Datos Académicos y Tutor -->
    <div class="grid grid-cols-2 gap-8 mb-12">
      <div>
        <h3 class="text-sm font-bold text-white bg-secondary inline-block px-4 py-1.5 uppercase tracking-widest mb-4 rounded-sm">2. Datos Académicos</h3>
        <div class="space-y-4 border border-slate-200 p-5 rounded-sm bg-slate-50">
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nivel y Grado Asignado</p>
            <p class="text-base font-bold text-slate-800 mt-1">{{ selectedEstudiante.curso }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fecha de Inscripción</p>
            <p class="text-base font-medium text-slate-700 mt-1">{{ new Date().toLocaleDateString() }}</p>
          </div>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-bold text-white bg-slate-800 inline-block px-4 py-1.5 uppercase tracking-widest mb-4 rounded-sm">3. Responsable / Tutor</h3>
        <div class="space-y-4 border border-slate-200 p-5 rounded-sm">
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre del Apoderado</p>
            <p class="text-base font-bold text-slate-800 mt-1">{{ selectedEstudiante.apoderado }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Teléfono de Contacto (WhatsApp)</p>
            <p class="text-base font-bold text-slate-800 mt-1">{{ selectedEstudiante.celular }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Firmas -->
    <div class="mt-24 grid grid-cols-3 gap-8 text-center">
      <div>
        <div class="border-b border-slate-800 w-48 mx-auto mb-2"></div>
        <p class="text-xs font-bold text-slate-800 uppercase">Firma del Apoderado</p>
        <p class="text-[10px] text-slate-500 mt-1">CI: {{ selectedEstudiante.guardian_ci || '_________________' }}</p>
      </div>
      <div>
        <div class="border-b border-slate-800 w-48 mx-auto mb-2"></div>
        <p class="text-xs font-bold text-slate-800 uppercase">Sello de Recepción</p>
        <p class="text-[10px] text-slate-500 mt-1">Secretaría Académica</p>
      </div>
      <div>
        <div class="border-b border-slate-800 w-48 mx-auto mb-2"></div>
        <p class="text-xs font-bold text-slate-800 uppercase">Firma Dirección</p>
        <p class="text-[10px] text-slate-500 mt-1">Visto Bueno</p>
      </div>
    </div>

    <!-- Pie de página de seguridad -->
    <div class="mt-16 text-center border-t border-slate-200 pt-4">
      <p class="text-[9px] text-slate-400 uppercase tracking-widest">
        Documento generado automáticamente por el Sistema de Gestión Académica. Cualquier alteración invalida este certificado.<br/>
        ID Verificación: {{ selectedEstudiante.codigo }}-{{ Date.now().toString().slice(-6) }}
      </p>
    </div>
    </div>
  </div>
</template>
