import { createServerSupabase } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return Boolean(data);
}

export async function requireAdmin(): Promise<{ user: User } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Kirish talab qilinadi" };
  if (!(await isAdmin(user.id))) return { error: "Admin huquqi talab qilinadi" };
  return { user };
}
