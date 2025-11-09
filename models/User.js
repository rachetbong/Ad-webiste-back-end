// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String},
  firstName: {type: String},
  lastName: {type: String},
  username: {type: String,unique: true,sparse: true},
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
  plan: {type: String},
  luckyOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },

});

export default mongoose.model("User", userSchema);
