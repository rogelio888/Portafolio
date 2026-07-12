// resources/js/stores/auth.js

import { defineStore } from 'pinia';
import axios from '../axios';
import router from '../router';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('auth_token') || null,
        loading: false,
        error: null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        currentUser: (state) => state.user,
        userRole: (state) => state.user?.rol?.nombre || null,
        userHotel: (state) => state.user?.hotel || null,
        userPermissions: (state) => state.user?.rol?.permisos || [],
    },

    actions: {
        async login(credentials) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.post('/auth/login', credentials);

                if (response.data.success) {
                    this.token = response.data.data.token;
                    this.user = response.data.data.empleado;

                    localStorage.setItem('auth_token', this.token);
                    localStorage.setItem('user', JSON.stringify(this.user));

                    router.push('/');
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al iniciar sesión';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            try {
                await axios.post('/auth/logout');
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            } finally {
                this.token = null;
                this.user = null;
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                router.push('/login');
            }
        },

        async fetchUser() {
            try {
                const response = await axios.get('/auth/me');
                if (response.data.success) {
                    this.user = response.data.data;
                    localStorage.setItem('user', JSON.stringify(this.user));
                }
            } catch (error) {
                console.error('Error al obtener usuario:', error);
                this.logout();
            }
        },

        async cambiarPassword(passwords) {
            try {
                const response = await axios.post('/auth/cambiar-password', passwords);
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        hasPermission(permissionName) {
            return this.userPermissions.some(p => p.nombre === permissionName);
        },

        isAdmin() {
            return this.userRole === 'Administrador';
        },
    },
});