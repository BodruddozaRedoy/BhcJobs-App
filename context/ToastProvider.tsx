import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { Toast, type ToastData, type ToastType } from "@/components/global/Toast";

interface ToastContextValue {
  show: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  dismiss: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Monotonic id, so each show() is a distinct toast even with identical text. */
let nextId = 0;

/**
 * Hosts the single toast overlay and exposes the API to trigger it.
 *
 * One toast at a time by design: a stack of them competing for the top of the
 * screen is harder to read than the most recent message alone, and in practice
 * consecutive toasts almost always describe the same event.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);

  const show = useCallback((type: ToastType, message: string, duration?: number) => {
    // A fresh id even for an identical message, so re-submitting a form that fails
    // the same way twice visibly re-triggers the toast instead of looking stuck.
    setToast({ id: nextId++, type, message, duration });
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (message, duration) => show("success", message, duration),
      error: (message, duration) => show("error", message, duration),
      info: (message, duration) => show("info", message, duration),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* After children, so it paints above the navigator without needing a portal. */}
      <Toast toast={toast} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}
