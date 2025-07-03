import { Tickets } from "../models/ticket.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

export const createTicket = asyncHandler(async (req, res) => {
  const { subject, details, priority, status, assignedTo, projectId, comments = [] } = req.body;

  // Validate required fields
  if (!subject || !details || !priority || !status || !assignedTo || !projectId) {
    throw new ApiError(400, "All required fields must be filled");
  }

  // Get logged-in user's ID
  const userIdFromSession = req.user?._id;

  if (!userIdFromSession) {
    throw new ApiError(401, "Unauthorized user");
  }

  // Attach user ID to each comment
  const processedComments = comments.map((c) => {
    if (!c.comment) {
      throw new ApiError(400, "Each comment must include a 'comment' field");
    }

    return {
      comment: c.comment,
      commentedBy: userIdFromSession,
    };
  });

  // Create ticket
  const ticket = await Tickets.create({
    subject,
    details,
    priority,
    status,
    assignedTo,
    projectId,
    UserId: userIdFromSession,
    comments: processedComments,
  });

  res
    .status(201)
    .json(new ApiResponse(201, ticket, "Ticket created successfully"));
});


export const getAllTickets = asyncHandler(async (req, res) => {
  const filter = {};
  console.log("Logged-in user:", req.user);

  if (req.user.role === "Client") {
    filter.UserId = new mongoose.Types.ObjectId(req.user._id);
    console.log("Filter for Client:", filter);
  }

  const tickets = await Tickets.find(filter).populate("UserId comments.commentedBy");

  if (!tickets || tickets.length === 0) {
    throw new ApiError(404, "No tickets found");
  }

  res.status(200).json(new ApiResponse(200, tickets, "Tickets fetched successfully"));
});


export const getTicketById = asyncHandler(async (req, res) => {
  const { ticket_id } = req.params;

  const ticket = await Tickets.findOne({ ticket_id }).populate("UserId comments.commentedBy");

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket fetched successfully"));
});


export const updateTicket = asyncHandler(async (req, res) => {
  const { ticket_id } = req.params;
  const updateData = req.body;

  const ticket = await Tickets.findOneAndUpdate({ ticket_id }, updateData, {
    new: true,
    runValidators: true,
  });

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket updated successfully"));
});


export const deleteTicket = asyncHandler(async (req, res) => {
  const { ticket_id } = req.params;

  const deleted = await Tickets.findOneAndDelete({ ticket_id });

  if (!deleted) {
    throw new ApiError(404, "Ticket not found to delete");
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Ticket deleted successfully"));
});


export const changeTicketStatus = asyncHandler(async (req, res) => {
  const { ticket_id } = req.params;
  const { newStatus } = req.query;

  const allowedStatus = ["open", "pending", "resolved"];
  if (!allowedStatus.includes(newStatus)) {
    throw new ApiError(400, "Invalid status value");
  }

  const ticket = await Tickets.findOne({ ticket_id });

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  if (ticket.status === "resolved") {
    throw new ApiError(400, "Cannot change status of a resolved ticket");
  }

  ticket.status = newStatus;
  await ticket.save();

  res
    .status(200)
    .json(new ApiResponse(200, ticket, `Status changed to ${newStatus}`));
});
