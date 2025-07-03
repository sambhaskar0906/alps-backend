import mongoose from "mongoose";
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
});
const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);
const projectSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:['active','on-hold','completed']
    },
    startDate:{
        type:String,
        required:true
    },
    endDate:{
        type:String,
        required:true
    },
    project_id:{
        type:String,
        required:true,
        unique:true,
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
},{timestamps:true})
projectSchema.pre("validate",async function(next)
{
    if (this.isNew && !this.project_id) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: "project_id" },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      const formattedId = counter.value.toString().padStart(4, "0");
      this.project_id = `PROJECT_${formattedId}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
})
export const Project = mongoose.model("Project",projectSchema);