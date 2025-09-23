import { z } from "zod";
import { DiscountType, ShippingType } from "../../enum/product.enum";

const specItemSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

const variantSchema = z.object({
  name: z.string().min(1),
  options: z.array(z.string().min(1)).nonempty(),
});

const locationShippingSchema = z.object({
  location: z.string().min(1),
  price: z.number().min(0),
});

const discountSchema = z.object({
  type: z.enum([DiscountType.PERCENT, DiscountType.FLAT]),
  value: z.number().min(0),
});

const shippingSchema = z.object({
  type: z.enum([ShippingType.FREE, ShippingType.LOCATION_BASED]).default(ShippingType.FREE),
  locations: z.array(locationShippingSchema).optional(),
});

export const createProductSchema = z.object({
  body: z
    .object({
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.string().min(1),
      brand: z.string().min(1),
      price: z.number().min(0),
      discount: discountSchema.optional(),
      stock: z.number().int().min(0).optional(),
      longDescription: z.string().optional(),
      specification: z.array(specItemSchema).optional(),
      shipping: shippingSchema.optional(),
      thumbnail: z
        .string()
        .regex(/^(http(s)?:\/\/.*\.(?:png|jpg|jpeg))$/, "Invalid thumbnail URL")
        .optional()
        .nullable(),
      gallery: z
        .array(
          z
            .string()
            .regex(/^(http(s)?:\/\/.*\.(?:png|jpg|jpeg))$/, "Invalid gallery image URL")
        )
        .optional(),
      variants: z.array(variantSchema).optional(),
      qna: z.array(
        z.object({
          question: z.string().min(1),
          answer: z.string().optional().nullable(),
          askedBy: z.string().optional(),
          answeredBy: z.string().optional().nullable(),
        })
      ).optional(),
      howToUse: z.string().optional(),
      slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
        .optional(),
    })
    .strict(),
});

export const updateProductSchema = z.object({
  body: z
    .object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      category: z.string().min(1).optional(),
      brand: z.string().min(1).optional(),
      price: z.number().min(0).optional(),
      discount: discountSchema.optional().nullable(),
      stock: z.number().int().min(0).optional(),
      longDescription: z.string().optional(),
      specification: z.array(specItemSchema).optional(),
      shipping: shippingSchema.optional(),
      thumbnail: z
        .string()
        .regex(/^(http(s)?:\/\/.*\.(?:png|jpg|jpeg))$/, "Invalid thumbnail URL")
        .optional()
        .nullable(),
      gallery: z
        .array(
          z
            .string()
            .regex(/^(http(s)?:\/\/.*\.(?:png|jpg|jpeg))$/, "Invalid gallery image URL")
        )
        .optional(),
      variants: z.array(variantSchema).optional(),
      qna: z.array(
        z.object({
          question: z.string().min(1),
          answer: z.string().optional().nullable(),
          askedBy: z.string().optional(),
          answeredBy: z.string().optional().nullable(),
        })
      ).optional(),
      howToUse: z.string().optional(),
      slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
        .optional(),
    })
    .strict(),
});

export const rateProductSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    review: z.string().optional(),
  }),
});