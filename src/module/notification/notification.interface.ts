import { Document, Model, Types } from "mongoose";

export type NotificationType =
  | "new_order"
  | "new_customer"
  | "order_canceled"
  | "order_refunded";

export interface INotification extends Document {
  type: NotificationType;
  message: string;
  data?: Record<string, any> | null;
  isRead: boolean;
  user?: Types.ObjectId | null; // recipient (optional - admin/global)
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationModel extends Model<INotification> {}