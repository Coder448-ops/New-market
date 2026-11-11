import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/config/site";
import type { ProductWithRelations } from "@/types";

const PRODUCT_SELECT =
  "*, brand:brands(*), category:categories(*), images:product_images(*), variants:product_variants(*)";

export type ProductFilters = {
  search?: string;
  categorySlug?: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "popular" | "price-asc" | "price-desc" | "newest";
  page?: number;
  pageSize?: number;
};

export async function getProducts(filters: ProductFilters = {}): Promise<{ products: ProductWithRelations[]; total: number }> {
  if (!isSupabaseConfigured()) return { products: [], total: 0 };
  const supabase = await createServerSupabase();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 24;
  const from = (page - 1) * pageSize;

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("is_published", true);

  if (filters.search) {
    const s = filters.search.replace(/[,().%_\\]/g, " ").slice(0, 100);
    query = query.or(`name.ilike.%${s}%,description.ilike.%${s}%,sku.ilike.%${s}%`);
  }
  if (filters.categorySlug) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", filters.categorySlug).maybeSingle();
    if (!cat) return { products: [], total: 0 };
    query = query.eq("category_id", cat.id);
  }
  if (filters.brandSlug) {
    const { data: brand } = await supabase.from("brands").select("id").eq("slug", filters.brandSlug).maybeSingle();
    if (!brand) return { products: [], total: 0 };
    query = query.eq("brand_id", brand.id);
  }
  if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);
  if (filters.inStock) query = query.gt("stock", 0);

  switch (filters.sort) {
    case "price-asc": query = query.order("price", { ascending: true }); break;
    case "price-desc": query = query.order("price", { ascending: false }); break;
    case "newest": query = query.order("created_at", { ascending: false }); break;
    default: query = query.order("review_count", { ascending: false }).order("rating", { ascending: false });
  }

  const { data, count, error } = await query.range(from, from + pageSize - 1);
  if (error) throw error;
  return { products: (data ?? []) as ProductWithRelations[], total: count ?? 0 };
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as ProductWithRelations) ?? null;
}

export async function getFeaturedProducts(limit = 8): Promise<ProductWithRelations[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ProductWithRelations[];
}

export async function getDiscountedProducts(limit = 8): Promise<ProductWithRelations[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .not("discount_price", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ProductWithRelations[];
}

export async function getNewProducts(limit = 8): Promise<ProductWithRelations[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ProductWithRelations[];
}

export async function getRelatedProducts(productId: string, categoryId: string | null, limit = 4): Promise<ProductWithRelations[]> {
  if (!isSupabaseConfigured() || !categoryId) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .eq("category_id", categoryId)
    .neq("id", productId)
    .limit(limit);
  return (data ?? []) as ProductWithRelations[];
}

export async function searchSuggestions(q: string, limit = 6): Promise<ProductWithRelations[]> {
  if (!isSupabaseConfigured() || q.trim().length < 2) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("products")
    .select("id,name,slug,price,discount_price,main_image")
    .eq("is_published", true)
    .ilike("name", `%${q}%`)
    .limit(limit);
  return (data ?? []) as ProductWithRelations[];
}
