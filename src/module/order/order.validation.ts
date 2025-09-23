import { z } from "zod";
import { PaymentMethod, OrderStatus } from "../../enum/order.enum";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
});

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(6),
  fullAddress: z.string().min(1),
  note: z.string().optional().nullable(),
});

export const checkoutSchema = z.object({
  body: z.object({
    items: z.array(orderItemSchema).min(1),
    customer: customerSchema,
    paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.COD),
    shippingLocation: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(OrderStatus),
  }),
});