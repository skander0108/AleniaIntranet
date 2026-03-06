import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private counter = 0;
    toasts = signal<ToastMessage[]>([]);

    show(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', duration = 3000): void {
        const id = ++this.counter;
        this.toasts.update(t => [...t, { id, message, type }]);

        setTimeout(() => this.dismiss(id), duration);
    }

    dismiss(id: number): void {
        this.toasts.update(t => t.filter(toast => toast.id !== id));
    }
}
