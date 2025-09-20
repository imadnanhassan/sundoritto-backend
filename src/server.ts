import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/database";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("❌ UNCAUGHT EXCEPTION! Shutting down...");
  console.error("Error:", err.name, err.message);
  console.error("Stack:", err.stack);
  process.exit(1);
});

const PORT: number = parseInt(process.env.PORT || "4000", 10);

const server = app.listen(PORT, () => {
  console.log(`🚀 Sundoritto Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error, promise: Promise<any>) => {
  console.error("❌ UNHANDLED REJECTION! Shutting down...");
  console.error("Error:", err.name, err.message);

  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully");

  server.close(() => {
    console.log("💀 Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("\n👋 SIGINT received. Shutting down gracefully");

  server.close(() => {
    console.log("💀 Process terminated");
    process.exit(0);
  });
});

export default server;
