import { z } from "zod";
import { CategoryStatus } from "../../enum/category.enum";

export const createCategorySchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Category name is required"),
      status: z.enum([CategoryStatus.ACTIVE, CategoryStatus.INACTIVE]).optional(),
      banner: z
        .string()
        .regex(/^(http(s)?:\/\/.*\.(?:png|jpg|jpeg))$/, "Invalid banner URL")
        .optional()
        .nullable(),
      icon: z
        .string()
        .regex(/^(http(s)?:\/\/.*\.(?:png|jpg|jpeg|svg))$/, "Invalid icon URL")
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

export const updateCategorySchema = z.object({
  body: z
    .object({
      name: z.string().min(1).optional(),
      status: z.enum([CategoryStatus.ACTIVE, CategoryStatus.INACTIVE]).optional(),
      banner: z
        .string()
        .regex(/^(http(s)?:\/\/.*\.(?:png|jpg|jpeg))$/, "Invalid banner URL")
        .optional()
        .nullable(),
      icon: z
        .string()
        .regex(/^(http(s)?:\/\/.*\.(?:png|jpg|jpeg|svg))$/, "Invalid icon URL")
        .optional()
        .nullable(),
      slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
        .optional(),
    })
    .strict(),
});