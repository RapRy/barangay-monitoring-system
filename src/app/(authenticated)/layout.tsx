import { redirect } from "next/navigation";

import { createClient } from "@/app/_lib/supabase/server";
import { AppShell } from "@/app/_components/layout/app-shell";

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

  return <AppShell email={user.email}>{children}</AppShell>;
}
