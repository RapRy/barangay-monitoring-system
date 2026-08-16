import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">
        Authentication Successful
      </h1>

      <p className="mt-4">
        Welcome, {user.email}
      </p>

      <LogoutButton />
    </main>
  );
}