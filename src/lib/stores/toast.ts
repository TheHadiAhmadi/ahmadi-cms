import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);
  let nextId = 0;
  
  return {
    subscribe,
    add: (message: string, type: ToastType = 'info') => {
      const id = nextId++;
      update(toasts => [...toasts, { id, type, message }]);
      setTimeout(() => {
        update(toasts => toasts.filter(t => t.id !== id));
      }, 4000);
    },
    remove: (id: number) => {
      update(toasts => toasts.filter(t => t.id !== id));
    }
  };
}

export const toasts = createToastStore();

export function toast(message: string, type: ToastType = 'info') {
  toasts.add(message, type);
}