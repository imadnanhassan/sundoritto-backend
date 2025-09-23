import mongoose, { Schema } from "mongoose";
import { IOrder, OrderModel } from "./order.interface";
import { OrderStatus, PaymentMethod } from "../../enum/order.enum";

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    thumbnail: { type: String, default: null },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    voucherBalance: { type: Number, default: 0 },
  },
  { _id: false }
);

const customerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: null },
    phone: { type: String, required: true },
    fullAddress: { type: String, required: true },
    note: { type: String, default: null },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder, OrderModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    items: { type: [orderItemSchema], required: true },
    customer: { type: customerSchema, required: true },
    paymentMethod: { type: String, enum: [PaymentMethod.COD], default: PaymentMethod.COD },
    status: {
      type: String,
      enum: [
        OrderStatus.PROCESSING,
        OrderStatus.PLACED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELED,
        OrderStatus.REFUNDED,
      ],
      default: OrderStatus.PROCESSING,
    },
    shippingLocation: { type: String, default: null },
    shippingCost: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder, OrderModel>("Order", orderSchema);
export default Order;