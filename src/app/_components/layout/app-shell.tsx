import { ReactNode } from "react";

import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppShellProps {
  children: ReactNode;
  email?: string;
  isAdmin?: boolean;
}

export function AppShell({ children, email, isAdmin = false }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-(--background)">
      <Sidebar isAdmin={isAdmin} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header email={email} isAdmin={isAdmin} />

        <div className="flex-1">
          <div className="app-content w-full max-w-none">{children}</div>
        </div>
      </div>
    </div>
  );
}
