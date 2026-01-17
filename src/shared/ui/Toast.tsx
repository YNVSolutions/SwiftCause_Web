import React, { useEffect } from "react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onClose?: () => void;
  durationMs?: number;
}

export function Toast({ message, variant = "info", onClose, durationMs = 2500 }: ToastProps) {
  useEffect(() => {
    if (!onClose) return;
    const id = setTimeout(() => onClose?.(), durationMs);
    return () => clearTimeout(id);
  }, [onClose, durationMs]);

  const palette: Record<ToastVariant, { bg: string; border: string; text: string; iconBg: string; icon: React.ReactElement }> = {
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-800",
      text: "text-emerald-900 dark:text-emerald-100",
      iconBg: "bg-emerald-500",
      icon: (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 stroke-white">
          <path d="M16.667 5.833l-8.334 8.334L3.333 9.167" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-900 dark:text-red-100",
      iconBg: "bg-red-500",
      icon: (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 stroke-white">
          <path d="M10 6.667v4.166m0 2.5h.008M9.999 1.667a8.333 8.333 0 1 0 0 16.666 8.333 8.333 0 0 0 0-16.666Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
      text: "text-amber-900 dark:text-amber-100",
      iconBg: "bg-amber-500",
      icon: (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 stroke-white">
          <path d="M10 7.5v3.333m0 3.334h.008M9.117 3.383 1.96 15a1.667 1.667 0 0 0 1.44 2.5h13.2a1.667 1.667 0 0 0 1.442-2.5L10.883 3.383a1.667 1.667 0 0 0-2.766 0Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-900 dark:text-blue-100",
      iconBg: "bg-blue-500",
      icon: (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 stroke-white">
          <path d="M10 7.5h.008M10 10v4.167M10 1.667a8.333 8.333 0 1 0 0 16.666 8.333 8.333 0 0 0 0-16.666Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
  };

  const p = palette[variant];

  return (
    <div className={`pointer-events-auto inline-flex max-w-sm items-center gap-3 rounded-md border px-3 py-2 shadow-sm ${p.bg} ${p.border}`} role="status" aria-live="polite">
      <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${p.iconBg}`}>{p.icon}</span>
      <span className={`text-sm font-medium ${p.text}`}>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Close"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 stroke-current">
            <path d="M13.333 6.667 6.667 13.333M6.667 6.667l6.666 6.666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

interface ToastHostProps {
  children?: React.ReactNode;
  visible: boolean;
  align?: "top" | "bottom";
}

export function ToastHost({ children, visible, align = "top" }: ToastHostProps) {
  if (!visible) return null;
  const vertical = align === "top" ? "top-4" : "bottom-4";
  return (
    <div className={`pointer-events-none fixed left-1/2 z-50 -translate-x-1/2 ${vertical}`}>
      <div className="pointer-events-auto">
        {children}
      </div>
    </div>
  );
}

