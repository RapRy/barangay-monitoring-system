"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/app/_lib/utils/cn";

const navigation = [
  {
    label: "Overview",
    href: "/",
  },
  {
    label: "Households",
    href: "/households",
  },
  {
    label: "Residents",
    href: "/residents",
  },
  {
    label: "Surveys",
    href: "/surveys",
  },
  {
    label: "Cases",
    href: "/cases",
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />

          <aside className="relative h-full w-72 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-5">
              <div>
                <p className="font-semibold">Barangay Monitoring</p>

                <p className="text-xs text-[var(--muted)]">
                  Community Information System
                </p>
              </div>

              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="space-y-1 p-4">
              {navigation.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-lg px-3 py-3 text-sm font-medium",
                      active
                        ? "bg-teal-50 text-[var(--primary)]"
                        : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
