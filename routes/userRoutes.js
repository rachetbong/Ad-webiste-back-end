// routes/userRoutes.js
import express from "express";
import { getUser, updateUser, deleteUser } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getUser);
router.put("/", verifyToken, updateUser);
router.delete("/", verifyToken, deleteUser);

export default router;
