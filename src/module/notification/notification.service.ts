import Notification from "./notification.model";

export const NotificationService = {
  create: async (type: string, message: string, data?: Record<string, any>) => {
    return await Notification.create({ type, message, data: data ?? null });
  },
  list: async () => {
    return await Notification.find().sort({ createdAt: -1 });
  },
  markRead: async (id: string) => {
    return await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
  },
};