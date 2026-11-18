import { redirect } from "next/navigation";

import { createClient } from "@/app/_lib/supabase/server";
import { AppShell } from "@/app/_components/layout/app-shell";

import "leaflet/dist/leaflet.css";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_active) {
    await supabase.auth.signOut();
    redirect("/account-pending");
  }

  const { data: role } = await supabase.rpc("get_user_role");
  const isAdmin = role === "admin";

  return (
    <AppShell email={user.email} isAdmin={isAdmin}>
      {children}
    </AppShell>
  );
}
