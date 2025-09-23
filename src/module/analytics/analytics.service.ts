import { startOfWeek, startOfMonth, startOfYear } from "date-fns";
import User from "../user/user.model";
import Order from "../order/order.model";

type Range = "weekly" | "monthly" | "yearly";

const getStartDate = (range: Range) => {
  const now = new Date();
  if (range === "weekly") return startOfWeek(now, { weekStartsOn: 1 });
  if (range === "monthly") return startOfMonth(now);
  return startOfYear(now);
};

export const AnalyticsService = {
  summary: async (range: Range) => {
    const from = getStartDate(range);

    const [users, orders, sales] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: from } }),
      Order.countDocuments({ createdAt: { $gte: from } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: from } } },
        { $group: { _id: null, totalSales: { $sum: "$total" } } },
      ]),
    ]);

    return {
      range,
      from,
      stats: {
        users,
        orders,
        sales: sales[0]?.totalSales || 0,
      },
    };
  },
};