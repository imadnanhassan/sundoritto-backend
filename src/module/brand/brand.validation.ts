import { z } from "zod";

export const createBrandSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Brand name is required"),
      logo: z
        .string()
        .regex(/^(http(s)?:\/\/.*\.(?:png|jpg|jpeg|svg))$/, "Invalid logo URL")
        .optional()
        .nullable(),
      slug: z
        .string()
        .min(1, "Slug is required")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
        .optional(),
    })
    .strict(),
});

export const updateBrandSchema = z.object({
  body: z
    .object({
      name: z.string().min(1).optional(),
      logo: z
        .string()
        .regex(/^(http(s)?:\/\/.*\.(?:png|jpg|jpeg|svg))$/, "Invalid logo URL")
        .optional()
        .nullable(),
      slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
        .optional(),
    })
    .strict(),
});