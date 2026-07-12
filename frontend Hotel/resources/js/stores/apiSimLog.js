import { defineStore } from 'pinia';
import { apiSimBus } from '../api-sim/bus';

export const useApiSimLogStore = defineStore('apiSimLog', {
  state: () => ({
    events: apiSimBus.getHistory(),
    isOpen: false,
    subscribed: false,
  }),
  actions: {
    ensureSubscribed() {
      if (this.subscribed) return;
      this.subscribed = true;
      apiSimBus.subscribe((event) => {
        this.events = [event, ...this.events].slice(0, 50);
      });
    },
    toggle() {
      this.isOpen = !this.isOpen;
    },
    clear() {
      this.events = [];
    },
  },
});
