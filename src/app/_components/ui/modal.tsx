"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ReactNode } from "react";

import { cn } from "@/app/_lib/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      {/* Modal container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            className={cn(
              "w-full max-w-2xl rounded-xl bg-white shadow-xl",
              className,
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <DialogTitle className="text-lg font-semibold">
                {title}
              </DialogTitle>

              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6">{children}</div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
