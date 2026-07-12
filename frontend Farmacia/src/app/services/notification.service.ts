import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

export interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export interface ConfirmState extends ConfirmOptions {
  message: string;
}

const TOAST_DURATION_MS = 4000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 1;

  toasts = signal<Toast[]>([]);

  private show(type: ToastType, message: string) {
    const id = this.nextId++;
    this.toasts.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), TOAST_DURATION_MS);
  }

  success(message: string) {
    this.show('success', message);
  }

  error(message: string) {
    this.show('error', message);
  }

  warning(message: string) {
    this.show('warning', message);
  }

  info(message: string) {
    this.show('info', message);
  }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  confirmState = signal<ConfirmState | null>(null);
  private resolver: ((value: boolean) => void) | null = null;

  confirm(message: string, options?: ConfirmOptions): Promise<boolean> {
    this.confirmState.set({
      message,
      title: options?.title ?? 'Confirmar acción',
      confirmText: options?.confirmText ?? 'Confirmar',
      cancelText: options?.cancelText ?? 'Cancelar',
      danger: options?.danger ?? true,
    });
    return new Promise<boolean>(resolve => {
      this.resolver = resolve;
    });
  }

  resolveConfirm(result: boolean) {
    this.resolver?.(result);
    this.resolver = null;
    this.confirmState.set(null);
  }
}
