// resources/js/stores/habitaciones.js

import { defineStore } from 'pinia';
import axios from '../axios';

export const useHabitacionesStore = defineStore('habitaciones', {
    state: () => ({
        habitaciones: [],
        habitacionActual: null,
        loading: false,
        error: null,
    }),

    getters: {
        habitacionesDisponibles: (state) => state.habitaciones.filter(h => h.estado === 'DISPONIBLE'),
        habitacionesOcupadas: (state) => state.habitaciones.filter(h => h.estado === 'OCUPADA'),
        habitacionesMantenimiento: (state) => state.habitaciones.filter(h => h.estado === 'MANTENIMIENTO'),
        habitacionesPorHotel: (state) => (hotelId) => {
            return state.habitaciones.filter(h => h.id_hotel === hotelId);
        },
    },

    actions: {
        async fetchHabitaciones(filtros = {}) {
            this.loading = true;
            this.error = null;

            try {
                const params = new URLSearchParams(filtros);
                const response = await axios.get(`/habitaciones?${params}`);

                if (response.data.success) {
                    this.habitaciones = response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar habitaciones';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchHabitacionesDisponibles(hotelId = null) {
            try {
                const params = hotelId ? `?id_hotel=${hotelId}` : '';
                const response = await axios.get(`/habitaciones-disponibles${params}`);

                if (response.data.success) {
                    return response.data.data;
                }
            } catch (error) {
                throw error;
            }
        },

        async fetchHabitacion(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(`/habitaciones/${id}`);

                if (response.data.success) {
                    this.habitacionActual = response.data.data;
                    return response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar habitación';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createHabitacion(habitacionData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.post('/habitaciones', habitacionData);

                if (response.data.success) {
                    this.habitaciones.push(response.data.data);
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al crear habitación';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateHabitacion(id, habitacionData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.put(`/habitaciones/${id}`, habitacionData);

                if (response.data.success) {
                    const index = this.habitaciones.findIndex(h => h.id === id);
                    if (index !== -1) {
                        this.habitaciones[index] = response.data.data;
                    }
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al actualizar habitación';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async cambiarEstado(id, estado) {
            try {
                const response = await axios.post(`/habitaciones/${id}/cambiar-estado`, { estado });

                if (response.data.success) {
                    const index = this.habitaciones.findIndex(h => h.id === id);
                    if (index !== -1) {
                        this.habitaciones[index].estado = estado;
                    }
                    return response.data;
                }
            } catch (error) {
                throw error;
            }
        },

        async deleteHabitacion(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.delete(`/habitaciones/${id}`);

                if (response.data.success) {
                    this.habitaciones = this.habitaciones.filter(h => h.id !== id);
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al eliminar habitación';
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});