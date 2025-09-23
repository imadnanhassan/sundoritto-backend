import { Document, Model, Types } from "mongoose";
import { PaymentMethod, OrderStatus } from "../../enum/order.enum";

export interface IOrderItem {
  product: Types.ObjectId;
  sku: string;
  name: string;
  slug: string;
  thumbnail?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  voucherBalance?: number; // snapshot
}

export interface ICheckoutCustomer {
  name: string;
  email?: string | null;
  phone: string;
  fullAddress: string;
  note?: string | null;
}

export interface IOrder extends Document {
  user?: Types.ObjectId | null; // optional if guest checkout ever exists
  items: IOrderItem[];
  customer: ICheckoutCustomer;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  shippingLocation?: string | null;
  shippingCost: number;
  subtotal: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderModel extends Model<IOrder> {}