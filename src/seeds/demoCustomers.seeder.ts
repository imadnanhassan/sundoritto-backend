import "dotenv/config";
import connectDB from "../config/database";
import User from "../module/user/user.model";
import Customer from "../module/customer/customer.model";
import { UserRole } from "../enum/user.enum";

const customers = [
  {
    name: "Customer One",
    email: "customer.one@example.com",
    password: "password123",
    clientInfo: {
      device: "pc",
      browser: "seed",
      ipAddress: "127.0.0.1",
      userAgent: "seed-script",
    },
  },
  {
    name: "Customer Two",
    email: "customer.two@example.com",
    password: "password123",
    clientInfo: {
      device: "pc",
      browser: "seed",
      ipAddress: "127.0.0.1",
      userAgent: "seed-script",
    },
  },
];

export async function seedDemoCustomers() {
  await connectDB();

  for (const c of customers) {
    const exists = await User.findOne({ email: c.email });
    if (!exists) {
      const u = await User.create({
        name: c.name,
        email: c.email,
        password: c.password,
        role: UserRole.CUSTOMER,
        clientInfo: c.clientInfo,
        isActive: true,
      } as any);
      await Customer.create({ user: u._id } as any);
      console.log("Seeded customer:", c.email);
    } else {
      console.log("Customer exists:", c.email);
    }
  }
}