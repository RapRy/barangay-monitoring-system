"use client";

import { cn } from "@/app/lib/utils/cn";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({
  message,
  type,
  onClose,
}: ToastProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-white p-4 shadow-lg",

        type === "success" &&
          "border-green-200",

        type === "error" &&
          "border-red-200",

        type === "info" &&
          "border-blue-200",

        type === "warning" &&
          "border-amber-200"
      )}
      role="alert"
    >
      <div className="flex-1">
        <p className="text-sm text-[var(--foreground)]">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}