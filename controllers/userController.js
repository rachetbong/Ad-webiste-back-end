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
  const { fullName, email, password, status, role, phone, adsPerDay, luckydrawStatus, luckydrawAttempt, plan } = req.body;
  const userId = req.params.id;
  console.log(fullName, email, password, status, role, phone, adsPerDay, luckydrawStatus, luckydrawAttempt, plan)

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
    if (luckydrawAttempt) user.luckydrawAttempt = luckydrawAttempt;
    if (plan) user.plan = plan;
 

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
          // console.log("user delete runned: ", req.params.id)
 
    await User.findByIdAndDelete(req.params.id);
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
  try {
    const { extra, luckydrawAttempt } = req.body // new field
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    user.remaining = (user.remaining || 0) + Number(extra)

    // Update luckydrawAttempt if admin sets it
    if (luckydrawAttempt) {
      user.luckydrawAttempt = Number(luckydrawAttempt)
    }

    // ✅ Activate lucky draw if remaining >= luckydrawAttempt
    if (user.luckydrawAttempt && user.remaining >= user.luckydrawAttempt) {
      user.luckydrawStatus = "active"
    }

    await user.save()

    res.json({ 
      message: `Added ${extra} ads`, 
      remaining: user.remaining,
      luckydrawStatus: user.luckydrawStatus,
      luckydrawAttempt: user.luckydrawAttempt
    })
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

// PATCH /api/users/update-balance/:id
export const updateUserBalance = async (req, res) => {
  try {
    const userId = req.params.id;
    const { amount, action } = req.body; // action = "add" or "deduct"

    if (!amount || !["add", "deduct"].includes(action)) {
      return res.status(400).json({ message: "Invalid request: provide amount and action (add/deduct)" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (action === "add") {
      user.balance = (user.balance || 0) + Number(amount);
    } else if (action === "deduct") {
      user.balance = (user.balance || 0) - Number(amount);
      if (user.balance < 0) user.balance = 0; // optional: prevent negative balance
    }

    await user.save();

    res.status(200).json({
      message: `Balance ${action === "add" ? "added" : "deducted"} successfully`,
      balance: user.balance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// Reusable function
export const changeUserBalance = async (userId, amount, action) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (action === "add") {
    user.balance = (user.balance || 0) + Number(amount);
  } else if (action === "deduct") {
    user.balance = (user.balance || 0) - Number(amount);
    if (user.balance < 0) user.balance = 0; // optional
  }

  await user.save();
  return user.balance;
};

// GET /api/users/get-current-balance/:id
export const getCurrentBalance = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("balance");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ balance: user.balance || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};




