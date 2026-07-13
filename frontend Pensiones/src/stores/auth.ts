import { defineStore } from 'pinia';
import api from '../api/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || sessionStorage.getItem('token') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRoles: (state) => state.user?.roles || [],
    userPermissions: (state) => state.user?.permissions || [],
  },
  actions: {
    async login(email: string, password: string, rememberMe: boolean = false) {
      try {
        const response = await api.post('/login', { email, password });
        this.token = response.data.access_token;
        this.user = response.data.user;
        
        const storage = rememberMe ? localStorage : sessionStorage;
        const otherStorage = rememberMe ? sessionStorage : localStorage;
        
        if (this.token) {
          storage.setItem('token', this.token);
          otherStorage.removeItem('token');
        }
        storage.setItem('user', JSON.stringify(this.user));
        otherStorage.removeItem('user');
        
        return { success: true };
      } catch (error: any) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Error de credenciales o conexión' 
        };
      }
    },
    async fetchUser() {
      if (!this.token) return;
      try {
        const response = await api.get('/user');
        this.user = response.data;
        if (localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(this.user));
        } else if (sessionStorage.getItem('user')) {
          sessionStorage.setItem('user', JSON.stringify(this.user));
        }
      } catch (error: any) {
        // Sesión inconsistente (ej. datos de demo reiniciados o localStorage
        // de una visita anterior): la sesión guardada ya no es válida, así
        // que se limpia en vez de dejar la app en un estado a medias.
        if (error?.response?.status === 401) {
          this.token = null;
          this.user = null;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
        } else {
          console.error('Error fetching user', error);
        }
      }
    },
    async logout() {
      try {
        await api.post('/logout');
      } catch (error) {
        console.error('Logout error', error);
      } finally {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    }
  }
});
