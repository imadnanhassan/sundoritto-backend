import mongoose from "mongoose";

interface ConnectionOptions {
  useNewUrlParser?: boolean;
  useUnifiedTopology?: boolean;
}

const connectDB = async (): Promise<void> => {
  try {
    // MongoDB connection string
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/sundoritto";

    

    console.log("📦 Connecting to MongoDB...");
    const conn = await mongoose.connect(mongoUri );

    console.log(`📦 MongoDB Connected Successfully!`);
    console.log(`🔗 Host: ${conn.connection.host}`);
    console.log(`🗃️  Database: ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on("error", (err: Error) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("📦 MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("📦 MongoDB reconnected");
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`📦 ${signal} received. Closing MongoDB connection...`);
      await mongoose.connection.close();
      console.log("📦 MongoDB connection closed.");
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
