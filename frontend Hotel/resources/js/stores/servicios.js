// resources/js/stores/servicios.js

import { defineStore } from 'pinia';
import axios from '../axios';

export const useServiciosStore = defineStore('servicios', {
    state: () => ({
        servicios: [],
        servicioActual: null,
        loading: false,
        error: null,
    }),

    getters: {
        serviciosActivos: (state) => state.servicios.filter(s => s.estado === 'ACTIVO'),
        serviciosDiarios: (state) => state.servicios.filter(s => s.frecuencia === 'DIARIO'),
    },

    actions: {
        async fetchServicios(filtros = {}) {
            this.loading = true;
            this.error = null;

            try {
                const params = new URLSearchParams(filtros);
                const response = await axios.get(`/servicios?${params}`);

                if (response.data.success) {
                    this.servicios = response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar servicios';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchServicio(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(`/servicios/${id}`);

                if (response.data.success) {
                    this.servicioActual = response.data.data;
                    return response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar servicio';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createServicio(servicioData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.post('/servicios', servicioData);

                if (response.data.success) {
                    this.servicios.push(response.data.data);
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al crear servicio';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateServicio(id, servicioData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.put(`/servicios/${id}`, servicioData);

                if (response.data.success) {
                    const index = this.servicios.findIndex(s => s.id === id);
                    if (index !== -1) {
                        this.servicios[index] = response.data.data;
                    }
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al actualizar servicio';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteServicio(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.delete(`/servicios/${id}`);

                if (response.data.success) {
                    this.servicios = this.servicios.filter(s => s.id !== id);
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al eliminar servicio';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async calcularPrecio(id, datos) {
            try {
                const response = await axios.post(`/servicios/${id}/calcular-precio`, datos);
                return response.data;
            } catch (error) {
                throw error;
            }
        },
    },
});