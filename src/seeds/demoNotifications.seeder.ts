import "dotenv/config";
import connectDB from "../config/database";
import Notification from "../module/notification/notification.model";

export async function seedDemoNotifications() {
  await connectDB();

  const samples = [
    {
      type: "new_order",
      message: "A new order was placed (demo)",
      data: { orderId: "demo-order-1" },
    },
    {
      type: "new_customer",
      message: "A new customer registered (demo)",
      data: { email: "demo@example.com" },
    },
    {
      type: "order_canceled",
      message: "An order was canceled (demo)",
      data: { orderId: "demo-order-2" },
    },
    {
      type: "order_refunded",
      message: "An order was refunded (demo)",
      data: { orderId: "demo-order-3" },
    },
  ];

  for (const n of samples) {
    await Notification.create(n as any);
    console.log("Inserted notification:", n.type);
  }

  console.log("Demo notifications seeded.");
}

if (require.main === module) {
  seedDemoNotifications()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}