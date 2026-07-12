import { defineStore } from 'pinia';
import { apiSimBus, type ApiSimEvent } from '../api-sim/bus';

export const useApiSimLogStore = defineStore('apiSimLog', {
  state: () => ({
    events: apiSimBus.getHistory() as ApiSimEvent[],
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
