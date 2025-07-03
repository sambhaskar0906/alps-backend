import mongoose from "mongoose";
import { Project } from "../models/project.model.js";
import {User} from "../models/user.model.js";
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
});
const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);
const ticketSchema = new mongoose.Schema({
subject:{
    type:String,
    required:true
}, 
details:{
    type:String,
    required:true
}, 
priority:{
    type:String,
    required:true,
}, 
status:
{
    type:String,
    enum:['open','pending','resolved'],
    required:true,
},
 assignedTo:{
    type:String,
    required:true,
 },
 projectId:{
    type:String,
    ref:Project,
    required:true
 },
 comments: [
  {
    comment: { 
        type: String, 
        required: true
     },
    commentedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
   
  }
],

 ticket_id:{
    type:String,
    required:true,
    unique:true
 },
 UserId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:User,
    required:true
 }
},{timestamps:true})
ticketSchema.pre("validate",async function(next)
{
   if (this.isNew && !this.ticket_id) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: "ticket_id" },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      const formattedId = counter.value.toString().padStart(4, "0");
      this.ticket_id = `Ticket_${formattedId}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
})
export const Tickets = mongoose.model("Tickets",ticketSchema)