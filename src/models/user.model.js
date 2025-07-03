import mongoose from "mongoose"
import bcrypt from "bcryptjs";
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
});
const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  contact: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePhoto: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["Admin", "Client"],
    default: "Client"
  },
  user_id: {
    type: String,

    unique: true
  }

}, { timestamps: true })
userSchema.pre("validate", async function (next) {
  if (this.isNew && !this.user_id) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: "user_id" },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      const formattedId = counter.value.toString().padStart(4, "0");
      this.user_id = `User_${formattedId}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
})
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});


userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);