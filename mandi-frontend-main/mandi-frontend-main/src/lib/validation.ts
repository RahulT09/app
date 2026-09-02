import { z } from "zod";

// These mirror src/validations/*.js on the backend for immediate UX feedback.
// The backend re-validates everything server-side regardless — this layer
// never substitutes for that.

export const registerSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters").max(128),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a 10-digit phone number")
    .optional()
    .or(z.literal("")),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "At least 8 characters").max(128),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(1, "Required"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Enter a 10-digit phone number"),
  addressLine: z.string().trim().min(15, "At least 15 characters"),
  city: z.string().trim().min(1, "Required"),
  state: z.string().trim().min(1, "Required"),
  postalCode: z.string().trim().min(1, "Required"),
  country: z.string().trim().min(1, "Required"),
  isDefault: z.boolean().optional(),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(50),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).min(1),
  price: z.coerce.number().min(0, "Cannot be negative"),
  stock: z.coerce.number().int("Whole numbers only").min(0, "Cannot be negative"),
  category: z.string().min(1, "Choose a category"),
});
export type ProductInput = z.infer<typeof productSchema>;
