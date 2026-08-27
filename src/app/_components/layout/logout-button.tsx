"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/app/_lib/auth/logout";
import { Button } from "@/app/_components/ui/button";
import { useToast } from "@/app/_providers/toast-provider";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await logout();

      router.push("/login");
      router.refresh();
    } catch (error) {
      showToast("Unable to log out. Please try again.", "error");

      setIsLoggingOut(false);
    }
  };

  return (
    <Button type="button" onClick={handleLogout} loading={isLoggingOut}>
      {isLoggingOut ? "Logging out..." : "Logout"}
    </Button>
  );
}
