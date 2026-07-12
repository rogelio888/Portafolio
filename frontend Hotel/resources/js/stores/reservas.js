// resources/js/stores/reservas.js

import { defineStore } from 'pinia';
import axios from '../axios';

export const useReservasStore = defineStore('reservas', {
    state: () => ({
        reservas: [],
        reservaActual: null,
        loading: false,
        error: null,
    }),

    getters: {
        reservasConfirmadas: (state) => state.reservas.filter(r => r.estado === 'CONFIRMADA'),
        reservasEnProceso: (state) => state.reservas.filter(r => r.estado === 'EN_PROCESO'),
        reservasPendientes: (state) => state.reservas.filter(r => r.estado === 'PENDIENTE'),
    },

    actions: {
        async fetchReservas(filtros = {}) {
            this.loading = true;
            this.error = null;

            try {
                const params = new URLSearchParams(filtros);
                const response = await axios.get(`/reservas?${params}`);

                if (response.data.success) {
                    this.reservas = response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar reservas';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchReserva(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(`/reservas/${id}`);

                if (response.data.success) {
                    this.reservaActual = response.data.data;
                    return response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar reserva';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createReserva(reservaData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.post('/reservas', reservaData);

                if (response.data.success) {
                    this.reservas.unshift(response.data.data);
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al crear reserva';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateReserva(id, reservaData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.put(`/reservas/${id}`, reservaData);

                if (response.data.success) {
                    const index = this.reservas.findIndex(r => r.id === id);
                    if (index !== -1) {
                        this.reservas[index] = response.data.data;
                    }
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al actualizar reserva';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async confirmarReserva(id) {
            try {
                const response = await axios.post(`/reservas/${id}/confirmar`);

                if (response.data.success) {
                    await this.fetchReserva(id);
                    return response.data;
                }
            } catch (error) {
                throw error;
            }
        },

        async checkIn(id) {
            try {
                const response = await axios.post(`/reservas/${id}/checkin`);

                if (response.data.success) {
                    await this.fetchReserva(id);
                    return response.data;
                }
            } catch (error) {
                throw error;
            }
        },

        async checkOut(id) {
            try {
                const response = await axios.post(`/reservas/${id}/checkout`);

                if (response.data.success) {
                    await this.fetchReserva(id);
                    return response.data;
                }
            } catch (error) {
                throw error;
            }
        },

        async cancelarReserva(id) {
            try {
                const response = await axios.delete(`/reservas/${id}`);

                if (response.data.success) {
                    this.reservas = this.reservas.filter(r => r.id !== id);
                    return response.data;
                }
            } catch (error) {
                throw error;
            }
        },
    },
});