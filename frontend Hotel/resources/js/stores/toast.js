// resources/js/stores/toast.js
import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [],
    confirmConfig: null, // { message, resolve }
  }),
  actions: {
    add(message, type = 'info', duration = 3000) {
      const id = Date.now() + Math.random();
      this.toasts.push({ id, message, type });
      if (duration > 0) {
        setTimeout(() => this.remove(id), duration);
      }
    },
    success(message, duration) { this.add(message, 'success', duration); },
    error(message, duration) { this.add(message, 'error', duration); },
    warning(message, duration) { this.add(message, 'warning', duration); },
    info(message, duration) { this.add(message, 'info', duration); },
    remove(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    },
    confirm(message) {
      return new Promise((resolve) => {
        this.confirmConfig = { message, resolve };
      });
    },
    resolveConfirm(value) {
      if (this.confirmConfig) {
        this.confirmConfig.resolve(value);
        this.confirmConfig = null;
      }
    }
  }
});
