import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    // MongoDB connection string
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/sundoritto";

    const conn = await mongoose.connect(mongoUri);

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`📦 ${signal} received. Closing MongoDB connection...`);
      await mongoose.connection.close();
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("Stack:", error.stack);

    // Exit process with failure
    process.exit(1);
  }
};

// Export database connection status checker
export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

// Export database connection info
export const getConnectionInfo = () => {
  const { readyState, host, name, port } = mongoose.connection;

  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    status: states[readyState as keyof typeof states] || "unknown",
    host,
    database: name,
    port,
  };
};

export default connectDB;
