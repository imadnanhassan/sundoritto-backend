import "dotenv/config";
import connectDB from "../config/database";
import User from "../module/user/user.model";
import { UserRole } from "../enum/user.enum";
import { seedCategories } from "./category.seeder";
import { seedBrands } from "./brand.seeder";
import { seedProducts } from "./product.seeder";
import { seedDemoCustomers } from "./demoCustomers.seeder";
import { OrderService } from "../module/order/order.service";
import Order from "../module/order/order.model";

/**
 * Creates backdated users and orders to populate weekly/monthly/yearly analytics ranges.
 * - Users: creates demo users and backdates their createdAt across past week/month/year
 * - Orders: creates demo orders and then backdates createdAt similarly
 */
export async function seedAnalyticsSpans() {
  await connectDB();

  // Seed base data
  await seedCategories();
  await seedBrands();
  await seedProducts();
  await seedDemoCustomers();

  // Helper for backdating
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  // Create additional users and backdate createdAt
  const userPayloads = [
    { name: "Weekly User", email: "weekly.user@example.com", createdDaysAgo: 3 },
    { name: "Monthly User", email: "monthly.user@example.com", createdDaysAgo: 20 },
    { name: "Yearly User", email: "yearly.user@example.com", createdDaysAgo: 200 },
  ];

  for (const u of userPayloads) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      const created = await User.create({
        name: u.name,
        email: u.email,
        password: "password123",
        role: UserRole.CUSTOMER,
        clientInfo: {
          device: "pc",
          browser: "seed",
          ipAddress: "127.0.0.1",
          userAgent: "seed-script",
        },
        isActive: true,
      } as any);
      await User.updateOne({ _id: created._id }, { $set: { createdAt: daysAgo(u.createdDaysAgo) } });
      console.log("Seeded and backdated user:", u.email);
    } else {
      console.log("User exists:", u.email);
    }
  }

  // Build orders via service, then backdate createdAt
  const products = await Order.db.collection("products").find({}).limit(2).toArray();
  if (products.length < 1) {
    console.log("No products found for analytics orders. Run product seeder first.");
    return;
  }
  const pIds = products.map((p) => String(p._id));

  const orderPayloads = [
    {
      label: "Weekly Order",
      daysAgo: 2,
      items: [{ productId: pIds[0], quantity: 1 }],
      customer: {
        name: "Weekly User",
        email: "weekly.user@example.com",
        phone: "01234567890",
        fullAddress: "Dhaka, Bangladesh",
      },
    },
    {
      label: "Monthly Order",
      daysAgo: 15,
      items: [{ productId: pIds[0], quantity: 2 }],
      customer: {
        name: "Monthly User",
        email: "monthly.user@example.com",
        phone: "01234567890",
        fullAddress: "Dhaka, Bangladesh",
      },
    },
    {
      label: "Yearly Order",
      daysAgo: 180,
      items: [{ productId: pIds[0], quantity: 1 }],
      customer: {
        name: "Yearly User",
        email: "yearly.user@example.com",
        phone: "01234567890",
        fullAddress: "Dhaka, Bangladesh",
      },
    },
  ];

  for (const op of orderPayloads) {
    const order = await OrderService.checkout({
      items: op.items,
      customer: op.customer,
      paymentMethod: "cod",
      shippingLocation: "Dhaka",
    } as any);
    await Order.updateOne({ _id: order._id }, { $set: { createdAt: daysAgo(op.daysAgo) } });
    console.log(`Seeded and backdated order (${op.label}):`, String(order._id));
  }

  console.log("Analytics spans seeded.");
}

if (require.main === module) {
  seedAnalyticsSpans()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}