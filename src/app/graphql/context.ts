import { createClient } from "@/app/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type GraphQLContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User | null;
};

export async function createContext(): Promise<GraphQLContext> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    supabase,
    user,
  };
}