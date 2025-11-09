import mongoose from "mongoose";

export async function connectToDB() {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB");
    });
    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
      process.exit();
    });
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    console.log("failed to connect to mongodb");
    process.exit(1);
  }
}
