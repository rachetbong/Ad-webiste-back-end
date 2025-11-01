// controllers/userController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Get logged-in user info
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user info
export const updateUser = async (req, res) => {
  const { fullName, email, password, status, role, phone, adsPerDay, luckydrawStatus } = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const prevStatus = user.status; // Save previous status

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (status) user.status = status;
    if (role) user.role = role;
    if (phone) user.phone = phone;
    if (adsPerDay) user.adsPerDay = adsPerDay;
    if (luckydrawStatus) user.luckydrawStatus = luckydrawStatus;


    await user.save();

    // ✅ If status changed from inactive → active, increment referral count
    if (prevStatus === "inactive" && status === "active" && user.referrelBy) {
      const referrer = await User.findOne({ email: user.referrelBy });
      if (referrer) {
        // If referrals is not set, start from 0
        const currentCount = Number(referrer.referrals) || 0;
        referrer.referrals = (currentCount + 1).toString();
        await referrer.save();
      }
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};



// Delete user
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude passwords
    // console.log(users)
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// PATCH /api/users/add-remaining/:id
export const addRemainingAds = async (req, res) => {
    // console.log("add remaining ads runned")
  try {
    const { extra } = req.body
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    user.remaining = (user.remaining || 0) + Number(extra)
    await user.save()

    res.json({ message: `Added ${extra} ads`, remaining: user.remaining })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/users/luckydraw
export const getluckydrawStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("luckydrawStatus");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      fullName: user.fullName,
      email: user.email,
      luckydrawStatus: user.luckydrawStatus || "not set",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

