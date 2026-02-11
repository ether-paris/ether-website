import { writable } from "svelte/store";

interface ToastState {
  visible: boolean;
  message: string;
  type: "info" | "success" | "error";
}

function createToastStore() {
  const { subscribe, set, update } = writable<ToastState>({
    visible: false,
    message: "",
    type: "info",
  });

  return {
    subscribe,
    show: (message: string, type: "info" | "success" | "error" = "info") => {
      update((state) => ({ visible: true, message, type }));
      setTimeout(() => {
        update((state) => ({ ...state, visible: false }));
      }, 3000);
    },
    success: (message: string) => {
      update((state) => ({ visible: true, message, type: "success" }));
      setTimeout(() => {
        update((state) => ({ ...state, visible: false }));
      }, 3000);
    },
    error: (message: string) => {
      update((state) => ({ visible: true, message, type: "error" }));
      setTimeout(() => {
        update((state) => ({ ...state, visible: false }));
      }, 3000);
    },
  };
}

export const toast = createToastStore();
