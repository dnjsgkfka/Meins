import { createContext, useCallback, useContext, useState } from 'react';

interface Toast {
  id: string;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string) => {
    setToasts((prev) => {
      // 동일 메시지가 이미 떠 있으면 추가하지 않음 (네트워크 단절 시 중복 방지)
      if (prev.some((t) => t.message === message)) return prev;

      const id = crypto.randomUUID();
      setTimeout(() => {
        setToasts((curr) => curr.filter((t) => t.id !== id));
      }, 5000);

      return [...prev, { id, message }];
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[448px] flex flex-col gap-2 z-50 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="px-4 py-3 bg-[var(--color-border)] text-[var(--color-fg)] text-sm rounded-lg"
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
