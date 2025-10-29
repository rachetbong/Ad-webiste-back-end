import express from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
  addReply,
  updateStatus,
  deleteTicket
} from "../controllers/supportController.js";

const router = express.Router();

router.post("/", createTicket);
router.get("/", getTickets);
router.get("/:id", getTicketById);
router.post("/:id/reply", addReply);
router.patch("/:id/status", updateStatus);
router.delete("/:id", deleteTicket);

export default router;
