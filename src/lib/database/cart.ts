import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/config/site";
import type { CartItemView, ProductWithRelations } from "@/types";

const ITEM_SELECT = "*, product:products(*, brand:brands(*), category:categories(*)), variant:product_variants(*)";

export async function getOrCreateCart(userId: string | null, sessionId: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabase();
  if (userId) {
    const { data: existing } = await supabase.from("carts").select("*").eq("user_id", userId).maybeSingle();
    if (existing) return existing;
    const { data: created } = await supabase.from("carts").insert({ user_id: userId }).select().single();
    return created;
  }
  // Anonymous browser carts stay local; never look them up with a service key.
  void sessionId;
  return null;
}

export async function getCartItems(cartId: string): Promise<CartItemView[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("cart_items")
    .select(ITEM_SELECT)
    .eq("cart_id", cartId)
    .order("created_at", { ascending: true });
  return ((data ?? []) as unknown[]).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      product_id: r.product_id as string,
      variant_id: (r.variant_id as string | null) ?? null,
      quantity: r.quantity as number,
      product: r.product as ProductWithRelations,
      variant: (r.variant as CartItemView["variant"]) ?? null,
    };
  });
}

export function cartTotals(items: CartItemView[]) {
  const subtotal = items.reduce((sum, i) => {
    const unit = i.variant ? i.variant.price : (i.product.discount_price ?? i.product.price);
    return sum + unit * i.quantity;
  }, 0);
  return { subtotal, count: items.reduce((s, i) => s + i.quantity, 0) };
}
