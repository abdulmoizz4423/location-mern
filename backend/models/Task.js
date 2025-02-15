const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  type: { type: String, enum: ["offer", "request"], required: true },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  goodsCategory: { type: String, required: true },
  goods: { type: String, required: true },
  volume: { type: Number, default: 0 },
  dateTimeIssued: { type: Date, default: Date.now },
  dateTimeAccepted: { type: Date },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dateTimeCompleted: { type: Date },
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
