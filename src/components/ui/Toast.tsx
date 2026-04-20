'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type Tone = 'info' | 'success' | 'error';

type Toast = {
  id: number;
  tone: Tone;
  title: string;
  description?: string;
};

type ToastContextValue = {
  push: (t: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Tiny zero-dependency toast system.
 * Wrap the tree once in <ToastProvider> and call `useToast().success(...)`
 * from anywhere underneath.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = nextId.current++;
    setToasts(prev => [...prev, { ...t, id }]);
    // Auto-dismiss after 3.5s
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== id));
    }, 3500);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (title, description) =>
        push({ tone: 'success', title, description }),
      error: (title, description) =>
        push({ tone: 'error', title, description }),
      info: (title, description) => push({ tone: 'info', title, description }),
    }),
    [push],
  );

  const dismiss = (id: number) =>
    setToasts(prev => prev.filter(x => x.id !== id));

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-[min(92vw,360px)] flex-col gap-2"
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const tone = toast.tone;
  const marker = tone === 'success' ? '✓' : tone === 'error' ? '!' : '';
  const markerStyle =
    tone === 'success'
      ? 'bg-foreground text-background'
      : tone === 'error'
        ? 'bg-red-500 text-white'
        : 'bg-muted text-foreground';

  return (
    <div
      onClick={onDismiss}
      className={`pointer-events-auto flex cursor-pointer items-start gap-3 rounded-md border border-border bg-background p-3 shadow-lg transition-all duration-200 ${
        entered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <span
        className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] ${markerStyle}`}
      >
        {marker}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {toast.description}
          </p>
        )}
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        ×
      </span>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Safe no-op if provider is missing so components don't crash.
    return {
      push: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return ctx;
}
