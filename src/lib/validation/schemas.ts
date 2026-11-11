import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^(\+998[\s-]?)?(\d{2}[\s-]?)?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/, "Telefon raqam noto‘g‘ri formatda");

export const registerSchema = z.object({
  firstName: z.string().min(2, "Ism kamida 2 ta belgi bo‘lishi kerak"),
  lastName: z.string().min(2, "Familiya kamida 2 ta belgi bo‘lishi kerak"),
  email: z.string().email("Email noto‘g‘ri"),
  phone: phoneSchema.optional().or(z.literal("")),
  password: z.string().min(8, "Parol kamida 8 ta belgi bo‘lishi kerak"),
});

export const loginSchema = z.object({
  email: z.string().email("Email noto‘g‘ri"),
  password: z.string().min(1, "Parolni kiriting"),
});

export const checkoutSchema = z.object({
  firstName: z.string().min(2, "Ismni kiriting"),
  lastName: z.string().min(2, "Familiyani kiriting"),
  phone: phoneSchema,
  email: z.string().email("Email noto‘g‘ri").optional().or(z.literal("")),
  region: z.string().min(1, "Hududni tanlang"),
  city: z.string().min(1, "Shaharni kiriting"),
  address: z.string().min(5, "Manzilni batafsil yozing"),
  deliveryMethod: z.enum(["courier", "pickup"]),
  paymentMethod: z.enum(["cod", "payme", "click"]),
  notes: z.string().max(500).optional(),
  couponCode: z.string().max(32).optional(),
  idempotencyKey: z.string().min(8),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().min(5, "Sharh kamida 5 ta belgi bo‘lishi kerak").max(2000),
});

export const productSchema = z.object({
  name: z.string().min(3, "Mahsulot nomi kamida 3 ta belgi"),
  slug: z.string().min(3),
  description: z.string().optional(),
  shortDescription: z.string().max(300).optional(),
  sku: z.string().optional(),
  brandId: z.string().uuid().optional().or(z.literal("")),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  price: z.coerce.number().int().min(0, "Narx 0 dan kichik bo‘la olmaydi"),
  discountPrice: z.coerce.number().int().min(0).optional().or(z.literal("")),
  stock: z.coerce.number().int().min(0),
  mainImage: z.string().url().optional().or(z.literal("")),
  specifications: z.string().optional(),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  parentId: z.string().uuid().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export const brandSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  logoUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(32),
  discountType: z.enum(["percent", "fixed"]),
  discountValue: z.coerce.number().int().min(1),
  minOrder: z.coerce.number().int().min(0),
  maxDiscount: z.coerce.number().int().min(0).optional().or(z.literal("")),
  usageLimit: z.coerce.number().int().min(1).optional().or(z.literal("")),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
});

export const bannerSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  linkUrl: z.string().optional(),
  position: z.string().min(1),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BrandInput = z.infer<typeof brandSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type BannerInput = z.infer<typeof bannerSchema>;
