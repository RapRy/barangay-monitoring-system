import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

export const APP_ROLES = ["admin", "staff", "viewer"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export type GraphQLContext = {
  supabase: ReturnType<typeof createServerClient>;
  user: User | null;
  role: AppRole | null;
};

export async function createGraphQLContext(): Promise<GraphQLContext> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Cookie updates can fail when called from certain
            // server component contexts.
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      role: null,
    };
  }

  let role: AppRole | null = null;

  if (user) {
    const { data } = await supabase.rpc("get_user_role");

    if (typeof data === "string" && APP_ROLES.includes(data as AppRole)) {
      role = data as AppRole;
    }
  }

  return {
    supabase,
    user,
    role,
  };
}
