// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";

import cron from "node-cron";
import User from "./models/User.js";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use('/api/support', supportRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// Run every day at midnight (server time)
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
