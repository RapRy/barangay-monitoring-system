"use client";

import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/app/components/ui/button";
import { MobileNav } from "./mobile-nav";
import { useToast } from "@/app/providers/toast-provider";

interface HeaderProps {
  email?: string;
}

export function Header({ email }: HeaderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleLogout() {
    setLoading(true);
  
    const supabase = createClient();
  
    const { error } = await supabase.auth.signOut();
  
    if (error) {
      showToast(
        "Unable to log out. Please try again.",
        "error"
      );
  
      setLoading(false);
      return;
    }
  
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center border-b border-[var(--border)] bg-white px-4 sm:px-6">
      <div className="lg:hidden">
        <MobileNav />
      </div>

      <div className="ml-3 lg:hidden">
        <p className="text-sm font-semibold">
          Barangay Monitoring
        </p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {email && (
          <span className="hidden text-sm text-[var(--muted)] sm:block">
            {email}
          </span>
        )}

        <Button
          variant="outline"
          loading={loading}
          onClick={handleLogout}
        >
          {loading ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </header>
  );
}