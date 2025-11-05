// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  role: {type: String},
  status: {type: String},
  phone: {type: String},
  referrals: {type: String},
  adsPerDay: {type: Number},
  remaining: {type: Number},
  referrelBy: {type: String},
  luckydrawStatus: {type: String},
  luckydrawAttempt: {type: Number},
  balance: {type: Number},
  earning: {type: Number},
  plan: {type: String}
});

export default mongoose.model("User", userSchema);
