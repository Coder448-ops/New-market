// Domain row types for database/migrations/001_init.sql

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

interface RawDatabase {
  public: {
    Tables: {
      profiles: { Row: { id: string; first_name: string; last_name: string; phone: string | null; avatar_url: string | null; created_at: string; updated_at: string } };
      user_roles: { Row: { id: string; user_id: string; role: "customer" | "admin"; created_at: string } };
      addresses: { Row: { id: string; user_id: string; title: string; region: string; city: string; street: string; building: string | null; apartment: string | null; postal_code: string | null; is_default: boolean; created_at: string; updated_at: string } };
      categories: { Row: { id: string; parent_id: string | null; name: string; slug: string; description: string | null; image_url: string | null; sort_order: number; is_active: boolean; created_at: string; updated_at: string } };
      brands: { Row: { id: string; name: string; slug: string; logo_url: string | null; description: string | null; is_active: boolean; created_at: string; updated_at: string } };
      products: { Row: { id: string; name: string; slug: string; description: string | null; short_description: string | null; sku: string | null; brand_id: string | null; category_id: string | null; price: number; discount_price: number | null; stock: number; main_image: string | null; specifications: Json; rating: number; review_count: number; is_published: boolean; is_featured: boolean; created_at: string; updated_at: string } };
      product_images: { Row: { id: string; product_id: string; url: string; alt: string | null; sort_order: number; created_at: string } };
      product_variants: { Row: { id: string; product_id: string; name: string; sku: string | null; price: number; stock: number; attributes: Json; created_at: string; updated_at: string } };
      carts: { Row: { id: string; user_id: string | null; session_id: string | null; created_at: string; updated_at: string } };
      cart_items: { Row: { id: string; cart_id: string; product_id: string; variant_id: string | null; quantity: number; created_at: string } };
      orders: { Row: { id: string; order_number: string; user_id: string | null; status: string; payment_method: string; payment_status: string; first_name: string; last_name: string; phone: string; email: string | null; region: string; city: string; address: string; delivery_method: string; notes: string | null; subtotal: number; discount_total: number; delivery_fee: number; total: number; coupon_code: string | null; idempotency_key: string | null; created_at: string; updated_at: string } };
      order_items: { Row: { id: string; order_id: string; product_id: string | null; variant_id: string | null; product_name: string; sku: string | null; unit_price: number; quantity: number; line_total: number; created_at: string } };
      payments: { Row: { id: string; order_id: string; provider: string; provider_txn_id: string | null; amount: number; status: string; raw_response: Json | null; created_at: string; updated_at: string } };
      favorites: { Row: { id: string; user_id: string; product_id: string; created_at: string } };
      reviews: { Row: { id: string; user_id: string; product_id: string; order_id: string | null; rating: number; title: string | null; comment: string | null; is_verified_purchase: boolean; is_approved: boolean; created_at: string; updated_at: string } };
      coupons: { Row: { id: string; code: string; discount_type: string; discount_value: number; min_order: number; max_discount: number | null; usage_limit: number | null; used_count: number; starts_at: string; expires_at: string | null; is_active: boolean; created_at: string; updated_at: string } };
      coupon_redemptions: { Row: { id: string; coupon_id: string; user_id: string | null; order_id: string | null; discount: number; created_at: string } };
      banners: { Row: { id: string; title: string; subtitle: string | null; image_url: string | null; link_url: string | null; position: string; sort_order: number; is_active: boolean; starts_at: string | null; ends_at: string | null; created_at: string; updated_at: string } };
      notifications: { Row: { id: string; user_id: string; type: string; title: string; message: string | null; data: Json | null; is_read: boolean; created_at: string } };
      site_settings: { Row: { key: string; value: Json; updated_at: string } };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Shared row type map.
type Tables = RawDatabase["public"]["Tables"];
export type Database = { public: { Tables: { [K in keyof Tables]: Tables[K] & { Insert: Partial<Tables[K]["Row"]>; Update: Partial<Tables[K]["Row"]>; Relationships: [] } }; Views: Record<string, never>; Functions: Record<string, never>; Enums: Record<string, never>; CompositeTypes: Record<string, never> } };
