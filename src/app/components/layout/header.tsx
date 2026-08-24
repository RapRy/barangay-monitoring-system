"use client";

import { MobileNav } from "./mobile-nav";
import { LogoutButton } from "./logout-button";

interface HeaderProps {
  email?: string;
}

export function Header({ email }: HeaderProps) {
  return (
    <header className="flex h-16 items-center border-b border-[var(--border)] bg-white px-4 sm:px-6">
      <div className="lg:hidden">
        <MobileNav />
      </div>

      <div className="ml-3 lg:hidden">
        <p className="text-sm font-semibold">Barangay Monitoring</p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {email && (
          <span className="hidden text-sm text-[var(--muted)] sm:block">
            {email}
          </span>
        )}

        <LogoutButton />
      </div>
    </header>
  );
}
