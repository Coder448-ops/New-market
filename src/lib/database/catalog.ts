import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/config/site";
import type { Banner, Brand, Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  return data ?? null;
}

export async function getBrands(): Promise<Brand[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("brands").select("*").eq("is_active", true).order("name");
  return data ?? [];
}

export async function getBanners(position = "hero"): Promise<Banner[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("position", position)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getSiteSettings(): Promise<Record<string, unknown>> {
  if (!isSupabaseConfigured()) return {};
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("site_settings").select("key,value");
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
}
