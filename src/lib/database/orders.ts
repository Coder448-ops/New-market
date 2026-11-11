import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/config/site";
import type { Order, OrderItem } from "@/types";

export async function getUserOrders(userId: string): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getOrderWithItems(orderId: string, userId?: string): Promise<{ order: Order; items: OrderItem[] } | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabase();
  let q = supabase.from("orders").select("*").eq("id", orderId);
  if (userId) q = q.eq("user_id", userId);
  const { data: order } = await q.maybeSingle();
  if (!order) return null;
  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  return { order, items: items ?? [] };
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("orders").select("*").eq("order_number", orderNumber).maybeSingle();
  return data ?? null;
}
