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
// Update user info
export const updateUser = async (req, res) => {
  const { fullName, email, password, status, role, phone } = req.body;
  const userId = req.params.id; // <-- use ID from URL
  console.log(fullName, email, password, status, role, phone, req.params.id)
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (status) user.status = status;
    if (role) user.role = role;
    if (phone) user.phone = phone;

    await user.save();
    res.json(user); // return updated user
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
    console.log(users)
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

