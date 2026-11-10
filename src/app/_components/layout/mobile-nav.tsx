"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/app/_lib/utils/cn";

const navigation = [
  {
    label: "Dashboard",
    href: "/",
  },
  {
    label: "Barangay Map",
    href: "/map",
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
  {
    label: "Assistance",
    href: "/assistance",
  },
  {
    label: "Reports",
    href: "/reports",
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
        className="rounded-xl p-2 text-(--muted) hover:bg-(--surface-muted) lg:hidden"
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

          <aside className="relative h-full w-72 bg-(--surface) shadow-xl">
            <div className="flex h-16 items-center justify-between px-5">
              <div>
                <p className="font-semibold">Barangay Monitoring</p>

                <p className="text-xs text-(--muted)">
                  Community Information System
                </p>
              </div>

              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-(--muted) hover:bg-(--surface-muted)"
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
                      "block rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-(--accent) text-(--accent-foreground)"
                        : "text-(--muted) hover:bg-(--surface-muted) hover:text-(--foreground)",
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
