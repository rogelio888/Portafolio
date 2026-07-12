export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiSimEvent {
  id: string;
  timestamp: string;
  method: HttpMethod;
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

type ApiSimListener = (event: ApiSimEvent) => void;

const MAX_EVENTS = 50;

class ApiSimBus {
  private listeners = new Set<ApiSimListener>();
  private history: ApiSimEvent[] = [];

  emit(partial: Omit<ApiSimEvent, 'id' | 'timestamp'>): void {
    const event: ApiSimEvent = {
      ...partial,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    this.history = [event, ...this.history].slice(0, MAX_EVENTS);
    this.listeners.forEach((listener) => listener(event));
  }

  subscribe(listener: ApiSimListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getHistory(): ApiSimEvent[] {
    return this.history;
  }

  clearHistory(): void {
    this.history = [];
  }
}

export const apiSimBus = new ApiSimBus();
