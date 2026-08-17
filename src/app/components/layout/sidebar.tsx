"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/utils/cn";

const navigation = [
  {
    label: "Overview",
    href: "/protected",
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-white lg:block">
      <div className="flex h-16 items-center border-b border-[var(--border)] px-6">
        <div>
          <p className="font-semibold">
            Barangay Monitoring
          </p>

          <p className="text-xs text-[var(--muted)]">
            Community Information System
          </p>
        </div>
      </div>

      <nav className="space-y-1 p-4">
        {navigation.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-teal-50 text-[var(--primary)]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}