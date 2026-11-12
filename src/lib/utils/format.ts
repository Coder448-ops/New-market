/** Format UZS amount: 5790000 -> "5 790 000 so‘m" */
export function formatPrice(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${new Intl.NumberFormat("uz-UZ").format(value)} so‘m`;
}

/** Compact price for cards: 5790000 -> "5 790 000 so‘m" (same, kept for API clarity) */
export const formatUZS = formatPrice;

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function discountPercent(price: number, discountPrice: number | null): number {
  if (!discountPrice || price <= 0) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function effectivePrice(p: { price: number; discount_price: number | null }): number {
  return p.discount_price ?? p.price;
}
