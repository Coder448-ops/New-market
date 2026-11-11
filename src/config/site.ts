export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "NEX MARKET",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  defaultRegion: process.env.NEXT_PUBLIC_DEFAULT_REGION ?? "Toshkent",
  currency: "UZS",
  deliveryFee: Number(process.env.DELIVERY_FEE_UZS ?? 25000),
  freeDeliveryThreshold: Number(process.env.FREE_DELIVERY_THRESHOLD_UZS ?? 500000),
  phone: "+998 71 200 00 00",
  email: "info@nexmarket.uz",
  address: "Toshkent sh., Amir Temur shoh ko‘chasi, 1-uy",
};

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
