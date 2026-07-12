const MAX_EVENTS = 50;

class ApiSimBus {
  constructor() {
    this.listeners = new Set();
    this.history = [];
  }

  emit(partial) {
    const event = {
      ...partial,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    this.history = [event, ...this.history].slice(0, MAX_EVENTS);
    this.listeners.forEach((listener) => listener(event));
  }

  subscribe(listener) {
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
