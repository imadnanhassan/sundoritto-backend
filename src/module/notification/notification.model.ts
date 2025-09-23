import mongoose, { Schema } from "mongoose";
import { INotification, NotificationModel } from "./notification.interface";

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    type: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: null },
    isRead: { type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotification, NotificationModel>(
  "Notification",
  notificationSchema
);

export default Notification;