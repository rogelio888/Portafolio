// resources/js/stores/huespedes.js

import { defineStore } from 'pinia';
import axios from '../axios';

export const useHuespedesStore = defineStore('huespedes', {
    state: () => ({
        huespedes: [],
        huespedActual: null,
        loading: false,
        error: null,
    }),

    getters: {
        huespedesActivos: (state) => state.huespedes.filter(h => h.estado === 'ACTIVO'),
    },

    actions: {
        async fetchHuespedes(filtros = {}) {
            this.loading = true;
            this.error = null;

            try {
                const params = new URLSearchParams(filtros);
                const response = await axios.get(`/huespedes?${params}`);

                if (response.data.success) {
                    this.huespedes = response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar huéspedes';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchHuesped(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(`/huespedes/${id}`);

                if (response.data.success) {
                    this.huespedActual = response.data.data;
                    return response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar huésped';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async buscarPorCi(ci) {
            try {
                const response = await axios.post('/huespedes/buscar-ci', { ci });

                if (response.data.success) {
                    return response.data.data;
                }
            } catch (error) {
                throw error;
            }
        },

        async createHuesped(huespedData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.post('/huespedes', huespedData);

                if (response.data.success) {
                    this.huespedes.unshift(response.data.data);
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al crear huésped';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateHuesped(id, huespedData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.put(`/huespedes/${id}`, huespedData);

                if (response.data.success) {
                    const index = this.huespedes.findIndex(h => h.id === id);
                    if (index !== -1) {
                        this.huespedes[index] = response.data.data;
                    }
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al actualizar huésped';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteHuesped(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.delete(`/huespedes/${id}`);

                if (response.data.success) {
                    this.huespedes = this.huespedes.filter(h => h.id !== id);
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al eliminar huésped';
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});