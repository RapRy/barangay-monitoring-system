import { NextResponse } from "next/server";

import { createClient } from "@/app/_lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = await createClient();
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=profile`);
  }

  if (!profile?.is_active) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/account-pending`);
  }

  return NextResponse.redirect(`${origin}/`);
}
