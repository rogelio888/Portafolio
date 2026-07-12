// Bus de eventos plano, sin dependencias de framework. El repositorio de datos
// llama a apiSimBus.emit(...) como último paso de cada operación; la consola de
// UI (Pinia store) se suscribe para mostrar la actividad en vivo.

export interface ApiSimEvent {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  route: string;
  entity: string;
  operationLabel: string;
  statusCode: number;
  durationMs: number;
  controllerCode: string;
  sqlQuery: string;
  requestBody?: unknown;
  responseBody: unknown;
}

const MAX_EVENTS = 50;

class ApiSimBus {
  private listeners = new Set<(event: ApiSimEvent) => void>();
  private history: ApiSimEvent[] = [];

  emit(partial: Omit<ApiSimEvent, 'id' | 'timestamp'>) {
    const event: ApiSimEvent = {
      ...partial,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    this.history = [event, ...this.history].slice(0, MAX_EVENTS);
    this.listeners.forEach((listener) => listener(event));
  }

  subscribe(listener: (event: ApiSimEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
  }
}

export const apiSimBus = new ApiSimBus();
