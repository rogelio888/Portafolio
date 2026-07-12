import { Injectable, signal } from '@angular/core';
import { apiSimBus, ApiSimEvent } from './api-sim/bus';

@Injectable({
  providedIn: 'root'
})
export class ApiSimLogService {
  private readonly _events = signal<ApiSimEvent[]>(apiSimBus.getHistory());
  readonly events = this._events.asReadonly();
  readonly isOpen = signal(false);

  constructor() {
    apiSimBus.subscribe((event) => {
      this._events.update((list) => [event, ...list].slice(0, 50));
    });
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  open(): void {
    this.isOpen.set(true);
  }

  clear(): void {
    this._events.set([]);
  }
}
