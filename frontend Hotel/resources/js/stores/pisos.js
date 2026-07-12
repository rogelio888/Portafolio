// resources/js/stores/pisos.js

import { defineStore } from 'pinia';
import axios from '../axios';

export const usePisosStore = defineStore('pisos', {
    state: () => ({
        pisos: [],
        pisoActual: null,
        loading: false,
        error: null,
    }),

    getters: {
        totalPisos: (state) => state.pisos.length,
    },

    actions: {
        async fetchPisos(filtros = {}) {
            this.loading = true;
            this.error = null;

            try {
                const params = new URLSearchParams(filtros);
                const response = await axios.get(`/pisos?${params}`);

                if (response.data.success) {
                    this.pisos = response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar pisos';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchPiso(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(`/pisos/${id}`);

                if (response.data.success) {
                    this.pisoActual = response.data.data;
                    return response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar piso';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createPiso(pisoData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.post('/pisos', pisoData);

                if (response.data.success) {
                    this.pisos.push(response.data.data);
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al crear piso';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updatePiso(id, pisoData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.put(`/pisos/${id}`, pisoData);

                if (response.data.success) {
                    const index = this.pisos.findIndex(p => p.id === id);
                    if (index !== -1) {
                        this.pisos[index] = response.data.data;
                    }
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al actualizar piso';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deletePiso(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.delete(`/pisos/${id}`);

                if (response.data.success) {
                    this.pisos = this.pisos.filter(p => p.id !== id);
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al eliminar piso';
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
