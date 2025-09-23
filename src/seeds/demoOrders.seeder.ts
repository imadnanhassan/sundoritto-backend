import "dotenv/config";
import connectDB from "../config/database";
import { seedProducts } from "./product.seeder";
import { seedCategories } from "./category.seeder";
import { seedBrands } from "./brand.seeder";
import Product from "../module/product/product.model";
import { seedDemoCustomers } from "./demoCustomers.seeder";
import Order from "../module/order/order.model";
import { OrderService } from "../module/order/order.service";

export async function seedDemoOrders() {
  await connectDB();
  await seedCategories();
  await seedBrands();
  await seedProducts();
  await seedDemoCustomers();

  const p1 = await Product.findOne({ slug: "hydrating-face-cream" });
  const p2 = await Product.findOne({ slug: "nourishing-hair-oil" });

  if (!p1 || !p2) {
    console.log("Products not found for demo orders");
    return;
  }

  // Create a couple of orders via the service to trigger inventory + notifications
  const payload1 = {
    items: [
      { productId: String(p1._id), quantity: 1 },
      { productId: String(p2._id), quantity: 2 }
    ],
    customer: {
      name: "Customer One",
      email: "customer.one@example.com",
      phone: "01234567890",
      fullAddress: "Dhaka, Bangladesh"
    },
    paymentMethod: "cod" as const,
    shippingLocation: "Dhaka",
  };

  const payload2 = {
    items: [{ productId: String(p2._id), quantity: 1 }],
    customer: {
      name: "Customer Two",
      email: "customer.two@example.com",
      phone: "01234567890",
      fullAddress: "Dhaka, Bangladesh"
    },
    paymentMethod: "cod" as const,
    shippingLocation: "Dhaka",
  };

  const o1 = await OrderService.checkout(payload1);
  const o2 = await OrderService.checkout(payload2);
  console.log("Created orders:", o1._id, o2._id);
}

if (require.main === module) {
  seedDemoOrders()
    .then(() => {
      console.log("Demo orders seeded.");
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}