import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import fundPaymentRoutes from "./routes/fundPaymentRoutes.js";



import cron from "node-cron";
import User from "./models/User.js";

dotenv.config();
const app = express();

// 👇 Configure CORS for your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL, // your frontend URL
  methods: ["GET", "POST", "PATCH","PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"], // ✅ Added Authorization
  credentials: true // allow cookies/auth headers
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use('/api/support', supportRoutes);
app.use("/api/products", productRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/fund-payments", fundPaymentRoutes);




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Reset ads every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("🕛 Running daily reset for ad counts...");
  try {
    const users = await User.find();
    for (const user of users) {
      if (user.adsPerDay) {
        user.remaining = user.adsPerDay;
        await user.save();
      }
    }
    console.log("✅ All users' remaining ads reset successfully!");
  } catch (err) {
    console.error("❌ Error resetting ad counts:", err.message);
  }
});
