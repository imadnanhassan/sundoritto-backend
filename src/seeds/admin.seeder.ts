import "dotenv/config";
import connectDB from "../config/database";
import User from "../module/user/user.model";
import { UserRole } from "../enum/user.enum";

async function run() {
  await connectDB();

  const email = "dev.adnanhassan@gmail.com";
  const password = "constPassword(38)";
  const name = "Adnan Hassan";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  await User.create({
    email,
    password,
    name,
    role: UserRole.ADMIN,
    clientInfo: {
      device: "pc",
      browser: "seed",
      ipAddress: "127.0.0.1",
      userAgent: "seed-script",
    },
    lastLogin: new Date(),
    isActive: true,
  } as any);

  console.log("Admin seeded:", email);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});