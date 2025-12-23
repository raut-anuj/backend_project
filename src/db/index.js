<<<<<<< HEAD
import mongoose from "mongoose";
import { DB_NAME } from "../contants.js";

const connectDB = async () => {
  try {
    // 🧪 Debug line to verify the final connection string
    console.log("Final Mongo URI:", `${process.env.MONGODB_URI}/${DB_NAME}`);

    // Try connecting to MongoDB
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    console.log(`\n✅ MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("❌ MONGODB connection FAILED of database index ", error);
    process.exit(1);
  }
};

export default connectDB;
=======
import mongoose from "mongoose";
import { DB_NAME } from "../contants.js";

const connectDB = async () => {
  try {
    // 🧪 Debug line to verify the final connection string
    console.log("Final Mongo URI:", `${process.env.MONGODB_URI}/${DB_NAME}`);

    // Try connecting to MongoDB
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    console.log(`\n✅ MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("❌ MONGODB connection FAILED ", error);
    process.exit(1);
  }
};

export default connectDB;
>>>>>>> 5872634bf5660afc11efca61e743efb9246a67de
