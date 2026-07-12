// resources/js/stores/hoteles.js

import { defineStore } from 'pinia';
import axios from '../axios';

export const useHotelesStore = defineStore('hoteles', {
    state: () => ({
        hoteles: [],
        hotelActual: null,
        loading: false,
        error: null,
    }),

    getters: {
        hotelesActivos: (state) => state.hoteles.filter(h => h.estado === 'ACTIVO'),
        totalHoteles: (state) => state.hoteles.length,
    },

    actions: {
        async fetchHoteles(filtros = {}) {
            this.loading = true;
            this.error = null;

            try {
                const params = new URLSearchParams(filtros);
                const response = await axios.get(`/hoteles?${params}`);

                if (response.data.success) {
                    this.hoteles = response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar hoteles';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchHotel(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(`/hoteles/${id}`);

                if (response.data.success) {
                    this.hotelActual = response.data.data;
                    return response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar hotel';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createHotel(hotelData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.post('/hoteles', hotelData);

                if (response.data.success) {
                    this.hoteles.push(response.data.data);
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al crear hotel';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateHotel(id, hotelData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.put(`/hoteles/${id}`, hotelData);

                if (response.data.success) {
                    const index = this.hoteles.findIndex(h => h.id === id);
                    if (index !== -1) {
                        this.hoteles[index] = response.data.data;
                    }
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al actualizar hotel';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteHotel(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.delete(`/hoteles/${id}`);

                if (response.data.success) {
                    this.hoteles = this.hoteles.filter(h => h.id !== id);
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al eliminar hotel';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchDashboard(id) {
            try {
                const response = await axios.get(`/hoteles/${id}/dashboard`);
                return response.data.data;
            } catch (error) {
                throw error;
            }
        },
    },
});