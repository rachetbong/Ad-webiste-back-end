import Support from "../models/Support.js";

// helper to map _id -> id
const toDTO = (doc) => ({
  id: doc._id.toString(),
  userId: doc.userId,
  username: doc.username,
  useremail: doc.useremail,
  subject: doc.subject,
  message: doc.message,
  status: doc.status,
  createdAt: doc.createdAt,
  replies: doc.replies?.map((r) => ({
    id: r._id.toString(),
    message: r.message,
    isAdmin: r.isAdmin,
    createdAt: r.createdAt,
  })) || [],
});

export const createTicket = async (req, res) => {
  try {
    const { userId, username, useremail, subject, message } = req.body;
    const ticket = await Support.create({ userId, username, useremail, subject, message });
    res.status(201).json(toDTO(ticket));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId } : {};
    const tickets = await Support.find(query).sort({ createdAt: -1 });
    res.json(tickets.map(toDTO));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const t = await Support.findById(req.params.id);
    if (!t) return res.status(404).json({ message: "Not found" });
    res.json(toDTO(t));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const addReply = async (req, res) => {
  try {
    const { message, isAdmin } = req.body;
    const t = await Support.findById(req.params.id);
    if (!t) return res.status(404).json({ message: "Not found" });
    t.replies.push({ message, isAdmin: !!isAdmin });
    await t.save();
    res.status(201).json(toDTO(t));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const t = await Support.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!t) return res.status(404).json({ message: "Not found" });
    res.json(toDTO(t));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const t = await Support.findByIdAndDelete(req.params.id);
    if (!t) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
