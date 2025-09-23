import AppError from "../../error/appError";
import { StatusCodes } from "http-status-codes";
import Order from "./order.model";
import { IOrder } from "./order.interface";
import Product, { Product as ProductModel } from "../product/product.model";
import { ShippingType } from "../../enum/product.enum";
import { IJwtPayload } from "../auth/auth.interface";
import { Types } from "mongoose";
import { OrderStatus } from "../../enum/order.enum";

const getEffectiveUnitPrice = (p: any): number {
  // If active flash deal with dealPrice, use it; otherwise apply discount if any
  const now = new Date();
  if (p.isFlashDeal && p.flashDeal?.startAt && p.flashDeal?.endAt) {
    const start = new Date(p.flashDeal.startAt);
    const end = new Date(p.flashDeal.endAt);
    if (start <= now && now <= end && typeof p.flashDeal.dealPrice === "number") {
      return p.flashDeal.dealPrice;
    }
  }
  if (p.discount?.type && typeof p.discount?.value === "number") {
    if (p.discount.type === "percent") {
      return Math.max(0, p.price - (p.price * p.discount.value) / 100);
    } else {
      return Math.max(0, p.price - p.discount.value);
    }
  }
  return p.price;
}

const computeShippingForItem = (p: any, quantity: number, location?: string): number => {
  if (p.shipping?.type === ShippingType.FREE) {
    return 0;
  }
  if (p.shipping?.type === ShippingType.LOCATION_BASED) {
    if (!location) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Shipping location is required for location based shipping"
      );
    }
    const entry = (p.shipping.locations || []).find((l: any) => l.location?.toLowerCase() === location.toLowerCase());
    if (!entry) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `No shipping price for location: ${location}`
      );
    }
    return (entry.price || 0) * quantity;
  }
  return 0;
};

const checkout = async (
  payload: {
    items: { productId: string; quantity: number }[];
    customer: { name: string; phone: string; fullAddress: string; note?: string | null };
    shippingLocation?: string;
    paymentMethod: "cod";
  },
  authUser?: IJwtPayload
): Promise<IOrder> => {
  // Load products
  const productIds = payload.items.map((i) => new Types.ObjectId(i.productId));
  const products = await Product.find({ _id: { $in: productIds } });

  // Build items and compute totals
  let subtotal = 0;
  let shippingCost = 0;
  const orderItems = payload.items.map((it) => {
    const p = products.find((pp) => pp._id.toString() === it.productId);
    if (!p) {
      throw new AppError(StatusCodes.NOT_FOUND, "One or more products not found");
    }

    // Voucher rule: if voucherBalance > 0, product must have free delivery
    const voucherBalance = (p as any).voucherBalance || 0;
    if (voucherBalance > 0 && p.shipping?.type !== ShippingType.FREE) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Product "${p.name}" with voucher balance requires free delivery`
      );
    }

    if (p.stock < it.quantity) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Insufficient stock for product "${p.name}"`
      );
    }

    const unitPrice = getEffectiveUnitPrice(p as any);
    const totalPrice = unitPrice * it.quantity;
    subtotal += totalPrice;
    shippingCost += computeShippingForItem(p, it.quantity, payload.shippingLocation);

    return {
      product: p._id,
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      thumbnail: p.thumbnail,
      unitPrice,
      quantity: it.quantity,
      totalPrice,
      voucherBalance,
    };
  });

  const total = subtotal + shippingCost;

  // Deduct stocks
  for (const it of payload.items) {
    await ProductModel.updateOne(
      { _id: new Types.ObjectId(it.productId) },
      { $inc: { stock: -it.quantity } }
    );
  }

  const order = await Order.create({
    user: authUser?.userId ? new Types.ObjectId(authUser.userId) : null,
    items: orderItems,
    customer: payload.customer,
    paymentMethod: "cod",
    status: "processing",
    shippingLocation: payload.shippingLocation || null,
    shippingCost,
    subtotal,
    total,
  } as any);

  return order;
};

const myOrders = async (authUser: IJwtPayload) => {
  return await Order.find({ user: new Types.ObjectId(authUser.userId) }).sort({ createdAt: -1 });
};

const listOrders = async () => {
  return await Order.find().sort({ createdAt: -1 });
};

const updateOrderStatus = async (id: string, status: OrderStatus) => {
  const order = await Order.findById(id);
  if (!order) throw new AppError(StatusCodes.NOT_FOUND, "Order not found");

  order.status = status;
  await order.save();
  return order;
};

const cancelOrder = async (id: string) => {
  const order = await Order.findById(id);
  if (!order) throw new AppError(StatusCodes.NOT_FOUND, "Order not found");
  if (order.status === OrderStatus.DELIVERED) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Cannot cancel a delivered order");
  }
  // restock
  for (const it of order.items) {
    await ProductModel.updateOne({ _id: it.product }, { $inc: { stock: it.quantity } });
  }
  order.status = OrderStatus.CANCELED;
  await order.save();
  return order;
};

const refundOrder = async (id: string) => {
  const order = await Order.findById(id);
  if (!order) throw new AppError(StatusCodes.NOT_FOUND, "Order not found");

  // restock back
  for (const it of order.items) {
    await ProductModel.updateOne({ _id: it.product }, { $inc: { stock: it.quantity } });
  }
  order.status = OrderStatus.REFUNDED;
  await order.save();
  return order;
};

export const OrderService = {
  checkout,
  myOrders,
  listOrders,
  updateOrderStatus,
  cancelOrder,
  refundOrder,
};