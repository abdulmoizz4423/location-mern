const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  surname: String,
  mobile: { type: String, default: "0" },
  inventory: { type: Array, default: [] },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  role: { type: String, required: true },
  activeTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }], // Add active tasks for rescuers
});

// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Middleware to check mobile number requirement for Citizens
userSchema.pre("save", function (next) {
  if (this.role === "Citizen" && !this.mobile) {
    const err = new Error("Mobile number is required for Citizen role");
    next(err);
  } else {
    next();
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
