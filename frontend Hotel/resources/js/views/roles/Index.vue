<!-- resources/js/views/roles/Index.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Roles y Permisos</h1>
        <p class="text-gray-600 mt-1">Administra roles y sus permisos</p>
      </div>
    </div>

    <!-- Lista de Roles -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="rol in roles"
        :key="rol.id"
        class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-800">{{ rol.nombre }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ rol.descripcion }}</p>
          </div>
          <button
            @click="abrirModalPermisos(rol)"
            class="text-blue-600 hover:text-blue-800"
            title="Gestionar permisos"
          >
            ⚙️
          </button>
        </div>

        <div class="pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-600 mb-2">Permisos asignados:</p>
          <p class="text-2xl font-bold text-blue-600">{{ rol.permisos?.length || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Modal Gestionar Permisos -->
    <Modal :show="modalPermisos" @close="modalPermisos = false" title="Gestionar Permisos" size="xl">
      <div v-if="rolSeleccionado">
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-bold text-lg">{{ rolSeleccionado.nombre }}</h3>
          <p class="text-sm text-gray-600">{{ rolSeleccionado.descripcion }}</p>
        </div>

        <!-- Permisos por Módulo -->
        <div class="space-y-6 max-h-96 overflow-y-auto">
          <div v-for="modulo in modulosAgrupados" :key="modulo.nombre">
            <h4 class="font-bold text-gray-800 mb-3 sticky top-0 bg-white py-2">
              {{ modulo.nombre }}
            </h4>
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="permiso in modulo.permisos"
                :key="permiso.id"
                class="flex items-center p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="permiso.id"
                  v-model="permisosSeleccionados"
                  class="mr-3 w-4 h-4 text-blue-600"
                />
                <span class="text-sm">{{ permiso.descripcion || permiso.nombre }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="mt-4 p-4 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            <strong>{{ permisosSeleccionados.length }}</strong> permisos seleccionados
          </p>
        </div>
      </div>

      <template #footer>
        <Button variant="secondary" @click="modalPermisos = false">Cancelar</Button>
        <Button @click="guardarPermisos" :loading="guardando">Guardar Cambios</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '../../axios';
import Button from '../../components/Button.vue';
import Modal from '../../components/Modal.vue';

const roles = ref([]);
const permisos = ref([]);
const rolSeleccionado = ref(null);
const permisosSeleccionados = ref([]);
const modalPermisos = ref(false);
const guardando = ref(false);

const modulosAgrupados = computed(() => {
  const modulos = {};
  
  permisos.value.forEach(permiso => {
    // Extraer módulo del nombre (ej: "ver_hoteles" -> "hoteles")
    const partes = permiso.nombre.split('_');
    const modulo = partes.length > 1 ? partes[partes.length - 1] : 'otros';
    
    if (!modulos[modulo]) {
      modulos[modulo] = {
        nombre: modulo.charAt(0).toUpperCase() + modulo.slice(1),
        permisos: []
      };
    }
    
    modulos[modulo].permisos.push(permiso);
  });
  
  return Object.values(modulos);
});

const fetchRoles = async () => {
  try {
    const response = await axios.get('/roles');
    if (response.data.success) {
      roles.value = response.data.data;
    }
  } catch (error) {
    console.error('Error al cargar roles:', error);
  }
};

const fetchPermisos = async () => {
  try {
    const response = await axios.get('/permisos');
    if (response.data.success) {
      permisos.value = response.data.data;
    }
  } catch (error) {
    console.error('Error al cargar permisos:', error);
  }
};

const abrirModalPermisos = async (rol) => {
  try {
    const response = await axios.get(`/roles/${rol.id}`);
    if (response.data.success) {
      rolSeleccionado.value = response.data.data;
      permisosSeleccionados.value = rolSeleccionado.value.permisos.map(p => p.id);
      modalPermisos.value = true;
    }
  } catch (error) {
    alert('Error al cargar rol');
  }
};

const guardarPermisos = async () => {
  guardando.value = true;
  try {
    await axios.post(`/roles/${rolSeleccionado.value.id}/asignar-permisos`, {
      permisos: permisosSeleccionados.value
    });
    modalPermisos.value = false;
    await fetchRoles();
    alert('Permisos actualizados exitosamente');
  } catch (error) {
    alert('Error al guardar permisos');
  } finally {
    guardando.value = false;
  }
};

onMounted(() => {
  fetchRoles();
  fetchPermisos();
});
</script>