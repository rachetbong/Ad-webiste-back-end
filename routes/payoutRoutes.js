// routes/payoutRoutes.js
import express from "express";
import { submitPayout, getPayoutHistory } from "../controllers/payoutController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Submit payout request
router.post("/submit", verifyToken, submitPayout);

// Get payout history
router.get("/history", verifyToken, getPayoutHistory);

export default router;