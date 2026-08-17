import { ReactNode } from "react";

import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppShellProps {
  children: ReactNode;
  email?: string;
}

export function AppShell({
  children,
  email,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header email={email} />

        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}