import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/app/_lib/supabase/server";

async function toggleUserActivation(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: role } = await supabase.rpc("get_user_role");

  if (role !== "admin") {
    redirect("/");
  }

  const userId = formData.get("userId");

  if (typeof userId !== "string" || !userId || userId === user.id) {
    return;
  }

  const { data: targetProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", userId)
    .maybeSingle();

  if (fetchError || !targetProfile) {
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      is_active: !targetProfile.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/users");
}

export default async function UserAccessPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: role } = await supabase.rpc("get_user_role");

  if (role !== "admin") {
    redirect("/");
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="space-y-5 p-5 sm:p-6">
      <div className="app-panel p-6">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-(--muted)">
          Access control
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-(--foreground)">
          User approvals
        </h1>
        <p className="mt-2 text-sm text-(--muted)">
          Activate or deactivate accounts before they can sign in.
        </p>
      </div>

      <section className="app-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-(--surface-muted)">
              <tr>
                <th className="px-4 py-3 font-medium text-(--foreground)">
                  Name
                </th>
                <th className="px-4 py-3 font-medium text-(--foreground)">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-(--foreground)">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {(profiles ?? []).map((profile) => (
                <tr
                  key={profile.id}
                  className="app-table-row border-t border-(--table-border) align-middle"
                >
                  <td className="px-4 py-3 text-(--foreground)">
                    {profile.full_name || "Unnamed user"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        profile.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {profile.is_active ? "Active" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleUserActivation}>
                      <input type="hidden" name="userId" value={profile.id} />
                      <button
                        type="submit"
                        disabled={profile.id === user.id}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-(--border) px-3 text-sm font-medium text-(--foreground) transition hover:bg-(--surface-muted) disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {profile.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
