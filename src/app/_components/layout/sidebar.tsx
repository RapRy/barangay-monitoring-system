"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 bg-(--surface) lg:block">
      <div className="flex h-16 items-center px-6">
        <div className="mr-3 grid h-9 w-9 grid-cols-2 gap-1 rounded-xl bg-(--accent) p-2">
          <span className="rounded-sm bg-(--primary)" />
          <span className="rounded-sm bg-(--primary) opacity-70" />
          <span className="rounded-sm bg-(--primary) opacity-70" />
          <span className="rounded-sm bg-(--primary)" />
        </div>
        <div>
          <p className="font-semibold tracking-tight">Barangay Monitoring</p>
          <p className="text-xs text-(--muted)">Community Information System</p>
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
                "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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
  );
}
