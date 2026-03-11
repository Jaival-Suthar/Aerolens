import type { Toast } from "primereact/toast";

export type GlobalToastMessage = {
  severity?: "success" | "info" | "warn" | "error";
  summary?: string;
  detail?: string;
  life?: number;
};

let toastInstance: Toast | null = null;
const queuedMessages: GlobalToastMessage[] = [];

export const registerGlobalToast = (instance: Toast | null): void => {
  toastInstance = instance;

  if (!toastInstance || queuedMessages.length === 0) {
    return;
  }

  queuedMessages.splice(0).forEach((message) => {
    toastInstance?.show(message);
  });
};

export const showGlobalToast = (message: GlobalToastMessage): void => {
  if (toastInstance) {
    toastInstance.show(message);
    return;
  }

  queuedMessages.push(message);
};
