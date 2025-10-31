import express from "express";
import { getAllUsers, getUser, updateUser, deleteUser, addRemainingAds } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only: get all users
router.get("/all", verifyToken, getAllUsers);

router.get("/", verifyToken, getUser);
router.patch("/:id", verifyToken, updateUser);
router.delete("/", verifyToken, deleteUser);
router.patch("/add-remaining/:id", addRemainingAds)



export default router;
