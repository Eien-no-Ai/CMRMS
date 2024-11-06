const mongoose = require("mongoose");

const VaccineListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: { type: Date, default: Date.now }, // Add timestamp if not already present
});

module.exports = mongoose.model("VaccineList", VaccineListSchema);
