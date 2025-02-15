const mongoose = require("mongoose");

const EmergencyGoodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  volume: { type: Number, required: true, default: 0 },
});

const EmergencyGood = mongoose.model("EmergencyGood", EmergencyGoodSchema);

module.exports = EmergencyGood;
