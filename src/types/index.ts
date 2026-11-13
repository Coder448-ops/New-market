import type { Database } from "./database";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Brand = Database["public"]["Tables"]["brands"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Coupon = Database["public"]["Tables"]["coupons"]["Row"];
export type Banner = Database["public"]["Tables"]["banners"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Address = Database["public"]["Tables"]["addresses"]["Row"];

export type ProductWithRelations = Product & {
  brand?: Brand | null;
  category?: Category | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
};

export type CartItemView = {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  product: ProductWithRelations;
  variant?: ProductVariant | null;
};

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "payme" | "click";
export type DeliveryMethod = "courier" | "pickup";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlangan",
  processing: "Tayyorlanmoqda",
  shipped: "Yuborilgan",
  delivered: "Yetkazilgan",
  cancelled: "Rad etilgan / bekor qilingan",
};
