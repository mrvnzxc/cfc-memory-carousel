type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export function useToast() {
  const items = useState<ToastItem[]>("toasts", () => []);

  function showToast(message: string, type: ToastType = "info") {
    const id = crypto.randomUUID();
    items.value.push({ id, message, type });
    setTimeout(() => dismissToast(id), 3500);
  }

  function dismissToast(id: string) {
    items.value = items.value.filter((toast) => toast.id !== id);
  }

  return {
    items,
    showToast,
    dismissToast
  };
}
