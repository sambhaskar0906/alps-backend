import express from "express";
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  changeTicketStatus,
} from "../controllers/ticket.controller.js";
import {isAuthenticated, authorizeRoles } from "../middleware/auth.middleware.js"
const router = express.Router();


router.post("/", isAuthenticated,createTicket);


router.get(
  "/all-tickets",
  isAuthenticated,         // ✅ this populates req.user
  authorizeRoles("Admin", "Client"), // optional: restrict to roles
  getAllTickets
);


router.get("/:ticket_id", getTicketById);


router.put("/:ticket_id", updateTicket);


router.delete("/:ticket_id", deleteTicket);


router.patch("/status/:ticket_id", changeTicketStatus);

export default router;
