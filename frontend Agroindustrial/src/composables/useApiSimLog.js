import { ref } from 'vue';
import { apiSimBus } from '../api-sim/bus';

// Composable singleton: el estado vive a nivel de módulo (fuera de la función),
// que es la forma recomendada de Vue 3 para compartir estado sin Pinia.
const events = ref(apiSimBus.getHistory());
const isOpen = ref(false);

apiSimBus.subscribe((event) => {
  events.value = [event, ...events.value].slice(0, 50);
});

export function useApiSimLog() {
  return {
    events,
    isOpen,
    toggle: () => (isOpen.value = !isOpen.value),
    clear: () => (events.value = []),
  };
}
